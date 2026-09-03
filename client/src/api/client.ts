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

// High-speed In-Memory Cache with Stale-While-Revalidate
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 20000; // 20 seconds fresh TTL
const originalGet = apiClient.get.bind(apiClient);
const originalPost = apiClient.post.bind(apiClient);
const originalPut = apiClient.put.bind(apiClient);
const originalPatch = apiClient.patch.bind(apiClient);
const originalDelete = apiClient.delete.bind(apiClient);

// Intercept GET for instant cache retrieval
apiClient.get = (async (url: string, config?: any) => {
  const cacheKey = `${url}_${JSON.stringify(config?.params || {})}`;
  const cached = apiCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    // Non-blocking background revalidation if older than 5s
    if (now - cached.timestamp > 5000) {
      originalGet(url, config)
        .then((res) => {
          if (res.data?.success) {
            apiCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
          }
        })
        .catch(() => {});
    }
    return { data: cached.data, status: 200, statusText: 'OK', headers: {}, config: config || {} };
  }

  const res = await originalGet(url, config);
  if (res.data?.success) {
    apiCache.set(cacheKey, { data: res.data, timestamp: Date.now() });
  }
  return res;
}) as any;

// Automatically invalidate cache on mutating actions
const invalidateCache = () => apiCache.clear();
apiClient.post = (async (...args: any[]) => {
  invalidateCache();
  return (originalPost as any)(...args);
}) as any;
apiClient.put = (async (...args: any[]) => {
  invalidateCache();
  return (originalPut as any)(...args);
}) as any;
apiClient.patch = (async (...args: any[]) => {
  invalidateCache();
  return (originalPatch as any)(...args);
}) as any;
apiClient.delete = (async (...args: any[]) => {
  invalidateCache();
  return (originalDelete as any)(...args);
}) as any;

// Background keep-alive to prevent Render free tier cold-starts
if (typeof window !== 'undefined') {
  const pingHealth = () => {
    originalGet('/health').catch(() => {});
  };
  setTimeout(pingHealth, 1000);
  setInterval(pingHealth, 210000); // every 3.5 minutes
}

