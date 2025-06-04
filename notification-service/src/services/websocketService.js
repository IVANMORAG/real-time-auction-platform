const socketIo = require('socket.io');

let io;

const initWebSocket = (server) => {
  console.log('🔧 Inicializando servicio WebSocket...');
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  console.log('🚀 Servicio WebSocket inicializado exitosamente');
  console.log('📡 Servidor WebSocket escuchando conexiones...');

  io.on('connection', (socket) => {
    console.log(`🔗 Nueva conexión WebSocket: ${socket.id}`);

    socket.on('joinUser', (userId) => {
      socket.join(userId);
      console.log(`✅ Cliente ${socket.id} se unió al usuario ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
  });
};

const emitNotification = (userId, notification) => {
  if (io) {
    console.log(`📩 Enviando notificación a usuario ${userId}`);
    io.to(userId).emit('notification', notification);
  } else {
    console.warn('⚠️ WebSocket no inicializado, notificación no enviada');
  }
};

module.exports = { initWebSocket, emitNotification };