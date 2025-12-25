// src/services/authService.js
import api from './api';

/**
 * Función para iniciar sesión de usuario
 * @param {Object} credentials - Credenciales del usuario (username, password)
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Error en login:', error);
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};

/**
 * Función para cerrar sesión
 */
export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Función para verificar si el usuario está autenticado
 * @returns {Boolean} - True si está autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Función para obtener el usuario actual
 * @returns {Object|null} - Objeto con datos del usuario o null
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error al parsear usuario:', error);
    return null;
  }
};