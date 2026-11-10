import {
  PurchasePackageRequest,
  PurchasePackageResponse
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { votingPackagesService } from './voting-packages.service.js';
import { voterWalletService } from './voter-wallet.service.js';

export class MockPaymentService {
  /**
   * Process a development-only mock payment and credit the voter's election wallet.
   * Explicitly labeled as MOCK to ensure it cannot be confused with production transactions.
   */
  async processMockPayment(
    organizationId: string,
    req: PurchasePackageRequest
  ): Promise<PurchasePackageResponse> {
    const { electionId, packageId, voterCode } = req;

    if (!electionId || !packageId || !voterCode) {
      throw new AppError('Election ID, package ID, and voter code are required', 400, 'INVALID_PAYLOAD');
    }

    // Verify package exists and is active for this election
    const pkg = await votingPackagesService.getPackageById(organizationId, electionId, packageId);
    if (!pkg.isActive) {
      throw new AppError('This voting package is not currently available', 400, 'PACKAGE_INACTIVE');
    }

    // Generate explicit MOCK reference code
    const mockRef = `MOCK-PAY-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const desc = `[DEV SIMULATED] Purchased ${pkg.name} (${pkg.credits} credits @ $${(pkg.priceCents / 100).toFixed(2)})`;

    // Credit voter's election wallet
    const { wallet, transaction } = await voterWalletService.addCredits(
      organizationId,
      electionId,
      voterCode,
      pkg.credits,
      mockRef,
      desc,
      true // isMock = true
    );

    return {
      success: true,
      wallet,
      transaction,
      message: `Simulated payment successful! ${pkg.credits} voting credits added to wallet.`
    };
  }
}

export const mockPaymentService = new MockPaymentService();
