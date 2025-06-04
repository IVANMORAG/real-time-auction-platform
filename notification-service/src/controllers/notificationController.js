const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');
const AuthService = require('../services/authService');
const { emitNotification } = require('../services/websocketService');

class NotificationController {
  async getNotifications(req, res, next) {
    try {
      const { userId } = req.params;
      if (userId !== req.user.id) {
        throw { status: 403, message: 'No autorizado para ver estas notificaciones' };
      }
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async sendNotification(req, res, next) {
    try {
      const { userId, type, message } = req.body;

      // Validar usuario
      await AuthService.validateUser(userId);

      // Verificar preferencias
      const settings = await NotificationSettings.findOne({ userId });
      if (settings && !settings.preferences[type]) {
        return res.status(200).json({ message: 'Notificación ignorada por preferencias del usuario' });
      }

      // Crear notificación
      const notification = new Notification({ userId, type, message });
      await notification.save();

      // Emitir por WebSocket
      emitNotification(userId, {
        id: notification._id,
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
      });

      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const notification = await Notification.findById(id);
      if (!notification) {
        throw { status: 404, message: 'Notificación no encontrada' };
      }
      if (notification.userId.toString() !== req.user.id) {
        throw { status: 403, message: 'No autorizado para modificar esta notificación' };
      }
      notification.read = true;
      await notification.save();
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const { userId } = req.user;
      const { preferences } = req.body;
      let settings = await NotificationSettings.findOne({ userId });
      if (!settings) {
        settings = new NotificationSettings({ userId, preferences });
      } else {
        settings.preferences = { ...settings.preferences, ...preferences };
      }
      await settings.save();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();