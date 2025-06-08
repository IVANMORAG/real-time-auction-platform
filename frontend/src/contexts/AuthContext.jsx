// contexts/AuthContext.jsx - ACTUALIZADO CON setUser
import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authService.validateToken(token)
        .then(response => {
          if (response.success && response.data && response.data.user) {
            setUser(response.data.user)
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      
      const response = await authService.login(email, password)
      
      if (response.success && response.data) {
        const { token, user } = response.data
        if (token && user) {
          localStorage.setItem('token', token)
          setUser(user)
          return { success: true }
        }
      }
      
      throw new Error('Respuesta inválida del servidor')
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Error en el login'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setError(null)
      setLoading(true)
      
      // Formatear userData CORRECTAMENTE
      const formattedData = {
        email: userData.email,
        password: userData.password,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone || ''
        }
      }
      
      const response = await authService.register(formattedData)
      
      if (response.success && response.data) {
        const { token, user } = response.data
        if (token && user) {
          localStorage.setItem('token', token)
          setUser(user)
          return { success: true }
        }
      }
      
      throw new Error('Respuesta inválida del servidor')
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Error en el registro'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      setError(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  // Función para actualizar el usuario manualmente
  const updateUser = (userData) => {
    setUser(userData)
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
    setUser: updateUser, // Exponer función para actualizar usuario
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}