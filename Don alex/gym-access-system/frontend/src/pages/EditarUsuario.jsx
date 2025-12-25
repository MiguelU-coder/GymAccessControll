import "../styles/global-dark.css";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { usuariosAPI } from '../services/api';
import { ArrowLeft, Save, User, Mail, Phone, IdCard, Camera } from 'lucide-react';
import './Usuarios.css';
import '../styles/Forms.css';

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: ''
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    try {
      const response = await usuariosAPI.obtener(id);
      const usuario = response.data;
      
      setFormData({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email || '',
        telefono: usuario.telefono,
        cedula: usuario.cedula
      });

      if (usuario.foto) {
        setFotoPreview(`http://localhost:3000${usuario.foto}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar usuario');
      navigate('/usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('apellido', formData.apellido);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('telefono', formData.telefono);
      formDataToSend.append('cedula', formData.cedula);
      
      if (foto) {
        formDataToSend.append('foto', foto);
      }

      await usuariosAPI.actualizar(id, formDataToSend);
      
      alert('✅ Usuario actualizado exitosamente');
      navigate(`/usuarios/${id}`);
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Error al actualizar usuario');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando información...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header con botón de cancelar */}
        <div style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => navigate(`/usuarios/${id}`)} 
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Card con foto de perfil */}
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div 
                  className="user-avatar" 
                  style={{ 
                    width: '140px', 
                    height: '140px', 
                    margin: '0 auto', 
                    fontSize: '56px',
                    border: '4px solid #333333',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)'
                  }}
                >
                  {fotoPreview ? (
                    <img 
                      src={fotoPreview} 
                      alt="Preview" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '50%' 
                      }} 
                    />
                  ) : (
                    <span style={{ color: 'white' }}>
                      {formData.nombre.charAt(0)}{formData.apellido.charAt(0)}
                    </span>
                  )}
                </div>
                
                <label 
                  style={{ 
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    backgroundColor: '#4F46E5',
                    color: 'white',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '3px solid #1a1a1a',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Camera size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              
              <p style={{ marginTop: '24px', color: '#a1a1a1', fontSize: '14px' }}>
                Haz clic en el icono de la cámara para cambiar la foto
              </p>
            </div>

            {/* Card con información personal */}
            <div className="card">
              <h3 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                paddingBottom: '16px',
                borderBottom: '1px solid #333333'
              }}>
                <User size={22} />
                Información Personal
              </h3>

              <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                {/* Nombre */}
                <div className="form-field">
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontWeight: '500',
                    color: '#e5e5e5',
                    marginBottom: '8px'
                  }}>
                    <User size={18} color="#6366f1" />
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ingresa el nombre"
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '15px',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      background: '#252525',
                      color: '#ffffff'
                    }}
                  />
                </div>

                {/* Apellido */}
                <div className="form-field">
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontWeight: '500',
                    color: '#e5e5e5',
                    marginBottom: '8px'
                  }}>
                    <User size={18} color="#6366f1" />
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="input"
                    placeholder="Ingresa el apellido"
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '15px',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      background: '#252525',
                      color: '#ffffff'
                    }}
                  />
                </div>

                {/* Cédula */}
                <div className="form-field">
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontWeight: '500',
                    color: '#e5e5e5',
                    marginBottom: '8px'
                  }}>
                    <IdCard size={18} color="#6366f1" />
                    Cédula *
                  </label>
                  <input
                    type="text"
                    name="cedula"
                    value={formData.cedula}
                    onChange={handleChange}
                    className="input"
                    required
                    disabled
                    style={{
                      padding: '12px 16px',
                      fontSize: '15px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      cursor: 'not-allowed',
                      color: '#6b6b6b'
                    }}
                  />
                  <small style={{ 
                    display: 'block',
                    marginTop: '8px',
                    color: '#a1a1a1', 
                    fontSize: '13px',
                    fontStyle: 'italic'
                  }}>
                    La cédula no se puede modificar
                  </small>
                </div>

                {/* Email */}
                <div className="form-field">
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontWeight: '500',
                    color: '#e5e5e5',
                    marginBottom: '8px'
                  }}>
                    <Mail size={18} color="#6366f1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input"
                    placeholder="ejemplo@correo.com"
                    style={{
                      padding: '12px 16px',
                      fontSize: '15px',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      background: '#252525',
                      color: '#ffffff'
                    }}
                  />
                </div>

                {/* Teléfono */}
                <div className="form-field">
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontWeight: '500',
                    color: '#e5e5e5',
                    marginBottom: '8px'
                  }}>
                    <Phone size={18} color="#6366f1" />
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="input"
                    placeholder="3001234567"
                    required
                    style={{
                      padding: '12px 16px',
                      fontSize: '15px',
                      border: '1px solid #333333',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      background: '#252525',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              padding: '24px 0'
            }}>
              <button
                type="button"
                onClick={() => navigate(`/usuarios/${id}`)}
                className="btn-secondary"
                disabled={guardando}
                style={{
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={guardando}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 32px',
                  fontSize: '15px',
                  fontWeight: '500',
                  background: guardando ? '#6b6b6b' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: guardando ? 'not-allowed' : 'pointer',
                  boxShadow: guardando ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Save size={18} />
                {guardando ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .card {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #333333;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .input:focus {
          outline: none;
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          background: #2a2a2a !important;
        }
      `}</style>
    </Layout>
  );
}

export default EditarUsuario;