const Bid = require('../models/Bid');
const BidHistory = require('../models/BidHistory');
const AuctionService = require('../services/auctionService');
const NotificationService = require('../services/notificationService');
const { emitBidUpdate } = require('../services/websocketService');

class BidController {
  async createBid(req, res, next) {
    try {
      const { auctionId, amount } = req.body;
      const userId = req.user.id;

      // Validar subasta
      const auction = await AuctionService.validateAuction(auctionId);
      if (auction.status !== 'active') {
        throw { status: 400, message: 'La subasta no está activa' };
      }

      // Validar monto de la puja
      const currentHighestBid = (await BidHistory.findOne({ auctionId }))?.highestBid || auction.start_price;
      if (amount <= currentHighestBid) {
        throw { status: 400, message: 'El monto de la puja debe ser mayor que la puja más alta actual' };
      }

      // Validar tiempo de la subasta
      const currentTime = new Date();
      if (currentTime > new Date(auction.end_time)) {
        throw { status: 400, message: 'La subasta ha finalizado' };
      }

      // Crear puja
      const bid = new Bid({ auctionId, userId, amount });
      await bid.save();

      // Actualizar historial de pujas
      let bidHistory = await BidHistory.findOne({ auctionId });
      if (!bidHistory) {
        bidHistory = new BidHistory({ auctionId, bidCount: 0, highestBid: 0 });
      }
      bidHistory.bidCount += 1;
      bidHistory.highestBid = amount;
      bidHistory.highestBidder = userId;
      bidHistory.lastUpdated = new Date();
      await bidHistory.save();

      // Enviar notificación
      await NotificationService.sendNotification(
        auction.owner_id,
        `Nueva puja de ${amount} colocada en la subasta ${auctionId}`
      );

      // Emitir actualización WebSocket
      emitBidUpdate(auctionId, {
        bidId: bid._id,
        userId,
        amount,
        timestamp: bid.timestamp,
      });

      res.status(201).json(bid);
    } catch (error) {
      next(error);
    }
  }

  async getBidsByAuction(req, res, next) {
    try {
      const { auctionId } = req.params;
      const bids = await Bid.find({ auctionId }).sort({ timestamp: -1 });
      res.json(bids);
    } catch (error) {
      next(error);
    }
  }

  async getBidsByUser(req, res, next) {
    try {
      const { userId } = req.params;
      const bids = await Bid.find({ userId }).sort({ timestamp: -1 });
      res.json(bids);
    } catch (error) {
      next(error);
    }
  }

  async getBidHistory(req, res, next) {
    try {
      const { auctionId } = req.params;
      const bidHistory = await BidHistory.findOne({ auctionId }).populate('highestBidder', 'email');
      if (!bidHistory) {
        throw { status: 404, message: 'Historial de pujas no encontrado' };
      }
      res.json(bidHistory);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BidController();