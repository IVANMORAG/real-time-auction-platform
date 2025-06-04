const axios = require('axios');

const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const response = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/api/auth/validate-token`,
      { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Respuesta completa del auth service:', response.data);

    if (!response.data.success || !response.data.data?.user) {
      throw new Error('Respuesta de validación inválida');
    }

    req.user = {
      id: response.data.data.user._id,
      ...response.data.data.user
    };
    
    next();
  } catch (error) {
    console.error('Error detallado:', {
      message: error.message,
      responseData: error.response?.data,
      config: error.config
    });
    
    res.status(401).json({ 
      error: 'Token inválido',
      details: error.response?.data?.message || error.message
    });
  }
};

module.exports = authMiddleware;