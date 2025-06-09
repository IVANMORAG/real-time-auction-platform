const Bid = require('../models/Bid');
const BidHistory = require('../models/BidHistory');
const AuctionService = require('../services/auctionService');
const NotificationService = require('../services/notificationService');
const { emitBidUpdate } = require('../services/websocketService');
const UserService = require('../services/userService');
const logger = require('winston');

class BidController {
  async createBid(req, res, next) {
    try {
      const { auctionId, amount } = req.body;
      const userId = req.user.id;

      console.log('📝 Creando puja:', { auctionId, amount, userId });

      // Validar subasta
      const auction = await AuctionService.validateAuction(auctionId);
      console.log('🏛️ Subasta obtenida:', auction);

      // Verificar múltiples posibilidades del campo status
      const auctionStatus = auction.status || auction.state || 'unknown';
      console.log('📊 Status de la subasta:', auctionStatus);

      if (!['active', 'ongoing', 'open'].includes(auctionStatus.toLowerCase())) {
        throw { 
          status: 400, 
          message: `La subasta no está activa. Status actual: ${auctionStatus}` 
        };
      }

      // Validar tiempo de la subasta
      const currentTime = new Date();
      const endTime = new Date(auction.end_time || auction.endTime || auction.end_date);
      const startTime = new Date(auction.start_time || auction.startTime || auction.start_date);
      
      console.log('⏰ Tiempos:', {
        current: currentTime,
        start: startTime,
        end: endTime
      });

      if (currentTime < startTime) {
        throw { status: 400, message: 'La subasta aún no ha comenzado' };
      }

      if (currentTime > endTime) {
        throw { status: 400, message: 'La subasta ha finalizado' };
      }

      // Validar monto de la puja
      const currentHighestBid = (await BidHistory.findOne({ auctionId }))?.highestBid || 
                               auction.start_price || 
                               auction.startPrice || 
                               auction.starting_price || 0;
      
      console.log('💰 Puja más alta actual:', currentHighestBid);

      if (amount <= currentHighestBid) {
        throw { 
          status: 400, 
          message: `El monto de la puja debe ser mayor que ${currentHighestBid}` 
        };
      }

      // Crear puja
      const bid = new Bid({ auctionId, userId, amount });
      await bid.save();

      console.log('✅ Puja creada:', bid);

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
      try {
        await NotificationService.sendNotification(
          auction.owner_id || auction.ownerId || auction.userId,
          `Nueva puja de ${amount} colocada en la subasta ${auctionId}`
        );
      } catch (notificationError) {
        console.error('⚠️ Error enviando notificación:', notificationError);
      }

      // Emitir actualización WebSocket
      try {
        emitBidUpdate(auctionId, {
          bidId: bid._id,
          userId,
          amount,
          timestamp: bid.timestamp,
        });
      } catch (wsError) {
        console.error('⚠️ Error emitiendo WebSocket:', wsError);
      }

      res.status(201).json(bid);
    } catch (error) {
      console.error('❌ Error en createBid:', error);
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

  // En tu bidController.js, modifica la función getBidHistory:
  // Método corregido en el BidController
async getBidHistory(req, res, next) {
  try {
    const { auctionId } = req.params;
    
    console.log(`📊 Obteniendo historial para subasta: ${auctionId}`);
    
    const bidHistory = await BidHistory.findOne({ auctionId });
    
    if (!bidHistory) {
      console.log(`❌ No se encontró historial para subasta: ${auctionId}`);
      
      // ✅ CORRECCIÓN: Devolver un historial vacío en lugar de error 404
      return res.json({
        auctionId: auctionId,
        bidCount: 0,
        highestBid: 0,
        highestBidder: null,
        lastUpdated: null
      });
    }

    console.log(`✅ Historial encontrado:`, {
      bidCount: bidHistory.bidCount,
      highestBid: bidHistory.highestBid,
      highestBidder: bidHistory.highestBidder
    });

    res.json({
      _id: bidHistory._id,
      auctionId: bidHistory.auctionId,
      bidCount: bidHistory.bidCount,
      highestBid: bidHistory.highestBid,
      highestBidder: bidHistory.highestBidder, // Siempre ObjectId
      lastUpdated: bidHistory.lastUpdated
    });
  } catch (error) {
    console.error('❌ Error obteniendo historial de pujas:', error);
    logger.error('Error obteniendo historial de pujas:', error);
    next(error);
  }
}
}

module.exports = new BidController();