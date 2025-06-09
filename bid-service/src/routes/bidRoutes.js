// API BID-SERVICE - Rutas corregidas
const express = require('express');
const router = express.Router();
const BidController = require('../controllers/bidController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas que requieren autenticación
router.post('/', authMiddleware, BidController.createBid);
router.get('/auction/:auctionId', authMiddleware, BidController.getBidsByAuction);
router.get('/user/:userId', authMiddleware, BidController.getBidsByUser);

// ✅ CORRECCIÓN: Historial SIN authMiddleware para permitir llamadas entre servicios
// Pero con autenticación opcional para usuarios
router.get('/history/:auctionId', (req, res, next) => {
  // Si hay token, validarlo; si no hay, continuar sin autenticación
  const token = req.header('Authorization');
  if (token) {
    return authMiddleware(req, res, next);
  }
  next();
}, BidController.getBidHistory);

module.exports = router;