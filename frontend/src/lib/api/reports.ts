import apiClient from './client';
import type { ApiResponse, DashboardMetrics } from '../../types';

export const reportsApi = {
  getDashboard: async (params?: { startDate?: string; endDate?: string }): Promise<DashboardMetrics> => {
    const response = await apiClient.get<ApiResponse<DashboardMetrics>>('/reports/dashboard', { params });
    return response.data.data!;
  },

  getTestCoverage: async (params?: { module?: string }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/reports/test-coverage', { params });
    return response.data.data;
  },

  getBugAnalytics: async (params?: { startDate?: string; endDate?: string }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/reports/bug-analytics', { params });
    return response.data.data;
  },

  getTeamPerformance: async (params?: { startDate?: string; endDate?: string }): Promise<any> => {
    const response = await apiClient.get<ApiResponse<any>>('/reports/team-performance', { params });
    return response.data.data;
  },
};

