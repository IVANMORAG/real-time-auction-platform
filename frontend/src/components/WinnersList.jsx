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

        // Verificar que la respuesta tenga la estructura esperada
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error('La respuesta del servidor no contiene un arreglo de ganadores');
        }

        // Mapear los datos para asegurar la estructura esperada
        const formattedWinners = response.data.map(auction => ({
          auctionId: auction.auctionId || auction._id,
          title: auction.title || 'Subasta sin título',
          winner: auction.winner
            ? {
                id: auction.winner._id,
                email: auction.winner.email,
                username: auction.winner.username,
                profile: auction.winner.profile || {} // Asegurar que profile exista
              }
            : null,
          winningBid: auction.winningBid || 0,
          endTime: auction.endTime || null
        }));

        setWinners(formattedWinners);
        setTotalPages(response.pagination?.pages || 1);
      } catch (err) {
        console.error('Error fetching winners:', err);
        setError(err.error || err.message || 'Error al cargar la lista de ganadores');
      } finally {
        setLoading(false);
      }
    };

    fetchWinners();
  }, [page]);

  const handleNextPage = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(prev => prev - 1);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Ganadores de Subastas</h2>
      {winners.length === 0 ? (
        <p className="text-gray-500 text-center">No hay subastas finalizadas con ganadores aún.</p>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg shadow overflow-hidden">
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
                    Fecha de Cierre
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {winners.map((auction) => (
                  <tr key={auction.auctionId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {auction.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {auction.winner ? (
                        <div>
                          <p className="font-medium text-gray-900">
                            {auction.winner.profile?.firstName || auction.winner.username} {auction.winner.profile?.lastName || ''}
                          </p>
                          <p>{auction.winner.email}</p>
                        </div>
                      ) : (
                        'No hubo pujas'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {auction.winningBid ? `$${auction.winningBid.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {auction.endTime ? new Date(auction.endTime).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded ${page === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WinnersList;