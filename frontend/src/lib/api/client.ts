import axios from 'axios';
import type { ApiResponse } from '../../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token and prevent caching
apiClient.interceptors.request.use(
  (config) => {
    console.log('[INTERCEPTOR] Request:', { url: config.url, method: config.method });
    
    // Don't add auth token to login/register endpoints
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/register') ||
                          config.url?.includes('/auth/refresh');
    
    console.log('[INTERCEPTOR] Is auth endpoint:', isAuthEndpoint);
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[INTERCEPTOR] Added auth token');
      }
    } else {
      console.log('[INTERCEPTOR] Skipping auth token for auth endpoint');
    }
    
    // Prevent caching for GET requests to ensure fresh data
    if (config.method === 'get') {
      config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      config.headers['Pragma'] = 'no-cache';
      config.headers['Expires'] = '0';
    }
    
    console.log('[INTERCEPTOR] Final headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('[INTERCEPTOR] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log('[INTERCEPTOR] Response received:', { 
      url: response.config.url, 
      status: response.status 
    });
    return response;
  },
  async (error) => {
    console.error('[INTERCEPTOR] Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    const originalRequest = error.config;

    // Don't try to refresh token for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh');

    console.log('[INTERCEPTOR] Error on auth endpoint:', isAuthEndpoint);

    // If 401 and not already retrying and not an auth endpoint, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      console.log('[INTERCEPTOR] Attempting token refresh...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken }
          );

          if (response.data.data) {
            localStorage.setItem('accessToken', response.data.data.accessToken);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

