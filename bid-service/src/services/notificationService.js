const axios = require('axios');

class NotificationService {
  async sendNotification(userId, message) {
    try {
      await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications/send`, {
        userId,
        message,
      });
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }
  }
}

module.exports = new NotificationService(); 