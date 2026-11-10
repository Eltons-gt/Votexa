import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  DollarSign,
  Sparkles,
  AlertCircle,
  CreditCard,
  Lock,
  X
} from 'lucide-react';
import { VotingPackage, PurchasePackageResponse } from '@votexa/shared';
import { apiClient } from '../../lib/api';

interface PackagePurchaseModalProps {
  electionId: string;
  voterCode: string;
  isOpen: boolean;
  onClose: () => void;
  onPurchased: (res: PurchasePackageResponse) => void;
}

export function PackagePurchaseModal({
  electionId,
  voterCode,
  isOpen,
  onClose,
  onPurchased
}: PackagePurchaseModalProps) {
  const [packages, setPackages] = useState<VotingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get<VotingPackage[]>(`/voting/packages/${electionId}`);
        if (res.data && res.data.length > 0) {
          setPackages(res.data);
          setSelectedPkgId(res.data[0]?.id || null);
        } else {
          // Default fallback packages
          const fallback: VotingPackage[] = [
            {
              id: 'pkg-1',
              organizationId: 'current',
              electionId,
              name: 'Single Fan Vote',
              credits: 1,
              priceCents: 100,
              currency: 'USD',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'pkg-2',
              organizationId: 'current',
              electionId,
              name: 'Supporter 5-Pack',
              credits: 5,
              priceCents: 450,
              currency: 'USD',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'pkg-3',
              organizationId: 'current',
              electionId,
              name: 'Superfan 20-Pack',
              credits: 20,
              priceCents: 1600,
              currency: 'USD',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          setPackages(fallback);
          setSelectedPkgId('pkg-2');
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [isOpen, electionId]);

  if (!isOpen) return null;

  const handleSimulatePurchase = async () => {
    if (!selectedPkgId) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await apiClient.post<PurchasePackageResponse>('/voting/packages/purchase', {
        electionId,
        packageId: selectedPkgId,
        voterCode,
        paymentMethod: 'MOCK_SANDBOX'
      });

      if (res.data) {
        onPurchased(res.data);
        onClose();
      }
    } catch (err) {
      setErrorMsg((err as Error).message || 'Failed to complete credit purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[10px]">
                Election-Specific Credits
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                Dev Sandbox Mode
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mt-1">
              <Sparkles className="h-5 w-5 text-amber-500" /> Top-Up Voting Credits
            </h3>
            <p className="text-xs text-muted-foreground">
              Purchased credits belong exclusively to this election and cannot be transferred.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Packages List */}
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">Loading voting packages...</div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              const unitPrice = (pkg.priceCents / 100 / pkg.credits).toFixed(2);
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                      : 'border-border hover:border-muted-foreground/30 bg-muted/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{pkg.name}</span>
                      {pkg.credits >= 10 && (
                        <Badge variant="success" className="text-[10px]">
                          Popular Bundle
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-black text-primary text-sm">{pkg.credits}</span> Credits ({unitPrice}/vote)
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-foreground">
                      ${(pkg.priceCents / 100).toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">{pkg.currency}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Simulated Sandbox Card Callout */}
        <div className="p-3.5 rounded-xl bg-muted/50 border text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5 text-foreground">
              <CreditCard className="h-4 w-4 text-primary" /> Development Payment Simulator
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">SANDBOX GATEWAY</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            In development, payments are confirmed instantly via our mock provider without charging real currency. Transactions are recorded with <code>is_mock_payment: true</code> in the audit ledger.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Target Wallet: <b>{voterCode}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSimulatePurchase}
              disabled={isProcessing || !selectedPkgId}
              className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              <DollarSign className="h-3.5 w-3.5" />
              {isProcessing ? 'Processing...' : 'Simulate Purchase'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
