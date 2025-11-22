import { apiClient } from './client';

export interface UserActivityFilters {
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TestRunActivity {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  test_run_id: string;
  test_case_id: string;
  case_code: string;
  test_case_title: string;
  module: string;
  result: string;
  duration: number;
  environment: string;
  executed_at: string;
  project_name: string;
  project_code: string;
}

export interface UserStats {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  blocked_tests: number;
  skipped_tests: number;
  avg_duration: number;
  first_test_date: string;
  last_test_date: string;
}

export interface AssignedStats {
  user_id: string;
  username: string;
  assigned_count: number;
  todo_count: number;
  in_progress_count: number;
  resolved_count: number;
}

export interface UserActivityResponse {
  testRuns: TestRunActivity[];
  userStats: UserStats[];
  assignedStats: AssignedStats[];
}

export const userActivityApi = {
  async getUserActivity(filters: UserActivityFilters = {}): Promise<UserActivityResponse> {
    const params = new URLSearchParams();
    if (filters.projectId) params.append('projectId', filters.projectId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/user-activity?${params.toString()}`);
    return response.data.data;
  },
};

