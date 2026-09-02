import axios from 'axios';

const resolveBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim();
    // Auto-fix if the env var was set to nexusdesk-api instead of nexusdesk-api-i4n5
    if (url.includes('nexusdesk-api.onrender.com') && !url.includes('nexusdesk-api-i4n5')) {
      url = url.replace('nexusdesk-api.onrender.com', 'nexusdesk-api-i4n5.onrender.com');
    }
    if (!url.startsWith('http') && !url.startsWith('/')) {
      url = `https://${url}`;
    }
    return url.replace(/\/+$/, '');
  }

  // Localhost development uses Vite proxy
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return '/api';
  }

  // Production fallback to live deployed Render backend API
  return 'https://nexusdesk-api-i4n5.onrender.com/api';
};

export const apiClient = axios.create({
  baseURL: resolveBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header if token exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('omni_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 errors to clear session
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired or invalid, clear local auth
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('omni_token');
        localStorage.removeItem('omni_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
