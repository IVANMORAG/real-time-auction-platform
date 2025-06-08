import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import auctionService from '../services/auctionService';

const CategoryForm = ({ onSuccess }) => {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (categoryId) {
      const fetchCategory = async () => {
        try {
          const response = await auctionService.getCategoryById(categoryId);
          setFormData({
            name: response.name || '',
            description: response.description || '',
          });
        } catch (err) {
          console.error('Error fetching category:', err);
          setError('Error al cargar datos de la categoría');
        }
      };

      fetchCategory();
    }
  }, [categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validaciones del cliente
      if (!formData.name.trim()) {
        throw new Error('El nombre es requerido');
      }

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
      };

      let response;
      if (categoryId) {
        response = await auctionService.updateCategory(categoryId, data);
        setSuccess('Categoría actualizada exitosamente');
      } else {
        response = await auctionService.createCategory(data);
        setSuccess('Categoría creada exitosamente');
      }

      // Limpiar formulario si es creación
      if (!categoryId) {
        setFormData({
          name: '',
          description: '',
        });
      }

      // Llamar callback de éxito después de un pequeño delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error saving category:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error al guardar la categoría';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        {categoryId ? 'Actualizar Categoría' : 'Crear Nueva Categoría'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Ej: Deportes"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: Categoría para deportes"
            rows="4"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Guardando...'
              : categoryId
              ? 'Actualizar Categoría'
              : 'Crear Categoría'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;