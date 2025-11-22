import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, CheckCircle2, Trash2, MoreVertical, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { testCasesApi } from '../../lib/api/test-cases';
import { modulesApi } from '../../lib/api/modules';
import type { TestCase, Priority, TestCaseStatus } from '../../types';
import { getPriorityColor, getStatusColor, formatDateTime, formatTestCaseStatus } from '../../lib/utils';

interface ProjectTestCasesTabProps {
  projectId: string;
}

export function ProjectTestCasesTab({ projectId }: ProjectTestCasesTabProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);

  useEffect(() => {
    fetchTestCases();
    fetchModules();
  }, [projectId]);

  const fetchTestCases = async () => {
    setLoading(true);
    try {
      const response = await testCasesApi.getAll({ 
        limit: 100,
        projectId: projectId 
      });
      setTestCases(response.data);
    } catch (error) {
      console.error('Failed to fetch test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await modulesApi.getAll({ 
        projectId: projectId,
        isActive: true // Only fetch active modules
      });
      // Filter to only include active modules
      const activeModules = response.data
        .filter(m => m.isActive === true)
        .map(m => ({ id: m.id, name: m.name }));
      setModules(activeModules);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    }
  };

  const handleCreate = async (testCase: Partial<TestCase>) => {
    try {
      const newTestCase = await testCasesApi.create({
        ...testCase,
        projectId: projectId
      });
      setTestCases([...testCases, newTestCase]);
      setIsCreateDialogOpen(false);
      fetchTestCases(); // Refresh the list
    } catch (error) {
      console.error('Failed to create test case:', error);
    }
  };

  const handleUpdate = async (id: string, testCase: Partial<TestCase>) => {
    try {
      const updated = await testCasesApi.update(id, testCase);
      setTestCases(testCases.map(tc => tc.id === id ? updated : tc));
      setEditingTestCase(null);
      fetchTestCases(); // Refresh the list
    } catch (error) {
      console.error('Failed to update test case:', error);
    }
  };

  const handleMarkAsResolved = async (id: string) => {
    try {
      await testCasesApi.update(id, { status: 'RESOLVED' });
      fetchTestCases(); // Refresh the list
    } catch (error) {
      console.error('Failed to mark test case as resolved:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this test case?')) {
      return;
    }
    try {
      await testCasesApi.delete(id);
      setTestCases(testCases.filter(tc => tc.id !== id));
    } catch (error) {
      console.error('Failed to delete test case:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading test cases...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {testCases.length} test case{testCases.length !== 1 ? 's' : ''} in this project
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Create Test Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Test Case</DialogTitle>
            </DialogHeader>
            <TestCaseForm
              projectId={projectId}
              modules={modules}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {testCases.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No test cases yet for this project</p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Create First Test Case
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Test Case</DialogTitle>
                  </DialogHeader>
                  <TestCaseForm
                    projectId={projectId}
                    modules={modules}
                    onSubmit={handleCreate}
                    onCancel={() => setIsCreateDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Module</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Created</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Updated</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testCases.map(testCase => (
                    <tr
                      key={testCase.id} 
                      className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={async () => {
                        // Fetch full test case with all fields including steps
                        try {
                          const fullTestCase = await testCasesApi.getById(testCase.id);
                          setViewingTestCase(fullTestCase);
                        } catch (error) {
                          console.error('Failed to fetch test case:', error);
                          setViewingTestCase(testCase);
                        }
                      }}
                    >
                      <td className="py-3 px-4">
                        <div className="text-sm font-semibold font-mono">
                          {testCase.caseCode || 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{testCase.title}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{testCase.module}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPriorityColor(testCase.priority)}>
                          {testCase.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(testCase.status)}>
                          {formatTestCaseStatus(testCase.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {testCase.createdAt ? formatDateTime(testCase.createdAt) : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {testCase.updatedAt ? formatDateTime(testCase.updatedAt) : 'N/A'}
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
                                <DropdownMenuItem onClick={async (e) => {
                                  e.stopPropagation();
                                  // Fetch full test case with all fields including steps
                                  try {
                                    const fullTestCase = await testCasesApi.getById(testCase.id);
                                    setViewingTestCase(fullTestCase);
                                  } catch (error) {
                                    console.error('Failed to fetch test case:', error);
                                    setViewingTestCase(testCase);
                                  }
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                              <DropdownMenuItem onClick={async (e) => {
                                e.stopPropagation();
                                // Fetch full test case with steps for editing
                                try {
                                  const fullTestCase = await testCasesApi.getById(testCase.id);
                                  setEditingTestCase(fullTestCase);
                                } catch (error) {
                                  console.error('Failed to fetch test case:', error);
                                  setEditingTestCase(testCase);
                                }
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {testCase.status !== 'RESOLVED' && (
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsResolved(testCase.id);
                                }}>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                  Mark as Resolved
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(testCase.id);
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
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      {viewingTestCase && (
        <Dialog open={!!viewingTestCase} onOpenChange={(open) => !open && setViewingTestCase(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>Test Case: {viewingTestCase.caseCode || viewingTestCase.id}</span>
                <Badge className={getPriorityColor(viewingTestCase.priority)}>
                  {viewingTestCase.priority}
                </Badge>
                <Badge className={getStatusColor(viewingTestCase.status)}>
                  {formatTestCaseStatus(viewingTestCase.status)}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Header Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4">{viewingTestCase.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Test Case ID:</span>
                    <span className="ml-2 font-mono font-semibold">{viewingTestCase.caseCode || viewingTestCase.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Module:</span>
                    <Badge variant="outline" className="ml-2">{viewingTestCase.module}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Priority:</span>
                    <Badge className={`ml-2 ${getPriorityColor(viewingTestCase.priority)}`}>
                      {viewingTestCase.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(viewingTestCase.status)}`}>
                      {formatTestCaseStatus(viewingTestCase.status)}
                    </Badge>
                  </div>
                  {viewingTestCase.estimatedTime && (
                    <div>
                      <span className="text-muted-foreground">Estimated Time:</span>
                      <span className="ml-2 font-medium">{viewingTestCase.estimatedTime} minutes</span>
                    </div>
                  )}
                  {viewingTestCase.createdBy && (
                    <div>
                      <span className="text-muted-foreground">Created By:</span>
                      <span className="ml-2 font-medium">
                        {viewingTestCase.createdBy.username || viewingTestCase.createdBy.email || 'N/A'}
                      </span>
                    </div>
                  )}
                  {viewingTestCase.createdAt && (
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">{formatDateTime(viewingTestCase.createdAt)}</span>
                    </div>
                  )}
                  {viewingTestCase.updatedAt && (
                    <div>
                      <span className="text-muted-foreground">Updated:</span>
                      <span className="ml-2">{formatDateTime(viewingTestCase.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Description</h4>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {viewingTestCase.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Preconditions */}
              {viewingTestCase.preconditions && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Preconditions</h4>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">
                      {viewingTestCase.preconditions}
                    </p>
                  </div>
                </div>
              )}

              {/* Test Steps */}
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Test Steps</h4>
                {viewingTestCase.steps && viewingTestCase.steps.length > 0 ? (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <ol className="list-decimal list-inside space-y-3">
                      {viewingTestCase.steps.map((step, index) => (
                        <li key={index} className="text-sm">
                          <div className="font-medium">
                            {typeof step === 'string' ? step : step.action}
                          </div>
                          {typeof step === 'object' && step.expectedResult && (
                            <div className="ml-6 mt-1 text-muted-foreground text-xs">
                              <span className="font-medium">Expected:</span> {step.expectedResult}
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">No test steps defined</p>
                  </div>
                )}
              </div>

              {/* Expected Result */}
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Expected Result</h4>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">
                    {viewingTestCase.expectedResult || 'No expected result specified'}
                  </p>
                </div>
              </div>

              {/* Postconditions */}
              {viewingTestCase.postconditions && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Postconditions</h4>
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm whitespace-pre-wrap">
                      {viewingTestCase.postconditions}
                    </p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {viewingTestCase.tags && viewingTestCase.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingTestCase.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setViewingTestCase(null);
                    setEditingTestCase(viewingTestCase);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" onClick={() => setViewingTestCase(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editingTestCase && (
        <Dialog open={!!editingTestCase} onOpenChange={(open) => !open && setEditingTestCase(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Test Case</DialogTitle>
            </DialogHeader>
            <TestCaseForm
              projectId={projectId}
              modules={modules}
              initialData={editingTestCase}
              onSubmit={(testCase) => handleUpdate(editingTestCase.id, testCase)}
              onCancel={() => setEditingTestCase(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface TestCaseFormProps {
  projectId: string;
  modules: { id: string; name: string }[];
  initialData?: TestCase;
  onSubmit: (testCase: Partial<TestCase>) => void;
  onCancel: () => void;
}

function TestCaseForm({ projectId, modules, initialData, onSubmit, onCancel }: TestCaseFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [module, setModule] = useState(initialData?.module || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'MEDIUM');
  const [status, setStatus] = useState<TestCaseStatus>(initialData?.status || 'TODO');
  const [steps, setSteps] = useState(
    initialData?.steps && initialData.steps.length > 0
      ? initialData.steps.map(s => typeof s === 'string' ? s : s.action).join('\n')
      : ''
  );
  const [expectedResult, setExpectedResult] = useState(initialData?.expectedResult || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse steps from textarea (one per line)
    const parsedSteps = steps.split('\n')
      .filter(s => s.trim())
      .map((action, index) => ({
        id: initialData?.steps?.[index]?.id || `step-${index}`,
        stepNumber: index + 1,
        action: action.trim(),
        expectedResult: initialData?.steps?.[index]?.expectedResult || ''
      }));

    const testCaseData: Partial<TestCase> = {
      title,
      description,
      module,
      priority,
      status,
      expectedResult,
      projectId,
      steps: parsedSteps // Always include steps, even if empty array
    };

    console.log('Submitting test case with steps:', parsedSteps); // Debug log
    onSubmit(testCaseData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="module">Module</Label>
          {modules.length > 0 ? (
            <Select value={module} onValueChange={setModule} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-2">
              <Input
                id="module"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                required
                placeholder="e.g., Authentication"
              />
              <p className="text-xs text-muted-foreground">
                No modules defined. <a href={`/projects/${projectId}/modules`} className="text-primary hover:underline">Create modules</a> to organize test cases better.
              </p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(value) => setStatus(value as TestCaseStatus)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="steps">Test Steps (one per line)</Label>
        <Textarea
          id="steps"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="Step 1&#10;Step 2&#10;Step 3"
          rows={6}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expectedResult">Expected Result</Label>
        <Textarea
          id="expectedResult"
          value={expectedResult}
          onChange={(e) => setExpectedResult(e.target.value)}
          required
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Test Case
        </Button>
      </div>
    </form>
  );
}

