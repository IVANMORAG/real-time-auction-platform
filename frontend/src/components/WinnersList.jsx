import { useState, useEffect } from 'react';
import auctionService from '../services/auctionService';
import LoadingSpinner from './LoadingSpinner';

const WinnersList = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await auctionService.getAuctionWinners(page, limit);
        console.log('Winners response:', response);
        const winnersData = response.data || [];
        if (!Array.isArray(winnersData)) {
          throw new Error('La respuesta del servidor no contiene un arreglo de ganadores');
        }
        setWinners(winnersData);
        setTotalPages(response.pagination?.pages || 1);
      } catch (err) {
        console.error('Error fetching winners:', err.response?.data || err.message);
        setError(err.response?.data?.message || err.message || 'Error al cargar la lista de ganadores');
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Ganadores de Subastas</h2>
      {winners.length === 0 ? (
        <p>No hay ganadores registrados.</p>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subasta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ganador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Final
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {winners.map((winner) => (
                  <tr key={winner.auctionId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {winner.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {winner.winner?.username || winner.winner?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${winner.winningBid || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {winner.endTime ? new Date(winner.endTime).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnersList;