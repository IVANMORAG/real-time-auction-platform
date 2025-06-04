const express = require('express');
const httpProxy = require('express-http-proxy');
const { NOTIFICATION_SERVICE_URL } = require('../config/env');

const router = express.Router();

// Preservar el prefijo /api/notifications al enrutar
router.use('/', httpProxy(NOTIFICATION_SERVICE_URL, {
  proxyReqPathResolver: (req) => {
    return `/api/notifications${req.url}`;
  }
}));

module.exports = router;