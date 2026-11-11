import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://chafe.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Admin JWT Token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arabista_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Format and handle standard API responses
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred';

    // If 401 received while on admin routes, clear invalid token
    if (error.response?.status === 401 && window.location.pathname.startsWith('/admin')) {
      localStorage.removeItem('arabista_admin_token');
      localStorage.removeItem('arabista_admin_user');
    }

    return Promise.reject(new Error(message));
  }
);

export { API_BASE_URL };
export default api;
