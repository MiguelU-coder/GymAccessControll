import "../styles/global-dark.css";  // ✅
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import './Login.css';
import { loginUser } from '../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validación básica
    if (!formData.usuario || !formData.password) {
      setError('Por favor ingrese usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(formData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifique sus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo">
              <div className="logo-icon">💪</div>
              <h1>MUNDO FITNESS</h1>
            </div>
            <p className="subtitle">Sistema de Control de Acceso</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="usuario">
                <i className="fas fa-user"></i> Usuario
              </label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                placeholder="Ingresa tu nombre de usuario"
                disabled={loading}
                className="form-control"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i> Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
                className="form-control"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <button 
              type="submit" 
              className={`login-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i> Iniciando sesión...
                </span>
              ) : (
                <span>
                  <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
                </span>
              )}
            </button>
          </form>

          {/* Credenciales por defecto */}
          <div className="credentials-info">
            <p>Credenciales por defecto:</p>
            <div className="credential-item">
              <strong>Usuario:</strong> admin
            </div>
            <div className="credential-item">
              <strong>Contraseña:</strong> admin123
            </div>
          </div>

          {/* Footer */}
          <div className="login-footer">
            <p>© {new Date().getFullYear()} Mundo Fitness - Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;