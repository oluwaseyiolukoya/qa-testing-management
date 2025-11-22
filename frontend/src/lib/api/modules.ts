import apiClient from './client';
import type { ApiResponse } from '../../types';

export interface Module {
  id: string;
  projectId: string;
  projectName?: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdByUsername?: string;
  testCaseCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Transform database response to frontend format
function transformModule(dbModule: any): Module {
  return {
    id: dbModule.id,
    projectId: dbModule.project_id || dbModule.projectId,
    projectName: dbModule.project_name || dbModule.projectName,
    name: dbModule.name,
    description: dbModule.description,
    isActive: dbModule.is_active === 1 || dbModule.is_active === true || dbModule.isActive === true,
    createdBy: dbModule.created_by || dbModule.createdBy,
    createdByUsername: dbModule.created_by_username || dbModule.createdByUsername,
    testCaseCount: dbModule.test_case_count || dbModule.testCaseCount,
    createdAt: dbModule.created_at || dbModule.createdAt,
    updatedAt: dbModule.updated_at || dbModule.updatedAt,
  };
}

export const modulesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    projectId?: string;
    isActive?: boolean;
  }): Promise<{ data: Module[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<Module[]>>('/modules', { params });
    return {
      data: (response.data.data || []).map(transformModule),
      meta: response.data.meta,
    };
  },

  getById: async (id: string): Promise<Module> => {
    const response = await apiClient.get<ApiResponse<Module>>(`/modules/${id}`);
    return transformModule(response.data.data!);
  },

  create: async (module: Partial<Module>): Promise<Module> => {
    const response = await apiClient.post<ApiResponse<Module>>('/modules', module);
    return transformModule(response.data.data!);
  },

  update: async (id: string, module: Partial<Module>): Promise<Module> => {
    const response = await apiClient.put<ApiResponse<Module>>(`/modules/${id}`, module);
    return transformModule(response.data.data!);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/modules/${id}`);
  },
};

