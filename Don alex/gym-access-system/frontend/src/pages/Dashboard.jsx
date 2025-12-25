import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

// Importar imágenes (asegúrate de tener estas imágenes en tu proyecto)
// Si no tienes las imágenes, puedes usar icons de Font Awesome como en el ejemplo

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Datos del dashboard actualizados según tu imagen
  const statsData = {
    totalUsers: 24,
    activeUsers: 10,
    todayAccess: 12,
    expiringSoon: 4,
    monthlyRevenue: 2840000
  };

  const recentAccess = [
    { 
      id: 1, 
      name: 'Juan Perez', 
      time: '3:53:22 p.m.', 
      type: 'ENTRADA',
      userId: 101 
    },
    { 
      id: 2, 
      name: 'Martina Gonzales', 
      time: '3:53:22 p.m.', 
      type: 'ENTRADA',
      userId: 102 
    },
    { 
      id: 3, 
      name: 'Carlos Lopez', 
      time: '3:53:22 p.m.', 
      type: 'ENTRADA',
      userId: 103 
    }
  ];

  const expiringMemberships = [
    { 
      id: 1, 
      name: 'Luis Perez', 
      type: 'PREMIER', 
      days: 2, 
      date: '10/10/2025',
      userId: 104 
    },
    { 
      id: 2, 
      name: 'Ana Martinez', 
      type: 'MARCO', 
      days: 5, 
      date: '13/10/2025',
      userId: 105 
    }
  ];

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Función para obtener iniciales del nombre
  const getInitials = (name) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  // Navegación
  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  const formatDate = (date) => {
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return date.toLocaleDateString('es-ES', options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p className="date-display">{formatDate(currentTime)}</p>
        </div>
        <div className="header-actions">
          <div className="update-info">
            <i className="fas fa-sync-alt"></i> 
            Actualizado: {currentTime.toLocaleTimeString('es-ES')}
          </div>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <div className="stats-grid">
        <div className="stat-card total-users">
          <div className="stat-content">
            <div className="stat-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-text">
              <span className="stat-label">TOTAL USUARIOS</span>
              <div className="stat-value">{statsData.totalUsers}</div>
              <div className="stat-trend positive">
                <i className="fas fa-arrow-up"></i> 18% vs mes pasado
              </div>
            </div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar" style={{width: '75%'}}></div>
          </div>
        </div>
        
        <div className="stat-card active-users">
          <div className="stat-content">
            <div className="stat-icon">
              <i className="fas fa-user-check"></i>
            </div>
            <div className="stat-text">
              <span className="stat-label">USUARIOS ACTIVOS</span>
              <div className="stat-value">{statsData.activeUsers}</div>
              <div className="stat-trend positive">
                <i className="fas fa-key"></i> 2 hoy
              </div>
            </div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar" style={{width: '40%'}}></div>
          </div>
        </div>
        
        <div className="stat-card revenue">
          <div className="stat-content">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-text">
              <span className="stat-label">INGRESOS MENSUALES</span>
              <div className="stat-value">{formatCurrency(statsData.monthlyRevenue)}</div>
              <div className="stat-trend positive">
                <i className="fas fa-arrow-up"></i> 8% vs mes pasado
              </div>
            </div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar" style={{width: '65%'}}></div>
          </div>
        </div>
        
        <div className="stat-card expiring">
          <div className="stat-content">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-text">
              <span className="stat-label">POR VENCER</span>
              <div className="stat-value">{statsData.expiringSoon}</div>
              <div className="stat-trend warning">
                <i className="fas fa-exclamation-triangle"></i> Requiere atención
              </div>
            </div>
          </div>
          <div className="stat-progress">
            <div className="progress-bar warning" style={{width: '30%'}}></div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="content-grid">
        {/* Últimos Accesos */}
        <div className="panel panel-animated">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-door-open"></i>
              Últimos Accesos
            </h3>
            <button 
              className="view-all-btn"
              onClick={() => handleNavigate('accesos')}
            >
              Ver Todos <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="panel-content">
            {recentAccess.map((access) => (
              <div key={access.id} className="access-item">
                <div className="user-info">
                  <div className="user-avatar">
                    {getInitials(access.name)}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{access.name}</div>
                    <div className="access-time">{access.time}</div>
                  </div>
                </div>
                <div className="access-type entrada">
                  {access.type}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membresías por Vencer */}
        <div className="panel panel-animated">
          <div className="panel-header">
            <h3 className="panel-title">
              <i className="fas fa-calendar-exclamation"></i>
              Membresías por Vencer
            </h3>
            <div className="days-badge">7 días</div>
          </div>
          <div className="panel-content">
            {expiringMemberships.map((member) => (
              <div key={member.id} className="membership-item">
                <div className="user-info">
                  <div className="user-avatar">
                    {getInitials(member.name)}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{member.name}</div>
                    <div className="membership-details">
                      <span className={`membership-type ${member.type.toLowerCase()}`}>
                        {member.type}
                      </span>
                      <span className="days-left">{member.days} días</span>
                    </div>
                  </div>
                </div>
                <div className="expiry-date">{member.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acciones Rápidas - Horizontal */}
      <div className="quick-actions horizontal">
        <div className="actions-header">
          <h3>
            <i className="fas fa-bolt"></i>
            Acciones Rápidas
          </h3>
        </div>
        <div className="actions-grid">
          <button 
            className="action-btn"
            onClick={() => handleNavigate('usuarios/nuevo')}
          >
            <div className="action-icon">
              <i className="fas fa-user-plus"></i>
            </div>
            <span>Nuevo Usuario</span>
          </button>
          
          <button 
            className="action-btn"
            onClick={() => handleNavigate('usuarios')}
          >
            <div className="action-icon">
              <i className="fas fa-users-cog"></i>
            </div>
            <span>Gestionar Usuarios</span>
          </button>
          
          <button 
            className="action-btn"
            onClick={() => handleNavigate('pagos')}
          >
            <div className="action-icon">
              <i className="fas fa-credit-card"></i>
            </div>
            <span>Control de Pagos</span>
          </button>
          
          <button 
            className="action-btn"
            onClick={() => handleNavigate('planes')}
          >
            <div className="action-icon">
              <i className="fas fa-clipboard-list"></i>
            </div>
            <span>Gestionar Planes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;