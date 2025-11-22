import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { testCasesApi } from '../lib/api/test-cases';
import type { TestCase, Priority, TestCaseStatus } from '../types';
import { getPriorityColor, formatDate } from '../lib/utils';

export function TestCasesPage() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewingTestCase, setViewingTestCase] = useState<TestCase | null>(null);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);

  useEffect(() => {
    fetchTestCases();
  }, []);

  const fetchTestCases = async () => {
    try {
      const response = await testCasesApi.getAll({ limit: 100 });
      setTestCases(response.data);
    } catch (error) {
      console.error('Failed to fetch test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (testCase: Partial<TestCase>) => {
    try {
      const newTestCase = await testCasesApi.create(testCase);
      setTestCases([...testCases, newTestCase]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create test case:', error);
    }
  };

  const handleUpdate = async (id: string, testCase: Partial<TestCase>) => {
    try {
      const updated = await testCasesApi.update(id, testCase);
      setTestCases(testCases.map(tc => tc.id === id ? updated : tc));
      setEditingTestCase(null);
    } catch (error) {
      console.error('Failed to update test case:', error);
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

  const modules = Array.from(new Set(testCases.map(tc => tc.module)));

  const filteredTestCases = testCases.filter(tc => {
    const matchesSearch = tc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = filterModule === 'all' || tc.module === filterModule;
    const matchesPriority = filterPriority === 'all' || tc.priority === filterPriority;
    return matchesSearch && matchesModule && matchesPriority;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading test cases...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Test Case Management</h2>
          <p className="text-muted-foreground">
            Manage and organize your test cases
          </p>
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
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search test cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map(module => (
                    <SelectItem key={module} value={module}>{module}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredTestCases.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {testCases.length === 0 
                  ? 'No test cases found. Create your first test case!'
                  : 'No test cases match your filters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTestCases.map(testCase => (
            <Card key={testCase.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{testCase.title}</h3>
                      <Badge className={getPriorityColor(testCase.priority)}>
                        {testCase.priority}
                      </Badge>
                      <Badge variant="outline">{testCase.module}</Badge>
                      {testCase.status && (
                        <Badge variant="outline">{testCase.status}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{testCase.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{testCase.steps?.length || 0} steps</span>
                      {testCase.createdAt && (
                        <span>Created {formatDate(testCase.createdAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingTestCase(testCase)}
                    >
                      <Eye className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTestCase(testCase)}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testCase.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewingTestCase} onOpenChange={() => setViewingTestCase(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Case Details</DialogTitle>
          </DialogHeader>
          {viewingTestCase && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <p className="mt-1">{viewingTestCase.title}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="mt-1">{viewingTestCase.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Module</Label>
                  <p className="mt-1">{viewingTestCase.module}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(viewingTestCase.priority)}>
                      {viewingTestCase.priority}
                    </Badge>
                  </div>
                </div>
              </div>
              {viewingTestCase.steps && viewingTestCase.steps.length > 0 && (
                <div>
                  <Label>Test Steps</Label>
                  <ol className="mt-2 space-y-2 list-decimal list-inside">
                    {viewingTestCase.steps.map((step, idx) => (
                      <li key={idx} className="text-sm">
                        {typeof step === 'string' ? step : step.action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              <div>
                <Label>Expected Result</Label>
                <p className="mt-1">{viewingTestCase.expectedResult}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTestCase} onOpenChange={() => setEditingTestCase(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test Case</DialogTitle>
          </DialogHeader>
          {editingTestCase && (
            <TestCaseForm
              initialData={editingTestCase}
              onSubmit={(testCase) => handleUpdate(editingTestCase.id, testCase)}
              onCancel={() => setEditingTestCase(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TestCaseFormProps {
  initialData?: TestCase;
  onSubmit: (testCase: Partial<TestCase>) => void;
  onCancel: () => void;
}

function TestCaseForm({ initialData, onSubmit, onCancel }: TestCaseFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [module, setModule] = useState(initialData?.module || '');
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'MEDIUM');
  const [status, setStatus] = useState<TestCaseStatus>(initialData?.status || 'TODO');
  const [steps, setSteps] = useState(
    initialData?.steps 
      ? initialData.steps.map(s => typeof s === 'string' ? s : s.action).join('\n')
      : ''
  );
  const [expectedResult, setExpectedResult] = useState(initialData?.expectedResult || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const testCaseData: Partial<TestCase> = {
      title,
      description,
      module,
      priority,
      status,
      expectedResult,
      steps: steps.split('\n')
        .filter(s => s.trim())
        .map((action, index) => ({
          id: `step-${index}`,
          stepNumber: index + 1,
          action: action.trim(),
          expectedResult: ''
        }))
    };

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
          <Input
            id="module"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            required
            placeholder="e.g., Authentication"
          />
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
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="DEPRECATED">Deprecated</SelectItem>
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
