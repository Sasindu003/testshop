import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send refresh token cookie if used
});

// ── Token helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('accessToken');
const setToken = (token) => localStorage.setItem('accessToken', token);
const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// ── Request interceptor: attach access token ─────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Refresh state: prevent concurrent refresh storms ────────────────────────
let isRefreshing = false;
let failedQueue = []; // [{resolve, reject}]

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  );
  failedQueue = [];
};

// ── Response interceptor: silent refresh on 401 ──────────────────────────────
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh once per request, and only on 401
    if (
      error.response?.status !== 401 ||
      originalRequest._retried ||
      originalRequest.url?.endsWith('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the ongoing refresh resolves
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retried = true;
    isRefreshing = true;

    try {
      const { data } = await axiosClient.post('/auth/refresh');
      const newToken = data.accessToken;
      setToken(newToken);
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearSession();
      // Emit a custom event so the AuthContext can react without a hard import
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosClient;
