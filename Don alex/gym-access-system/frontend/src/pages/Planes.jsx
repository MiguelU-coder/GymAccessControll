import "../styles/global-dark.css";  // ✅
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { planesAPI } from '../services/api';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, DollarSign, Clock, Check, Star, Shield, Activity, Award, Gift, ChevronDown, X, Save } from 'lucide-react';
import './Planes.css';
import "../components/Layout.css";

function Planes() {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarMenuAcciones, setMostrarMenuAcciones] = useState(false);
  const [planEditando, setPlanEditando] = useState(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const navigate = useNavigate();

  // Planes predefinidos organizados
  const planesPredefinidos = [
    {
      id: 'dia',
      nombre: 'Día',
      precio: 6000,
      duracion: 1,
      descripcion: 'Acceso por 1 día',
      popular: false,
      color: '#4f46e5',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica']
    },
    {
      id: 'semana',
      nombre: 'Semana',
      precio: 30000,
      duracion: 7,
      descripcion: 'Acceso por 1 semana',
      popular: false,
      color: '#10b981',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Acceso a duchas']
    },
    {
      id: 'quincena',
      nombre: 'Quincena',
      precio: 40000,
      duracion: 15,
      descripcion: 'Acceso por 15 días',
      popular: false,
      color: '#f59e0b',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Acceso a duchas', 'Descuento en suplementos']
    },
    {
      id: 'mensual',
      nombre: 'Mensual',
      precio: 65000,
      duracion: 30,
      descripcion: 'Acceso por 1 mes',
      popular: true,
      color: '#ec4899',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Lockers incluidos', 'Descuento en suplementos']
    },
    {
      id: 'bimestre',
      nombre: 'Bimestre',
      precio: 110000,
      duracion: 60,
      descripcion: 'Acceso por 2 meses',
      popular: false,
      color: '#3b82f6',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Lockers incluidos', 'Descuento en suplementos', 'Una clase grupal semanal']
    },
    {
      id: 'trimestre',
      nombre: 'Trimestre',
      precio: 165000,
      duracion: 90,
      descripcion: 'Acceso por 3 meses',
      popular: false,
      color: '#ef4444',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Lockers incluidos', 'Programa personalizado', 'Clases grupales ilimitadas']
    },
    {
      id: 'semestre',
      nombre: 'Semestre',
      precio: 300000,
      duracion: 180,
      descripcion: 'Acceso por 6 meses',
      popular: false,
      color: '#8b5cf6',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría avanzada', 'Lockers incluidos', 'Programa personalizado', 'Clases grupales ilimitadas', 'Evaluación física mensual']
    },
    {
      id: 'anual',
      nombre: 'Anual',
      precio: 580000,
      duracion: 365,
      descripcion: 'Acceso por 1 año completo',
      popular: false,
      color: '#06b6d4',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría avanzada', 'Lockers incluidos', 'Programa personalizado', 'Clases grupales ilimitadas', 'Evaluación física mensual', 'Invitado gratis 1 vez al mes']
    },
    {
      id: 'estudiante',
      nombre: 'Mensualidad Estudiante',
      precio: 40000,
      duracion: 30,
      descripcion: 'Acceso por 30 días - Precio especial',
      popular: true,
      color: '#14b8a6',
      features: ['Acceso ilimitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Lockers incluidos', 'Descuento en suplementos']
    }
  ];

  const menuOpciones = [
    { id: 'volver', icono: ArrowLeft, texto: 'Volver al Dashboard', accion: () => navigate('/dashboard') },
    { id: 'nuevo', icono: Plus, texto: 'Nuevo Plan', accion: () => navigate('/planes/nuevo') }
  ];

  useEffect(() => {
    cargarPlanes();
    const handleClickOutside = () => setMostrarMenuAcciones(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const cargarPlanes = () => {
    try {
      setLoading(true);
      setPlanes(planesPredefinidos);
      console.log('✅ Planes cargados:', planesPredefinidos.length);
    } catch (error) {
      console.error('❌ Error al cargar planes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPlan = (plan) => {
    setPlanEditando({...plan});
    setMostrarModalEditar(true);
  };

  const handleGuardarPlan = () => {
    if (!planEditando) return;

    const planesActualizados = planes.map(plan => 
      plan.id === planEditando.id ? planEditando : plan
    );
    
    setPlanes(planesActualizados);
    setMostrarModalEditar(false);
    setPlanEditando(null);
    
    alert(`✅ Plan "${planEditando.nombre}" actualizado exitosamente`);
  };

  const handleSeleccionarPlan = (plan) => {
    sessionStorage.setItem('planSeleccionado', JSON.stringify(plan));
    alert(`✅ Plan "${plan.nombre}" seleccionado exitosamente\n\nPrecio: ${formatCurrency(plan.precio)}\nDuración: ${plan.duracion} día(s)`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPlanIcon = (duracion) => {
    if (duracion <= 1) return <Activity size={20} />;
    if (duracion <= 7) return <Clock size={20} />;
    if (duracion <= 15) return <Calendar size={20} />;
    if (duracion <= 30) return <Star size={20} />;
    if (duracion <= 90) return <Shield size={20} />;
    if (duracion <= 180) return <Award size={20} />;
    return <Gift size={20} />;
  };

  if (loading) {
    return (
      <div className="planes-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando planes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="planes-container">
      {/* Header */}
      <div className="planes-header">
        <div className="header-content">
          <h1>Gestión de Planes</h1>
          <p>Administra los planes de membresía disponibles</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/planes/nuevo')}
            className="btn-primary"
          >
            <Plus size={20} />
            Nuevo Plan Personalizado
          </button>

          <div className="header-menu-container">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setMostrarMenuAcciones(!mostrarMenuAcciones);
              }}
              className="header-menu-toggle"
            >
              <span>Acciones</span>
              <ChevronDown size={16} />
            </button>
            
            {mostrarMenuAcciones && (
              <div className="header-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                {menuOpciones.map((opcion) => {
                  const Icono = opcion.icono;
                  return (
                    <button
                      key={opcion.id}
                      onClick={() => {
                        opcion.accion();
                        setMostrarMenuAcciones(false);
                      }}
                      className={`header-menu-item ${opcion.id === 'volver' ? 'item-volver' : ''}`}
                    >
                      <Icono size={16} />
                      <span>{opcion.texto}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Planes Grid */}
      {planes.length > 0 ? (
        <div className="planes-grid">
          {planes.map((plan) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.popular ? 'popular' : ''}`}
            >
              {plan.popular && (
                <div className="popular-badge">MÁS POPULAR</div>
              )}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.nombre}</h3>
                <div className="plan-price-container">
                  <div className="plan-price">{formatCurrency(plan.precio)}</div>
                  <span className="plan-price-period">/plan</span>
                </div>
              </div>

              <div className="plan-duration">
                {getPlanIcon(plan.duracion)}
                <span>{plan.duracion} día{plan.duracion !== 1 ? 's' : ''}</span>
              </div>

              <p className="plan-description">{plan.descripcion}</p>

              <div className="plan-features">
                {plan.features.map((feature, idx) => (
                  <div className="feature" key={idx}>
                    <div className="feature-icon" style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}99)` }}>
                      <Check size={14} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="plan-actions">
                <button 
                  className="plan-btn plan-btn-secondary"
                  onClick={() => handleEditarPlan(plan)}
                >
                  <Edit size={16} />
                  Editar
                </button>
                <button 
                  className="plan-btn plan-btn-primary" 
                  style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}99)` }}
                  onClick={() => handleSeleccionarPlan(plan)}
                >
                  <DollarSign size={16} />
                  Seleccionar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">
            <Calendar size={48} strokeWidth={1.5} />
          </div>
          <h3>No hay planes disponibles</h3>
          <p>No se pudieron cargar los planes</p>
        </div>
      )}

      {/* Planes Personalizados */}
      <div className="planes-section">
        <h2 className="section-title">Planes Personalizados</h2>
        <p className="section-description">Planes creados específicamente para necesidades especiales</p>
        
        <div className="empty-state">
          <div className="empty-icon">
            <Calendar size={48} strokeWidth={1.5} />
          </div>
          <h3>No hay planes personalizados</h3>
          <p>Crea un nuevo plan personalizado para necesidades específicas</p>
          <button 
            onClick={() => navigate('/planes/nuevo')}
            className="btn-primary"
          >
            <Plus size={18} />
            Crear Plan Personalizado
          </button>
        </div>
      </div>

      {/* Modal de Edición - DISEÑO NUEVO Y MEJORADO */}
      {mostrarModalEditar && planEditando && (
        <div className="modal-overlay">
          <div className="modal-editar-plan">
            <div className="modal-header">
              <h2>Editar Plan: {planEditando.nombre}</h2>
              <button 
                className="modal-close"
                onClick={() => setMostrarModalEditar(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Nombre del Plan</label>
                <input
                  type="text"
                  value={planEditando.nombre}
                  onChange={(e) => setPlanEditando({...planEditando, nombre: e.target.value})}
                  className="form-input"
                  placeholder="Ingresa el nombre del plan"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio (COP)</label>
                  <input
                    type="number"
                    value={planEditando.precio}
                    onChange={(e) => setPlanEditando({...planEditando, precio: parseInt(e.target.value) || 0})}
                    className="form-input"
                    placeholder="0"
                  />
                </div>
                <div className="form-group">
                  <label>Duración (días)</label>
                  <input
                    type="number"
                    value={planEditando.duracion}
                    onChange={(e) => setPlanEditando({...planEditando, duracion: parseInt(e.target.value) || 1})}
                    className="form-input"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={planEditando.descripcion}
                  onChange={(e) => setPlanEditando({...planEditando, descripcion: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  placeholder="Describe los beneficios del plan..."
                />
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  id="popular-checkbox"
                  checked={planEditando.popular}
                  onChange={(e) => setPlanEditando({...planEditando, popular: e.target.checked})}
                  className="form-checkbox"
                />
                <label htmlFor="popular-checkbox" className="custom-checkbox"></label>
                <span className="checkbox-label">Marcar como Plan Popular</span>
              </div>

              <div className="features-group">
                <span className="features-label">Características Incluidas</span>
                <span className="features-hint">Escribe cada característica en una línea separada</span>
                <textarea
                  value={planEditando.features.join('\n')}
                  onChange={(e) => setPlanEditando({...planEditando, features: e.target.value.split('\n').filter(f => f.trim())})}
                  className="form-textarea"
                  rows="5"
                  placeholder="Acceso ilimitado al gimnasio&#10;Área de pesas y cardio&#10;Asesoría básica"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setMostrarModalEditar(false)}
              >
                <X size={18} />
                Cancelar
              </button>
              <button 
                className="modal-btn modal-btn-save"
                onClick={handleGuardarPlan}
              >
                <Save size={18} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Planes;