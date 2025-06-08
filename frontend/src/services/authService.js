// services/authService.js - FRONTEND CORREGIDO
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000'

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  // Login
  async login(email, password) {
    const response = await api.post('/api/auth/login', {
      email,
      password
    })
    return response.data
  },

  // Register - ✅ CORREGIDO: Estructura de datos consistente
  async register(userData) {
    // ✅ Los datos ya vienen en el formato correcto desde AuthContext
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },

  // Logout
  async logout() {
    try {
      await api.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  // Validar token - ✅ CORREGIDO: Usar GET
  async validateToken(token) {
    const response = await api.get('/api/auth/validate-token', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    return response.data
  },

  // Obtener perfil
  async getProfile() {
    const response = await api.get('/api/auth/profile')
    return response.data
  },

  // Actualizar perfil
  async updateProfile(profileData) {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  }
}

export default api