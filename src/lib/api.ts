import axios from 'axios';

export const BASE_URL = 'http://localhost:3001';

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

export default api;
