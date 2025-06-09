import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import auctionService from '../services/auctionService';
import bidService from '../services/bidService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const History = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [auctionResponse, bidResponse] = await Promise.all([
          auctionService.getAllAuctions(),
          bidService.getBidsByUser(user.id)
        ]);
        console.log('Auction response:', auctionResponse);
        console.log('User ID:', user.id);
        const userAuctions = auctionResponse.filter(auction => {
          const isOwner = auction.owner_id === user.id || auction.ownerId === user.id;
          console.log('Auction:', auction._id, 'owner_id:', auction.owner_id, 'ownerId:', auction.ownerId, 'isOwner:', isOwner);
          return isOwner;
        });
        setAuctions(userAuctions);
        setBids(bidResponse);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Error al cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Historial de Actividad</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Mis Subastas Creadas</h3>
        {auctions.length === 0 ? (
          <p>No has creado ninguna subasta.</p>
        ) : (
          <div className="space-y-4">
            {auctions.map(auction => (
              <div key={auction._id} className="border rounded-lg p-4 shadow-md">
                <h4 className="font-medium">{auction.title}</h4>
                <p>Estado: {auction.status}</p>
                <p>Finaliza: {new Date(auction.endTime || auction.end_time).toLocaleString()}</p>
                <Link to={`/auction/${auction._id}`} className="text-blue-500 hover:underline">Ver Detalles</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Mis Pujas</h3>
        {bids.length === 0 ? (
          <p>No has realizado ninguna puja.</p>
        ) : (
          <div className="space-y-4">
            {bids.map(bid => (
              <div key={bid._id} className="border rounded-lg p-4 shadow-md">
                <p>Monto: ${bid.amount}</p>
                <p>Subasta: <Link to={`/auction/${bid.auctionId}`} className="text-blue-500 hover:underline">Ver Subasta</Link></p>
                <p>Fecha: {new Date(bid.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;