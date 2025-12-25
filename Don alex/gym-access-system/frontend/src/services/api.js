// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Petición:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Error en respuesta:', error.response?.status, error.message);
    
    if (error.response?.status === 401) {
      console.log('🔒 No autorizado - redirigiendo a login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Funciones de autenticación
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verificar: () => api.get('/auth/verificar')
};

// Funciones de usuarios
export const usuariosAPI = {
  listar: () => api.get('/usuarios'),
  obtener: (id) => api.get(`/usuarios/${id}`),
  crear: (formData) => api.post('/usuarios', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  actualizar: (id, formData) => api.put(`/usuarios/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  eliminar: (id) => api.delete(`/usuarios/${id}`)
};

// Funciones de planes
export const planesAPI = {
  listar: () => api.get('/planes'),
  obtener: (id) => api.get(`/planes/${id}`),  // ← Agrega esta línea
  crear: (plan) => api.post('/planes', plan),
  actualizar: (id, plan) => api.put(`/planes/${id}`, plan)
};

// Funciones de accesos
export const accesosAPI = {
  registrar: (huella) => api.post('/accesos/registrar', huella),
  historial: (params) => api.get('/accesos/historial', { params })
};

// Funciones de dashboard - ACTUALIZADO
export const dashboardAPI = {
  estadisticas: () => api.get('/dashboard/estadisticas')
};

// Funciones de ZKTeco
export const zktecoAPI = {
  registrarHuella: (usuarioId) => api.post('/zkteco/registrar-huella', { usuarioId }),
  sincronizarAsistencias: () => api.post('/zkteco/sincronizar-asistencias'),
  verificarEstado: () => api.get('/zkteco/estado')
};
// Función para manejar errores de API de forma consistente
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Error del servidor con respuesta
    const message = error.response.data?.message || error.response.data?.error || 'Error del servidor';
    return message;
  } else if (error.request) {
    // Error de red (sin respuesta)
    return 'Error de conexión. Verifica tu conexión a internet.';
  } else {
    // Otro tipo de error
    return error.message || 'Error inesperado';
  }
};
export default api;