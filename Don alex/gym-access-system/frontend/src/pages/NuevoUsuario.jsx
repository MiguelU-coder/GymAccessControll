import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosAPI, planesAPI } from '../services/api';
import { Camera, Fingerprint, Save, X, AlertCircle, CheckCircle, Loader2, User } from 'lucide-react';
import './Usuarios.css';
import '../styles/Forms.css';
import './NuevoUsuario.css';

function NuevoUsuario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [planes, setPlanes] = useState([]);
  const [capturandoHuella, setCapturandoHuella] = useState(false);
  const [validacionCedula, setValidacionCedula] = useState({ validando: false, existe: false });
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    cedula: '',
    foto: null,
    huellaTemplate: '',
    planId: '',
    fechaInicio: new Date().toISOString().split('T')[0]
  });

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    cargarPlanes();
  }, []);

  // Validar cédula en tiempo real - CORREGIDO
  useEffect(() => {
    const validarCedulaExistente = async () => {
      if (formData.cedula.length >= 6) {
        setValidacionCedula({ validando: true, existe: false });
        
        try {
          // Usar listar y filtrar localmente ya que no hay endpoint de buscar
          const response = await usuariosAPI.listar();
          const usuarios = response.data.data || response.data;
          const existe = usuarios.some(usuario => 
            usuario.cedula && usuario.cedula.toString() === formData.cedula
          );
          setValidacionCedula({ validando: false, existe });
          
          if (existe) {
            setError('Ya existe un usuario con esta cédula');
          }
        } catch (error) {
          console.error('Error al validar cédula:', error);
          setValidacionCedula({ validando: false, existe: false });
        }
      } else {
        setValidacionCedula({ validando: false, existe: false });
      }
    };

    const timeoutId = setTimeout(validarCedulaExistente, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.cedula]);

  const cargarPlanes = async () => {
    try {
      const response = await planesAPI.listar();
      // Manejar diferentes formatos de respuesta
      setPlanes(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error al cargar planes:', error);
      setError('Error al cargar los planes disponibles');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones específicas por campo
    if (name === 'cedula') {
      const soloNumeros = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: soloNumeros }));
    } else if (name === 'telefono') {
      const soloNumeros = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: soloNumeros }));
    } else if (name === 'nombre' || name === 'apellido') {
      const soloLetras = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '');
      setFormData(prev => ({ ...prev, [name]: soloLetras }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La foto no debe superar los 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      setFormData(prev => ({ ...prev, foto: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const capturarHuella = async () => {
    setCapturandoHuella(true);
    setError('');
    
    // Simulación de captura de huella
    setTimeout(() => {
      const templateSimulado = `HUELLA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setFormData(prev => ({ ...prev, huellaTemplate: templateSimulado }));
      setCapturandoHuella(false);
      setSuccess('Huella capturada exitosamente');
      
      setTimeout(() => setSuccess(''), 3000);
    }, 2000);
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    
    if (!formData.apellido.trim()) {
      setError('El apellido es obligatorio');
      return false;
    }
    
    if (!formData.cedula.trim() || formData.cedula.length < 6) {
      setError('La cédula debe tener al menos 6 dígitos');
      return false;
    }
    
    if (validacionCedula.existe) {
      setError('Ya existe un usuario con esta cédula');
      return false;
    }
    
    if (!formData.telefono.trim() || formData.telefono.length < 7) {
      setError('El teléfono debe tener al menos 7 dígitos');
      return false;
    }
    
    if (formData.email && !validarEmail(formData.email)) {
      setError('El formato del email no es válido');
      return false;
    }
    
    if (!formData.huellaTemplate) {
      setError('Debes capturar la huella digital del usuario');
      return false;
    }
    
    return true;
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Crear FormData para enviar archivo
      const data = new FormData();
      data.append('nombre', formData.nombre.trim());
      data.append('apellido', formData.apellido.trim());
      data.append('email', formData.email.trim());
      data.append('telefono', formData.telefono.trim());
      data.append('cedula', formData.cedula.trim());
      data.append('huellaTemplate', formData.huellaTemplate);
      
      if (formData.foto) {
        data.append('foto', formData.foto);
      }

      console.log('📤 Creando usuario...');
      
      // Crear usuario
      const responseUsuario = await usuariosAPI.crear(data);
      const usuarioCreado = responseUsuario.data.data || responseUsuario.data;

      console.log('✅ Usuario creado:', usuarioCreado);

      // Si seleccionó un plan, crear membresía - CORREGIDO
      if (formData.planId) {
        try {
          console.log('📋 Asignando plan:', formData.planId);

          const responseMembresia = await fetch('http://localhost:3000/api/membresias', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              usuarioId: usuarioCreado.id,
              planId: formData.planId,
              fechaInicio: formData.fechaInicio
            })
          });

          if (!responseMembresia.ok) {
            const errorData = await responseMembresia.json();
            console.warn('⚠️ Error al asignar membresía:', errorData);
            // No lanzar error, solo log
          } else {
            console.log('✅ Membresía asignada exitosamente');
          }
        } catch (membresiaError) {
          console.warn('⚠️ Error al asignar membresía:', membresiaError);
          // Continuar aunque falle la membresía
        }
      }

      setSuccess('✅ Usuario creado exitosamente');
      
      setTimeout(() => {
        navigate('/usuarios');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      setError(error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const planSeleccionado = planes.find(p => p.id === formData.planId);
  
  const calcularFechaVencimiento = () => {
    if (!planSeleccionado || !formData.fechaInicio) return null;
    
    const fechaInicio = new Date(formData.fechaInicio);
    const fechaVencimiento = new Date(fechaInicio.getTime() + (planSeleccionado.duracion || 30) * 24 * 60 * 60 * 1000);
    return fechaVencimiento.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Obtener características del plan - CORREGIDO
  const obtenerCaracteristicas = (plan) => {
    return plan.features || plan.caracteristicas || ['Acceso al gimnasio', 'Área de pesas', 'Área de cardio'];
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Sección de Foto */}
        <div className="form-section">
          <h3 className="form-section-title">
            <Camera size={24} />
            Foto del Usuario
          </h3>
          <div className="photo-upload">
            {preview ? (
              <div className="photo-preview">
                <img src={preview} alt="Preview" />
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setFormData(prev => ({ ...prev, foto: null }));
                  }}
                  className="photo-remove"
                  title="Eliminar foto"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <label className="photo-upload-label">
                <Camera size={52} />
                <span>Subir Foto</span>
                <small style={{ color: '#6b6b6b', fontSize: '0.875rem' }}>
                  Máximo 5MB • JPG, PNG, GIF
                </small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="photo-input"
                />
              </label>
            )}
          </div>
        </div>

        {/* Datos Personales */}
        <div className="form-section">
          <h3 className="form-section-title">
            <User size={24} />
            Datos Personales
          </h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="input"
                placeholder="Ej: Juan"
                maxLength={50}
              />
            </div>

            <div className="form-field">
              <label>Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="input"
                placeholder="Ej: Pérez"
                maxLength={50}
              />
            </div>

            <div className="form-field">
              <label>Cédula *</label>
              <input
                type="text"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                required
                className="input"
                placeholder="123456789"
                maxLength={15}
              />
              {validacionCedula.validando && (
                <span className="field-hint">
                  <Loader2 size={14} className="loading" /> Verificando...
                </span>
              )}
              {validacionCedula.existe && (
                <span className="field-error">
                  Esta cédula ya está registrada
                </span>
              )}
            </div>

            <div className="form-field">
              <label>Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="input"
                placeholder="3001234567"
                maxLength={10}
              />
              {formData.telefono && formData.telefono.length < 7 && (
                <span className="field-hint">Mínimo 7 dígitos</span>
              )}
            </div>

            <div className="form-field full-width">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="ejemplo@correo.com"
              />
              {formData.email && !validarEmail(formData.email) && (
                <span className="field-error">Formato de email inválido</span>
              )}
            </div>
          </div>
        </div>

        {/* Huella Digital */}
        <div className="form-section">
          <h3 className="form-section-title">
            <Fingerprint size={24} />
            Huella Digital *
          </h3>
          <div className="fingerprint-section">
            {formData.huellaTemplate ? (
              <div className="fingerprint-captured">
                <Fingerprint size={72} className="fingerprint-icon success" />
                <p style={{ color: '#10b981', fontWeight: 600 }}>
                  ✅ Huella capturada exitosamente
                </p>
                <button
                  type="button"
                  onClick={capturarHuella}
                  className="btn-secondary"
                  disabled={capturandoHuella}
                >
                  Recapturar Huella
                </button>
              </div>
            ) : (
              <div className="fingerprint-capture">
                <Fingerprint 
                  size={72} 
                  className="fingerprint-icon" 
                  style={{ animation: capturandoHuella ? 'pulse 2s infinite' : 'none' }}
                />
                <p>
                  {capturandoHuella 
                    ? 'Capturando huella digital...' 
                    : 'Coloca el dedo en el lector de huella'}
                </p>
                <button
                  type="button"
                  onClick={capturarHuella}
                  disabled={capturandoHuella}
                  className="btn-primary"
                >
                  {capturandoHuella ? (
                    <>
                      <Loader2 size={20} className="loading" />
                      Capturando...
                    </>
                  ) : (
                    <>
                      <Fingerprint size={20} />
                      Capturar Huella
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Membresía */}
        <div className="form-section">
          <h3 className="form-section-title">
            📋 Membresía (Opcional)
          </h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Seleccionar Plan</label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleChange}
                className="input"
              >
                <option value="">Sin plan por ahora</option>
                {planes.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.nombre} - ${(plan.precio || 0).toLocaleString('es-CO')} ({(plan.duracion || 30)} días)
                  </option>
                ))}
              </select>
            </div>

            {formData.planId && (
              <div className="form-field">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}
          </div>

          {planSeleccionado && (
            <div className="plan-preview">
              <h4>📊 Resumen del Plan Seleccionado</h4>
              <div className="plan-preview-content">
                <div className="preview-item">
                  <span>Plan:</span>
                  <strong>{planSeleccionado.nombre}</strong>
                </div>
                <div className="preview-item">
                  <span>Precio:</span>
                  <strong>${(planSeleccionado.precio || 0).toLocaleString('es-CO')}</strong>
                </div>
                <div className="preview-item">
                  <span>Duración:</span>
                  <strong>{planSeleccionado.duracion || 30} días</strong>
                </div>
                <div className="preview-item">
                  <span>Fecha de inicio:</span>
                  <strong>
                    {new Date(formData.fechaInicio).toLocaleDateString('es-CO', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </strong>
                </div>
                <div className="preview-item">
                  <span>Fecha de vencimiento:</span>
                  <strong style={{ color: '#10b981' }}>
                    {calcularFechaVencimiento()}
                  </strong>
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333333' }}>
                <strong style={{ color: '#ffffff', fontSize: '0.95rem' }}>
                  Características incluidas:
                </strong>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  marginTop: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {obtenerCaracteristicas(planSeleccionado).map((caracteristica, index) => (
                    <li key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      color: '#a1a1a1',
                      fontSize: '0.875rem'
                    }}>
                      <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                      {caracteristica.trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="btn-secondary"
            disabled={loading}
          >
            <X size={20} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !formData.huellaTemplate || validacionCedula.existe}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="loading" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} />
                Guardar Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NuevoUsuario;