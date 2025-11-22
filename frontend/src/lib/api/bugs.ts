import apiClient from './client';
import type { ApiResponse, Bug, BugComment } from '../../types';

export const bugsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    severity?: string;
    priority?: string;
  }): Promise<{ data: Bug[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<Bug[]>>('/bugs', { params });
    return {
      data: response.data.data || [],
      meta: response.data.meta,
    };
  },

  getById: async (id: string): Promise<Bug> => {
    const response = await apiClient.get<ApiResponse<Bug>>(`/bugs/${id}`);
    return response.data.data!;
  },

  create: async (bug: Partial<Bug>): Promise<Bug> => {
    const response = await apiClient.post<ApiResponse<Bug>>('/bugs', bug);
    return response.data.data!;
  },

  update: async (id: string, bug: Partial<Bug>): Promise<Bug> => {
    const response = await apiClient.put<ApiResponse<Bug>>(`/bugs/${id}`, bug);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bugs/${id}`);
  },

  addComment: async (bugId: string, comment: string): Promise<BugComment> => {
    const response = await apiClient.post<ApiResponse<BugComment>>(`/bugs/${bugId}/comments`, { comment });
    return response.data.data!;
  },

  getComments: async (bugId: string): Promise<BugComment[]> => {
    const response = await apiClient.get<ApiResponse<BugComment[]>>(`/bugs/${bugId}/comments`);
    return response.data.data || [];
  },

  updateStatus: async (bugId: string, status: string, comment?: string): Promise<Bug> => {
    const response = await apiClient.put<ApiResponse<Bug>>(`/bugs/${bugId}/status`, { status, comment });
    return response.data.data!;
  },
};

