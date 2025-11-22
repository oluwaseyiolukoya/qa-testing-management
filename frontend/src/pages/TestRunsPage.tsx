import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function TestRunsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Test Runs</h2>
        <p className="text-muted-foreground">
          Track and manage test executions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Runs Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Test runs management interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

