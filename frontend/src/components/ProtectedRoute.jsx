import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  // Always call hooks before any conditional returns
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, loading]);

  const handleClose = () => {
    setShowAuthModal(false);
    // Navigate back to home page if modal is closed without login
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={handleClose}
        onSuccess={() => setShowAuthModal(false)}
      />
    );
  }

  return children;
};

export default ProtectedRoute;


