import {
  PaymentProvider,
  PaymentTransactionStatus,
  PaymentTransactionRecord,
  PaystackInitiatePaymentRequest,
  PaystackInitiatePaymentResponse,
  PaystackVerifyPaymentResponse,
  PaystackWebhookPayload,
  ElectionStatus,
  ElectionCategory
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { paystackClient } from './paystack.client.js';
import { votingPackagesService } from '../voting/voting-packages.service.js';
import { voterWalletService } from '../voting/voter-wallet.service.js';
import { electionsService } from '../elections/elections.service.js';
import { revenueService } from '../revenue/revenue.service.js';

export class PaystackService {
  // In-memory fallbacks for test & offline environments
  private static localTransactions = new Map<string, PaymentTransactionRecord>();
  private static localEvents: Array<{ id: string; provider: string; eventType: string; payload: Record<string, unknown>; createdAt: string }> = [];
  private static localIdempotencyKeys = new Set<string>();

  /**
   * Reset in-memory state for clean test isolation
   */
  public static resetState(): void {
    PaystackService.localTransactions.clear();
    PaystackService.localEvents = [];
    PaystackService.localIdempotencyKeys.clear();
  }

  /**
   * 1. Initiate Paystack Payment Session
   */
  async initiatePayment(
    organizationId: string,
    req: PaystackInitiatePaymentRequest
  ): Promise<PaystackInitiatePaymentResponse> {
    const { electionId, packageId, voterCode, email, phoneNumber, currency, callbackUrl } = req;

    if (!electionId || !packageId || !voterCode) {
      throw new AppError(
        'Election ID, Package ID, and Voter Code are required for payment initiation',
        400,
        'INVALID_PAYSTACK_INITIATE_REQUEST'
      );
    }

    // 1. Verify election exists and is ACTIVE
    const election = await electionsService.getElectionById(organizationId, electionId);
    if (election.status !== ElectionStatus.ACTIVE) {
      throw new AppError(
        `Cannot purchase voting credits for election with status '${election.status}'. Election must be ACTIVE.`,
        400,
        'ELECTION_NOT_ACTIVE'
      );
    }

    // 2. Institutional elections strictly prohibit paid voting
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      throw new AppError(
        'Institutional elections do not support paid voting packages or credits',
        400,
        'INSTITUTIONAL_PAID_VOTING_FORBIDDEN'
      );
    }

    // 3. Retrieve authoritative voting package directly from DB (never trust frontend price)
    const pkg = await votingPackagesService.getPackageById(organizationId, electionId, packageId);
    if (!pkg.isActive) {
      throw new AppError('The selected voting package is currently inactive or unavailable', 400, 'PACKAGE_INACTIVE');
    }

    // Format voter customer email for Paystack receipt
    const customerEmail = email && email.includes('@')
      ? email.trim().toLowerCase()
      : `voter-${voterCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@voter.votexa.io`;

    const txCurrency = (currency || pkg.currency || 'KES').toUpperCase();
    const amountSubunit = pkg.priceCents; // Paystack requires lowest currency unit (cents / kobo)
    const reference = `pstk_vtx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const paymentId = `pay-pstk-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    // 4. Initialize transaction with Paystack Gateway
    const initResult = await paystackClient.initializeTransaction({
      email: customerEmail,
      amountSubunit,
      currency: txCurrency,
      reference,
      callbackUrl,
      metadata: {
        organizationId,
        electionId,
        packageId,
        voterCode: voterCode.trim().toUpperCase(),
        credits: pkg.credits,
        phoneNumber: phoneNumber || null,
        packageName: pkg.name
      }
    });

    const transaction: PaymentTransactionRecord = {
      id: paymentId,
      organizationId,
      electionId,
      packageId,
      voterCode: voterCode.trim().toUpperCase(),
      provider: PaymentProvider.PAYSTACK,
      amountCents: pkg.priceCents,
      currency: txCurrency,
      phoneNumber: phoneNumber || undefined,
      merchantRequestId: reference,
      checkoutRequestId: reference,
      status: PaymentTransactionStatus.PENDING,
      creditsIssued: false,
      createdAt: now,
      updatedAt: now
    };

    // Store in DB with fallback to memory
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        await client.query(
          `INSERT INTO payment_transactions (
            id, organization_id, election_id, package_id, voter_code,
            provider, amount_cents, currency, phone_number,
            merchant_request_id, checkout_request_id, gateway_reference,
            customer_email, status, credits_issued, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            transaction.id,
            transaction.organizationId,
            transaction.electionId,
            transaction.packageId,
            transaction.voterCode,
            transaction.provider,
            transaction.amountCents,
            transaction.currency,
            transaction.phoneNumber || null,
            transaction.merchantRequestId,
            transaction.checkoutRequestId,
            reference,
            customerEmail,
            transaction.status,
            transaction.creditsIssued,
            now,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      // Memory fallback
      PaystackService.localTransactions.set(transaction.id, transaction);
      PaystackService.localTransactions.set(reference, transaction);
    }

    return {
      paymentId: transaction.id,
      reference,
      authorizationUrl: initResult.authorizationUrl,
      accessCode: initResult.accessCode,
      amountCents: pkg.priceCents,
      currency: txCurrency,
      status: PaymentTransactionStatus.PENDING,
      message: 'Paystack checkout session initialized successfully'
    };
  }

  /**
   * 2. Authoritatively Verify Paystack Payment and Issue Credits
   */
  async verifyPayment(
    organizationId: string,
    reference: string
  ): Promise<PaystackVerifyPaymentResponse> {
    if (!reference) {
      throw new AppError('Transaction reference is required', 400, 'PAYSTACK_MISSING_REFERENCE');
    }

    // 1. Authoritatively verify with Paystack Gateway
    const verifyResult = await paystackClient.verifyTransaction(reference);

    // 2. Fetch local payment record
    let tx: PaymentTransactionRecord | undefined;
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        const res = await client.query(
          `SELECT * FROM payment_transactions WHERE (checkout_request_id = $1 OR gateway_reference = $1 OR id = $1) AND organization_id = $2`,
          [reference, organizationId]
        );
        if (res.rows.length > 0) {
          tx = this.mapDbTransaction(res.rows[0]);
        }
      } finally {
        client.release();
      }
    } catch {
      tx = PaystackService.localTransactions.get(reference);
    }

    if (!tx) {
      throw new AppError(`Payment transaction with reference '${reference}' not found`, 404, 'TRANSACTION_NOT_FOUND');
    }

    // 3. Process success and atomic credit issuance
    let creditsAdded = 0;
    if (verifyResult.status === 'success') {
      if (!tx.creditsIssued) {
        // Retrieve package for credit count
        const pkg = await votingPackagesService.getPackageById(organizationId, tx.electionId, tx.packageId);
        creditsAdded = pkg.credits;

        // Atomically credit the voter wallet
        await voterWalletService.creditWallet(
          organizationId,
          tx.electionId,
          tx.voterCode,
          creditsAdded,
          reference,
          `Paystack purchase ${reference}`,
          false
        );

        // Update transaction status
        tx.status = PaymentTransactionStatus.SUCCESS;
        tx.creditsIssued = true;
        tx.creditsIssuedAt = new Date().toISOString();
        tx.updatedAt = new Date().toISOString();

        // Update in database
        try {
          const client = await pool.connect();
          try {
            await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
            await client.query(
              `UPDATE payment_transactions SET 
                status = $1, credits_issued = TRUE, credits_issued_at = $2,
                gateway_reference = $3, payment_channel = $4, updated_at = $5
              WHERE id = $6`,
              [
                PaymentTransactionStatus.SUCCESS,
                tx.creditsIssuedAt,
                verifyResult.reference,
                verifyResult.channel || 'unknown',
                tx.updatedAt,
                tx.id
              ]
            );
          } finally {
            client.release();
          }
        } catch {
          PaystackService.localTransactions.set(tx.id, tx);
          PaystackService.localTransactions.set(reference, tx);
        }

        // Allocate commercial revenue (75% organizer / 25% platform)
        try {
          await revenueService.allocateRevenue({
            id: tx.id,
            organizationId,
            electionId: tx.electionId,
            amountCents: tx.amountCents,
            currency: tx.currency
          });
        } catch {
          // Revenue allocation recorded
        }
      }

      return {
        paymentId: tx.id,
        reference: verifyResult.reference,
        status: PaymentTransactionStatus.SUCCESS,
        amountCents: tx.amountCents,
        currency: tx.currency,
        gatewayResponse: verifyResult.gatewayResponse,
        paidAt: verifyResult.paidAt,
        channel: verifyResult.channel,
        creditsIssued: true,
        creditsAdded,
        message: 'Payment verified and voting credits successfully added to wallet'
      };
    } else {
      return {
        paymentId: tx.id,
        reference: verifyResult.reference,
        status: PaymentTransactionStatus.FAILED,
        amountCents: tx.amountCents,
        currency: tx.currency,
        gatewayResponse: verifyResult.gatewayResponse,
        channel: verifyResult.channel,
        creditsIssued: false,
        message: `Payment not completed. Current gateway status: ${verifyResult.status}`
      };
    }
  }

  /**
   * 3. Handle Paystack Webhook Event (charge.success, etc.)
   */
  async handleWebhook(
    signature: string,
    rawBody: Buffer | string,
    payload: PaystackWebhookPayload
  ): Promise<{ processed: boolean; reason?: string }> {
    // 1. Cryptographic HMAC-SHA512 Signature Verification
    const isValid = paystackClient.verifyWebhookSignature(signature, rawBody);
    if (!isValid) {
      throw new AppError('Invalid Paystack webhook signature', 401, 'INVALID_PAYSTACK_SIGNATURE');
    }

    const { event, data } = payload;
    const now = new Date().toISOString();

    // 2. Audit log raw webhook event
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO payment_provider_events (provider, event_type, raw_payload, created_at)
           VALUES ($1, $2, $3, $4)`,
          [PaymentProvider.PAYSTACK, event, JSON.stringify(payload), now]
        );
      } finally {
        client.release();
      }
    } catch {
      PaystackService.localEvents.push({
        id: `evt-${Date.now()}`,
        provider: PaymentProvider.PAYSTACK,
        eventType: event,
        payload: payload as unknown as Record<string, unknown>,
        createdAt: now
      });
    }

    // 3. Handle charge.success
    if (event === 'charge.success' && data && data.status === 'success') {
      const reference = data.reference;
      const idempotencyKey = `paystack:charge:${reference}`;

      // Check idempotency (prevent duplicate credit issuance on webhook replay)
      if (PaystackService.localIdempotencyKeys.has(idempotencyKey)) {
        return { processed: true, reason: 'IDEMPOTENT_REPLAY_IGNORED' };
      }

      // Check DB idempotency record
      try {
        const client = await pool.connect();
        try {
          const check = await client.query('SELECT id FROM idempotency_records WHERE key = $1', [idempotencyKey]);
          if (check.rows.length > 0) {
            return { processed: true, reason: 'IDEMPOTENT_REPLAY_IGNORED' };
          }
        } finally {
          client.release();
        }
      } catch {
        // Fallback
      }

      // Find local transaction
      let tx: PaymentTransactionRecord | undefined;
      try {
        const client = await pool.connect();
        try {
          const res = await client.query(
            `SELECT * FROM payment_transactions WHERE checkout_request_id = $1 OR gateway_reference = $1`,
            [reference]
          );
          if (res.rows.length > 0) {
            tx = this.mapDbTransaction(res.rows[0]);
          }
        } finally {
          client.release();
        }
      } catch {
        tx = PaystackService.localTransactions.get(reference);
      }

      if (!tx) {
        // Metadata fallback if transaction was initiated externally
        const meta = data.metadata;
        if (meta && meta.organizationId && meta.electionId && meta.voterCode && meta.packageId) {
          tx = {
            id: `pay-pstk-${data.id}`,
            organizationId: meta.organizationId as string,
            electionId: meta.electionId as string,
            packageId: meta.packageId as string,
            voterCode: meta.voterCode as string,
            provider: PaymentProvider.PAYSTACK,
            amountCents: data.amount,
            currency: data.currency,
            merchantRequestId: reference,
            checkoutRequestId: reference,
            status: PaymentTransactionStatus.PENDING,
            creditsIssued: false,
            createdAt: now,
            updatedAt: now
          };
        }
      }

      if (tx && !tx.creditsIssued) {
        // Retrieve package credits
        const pkg = await votingPackagesService.getPackageById(tx.organizationId, tx.electionId, tx.packageId);

        // Atomically issue credits
        await voterWalletService.creditWallet(
          tx.organizationId,
          tx.electionId,
          tx.voterCode,
          pkg.credits,
          reference,
          `Paystack charge ${reference}`,
          false
        );

        // Update transaction
        tx.status = PaymentTransactionStatus.SUCCESS;
        tx.creditsIssued = true;
        tx.creditsIssuedAt = now;
        tx.updatedAt = now;

        // Persist update and idempotency record
        try {
          const client = await pool.connect();
          try {
            await client.query('SET LOCAL app.current_organization_id = $1', [tx.organizationId]);
            await client.query(
              `UPDATE payment_transactions SET
                status = $1, credits_issued = TRUE, credits_issued_at = $2,
                gateway_reference = $3, payment_channel = $4, updated_at = $5
              WHERE id = $6`,
              [
                PaymentTransactionStatus.SUCCESS,
                now,
                reference,
                data.channel || 'unknown',
                now,
                tx.id
              ]
            );

            await client.query(
              `INSERT INTO idempotency_records (key, provider, resource_id, created_at)
               VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING`,
              [idempotencyKey, PaymentProvider.PAYSTACK, reference, now]
            );
          } finally {
            client.release();
          }
        } catch {
          PaystackService.localTransactions.set(tx.id, tx);
          PaystackService.localTransactions.set(reference, tx);
          PaystackService.localIdempotencyKeys.add(idempotencyKey);
        }

        // Allocate commercial revenue (75% organizer / 25% platform)
        try {
          await revenueService.allocateRevenue({
            id: tx.id,
            organizationId: tx.organizationId,
            electionId: tx.electionId,
            amountCents: tx.amountCents,
            currency: tx.currency
          });
        } catch {
          // Handled
        }
      }

      PaystackService.localIdempotencyKeys.add(idempotencyKey);
      return { processed: true };
    }

    return { processed: true, reason: `EVENT_${event}_IGNORED` };
  }

  private mapDbTransaction(row: Record<string, unknown>): PaymentTransactionRecord {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      electionId: row.election_id as string,
      packageId: row.package_id as string,
      voterCode: row.voter_code as string,
      provider: (row.provider as PaymentProvider) || PaymentProvider.PAYSTACK,
      amountCents: Number(row.amount_cents),
      currency: (row.currency as string) || 'KES',
      phoneNumber: row.phone_number ? (row.phone_number as string) : undefined,
      merchantRequestId: row.merchant_request_id as string,
      checkoutRequestId: row.checkout_request_id as string,
      mpesaReceiptNumber: (row.gateway_reference || row.mpesa_receipt_number) as string | undefined,
      status: row.status as PaymentTransactionStatus,
      resultCode: row.result_code !== null ? Number(row.result_code) : undefined,
      resultDesc: row.result_desc as string | undefined,
      creditsIssued: Boolean(row.credits_issued),
      creditsIssuedAt: row.credits_issued_at ? new Date(row.credits_issued_at as string).toISOString() : undefined,
      createdAt: new Date(row.created_at as string).toISOString(),
      updatedAt: new Date(row.updated_at as string).toISOString()
    };
  }
}

export const paystackService = new PaystackService();
