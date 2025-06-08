import { useState, useEffect } from 'react';
import auctionService from '../services/auctionService';
import { useAuth } from '../contexts/AuthContext';

const AuctionForm = ({ auctionId, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startPrice: '',
    endTime: '',
    categoryId: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await auctionService.getAllCategories();
        setCategories(response);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Error al cargar categorías');
      }
    };

    fetchCategories();

    if (auctionId) {
      const fetchAuction = async () => {
        try {
          const response = await auctionService.getAuctionById(auctionId);
          const endTime = response.endTime || response.end_time;
          setFormData({
            title: response.title || '',
            description: response.description || '',
            startPrice: response.startPrice || response.start_price || '',
            endTime: endTime
              ? new Date(endTime).toISOString().slice(0, 16)
              : '',
            categoryId: response.categoryId || '',
          });
        } catch (err) {
          console.error('Error fetching auction:', err);
          setError('Error al cargar datos de la subasta');
        }
      };

      fetchAuction();
    }
  }, [auctionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validaciones del cliente
      if (!formData.title.trim()) {
        throw new Error('El título es requerido');
      }

      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida');
      }

      if (!formData.startPrice || parseFloat(formData.startPrice) <= 0) {
        throw new Error('El precio inicial debe ser mayor a 0');
      }

      if (!formData.endTime) {
        throw new Error('La fecha de finalización es requerida');
      }

      if (!formData.categoryId) {
        throw new Error('Debe seleccionar una categoría');
      }

      // Validar que la fecha sea futura
      const endDate = new Date(formData.endTime);
      const now = new Date();
      if (isNaN(endDate.getTime())) {
        throw new Error('La fecha de finalización no es válida');
      }
      if (endDate <= now) {
        throw new Error('La fecha de finalización debe ser futura');
      }

      const data = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startPrice: parseFloat(formData.startPrice),
        endTime: endDate.toISOString(),
        categoryId: formData.categoryId,
      };

      let response;
      if (auctionId) {
        response = await auctionService.updateAuction(auctionId, data);
        setSuccess('Subasta actualizada exitosamente');
      } else {
        response = await auctionService.createAuction(data);
        setSuccess('Subasta creada exitosamente');
      }

      // Limpiar formulario si es creación
      if (!auctionId) {
        setFormData({
          title: '',
          description: '',
          startPrice: '',
          endTime: '',
          categoryId: '',
        });
      }

      // Llamar callback de éxito después de un pequeño delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Error saving auction:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Error al guardar la subasta';
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
        {auctionId ? 'Actualizar Subasta' : 'Crear Nueva Subasta'}
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
            Título *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Ej: Subasta de balón de fútbol"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Ej: Balón de fútbol autografiado por un jugador famoso"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio inicial (USD) *
          </label>
          <input
            type="number"
            name="startPrice"
            value={formData.startPrice}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            placeholder="Ej: 100"
            min="0.01"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de finalización *
          </label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            min={new Date().toISOString().slice(0, 16)} // Evita fechas pasadas
          />
          <p className="mt-1 text-sm text-gray-500">
            Selecciona una fecha y hora futuras (formato: AAAA-MM-DD HH:MM)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Guardando...'
              : auctionId
              ? 'Actualizar Subasta'
              : 'Crear Subasta'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuctionForm;