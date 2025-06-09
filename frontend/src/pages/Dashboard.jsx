import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import UpdateProfile from '../components/UpdateProfile';
import { CheckCircle, RefreshCw, AlertCircle, PlusCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isUpdateProfileOpen, setIsUpdateProfileOpen] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoadingProfile(true);
      setProfileError('');
      const response = await authService.getProfile();
      if (response.success && response.data) {
        setUser(response.data.user || response.data);
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setProfileError('Error al cargar el perfil del usuario');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleOpenUpdateProfile = () => {
    setIsUpdateProfileOpen(true);
  };

  const handleCloseUpdateProfile = () => {
    setIsUpdateProfileOpen(false);
  };

  const handleViewAuctions = () => {
    navigate('/auctions');
  };

  const handleViewMyBids = () => {
    navigate('/my-bids');
  };

  const handleCreateAuction = () => {
    navigate('/create-auction');
  };

  const handleCreateCategory = () => {
    navigate('/create-category');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleViewWinners = () => {
    navigate('/winners');
  };

  const formatUserData = (userData) => {
    if (!userData) return {};
    return {
      firstName: userData.firstName || userData.profile?.firstName || '',
      lastName: userData.lastName || userData.profile?.lastName || '',
      email: userData.email || '',
      phone: userData.phone || userData.profile?.phone || '',
      id: userData.id || userData._id || '',
      createdAt: userData.createdAt || userData.created_at || '',
    };
  };

  const userInfo = formatUserData(user);

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <CheckCircle className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Bienvenido, {userInfo.firstName || 'Usuario'}!
            </h1>
            <p className="text-gray-600">
              Has iniciado sesión correctamente en la plataforma de subastas
            </p>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Información de tu cuenta
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadUserProfile}
              disabled={isLoadingProfile}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              title="Actualizar información"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingProfile ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleOpenUpdateProfile}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <span>Editar Perfil</span>
            </button>
          </div>
        </div>

        {profileError && (
          <div className="mb-4 flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{profileError}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <p className="mt-1 text-sm text-gray-900">
                {isLoadingProfile ? (
                  <span className="animate-pulse bg-gray-200 h-4 w-20 block rounded"></span>
                ) : (
                  userInfo.firstName || 'No especificado'
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <p className="mt-1 text-sm text-gray-900">
                {isLoadingProfile ? (
                  <span className="animate-pulse bg-gray-200 h-4 w-20 block rounded"></span>
                ) : (
                  userInfo.lastName || 'No especificado'
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">
                {isLoadingProfile ? (
                  <span className="animate-pulse bg-gray-200 h-4 w-32 block rounded"></span>
                ) : (
                  userInfo.email || 'No especificado'
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <p className="mt-1 text-sm text-gray-900">
                {isLoadingProfile ? (
                  <span className="animate-pulse bg-gray-200 h-4 w-24 block rounded"></span>
                ) : (
                  userInfo.phone || 'No especificado'
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <p className="mt-1 text-sm">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">
                {isLoadingProfile ? (
                  <span className="animate-pulse bg-gray-200 h-4 w-32 block rounded"></span>
                ) : (
                  userInfo.id || 'No disponible'
                )}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleCreateAuction}
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Crear Nueva Subasta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Subastas Activas',
              description: 'Ve y participa en subastas en tiempo real',
              icon: '🔨',
              action: handleViewAuctions,
              available: true,
            },
            {
              title: 'Mis Pujas',
              description: 'Gestiona tus pujas y seguimiento',
              icon: '💰',
              action: handleViewMyBids,
              available: true,
            },
            {
              title: 'Crear Subasta',
              description: 'Publica tus propios artículos',
              icon: '📝',
              action: handleCreateAuction,
              available: true,
            },
            {
              title: 'Crear Categoría',
              description: 'Añade nuevas categorías para las subastas',
              icon: '🏷️',
              action: handleCreateCategory,
              available: true,
            },
            {
              title: 'Historial',
              description: 'Revisa tu actividad pasada',
              icon: '📊',
              action: handleViewHistory,
              available: true,
            },
            {
              title: 'Ganadores',
              description: 'Consulta los ganadores de subastas',
              icon: '🏆',
              action: handleViewWinners,
              available: true,
            },
            {
              title: 'Notificaciones',
              description: 'Recibe alertas en tiempo real',
              icon: '🔔',
              available: false,
            },
            {
              title: 'Actualizar Perfil',
              description: 'Actualiza tu información personal',
              icon: '👤',
              action: handleOpenUpdateProfile,
              available: true,
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`p-4 border-2 rounded-lg text-center transition-colors cursor-pointer ${
                feature.available
                  ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
                  : 'border-dashed border-gray-200 hover:border-primary-300'
              }`}
              onClick={feature.available ? feature.action : null}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
              {feature.available && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Disponible
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Autenticación</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Funcionando
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Frontend</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Activo
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">API Gateway</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Conectado
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Servicios de Subasta</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              ✓ Activo
            </span>
          </div>
        </div>
      </div>

      <UpdateProfile isOpen={isUpdateProfileOpen} onClose={handleCloseUpdateProfile} />
    </div>
  );
};

export default Dashboard;