import { apiClient } from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'MANAGER' | 'TESTER' | 'VIEWER';
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsersApiResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface UserApiResponse {
  data: User;
}

export const usersApi = {
  async getAll(params?: { limit?: number; page?: number; role?: string; isActive?: boolean }) {
    const response = await apiClient.get<UsersApiResponse>('/users', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get<UserApiResponse>(`/users/${id}`);
    return response.data.data;
  },

  async create(data: Partial<User> & { password: string }) {
    const response = await apiClient.post<UserApiResponse>('/users', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<User>) {
    const response = await apiClient.put<UserApiResponse>(`/users/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    await apiClient.delete(`/users/${id}`);
  },
};

