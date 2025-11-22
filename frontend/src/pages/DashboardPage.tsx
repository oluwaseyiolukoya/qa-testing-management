import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Plus, FolderOpen, ArrowRight, CheckCircle, XCircle, TrendingUp, TrendingDown, RefreshCw, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { projectsApi, type Project } from '../lib/api/projects';
import { testCasesApi } from '../lib/api/test-cases';
import { testRunsApi } from '../lib/api/test-runs';
import { formatDate } from '../lib/utils';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState({
    totalTestCases: 0,
    activeTestCases: 0,
    totalTestRuns: 0,
    passedRuns: 0,
    failedRuns: 0,
    blockedRuns: 0,
    skippedRuns: 0,
    passRate: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when navigating back to dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchData();
    }
  }, [location.pathname]);

  // Refresh data when window regains focus (user returns to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (location.pathname === '/dashboard') {
        fetchData();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel - get ALL projects, test cases, and test runs
      const [projectsRes, testCasesRes, testRunsRes] = await Promise.all([
        projectsApi.getAll({ isActive: true, limit: 1000 }),
        testCasesApi.getAll({ limit: 10000 }), // Increased limit to get all test cases
        testRunsApi.getAll({ limit: 10000 }), // Increased limit to get all test runs
      ]);

      // Ensure projects have properly formatted test case counts
      const projectsWithCounts = projectsRes.data.map(project => {
        const count = typeof project.testCaseCount === 'number' 
          ? project.testCaseCount 
          : (project.testCaseCount ? parseInt(String(project.testCaseCount), 10) : 0);
        
        return {
          ...project,
          testCaseCount: isNaN(count) ? 0 : count
        };
      });

      setProjects(projectsWithCounts);
      
      // Calculate metrics from ALL projects (aggregated)
      const testCases = testCasesRes.data;
      const testRuns = testRunsRes.data;
      
      // Filter to only include test cases/test runs that belong to active projects
      const activeProjectIds = new Set(projectsRes.data.map(p => p.id));
      const filteredTestCases = testCases.filter(tc => 
        !tc.projectId || activeProjectIds.has(tc.projectId)
      );
      const filteredTestRuns = testRuns.filter(tr => {
        // Test runs are linked via test cases, so we need to check if the test case belongs to an active project
        const testCase = testCases.find(tc => tc.id === tr.testCaseId);
        return !testCase?.projectId || activeProjectIds.has(testCase.projectId);
      });
      
      const totalTestCases = filteredTestCases.length;
      const activeTestCases = filteredTestCases.filter(tc => 
        tc.status === 'TODO' || tc.status === 'IN_PROGRESS'
      ).length;
      
      const totalTestRuns = filteredTestRuns.length;
      const passedRuns = filteredTestRuns.filter(tr => tr.result === 'PASSED').length;
      const failedRuns = filteredTestRuns.filter(tr => tr.result === 'FAILED').length;
      const blockedRuns = filteredTestRuns.filter(tr => tr.result === 'BLOCKED').length;
      const skippedRuns = filteredTestRuns.filter(tr => tr.result === 'SKIPPED').length;
      const passRate = totalTestRuns > 0 
        ? Math.round((passedRuns / totalTestRuns) * 100 * 10) / 10 
        : 0;

      setMetrics({
        totalTestCases,
        activeTestCases,
        totalTestRuns,
        passedRuns,
        failedRuns,
        blockedRuns,
        skippedRuns,
        passRate,
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    try {
      const newProject = await projectsApi.create(data);
      setIsCreateOpen(false);
      // Refresh data to update metrics and project list
      await fetchData();
      // Navigate to the new project
      navigate(`/projects/${newProject.id}`);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create project';
      alert(`Error creating project: ${errorMessage}`);
    }
  };

  const handleUpdateProject = async (id: string, data: Partial<Project>) => {
    try {
      await projectsApi.update(id, data);
      setEditingProject(null);
      await fetchData();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated test cases, test runs, and reports.')) {
      return;
    }
    try {
      await projectsApi.delete(id);
      await fetchData();
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to delete project';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of all projects, test cases, and test runs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <ProjectForm onSubmit={handleCreateProject} onCancel={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Test Cases</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTestCases}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeTestCases} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pass Rate</CardTitle>
            {metrics.passRate >= 80 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.passRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.passedRuns} of {metrics.totalTestRuns} passed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Tests</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedRuns}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.blockedRuns} blocked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Projects</h3>
          <p className="text-sm text-muted-foreground">
            Create a project to start managing test cases, test runs, and reports
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to start organizing your test cases and test runs
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 size-4" />
                Create Your First Project
              </Button>
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
                    <th className="text-left py-3 px-4 font-semibold text-sm">Project Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Test Cases</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => {
                    const testCaseCount = typeof project.testCaseCount === 'number' 
                      ? project.testCaseCount 
                      : (project.testCaseCount ? parseInt(String(project.testCaseCount), 10) : 0);
                    
                    return (
                      <tr 
                        key={`${project.id}-${testCaseCount}`}
                        className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium">{project.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{project.code}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                            {project.description || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {testCaseCount}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(project.createdAt)}
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
                                  handleProjectClick(project.id);
                                }}>
                                  <ArrowRight className="mr-2 h-4 w-4" />
                                  Open
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProject(project);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProject(project.id);
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

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              initialData={editingProject}
              onSubmit={(data) => handleUpdateProject(editingProject.id, data)}
              onCancel={() => setEditingProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Partial<Project>) => void;
  onCancel: () => void;
}

function ProjectForm({ initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, code, description, isActive: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g., Website Redesign"
          required 
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Project Code *</Label>
        <Input 
          id="code" 
          value={code} 
          onChange={(e) => setCode(e.target.value.toUpperCase())} 
          placeholder="e.g., WEB-REDESIGN"
          required 
        />
        <p className="text-xs text-muted-foreground">
          Unique identifier for this project (uppercase, no spaces)
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Brief description of the project..."
          rows={3} 
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
          <Button type="submit">
            {initialData ? 'Update' : 'Create'} Project
          </Button>
      </div>
    </form>
  );
}
