import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      navigate('/login');
    }
  }, [navigate]);

  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return null; // Will redirect in useEffect
  }

  return children;
};

export default AdminProtectedRoute;

