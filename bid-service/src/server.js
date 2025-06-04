require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { initWebSocket } = require('./services/websocketService');

const PORT = process.env.PORT || 3003;
const server = http.createServer(app);

// Start server
const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();
    
    // Inicializar WebSocket
    console.log('🔧 Initializing WebSocket service...');
    initWebSocket(server);
    
    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🚀 Bid Service running on port ${PORT}`);
      console.log(`📡 WebSocket server running on ws://localhost:${PORT}`);
      console.log('✅ All services initialized successfully');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();