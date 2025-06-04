const axios = require('axios');

class AuthService {
  async validateUser(userId) {
    try {
      const response = await axios.get(
        `${process.env.AUTH_SERVICE_URL}/api/auth/profile`,
        {
          headers: {
            Authorization: `Bearer ${process.env.JWT_SECRET}`,
          },
          params: { userId },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Error al validar usuario: ${error.message}`);
    }
  }
}

module.exports = new AuthService();