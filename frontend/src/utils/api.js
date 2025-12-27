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

// Request interceptor: Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export const testAPI = {
  getAll: (category, page = 1, limit = 8) => api.get('/tests', { params: { category, page, limit } }),
  getById: (id) => api.get(`/tests/${id}`),
  getByCategory: (categoryId) => api.get(`/tests/category/${categoryId}`),
  getDifficulties: () => api.get('/tests/difficulties'),
};

export const questionAPI = {
  getByTest: (testId) => api.get(`/questions/test/${testId}`),
  getByTestAndDifficulty: (testId, difficultyId) =>
    api.get(`/questions/test/${testId}/difficulty/${difficultyId}`),
  getById: (id) => api.get(`/questions/${id}`),
};

export const resultAPI = {
  startAttempt: (data) => api.post('/results/start', data),
  finishAttempt: (data) => api.post('/results/finish', data),
  getAttemptDetails: (id) => api.get(`/results/attempt/${id}`),
  getTestSummary: (attemptId) => api.get(`/results/summary/${attemptId}`),
  getTestHistory: (userId) => api.get(`/results/history/${userId}`),
  generateAnalysis: (attemptId) => api.post('/results/analysis', { attemptId }),
};

export const answerAPI = {
  submitAnswer: (data) => api.post('/answers/submit', data),
  getAnswersByAttempt: (attemptId) => api.get(`/answers/attempt/${attemptId}`),
};

export const userAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  getUserProfile: (id) => api.get(`/users/${id}/profile`),
  updateUserProfile: (id, data) => api.put(`/users/${id}/profile`, data),
};

export const adminAPI = {
  getCategories: () => api.get('/admin/categories'),
  getDifficulties: () => api.get('/admin/difficulties'),
  generateQuestions: (data) => api.post('/admin/questions/generate', data),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getUser: (id) => api.get(`/users/${id}`),
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
