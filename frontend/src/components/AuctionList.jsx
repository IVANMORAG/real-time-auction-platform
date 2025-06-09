import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import auctionService from '../services/auctionService';
import LoadingSpinner from './LoadingSpinner';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Depuración: Verifica métodos disponibles
  console.log('auctionService methods:', Object.keys(auctionService));

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        setError(null);
        let response;
        if (statusFilter) {
          if (!auctionService.getAuctionsWithFilters) {
            throw new Error('getAuctionsWithFilters no está definido');
          }
          response = await auctionService.getAuctionsWithFilters(statusFilter);
        } else {
          response = await auctionService.getAllAuctions();
        }

        const auctionsData = response.data?.data || response.data || response || [];
        if (!Array.isArray(auctionsData)) {
          throw new Error('La respuesta del servidor no contiene un arreglo de subastas');
        }
        setAuctions(auctionsData);
      } catch (err) {
        console.error('Error fetching auctions:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Error al cargar las subastas';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [statusFilter]);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subastas</h2>
        <div>
          <label className="mr-2 text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={statusFilter}
            onChange={handleFilterChange}
            className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="active">Activas</option>
            <option value="closed">Cerradas</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.length === 0 ? (
          <p>No hay subastas disponibles para el filtro seleccionado.</p>
        ) : (
          auctions.map((auction) => (
            <div key={auction._id} className="border rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold">{auction.title}</h3>
              <p className="text-gray-600">{auction.description}</p>
              <p className="mt-2">Precio inicial: ${auction.startPrice}</p>
              <p>Estado: {auction.status}</p>
              <p>Finaliza: {new Date(auction.endTime).toLocaleString()}</p>
              <Link
                to={`/auction/${auction._id}`}
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Ver Subasta
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuctionList;