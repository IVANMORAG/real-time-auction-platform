const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const auctionRoutes = require('./routes/auctionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
require('dotenv').config();

// ✅ 1. Importar el scheduler
const auctionScheduler = require('./services/auctionScheduler');

const app = express();

// Configura CORS explícitamente
app.use(cors({
  origin: 'http://192.168.1.181:3005',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Rutas
app.use('/auctions', auctionRoutes);
app.use('/categories', categoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    service: 'auction-service',
    // ✅ 2. Opcional: Agregar estado del scheduler
    schedulerStatus: auctionScheduler.getStats()
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
  const server = app.listen(PORT, () => {
    logger.info(`🚀 Auction Service corriendo en el puerto ${PORT}`);
    logger.info(`🌍 MongoDB conectado: ${mongoose.connection.host}`);
    
    // ✅ 3. Iniciar el scheduler cuando la DB esté conectada
    auctionScheduler.start();
    logger.info('⏰ Auction Scheduler iniciado');
  });

  // ✅ 4. Manejo de cierre graceful
  const gracefulShutdown = () => {
    logger.info('🛑 Cerrando servidor...');
    auctionScheduler.stop();
    server.close(() => {
      logger.info('🔌 Servidor desconectado');
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

}).catch(err => {
  logger.error('❌ Error al iniciar el servicio:', err);
  process.exit(1);
});