import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Auction from './pages/Auction';
import AuctionList from './components/AuctionList';
import AuctionForm from './components/AuctionForm';
import CategoryForm from './components/CategoryForm';
import MyBids from './pages/MyBids';
import History from './pages/History';
import Layout from './components/Layout';
import WinnersList from './components/WinnersList'; // New import

const CreateAuctionWrapper = () => {
  const navigate = useNavigate();
  return (
    <ProtectedRoute>
      <Layout>
        <AuctionForm onSuccess={() => navigate('/auctions')} />
      </Layout>
    </ProtectedRoute>
  );
};

const CreateCategoryWrapper = () => {
  const navigate = useNavigate();
  return (
    <ProtectedRoute>
      <Layout>
        <CategoryForm onSuccess={() => navigate('/auctions')} />
      </Layout>
    </ProtectedRoute>
  );
};

const WinnersListWrapper = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <WinnersList />
      </Layout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/auctions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AuctionList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/auction/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Auction />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/create-auction" element={<CreateAuctionWrapper />} />
            <Route path="/create-category" element={<CreateCategoryWrapper />} />
            <Route path="/edit-category/:id" element={<CreateCategoryWrapper />} />
            <Route
              path="/my-bids"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MyBids />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <History />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/winners"
              element={<WinnersListWrapper />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;