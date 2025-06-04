const mongoose = require('mongoose');

const bidHistorySchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Auction',
  },
  bidCount: {
    type: Number,
    required: true,
    default: 0,
  },
  highestBid: {
    type: Number,
    required: true,
    default: 0,
  },
  highestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('BidHistory', bidHistorySchema);