const Category = require('../models/Category');
const Auction = require('../models/Auction');
const logger = require('../utils/logger');

// Crear una categoría (Protegido)
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Verificar si la categoría ya existe
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }

    const category = new Category({
      name,
      description,
    });

    await category.save();
    logger.info(`Categoría creada: ${category._id}`);
    res.status(201).json(category);
  } catch (error) {
    logger.error('Error creando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Listar todas las categorías (Público)
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    logger.error('Error listando categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener categoría por ID (Público)
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    logger.error('Error obteniendo categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar categoría (Protegido)
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

    // Verificar si el nuevo nombre ya existe
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ error: 'El nombre de la categoría ya existe' });
      }
    }

    category.name = name || category.name;
    category.description = description || category.description;

    await category.save();
    logger.info(`Categoría actualizada: ${category._id}`);
    res.json(category);
  } catch (error) {
    logger.error('Error actualizando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar categoría (Protegido)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });

    // Verificar si hay subastas asociadas
    const auctions = await Auction.find({ categoryId: req.params.id });
    if (auctions.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar la categoría porque tiene subastas asociadas' });
    }

    await category.deleteOne();
    logger.info(`Categoría eliminada: ${category._id}`);
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    logger.error('Error eliminando categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};