const cors = require('cors');

const corsOptions = {
  origin: ['http://192.168.1.181:3005', 'http://192.168.1.181:3000', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = cors(corsOptions);