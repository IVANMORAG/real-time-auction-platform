const express = require('express');
const httpProxy = require('express-http-proxy');
const { BID_SERVICE_URL } = require('../config/env');

const router = express.Router();

// ✅ SOLUCIÓN: Mapear correctamente las rutas
router.use('/', httpProxy(BID_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    // Si viene /api/bids/auction/123, transformar a /bids/auction/123
    // req.url aquí solo contiene la parte después de /api/bids
    return `/bids${req.url}`;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    // Mantener headers importantes
    return proxyReqOpts;
  }
}));

module.exports = router;