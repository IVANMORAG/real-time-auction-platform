const axios = require('axios');

class AuctionService {
  async validateAuction(auctionId) {
    try {
      const response = await axios.get(
        `${process.env.AUCTION_SERVICE_URL}/auctions/${auctionId}`
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to validate auction');
    }
  }
}

module.exports = new AuctionService();