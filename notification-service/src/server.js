require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initWebSocket } = require('./services/websocketService');

const PORT = process.env.PORT || 3004;
const server = http.createServer(app);

// Inicializar WebSocket
console.log('🔧 Inicializando servidor WebSocket...');
initWebSocket(server);
console.log('📡 Servidor WebSocket corriendo en ws://localhost:3004');

// Iniciar servidor
const startServer = async () => {
  console.log('🚀 Iniciando Notification Service...');
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 Notification Service corriendo en el puerto ${PORT}`);
    console.log('✅ Todos los servicios inicializados exitosamente');
  });
};

startServer();