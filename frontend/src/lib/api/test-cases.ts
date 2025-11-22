import apiClient from './client';
import type { ApiResponse, TestCase } from '../../types';

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

// Transform database response to frontend format
function transformTestCase(dbTestCase: any): TestCase {
  // Transform steps from database format to frontend format
  let steps: TestStep[] = [];
  if (dbTestCase.steps && Array.isArray(dbTestCase.steps)) {
    steps = dbTestCase.steps.map((step: any, index: number) => ({
      id: step.id || `step-${step.step_number || index}`,
      stepNumber: step.step_number || step.stepNumber || index + 1,
      action: step.action || '',
      expectedResult: step.expected_result || step.expectedResult || '',
    }));
  }

  return {
    id: dbTestCase.id,
    caseCode: dbTestCase.case_code || dbTestCase.caseCode,
    title: dbTestCase.title,
    description: dbTestCase.description,
    priority: dbTestCase.priority,
    status: dbTestCase.status,
    module: dbTestCase.module,
    expectedResult: dbTestCase.expected_result || dbTestCase.expectedResult,
    preconditions: dbTestCase.preconditions,
    postconditions: dbTestCase.postconditions,
    tags: dbTestCase.tags ? (typeof dbTestCase.tags === 'string' ? JSON.parse(dbTestCase.tags) : dbTestCase.tags) : undefined,
    estimatedTime: dbTestCase.estimated_time || dbTestCase.estimatedTime,
    steps: steps,
    projectId: dbTestCase.project_id || dbTestCase.projectId,
    createdAt: dbTestCase.created_at || dbTestCase.createdAt,
    updatedAt: dbTestCase.updated_at || dbTestCase.updatedAt,
  };
}

export const testCasesApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    module?: string;
    search?: string;
    projectId?: string;
  }): Promise<{ data: TestCase[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<TestCase[]>>('/test-cases', { params });
    return {
      data: (response.data.data || []).map(transformTestCase),
      meta: response.data.meta,
    };
  },

  getById: async (id: string): Promise<TestCase> => {
    const response = await apiClient.get<ApiResponse<TestCase>>(`/test-cases/${id}`);
    return transformTestCase(response.data.data!);
  },

  create: async (testCase: Partial<TestCase>): Promise<TestCase> => {
    const response = await apiClient.post<ApiResponse<TestCase>>('/test-cases', testCase);
    return transformTestCase(response.data.data!);
  },

  update: async (id: string, testCase: Partial<TestCase>): Promise<TestCase> => {
    const response = await apiClient.put<ApiResponse<TestCase>>(`/test-cases/${id}`, testCase);
    return transformTestCase(response.data.data!);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/test-cases/${id}`);
  },

  getStats: async (): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/test-cases/stats');
    return response.data.data;
  },
};

