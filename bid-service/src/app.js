const express = require('express');
const bidRoutes = require('./routes/bidRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const logger = require('winston');
const apiErrorMiddleware = require('./middleware/apiErrorMiddleware');

const app = express();

// Logger configuration
logger.configure({
  transports: [
    new logger.transports.Console(),
    new logger.transports.File({ filename: 'bid-service.log' }),
  ],
});

// Middleware
app.use(express.json());

// Health check endpoint - AGREGADO
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'bid-service',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/bids', bidRoutes);

app.use(apiErrorMiddleware); // <- Agregar este antes del errorMiddleware general
app.use(errorMiddleware);

module.exports = app;