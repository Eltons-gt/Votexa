import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Wallet } from '@votexa/shared';

export function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <Card className="bg-gradient-to-br from-card to-muted/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <WalletIcon className="h-4 w-4 text-primary" /> Tenant Vault Balance
        </CardTitle>
        <Badge variant="outline">{wallet.currency}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-3xl font-extrabold tracking-tight">
            ${(wallet.availableBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pending clearance: ${(wallet.pendingBalance / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="flex-1 p-2 rounded bg-muted/50 text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowDownLeft className="h-4 w-4" /> Paid Voting Inflow
          </div>
          <div className="flex-1 p-2 rounded bg-muted/50 text-xs flex items-center gap-1.5 text-muted-foreground font-medium">
            <ArrowUpRight className="h-4 w-4" /> Verified Payouts
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
