const Auction = require('../models/Auction');
const Category = require('../models/Category');
const ntpService = require('../services/ntpService');
const logger = require('../utils/logger');
const axios = require('axios');


// Crear una subasta
const createAuction = async (req, res) => {
  try {
    const { title, description, startPrice, start_price, endTime, end_time, categoryId } = req.body;
    const ownerId = req.user.id;

    const price = startPrice || start_price;
    const finalTime = endTime || end_time;

    if (!title || !description || !price || !finalTime || !categoryId) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos',
        success: false 
      });
    }

    if (price <= 0) {
      return res.status(400).json({ 
        error: 'El precio inicial debe ser mayor a 0',
        success: false 
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        error: 'Categoría no encontrada',
        success: false 
      });
    }

    const currentTime = await ntpService.getTime();
    if (new Date(finalTime) <= currentTime) {
      return res.status(400).json({ 
        error: 'El tiempo de finalización debe ser futuro',
        success: false 
      });
    }

    const auction = new Auction({
      title,
      description,
      startPrice: price,
      start_price: price,
      currentPrice: price,
      current_price: price,
      endTime: finalTime,
      end_time: finalTime,
      ownerId,
      owner_id: ownerId,
      categoryId,
      status: 'active',
      // Nuevos campos para tracking del ganador
      winnerId: null,
      winningBid: null,
      isFinalized: false
    });

    await auction.save();
    logger.info(`Subasta creada: ${auction._id}`);
    
    res.status(201).json({
      success: true,
      data: auction,
      message: 'Subasta creada exitosamente'
    });
  } catch (error) {
    logger.error('Error creando subasta:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      success: false 
    });
  }
};

// Listar subastas (TU CÓDIGO ORIGINAL + filtros opcionales)
const getAuctions = async (req, res) => {
  try {
    const { status } = req.query;
    
    // Si no se especifica status, usar tu lógica original (solo activas)
    let filters = { status: 'active' };
    
    // Solo si se pide específicamente otro status, cambiarlo
    if (status) {
      const statusArray = status.split(',');
      filters.status = { $in: statusArray };
    }
    
    const auctions = await Auction.find(filters)
      .populate('categoryId')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: auctions
    });
  } catch (error) {
    logger.error('Error listando subastas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      success: false 
    });
  }
};

// Obtener subasta específica (TU CÓDIGO ORIGINAL)
const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('categoryId');
    if (!auction) {
      return res.status(404).json({ 
        error: 'Subasta no encontrada',
        success: false 
      });
    }
    
    res.json({
      success: true,
      data: auction
    });
  } catch (error) {
    logger.error('Error obteniendo subasta:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      success: false 
    });
  }
};

// Actualizar subasta (sin cambios)
const updateAuction = async (req, res) => {
  try {
    const { title, description, endTime, end_time, categoryId } = req.body;
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ 
        error: 'Subasta no encontrada',
        success: false 
      });
    }

    if (auction.ownerId.toString() !== req.user.id && auction.owner_id?.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'No autorizado',
        success: false 
      });
    }

    if (auction.currentPrice > auction.startPrice || auction.current_price > auction.start_price) {
      return res.status(400).json({ 
        error: 'No se puede actualizar una subasta que ya tiene ofertas',
        success: false 
      });
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ 
          error: 'Categoría no encontrada',
          success: false 
        });
      }
    }

    const finalTime = endTime || end_time;
    if (finalTime) {
      const currentTime = await ntpService.getTime();
      if (new Date(finalTime) <= currentTime) {
        return res.status(400).json({ 
          error: 'El tiempo de finalización debe ser futuro',
          success: false 
        });
      }
    }

    if (title) auction.title = title;
    if (description) auction.description = description;
    if (finalTime) {
      auction.endTime = finalTime;
      auction.end_time = finalTime;
    }
    if (categoryId) auction.categoryId = categoryId;

    await auction.save();
    logger.info(`Subasta actualizada: ${auction._id}`);
    
    res.json({
      success: true,
      data: auction,
      message: 'Subasta actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error actualizando subasta:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      success: false 
    });
  }
};

// Cancelar subasta (sin cambios significativos)
const cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ 
        error: 'Subasta no encontrada',
        success: false 
      });
    }

    if (auction.ownerId.toString() !== req.user.id && auction.owner_id?.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'No autorizado',
        success: false 
      });
    }

    if (auction.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'La subasta ya está cancelada',
        success: false 
      });
    }

    if (auction.status === 'closed') {
      return res.status(400).json({ 
        error: 'No se puede cancelar una subasta cerrada',
        success: false 
      });
    }

    auction.status = 'cancelled';
    await auction.save();
    logger.info(`Subasta cancelada: ${auction._id}`);
    
    res.json({
      success: true,
      message: 'Subasta cancelada exitosamente'
    });
  } catch (error) {
    logger.error('Error cancelando subasta:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      success: false 
    });
  }
};

// NUEVA FUNCIÓN: Cerrar subasta manualmente
const closeAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ 
        error: 'Subasta no encontrada',
        success: false 
      });
    }

    // Solo el dueño puede cerrar manualmente
    if (auction.ownerId.toString() !== req.user.id && auction.owner_id?.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'No autorizado',
        success: false 
      });
    }

    if (auction.status !== 'active') {
      return res.status(400).json({ 
        error: 'Solo se pueden cerrar subastas activas',
        success: false 
      });
    }

    // Obtener información del ganador
    await finalizeAuction(auction._id);
    
    res.json({
      success: true,
      message: 'Subasta cerrada exitosamente'
    });
  } catch (error) {
    logger.error('Error cerrando subasta:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      success: false 
    });
  }
};

// NUEVA FUNCIÓN: Finalizar subasta y determinar ganador
const finalizeAuction = async (auctionId) => {
  try {
    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== 'active') return;

    // Llamar al bid-service para obtener el historial de pujas
    try {
      const response = await axios.get(`${process.env.BID_SERVICE_URL}/bids/history/${auctionId}`);
      
      if (response.data?.highestBidder && response.data?.highestBid) {
        auction.winnerId = response.data.highestBidder;
        auction.winningBid = response.data.highestBid;
        auction.currentPrice = response.data.highestBid;
      }
    } catch (bidError) {
      logger.error('Error obteniendo historial de pujas:', bidError);
      // Continuar aunque falle para cerrar la subasta de todos modos
    }

    auction.status = 'closed';
    auction.isFinalized = true;
    await auction.save();
    
    return auction;
  } catch (error) {
    logger.error('Error finalizando subasta:', error);
    throw error;
  }
};

// NUEVA FUNCIÓN: Obtener resumen de ganadores
const getAuctionWinners = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const auctions = await Auction.find({ 
      status: 'closed',
      winnerId: { $exists: true, $ne: null }
    })
    .populate('winnerId', 'email username')
    .populate('categoryId', 'name')
    .sort({ endTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Auction.countDocuments({ 
      status: 'closed',
      winnerId: { $exists: true, $ne: null }
    });

    const winners = auctions.map(auction => ({
      auctionId: auction._id,
      title: auction.title,
      category: auction.categoryId?.name,
      winner: auction.winnerId,
      winningBid: auction.winningBid,
      endTime: auction.endTime,
      startPrice: auction.startPrice
    }));

    res.json({
      success: true,
      data: winners,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error obteniendo ganadores:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      success: false 
    });
  }
};

// Listar subastas por categoría (TU CÓDIGO ORIGINAL)
const getAuctionsByCategory = async (req, res) => {
  try {
    const auctions = await Auction.find({ 
      categoryId: req.params.category, 
      status: 'active' 
    }).populate('categoryId');
    
    res.json({
      success: true,
      data: auctions
    });
  } catch (error) {
    logger.error('Error listando subastas por categoría:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      success: false 
    });
  }
};

module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  cancelAuction,
  closeAuction,        // NUEVA
  finalizeAuction,     // NUEVA
  getAuctionWinners,   // NUEVA
  getAuctionsByCategory,
};