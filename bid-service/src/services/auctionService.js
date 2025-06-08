const axios = require('axios');

class AuctionService {
  async validateAuction(auctionId) {
    try {
      console.log('🔍 Validando subasta:', auctionId);
      
      // CORREGIDO: Usar GATEWAY_URL si está disponible, sino AUCTION_SERVICE_URL directamente
      const baseUrl = process.env.GATEWAY_URL || process.env.AUCTION_SERVICE_URL;
      const auctionUrl = process.env.GATEWAY_URL 
        ? `${baseUrl}/api/auctions/${auctionId}`  // A través del gateway
        : `${baseUrl}/auctions/${auctionId}`;     // Directamente al servicio
        
      console.log('🎯 Obteniendo subasta desde:', auctionUrl);
      
      const response = await axios.get(auctionUrl, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Respuesta del auction service:', {
        status: response.status,
        data: response.data
      });

      // Verificar si la respuesta viene envuelta en un objeto success/data
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }

      // Si viene directamente el objeto de la subasta
      return response.data;
      
    } catch (error) {
      console.error('❌ Error validando subasta:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      });

      // Si es un error de conexión
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw { status: 503, message: 'No se puede conectar al servicio de subastas' };
      }

      if (error.response?.status === 404) {
        throw { status: 404, message: 'Subasta no encontrada' };
      }

      throw { status: 500, message: 'Error al validar la subasta' };
    }
  }

  async checkConnection() {
    try {
      const baseUrl = process.env.GATEWAY_URL || process.env.AUCTION_SERVICE_URL;
      const healthUrl = process.env.GATEWAY_URL 
        ? `${baseUrl}/health`           // Gateway health
        : `${baseUrl}/health`;          // Servicio directo
        
      const response = await axios.get(healthUrl, {
        timeout: 5000
      });
      
      return { connected: true, status: response.status };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
}

module.exports = new AuctionService();