const express = require('express');
const httpProxy = require('express-http-proxy');
const corsMiddleware = require('./middleware/cors');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./middleware/logger');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(logger);

// Rutas a microservicios
app.use('/api/auth', authRoutes);

// ✅ SOLUCIÓN 1: Usar el mismo router para ambas rutas (recomendado)
app.use('/api', auctionRoutes); // Esto manejará tanto /api/auctions como /api/categories



app.use('/api/bids', bidRoutes);
app.use('/api/notifications', notificationRoutes);

// Ruta de prueba
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'API Gateway is running' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});