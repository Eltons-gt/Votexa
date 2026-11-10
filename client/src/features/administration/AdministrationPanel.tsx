import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Server, ShieldCheck, Database, Layers } from 'lucide-react';

export function AdministrationPanel() {
  const stats = [
    { label: 'Active Organizations', value: '48', icon: Layers },
    { label: 'Running Elections', value: '19', icon: ShieldCheck },
    { label: 'Database Health', value: 'PostgreSQL Operational', icon: Database },
    { label: 'Engine Foundation', value: 'Phase 1 Established', icon: Server }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Platform Administration</h2>
          <p className="text-xs text-muted-foreground">Multi-tenant governance, system health, and audit oversight</p>
        </div>
        <Badge variant="success" className="gap-1">
          System Operational
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs uppercase text-muted-foreground font-semibold">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
