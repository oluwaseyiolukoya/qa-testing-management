import apiClient from './client';
import type { ApiResponse, AuthResponse, LoginCredentials, User } from '../../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('[AUTH] Attempting login with credentials:', { username: credentials.username, password: '***' });
    console.log('[AUTH] API Client baseURL:', apiClient.defaults.baseURL);
    console.log('[AUTH] Full URL will be:', apiClient.defaults.baseURL + '/auth/login');
    
    try {
      const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
      console.log('[AUTH] Login response received:', { 
        status: response.status, 
        hasData: !!response.data,
        hasToken: !!response.data?.data?.accessToken 
      });
      
      if (response.data.data) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data.data!;
    } catch (error: any) {
      console.error('[AUTH] Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
      '/auth/refresh',
      { refreshToken }
    );
    return response.data.data!;
  },
};

