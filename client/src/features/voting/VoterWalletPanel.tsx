import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Coins,
  Plus,
  History,
  Lock,
  ArrowDownRight,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import {
  VoterWallet,
  WalletTransaction,
  WalletTransactionType,
  ElectionCategory,
  PurchasePackageResponse
} from '@votexa/shared';
import { PackagePurchaseModal } from './PackagePurchaseModal';
import { apiClient } from '../../lib/api';

interface VoterWalletPanelProps {
  electionId: string;
  category: ElectionCategory;
  voterCode: string;
  onBalanceChanged?: (newBalance: number) => void;
}

export function VoterWalletPanel({
  electionId,
  category,
  voterCode,
  onBalanceChanged
}: VoterWalletPanelProps) {
  const [wallet, setWallet] = useState<VoterWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const fetchWallet = async () => {
    if (category === ElectionCategory.INSTITUTIONAL) {
      return;
    }

    try {
      const res = await apiClient.get<{ wallet: VoterWallet; transactions: WalletTransaction[] }>(
        `/voting/wallet/${electionId}?voterCode=${encodeURIComponent(voterCode)}`
      );
      if (res.data) {
        setWallet(res.data.wallet);
        setTransactions(res.data.transactions);
        if (onBalanceChanged) {
          onBalanceChanged(res.data.wallet.creditsBalance);
        }
      }
    } catch {
      // Fallback
      const fallbackWallet: VoterWallet = {
        id: 'wlt-demo',
        organizationId: 'current',
        electionId,
        voterCode,
        creditsBalance: 5,
        currency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setWallet(fallbackWallet);
      setTransactions([
        {
          id: 'tx-demo-1',
          walletId: 'wlt-demo',
          electionId,
          type: WalletTransactionType.PURCHASE,
          creditsAmount: 5,
          balanceAfter: 5,
          referenceId: 'MOCK-PAY-DEMO',
          description: 'Supporter 5-Pack Package Purchase',
          isMockPayment: true,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [electionId, voterCode, category]);

  const handlePurchased = (res: PurchasePackageResponse) => {
    setWallet(res.wallet);
    setTransactions([res.transaction, ...transactions]);
    if (onBalanceChanged) {
      onBalanceChanged(res.wallet.creditsBalance);
    }
  };

  // If institutional election, show institutional rule info
  if (category === ElectionCategory.INSTITUTIONAL) {
    return (
      <Card className="bg-blue-500/5 border-blue-500/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-foreground">Institutional Ballot Rule</span>
                <Badge variant="outline" className="border-blue-500/30 text-blue-500 text-[10px]">
                  Zero Credits Required
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Every eligible voter is granted strictly <b>one ballot per position</b>. Vote purchases are disabled.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <Lock className="h-3.5 w-3.5" />
            <span>Voter: {voterCode}</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="bg-gradient-to-r from-amber-500/5 via-primary/5 to-transparent border-amber-500/30 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 shadow-sm">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">Election Voting Wallet</span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px]">
                  Election-Scoped
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-foreground">
                  {wallet?.creditsBalance ?? 0}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  Available Voting Credits
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs h-8 gap-1.5"
            >
              <History className="h-3.5 w-3.5" />
              {showHistory ? 'Hide History' : 'History'}
            </Button>
            <Button
              size="sm"
              onClick={() => setShowPurchaseModal(true)}
              className="text-xs h-8 gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Top-Up Credits
            </Button>
          </div>
        </div>

        {/* Expandable Transaction History */}
        {showHistory && (
          <div className="pt-4 mt-4 border-t space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-primary" /> Wallet Credit Ledger
              </span>
              <span className="text-[10px] text-muted-foreground">
                Target: {voterCode}
              </span>
            </div>

            {transactions.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-2 text-center">
                No credit transactions recorded yet.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-2.5 rounded-lg bg-background/60 border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {tx.type === WalletTransactionType.PURCHASE ? (
                        <ArrowDownRight className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground text-[11px]">{tx.description}</span>
                          {tx.isMockPayment && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              Sandbox Mock
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          Ref: {tx.referenceId || tx.id.slice(0, 12)} • {new Date(tx.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-black text-xs ${
                          tx.creditsAmount > 0 ? 'text-emerald-500' : 'text-foreground'
                        }`}
                      >
                        {tx.creditsAmount > 0 ? `+${tx.creditsAmount}` : tx.creditsAmount} Credits
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        Bal: {tx.balanceAfter}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Top-up Modal */}
      <PackagePurchaseModal
        electionId={electionId}
        voterCode={voterCode}
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onPurchased={handlePurchased}
      />
    </div>
  );
}
