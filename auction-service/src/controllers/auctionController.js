const Auction = require('../models/Auction');
const Category = require('../models/Category');
const ntpService = require('../services/ntpService');
const logger = require('../utils/logger');

// Crear una subasta
const createAuction = async (req, res) => {
  try {
    const { title, description, startPrice, start_price, endTime, end_time, categoryId } = req.body;
    const ownerId = req.user.id; // Obtenido del middleware de autenticación

    // Normalizar campos - aceptar tanto startPrice como start_price
    const price = startPrice || start_price;
    const finalTime = endTime || end_time;

    // Validaciones
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

    // Validar categoría
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ 
        error: 'Categoría no encontrada',
        success: false 
      });
    }

    // Validar tiempo con NTP
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
      start_price: price, // Mantener compatibilidad
      currentPrice: price,
      current_price: price, // Mantener compatibilidad
      endTime: finalTime,
      end_time: finalTime, // Mantener compatibilidad
      ownerId,
      owner_id: ownerId, // Mantener compatibilidad
      categoryId,
      status: 'active'
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

// Listar subastas
const getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
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

// Obtener subasta específica
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

// Actualizar subasta
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

    // Validar propiedad del usuario
    if (auction.ownerId.toString() !== req.user.id && auction.owner_id?.toString() !== req.user.id) {
      return res.status(403).json({ 
        error: 'No autorizado',
        success: false 
      });
    }

    // No permitir actualizar si hay ofertas
    if (auction.currentPrice > auction.startPrice || auction.current_price > auction.start_price) {
      return res.status(400).json({ 
        error: 'No se puede actualizar una subasta que ya tiene ofertas',
        success: false 
      });
    }

    // Validar categoría si se proporciona
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ 
          error: 'Categoría no encontrada',
          success: false 
        });
      }
    }

    // Validar tiempo si se proporciona
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

    // Actualizar campos
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

// Cancelar subasta
const cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ 
        error: 'Subasta no encontrada',
        success: false 
      });
    }

    // Validar propiedad del usuario
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

// Listar subastas por categoría
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
  getAuctionsByCategory,
};