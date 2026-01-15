import axios from 'axios';
import { getCookie, deleteCookie } from './cookies';
import { getFirebaseIdToken } from './firebaseToken';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Enable cookies for cross-origin requests
  timeout: 60000 // 60 seconds timeout for API calls
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  async (config) => {
    // Priority: Firebase ID token (for new auth system) > MongoDB JWT token (backward compatibility)
    try {
      // Try to get Firebase ID token first
      const firebaseToken = await getFirebaseIdToken();
      if (firebaseToken) {
        config.headers.Authorization = `Bearer ${firebaseToken}`;
        return config;
      }
    } catch (error) {
      console.warn('Failed to get Firebase token, trying MongoDB JWT token...', error);
    }

    // Fallback to MongoDB JWT token (for backward compatibility)
    const token = getCookie('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't modify AbortError - let it pass through for proper handling
    if (error.name === 'AbortError' || error.code === 'ERR_CANCELED' || error.message === 'canceled') {
      return Promise.reject(error);
    }
    
    // Handle network timeout
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      error.message = 'Kết nối quá lâu. Vui lòng thử lại.';
    }
    
    // Handle rate limit
    if (error.response?.status === 429) {
      error.message = 'Quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.';
    }
    
    // Handle invalid response format
    if (error.response && !error.response.data) {
      error.message = 'Phản hồi không hợp lệ từ server.';
    }
    
    if (error.response?.status === 401) {
      // Remove token from both cookie and localStorage
      deleteCookie('token');
      localStorage.removeItem('token');
      
      // Only redirect if not already on landing page
      // This prevents redirect loop when Assistant is used on landing page
      const currentPath = window.location.pathname;
      if (currentPath !== '/' && !currentPath.startsWith('/register') && !currentPath.startsWith('/login')) {
      window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;