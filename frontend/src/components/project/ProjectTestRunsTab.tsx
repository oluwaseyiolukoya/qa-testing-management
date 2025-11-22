import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { PlayCircle, CheckCircle2, XCircle, AlertCircle, Clock, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { testRunsApi } from '../../lib/api/test-runs';
import { testCasesApi } from '../../lib/api/test-cases';
import type { TestRun, TestCase, TestResult } from '../../types';
import { formatDateTime } from '../../lib/utils';

interface ProjectTestRunsTabProps {
  projectId: string;
}

export function ProjectTestRunsTab({ projectId }: ProjectTestRunsTabProps) {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExecuteDialogOpen, setIsExecuteDialogOpen] = useState(false);
  const [viewingTestRun, setViewingTestRun] = useState<TestRun | null>(null);
  const [editingTestRun, setEditingTestRun] = useState<TestRun | null>(null);

  useEffect(() => {
    fetchTestRuns();
    fetchTestCases();
  }, [projectId]);

  const fetchTestRuns = async () => {
    setLoading(true);
    try {
      const response = await testRunsApi.getAll({ 
        limit: 100,
        projectId: projectId 
      });
      setTestRuns(response.data);
    } catch (error) {
      console.error('Failed to fetch test runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestCases = async () => {
    try {
      const response = await testCasesApi.getAll({ 
        projectId: projectId,
        limit: 100 
      });
      setTestCases(response.data);
    } catch (error) {
      console.error('Failed to fetch test cases:', error);
    }
  };

  const handleCreate = async (testRun: Partial<TestRun>) => {
    try {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : '';
      
      await testRunsApi.create({
        ...testRun,
        executedById: userId,
      });
      setIsExecuteDialogOpen(false);
      fetchTestRuns();
    } catch (error) {
      console.error('Failed to create test run:', error);
    }
  };

  const handleUpdate = async (id: string, testRun: Partial<TestRun>) => {
    try {
      await testRunsApi.update(id, testRun);
      setEditingTestRun(null);
      fetchTestRuns();
    } catch (error) {
      console.error('Failed to update test run:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test run?')) return;
    try {
      await testRunsApi.delete(id);
      fetchTestRuns();
    } catch (error) {
      console.error('Failed to delete test run:', error);
    }
  };

  const getResultIcon = (result: TestResult) => {
    switch (result) {
      case 'PASSED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'BLOCKED':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'SKIPPED':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getResultBadgeClass = (result: TestResult) => {
    switch (result) {
      case 'PASSED':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      case 'BLOCKED':
        return 'bg-orange-500';
      case 'SKIPPED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatResult = (result: TestResult) => {
    return result.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const sortedTestRuns = [...testRuns].sort((a, b) => 
    new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
  );

  const stats = {
    total: testRuns.length,
    passed: testRuns.filter(r => r.result === 'PASSED').length,
    failed: testRuns.filter(r => r.result === 'FAILED').length,
    blocked: testRuns.filter(r => r.result === 'BLOCKED').length,
    skipped: testRuns.filter(r => r.result === 'SKIPPED').length,
  };

  const avgDuration = testRuns.length > 0
    ? Math.round(testRuns.reduce((acc, r) => acc + (r.duration || 0), 0) / testRuns.length)
    : 0;

  const avgPassedDuration = stats.passed > 0
    ? Math.round(testRuns.filter(r => r.result === 'PASSED').reduce((acc, r) => acc + (r.duration || 0), 0) / stats.passed)
    : 0;

  const avgFailedDuration = stats.failed > 0
    ? Math.round(testRuns.filter(r => r.result === 'FAILED').reduce((acc, r) => acc + (r.duration || 0), 0) / stats.failed)
    : 0;

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading test runs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Execute Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Execution</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track test execution runs for this project
          </p>
        </div>
        <Dialog open={isExecuteDialogOpen} onOpenChange={setIsExecuteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlayCircle className="mr-2 h-4 w-4" />
              Execute Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Execute Test Case</DialogTitle>
            </DialogHeader>
            <ExecuteTestForm
              projectId={projectId}
              testCases={testCases}
              onSubmit={handleCreate}
              onCancel={() => setIsExecuteDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Execution Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Executions</span>
                <span className="font-semibold">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Passed</span>
                <span className="text-green-500 font-semibold">{stats.passed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Failed</span>
                <span className="text-red-500 font-semibold">{stats.failed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Blocked</span>
                <span className="text-orange-500 font-semibold">{stats.blocked}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Skipped</span>
                <span className="text-gray-500 font-semibold">{stats.skipped}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Duration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Overall</span>
                <span className="font-semibold">{avgDuration}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Passed Tests</span>
                <span className="text-green-500 font-semibold">{avgPassedDuration}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Failed Tests</span>
                <span className="text-red-500 font-semibold">{avgFailedDuration}s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Execute</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a test case to execute</p>
            {testCases.slice(0, 5).map(tc => (
              <div key={tc.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{tc.title}</p>
                  <p className="text-xs text-muted-foreground">{tc.module}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsExecuteDialogOpen(true);
                    // Pre-select this test case in the form
                  }}
                >
                  <PlayCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {testCases.length === 0 && (
              <p className="text-sm text-muted-foreground">No test cases available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Execution History Table */}
      {testRuns.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No test runs yet for this project</p>
              <Dialog open={isExecuteDialogOpen} onOpenChange={setIsExecuteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Execute First Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Execute Test Case</DialogTitle>
                  </DialogHeader>
                  <ExecuteTestForm
                    projectId={projectId}
                    testCases={testCases}
                    onSubmit={handleCreate}
                    onCancel={() => setIsExecuteDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Test Execution History</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Test Case</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Module</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Result</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Executed By</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Environment</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Date</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTestRuns.map(run => {
                    const testCase = testCases.find(tc => tc.id === run.testCaseId);
                    return (
                      <tr
                        key={run.id}
                        className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setViewingTestRun(run)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium font-mono">
                            {testCase?.caseCode || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            {testCase?.module || (run as any).test_case_module || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getResultIcon(run.result)}
                            <Badge className={getResultBadgeClass(run.result)}>
                              {formatResult(run.result)}
                            </Badge>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {(run as any).executed_by_username || run.executedBy?.username || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {run.environment}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {run.duration ? `${run.duration}s` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDateTime(run.executedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingTestRun(run);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTestRun(run);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(run.id);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      {viewingTestRun && (
        <Dialog open={!!viewingTestRun} onOpenChange={(open) => !open && setViewingTestRun(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Test Run Details</span>
                <Badge className={getResultBadgeClass(viewingTestRun.result)}>
                  {formatResult(viewingTestRun.result)}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Test Case</Label>
                  <p className="font-medium">
                    {testCases.find(tc => tc.id === viewingTestRun.testCaseId)?.title || 'Unknown'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Module</Label>
                  <p className="font-medium">
                    {testCases.find(tc => tc.id === viewingTestRun.testCaseId)?.module || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Executed By</Label>
                  <p className="font-medium">
                    {(viewingTestRun as any).executed_by_username || viewingTestRun.executedBy?.username || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Environment</Label>
                  <p className="font-medium">{viewingTestRun.environment}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{viewingTestRun.duration ? `${viewingTestRun.duration}s` : 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Executed At</Label>
                  <p className="font-medium">{formatDateTime(viewingTestRun.executedAt)}</p>
                </div>
              </div>
              {viewingTestRun.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm">{viewingTestRun.notes}</p>
                </div>
              )}
              {viewingTestRun.actualResult && (
                <div>
                  <Label className="text-muted-foreground">Actual Result</Label>
                  <p className="text-sm">{viewingTestRun.actualResult}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setViewingTestRun(null)}>Close</Button>
              <Button onClick={() => {
                setEditingTestRun(viewingTestRun);
                setViewingTestRun(null);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editingTestRun && (
        <Dialog open={!!editingTestRun} onOpenChange={() => setEditingTestRun(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Test Run</DialogTitle>
            </DialogHeader>
            <EditTestRunForm
              testRun={editingTestRun}
              onSubmit={(data) => handleUpdate(editingTestRun.id, data)}
              onCancel={() => setEditingTestRun(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface ExecuteTestFormProps {
  projectId: string;
  testCases: TestCase[];
  onSubmit: (testRun: Partial<TestRun>) => void;
  onCancel: () => void;
}

function ExecuteTestForm({ projectId: _projectId, testCases, onSubmit, onCancel }: ExecuteTestFormProps) {
  const [testCaseId, setTestCaseId] = useState('');
  const [result, setResult] = useState<TestResult>('PENDING');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState('');
  const [environment, setEnvironment] = useState('Production');
  const [actualResult, setActualResult] = useState('');
  const [buildVersion, setBuildVersion] = useState('');

  const selectedTestCase = testCases.find(tc => tc.id === testCaseId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      testCaseId,
      result,
      notes: notes || undefined,
      duration: duration ? parseInt(duration) : undefined,
      environment,
      actualResult: actualResult || undefined,
      buildVersion: buildVersion || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="testCase">Test Case *</Label>
        <Select value={testCaseId} onValueChange={setTestCaseId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a test case" />
          </SelectTrigger>
          <SelectContent>
            {testCases.map(tc => (
              <SelectItem key={tc.id} value={tc.id}>
                {tc.caseCode ? `${tc.caseCode} - ` : ''}{tc.title} ({tc.module})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTestCase && (
        <Card className="bg-muted">
          <CardContent className="pt-6 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Test Steps:</p>
            <ol className="space-y-1 ml-4">
              {selectedTestCase.steps.map((step, idx) => (
                <li key={idx} className="flex gap-2 text-sm">
                  <span className="text-muted-foreground">{idx + 1}.</span>
                  <span>{step.action}</span>
                </li>
              ))}
            </ol>
            <div className="pt-2">
              <p className="text-sm font-medium text-muted-foreground">Expected Result:</p>
              <p className="text-sm">{selectedTestCase.expectedResult}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="environment">Environment *</Label>
          <Select value={environment} onValueChange={setEnvironment} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Development">Development</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="buildVersion">Build Version</Label>
          <Input
            id="buildVersion"
            value={buildVersion}
            onChange={(e) => setBuildVersion(e.target.value)}
            placeholder="e.g., v1.2.3"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="result">Result *</Label>
          <Select value={result} onValueChange={(v) => setResult(v as TestResult)} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PASSED">Passed</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
              <SelectItem value="SKIPPED">Skipped</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g., 120"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="actualResult">Actual Result</Label>
        <Textarea
          id="actualResult"
          value={actualResult}
          onChange={(e) => setActualResult(e.target.value)}
          rows={3}
          placeholder="Describe the actual result..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Additional notes about this test run..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Submit Test Result</Button>
      </div>
    </form>
  );
}

interface EditTestRunFormProps {
  testRun: TestRun;
  onSubmit: (testRun: Partial<TestRun>) => void;
  onCancel: () => void;
}

function EditTestRunForm({ testRun, onSubmit, onCancel }: EditTestRunFormProps) {
  const [result, setResult] = useState<TestResult>(testRun.result);
  const [notes, setNotes] = useState(testRun.notes || '');
  const [duration, setDuration] = useState(testRun.duration?.toString() || '');
  const [actualResult, setActualResult] = useState(testRun.actualResult || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      result,
      notes: notes || undefined,
      duration: duration ? parseInt(duration) : undefined,
      actualResult: actualResult || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="result">Result *</Label>
        <Select value={result} onValueChange={(v) => setResult(v as TestResult)} required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="PASSED">Passed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
            <SelectItem value="SKIPPED">Skipped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (seconds)</Label>
        <Input
          id="duration"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g., 120"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="actualResult">Actual Result</Label>
        <Textarea
          id="actualResult"
          value={actualResult}
          onChange={(e) => setActualResult(e.target.value)}
          rows={3}
          placeholder="Describe the actual result..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Additional notes about this test run..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Test Run</Button>
      </div>
    </form>
  );
}
