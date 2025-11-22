import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { testCasesApi } from '../../lib/api/test-cases';
import { testRunsApi } from '../../lib/api/test-runs';
import type { TestCase, TestRun } from '../../types';

interface ProjectOverviewTabProps {
  projectId: string;
}

export function ProjectOverviewTab({ projectId }: ProjectOverviewTabProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  // Refresh data when component becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch project-specific data
      const [testCasesData, testRunsData] = await Promise.all([
        testCasesApi.getAll({ 
          limit: 1000,
          projectId: projectId
        }),
        testRunsApi.getAll({ 
          limit: 1000,
          projectId: projectId
        }),
      ]);
      
      setTestCases(testCasesData.data);
      setTestRuns(testRunsData.data);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  // Calculate metrics from project data
  const totalTestCases = testCases.length;
  const activeTestCases = testCases.filter(tc => 
    tc.status === 'TODO' || tc.status === 'IN_PROGRESS'
  ).length;
  
  const totalTestRuns = testRuns.length;
  const passedRuns = testRuns.filter(tr => tr.result === 'PASSED').length;
  const failedRuns = testRuns.filter(tr => tr.result === 'FAILED').length;
  const blockedRuns = testRuns.filter(tr => tr.result === 'BLOCKED').length;
  const skippedRuns = testRuns.filter(tr => tr.result === 'SKIPPED').length;
  const passRate = totalTestRuns > 0 
    ? Math.round((passedRuns / totalTestRuns) * 100 * 10) / 10 
    : 0;

  const resultData = [
    { name: 'Passed', value: passedRuns, color: '#22c55e' },
    { name: 'Failed', value: failedRuns, color: '#ef4444' },
    { name: 'Blocked', value: blockedRuns, color: '#f59e0b' },
    { name: 'Skipped', value: skippedRuns, color: '#94a3b8' }
  ];

  const moduleData = testCases.reduce((acc, tc) => {
    const existing = acc.find(item => item.module === tc.module);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ module: tc.module, count: 1 });
    }
    return acc;
  }, [] as { module: string; count: number }[]);

  const priorityData = [
    { priority: 'Critical', count: testCases.filter(tc => tc.priority === 'CRITICAL').length, color: '#dc2626' },
    { priority: 'High', count: testCases.filter(tc => tc.priority === 'HIGH').length, color: '#f59e0b' },
    { priority: 'Medium', count: testCases.filter(tc => tc.priority === 'MEDIUM').length, color: '#3b82f6' },
    { priority: 'Low', count: testCases.filter(tc => tc.priority === 'LOW').length, color: '#94a3b8' }
  ];

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Test Cases</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestCases}</div>
            <p className="text-xs text-muted-foreground">
              {activeTestCases} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
            {passRate >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {passedRuns} of {totalTestRuns} passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Tests</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedRuns}</div>
            <p className="text-xs text-muted-foreground">
              {blockedRuns} blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Test Runs</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestRuns}</div>
            <p className="text-xs text-muted-foreground">
              {skippedRuns} skipped
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Results Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resultData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resultData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Cases by Module</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={moduleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="module" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

