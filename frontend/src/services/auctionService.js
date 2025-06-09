import api from './authService';

const auctionService = {
  // Create a new auction
  async createAuction(auctionData) {
    try {
      const response = await api.post('/api/auctions/', auctionData);
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating auction:', error);
      throw error;
    }
  },

  // Get all auctions
  async getAllAuctions() {
    try {
      const response = await api.get('/api/auctions/');
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching auctions:', error);
      throw error;
    }
  },

  // Get auctions with filter support
  async getAuctionsWithFilters(status = null) {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/api/auctions/', { params });
      
      if (response.data.success) {
        return response.data.data || [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching auctions with filters:', error);
      throw error;
    }
  },

  // Get auction by ID  
  async getAuctionById(id) {
    try {
      const response = await api.get(`/api/auctions/${id}`);
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching auction:', error);
      throw error;
    }
  },

  // Update auction
  async updateAuction(id, auctionData) {
    try {
      const response = await api.put(`/api/auctions/${id}`, auctionData);
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating auction:', error);
      throw error;
    }
  },

  // Delete auction (cancel)
  async deleteAuction(id) {
    try {
      const response = await api.delete(`/api/auctions/${id}`);
      
      // Manejar respuesta del backend que puede tener formato { success, message }
      if (response.data.success) {
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error cancelling auction:', error);
      throw error;
    }
  },

  // *** NUEVA FUNCIÓN: Cerrar subasta manualmente ***
  async closeAuction(id) {
    try {
      const response = await api.patch(`/api/auctions/${id}/close`);
      
      if (response.data.success) {
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error closing auction:', error);
      throw error;
    }
  },

  // *** NUEVA FUNCIÓN: Obtener lista de ganadores ***
  async getAuctionWinners(page = 1, limit = 10) {
  try {
    const response = await api.get('/api/auctions/winners/list', {
      params: { page, limit }
    });

    // Manejar respuesta estandarizada
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || { page: 1, limit, total: 0, pages: 1 }
      };
    }

    return {
      success: false,
      data: [],
      pagination: { page: 1, limit, total: 0, pages: 1 }
    };
  } catch (error) {
    console.error('Error fetching auction winners:', error);
    throw {
      success: false,
      error: error.response?.data?.error || 'Error al obtener ganadores',
      details: error.response?.data?.details || error.message
    };
  }
},

  // Get auctions by category
  async getAuctionsByCategory(category) {
    try {
      const response = await api.get(`/api/auctions/category/${category}`);
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching auctions by category:', error);
      throw error;
    }
  },

  // Create category
  async createCategory(categoryData) {
    try {
      const response = await api.post('/api/categories/', categoryData);
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Get all categories
  async getAllCategories() {
    try {
      const response = await api.get('/api/categories/');
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get category by ID
  async getCategoryById(id) {
    try {
      const response = await api.get(`/api/categories/${id}`);
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  },

  // Update category
  async updateCategory(id, categoryData) {
    try {
      const response = await api.put(`/api/categories/${id}`, categoryData);
      
      // Manejar respuesta del backend que puede tener formato { success, data }
      if (response.data.success) {
        return response.data.data || response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(id) {
    try {
      const response = await api.delete(`/api/categories/${id}`);
      
      // Manejar respuesta del backend que puede tener formato { success, message }
      if (response.data.success) {
        return response.data;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

export default auctionService;