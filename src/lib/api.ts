import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // If production deployment, connect to Render live backend
    if (!window.location.hostname.includes('localhost') && 
        !window.location.hostname.includes('192.168.') && 
        !window.location.hostname.includes('127.0.0.1')) {
      return 'https://app-gdds.iclever.vn';
    }
    // If local development:
    // If frontend is running on 3001, connect to backend on 3000 (and vice-versa)
    if (window.location.port === '3001') {
      return `http://${window.location.hostname}:3000`;
    }
    if (window.location.port === '3000') {
      return `http://${window.location.hostname}:3001`;
    }
    return `http://${window.location.hostname}:3000`;
  }
  return 'http://localhost:3000';
};

export const BASE_URL = getBaseUrl();

export const resolveImageUrl = (url: string | null | undefined) => {
  if (!url) return "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
  if (url.startsWith('http')) return url;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
