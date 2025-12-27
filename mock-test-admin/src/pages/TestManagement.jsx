import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTests, incrementPage, resetTests } from '../features/testSlice';
import { testAPI, adminAPI } from '../utils/api';
import AdminProfile from '../components/AdminProfile';
import AdminTestCardSkeleton from '../components/AdminTestCardSkeleton';
import ModernAdminTestCard from '../components/ModernAdminTestCard';

const TestManagement = () => {
  const dispatch = useDispatch();
  const { items: tests, loading, hasMore, page, companyName: contextCompanyName, rolePosition: contextRolePosition } = useSelector((state) => state.tests);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    total_questions: 30,
    total_marks: 30,
    duration_minutes: 15,
    tagline: '',
    image_url: '',
    is_active: true,
    visibility: 'public',
    scheduled_date: '',
    company_name: '',
    role_position: ''
  });
  const [banner, setBanner] = useState('');
  const [bannerType, setBannerType] = useState('success');
  // const [loading, setLoading] = useState(true); // Managed by Redux
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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

    // Initial fetch
    dispatch(resetTests());
    dispatch(fetchTests({ page: 1, limit: 10 }));
    fetchCategories();

    // Check if we need to edit a test from navigation
    if (location.state?.editTest) {
      setTimeout(() => {
        handleEdit(location.state.editTest);
      }, 200);
    }
    // Clear location state after use
    if (location.state?.editTest) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  // Infinite Scroll Listener
  const handleScroll = useCallback(() => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading || !hasMore) {
      return;
    }
    dispatch(incrementPage());
  }, [loading, hasMore]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fetch more when page changes
  useEffect(() => {
    if (page > 1) {
      dispatch(fetchTests({ page, limit: 10 }));
    }
  }, [page]);

  const fetchCategories = async () => {
    try {
      const categoriesRes = await adminAPI.getCategories();
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchData = () => {
    dispatch(resetTests());
    dispatch(fetchTests({ page: 1, limit: 10 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await testAPI.update(editingTest.id, formData);
        setBannerType('success');
        setBanner('Test updated successfully');
        // Navigate back to dashboard after successful update
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        await testAPI.create(formData);
        setBannerType('success');
        setBanner('Test created successfully');
      }
      fetchData();
      setShowForm(false);
      setEditingTest(null);
      resetForm();
      setTimeout(() => setBanner(''), 3000);
    } catch (error) {
      console.error('Error saving test:', error);
      setBannerType('error');
      setBanner('Error saving test');
      setTimeout(() => setBanner(''), 3000);
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description || '',
      category_id: test.category_id,
      total_questions: test.total_questions,
      total_marks: test.total_marks,
      duration_minutes: test.duration_minutes,
      tagline: test.tagline || '',
      image_url: test.image_url || '',
      is_active: test.is_active,
      visibility: test.visibility || 'public',
      scheduled_date: test.scheduled_date ? new Date(test.scheduled_date).toISOString().slice(0, 16) : '',
      company_name: test.company_name || '',
      role_position: test.role_position || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }
    try {
      await testAPI.delete(testId);
      setBannerType('success');
      setBanner('Test deleted successfully');
      fetchData();
      setTimeout(() => setBanner(''), 3000);
    } catch (error) {
      console.error('Error deleting test:', error);
      setBannerType('error');
      setBanner('Error deleting test');
      setTimeout(() => setBanner(''), 3000);
    }
  };

  const handleToggleVisibility = async (test) => {
    const newVisibility = test.visibility === 'public' ? 'private' : 'public';
    try {
      await testAPI.update(test.id, { ...test, visibility: newVisibility });
      setBannerType('success');
      setBanner(`Test visibility changed to ${newVisibility}`);
      fetchData();
      setTimeout(() => setBanner(''), 3000);
    } catch (error) {
      console.error('Error updating visibility:', error);
      setBannerType('error');
      setBanner('Error updating visibility');
      setTimeout(() => setBanner(''), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category_id: '',
      total_questions: 30,
      total_marks: 30,
      duration_minutes: 15,
      tagline: '',
      image_url: '',
      is_active: true,
      visibility: 'public',
      scheduled_date: '',
      company_name: contextCompanyName || '', // Pre-fill from context
      role_position: contextRolePosition || '' // Pre-fill from context
    });
  };

  const getVisibilityBadge = (visibility) => {
    const styles = {
      public: 'bg-green-100 text-green-700',
      private: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700'
    };
    return styles[visibility] || styles.public;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <AdminProfile admin={admin} onAdminUpdate={setAdmin} />
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-custom-light">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 pr-14 sm:pr-0">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Test Management</h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm">Create, edit, and manage test cards with full control</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 sm:px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Banner */}
        {banner && (
          <div className={`mb-6 p-4 rounded-lg ${bannerType === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
            {banner}
          </div>
        )}

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-custom-medium p-6 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingTest ? 'Edit Test' : 'Create New Test'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTest(null);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Short description"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility *</label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
              {formData.visibility === 'scheduled' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position</label>
                  <input
                    type="text"
                    value={formData.role_position}
                    onChange={(e) => setFormData({ ...formData, role_position: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Software Engineer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
                  <input
                    type="number"
                    value={formData.total_questions}
                    onChange={(e) => setFormData({ ...formData, total_questions: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingTest ? 'Update Test' : 'Create Test'}
                </button>
                {editingTest && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
                        handleDelete(editingTest.id);
                      }
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete Test
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTest(null);
                    resetForm();
                    setBanner(''); // Clear banner
                    // Navigate back to dashboard for consistent UI
                    navigate('/');
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Action Bar */}
        {!showForm && (
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">All Tests ({tests.length})</h2>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingTest(null);
                resetForm();
              }}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              + Create New Test
            </button>
          </div>
        )}

        {/* Test Cards Grid */}
        {!showForm && (
          <>
            {loading && tests.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <AdminTestCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {tests.map((test) => (
                  <ModernAdminTestCard
                    key={test.id}
                    test={test}
                    onManageQuestions={() => navigate(`/tests/${test.id}/questions`)}
                    onEdit={() => handleEdit(test)}
                  />
                ))}
                {tests.length === 0 && !loading && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No tests available. Create your first test!
                  </div>
                )}
                {/* Shimmer for loading more */}
                {loading && tests.length > 0 && (
                  Array.from({ length: 3 }).map((_, i) => (
                    <AdminTestCardSkeleton key={`more-${i}`} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TestManagement;
