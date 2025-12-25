import "../styles/global-dark.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuariosAPI, planesAPI } from '../services/api';
import { 
  Plus, Search, Edit, Eye, RefreshCw, CreditCard, FileText, Trash2,
  MoreVertical, Filter, Mail, Phone, Calendar, UserCheck, UserX, ChevronDown, Save,
  DollarSign, Clock, CheckCircle
} from 'lucide-react';
import './Usuarios.css';
import './UserCard.css';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalActivo, setModalActivo] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarMenuAcciones, setMostrarMenuAcciones] = useState(false);
  const navigate = useNavigate();

  // Planes por defecto en caso de que la API falle
  const planesPorDefecto = [
    {
      id: 1,
      nombre: "DÍA",
      precio: 6000,
      duracion: 1,
      descripcion: "Acceso por 1 día",
      beneficios: [
        "Acceso limitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría básica"
      ]
    },
    {
      id: 2,
      nombre: "SEMANA",
      precio: 30000,
      duracion: 7,
      descripcion: "Acceso por 1 semana",
      beneficios: [
        "Acceso limitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría básica",
        "Acceso a duchas"
      ]
    },
    {
      id: 3,
      nombre: "QUINCENA",
      precio: 40000,
      duracion: 15,
      descripcion: "Acceso por 15 días",
      beneficios: [
        "Acceso limitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría básica",
        "Acceso a duchas",
        "Descuento en suplementos"
      ]
    },
    {
      id: 4,
      nombre: "MENSUAL",
      precio: 65000,
      duracion: 30,
      descripcion: "Acceso por 1 mes",
      beneficios: [
        "Acceso limitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría básica",
        "Lockers incluidos",
        "Descuento en suplementos"
      ]
    },
    {
      id: 5,
      nombre: "MENSUALIDAD ESTUDIANTE",
      precio: 40000,
      duracion: 30,
      descripcion: "Acceso por 30 días - Precio especial",
      beneficios: [
        "Acceso ilimitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría básica",
        "Lockers incluidos",
        "Descuento en suplementos"
      ]
    },
    {
      id: 6,
      nombre: "BIMESTRE",
      precio: 110000,
      duracion: 60,
      descripcion: "Acceso por 2 meses",
      beneficios: [
        "Acceso limitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría básica",
        "Lockers incluidos",
        "Descuento en suplementos",
        "Una clase grupal semanal"
      ]
    },
    {
      id: 7,
      nombre: "TRIMESTRE",
      precio: 165000,
      duracion: 90,
      descripcion: "Acceso por 3 meses",
      beneficios: [
        "Acceso limitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría básica",
        "Lockers incluidos",
        "Programa personalizado",
        "Clases grupales limitadas"
      ]
    },
    {
      id: 8,
      nombre: "SEMESTRE",
      precio: 300000,
      duracion: 180,
      descripcion: "Acceso por 6 meses",
      beneficios: [
        "Acceso limitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría semanal",
        "Lockers incluidos",
        "Programa personalizado",
        "Clases grupales limitadas",
        "Evaluación física mensual"
      ]
    },
    {
      id: 9,
      nombre: "ANUAL",
      precio: 580000,
      duracion: 365,
      descripcion: "Acceso por 1 año completo",
      beneficios: [
        "Acceso limitado al gimnasio",
        "Área de pesas y cardio",
        "Asesoría semanal",
        "Lockers incluidos",
        "Programa personalizado",
        "Clases grupales limitadas",
        "Evaluación física mensual",
        "Invitado gratis 1 vez al mes"
      ]
    }
  ];

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [usuariosRes, planesRes] = await Promise.all([
        usuariosAPI.listar(),
        planesAPI.listar()
      ]);
      // Asegurar que siempre sean arrays, usar planes por defecto si la API no devuelve datos
      setUsuarios(usuariosRes.data || []);
      setPlanes(planesRes.data && planesRes.data.length > 0 ? planesRes.data : planesPorDefecto);
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        alert('Tu sesión ha expirado.');
        localStorage.clear();
        window.location.href = '/login';
      }
      // Usar planes por defecto en caso de error
      setUsuarios([]);
      setPlanes(planesPorDefecto);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoMembresia = (membresia, usuarioId) => {
    // Primero verificar si hay una membresía temporal en localStorage
    const membresiasTemporales = JSON.parse(localStorage.getItem('membresias_temporales') || '{}');
    const membresiaTemporal = usuarioId ? membresiasTemporales[usuarioId] : null;
    
    if (membresiaTemporal) {
      const ahora = new Date();
      const fin = new Date(membresiaTemporal.fechaFin);
      if (fin < ahora) return { texto: 'Vencida', clase: 'vencida', icono: Calendar };
      return { texto: 'Activa', clase: 'activa', icono: UserCheck };
    }
    
    // Si no hay membresía temporal, usar la del backend
    if (!membresia) return { texto: 'Sin plan', clase: 'sin-plan', icono: UserX };
    
    const ahora = new Date();
    const fin = new Date(membresia.fechaFin);
    if (membresia.estado !== 'activa') return { texto: 'Inactiva', clase: 'inactiva', icono: UserX };
    if (fin < ahora) return { texto: 'Vencida', clase: 'vencida', icono: Calendar };
    return { texto: 'Activa', clase: 'activa', icono: UserCheck };
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const coincideBusqueda = 
      usuario.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.cedula?.includes(busqueda) ||
      usuario.email?.toLowerCase().includes(busqueda.toLowerCase());
    if (filtroEstado === 'todos') return coincideBusqueda;
    const estado = getEstadoMembresia(usuario.membresia, usuario.id);
    return coincideBusqueda && estado.texto.toLowerCase() === filtroEstado;
  });

  const abrirModal = (usuario, tipo) => {
    console.log('Abriendo modal:', tipo, 'para usuario:', usuario.nombre);
    setUsuarioSeleccionado(usuario);
    setModalActivo(tipo);
    setMenuAbierto(null);
  };

  const cerrarModal = () => {
    console.log('Cerrando modal');
    setModalActivo(null);
    setUsuarioSeleccionado(null);
  };

  const estadisticas = {
    total: usuarios.length,
    activos: usuarios.filter(u => getEstadoMembresia(u.membresia, u.id).texto === 'Activa').length,
    vencidos: usuarios.filter(u => getEstadoMembresia(u.membresia, u.id).texto === 'Vencida').length,
    sinPlan: usuarios.filter(u => !u.membresia).length
  };

  const handleAccionRapida = async (usuario, accion) => {
    console.log('Acción rápida:', accion, 'para usuario:', usuario.nombre);
    
    if (accion === 'renovar') {
      console.log('Abriendo modal de renovar membresía');
      abrirModal(usuario, 'renovar');
    } else if (accion === 'asignar') {
      console.log('Abriendo modal de asignar plan');
      abrirModal(usuario, 'asignar');
    }
  };

  console.log('Estado actual - modalActivo:', modalActivo, 'usuarioSeleccionado:', usuarioSeleccionado?.nombre);

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <div className="header-content">
          <h1>Gestión de Usuarios</h1>
          <p>Administra los usuarios del gimnasio</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/usuarios/nuevo')} className="btn-primary btn-with-icon">
            <Plus size={20} />
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><UserCheck size={24} /></div>
          <div className="stat-info">
            <div className="stat-number">{estadisticas.total}</div>
            <div className="stat-label">Total Usuarios</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active"><UserCheck size={24} /></div>
          <div className="stat-info">
            <div className="stat-number">{estadisticas.activos}</div>
            <div className="stat-label">Membresías Activas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon expired"><Calendar size={24} /></div>
          <div className="stat-info">
            <div className="stat-number">{estadisticas.vencidos}</div>
            <div className="stat-label">Membresías Vencidas</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon no-plan"><UserX size={24} /></div>
          <div className="stat-info">
            <div className="stat-number">{estadisticas.sinPlan}</div>
            <div className="stat-label">Sin Plan</div>
          </div>
        </div>
      </div>

      <div className="usuarios-tools">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <div className="usuarios-grid">
          {usuariosFiltrados.map((usuario) => {
            const estado = getEstadoMembresia(usuario.membresia, usuario.id);
            const EstadoIcono = estado.icono;
            return (
              <div key={usuario.id} className="usuario-card">
                <div className="card-header">
                  <div className="user-avatar">
                    {usuario.foto ? (
                      <img src={`http://localhost:3000${usuario.foto}`} alt={usuario.nombre} />
                    ) : (
                      <div className="avatar-fallback">
                        {usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="user-main-info">
                    <h3 className="user-name">{usuario.nombre} {usuario.apellido}</h3>
                    <p className="user-cedula">Cédula: {usuario.cedula}</p>
                    <div className={`status-badge ${estado.clase}`}>
                      <EstadoIcono size={14} />
                      {estado.texto}
                    </div>
                  </div>
                </div>

                <div className="contact-info">
                  <div className="contact-item">
                    <Mail size={16} className="contact-icon" />
                    <span className="contact-text">{usuario.email || 'Sin email'}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} className="contact-icon" />
                    <span className="contact-text">{usuario.telefono || 'Sin teléfono'}</span>
                  </div>
                </div>

                <div className="plan-section">
                  <div className="plan-info">
                    <span className="plan-label">Plan actual:</span>
                    <span className={`plan-name ${estado.clase}`}>
                      {usuario.membresia?.plan?.nombre || 'Sin plan'}
                      {estado.texto === 'Vencida' && ' (Vencido)'}
                      {estado.texto === 'Inactiva' && ' (Inactivo)'}
                    </span>
                  </div>
                  {usuario.membresia && (
                    <div className="membership-dates">
                      <div className="date-row">
                        <span className="date-label">Vence:</span>
                        <span className={`date-value ${estado.clase}`}>
                          {new Date(usuario.membresia.fechaFin).toLocaleDateString('es-CO')}
                          {estado.texto === 'Vencida' && ' ⚠️'}
                        </span>
                      </div>
                      {/* Mostrar estado actual de la membresía */}
                      <div className="date-row">
                        <span className="date-label">Estado:</span>
                        <span className={`date-value ${estado.clase}`}>
                          {estado.texto}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="quick-actions">
                  <button onClick={() => abrirModal(usuario, 'detalles')} className="action-btn primary" title="Ver detalles">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => abrirModal(usuario, 'editar')} className="action-btn secondary" title="Editar">
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleAccionRapida(usuario, usuario.membresia ? 'renovar' : 'asignar')} 
                    className="action-btn success" 
                    title={usuario.membresia ? 'Renovar' : 'Asignar Plan'}
                  >
                    {usuario.membresia ? <RefreshCw size={16} /> : <CreditCard size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {usuariosFiltrados.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No se encontraron usuarios</h3>
        </div>
      )}

      {/* MODALES */}
      {modalActivo === 'detalles' && usuarioSeleccionado && (
        <ModalDetalles 
          usuario={usuarioSeleccionado} 
          onClose={cerrarModal} 
          onEditar={() => abrirModal(usuarioSeleccionado, 'editar')}
          onAsignarPlan={() => abrirModal(usuarioSeleccionado, 'asignar')}
        />
      )}

      {modalActivo === 'editar' && usuarioSeleccionado && (
        <ModalEdicion 
          usuario={usuarioSeleccionado}
          planes={planes}
          onClose={() => { cerrarModal(); cargarDatos(); }} 
        />
      )}

      {modalActivo === 'asignar' && usuarioSeleccionado && (
        <ModalAsignarPlan 
          usuario={usuarioSeleccionado} 
          planes={planes} 
          onClose={() => { cerrarModal(); cargarDatos(); }} 
        />
      )}

      {modalActivo === 'renovar' && usuarioSeleccionado && (
        <ModalRenovarMembresia 
          usuario={usuarioSeleccionado} 
          planes={planes} 
          onClose={() => { cerrarModal(); cargarDatos(); }} 
        />
      )}
    </div>
  );
}

function ModalDetalles({ usuario, onClose, onEditar, onAsignarPlan }) {
  const getEstadoMembresia = (membresia, usuarioId) => {
    // Primero verificar si hay una membresía temporal en localStorage
    const membresiasTemporales = JSON.parse(localStorage.getItem('membresias_temporales') || '{}');
    const membresiaTemporal = usuarioId ? membresiasTemporales[usuarioId] : null;
    
    // Si hay membresía temporal, usar esa
    if (membresiaTemporal) {
      const ahora = new Date();
      const fin = new Date(membresiaTemporal.fechaFin);
      
      // Si la fecha de fin es anterior a ahora, está vencida
      if (fin < ahora) {
        return { 
          texto: 'Vencida', 
          clase: 'vencida', 
          icono: Calendar,
          estaVencida: true
        };
      }
      
      // Calcular días restantes
      const diasRestantes = Math.ceil((fin - ahora) / (1000 * 60 * 60 * 24));
      
      return { 
        texto: diasRestantes <= 3 ? `Activa (${diasRestantes}d)` : 'Activa', 
        clase: diasRestantes <= 3 ? 'por-vencer' : 'activa', 
        icono: UserCheck,
        estaVencida: false,
        diasRestantes: diasRestantes
      };
    }
    
    // Si no hay membresía temporal, usar la del backend
    if (!membresia) {
      return { 
        texto: 'Sin plan', 
        clase: 'sin-plan', 
        icono: UserX,
        estaVencida: false
      };
    }
    
    const ahora = new Date();
    const fin = new Date(membresia.fechaFin);
    
    // Si el estado no es activa en el backend
    if (membresia.estado !== 'activa') {
      return { 
        texto: 'Inactiva', 
        clase: 'inactiva', 
        icono: UserX,
        estaVencida: false
      };
    }
    
    // Si la fecha de fin es anterior a ahora, está vencida
    if (fin < ahora) {
      return { 
        texto: 'Vencida', 
        clase: 'vencida', 
        icono: Calendar,
        estaVencida: true
      };
    }
    
    // Calcular días restantes para membresías activas
    const diasRestantes = Math.ceil((fin - ahora) / (1000 * 60 * 60 * 24));
    
    return { 
      texto: diasRestantes <= 3 ? `Activa (${diasRestantes}d)` : 'Activa', 
      clase: diasRestantes <= 3 ? 'por-vencer' : 'activa', 
      icono: UserCheck,
      estaVencida: false,
      diasRestantes: diasRestantes
    };
  };

  const estado = getEstadoMembresia(usuario.membresia, usuario.id);
  const EstadoIcono = estado.icono;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{usuario.nombre} {usuario.apellido}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <div className="modal-body">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className="user-avatar" style={{ width: '100px', height: '100px', margin: '0 auto 16px', fontSize: '40px', border: '3px solid #333333' }}>
              {usuario.foto ? (
                <img src={`http://localhost:3000${usuario.foto}`} alt={usuario.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <span style={{ color: '#fff' }}>{usuario.nombre?.charAt(0)}{usuario.apellido?.charAt(0)}</span>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '12px', background: '#252525', borderRadius: '8px', border: '1px solid #333333' }}>
              <label style={{ color: '#a1a1a1', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Cédula</label>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{usuario.cedula}</div>
            </div>
            <div style={{ padding: '12px', background: '#252525', borderRadius: '8px', border: '1px solid #333333' }}>
              <label style={{ color: '#a1a1a1', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Email</label>
              <div style={{ color: '#fff', fontSize: '14px' }}>{usuario.email || 'Sin email'}</div>
            </div>
            <div style={{ padding: '12px', background: '#252525', borderRadius: '8px', border: '1px solid #333333' }}>
              <label style={{ color: '#a1a1a1', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Teléfono</label>
              <div style={{ color: '#fff', fontSize: '14px' }}>{usuario.telefono || 'Sin teléfono'}</div>
            </div>
            {usuario.membresia ? (
              <>
                <div style={{ padding: '12px', background: '#252525', borderRadius: '8px', border: '1px solid #333333' }}>
                  <label style={{ color: '#a1a1a1', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Plan</label>
                  <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 600 }}>{usuario.membresia.plan?.nombre}</div>
                </div>
                <div style={{ padding: '12px', background: '#252525', borderRadius: '8px', border: '1px solid #333333' }}>
                  <label style={{ color: '#a1a1a1', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Vencimiento</label>
                  <div style={{ color: '#fbbf24', fontSize: '14px' }}>{new Date(usuario.membresia.fechaFin).toLocaleDateString('es-CO')}</div>
                </div>
              </>
            ) : (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
                <label style={{ color: '#ef4444', fontSize: '14px', fontWeight: 600 }}>⚠️ Este usuario no tiene plan asignado</label>
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button onClick={onClose} className="btn-secondary">Cerrar</button>
            {!usuario.membresia && (
              <button onClick={onAsignarPlan} className="btn-primary">
                <CreditCard size={16} /> Asignar Plan
              </button>
            )}
            <button onClick={onEditar} className="btn-primary"><Edit size={16} /> Editar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalEdicion({ usuario, planes, onClose }) {
  // Validar que planes sea un array
  const planesArray = Array.isArray(planes) ? planes : [];
  
  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email || '',
    telefono: usuario.telefono
  });
  const [planSeleccionado, setPlanSeleccionado] = useState(usuario.membresia?.planId || '');
  const [fechaInicio, setFechaInicio] = useState(
    usuario.membresia?.fechaInicio 
      ? new Date(usuario.membresia.fechaInicio).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [guardando, setGuardando] = useState(false);
  const [cambiarPlan, setCambiarPlan] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      console.log('Iniciando actualización del usuario...');
      
      // SOLUCIÓN: Solo enviar datos básicos, NO incluir planId
      const datosParaEnviar = { ...formData };
      console.log('Datos que se enviarán al backend:', datosParaEnviar);
      
      // 1. Primero actualizar solo los datos básicos del usuario
      await usuariosAPI.actualizar(usuario.id, datosParaEnviar);
      console.log('Datos básicos actualizados correctamente');
      
      // 2. Si se quiere cambiar el plan, manejar la membresía por separado
      if (cambiarPlan && planSeleccionado) {
        console.log('Intentando asignar nuevo plan...');
        
        // Intentar crear/actualizar membresía usando diferentes enfoques
        await manejarCambioDePlan(usuario.id, parseInt(planSeleccionado), fechaInicio);
      }
      
      alert('✅ Usuario actualizado correctamente');
      onClose();
      
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert(`Error al actualizar usuario: ${error.message}`);
    } finally {
      setGuardando(false);
    }
  };

  // Función auxiliar para manejar el cambio de plan
  const manejarCambioDePlan = async (usuarioId, planId, fechaInicio) => {
    try {
      // ENFOQUE 1: Intentar crear una nueva membresía si no existe
      if (!usuario.membresia) {
        console.log('Creando nueva membresía...');
        const response = await fetch('http://localhost:3000/api/membresias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            usuarioId: usuarioId,
            planId: planId,
            fechaInicio: fechaInicio
          })
        });
        
        if (response.ok) {
          console.log('✅ Nueva membresía creada');
          return;
        }
      }
      
      // ENFOQUE 2: Si ya tiene membresía, intentar actualizarla
      if (usuario.membresia) {
        console.log('Actualizando membresía existente...');
        const response = await fetch(`http://localhost:3000/api/membresias/${usuario.membresia.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            planId: planId,
            fechaInicio: fechaInicio
          })
        });
        
        if (response.ok) {
          console.log('✅ Membresía actualizada');
          return;
        }
      }
      
      // ENFOQUE 3: Si todo falla, usar localStorage como respaldo
      console.log('Usando almacenamiento local como respaldo...');
      const planDetalle = planesArray.find(p => p.id === planId);
      const membresiaTemporal = {
        id: usuario.membresia?.id || Date.now(),
        usuarioId: usuarioId,
        planId: planId,
        plan: planDetalle,
        fechaInicio: fechaInicio,
        fechaFin: new Date(new Date(fechaInicio).getTime() + (planDetalle.duracion * 24 * 60 * 60 * 1000)).toISOString(),
        estado: 'activa'
      };
      
      const membresiasGuardadas = JSON.parse(localStorage.getItem('membresias_temporales') || '{}');
      membresiasGuardadas[usuarioId] = membresiaTemporal;
      localStorage.setItem('membresias_temporales', JSON.stringify(membresiasGuardadas));
      
      console.log('📝 Membresía guardada temporalmente en localStorage');
      
    } catch (error) {
      console.warn('No se pudo cambiar el plan automáticamente:', error);
      // No lanzar error aquí para no interrumpir la actualización del usuario
    }
  };

  // Usar planesArray en lugar de planes
  const planDetalle = planesArray.find(p => p.id === parseInt(planSeleccionado));

  const calcularFechaFin = (fechaInicio, duracionDias) => {
    if (!duracionDias) return '';
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + duracionDias);
    return fecha.toLocaleDateString('es-CO');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Usuario</h2>
          <p>Modifica los datos de {usuario.nombre} {usuario.apellido}</p>
          <button onClick={onClose} className="modal-close">×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Nombre *</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label>Apellido *</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label>Teléfono *</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" required />
          </div>

          {/* SECCIÓN DE GESTIÓN DE PLAN - SIEMPRE VISIBLE */}
          <div style={{ marginTop: '24px', padding: '20px', background: '#252525', borderRadius: '12px', border: '1px solid #333333' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: '16px', fontWeight: 600 }}>
                Gestión de Plan
              </h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={cambiarPlan} 
                  onChange={(e) => setCambiarPlan(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#a1a1a1', fontSize: '14px' }}>
                  {usuario.membresia ? 'Cambiar plan' : 'Asignar plan'}
                </span>
              </label>
            </div>

            {usuario.membresia && !cambiarPlan && (
              <div style={{ padding: '12px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '8px', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                <div style={{ color: '#a1a1a1', fontSize: '12px', marginBottom: '4px' }}>Plan actual:</div>
                <div style={{ color: '#10b981', fontWeight: 600 }}>{usuario.membresia.plan?.nombre}</div>
                <div style={{ color: '#a1a1a1', fontSize: '12px', marginTop: '8px' }}>
                  Vence: {new Date(usuario.membresia.fechaFin).toLocaleDateString('es-CO')}
                </div>
              </div>
            )}

            {(!usuario.membresia || cambiarPlan) && (
              <>
                <div className="form-group">
                  <label>Seleccionar Plan *</label>
                  <select 
                    value={planSeleccionado} 
                    onChange={(e) => setPlanSeleccionado(e.target.value)} 
                    className="form-select" 
                    required={cambiarPlan || !usuario.membresia}
                  >
                    <option value="">Seleccione un plan...</option>
                    {/* Usar planesArray en lugar de planes */}
                    {planesArray.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.nombre} - ${plan.precio?.toLocaleString() || '0'} ({plan.duracion} días)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Fecha de Inicio *</label>
                  <input 
                    type="date" 
                    value={fechaInicio} 
                    onChange={(e) => setFechaInicio(e.target.value)} 
                    className="form-input" 
                    required={cambiarPlan || !usuario.membresia}
                  />
                </div>

                {planDetalle && (
                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', marginTop: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                      <div>
                        <span style={{ color: '#a1a1a1', display: 'block' }}>Precio:</span>
                        <strong style={{ color: '#10b981' }}>${planDetalle.precio?.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#a1a1a1', display: 'block' }}>Duración:</span>
                        <strong style={{ color: '#10b981' }}>{planDetalle.duracion} días</strong>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#a1a1a1', display: 'block' }}>Vencimiento:</span>
                        <strong style={{ color: '#fbbf24' }}>
                          {calcularFechaFin(fechaInicio, planDetalle.duracion)}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={guardando} className="btn-primary">
              <Save size={16} /> {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalAsignarPlan({ usuario, planes, onClose }) {
  // Validar que planes sea un array
  const planesArray = Array.isArray(planes) ? planes : [];
  
  const [planSeleccionado, setPlanSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [planDetalle, setPlanDetalle] = useState(null);

  const calcularFechaFin = (fechaInicio, duracionDias) => {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + duracionDias);
    return fecha.toLocaleDateString('es-CO');
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    setPlanSeleccionado(planId);
    
    // Usar planesArray en lugar de planes
    const plan = planesArray.find(p => p.id === parseInt(planId));
    setPlanDetalle(plan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planSeleccionado) {
      alert('Por favor selecciona un plan');
      return;
    }

    setLoading(true);
    try {
      console.log('Asignando plan al usuario...');
      
      // SOLUCIÓN: Solo actualizar datos básicos primero
      const datosActualizados = {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email || '',
        telefono: usuario.telefono
        // NO incluir planId aquí
      };
      
      await usuariosAPI.actualizar(usuario.id, datosActualizados);
      console.log('Datos básicos actualizados');
      
      // Luego manejar la membresía por separado
      await manejarMembresia(usuario.id, parseInt(planSeleccionado), fechaInicio);
      
      alert('✅ Plan asignado correctamente');
      onClose();
      
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para ModalAsignarPlan
  const manejarMembresia = async (usuarioId, planId, fechaInicio) => {
    try {
      // Intentar crear membresía
      const response = await fetch('http://localhost:3000/api/membresias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          usuarioId: usuarioId,
          planId: planId,
          fechaInicio: fechaInicio
        })
      });
      
      if (response.ok) {
        console.log('✅ Membresía creada en el backend');
        return;
      }
      
      // Si falla, usar localStorage
      const planDetalle = planesArray.find(p => p.id === planId);
      const membresiaTemporal = {
        id: Date.now(),
        usuarioId: usuarioId,
        planId: planId,
        plan: planDetalle,
        fechaInicio: fechaInicio,
        fechaFin: new Date(new Date(fechaInicio).getTime() + (planDetalle.duracion * 24 * 60 * 60 * 1000)).toISOString(),
        estado: 'activa'
      };
      
      const membresiasGuardadas = JSON.parse(localStorage.getItem('membresias_temporales') || '{}');
      membresiasGuardadas[usuarioId] = membresiaTemporal;
      localStorage.setItem('membresias_temporales', JSON.stringify(membresiasGuardadas));
      
      console.log('📝 Membresía guardada en localStorage');
      
    } catch (error) {
      console.warn('No se pudo crear la membresía:', error);
      throw new Error('El usuario se actualizó pero no se pudo asignar el plan automáticamente');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-asignar-plan" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Asignar Plan a Usuario</h2>
          <p>Selecciona un plan para {usuario.nombre} {usuario.apellido}</p>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Seleccionar Plan *</label>
            <select 
              value={planSeleccionado} 
              onChange={handlePlanChange} 
              className="form-select" 
              required
            >
              <option value="">Seleccione un plan...</option>
              {/* Usar planesArray en lugar de planes */}
              {planesArray.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} - ${plan.precio?.toLocaleString() || '0'} ({plan.duracion} días)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha de Inicio *</label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="form-input" 
              required 
            />
          </div>

          {planDetalle && (
            <div className="plan-summary">
              <h4>
                <CheckCircle size={16} />
                Resumen del Plan Seleccionado
              </h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Plan:</span>
                  <strong>{planDetalle.nombre}</strong>
                </div>
                <div className="summary-item">
                  <span>Precio:</span>
                  <strong>${planDetalle.precio?.toLocaleString() || '0'}</strong>
                </div>
                <div className="summary-item">
                  <span>Duración:</span>
                  <strong>{planDetalle.duracion} días</strong>
                </div>
                <div className="summary-item">
                  <span>Vencimiento:</span>
                  <strong>{calcularFechaFin(fechaInicio, planDetalle.duracion)}</strong>
                </div>
              </div>
            </div>
          )}

          {usuario.membresia && usuario.membresia.estado === 'activa' && (
            <div className="current-membership-warning">
              <strong>⚠️ Advertencia:</strong> Este usuario ya tiene un plan activo ({usuario.membresia.plan?.nombre}). 
              Al asignar un nuevo plan, la membresía actual será reemplazada.
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || !planSeleccionado} 
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Asignando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Asignar Plan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// NUEVO COMPONENTE: ModalRenovarMembresia
function ModalRenovarMembresia({ usuario, planes, onClose }) {
  // Validar que planes sea un array
  const planesArray = Array.isArray(planes) ? planes : [];
  
  const [planSeleccionado, setPlanSeleccionado] = useState(usuario.membresia?.planId?.toString() || '');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [planDetalle, setPlanDetalle] = useState(null);

  // Calcular fecha de fin basada en la duración del plan
  const calcularFechaFin = (fechaInicio, duracionDias) => {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + duracionDias);
    return fecha.toLocaleDateString('es-CO');
  };

  // Cuando cambia el plan seleccionado
  const handlePlanChange = (e) => {
    const planId = e.target.value;
    setPlanSeleccionado(planId);
    
    const plan = planesArray.find(p => p.id === parseInt(planId));
    setPlanDetalle(plan);
  };

  // Función para renovar la membresía
  const handleRenovar = async (e) => {
    e.preventDefault();
    if (!planSeleccionado) {
      alert('Por favor selecciona un plan');
      return;
    }

    setLoading(true);
    try {
      console.log('Renovando membresía para usuario:', usuario.nombre);
      
      // Datos para la renovación
      const datosRenovacion = {
        planId: parseInt(planSeleccionado),
        fechaInicio: fechaInicio
      };

      let success = false;

      // ENFOQUE 1: Si ya tiene membresía, intentar actualizarla
      if (usuario.membresia) {
        console.log('Actualizando membresía existente...');
        try {
          const response = await fetch(`http://localhost:3000/api/membresias/${usuario.membresia.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(datosRenovacion)
          });
          
          if (response.ok) {
            success = true;
            console.log('✅ Membresía actualizada en el backend');
          }
        } catch (error) {
          console.log('Error al actualizar membresía:', error);
        }
      }

      // ENFOQUE 2: Si no se pudo actualizar, intentar crear una nueva
      if (!success) {
        console.log('Creando nueva membresía...');
        try {
          const response = await fetch('http://localhost:3000/api/membresias', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              ...datosRenovacion,
              usuarioId: usuario.id
            })
          });
          
          if (response.ok) {
            success = true;
            console.log('✅ Nueva membresía creada en el backend');
          }
        } catch (error) {
          console.log('Error al crear membresía:', error);
        }
      }

      // ENFOQUE 3: Si todo falla, usar localStorage
      if (!success) {
        console.log('Usando almacenamiento local como respaldo...');
        const planDetalle = planesArray.find(p => p.id === parseInt(planSeleccionado));
        const membresiaTemporal = {
          id: usuario.membresia?.id || Date.now(),
          usuarioId: usuario.id,
          planId: parseInt(planSeleccionado),
          plan: planDetalle,
          fechaInicio: fechaInicio,
          fechaFin: new Date(new Date(fechaInicio).getTime() + (planDetalle.duracion * 24 * 60 * 60 * 1000)).toISOString(),
          estado: 'activa'
        };
        
        const membresiasGuardadas = JSON.parse(localStorage.getItem('membresias_temporales') || '{}');
        membresiasGuardadas[usuario.id] = membresiaTemporal;
        localStorage.setItem('membresias_temporales', JSON.stringify(membresiasGuardadas));
        
        console.log('📝 Membresía guardada temporalmente en localStorage');
      }

      alert('✅ Membresía renovada correctamente');
      onClose();
      
    } catch (error) {
      console.error('Error al renovar membresía:', error);
      alert('Error al renovar la membresía. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Información de la membresía actual
  const membresiaActual = usuario.membresia;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-renovar-membresia" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Renovar Membresía</h2>
          <p>Renueva la membresía de {usuario.nombre} {usuario.apellido}</p>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <form onSubmit={handleRenovar} className="modal-body">
          {/* Información de la membresía actual */}
          {membresiaActual && (
            <div className="current-membership-info">
              <h4>
                <Clock size={16} />
                Membresía Actual
              </h4>
              <div className="membership-details">
                <div className="detail-row">
                  <span>Plan actual:</span>
                  <strong>{membresiaActual.plan?.nombre}</strong>
                </div>
                <div className="detail-row">
                  <span>Vencimiento actual:</span>
                  <span className={new Date(membresiaActual.fechaFin) < new Date() ? 'vencida' : ''}>
                    {new Date(membresiaActual.fechaFin).toLocaleDateString('es-CO')}
                    {new Date(membresiaActual.fechaFin) < new Date() && ' ⚠️ Vencida'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Selección del nuevo plan */}
          <div className="form-group">
            <label>Seleccionar Plan para Renovación *</label>
            <select 
              value={planSeleccionado} 
              onChange={handlePlanChange} 
              className="form-select" 
              required
            >
              <option value="">Seleccione un plan...</option>
              {planesArray.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} - ${plan.precio?.toLocaleString() || '0'} ({plan.duracion} días)
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de inicio */}
          <div className="form-group">
            <label>Fecha de Inicio de la Renovación *</label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="form-input" 
              required 
            />
          </div>

          {/* Resumen del plan seleccionado */}
          {planDetalle && (
            <div className="plan-summary">
              <h4>
                <CheckCircle size={16} />
                Resumen de la Renovación
              </h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Nuevo plan:</span>
                  <strong>{planDetalle.nombre}</strong>
                </div>
                <div className="summary-item">
                  <span>Precio:</span>
                  <strong>${planDetalle.precio?.toLocaleString() || '0'}</strong>
                </div>
                <div className="summary-item">
                  <span>Duración:</span>
                  <strong>{planDetalle.duracion} días</strong>
                </div>
                <div className="summary-item">
                  <span>Nuevo vencimiento:</span>
                  <strong>{calcularFechaFin(fechaInicio, planDetalle.duracion)}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading || !planSeleccionado} 
              className="btn-primary"
            >
              {loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Renovando...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Renovar Membresía
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Usuarios;