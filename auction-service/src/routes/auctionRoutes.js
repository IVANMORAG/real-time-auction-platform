const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');
const authMiddleware = require('../middleware/authMiddleware');

// TUS RUTAS ORIGINALES (sin cambios)
router.post('/', authMiddleware, auctionController.createAuction);
router.put('/:id', authMiddleware, auctionController.updateAuction);
router.delete('/:id', authMiddleware, auctionController.cancelAuction);

router.get('/', auctionController.getAuctions);
router.get('/:id', auctionController.getAuctionById);
router.get('/category/:category', auctionController.getAuctionsByCategory);

// SOLO AGREGAR ESTAS RUTAS NUEVAS

router.patch('/:id/close', authMiddleware, auctionController.closeAuction);     // Cerrar subasta manualmente
router.get('/winners/list', authMiddleware, auctionController.getAuctionWinners); // Cambié la ruta para evitar conflictos

module.exports = router;