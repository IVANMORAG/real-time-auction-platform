import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import bidService from '../services/bidService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

const MyBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await bidService.getBidsByUser(user.id);
        setBids(response);
      } catch (err) {
        setError('Error al cargar tus pujas');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [user.id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Mis Pujas</h2>
      {bids.length === 0 ? (
        <p>No has realizado ninguna puja aún.</p>
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
  );
};

export default MyBids;