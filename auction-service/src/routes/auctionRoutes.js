const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas protegidas
router.post('/', authMiddleware, auctionController.createAuction);
router.put('/:id', authMiddleware, auctionController.updateAuction);
router.delete('/:id', authMiddleware, auctionController.cancelAuction);

// Rutas públicas
router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);
router.get('/category/:category', auctionController.getAuctionsByCategory);

module.exports = router;