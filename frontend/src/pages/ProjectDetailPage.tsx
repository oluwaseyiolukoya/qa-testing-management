import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { projectsApi, type Project } from '../lib/api/projects';
import { formatDate } from '../lib/utils';
import { ProjectOverviewTab } from '../components/project/ProjectOverviewTab';
import { ProjectTestCasesTab } from '../components/project/ProjectTestCasesTab';
import { ProjectTestRunsTab } from '../components/project/ProjectTestRunsTab';
import { ProjectReportsTab } from '../components/project/ProjectReportsTab';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab || 'overview';
  });

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);

  const fetchProject = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const projectData = await projectsApi.getById(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Projects
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <Badge variant="outline">{project.code}</Badge>
            </div>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {project.createdAt && (
                <span>Created {formatDate(project.createdAt)}</span>
              )}
              {(project.testCaseCount !== undefined && project.testCaseCount !== null) && (
                <span>{project.testCaseCount} test cases</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value);
          navigate(`/projects/${projectId}?tab=${value}`, { replace: true });
        }} 
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="test-runs">Test Runs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ProjectOverviewTab projectId={projectId!} />
        </TabsContent>

        <TabsContent value="test-cases">
          <ProjectTestCasesTab projectId={projectId!} />
        </TabsContent>

        <TabsContent value="test-runs">
          <ProjectTestRunsTab projectId={projectId!} />
        </TabsContent>

        <TabsContent value="reports">
          <ProjectReportsTab projectId={projectId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

