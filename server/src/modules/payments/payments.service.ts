import { CheckoutSessionRequest, CheckoutSessionResponse, PaymentStatus } from '@votexa/shared';
import { walletsService } from '../wallets/wallets.service.js';
import { AppError } from '../../utils/apiResponse.js';

export interface PaymentTransaction {
  id: string;
  organizationId: string;
  packageId: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  createdAt: string;
}

export class PaymentsService {
  private static localPayments: PaymentTransaction[] = [
    {
      id: 'pay-sample-1',
      organizationId: 'org-demo-1',
      packageId: 'pkg-standard',
      amountCents: 4900,
      currency: 'USD',
      status: PaymentStatus.COMPLETED,
      gateway: 'STRIPE',
      createdAt: new Date().toISOString()
    }
  ];

  private static packages = new Map<string, { id: string; name: string; priceCents: number }>([
    ['pkg-standard', { id: 'pkg-standard', name: 'Standard Tier', priceCents: 4900 }],
    ['pkg-enterprise', { id: 'pkg-enterprise', name: 'Enterprise Tier', priceCents: 19900 }]
  ]);

  /**
   * Create Checkout Session for Package Subscription
   */
  async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const pkg = PaymentsService.packages.get(request.packageId);
    if (!pkg) {
      throw new AppError(`Selected package tier '${request.packageId}' not found.`, 404, 'PACKAGE_NOT_FOUND');
    }

    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;

    return {
      sessionId,
      checkoutUrl,
      packageId: pkg.id,
      amountCents: pkg.priceCents,
      currency: 'USD'
    };
  }

  /**
   * Complete payment and trigger double-entry ledger credit to the tenant wallet.
   */
  async confirmPayment(
    organizationId: string,
    packageId: string,
    _sessionId?: string
  ): Promise<PaymentTransaction> {
    const pkg = PaymentsService.packages.get(packageId);
    if (!pkg) {
      throw new AppError('Invalid package reference.', 404, 'PACKAGE_NOT_FOUND');
    }

    const paymentId = `pay-${Date.now()}`;
    const transaction: PaymentTransaction = {
      id: paymentId,
      organizationId,
      packageId,
      amountCents: pkg.priceCents,
      currency: 'USD',
      status: PaymentStatus.COMPLETED,
      gateway: 'STRIPE',
      createdAt: new Date().toISOString()
    };

    PaymentsService.localPayments.unshift(transaction);

    // Atomically credit the organization treasury wallet
    await walletsService.creditWallet(
      organizationId,
      pkg.priceCents,
      `SaaS Subscription Package Purchase (${pkg.name})`,
      paymentId
    );

    return transaction;
  }

  async listPayments(organizationId: string): Promise<PaymentTransaction[]> {
    return PaymentsService.localPayments.filter((p) => p.organizationId === organizationId);
  }
}

export const paymentsService = new PaymentsService();
