import { useState, useEffect } from 'react';
import auctionService from '../services/auctionService';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const AuctionList = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await auctionService.getAllAuctions();
        setAuctions(response);
      } catch (err) {
        setError('Error al cargar las subastas');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {auctions.map(auction => (
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
      ))}
    </div>
  );
};

export default AuctionList;