import apiClient from './client';
import type { ApiResponse } from '../../types';

export interface Version {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  description?: string;
  isActive: boolean;
  releaseDate?: string;
  createdBy: string;
  createdByUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export const versionsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    projectId?: string;
    isActive?: boolean;
  }): Promise<{ data: Version[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<Version[]>>('/versions', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta,
    };
  },

  getById: async (id: string): Promise<Version> => {
    const response = await apiClient.get<ApiResponse<Version>>(`/versions/${id}`);
    return response.data.data!;
  },

  create: async (version: Partial<Version>): Promise<Version> => {
    const response = await apiClient.post<ApiResponse<Version>>('/versions', version);
    return response.data.data!;
  },

  update: async (id: string, version: Partial<Version>): Promise<Version> => {
    const response = await apiClient.put<ApiResponse<Version>>(`/versions/${id}`, version);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/versions/${id}`);
  },
};

