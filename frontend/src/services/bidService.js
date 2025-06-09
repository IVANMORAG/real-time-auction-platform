import api from './authService';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://192.168.1.181:3000';
// ✅ CORREGIDO: Usar HTTP para Socket.IO a través del gateway
const WS_URL = import.meta.env.VITE_WS_BID_URL || 'http://192.168.1.181:3000';

let socket = null;
let currentToken = null;

const bidService = {
  // Set token for WebSocket authentication
  setAuthToken(token) {
    currentToken = token;
  },

  // Initialize WebSocket connection
  initWebSocket(token = null) {
    if (token) {
      currentToken = token;
    }

    // Disconnect existing socket
    if (socket) {
      socket.disconnect();
    }

    console.log('🔌 Connecting to WebSocket:', WS_URL);
    
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'], // Permitir ambos transportes
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: {
        token: currentToken // Enviar token JWT para autenticación
      },
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('🚫 WebSocket connection error:', error);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('🔄❌ WebSocket reconnection error:', error);
    });

    return socket;
  },

  // Join an auction room
  joinAuction(auctionId) {
    if (socket && socket.connected) {
      socket.emit('joinAuction', auctionId);
      console.log(`👥 Joined auction: ${auctionId}`);
    } else {
      console.warn('⚠️ WebSocket not connected, cannot join auction');
      // Intentar reconectar
      if (currentToken) {
        this.initWebSocket(currentToken);
        // Retry after connection
        setTimeout(() => {
          if (socket && socket.connected) {
            socket.emit('joinAuction', auctionId);
          }
        }, 1000);
      }
    }
  },

  // Leave an auction room
  leaveAuction(auctionId) {
    if (socket && socket.connected) {
      socket.emit('leaveAuction', auctionId);
      console.log(`👋 Left auction: ${auctionId}`);
    }
  },

  // Listen for bid updates
  onBidUpdate(callback) {
    if (socket) {
      socket.off('bidUpdate'); // Remove previous listeners
      socket.on('bidUpdate', (data) => {
        console.log('📢 Bid update received:', data);
        callback(data);
      });
    } else {
      console.warn('⚠️ WebSocket not initialized');
    }
  },

  // Listen for auction status updates
  onAuctionUpdate(callback) {
    if (socket) {
      socket.off('auctionUpdate');
      socket.on('auctionUpdate', (data) => {
        console.log('🏛️ Auction update received:', data);
        callback(data);
      });
    }
  },

  // Remove all listeners
  removeAllListeners() {
    if (socket) {
      socket.off('bidUpdate');
      socket.off('auctionUpdate');
    }
  },

  // Create a new bid
  async createBid(auctionId, amount) {
    try {
      console.log('💰 Enviando puja:', { auctionId, amount });
      
      const response = await api.post('/api/bids/', { 
        auctionId, 
        amount: Number(amount) // Asegurar que es número
      });
      
      console.log('✅ Respuesta de createBid:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating bid:', error);
      
      // Manejar diferentes tipos de error
      if (error.response?.data) {
        throw new Error(error.response.data.message || error.response.data.error || 'Error al crear puja');
      }
      throw new Error('Error de conexión al crear puja');
    }
  },

  // Get bids by auction
  async getBidsByAuction(auctionId) {
    try {
      console.log('📋 Obteniendo pujas para subasta:', auctionId);
      const response = await api.get(`/api/bids/auction/${auctionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting bids by auction:', error);
      throw error;
    }
  },

  // Get bids by user
  async getBidsByUser(userId) {
    try {
      console.log('👤 Obteniendo pujas para usuario:', userId);
      const response = await api.get(`/api/bids/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting bids by user:', error);
      throw error;
    }
  },

  // Get bid history
  async getBidHistory(auctionId) {
  try {
    console.log('📊 Obteniendo historial de pujas:', auctionId);
    const response = await api.get(`/api/bids/history/${auctionId}`);
    
    // Manejar respuesta estandarizada
    if (response.data.success) {
      return {
        ...response.data.data,
        success: true
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting bid history:', {
      auctionId,
      error: error.response?.data || error.message
    });
    
    // Retornar estructura consistente incluso en errores
    throw {
      success: false,
      error: error.response?.data?.error || 'Error al obtener historial de pujas',
      details: error.response?.data?.details || error.message
    };
  }
},

  // Check WebSocket connection status
  isConnected() {
    return socket && socket.connected;
  },

  // Get WebSocket ID
  getSocketId() {
    return socket?.id || null;
  },

  // Disconnect WebSocket
  disconnectWebSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('🔌 WebSocket disconnected manually');
    }
  },

  // Reconnect WebSocket
  reconnectWebSocket() {
    if (socket) {
      socket.connect();
      console.log('🔄 Attempting WebSocket reconnection');
    } else if (currentToken) {
      this.initWebSocket(currentToken);
    }
  }
};

export default bidService;