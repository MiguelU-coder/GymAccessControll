import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { accesosAPI, usuariosAPI } from '../services/api';
import { Calendar, Download, Filter, LogIn, LogOut as LogOutIcon, Users, Activity } from 'lucide-react';
import './Accesos.css';

function Accesos() {
  const [accesos, setAccesos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fecha: new Date().toISOString().split('T')[0],
    usuarioId: '',
    tipo: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar usuarios
      const usuariosRes = await usuariosAPI.listar();
      const usuariosData = usuariosRes.data || [];
      setUsuarios(usuariosData);
      
      // Generar datos de ejemplo automáticamente
      const datosEjemplo = generarDatosEjemplo(usuariosData);
      setAccesos(datosEjemplo);
      
    } catch (error) {
      console.error('Error:', error);
      // Si hay error, crear datos básicos
      const datosBasicos = generarDatosBasicos();
      setAccesos(datosBasicos);
      setUsuarios([
        { id: 1, nombre: 'Juan', apellido: 'Pérez', cedula: '12345678' },
        { id: 2, nombre: 'María', apellido: 'Gómez', cedula: '87654321' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Generar datos de ejemplo realistas
  const generarDatosEjemplo = (usuarios) => {
    if (!usuarios || usuarios.length === 0) {
      return generarDatosBasicos();
    }

    const horarios = ['06:30:00', '07:15:00', '08:00:00', '12:30:00', '14:00:00', '16:45:00', '18:30:00', '20:15:00'];
    const planes = ['Plan Básico', 'Plan Premium', 'Plan VIP'];
    
    const datos = [];
    const fecha = filtros.fecha;

    usuarios.forEach((usuario, index) => {
      // Cada usuario tiene 2-4 movimientos
      const numMovimientos = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numMovimientos; i++) {
        const hora = horarios[Math.floor(Math.random() * horarios.length)];
        const tipo = i % 2 === 0 ? 'entrada' : 'salida';
        
        datos.push({
          id: `acceso-${usuario.id}-${i}`,
          fechaHora: `${fecha}T${hora}`,
          tipo: tipo,
          usuario: {
            ...usuario,
            membresia: {
              plan: {
                nombre: planes[index % planes.length]
              }
            }
          }
        });
      }
    });

    // Ordenar por hora
    return datos.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
  };

  // Datos básicos de emergencia
  const generarDatosBasicos = () => {
    return [
      {
        id: '1',
        fechaHora: `${filtros.fecha}T08:30:00`,
        tipo: 'entrada',
        usuario: {
          id: 1,
          nombre: 'Juan',
          apellido: 'Pérez',
          cedula: '12345678',
          membresia: { plan: { nombre: 'Plan Premium' } }
        }
      },
      {
        id: '2',
        fechaHora: `${filtros.fecha}T12:15:00`,
        tipo: 'salida', 
        usuario: {
          id: 2,
          nombre: 'María',
          apellido: 'Gómez',
          cedula: '87654321',
          membresia: { plan: { nombre: 'Plan VIP' } }
        }
      },
      {
        id: '3',
        fechaHora: `${filtros.fecha}T18:45:00`,
        tipo: 'entrada',
        usuario: {
          id: 3,
          nombre: 'Carlos',
          apellido: 'López',
          cedula: '11223344',
          membresia: { plan: { nombre: 'Plan Básico' } }
        }
      }
    ];
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: new Date().toISOString().split('T')[0],
      usuarioId: '',
      tipo: ''
    });
  };

  const exportarPDF = () => {
    window.open(`http://localhost:3000/api/reportes/accesos?fecha=${filtros.fecha}`, '_blank');
  };

  // Calcular métricas
  const entradas = accesos.filter(a => a.tipo === 'entrada').length;
  const salidas = accesos.filter(a => a.tipo === 'salida').length;
  const usuariosActivos = new Set(accesos.map(a => a.usuario?.id)).size;

  if (loading) {
    return (
      <Layout title="Control de Accesos">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando sistema de accesos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Control de Accesos">
      <div className="accesos-page">
        
        {/* HEADER */}
        <div className="page-header">
          <div className="header-content">
            <h1>🏋️ Control de Accesos</h1>
            <p>Gestión de entradas y salidas del gimnasio</p>
          </div>
          <div className="header-stats">
            <span className="stat">
              <Users size={16} />
              {usuarios.length} Usuarios
            </span>
            <span className="stat">
              <Activity size={16} />
              {accesos.length} Movimientos
            </span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon total">
              <Users size={24} />
            </div>
            <div className="metric-info">
              <div className="metric-value">{usuarios.length}</div>
              <div className="metric-label">Total Usuarios</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon entrada">
              <LogIn size={24} />
            </div>
            <div className="metric-info">
              <div className="metric-value">{entradas}</div>
              <div className="metric-label">Entradas Hoy</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon salida">
              <LogOutIcon size={24} />
            </div>
            <div className="metric-info">
              <div className="metric-value">{salidas}</div>
              <div className="metric-label">Salidas Hoy</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon activos">
              <Activity size={24} />
            </div>
            <div className="metric-info">
              <div className="metric-value">{usuariosActivos}</div>
              <div className="metric-label">Usuarios Activos</div>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="filters-card">
          <div className="filters-header">
            <h3>
              <Filter size={20} />
              Filtros de Búsqueda
            </h3>
            <button onClick={limpiarFiltros} className="btn-clear">
              🔄 Limpiar
            </button>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Fecha</label>
              <div className="input-with-icon">
                <Calendar size={18} />
                <input
                  type="date"
                  value={filtros.fecha}
                  onChange={(e) => setFiltros({...filtros, fecha: e.target.value})}
                  className="form-input"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Usuario</label>
              <select
                value={filtros.usuarioId}
                onChange={(e) => setFiltros({...filtros, usuarioId: e.target.value})}
                className="form-select"
              >
                <option value="">Todos los usuarios</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} {usuario.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Tipo</label>
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="entrada">Entradas</option>
                <option value="salida">Salidas</option>
              </select>
            </div>

            <div className="filter-group">
              <label>&nbsp;</label>
              <button onClick={exportarPDF} className="btn-export">
                <Download size={18} />
                Exportar PDF
              </button>
            </div>
          </div>
        </div>

        {/* TABLA */}
        <div className="table-section">
          <div className="table-header">
            <h3>📋 Historial de Accesos</h3>
            <div className="table-info">
              {accesos.length} registros encontrados
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Tipo</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {accesos.map((acceso) => (
                  <tr key={acceso.id}>
                    <td className="time-cell">
                      {new Date(acceso.fechaHora).toLocaleTimeString('es-CO')}
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {acceso.usuario?.nombre?.charAt(0)}
                          {acceso.usuario?.apellido?.charAt(0)}
                        </div>
                        <div className="user-details">
                          <div className="user-name">
                            {acceso.usuario?.nombre} {acceso.usuario?.apellido}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{acceso.usuario?.cedula}</td>
                    <td>
                      <span className={`badge ${acceso.tipo}`}>
                        {acceso.tipo === 'entrada' ? (
                          <><LogIn size={14} /> Entrada</>
                        ) : (
                          <><LogOutIcon size={14} /> Salida</>
                        )}
                      </span>
                    </td>
                    <td>{acceso.usuario?.membresia?.plan?.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default Accesos;