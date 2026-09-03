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

// High-speed In-Memory & Session Cache with Stale-While-Revalidate
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60000; // 60 seconds fresh TTL
const originalGet = apiClient.get.bind(apiClient);
const originalPost = apiClient.post.bind(apiClient);
const originalPut = apiClient.put.bind(apiClient);
const originalPatch = apiClient.patch.bind(apiClient);
const originalDelete = apiClient.delete.bind(apiClient);

const getCacheEntry = (key: string) => {
  let entry = apiCache.get(key);
  if (!entry && typeof window !== 'undefined') {
    try {
      const raw = sessionStorage.getItem(`nexus_cache_${key}`);
      if (raw) {
        entry = JSON.parse(raw);
        if (entry) apiCache.set(key, entry);
      }
    } catch {}
  }
  return entry;
};

const setCacheEntry = (key: string, data: any) => {
  const entry = { data, timestamp: Date.now() };
  apiCache.set(key, entry);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`nexus_cache_${key}`, JSON.stringify(entry));
    } catch {}
  }
};

const invalidateCache = () => {
  apiCache.clear();
  if (typeof window !== 'undefined') {
    try {
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith('nexus_cache_')) {
          sessionStorage.removeItem(k);
        }
      });
    } catch {}
  }
};

// Cold-start detection helper
let pendingRequestsCount = 0;
let coldStartTimer: any = null;

const notifyColdStart = (warming: boolean) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('render-server-warming', { detail: { warming } }));
  }
};

const startColdStartCheck = () => {
  pendingRequestsCount++;
  if (pendingRequestsCount === 1) {
    coldStartTimer = setTimeout(() => {
      if (pendingRequestsCount > 0) {
        notifyColdStart(true);
      }
    }, 2500); // Trigger after 2.5s if server hasn't answered
  }
};

const stopColdStartCheck = () => {
  pendingRequestsCount = Math.max(0, pendingRequestsCount - 1);
  if (pendingRequestsCount === 0) {
    if (coldStartTimer) clearTimeout(coldStartTimer);
    notifyColdStart(false);
  }
};

// Intercept GET for instant cache retrieval
apiClient.get = (async (url: string, config?: any) => {
  const cacheKey = `${url}_${JSON.stringify(config?.params || {})}`;
  const cached = getCacheEntry(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    // Non-blocking background revalidation if older than 5s
    if (now - cached.timestamp > 5000) {
      originalGet(url, config)
        .then((res) => {
          if (res.data?.success) {
            setCacheEntry(cacheKey, res.data);
          }
        })
        .catch(() => {});
    }
    return { data: cached.data, status: 200, statusText: 'OK', headers: {}, config: config || {} };
  }

  startColdStartCheck();
  try {
    const res = await originalGet(url, config);
    if (res.data?.success) {
      setCacheEntry(cacheKey, res.data);
    }
    return res;
  } finally {
    stopColdStartCheck();
  }
}) as any;

// Automatically invalidate cache on mutating actions
apiClient.post = (async (...args: any[]) => {
  invalidateCache();
  startColdStartCheck();
  try {
    return await (originalPost as any)(...args);
  } finally {
    stopColdStartCheck();
  }
}) as any;

apiClient.put = (async (...args: any[]) => {
  invalidateCache();
  startColdStartCheck();
  try {
    return await (originalPut as any)(...args);
  } finally {
    stopColdStartCheck();
  }
}) as any;

apiClient.patch = (async (...args: any[]) => {
  invalidateCache();
  startColdStartCheck();
  try {
    return await (originalPatch as any)(...args);
  } finally {
    stopColdStartCheck();
  }
}) as any;

apiClient.delete = (async (...args: any[]) => {
  invalidateCache();
  startColdStartCheck();
  try {
    return await (originalDelete as any)(...args);
  } finally {
    stopColdStartCheck();
  }
}) as any;

// Background keep-alive to prevent Render free tier cold-starts
if (typeof window !== 'undefined') {
  const pingHealth = () => {
    originalGet('/health').catch(() => {});
  };
  setTimeout(pingHealth, 500);
  setInterval(pingHealth, 180000); // every 3 minutes
}

