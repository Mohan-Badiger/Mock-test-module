import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import AdminProfile from '../components/AdminProfile';
import AdminDashboardSkeleton from '../components/AdminDashboardSkeleton';
import SettingsModal from '../components/SettingsModal';
import ModernAdminTestCard from '../components/ModernAdminTestCard';

const AdminDashboard = () => {
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [stats, setStats] = useState({ total: 0, active: 0, public: 0 });
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load admin data from localStorage
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        setAdmin(JSON.parse(adminData));
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }

    // Fetch admin profile from backend
    const fetchAdminProfile = async () => {
      try {
        const response = await adminAPI.getProfile();
        setAdmin(response.data);
        localStorage.setItem('admin', JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching admin profile:', error);
      }
    };

    fetchAdminProfile();
    fetchData();
  }, [activeTab]);

  // Refresh data when component becomes visible (e.g., navigating back from edit)
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsRes, categoriesRes] = await Promise.all([
        adminAPI.getAllTests(), // Use admin endpoint to get all tests including private
        adminAPI.getCategories()
      ]);

      const testsData = Array.isArray(testsRes.data?.tests) ? testsRes.data.tests : (Array.isArray(testsRes.data) ? testsRes.data : []);
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];

      let filteredTests = testsData;
      if (activeTab !== 'All') {
        filteredTests = filteredTests.filter(t =>
          t.category_name?.toLowerCase() === activeTab.toLowerCase()
        );
      }

      setTests(filteredTests);
      setCategories(categoriesData);

      setStats({
        total: testsData.length,
        active: testsData.filter(t => t.is_active).length,
        public: testsData.filter(t => t.visibility === 'public' || !t.visibility).length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityBadge = (visibility) => {
    const styles = {
      public: 'bg-green-100 text-green-700',
      private: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700'
    };
    return styles[visibility] || styles.public;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans relative">
        <AdminProfile admin={admin} onAdminUpdate={setAdmin} />
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 py-8 sm:py-12 md:py-14 px-4 sm:px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div className="flex-1">
                <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                  Admin Panel ✨
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-700 text-sm sm:text-base">
                  Manage and oversee all mock tests with comprehensive control
                </p>
              </div>
            </div>
          </div>
        </div>
        <AdminDashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <AdminProfile admin={admin} onAdminUpdate={setAdmin} />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 py-8 sm:py-12 md:py-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex-1">
              <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                Admin Panel ✨
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-extrabold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-700 text-sm sm:text-base">
                Manage and oversee all mock tests with comprehensive control
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto pr-14 sm:pr-0">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-4 sm:px-6 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
                Settings
              </button>
              <button
                onClick={() => navigate('/tests')}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                Manage Tests
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-custom-medium p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Tests</h3>
            <p className="text-4xl font-extrabold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-custom-medium p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Tests</h3>
            <p className="text-4xl font-extrabold text-gray-900">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-custom-medium p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Public Tests</h3>
            <p className="text-4xl font-extrabold text-gray-900">{stats.public}</p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('All')}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'All'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.name)}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === cat.name
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tests.map((test) => (
            <ModernAdminTestCard
              key={test.id}
              test={test}
              onManageQuestions={() => navigate(`/tests/${test.id}/questions`)}
              onEdit={() => navigate('/tests', { state: { editTest: test } })}
            />
          ))}
          {tests.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No tests available in this category
            </div>
          )}
        </div>
      </div>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
