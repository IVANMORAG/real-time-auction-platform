import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import auctionService from '../services/auctionService';
import bidService from '../services/bidService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Auction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(false); // New state for closing action

  useEffect(() => {
    const socket = bidService.initWebSocket();

    const fetchAuctionData = async () => {
      try {
        const [auctionData, bidData] = await Promise.all([
          auctionService.getAuctionById(id),
          bidService.getBidsByAuction(id),
        ]);
        setAuction(auctionData);
        setBids(bidData);
        bidService.joinAuction(id);
      } catch (err) {
        setError('Error al cargar datos de la subasta');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionData();

    bidService.onBidUpdate((bidData) => {
      setBids((prev) => [...prev, bidData]);
    });

    return () => bidService.disconnectWebSocket();
  }, [id]);

  const handleBid = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await bidService.createBid(id, parseFloat(bidAmount));
      setBidAmount('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al realizar la oferta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de cancelar esta subasta?')) {
      try {
        await auctionService.deleteAuction(id);
        navigate('/dashboard');
      } catch (err) {
        setError('Error al cancelar la subasta');
      }
    }
  };

  const handleCloseAuction = async () => {
    if (window.confirm('¿Estás seguro de cerrar esta subasta? Esta acción no se puede deshacer.')) {
      try {
        setClosing(true);
        setError(null);
        await auctionService.closeAuction(id);
        setAuction((prev) => ({ ...prev, status: 'closed' }));
        alert('Subasta cerrada exitosamente');
      } catch (err) {
        setError('Error al cerrar la subasta');
      } finally {
        setClosing(false);
      }
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!auction) return <div>Subasta no encontrada</div>;

  const isOwner = user && user.id === (auction.ownerId || auction.owner_id);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{auction.title}</h2>
      <p className="text-gray-600 mb-4">{auction.description}</p>
      <p>Precio inicial: ${auction.startPrice}</p>
      <p>Estado: {auction.status}</p>
      <p>Finaliza: {new Date(auction.endTime).toLocaleString()}</p>

      {isOwner && auction.status === 'active' && (
        <div className="mt-4 flex gap-4">
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancelar Subasta
          </button>
          <button
            onClick={handleCloseAuction}
            disabled={closing}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 disabled:bg-gray-400"
          >
            {closing ? 'Cerrando...' : 'Cerrar Subasta'}
          </button>
        </div>
      )}

      {!isOwner && auction.status === 'active' && (
        <form onSubmit={handleBid} className="mt-6">
          <div className="flex gap-4">
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder="Ingresa tu oferta"
              className="border rounded-md p-2 flex-grow"
              min="0"
              step="0.01"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Ofertando...' : 'Hacer Oferta'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Historial de Ofertas</h3>
        {bids.length === 0 ? (
          <p>No hay ofertas aún</p>
        ) : (
          <ul className="space-y-2">
            {bids.map((bid) => (
              <li key={bid._id} className="border-b py-2">
                <span>${bid.amount}</span> -{' '}
                <span>{new Date(bid.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Auction;