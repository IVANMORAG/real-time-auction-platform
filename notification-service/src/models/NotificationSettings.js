const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true,
  },
  preferences: {
    newBid: { type: Boolean, default: true },
    auctionEnded: { type: Boolean, default: true },
    auctionCancelled: { type: Boolean, default: true },
    general: { type: Boolean, default: true },
  },
});

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);