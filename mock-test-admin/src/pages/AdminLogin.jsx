import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthAPI } from '../utils/api';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminAuthAPI.login(formData);
      // Store admin token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      // Better error handling
      if (err.response) {
        // Server responded with error
        if (err.response.status === 404) {
          setError('Admin login endpoint not found. Please check if the backend is properly deployed and the route exists.');
        } else if (err.response.status === 401) {
          setError(err.response.data?.error || 'Invalid username or password. Please check your credentials.');
        } else if (err.response.status === 403) {
          setError('Admin account is deactivated. Please contact system administrator.');
        } else {
          setError(err.response.data?.error || `Login failed: ${err.response.status} ${err.response.statusText}`);
        }
      } else if (err.request) {
        // Request was made but no response received
        setError('Cannot connect to backend server. Please check if the backend is running and accessible.');
      } else {
        // Something else happened
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold mb-4">
            Admin Panel
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Admin Login
          </h1>
          <p className="text-gray-600 text-sm">
            Sign in to access the admin dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username or email"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>No signup available. Contact system administrator for access.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

