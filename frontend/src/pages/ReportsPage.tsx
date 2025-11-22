import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          View detailed reports and analytics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Reports interface coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

