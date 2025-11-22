import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { userActivityApi, type UserStats, type TestRunActivity, type AssignedStats } from '../lib/api/user-activity';
import { projectsApi, type Project } from '../lib/api/projects';
import { formatDateTime } from '../lib/utils';

export function UserActivityPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [testRuns, setTestRuns] = useState<TestRunActivity[]>([]);
  const [assignedStats, setAssignedStats] = useState<AssignedStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchUserActivity();
  }, [selectedProject, selectedUser]);

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll({ isActive: true });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchUserActivity = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedProject !== 'all') filters.projectId = selectedProject;
      if (selectedUser !== 'all') filters.userId = selectedUser;

      const data = await userActivityApi.getUserActivity(filters);
      setUserStats(data.userStats);
      setTestRuns(data.testRuns);
      setAssignedStats(data.assignedStats);
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadgeClass = (result: string) => {
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
        return 'bg-gray-400';
    }
  };

  const totalTests = userStats.reduce((acc, u) => acc + u.total_tests, 0);
  const totalPassed = userStats.reduce((acc, u) => acc + u.passed_tests, 0);
  const totalFailed = userStats.reduce((acc, u) => acc + u.failed_tests, 0);
  const avgDuration = userStats.length > 0
    ? Math.round(userStats.reduce((acc, u) => acc + (u.avg_duration || 0), 0) / userStats.length)
    : 0;

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading user activity...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">User Activity Report</h1>
        <p className="text-muted-foreground mt-1">
          Track which users are working on test cases and their execution history
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filter by Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {userStats.map(u => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.username} ({u.first_name} {u.last_name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests Executed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              By {userStats.length} user{userStats.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed Tests</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{totalPassed}</div>
            <p className="text-xs text-muted-foreground">
              {totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}% pass rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{totalFailed}</div>
            <p className="text-xs text-muted-foreground">
              {totalTests > 0 ? Math.round((totalFailed / totalTests) * 100) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration}s</div>
            <p className="text-xs text-muted-foreground">Per test execution</p>
          </CardContent>
        </Card>
      </div>

      {/* User Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Total Tests</TableHead>
                <TableHead className="text-right">Passed</TableHead>
                <TableHead className="text-right">Failed</TableHead>
                <TableHead className="text-right">Blocked</TableHead>
                <TableHead className="text-right">Avg Duration</TableHead>
                <TableHead className="text-right">Assigned</TableHead>
                <TableHead>Last Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userStats.map(user => {
                const assigned = assignedStats.find(a => a.user_id === user.user_id);
                return (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.username || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.first_name || ''} {user.last_name || ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{user.total_tests || 0}</TableCell>
                    <TableCell className="text-right text-green-500">{user.passed_tests || 0}</TableCell>
                    <TableCell className="text-right text-red-500">{user.failed_tests || 0}</TableCell>
                    <TableCell className="text-right text-orange-500">{user.blocked_tests || 0}</TableCell>
                    <TableCell className="text-right">{Math.round(user.avg_duration || 0)}s</TableCell>
                    <TableCell className="text-right">
                      {assigned ? (
                        <div className="text-sm">
                          <div>{assigned.assigned_count || 0} total</div>
                          <div className="text-xs text-muted-foreground">
                            {assigned.todo_count || 0} todo, {assigned.in_progress_count || 0} in progress
                          </div>
                        </div>
                      ) : (
                        '0'
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.last_test_date ? formatDateTime(user.last_test_date) : 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Test Executions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Test Case</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Executed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testRuns.slice(0, 50).map(run => (
                <TableRow key={run.test_run_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{run.username || 'Unknown'}</div>
                      {run.first_name && run.last_name && (
                        <div className="text-xs text-muted-foreground">
                          {run.first_name} {run.last_name}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">{run.case_code || 'N/A'}</div>
                      <div className="text-sm">{run.test_case_title || 'Unknown Test Case'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{run.module || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {run.project_code && <span className="font-mono text-xs">{run.project_code}</span>}
                      {run.project_name && <div className="text-muted-foreground">{run.project_name}</div>}
                      {!run.project_code && !run.project_name && <span className="text-muted-foreground">N/A</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getResultBadgeClass(run.result)}>
                      {run.result || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{run.duration ? `${run.duration}s` : 'N/A'}</TableCell>
                  <TableCell className="text-sm">{run.environment || 'N/A'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(run.executed_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

