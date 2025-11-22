export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TestCaseStatus = 'TODO' | 'IN_PROGRESS' | 'RESOLVED';
export type TestResult = 'PENDING' | 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED';
export type BugStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REOPENED';
export type BugType = 'FUNCTIONAL' | 'PERFORMANCE' | 'UI_UX' | 'SECURITY' | 'COMPATIBILITY' | 'DATA' | 'OTHER';
export type UserRole = 'ADMIN' | 'QA_MANAGER' | 'QA_ENGINEER';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestStep {
  id: string;
  stepNumber: number;
  action: string;
  expectedResult: string;
}

export interface TestCase {
  id: string;
  caseCode?: string;
  title: string;
  description: string;
  priority: Priority;
  status: TestCaseStatus;
  module: string;
  expectedResult: string;
  preconditions?: string;
  postconditions?: string;
  tags?: string[];
  estimatedTime?: number;
  steps: TestStep[];
  projectId?: string;
  assignedTo?: string; // User ID who is assigned to this test case
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface TestStepResult {
  stepNumber: number;
  result: TestResult;
  actualResult?: string;
  notes?: string;
  screenshot?: string;
}

export interface TestRun {
  id: string;
  testCaseId: string;
  testCase?: TestCase;
  executedById: string;
  executedBy?: User;
  result: TestResult;
  duration?: number;
  environment: string;
  buildVersion?: string;
  notes?: string;
  actualResult?: string;
  stepResults?: TestStepResult[];
  executedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bug {
  id: string;
  testRunId?: string;
  testRun?: TestRun;
  title: string;
  description: string;
  severity: Priority;
  priority: Priority;
  status: BugStatus;
  type: BugType;
  stepsToReproduce?: string;
  environment?: string;
  buildVersion?: string;
  createdById: string;
  createdBy?: User;
  assignedToId?: string;
  assignedTo?: User;
  resolvedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BugComment {
  id: string;
  bugId: string;
  userId: string;
  user?: User;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  overview: {
    totalTestCases: number;
    activeTestCases: number;
    totalTestRuns: number;
    passRate: number;
    openBugs: number;
    criticalBugs: number;
  };
  testResults: {
    passed: number;
    failed: number;
    blocked: number;
    skipped: number;
  };
  bugsBySeverity: Record<Priority, number>;
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

