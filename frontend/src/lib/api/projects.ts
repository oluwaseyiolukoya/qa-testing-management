import apiClient from './client';
import type { ApiResponse } from '../../types';

export interface Project {
  id: string;
  name: string;
  description?: string;
  code: string;
  is_active?: number; // Database returns 0/1
  isActive?: boolean; // Frontend uses boolean
  created_by?: string; // Database field
  createdBy?: string; // Frontend field
  created_by_username?: string; // Database field
  createdByUsername?: string; // Frontend field
  test_case_count?: number; // Database field
  testCaseCount?: number; // Frontend field
  created_at?: string; // Database field
  createdAt?: string; // Frontend field
  updated_at?: string; // Database field
  updatedAt?: string; // Frontend field
}

// Transform database response to frontend format
function transformProject(dbProject: any): Project {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description,
    code: dbProject.code,
    isActive: dbProject.is_active === 1 || dbProject.is_active === true,
    createdBy: dbProject.created_by,
    createdByUsername: dbProject.created_by_username,
    // Ensure testCaseCount is a number (database might return string)
    testCaseCount: dbProject.test_case_count !== undefined && dbProject.test_case_count !== null 
      ? parseInt(dbProject.test_case_count, 10) 
      : 0,
    createdAt: dbProject.created_at,
    updatedAt: dbProject.updated_at,
  };
}

export const projectsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<{ data: Project[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects', { params });
    return {
      data: (response.data.data || []).map(transformProject),
      meta: response.data.meta,
    };
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return transformProject(response.data.data!);
  },

  create: async (project: Partial<Project>): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', project);
    return transformProject(response.data.data!);
  },

  update: async (id: string, project: Partial<Project>): Promise<Project> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, project);
    return transformProject(response.data.data!);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
