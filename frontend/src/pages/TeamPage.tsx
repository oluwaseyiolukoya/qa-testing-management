import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { UserPlus, Edit, Trash2, Search, Users, Trophy, TrendingUp } from 'lucide-react';
import { usersApi, type User } from '../lib/api/users';
import { testRunsApi } from '../lib/api/test-runs';
import type { TestRun } from '../types';
import { formatDate } from '../lib/utils';

export function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, testRunsRes] = await Promise.all([
        usersApi.getAll({ limit: 1000 }),
        testRunsApi.getAll({ limit: 10000 }),
      ]);
      setTeamMembers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setTestRuns(Array.isArray(testRunsRes.data) ? testRunsRes.data : []);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      setTeamMembers([]);
      setTestRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.firstName && member.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.lastName && member.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && member.isActive) || 
      (filterStatus === 'inactive' && !member.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddMember = async (data: Partial<User>) => {
    try {
      await usersApi.create(data as any);
      setIsAddDialogOpen(false);
      await fetchData();
    } catch (error: any) {
      console.error('Failed to add team member:', error);
      console.log('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to add team member';
      alert(`${errorMessage}`);
    }
  };

  const handleUpdateMember = async (id: string, data: Partial<User>) => {
    try {
      await usersApi.update(id, data);
      setEditingMember(null);
      await fetchData();
    } catch (error) {
      console.error('Failed to update team member:', error);
      alert('Failed to update team member. Please try again.');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) {
      return;
    }
    try {
      await usersApi.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete team member:', error);
      alert('Failed to delete team member. Please try again.');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-500';
      case 'MANAGER': return 'bg-blue-500';
      case 'TESTER': return 'bg-green-500';
      case 'VIEWER': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'MANAGER': return 'Manager';
      case 'TESTER': return 'Tester';
      case 'VIEWER': return 'Viewer';
      default: return role;
    }
  };

  // Calculate member statistics
  const getMemberStats = (userId: string) => {
    const memberRuns = testRuns.filter(tr => tr.executedBy?.id === userId);
    const passed = memberRuns.filter(r => r.result === 'PASSED').length;
    const failed = memberRuns.filter(r => r.result === 'FAILED').length;
    const total = memberRuns.length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return { total, passed, failed, passRate };
  };

  const activeMembers = teamMembers.filter(m => m.isActive).length;
  const totalMembers = teamMembers.length;

  // Get top performers
  const topPerformers = teamMembers
    .map(member => {
      const stats = getMemberStats(member.id);
      return { ...member, ...stats };
    })
    .filter(m => m.total > 0)
    .sort((a, b) => b.passRate - a.passRate)
    .slice(0, 3);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading team data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground">
            Manage team members and track their performance
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 size-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <TeamMemberForm
              onSubmit={handleAddMember}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">{activeMembers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Testers</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {teamMembers.filter(m => m.role === 'TESTER').length}
            </div>
            <p className="text-xs text-muted-foreground">active testers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Managers</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {teamMembers.filter(m => m.role === 'MANAGER' || m.role === 'ADMIN').length}
            </div>
            <p className="text-xs text-muted-foreground">managers & admins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Viewers</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {teamMembers.filter(m => m.role === 'VIEWER').length}
            </div>
            <p className="text-xs text-muted-foreground">read-only access</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {topPerformers.map((performer, index) => (
            <Card key={performer.id} className={index === 0 ? 'border-yellow-500 border-2' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {index === 0 && <Trophy className="size-5 text-yellow-500" />}
                    Top Performer #{index + 1}
                  </CardTitle>
                  <TrendingUp className="size-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {performer.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {performer.firstName && performer.lastName 
                        ? `${performer.firstName} ${performer.lastName}` 
                        : performer.username}
                    </p>
                    <p className="text-xs text-muted-foreground">{getRoleLabel(performer.role)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tests Run</span>
                    <span className="font-medium">{performer.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pass Rate</span>
                    <Badge className="bg-green-500">{performer.passRate}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
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
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="TESTER">Tester</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tests Run</TableHead>
                  <TableHead>Pass Rate</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map(member => {
                  const stats = getMemberStats(member.id);
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {member.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.firstName && member.lastName 
                                ? `${member.firstName} ${member.lastName}` 
                                : member.username}
                            </p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.username}</TableCell>
                      <TableCell>
                        <Badge className={getRoleColor(member.role)}>{getRoleLabel(member.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive ? 'default' : 'secondary'}>
                          {member.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{stats.total}</TableCell>
                      <TableCell>
                        {stats.total > 0 ? (
                          <Badge 
                            className={
                              stats.passRate >= 80 
                                ? 'bg-green-500' 
                                : stats.passRate >= 60 
                                ? 'bg-orange-500' 
                                : 'bg-red-500'
                            }
                          >
                            {stats.passRate}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{formatDate(member.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMember(member)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No team members found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Member Dialog */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
            </DialogHeader>
            <TeamMemberForm
              initialData={editingMember}
              onSubmit={(data) => handleUpdateMember(editingMember.id, data)}
              onCancel={() => setEditingMember(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface TeamMemberFormProps {
  initialData?: User;
  onSubmit: (data: Partial<User>) => void;
  onCancel: () => void;
}

function TeamMemberForm({ initialData, onSubmit, onCancel }: TeamMemberFormProps) {
  const [username, setUsername] = useState(initialData?.username || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [firstName, setFirstName] = useState(initialData?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.lastName || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(initialData?.role || 'TESTER');
  const [isActive, setIsActive] = useState(initialData?.isActive !== false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Partial<User> = {
      username,
      email,
      firstName,
      lastName,
      role: role as User['role'],
      isActive,
    };
    
    // Only include password if it's provided (for new users or password changes)
    if (password) {
      (data as any).password = password;
    }
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={!!initialData}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password {!initialData && '*'}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!initialData}
          placeholder={initialData ? 'Leave blank to keep current password' : ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select value={role} onValueChange={(value) => setRole(value as User['role'])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MANAGER">Manager</SelectItem>
              <SelectItem value="TESTER">Tester</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={isActive ? 'active' : 'inactive'} onValueChange={(v) => setIsActive(v === 'active')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Add'} Member
        </Button>
      </div>
    </form>
  );
}

