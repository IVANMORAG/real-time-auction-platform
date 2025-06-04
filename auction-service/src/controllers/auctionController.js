const Auction = require('../models/Auction');
const Category = require('../models/Category');
const ntpService = require('../services/ntpService');
const logger = require('../utils/logger');
const axios = require('axios');

// Crear una subasta
const createAuction = async (req, res) => {
  try {
    const { title, description, startPrice, endTime, categoryId } = req.body;
    const ownerId = req.user.id; // Obtenido del middleware de autenticación

    // Validar categoría
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

    // Validar tiempo con NTP
    const currentTime = await ntpService.getTime();
    if (new Date(endTime) <= currentTime) {
      return res.status(400).json({ error: 'El tiempo de finalización debe ser futuro' });
    }

    const auction = new Auction({
      title,
      description,
      startPrice,
      currentPrice: startPrice,
      endTime,
      ownerId,
      categoryId,
    });

    await auction.save();
    logger.info(`Subasta creada: ${auction._id}`);
    res.status(201).json(auction);
  } catch (error) {
    logger.error('Error creando subasta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar subastas
const getAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate('categoryId')
      .sort({ createdAt: -1 });
    res.json(auctions);
  } catch (error) {
    logger.error('Error listando subastas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener subasta específica
const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate('categoryId');
    if (!auction) return res.status(404).json({ error: 'Subasta no encontrada' });
    res.json(auction);
  } catch (error) {
    logger.error('Error obteniendo subasta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar subasta
const updateAuction = async (req, res) => {
  try {
    const { title, description, endTime, categoryId } = req.body;
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Subasta no encontrada' });

    // Validar propiedad del usuario
    if (auction.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Validar categoría
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Validar tiempo
    if (endTime) {
      const currentTime = await ntpService.getTime();
      if (new Date(endTime) <= currentTime) {
        return res.status(400).json({ error: 'El tiempo de finalización debe ser futuro' });
      }
    }

    auction.title = title || auction.title;
    auction.description = description || auction.description;
    auction.endTime = endTime || auction.endTime;
    auction.categoryId = categoryId || auction.categoryId;

    await auction.save();
    logger.info(`Subasta actualizada: ${auction._id}`);
    res.json(auction);
  } catch (error) {
    logger.error('Error actualizando subasta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cancelar subasta
const cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ error: 'Subasta no encontrada' });

    // Validar propiedad del usuario
    if (auction.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    auction.status = 'cancelled';
    await auction.save();
    logger.info(`Subasta cancelada: ${auction._id}`);
    res.json({ message: 'Subasta cancelada' });
  } catch (error) {
    logger.error('Error cancelando subasta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar subastas por categoría
const getAuctionsByCategory = async (req, res) => {
  try {
    const auctions = await Auction.find({ 
      categoryId: req.params.category, 
      status: 'active' 
    }).populate('categoryId');
    res.json(auctions);
  } catch (error) {
    logger.error('Error listando subastas por categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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