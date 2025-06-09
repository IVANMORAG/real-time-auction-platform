const logger = require('winston');

function apiErrorMiddleware(error, req, res, next) {
  if (error.isAxiosError) {
    // Error de conexión con otro servicio
    logger.error('Error en comunicación con servicio externo:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message
    });

    return res.status(502).json({
      success: false,
      error: 'Error de comunicación con un servicio requerido',
      details: error.response?.data || error.message
    });
  }

  // Pasar al siguiente middleware de error si no es un error de API
  next(error);
}

module.exports = apiErrorMiddleware;