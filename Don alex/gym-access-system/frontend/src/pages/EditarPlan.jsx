
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { planesAPI } from '../services/api';
import { handleApiError } from '../services/api'; 
import { ArrowLeft, Save, X, AlertCircle } from 'lucide-react';
import './Planes.css';
import '../styles/Forms.css';
import "../components/Layout.css";

function EditarPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: 0,
    duracion: 1,
    descripcion: '',
    popular: false,
    features: [],
    color: '#4f46e5'
  });

  // Planes predefinidos para simulación (solo como fallback)
  const planesPredefinidos = [
    {
      id: 'dia',
      nombre: 'Día',
      precio: 6000,
      duracion: 1,
      descripcion: 'Acceso por 1 día',
      popular: false,
      color: '#4f46e5',
      features: ['Acceso limitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica']
    },
    {
      id: 'semana',
      nombre: 'Semana',
      precio: 30000,
      duracion: 7,
      descripcion: 'Acceso por 1 semana',
      popular: false,
      color: '#10b981',
      features: ['Acceso limitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Acceso a duchas']
    },
    {
      id: 'mensual',
      nombre: 'Mensual',
      precio: 65000,
      duracion: 30,
      descripcion: 'Acceso por 1 mes',
      popular: true,
      color: '#ec4899',
      features: ['Acceso limitado al gimnasio', 'Área de pesas y cardio', 'Asesoría básica', 'Lockers incluidos', 'Descuento en suplementos']
    }
  ];

  useEffect(() => {
    cargarPlan();
  }, [id]);

  // En cargarPlan - usa la API real
  const cargarPlan = async () => {
    try {
      setLoading(true);
      setError('');
      
      // PRIMERO intentar cargar desde la API real
      try {
        const response = await planesAPI.obtener(id);
        
        if (response.data.success) {
          const plan = response.data.data;
          setFormData({
            nombre: plan.nombre,
            precio: plan.precio,
            duracion: plan.duracion,
            descripcion: plan.descripcion,
            popular: plan.popular,
            features: plan.features,
            color: plan.color
          });
          return; // Salir si la API respondió correctamente
        }
      } catch (apiError) {
        console.log('API no disponible, usando datos predefinidos:', apiError.message);
      }
      
      // SI FALLA la API, usar datos predefinidos
      const plan = planesPredefinidos.find(p => p.id === id);
      
      if (plan) {
        setFormData({
          nombre: plan.nombre,
          precio: plan.precio,
          duracion: plan.duracion,
          descripcion: plan.descripcion,
          popular: plan.popular,
          features: plan.features,
          color: plan.color
        });
      } else {
        setError('Plan no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar plan:', error);
      const errorMsg = handleApiError(error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setError('');
  };

  const handleFeaturesChange = (e) => {
    const features = e.target.value.split('\n').filter(f => f.trim());
    setFormData(prev => ({ ...prev, features }));
  };

  // En handleSubmit - usa la API real
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones
      if (!formData.nombre.trim()) {
        setError('El nombre del plan es requerido');
        setLoading(false);
        return;
      }

      if (formData.precio <= 0) {
        setError('El precio debe ser mayor a 0');
        setLoading(false);
        return;
      }

      if (formData.duracion <= 0) {
        setError('La duración debe ser mayor a 0');
        setLoading(false);
        return;
      }

      // Preparar datos para la API
      const datosParaAPI = {
        nombre: formData.nombre.trim(),
        precio: Number(formData.precio),
        duracion: Number(formData.duracion),
        descripcion: formData.descripcion.trim(),
        popular: Boolean(formData.popular),
        features: formData.features.filter(f => f.trim()),
        color: formData.color
      };

      console.log('📤 Enviando datos a la API:', datosParaAPI);

      // LLAMADA REAL A LA API
      const response = await planesAPI.actualizar(id, datosParaAPI);
      
      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        navigate('/planes');
      } else {
        throw new Error(response.data.error || 'Error al actualizar el plan');
      }
    } catch (error) {
      console.error('❌ Error al actualizar plan:', error);
      const errorMsg = handleApiError(error);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !formData.nombre) {
    return (
      <div className="form-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-card">
        
        {/* Header */}
        <div className="form-header">
          <button
            type="button"
            onClick={() => navigate('/planes')}
            className="btn-back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Editar Plan</h1>
          <p>Modifica la información del plan de membresía</p>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Información Básica */}
        <div className="form-section">
          <h3 className="form-section-title">Información Básica</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre del Plan *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="input"
                placeholder="Ej: Plan Premium"
              />
            </div>

            <div className="form-field">
              <label>Precio (COP) *</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                required
                min="0"
                className="input"
                placeholder="0"
              />
              <span className="input-hint">
                {formatCurrency(formData.precio)}
              </span>
            </div>

            <div className="form-field">
              <label>Duración (días) *</label>
              <input
                type="number"
                name="duracion"
                value={formData.duracion}
                onChange={handleChange}
                required
                min="1"
                className="input"
                placeholder="30"
              />
              <span className="input-hint">
                {formData.duracion} día{formData.duracion !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="form-field">
              <label>Color del Plan</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="input-color"
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label>Descripción *</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              className="input"
              rows="3"
              placeholder="Describe los beneficios y características del plan..."
            />
          </div>
        </div>

        {/* Configuración Adicional */}
        <div className="form-section">
          <h3 className="form-section-title">Configuración Adicional</h3>
          <div className="checkbox-container large">
            <input
              type="checkbox"
              id="popular"
              name="popular"
              checked={formData.popular}
              onChange={handleChange}
              className="form-checkbox"
            />
            <label htmlFor="popular" className="custom-checkbox"></label>
            <div className="checkbox-content">
              <span className="checkbox-label">Marcar como Plan Popular</span>
              <span className="checkbox-description">
                Este plan se destacará con una etiqueta especial en la lista
              </span>
            </div>
          </div>
        </div>

        {/* Características */}
        <div className="form-section">
          <h3 className="form-section-title">Características Incluidas</h3>
          <div className="form-field full-width">
            <label>Lista de Características *</label>
            <span className="input-hint">
              Escribe cada característica en una línea separada
            </span>
            <textarea
              value={formData.features.join('\n')}
              onChange={handleFeaturesChange}
              required
              className="input"
              rows="6"
              placeholder="Acceso ilimitado al gimnasio&#10;Área de pesas y cardio&#10;Asesoría básica&#10;Lockers incluidos"
            />
          </div>

          {/* Vista previa de características */}
          {formData.features.length > 0 && (
            <div className="features-preview">
              <h4>Vista Previa:</h4>
              <div className="preview-features">
                {formData.features.map((feature, index) => (
                  <div key={index} className="preview-feature">
                    <div 
                      className="preview-feature-icon"
                      style={{ backgroundColor: formData.color }}
                    >
                      ✓
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resumen del Plan */}
        <div className="form-section">
          <h3 className="form-section-title">Resumen del Plan</h3>
          <div className="plan-summary-card">
            <div className="summary-header">
              <h4>{formData.nombre || 'Nombre del Plan'}</h4>
              <div className="summary-price">
                {formatCurrency(formData.precio)}
              </div>
            </div>
            <p className="summary-description">
              {formData.descripcion || 'Descripción del plan...'}
            </p>
            <div className="summary-duration">
              <span>Duración:</span>
              <strong>{formData.duracion} día{formData.duracion !== 1 ? 's' : ''}</strong>
            </div>
            {formData.popular && (
              <div className="summary-badge">
                PLAN POPULAR
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/planes')}
            className="btn-secondary"
            disabled={loading}
          >
            <X size={20} />
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            <Save size={20} />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarPlan;