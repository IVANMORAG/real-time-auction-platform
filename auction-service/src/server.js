const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const auctionRoutes = require('./routes/auctionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/auctions', auctionRoutes);
app.use('/categories', categoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    service: 'auction-service'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  logger.error('Error:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3002;
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Auction Service corriendo en el puerto ${PORT}`);
    logger.info(`🌍 MongoDB conectado: ${mongoose.connection.host}`);
  });
}).catch(err => {
  logger.error('❌ Error al iniciar el servicio:', err);
  process.exit(1);
});