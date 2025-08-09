import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

// const baseApiUrl = "http://127.0.0.1:8000";

const baseApiUrl = window.location.origin;

// Create the axios instance - Remove i18n stuff since we're not using it
const api = axios.create({
  baseURL: baseApiUrl,
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ ADD: Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh');
      if (refreshToken) {
        try {
          const response = await axios.post(`${baseApiUrl}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          
          localStorage.setItem(ACCESS_TOKEN, response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem(ACCESS_TOKEN);
          localStorage.removeItem('refresh');
          localStorage.removeItem('user_info');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;