import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowLeft, Plus, Edit, Trash2, Layers, MoreVertical, CheckCircle2, XCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { modulesApi, type Module } from '../lib/api/modules';
import { projectsApi, type Project } from '../lib/api/projects';
import { formatDate } from '../lib/utils';

export function ProjectModulesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchModules();
    }
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const projectData = await projectsApi.getById(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Failed to fetch project:', error);
      navigate('/dashboard');
    }
  };

  const fetchModules = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      // Fetch all modules (both active and inactive) for the management page
      const response = await modulesApi.getAll({ 
        projectId: projectId
      });
      setModules(response.data);
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Module>) => {
    if (!projectId) return;
    try {
      await modulesApi.create({
        ...data,
        projectId: projectId
      });
      setIsCreateDialogOpen(false);
      fetchModules();
    } catch (error) {
      console.error('Failed to create module:', error);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Module>) => {
    try {
      await modulesApi.update(id, data);
      setEditingModule(null);
      fetchModules();
    } catch (error) {
      console.error('Failed to update module:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    try {
      await modulesApi.delete(id);
      fetchModules();
    } catch (error) {
      console.error('Failed to delete module:', error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await modulesApi.update(id, { isActive: !currentStatus });
      fetchModules();
    } catch (error) {
      console.error('Failed to update module status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading modules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}`)}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Project
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Modules</h1>
              {project && <Badge variant="outline">{project.name}</Badge>}
            </div>
            <p className="text-muted-foreground">
              Manage modules for this project. Modules can be selected when creating test cases.
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No modules yet for this project</p>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 size-4" />
                    Create First Module
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Module</DialogTitle>
                  </DialogHeader>
                  <ModuleForm
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
                    <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Description</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Created</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map(module => (
                    <tr key={module.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium">{module.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {module.description || '—'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {module.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {module.createdAt ? formatDate(module.createdAt) : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingModule(module)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleToggleStatus(module.id, module.isActive)}
                              >
                                {module.isActive ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                                    Mark as Inactive
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                    Mark as Active
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(module.id)}
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

      {/* Edit Dialog */}
      {editingModule && (
        <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
            </DialogHeader>
            <ModuleForm
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

interface ModuleFormProps {
  initialData?: Module;
  onSubmit: (module: Partial<Module>) => void;
  onCancel: () => void;
}

function ModuleForm({ initialData, onSubmit, onCancel }: ModuleFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description: description || undefined,
      isActive
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Module Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Authentication, Dashboard, API"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief description of this module"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={isActive ? 'active' : 'inactive'} onValueChange={(value) => setIsActive(value === 'active')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Only active modules will appear in test case module selection
        </p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Module
        </Button>
      </div>
    </form>
  );
}

