import axios from 'axios';

// Production backend URL (Remote)
const PRODUCTION_API_URL = 'https://ai-powered-skill-based-mock-tests-module.onrender.com/api';
// Local backend URL
const LOCAL_API_URL = 'http://localhost:5000/api';

// Determine initial API URL - Default to remote first
const getInitialApiUrl = () => {
  // If explicitly set via environment variable, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In production build, use production URL
  if (import.meta.env.MODE === 'production') {
    return PRODUCTION_API_URL;
  }

  // For development: check localStorage for override
  const useLocal = localStorage.getItem('useLocalAPI') === 'true';
  if (useLocal) {
    return LOCAL_API_URL;
  }

  // Default: try remote/production first
  return PRODUCTION_API_URL;
};

// Get the current API base URL (with fallback logic)
let currentBaseURL = getInitialApiUrl();

// Test remote backend availability
const testRemoteBackend = async () => {
  if (currentBaseURL === PRODUCTION_API_URL) {
    try {
      const response = await axios.get('https://ai-powered-skill-based-mock-tests-module.onrender.com/api/health', {
        timeout: 3000,
      });
      return true; // Remote backend is available
    } catch (error) {
      // Remote backend not available, switch to local
      console.warn('⚠️ Remote backend not available, switching to local backend');
      currentBaseURL = LOCAL_API_URL;
      return false;
    }
  }
  return true;
};

// Initialize: test remote backend on app load
testRemoteBackend().then((isRemoteAvailable) => {
  if (!isRemoteAvailable) {
    console.log('✅ Using local backend:', LOCAL_API_URL);
  } else {
    console.log('✅ Using remote backend:', PRODUCTION_API_URL);
  }
});

// Create axios instance
const api = axios.create({
  baseURL: currentBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update baseURL dynamically
const updateBaseURL = (newURL) => {
  currentBaseURL = newURL;
  api.defaults.baseURL = newURL;
};

// Request interceptor: Add admin token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Ensure we're using the current base URL
  if (config.baseURL !== currentBaseURL) {
    config.baseURL = currentBaseURL;
  }
  return config;
});

// Response interceptor: Handle errors and retry with local if remote fails
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If remote backend fails and we're using remote, try local
    if (
      (error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNREFUSED' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ERR_INTERNET_DISCONNECTED' ||
        (error.response?.status >= 500 && currentBaseURL === PRODUCTION_API_URL))
    ) {
      // Only switch if we haven't already switched
      if (currentBaseURL === PRODUCTION_API_URL) {
        console.warn('⚠️ Remote backend error, switching to local backend');
        updateBaseURL(LOCAL_API_URL);

        // Retry the original request with local URL
        const originalRequest = error.config;
        originalRequest.baseURL = LOCAL_API_URL;
        return api.request(originalRequest);
      }
    }

    // Handle 401/403 errors (unauthorized/forbidden) - redirect to login
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Auth error:', error.response?.status, error.response?.data);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const testAPI = {
  getAll: (category) => api.get('/tests', { params: { category } }),
  getById: (id) => api.get(`/tests/${id}`),
  getByCategory: (categoryId) => api.get(`/tests/category/${categoryId}`),
  create: (data) => api.post('/tests', data),
  update: (id, data) => api.put(`/tests/${id}`, data),
  delete: (id) => api.delete(`/tests/${id}`),
};

export const questionAPI = {
  getByTest: (testId) => api.get(`/questions/test/${testId}`),
  getByTestAndDifficulty: (testId, difficultyId) =>
    api.get(`/questions/test/${testId}/difficulty/${difficultyId}`),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

export const adminAPI = {
  getCategories: () => api.get('/admin/categories'),
  getDifficulties: () => api.get('/admin/difficulties'),
  generateQuestions: (data) => api.post('/admin/questions/generate', data),
  aiGeneratePreview: (data) => api.post('/admin/ai/generate', data),
  aiApprove: (data) => api.post('/admin/ai/approve', data),
  startGenerationJob: (data) => api.post('/admin/ai/generate-job', data),
  startApprovalJob: (data) => api.post('/admin/ai/approve-job', data),
  getGenerationStatus: (jobId) => api.get(`/admin/ai/status/${jobId}`),
  getAllTests: (page = 1, limit = 10, category) => api.get('/admin/tests', { params: { category, page, limit } }), // Admin: Get all tests including private
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
};

export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSetting: (key, value) => api.put('/settings', { key, value }),
};

export const adminAuthAPI = {
  login: (data) => api.post('/admin/auth/login', data),
  logout: () => api.post('/admin/auth/logout'),
};

// Export function to manually switch backend (for debugging)
export const switchToRemote = () => {
  updateBaseURL(PRODUCTION_API_URL);
  localStorage.setItem('useLocalAPI', 'false');
  console.log('✅ Switched to remote backend');
};

export const switchToLocal = () => {
  updateBaseURL(LOCAL_API_URL);
  localStorage.setItem('useLocalAPI', 'true');
  console.log('✅ Switched to local backend');
};

export default api;
