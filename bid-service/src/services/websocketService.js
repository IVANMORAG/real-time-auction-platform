const socketIo = require('socket.io');

let io;

const initWebSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // ✅ AGREGAR ESTE LOG PARA CONFIRMAR INICIALIZACIÓN
  console.log('🚀 WebSocket service initialized successfully');
  
  io.on('connection', (socket) => {
    console.log('🔗 New WebSocket connection:', socket.id);
    
    socket.on('joinAuction', (auctionId) => {
      socket.join(auctionId);
      console.log(`👥 Client ${socket.id} joined auction ${auctionId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  // ✅ OPCIONAL: LOG ADICIONAL CON MÁS DETALLES
  console.log('📡 WebSocket server listening for connections...');
};

const emitBidUpdate = (auctionId, bidData) => {
  if (io) {
    io.to(auctionId).emit('bidUpdate', bidData);
    console.log(`📢 Bid update emitted to auction ${auctionId}:`, bidData);
  } else {
    console.warn('⚠️  WebSocket not initialized, cannot emit bid update');
  }
};

module.exports = { initWebSocket, emitBidUpdate };