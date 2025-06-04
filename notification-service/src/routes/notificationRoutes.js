const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/api/notifications/:userId', authMiddleware, NotificationController.getNotifications);
router.post('/api/notifications/send', authMiddleware, NotificationController.sendNotification);
router.put('/api/notifications/:id/read', authMiddleware, NotificationController.markAsRead);
router.put('/api/notifications/settings', authMiddleware, NotificationController.updateSettings);

module.exports = router;