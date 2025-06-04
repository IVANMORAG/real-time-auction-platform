const express = require('express');
const router = express.Router();
const BidController = require('../controllers/bidController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, BidController.createBid);
router.get('/auction/:auctionId', authMiddleware, BidController.getBidsByAuction);
router.get('/user/:userId', authMiddleware, BidController.getBidsByUser);
router.get('/history/:auctionId', authMiddleware, BidController.getBidHistory);

module.exports = router;