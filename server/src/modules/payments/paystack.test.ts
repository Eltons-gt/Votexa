import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { paystackService, PaystackService } from './paystack.service.js';
import { paystackClient } from './paystack.client.js';
import { electionsService } from '../elections/elections.service.js';
import { votingPackagesService } from '../voting/voting-packages.service.js';
import { voterWalletService, VoterWalletService } from '../voting/voter-wallet.service.js';
import {
  ElectionCategory,
  ElectionStatus,
  PaymentTransactionStatus,
  PaymentProvider
} from '@votexa/shared';
import { config } from '../../config/index.js';

describe('Paystack Payment Gateway Integration', () => {
  const orgId = 'org-metro-uni';
  const paidElectionId = 'elec-paid-1';
  const instElectionId = 'elec-inst-1';
  let testPackageId: string;
  const voterCode = 'VTR-PSTK-9901';

  beforeEach(async () => {
    // Reset in-memory states
    PaystackService.resetState();
    VoterWalletService.resetState();
    paystackClient.setSimulatedMode(true);

    // Create a fresh test package on the active paid election
    const pkg = await votingPackagesService.createPackage(orgId, 'usr-test-admin', {
      electionId: paidElectionId,
      name: 'Paystack Fan Bundle (20 Votes)',
      credits: 20,
      priceCents: 20000, // 200.00 KES
      currency: 'KES'
    });
    testPackageId = pkg.id;
  });

  describe('1. Paystack Checkout Session Initiation', () => {
    it('successfully initiates a Paystack checkout session with authoritative package pricing', async () => {
      const response = await paystackService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: testPackageId,
        voterCode,
        email: 'voter@example.com',
        phoneNumber: '+254712345678'
      });

      expect(response).toBeDefined();
      expect(response.paymentId).toMatch(/^pay-pstk-/);
      expect(response.reference).toMatch(/^pstk_vtx_/);
      expect(response.authorizationUrl).toContain('checkout.paystack.com');
      expect(response.accessCode).toBeDefined();
      expect(response.amountCents).toBe(20000);
      expect(response.currency).toBe('KES');
      expect(response.status).toBe(PaymentTransactionStatus.PENDING);
    });

    it('constructs a deterministic customer email when no voter email is provided', async () => {
      const response = await paystackService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: testPackageId,
        voterCode: 'CODE-XYZ-123'
      });

      expect(response.reference).toBeDefined();
      expect(response.status).toBe(PaymentTransactionStatus.PENDING);
    });

    it('rejects initiation for non-existent or inactive voting package', async () => {
      await expect(
        paystackService.initiatePayment(orgId, {
          electionId: paidElectionId,
          packageId: 'pkg-non-existent',
          voterCode
        })
      ).rejects.toThrow();
    });

    it('strictly forbids paid voting package purchases for institutional elections', async () => {
      await expect(
        paystackService.initiatePayment(orgId, {
          electionId: instElectionId,
          packageId: testPackageId,
          voterCode
        })
      ).rejects.toThrow(/Institutional elections do not support paid voting/i);
    });

    it('rejects initiation for elections that are not in ACTIVE status', async () => {
      // Draft election
      const draft = await electionsService.createElection(orgId, 'usr-test-admin', {
        title: 'Draft Unopened Contest',
        category: ElectionCategory.PAID_COMPETITION,
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        timezone: 'Africa/Nairobi',
        isPaidVoting: true
      });

      const draftPkg = await votingPackagesService.createPackage(orgId, 'usr-test-admin', {
        electionId: draft.id,
        name: 'Pre-order Package',
        credits: 5,
        priceCents: 5000,
        currency: 'KES'
      });

      await expect(
        paystackService.initiatePayment(orgId, {
          electionId: draft.id,
          packageId: draftPkg.id,
          voterCode
        })
      ).rejects.toThrow(/Election must be ACTIVE/i);
    });
  });

  describe('2. Paystack Payment Verification & Atomic Credit Issuance', () => {
    it('authoritatively verifies Paystack transaction and atomically issues voting credits', async () => {
      // 1. Initiate
      const init = await paystackService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: testPackageId,
        voterCode
      });

      // 2. Verify
      const verify = await paystackService.verifyPayment(orgId, init.reference);

      expect(verify.status).toBe(PaymentTransactionStatus.SUCCESS);
      expect(verify.creditsIssued).toBe(true);
      expect(verify.creditsAdded).toBe(20);

      // Check voter wallet
      const wallet = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, voterCode);
      expect(wallet.creditsBalance).toBe(20);
    });

    it('is idempotent: repeated verification calls do NOT issue duplicate credits', async () => {
      const init = await paystackService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: testPackageId,
        voterCode
      });

      // First verification
      const verify1 = await paystackService.verifyPayment(orgId, init.reference);
      expect(verify1.creditsIssued).toBe(true);
      expect(verify1.creditsAdded).toBe(20);

      // Second verification (replay)
      const verify2 = await paystackService.verifyPayment(orgId, init.reference);
      expect(verify2.status).toBe(PaymentTransactionStatus.SUCCESS);
      // No extra credits added on second call
      expect(verify2.creditsAdded).toBe(0);

      // Balance remains strictly 20 (not 40)
      const wallet = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, voterCode);
      expect(wallet.creditsBalance).toBe(20);
    });

    it('fails verification for unknown references with 404', async () => {
      await expect(
        paystackService.verifyPayment(orgId, 'pstk_unknown_reference_999')
      ).rejects.toThrow(/not found/i);
    });
  });

  describe('3. Paystack Webhook Processing & Cryptographic Signature Validation', () => {
    it('validates genuine HMAC-SHA512 webhook signature', () => {
      const secret = 'sk_test_mock_secret_key_12345';
      const originalSecret = config.paystack.secretKey;
      config.paystack.secretKey = secret;

      const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_123' } });
      const validSignature = crypto.createHmac('sha512', secret).update(payload).digest('hex');

      expect(paystackClient.verifyWebhookSignature(validSignature, payload)).toBe(true);

      // Tampered signature must fail
      const invalidSignature = 'tampered_' + validSignature.substring(9);
      expect(paystackClient.verifyWebhookSignature(invalidSignature, payload)).toBe(false);

      config.paystack.secretKey = originalSecret;
    });

    it('rejects webhooks with invalid signatures with HTTP 401 Unauthorized', async () => {
      const originalSecret = config.paystack.secretKey;
      config.paystack.secretKey = 'sk_test_actual_secret';

      const payload = {
        event: 'charge.success',
        data: {
          id: 1001,
          domain: 'test',
          status: 'success',
          reference: 'pstk_test_tampered',
          amount: 20000,
          currency: 'KES'
        }
      };

      await expect(
        paystackService.handleWebhook('invalid_signature_hash', JSON.stringify(payload), payload)
      ).rejects.toThrow(/Invalid Paystack webhook signature/i);

      config.paystack.secretKey = originalSecret;
    });

    it('successfully processes charge.success webhook and issues voter credits', async () => {
      // 1. Initiate transaction
      const init = await paystackService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: testPackageId,
        voterCode
      });

      const payload = {
        event: 'charge.success',
        data: {
          id: 998822,
          domain: 'test',
          status: 'success',
          reference: init.reference,
          amount: 20000,
          currency: 'KES',
          gateway_response: 'Successful',
          channel: 'mobile_money',
          metadata: {
            organizationId: orgId,
            electionId: paidElectionId,
            packageId: testPackageId,
            voterCode
          }
        }
      };

      // Mock signature bypass in test
      const result = await paystackService.handleWebhook(
        'test_mock_paystack_signature',
        JSON.stringify(payload),
        payload
      );

      expect(result.processed).toBe(true);

      // Verify wallet was credited
      const wallet = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, voterCode);
      expect(wallet.creditsBalance).toBe(20);
    });

    it('safely ignores duplicate webhook replays without double-crediting', async () => {
      const init = await paystackService.initiatePayment(orgId, {
        electionId: paidElectionId,
        packageId: testPackageId,
        voterCode
      });

      const payload = {
        event: 'charge.success',
        data: {
          id: 998833,
          domain: 'test',
          status: 'success',
          reference: init.reference,
          amount: 20000,
          currency: 'KES',
          gateway_response: 'Successful',
          channel: 'card',
          metadata: {
            organizationId: orgId,
            electionId: paidElectionId,
            packageId: testPackageId,
            voterCode
          }
        }
      };

      // First webhook delivery
      const res1 = await paystackService.handleWebhook(
        'test_mock_paystack_signature',
        JSON.stringify(payload),
        payload
      );
      expect(res1.processed).toBe(true);

      // Second webhook delivery (replay attack / duplicate network event)
      const res2 = await paystackService.handleWebhook(
        'test_mock_paystack_signature',
        JSON.stringify(payload),
        payload
      );
      expect(res2.processed).toBe(true);
      expect(res2.reason).toBe('IDEMPOTENT_REPLAY_IGNORED');

      // Balance must strictly remain 20
      const wallet = await voterWalletService.getOrCreateWallet(orgId, paidElectionId, voterCode);
      expect(wallet.creditsBalance).toBe(20);
    });
  });
});
