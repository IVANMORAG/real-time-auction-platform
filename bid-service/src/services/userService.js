const axios = require('axios');
const logger = require('winston');

class UserService {
  async getUserById(userId, authToken) {
    try {
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/users/${userId}`,
        {
          headers: {
            Authorization: authToken,
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 segundos de timeout
        }
      );

      if (!response.data.success || !response.data.data?.user) {
        logger.warn('Respuesta inesperada del auth service:', response.data);
        return null;
      }

      return response.data.data.user;
    } catch (error) {
      logger.error('Error al obtener usuario del auth service:', {
        userId,
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      return null;
    }
  }

  async getBasicUserInfo(userId, authToken) {
    try {
      const user = await this.getUserById(userId, authToken);
      if (!user) return null;

      // Solo devolver los campos necesarios
      return {
        id: user._id || user.id,
        email: user.email,
        profile: {
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName,
          avatar: user.profile?.avatar
        }
      };
    } catch (error) {
      logger.error('Error en getBasicUserInfo:', error);
      return null;
    }
  }
}

module.exports = new UserService();