import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Edit, Trash2, FolderOpen, Code, Layers } from 'lucide-react';
import { projectsApi, type Project } from '../lib/api/projects';
import { versionsApi, type Version } from '../lib/api/versions';
import { modulesApi, type Module } from '../lib/api/modules';
import { formatDate } from '../lib/utils';

export function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [activeTab, selectedProject]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'projects') {
        const response = await projectsApi.getAll();
        setProjects(response.data);
      } else if (activeTab === 'versions') {
        const params = selectedProject !== 'all' ? { projectId: selectedProject } : {};
        const response = await versionsApi.getAll(params);
        setVersions(response.data);
      } else if (activeTab === 'modules') {
        const params = selectedProject !== 'all' ? { projectId: selectedProject } : {};
        const response = await modulesApi.getAll(params);
        setModules(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Project Management</h2>
        <p className="text-muted-foreground">
          Manage projects, versions, and modules
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">
            <FolderOpen className="mr-2 size-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="versions">
            <Code className="mr-2 size-4" />
            Versions
          </TabsTrigger>
          <TabsTrigger value="modules">
            <Layers className="mr-2 size-4" />
            Modules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectsTab 
            projects={projects} 
            loading={loading}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="versions">
          <VersionsTab 
            versions={versions}
            projects={projects}
            loading={loading}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            onRefresh={fetchData}
          />
        </TabsContent>

        <TabsContent value="modules">
          <ModulesTab 
            modules={modules}
            projects={projects}
            loading={loading}
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            onRefresh={fetchData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Projects Tab Component
function ProjectsTab({ projects, loading, onRefresh }: { projects: Project[]; loading: boolean; onRefresh: () => void }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleCreate = async (data: Partial<Project>) => {
    try {
      await projectsApi.create(data);
      setIsCreateOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Project>) => {
    try {
      await projectsApi.update(id, data);
      setEditingProject(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await projectsApi.delete(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <ProjectForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {projects.map(project => (
          <Card key={project.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <Badge variant="outline">{project.code}</Badge>
                    {project.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{project.testCaseCount || 0} test cases</span>
                    <span>Created {formatDate(project.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingProject(project)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <ProjectForm
              initialData={editingProject}
              onSubmit={(data) => handleUpdate(editingProject.id, data)}
              onCancel={() => setEditingProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Versions Tab Component
function VersionsTab({ 
  versions, 
  projects, 
  loading, 
  selectedProject, 
  onProjectChange,
  onRefresh 
}: { 
  versions: Version[]; 
  projects: Project[];
  loading: boolean;
  selectedProject: string;
  onProjectChange: (id: string) => void;
  onRefresh: () => void;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVersion, setEditingVersion] = useState<Version | null>(null);

  const handleCreate = async (data: Partial<Version>) => {
    try {
      await versionsApi.create(data);
      setIsCreateOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Version>) => {
    try {
      await versionsApi.update(id, data);
      setEditingVersion(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to update version:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this version?')) return;
    try {
      await versionsApi.delete(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete version:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={selectedProject} onValueChange={onProjectChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Create Version
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Version</DialogTitle>
            </DialogHeader>
            <VersionForm 
              projects={projects}
              onSubmit={handleCreate} 
              onCancel={() => setIsCreateOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {versions.map(version => (
          <Card key={version.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{version.name}</h3>
                    {version.projectName && (
                      <Badge variant="outline">{version.projectName}</Badge>
                    )}
                    {version.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  {version.description && (
                    <p className="text-sm text-muted-foreground mb-2">{version.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {version.releaseDate && (
                      <span>Release: {formatDate(version.releaseDate)}</span>
                    )}
                    <span>Created {formatDate(version.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingVersion(version)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(version.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingVersion && (
        <Dialog open={!!editingVersion} onOpenChange={() => setEditingVersion(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Version</DialogTitle>
            </DialogHeader>
            <VersionForm
              projects={projects}
              initialData={editingVersion}
              onSubmit={(data) => handleUpdate(editingVersion.id, data)}
              onCancel={() => setEditingVersion(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Modules Tab Component
function ModulesTab({ 
  modules, 
  projects, 
  loading, 
  selectedProject, 
  onProjectChange,
  onRefresh 
}: { 
  modules: Module[]; 
  projects: Project[];
  loading: boolean;
  selectedProject: string;
  onProjectChange: (id: string) => void;
  onRefresh: () => void;
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const handleCreate = async (data: Partial<Module>) => {
    try {
      await modulesApi.create(data);
      setIsCreateOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to create module:', error);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Module>) => {
    try {
      await modulesApi.update(id, data);
      setEditingModule(null);
      onRefresh();
    } catch (error) {
      console.error('Failed to update module:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await modulesApi.delete(id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={selectedProject} onValueChange={onProjectChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Create Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Module</DialogTitle>
            </DialogHeader>
            <ModuleForm 
              projects={projects}
              onSubmit={handleCreate} 
              onCancel={() => setIsCreateOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {modules.map(module => (
          <Card key={module.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{module.name}</h3>
                    {module.projectName && (
                      <Badge variant="outline">{module.projectName}</Badge>
                    )}
                    {module.isActive ? (
                      <Badge className="bg-green-500">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                  {module.description && (
                    <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{module.testCaseCount || 0} test cases</span>
                    <span>Created {formatDate(module.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingModule(module)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(module.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingModule && (
        <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
            </DialogHeader>
            <ModuleForm
              projects={projects}
              initialData={editingModule}
              onSubmit={(data) => handleUpdate(editingModule.id, data)}
              onCancel={() => setEditingModule(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Form Components
function ProjectForm({ initialData, onSubmit, onCancel }: {
  initialData?: Project;
  onSubmit: (data: Partial<Project>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, code, description, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Code *</Label>
        <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'} Project</Button>
      </div>
    </form>
  );
}

function VersionForm({ projects, initialData, onSubmit, onCancel }: {
  projects: Project[];
  initialData?: Version;
  onSubmit: (data: Partial<Version>) => void;
  onCancel: () => void;
}) {
  const [projectId, setProjectId] = useState(initialData?.projectId || '');
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [releaseDate, setReleaseDate] = useState(initialData?.releaseDate?.split('T')[0] || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ projectId, name, description, releaseDate: releaseDate || undefined, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectId">Project *</Label>
        <Select value={projectId} onValueChange={setProjectId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Version Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., v1.0" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="releaseDate">Release Date</Label>
        <Input type="date" id="releaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'} Version</Button>
      </div>
    </form>
  );
}

function ModuleForm({ projects, initialData, onSubmit, onCancel }: {
  projects: Project[];
  initialData?: Module;
  onSubmit: (data: Partial<Module>) => void;
  onCancel: () => void;
}) {
  const [projectId, setProjectId] = useState(initialData?.projectId || '');
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ projectId, name, description, isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectId">Project *</Label>
        <Select value={projectId} onValueChange={setProjectId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Module Name *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Authentication" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        <Label htmlFor="isActive">Active</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'} Module</Button>
      </div>
    </form>
  );
}

