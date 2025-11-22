import apiClient from './client';
import type { ApiResponse, TestRun } from '../../types';

// Transform database response to frontend format
function transformTestRun(dbTestRun: any): TestRun {
  return {
    id: dbTestRun.id,
    testCaseId: dbTestRun.test_case_id || dbTestRun.testCaseId,
    executedById: dbTestRun.executed_by || dbTestRun.executedById,
    result: dbTestRun.result,
    duration: dbTestRun.duration,
    environment: dbTestRun.environment,
    buildVersion: dbTestRun.build_version || dbTestRun.buildVersion,
    notes: dbTestRun.notes,
    actualResult: dbTestRun.actual_result || dbTestRun.actualResult,
    stepResults: dbTestRun.step_results ? dbTestRun.step_results.map((sr: any) => ({
      stepNumber: sr.step_number || sr.stepNumber,
      result: sr.result,
      actualResult: sr.actual_result || sr.actualResult,
      notes: sr.notes,
      screenshot: sr.screenshot,
    })) : undefined,
    executedAt: dbTestRun.executed_at || dbTestRun.executedAt,
    createdAt: dbTestRun.created_at || dbTestRun.createdAt,
    updatedAt: dbTestRun.updated_at || dbTestRun.updatedAt,
    // Include backend-provided fields
    ...(dbTestRun.test_case_title && { test_case_title: dbTestRun.test_case_title }),
    ...(dbTestRun.test_case_module && { test_case_module: dbTestRun.test_case_module }),
    ...(dbTestRun.executed_by_username && { executed_by_username: dbTestRun.executed_by_username }),
  } as TestRun;
}

export const testRunsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    result?: string;
    testCaseId?: string;
    environment?: string;
    projectId?: string;
  }): Promise<{ data: TestRun[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<TestRun[]>>('/test-runs', { params });
    return {
      data: (response.data.data || []).map(transformTestRun),
      meta: response.data.meta,
    };
  },

  getById: async (id: string): Promise<TestRun> => {
    const response = await apiClient.get<ApiResponse<TestRun>>(`/test-runs/${id}`);
    return transformTestRun(response.data.data!);
  },

  create: async (testRun: Partial<TestRun>): Promise<TestRun> => {
    const response = await apiClient.post<ApiResponse<TestRun>>('/test-runs', testRun);
    return transformTestRun(response.data.data!);
  },

  update: async (id: string, testRun: Partial<TestRun>): Promise<TestRun> => {
    const response = await apiClient.put<ApiResponse<TestRun>>(`/test-runs/${id}`, testRun);
    return transformTestRun(response.data.data!);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/test-runs/${id}`);
  },

  getHistory: async (testCaseId: string, limit?: number): Promise<TestRun[]> => {
    const response = await apiClient.get<ApiResponse<TestRun[]>>('/test-runs/history', {
      params: { testCaseId, limit },
    });
    return response.data.data || [];
  },
};

