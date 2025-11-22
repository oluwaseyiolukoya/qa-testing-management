import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download } from 'lucide-react';
import { testCasesApi } from '../../lib/api/test-cases';
import { testRunsApi } from '../../lib/api/test-runs';
import type { TestCase, TestRun } from '../../types';
import { formatDate } from '../../lib/utils';

interface ProjectReportsTabProps {
  projectId: string;
}

export function ProjectReportsTab({ projectId }: ProjectReportsTabProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testCasesRes, testRunsRes] = await Promise.all([
        testCasesApi.getAll({ limit: 1000, projectId }),
        testRunsApi.getAll({ limit: 1000, projectId }),
      ]);
      setTestCases(testCasesRes.data);
      setTestRuns(testRunsRes.data);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate module performance
  const modulePerformance = testCases.reduce((acc, tc) => {
    const runs = testRuns.filter(tr => tr.testCaseId === tc.id);
    const passed = runs.filter(r => r.result === 'PASSED').length;
    const failed = runs.filter(r => r.result === 'FAILED').length;
    
    const existing = acc.find(item => item.module === tc.module);
    if (existing) {
      existing.passed += passed;
      existing.failed += failed;
      existing.total += runs.length;
    } else {
      acc.push({
        module: tc.module,
        passed,
        failed,
        total: runs.length,
        passRate: runs.length > 0 ? Math.round((passed / runs.length) * 100) : 0
      });
    }
    return acc;
  }, [] as { module: string; passed: number; failed: number; total: number; passRate: number }[]);

  // Calculate tester performance
  const testerPerformance = testRuns.reduce((acc, tr) => {
    const tester = tr.executedBy?.username || 'Unknown';
    const existing = acc.find(item => item.tester === tester);
    if (existing) {
      existing.total += 1;
      if (tr.result === 'PASSED') existing.passed += 1;
      if (tr.result === 'FAILED') existing.failed += 1;
    } else {
      acc.push({
        tester,
        total: 1,
        passed: tr.result === 'PASSED' ? 1 : 0,
        failed: tr.result === 'FAILED' ? 1 : 0
      });
    }
    return acc;
  }, [] as { tester: string; total: number; passed: number; failed: number }[]);

  // Calculate daily trends
  const dailyTrends = testRuns.reduce((acc, tr) => {
    const date = formatDate(tr.executedAt);
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.total += 1;
      if (tr.result === 'PASSED') existing.passed += 1;
      if (tr.result === 'FAILED') existing.failed += 1;
    } else {
      acc.push({
        date,
        total: 1,
        passed: tr.result === 'PASSED' ? 1 : 0,
        failed: tr.result === 'FAILED' ? 1 : 0
      });
    }
    return acc;
  }, [] as { date: string; total: number; passed: number; failed: number }[]);

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      projectId,
      summary: {
        totalTestCases: testCases.length,
        totalTestRuns: testRuns.length,
        overallPassRate: testRuns.length > 0 
          ? Math.round((testRuns.filter(r => r.result === 'PASSED').length / testRuns.length) * 100) 
          : 0
      },
      modulePerformance,
      testerPerformance,
      dailyTrends,
      testCases: testCases.map(tc => ({
        id: tc.caseCode || tc.id,
        title: tc.title,
        module: tc.module,
        priority: tc.priority,
        status: tc.status
      })),
      testRuns: testRuns.map(tr => ({
        id: tr.id,
        testCaseId: testCases.find(tc => tc.id === tr.testCaseId)?.caseCode,
        result: tr.result,
        executedBy: tr.executedBy?.username,
        executedAt: tr.executedAt,
        duration: tr.duration
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${projectId}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading report data...</div>;
  }

  const totalPassed = testRuns.filter(r => r.result === 'PASSED').length;
  const totalFailed = testRuns.filter(r => r.result === 'FAILED').length;
  const overallPassRate = testRuns.length > 0 
    ? Math.round((totalPassed / testRuns.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground">Comprehensive testing metrics and insights</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 size-4" />
          Export Report
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Module Analysis</TabsTrigger>
          <TabsTrigger value="testers">Tester Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{testCases.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{testRuns.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{overallPassRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Failed Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{totalFailed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Execution Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Execution Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="passed" stroke="#22c55e" strokeWidth={2} name="Passed" />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} name="Failed" />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Total" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No execution data available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          {/* Module Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Module Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {modulePerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modulePerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="module" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="passed" fill="#22c55e" name="Passed" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No module data available</div>
              )}
            </CardContent>
          </Card>

          {/* Module Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Module Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {modulePerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Total Runs</TableHead>
                      <TableHead>Passed</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Pass Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modulePerformance.map(mod => (
                      <TableRow key={mod.module}>
                        <TableCell className="font-medium">{mod.module}</TableCell>
                        <TableCell>{mod.total}</TableCell>
                        <TableCell className="text-green-600">{mod.passed}</TableCell>
                        <TableCell className="text-red-600">{mod.failed}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              mod.passRate >= 80 
                                ? 'bg-green-500' 
                                : mod.passRate >= 60 
                                ? 'bg-orange-500' 
                                : 'bg-red-500'
                            }
                          >
                            {mod.passRate}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No module statistics available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testers" className="space-y-6">
          {/* Tester Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tester Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {testerPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={testerPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tester" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="Total" />
                    <Bar dataKey="passed" fill="#22c55e" name="Passed" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No tester data available</div>
              )}
            </CardContent>
          </Card>

          {/* Tester Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tester Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {testerPerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tester</TableHead>
                      <TableHead>Total Tests</TableHead>
                      <TableHead>Passed</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Success Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testerPerformance.map(tester => {
                      const successRate = Math.round((tester.passed / tester.total) * 100);
                      return (
                        <TableRow key={tester.tester}>
                          <TableCell className="font-medium">{tester.tester}</TableCell>
                          <TableCell>{tester.total}</TableCell>
                          <TableCell className="text-green-600">{tester.passed}</TableCell>
                          <TableCell className="text-red-600">{tester.failed}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                successRate >= 80 
                                  ? 'bg-green-500' 
                                  : successRate >= 60 
                                  ? 'bg-orange-500' 
                                  : 'bg-red-500'
                              }
                            >
                              {successRate}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No tester statistics available</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

