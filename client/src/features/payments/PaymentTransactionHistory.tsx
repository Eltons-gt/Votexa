import { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Coins,
  Receipt
} from 'lucide-react';
import {
  PaymentTransactionRecord,
  PaymentTransactionStatus
} from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface PaymentTransactionHistoryProps {
  electionId?: string;
  voterCode?: string;
  onRefresh?: () => void;
}

export function PaymentTransactionHistory({
  electionId,
  voterCode,
  onRefresh
}: PaymentTransactionHistoryProps) {
  const [transactions, setTransactions] = useState<PaymentTransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let url = '/payments?';
      if (electionId) url += `electionId=${electionId}&`;
      if (voterCode) url += `voterCode=${voterCode}&`;

      const res = await apiClient.get<{ transactions: PaymentTransactionRecord[] }>(url);
      if (res.data?.transactions) {
        setTransactions(res.data.transactions);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [electionId, voterCode]);

  const handleManualRefresh = () => {
    fetchTransactions();
    if (onRefresh) onRefresh();
  };

  const getStatusBadge = (status: PaymentTransactionStatus) => {
    switch (status) {
      case PaymentTransactionStatus.SUCCESS:
        return (
          <Badge variant="success" className="gap-1 text-[10px] uppercase font-bold">
            <CheckCircle2 className="h-3 w-3" /> Success
          </Badge>
        );
      case PaymentTransactionStatus.PENDING:
        return (
          <Badge variant="outline" className="gap-1 text-[10px] uppercase font-bold border-amber-500/40 text-amber-500 animate-pulse">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case PaymentTransactionStatus.FAILED:
        return (
          <Badge variant="destructive" className="gap-1 text-[10px] uppercase font-bold">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-emerald-600" />
          <h4 className="text-sm font-bold text-foreground">M-Pesa Payment History</h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualRefresh}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground">
          Loading payment history...
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-6 text-center rounded-xl border border-dashed text-xs text-muted-foreground space-y-1">
          <Smartphone className="h-6 w-6 text-muted-foreground mx-auto opacity-50" />
          <p>No M-Pesa payments recorded yet.</p>
        </div>
      ) : (
        <div className="divide-y rounded-xl border bg-card/50 overflow-hidden">
          {transactions.map((tx) => (
            <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground">
                    {tx.mpesaReceiptNumber || tx.checkoutRequestId.substring(0, 14)}
                  </span>
                  {getStatusBadge(tx.status)}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{new Date(tx.createdAt).toLocaleString()}</span>
                  {tx.phoneNumber && (
                    <span className="font-mono flex items-center gap-1">
                      <Smartphone className="h-3 w-3" /> {tx.phoneNumber}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="font-mono font-bold text-sm text-foreground">
                  ${(tx.amountCents / 100).toFixed(2)}
                </span>
                {tx.creditsIssued && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                    <Coins className="h-3 w-3" /> Credits Credited
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
