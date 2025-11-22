import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  FolderOpen, 
  FileCheck, 
  PlayCircle, 
  BarChart,
  ChevronRight,
  ChevronDown,
  Layers
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { projectsApi, type Project } from '../../lib/api/projects';
import type { User } from '../../types';

interface SidebarProps {
  className?: string;
  currentUser: User | null;
}

export function Sidebar({ className, currentUser }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId?: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openProjects, setOpenProjects] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Auto-expand projects menu if on a project page
    if (projectId) {
      setOpenProjects(prev => {
        if (!prev.includes(projectId)) {
          return [...prev, projectId];
        }
        return prev;
      });
    }
  }, [projectId]);

  // Refresh projects when navigating to dashboard
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      fetchProjects();
    }
  }, [location.pathname]);

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll({ isActive: true });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isProjectActive = (id: string) => {
    return location.pathname.startsWith(`/projects/${id}`);
  };

  const toggleProject = (projectId: string) => {
    setOpenProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const menuItems = [
    {
      icon: BarChart3,
      label: 'Dashboard',
      path: '/dashboard',
    },
    // Only show Team menu for ADMIN users
    ...(currentUser?.role === 'ADMIN' ? [{
      icon: Users,
      label: 'Team',
      path: '/team',
    }] : []),
  ];

  return (
    <div className={cn("flex h-full w-64 flex-col border-r bg-background", className)}>
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {/* Main Menu Items */}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Projects Section */}
          <div className="pt-4">
            <div className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              Projects
            </div>
            
            {projects.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No projects
              </div>
            ) : (
              <div className="space-y-1">
                {projects.map((project) => {
                  const isOpen = openProjects.includes(project.id);
                  const projectActive = isProjectActive(project.id);
                  
                  return (
                    <Collapsible
                      key={project.id}
                      open={isOpen}
                      onOpenChange={() => toggleProject(project.id)}
                    >
                      <CollapsibleTrigger
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          projectActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          <span className="truncate">{project.name}</span>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="ml-4 mt-1 space-y-1">
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            location.pathname === `/projects/${project.id}` && !location.search.includes('tab=')
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>Overview</span>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/projects/${project.id}?tab=test-cases`)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            location.pathname === `/projects/${project.id}` && location.search.includes('tab=test-cases')
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <FileCheck className="h-4 w-4" />
                          <span>Test Cases</span>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/projects/${project.id}?tab=test-runs`)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            location.pathname === `/projects/${project.id}` && location.search.includes('tab=test-runs')
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <PlayCircle className="h-4 w-4" />
                          <span>Test Runs</span>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/projects/${project.id}?tab=reports`)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            location.pathname === `/projects/${project.id}` && location.search.includes('tab=reports')
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <BarChart className="h-4 w-4" />
                          <span>Reports</span>
                        </button>
                        
                        <button
                          onClick={() => navigate(`/projects/${project.id}/modules`)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            location.pathname === `/projects/${project.id}/modules`
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <Layers className="h-4 w-4" />
                          <span>Modules</span>
                        </button>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}

