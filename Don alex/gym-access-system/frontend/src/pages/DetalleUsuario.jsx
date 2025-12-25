import "../styles/global-dark.css";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { usuariosAPI } from '../services/api';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  IdCard, 
  Calendar,
  Edit,
  RefreshCw,
  CreditCard,
  UserCheck,
  UserX
} from 'lucide-react';
import './Usuarios.css';

function DetallesUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    try {
      setLoading(true);
      const response = await usuariosAPI.obtener(id);
      setUsuario(response.data);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar usuario');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoMembresia = (membresia) => {
    if (!membresia) return { texto: 'Sin plan', clase: 'sin-plan', icono: UserX };
    
    const ahora = new Date();
    const fin = new Date(membresia.fechaFin);
    
    if (membresia.estado !== 'activa') {
      return { texto: 'Inactiva', clase: 'inactiva', icono: UserX };
    }
    
    if (fin < ahora) {
      return { texto: 'Vencida', clase: 'vencida', icono: Calendar };
    }
    
    return { texto: 'Activa', clase: 'activa', icono: UserCheck };
  };

  if (loading) {
    return (
      <Layout title="Cargando...">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando información del usuario...</p>
        </div>
      </Layout>
    );
  }

  if (error || !usuario) {
    return (
      <Layout title="Error">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Error al cargar usuario</h3>
          <p>{error || 'El usuario no existe'}</p>
          <button 
            onClick={() => navigate('/usuarios')}
            className="btn-primary"
          >
            <ArrowLeft size={20} />
            Volver a Usuarios
          </button>
        </div>
      </Layout>
    );
  }

  const estado = getEstadoMembresia(usuario.membresia);
  const EstadoIcono = estado.icono;

  const renovarMembresia = async () => {
    if (!usuario.membresia) {
      alert('❌ Este usuario no tiene membresía activa');
      return;
    }

    if (!window.confirm(`¿Renovar la membresía de ${usuario.nombre} ${usuario.apellido}?`)) {
      return;
    }

    try {
      await fetch(`http://localhost:3000/api/membresias/${usuario.membresia.id}/renovar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      alert('✅ Membresía renovada exitosamente');
      cargarUsuario();
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al renovar membresía');
    }
  };

  return (
    <Layout title={`${usuario.nombre} ${usuario.apellido}`}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button 
            onClick={() => navigate('/usuarios')} 
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={20} />
            Volver
          </button>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          {/* Card Información General */}
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <div 
              className="user-avatar" 
              style={{ 
                width: '140px', 
                height: '140px', 
                margin: '0 auto', 
                fontSize: '56px',
                border: '4px solid #333333',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
            >
              {usuario.foto ? (
                <img 
                  src={`http://localhost:3000${usuario.foto}`} 
                  alt={`${usuario.nombre} ${usuario.apellido}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                <span>{usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}</span>
              )}
            </div>
            
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#ffffff',
              margin: '24px 0 8px 0'
            }}>
              {usuario.nombre} {usuario.apellido}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              <EstadoIcono size={18} color={estado.clase === 'activa' ? '#10b981' : '#ef4444'} />
              <span style={{ 
                color: estado.clase === 'activa' ? '#10b981' : '#ef4444',
                fontSize: '16px',
                fontWeight: 600
              }}>
                {estado.texto}
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center',
              marginTop: '24px'
            }}>
              <button
                onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Edit size={18} />
                Editar
              </button>
              {usuario.membresia && (
                <button
                  onClick={renovarMembresia}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <RefreshCw size={18} />
                  Renovar
                </button>
              )}
            </div>
          </div>

          {/* Card Información Personal */}
          <div className="card">
            <h3 style={{ 
              margin: '0 0 24px 0', 
              fontSize: '18px', 
              fontWeight: '600',
              color: '#ffffff',
              paddingBottom: '16px',
              borderBottom: '1px solid #333333'
            }}>
              Información Personal
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              <div>
                <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Cédula
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '16px' }}>
                  <IdCard size={20} color="#6366f1" />
                  {usuario.cedula}
                </div>
              </div>

              <div>
                <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Email
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '16px' }}>
                  <Mail size={20} color="#6366f1" />
                  {usuario.email || 'Sin email'}
                </div>
              </div>

              <div>
                <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                  Teléfono
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '16px' }}>
                  <Phone size={20} color="#6366f1" />
                  {usuario.telefono || 'Sin teléfono'}
                </div>
              </div>
            </div>
          </div>

          {/* Card Membresía */}
          {usuario.membresia ? (
            <div className="card">
              <h3 style={{ 
                margin: '0 0 24px 0', 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#ffffff',
                paddingBottom: '16px',
                borderBottom: '1px solid #333333'
              }}>
                Información de Membresía
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Plan Actual
                  </label>
                  <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
                    {usuario.membresia.plan?.nombre || 'Sin plan'}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Precio del Plan
                  </label>
                  <div style={{ color: '#10b981', fontSize: '16px', fontWeight: 600 }}>
                    ${usuario.membresia.plan?.precio.toLocaleString() || '0'}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Duración
                  </label>
                  <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
                    {usuario.membresia.plan?.duracion} días
                  </div>
                </div>

                <div>
                  <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Fecha de Inicio
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff', fontSize: '16px' }}>
                    <Calendar size={20} color="#6366f1" />
                    {new Date(usuario.membresia.fechaInicio).toLocaleDateString('es-CO')}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Fecha de Vencimiento
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '16px' }}>
                    <Calendar size={20} color="#fbbf24" />
                    {new Date(usuario.membresia.fechaFin).toLocaleDateString('es-CO')}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#a1a1a1', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Estado
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: estado.clase === 'activa' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: estado.clase === 'activa' ? '#10b981' : '#ef4444'
                    }}>
                      {estado.texto}
                    </div>
                  </div>
                </div>
              </div>

              {usuario.membresia.plan?.features && usuario.membresia.plan.features.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #333333' }}>
                  <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
                    Características del Plan
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {usuario.membresia.plan.features.map((feature, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#e5e5e5' }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '2px solid #10b981',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#10b981',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px', background: 'rgba(107, 114, 128, 0.1)', border: '2px dashed #333333' }}>
              <UserX size={40} style={{ color: '#9ca3af', marginBottom: '16px', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#e5e5e5', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                Sin Membresía Activa
              </h3>
              <p style={{ color: '#a1a1a1', marginBottom: '24px' }}>
                Este usuario no tiene un plan de membresía asignado
              </p>
              <button
                onClick={() => navigate(`/usuarios/editar/${usuario.id}`)}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
              >
                <CreditCard size={18} />
                Asignar Plan
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .card {
          background: #1a1a1a;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #333333;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </Layout>
  );
}

export default DetallesUsuario;