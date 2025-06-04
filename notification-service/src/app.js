const express = require('express');
const notificationRoutes = require('./routes/notificationRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');
const logger = require('winston');

const app = express();

// Configuración de logger
console.log('🔧 Configurando logger de Winston...');
logger.configure({
  transports: [
    new logger.transports.Console(),
    new logger.transports.File({ filename: 'notification-service.log' }),
  ],
});
console.log('✅ Logger de Winston configurado exitosamente');

// Middleware
console.log('🔧 Configurando middleware...');
app.use(express.json());
console.log('✅ Middleware JSON configurado');

// Rutas
console.log('🔧 Montando rutas de notificaciones...');
app.use('/', notificationRoutes);
console.log('✅ Rutas de notificaciones montadas');

// Manejo de errores
console.log('🔧 Configurando middleware de errores...');
app.use(errorMiddleware);
console.log('✅ Middleware de errores configurado');

module.exports = app;