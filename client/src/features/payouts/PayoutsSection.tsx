import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Landmark } from 'lucide-react';

export function PayoutsSection() {
  const payouts = [
    {
      id: 'payout-1',
      amount: 50000,
      currency: 'USD',
      status: 'COMPLETED',
      destination: 'Bank Account Ending in 4192',
      date: '2026-11-01'
    }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Payouts & Disbursements</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">Withdraw accumulated voting revenue to institutional accounts</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Landmark className="h-4 w-4" /> Request Payout
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
              <div className="space-y-0.5">
                <span className="font-semibold">${(p.amount / 100).toFixed(2)} {p.currency}</span>
                <p className="text-xs text-muted-foreground">{p.destination}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{p.date}</span>
                <Badge variant="success">{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
