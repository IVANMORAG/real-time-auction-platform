const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startPrice: { type: Number, required: true, min: 0 },
  currentPrice: { type: Number, default: 0 },
  endTime: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['active', 'closed', 'cancelled'], 
    default: 'active' 
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Auction', auctionSchema);