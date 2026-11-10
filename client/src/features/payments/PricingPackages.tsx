import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Check, CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../lib/api';

export function PricingPackages({ onPaymentCompleted }: { onPaymentCompleted?: () => void }) {
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const tiers = [
    {
      id: 'pkg-standard',
      name: 'Standard Tier',
      price: '$49',
      period: 'per election',
      description: 'Ideal for student unions, clubs, and local association ballots',
      features: [
        'Up to 2,500 verified voters',
        'Single & multiple choice ballots',
        'Real-time turnout analytics',
        'Cryptographic receipt generation'
      ]
    },
    {
      id: 'pkg-enterprise',
      name: 'Enterprise Tier',
      price: '$199',
      period: 'per month',
      description: 'Full institutional multi-tenancy with dedicated audit trail',
      features: [
        'Unlimited elections',
        'Up to 50,000 voters',
        'Cryptographic ballot verification',
        'Automated Double-Entry Ledger',
        'Priority SLA & Instant Payouts'
      ]
    }
  ];

  const handleCheckout = async (packageId: string) => {
    setLoadingPkg(packageId);
    setSuccessInfo(null);

    try {
      // 1. Create Checkout Session
      const sessionRes = await apiClient.post<any>('/payments/checkout', {
        packageId,
        organizationId: 'org-demo-1'
      });

      if (sessionRes.success) {
        // 2. Simulate Payment Confirmation & Double-Entry Ledger Credit
        const confirmRes = await apiClient.post<any>('/payments/confirm', {
          packageId,
          organizationId: 'org-demo-1',
          sessionId: sessionRes.data?.sessionId
        });

        if (confirmRes.success) {
          setSuccessInfo(`Payment confirmed! $${(confirmRes.data.amountCents / 100).toFixed(2)} credited to tenant wallet.`);
          if (onPaymentCompleted) onPaymentCompleted();
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingPkg(null);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {successInfo && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-md text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {successInfo}
          </span>
          <Badge variant="success">Treasury Updated</Badge>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.id} className="flex flex-col justify-between border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold">{tier.price}</span>
                <span className="text-xs text-muted-foreground">{tier.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {tier.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full gap-2"
                onClick={() => handleCheckout(tier.id)}
                disabled={loadingPkg === tier.id}
              >
                {loadingPkg === tier.id ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" /> Purchase & Activate Tier
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
