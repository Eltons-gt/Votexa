import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { TrendingUp, DollarSign, Activity } from 'lucide-react';

export function RevenueOverview({
  totalRevenue,
  votingFees,
  payouts
}: {
  totalRevenue: number;
  votingFees: number;
  payouts: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-500" /> Platform gross receipts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Voting Inflow</CardTitle>
          <Activity className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(votingFees / 100).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">Paid ticket & candidate fees</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs font-medium uppercase text-muted-foreground">Disbursed Payouts</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(payouts / 100).toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">Cleared organization withdrawals</p>
        </CardContent>
      </Card>
    </div>
  );
}
