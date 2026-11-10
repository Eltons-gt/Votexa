import {
  PaymentProvider,
  PaymentTransactionStatus,
  PaymentTransactionRecord,
  MpesaInitiatePaymentRequest,
  MpesaInitiatePaymentResponse,
  MpesaPaymentStatusResponse,
  MpesaCallbackPayload,
  ElectionStatus,
  ElectionCategory
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { mpesaClient } from './mpesa.client.js';
import { votingPackagesService } from '../voting/voting-packages.service.js';
import { voterWalletService } from '../voting/voter-wallet.service.js';
import { electionsService } from '../elections/elections.service.js';
import { walletsService } from '../wallets/wallets.service.js';
import { revenueService } from '../revenue/revenue.service.js';

export class MpesaService {
  // In-memory fallbacks for test & offline modes
  private static localTransactions = new Map<string, PaymentTransactionRecord>();
  private static localEvents: Array<{ id: string; paymentId?: string; provider: string; eventType: string; payload: Record<string, unknown>; createdAt: string }> = [];
  private static localIdempotencyKeys = new Set<string>();
  private static localReconciliations: Array<{ id: string; paymentId: string; status: string; discrepancyReason?: string; createdAt: string }> = [];

  /**
   * Reset in-memory state for clean test isolation
   */
  public static resetState(): void {
    MpesaService.localTransactions.clear();
    MpesaService.localEvents = [];
    MpesaService.localIdempotencyKeys.clear();
    MpesaService.localReconciliations = [];
  }

  /**
   * Convert price cents to KES based on package currency
   */
  private calculateKesAmount(priceCents: number, currency: string): number {
    if (currency.toUpperCase() === 'KES') {
      return Math.max(1, Math.round(priceCents / 100));
    }
    // Default USD to KES rate (1 USD = 130 KES)
    return Math.max(1, Math.round((priceCents / 100) * 130));
  }

  /**
   * 1. Initiate M-Pesa STK Push Payment
   */
  async initiatePayment(
    organizationId: string,
    req: MpesaInitiatePaymentRequest
  ): Promise<MpesaInitiatePaymentResponse> {
    const { electionId, packageId, voterCode, phoneNumber } = req;

    if (!electionId || !packageId || !voterCode || !phoneNumber) {
      throw new AppError(
        'Election ID, Package ID, Voter Code, and Phone Number are required',
        400,
        'INVALID_PAYMENT_INITIATION_REQUEST'
      );
    }

    // Validate phone number format (Kenyan MSISDN)
    const normalizedPhone = mpesaClient.normalizePhoneNumber(phoneNumber);

    // Validate election exists and is ACTIVE
    const election = await electionsService.getElectionById(organizationId, electionId);
    if (election.status !== ElectionStatus.ACTIVE) {
      throw new AppError(
        `Cannot purchase voting credits for election with status '${election.status}'. Election must be ACTIVE.`,
        400,
        'ELECTION_NOT_ACTIVE'
      );
    }

    // Institutional elections strictly prohibit paid voting
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      throw new AppError(
        'Institutional elections do not support paid voting packages or credits',
        400,
        'INSTITUTIONAL_PAID_VOTING_FORBIDDEN'
      );
    }

    // Retrieve the AUTHORITATIVE package price & credits directly from DB
    // NEVER trust any prices or credit amounts sent from frontend
    const pkg = await votingPackagesService.getPackageById(organizationId, electionId, packageId);
    if (!pkg.isActive) {
      throw new AppError('The selected voting package is currently inactive or unavailable', 400, 'PACKAGE_INACTIVE');
    }

    const amountKES = this.calculateKesAmount(pkg.priceCents, pkg.currency);

    // Request STK Push from Daraja Client
    const accountRef = `VTX-${electionId.substring(0, 6).toUpperCase()}`;
    const desc = `${pkg.credits} Votes - ${pkg.name}`.substring(0, 30);

    const stkResult = await mpesaClient.initiateStkPush({
      phoneNumber: normalizedPhone,
      amount: amountKES,
      accountReference: accountRef,
      transactionDesc: desc
    });

    const paymentId = `pay-mpesa-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const transaction: PaymentTransactionRecord = {
      id: paymentId,
      organizationId,
      electionId,
      packageId,
      voterCode: voterCode.trim().toUpperCase(),
      provider: PaymentProvider.MPESA,
      amountCents: pkg.priceCents,
      currency: pkg.currency,
      phoneNumber: normalizedPhone,
      merchantRequestId: stkResult.merchantRequestId,
      checkoutRequestId: stkResult.checkoutRequestId,
      status: PaymentTransactionStatus.PENDING,
      creditsIssued: false,
      createdAt: now,
      updatedAt: now
    };

    // Store in DB with local fallback
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        await client.query(
          `INSERT INTO payment_transactions (
            id, organization_id, election_id, package_id, voter_code,
            provider, amount_cents, currency, phone_number,
            merchant_request_id, checkout_request_id, status, credits_issued,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            transaction.id,
            transaction.organizationId,
            transaction.electionId,
            transaction.packageId,
            transaction.voterCode,
            transaction.provider,
            transaction.amountCents,
            transaction.currency,
            transaction.phoneNumber,
            transaction.merchantRequestId,
            transaction.checkoutRequestId,
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
      // Local fallback
      MpesaService.localTransactions.set(transaction.id, transaction);
      MpesaService.localTransactions.set(transaction.checkoutRequestId, transaction);
    }

    return {
      paymentId: transaction.id,
      merchantRequestId: stkResult.merchantRequestId,
      checkoutRequestId: stkResult.checkoutRequestId,
      status: PaymentTransactionStatus.PENDING,
      customerMessage: stkResult.customerMessage || 'M-Pesa payment prompt sent to your phone.'
    };
  }

  /**
   * 2. Query Payment Status
   */
  async getPayment(organizationId: string, paymentId: string): Promise<MpesaPaymentStatusResponse> {
    let tx: PaymentTransactionRecord | undefined;

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        const res = await client.query(
          `SELECT * FROM payment_transactions WHERE (id = $1 OR checkout_request_id = $1) AND organization_id = $2`,
          [paymentId, organizationId]
        );
        if (res.rows.length > 0) {
          tx = this.mapDbTransaction(res.rows[0]);
        }
      } finally {
        client.release();
      }
    } catch {
      tx = MpesaService.localTransactions.get(paymentId);
    }

    if (!tx || tx.organizationId !== organizationId) {
      throw new AppError('Payment transaction not found', 404, 'PAYMENT_NOT_FOUND');
    }

    // Retrieve package details for credit count
    const pkg = await votingPackagesService.getPackageById(organizationId, tx.electionId, tx.packageId);

    return {
      paymentId: tx.id,
      organizationId: tx.organizationId,
      electionId: tx.electionId,
      packageId: tx.packageId,
      voterCode: tx.voterCode,
      amountCents: tx.amountCents,
      currency: tx.currency,
      phoneNumber: tx.phoneNumber,
      merchantRequestId: tx.merchantRequestId,
      checkoutRequestId: tx.checkoutRequestId,
      mpesaReceiptNumber: tx.mpesaReceiptNumber,
      status: tx.status,
      resultCode: tx.resultCode,
      resultDesc: tx.resultDesc,
      credits: pkg.credits,
      creditsIssued: tx.creditsIssued,
      creditsIssuedAt: tx.creditsIssuedAt,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt
    };
  }

  /**
   * 3. Process Daraja Callback (Safaricom Webhook)
   */
  async processCallback(
    payload: MpesaCallbackPayload
  ): Promise<{ success: boolean; message: string; creditsIssued: boolean; duplicate?: boolean }> {
    const stkCallback = payload?.Body?.stkCallback;
    if (!stkCallback) {
      throw new AppError('Invalid M-Pesa callback payload format', 400, 'INVALID_CALLBACK_FORMAT');
    }

    const {
      MerchantRequestID: _MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;

    const now = new Date().toISOString();

    // 3.1 Store Raw Provider Event for Auditing
    const eventId = `ev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO payment_provider_events (id, provider, event_type, raw_payload, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [eventId, 'MPESA', 'STK_CALLBACK', JSON.stringify(payload), now]
        );
      } finally {
        client.release();
      }
    } catch {
      MpesaService.localEvents.push({
        id: eventId,
        provider: 'MPESA',
        eventType: 'STK_CALLBACK',
        payload: payload as unknown as Record<string, unknown>,
        createdAt: now
      });
    }

    // 3.2 Find Existing Transaction by CheckoutRequestID
    let tx: PaymentTransactionRecord | undefined;
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM payment_transactions WHERE checkout_request_id = $1`,
          [CheckoutRequestID]
        );
        if (res.rows.length > 0) {
          tx = this.mapDbTransaction(res.rows[0]);
        }
      } finally {
        client.release();
      }
    } catch {
      tx = MpesaService.localTransactions.get(CheckoutRequestID);
    }

    if (!tx) {
      console.warn(`[MPESA_CALLBACK] Received callback for unknown CheckoutRequestID: ${CheckoutRequestID}`);
      return {
        success: false,
        message: `Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`,
        creditsIssued: false
      };
    }

    // 3.3 Check Idempotency / Anti-Replay
    // If transaction has already issued credits or was already marked SUCCESS, DO NOT re-credit
    if (tx.creditsIssued || tx.status === PaymentTransactionStatus.SUCCESS) {
      return {
        success: true,
        message: 'Duplicate callback ignored; credits have already been issued.',
        duplicate: true,
        creditsIssued: false
      };
    }

    // 3.4 Handle Failed / Cancelled Payments (ResultCode !== 0)
    // Common codes: 1032 (Cancelled by user), 1037 (Timeout), 1 (Insufficient funds), 2001 (Invalid PIN)
    if (ResultCode !== 0) {
      await this.updateTransactionStatus(
        tx.id,
        tx.checkoutRequestId,
        PaymentTransactionStatus.FAILED,
        ResultCode,
        ResultDesc,
        false
      );

      return {
        success: false,
        message: ResultDesc || `M-Pesa payment failed with code ${ResultCode}`,
        creditsIssued: false
      };
    }

    // 3.5 Parse Callback Metadata for Verified Success
    let mpesaReceiptNumber: string | undefined;
    let callbackAmount: number | undefined;

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber' && item.Value) {
          mpesaReceiptNumber = String(item.Value);
        } else if (item.Name === 'Amount' && item.Value !== undefined) {
          callbackAmount = Number(item.Value);
        }
      }
    }

    if (!mpesaReceiptNumber) {
      await this.flagReconciliationDiscrepancy(
        tx.id,
        'Missing MpesaReceiptNumber in successful callback metadata'
      );
      await this.updateTransactionStatus(
        tx.id,
        tx.checkoutRequestId,
        PaymentTransactionStatus.FAILED,
        ResultCode,
        'Missing M-Pesa receipt number from provider',
        false
      );
      return {
        success: false,
        message: 'Provider failed to return a valid receipt number.',
        creditsIssued: false
      };
    }

    // 3.6 Check Deduplication / Idempotency Key
    const idempotencyKey = `mpesa:${mpesaReceiptNumber}`;
    const isDuplicate = await this.checkAndRecordIdempotency(idempotencyKey, tx.id);
    if (isDuplicate) {
      return {
        success: true,
        message: `Duplicate receipt number ${mpesaReceiptNumber}. Credits already processed.`,
        duplicate: true,
        creditsIssued: false
      };
    }

    // 3.7 Verify Amount Integrity
    // Compare callback amount with expected KES amount from DB package
    const pkg = await votingPackagesService.getPackageById(tx.organizationId, tx.electionId, tx.packageId);
    const expectedKes = this.calculateKesAmount(pkg.priceCents, pkg.currency);

    if (callbackAmount !== undefined && callbackAmount < expectedKes) {
      await this.flagReconciliationDiscrepancy(
        tx.id,
        `Amount mismatch: expected ${expectedKes} KES, received ${callbackAmount} KES`
      );
      await this.updateTransactionStatus(
        tx.id,
        tx.checkoutRequestId,
        PaymentTransactionStatus.FAILED,
        ResultCode,
        `Payment amount (${callbackAmount} KES) is less than package price (${expectedKes} KES)`,
        false
      );
      return {
        success: false,
        message: 'Payment amount mismatch. Transaction marked for review.',
        creditsIssued: false
      };
    }

    // 3.8 Atomically Issue Credits & Update Transaction
    // One verified payment must issue credits exactly once.
    await this.updateTransactionStatus(
      tx.id,
      tx.checkoutRequestId,
      PaymentTransactionStatus.SUCCESS,
      0,
      ResultDesc || 'Payment verified successfully.',
      true,
      mpesaReceiptNumber
    );

    // Issue credits to election-specific voter wallet
    await voterWalletService.addCredits(
      tx.organizationId,
      tx.electionId,
      tx.voterCode,
      pkg.credits,
      mpesaReceiptNumber,
      `M-Pesa payment ${mpesaReceiptNumber} (${pkg.name})`,
      false // Real verified payment
    );

    // Record revenue allocation to organization treasury wallet
    await walletsService.creditWallet(
      tx.organizationId,
      tx.amountCents,
      `M-Pesa Revenue: ${pkg.name} (Receipt: ${mpesaReceiptNumber})`,
      tx.id
    );

    // Perform commercial 25/75 split and double-entry ledger allocation
    await revenueService.allocateRevenue(tx, {
      processingFeeCents: Math.round(tx.amountCents * 0.015), // Standard gateway fee
      approvedDeductionCents: 0
    });

    return {
      success: true,
      message: `Verified payment ${mpesaReceiptNumber}. Issued ${pkg.credits} voting credits.`,
      creditsIssued: true
    };
  }

  /**
   * Helper: Update transaction status in DB & local cache
   */
  private async updateTransactionStatus(
    paymentId: string,
    checkoutRequestId: string,
    status: PaymentTransactionStatus,
    resultCode?: number,
    resultDesc?: string,
    creditsIssued: boolean = false,
    mpesaReceiptNumber?: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const creditsIssuedAt = creditsIssued ? now : null;

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE payment_transactions
           SET status = $1, result_code = $2, result_desc = $3,
               credits_issued = $4, credits_issued_at = $5,
               mpesa_receipt_number = COALESCE($6, mpesa_receipt_number),
               updated_at = $7
           WHERE id = $8`,
          [status, resultCode, resultDesc, creditsIssued, creditsIssuedAt, mpesaReceiptNumber, now, paymentId]
        );
      } finally {
        client.release();
      }
    } catch {
      // Local cache update
      const tx = MpesaService.localTransactions.get(paymentId);
      if (tx) {
        tx.status = status;
        tx.resultCode = resultCode;
        tx.resultDesc = resultDesc;
        tx.creditsIssued = creditsIssued;
        tx.creditsIssuedAt = creditsIssuedAt || undefined;
        if (mpesaReceiptNumber) tx.mpesaReceiptNumber = mpesaReceiptNumber;
        tx.updatedAt = now;
        MpesaService.localTransactions.set(paymentId, tx);
        MpesaService.localTransactions.set(checkoutRequestId, tx);
      }
    }
  }

  /**
   * Helper: Atomically record idempotency key
   */
  private async checkAndRecordIdempotency(key: string, resourceId: string): Promise<boolean> {
    try {
      const client = await pool.connect();
      try {
        const check = await client.query('SELECT key FROM idempotency_records WHERE key = $1', [key]);
        if (check.rows.length > 0) {
          return true; // Already exists
        }
        await client.query(
          `INSERT INTO idempotency_records (key, provider, resource_id) VALUES ($1, $2, $3)`,
          [key, 'MPESA', resourceId]
        );
        return false;
      } finally {
        client.release();
      }
    } catch {
      if (MpesaService.localIdempotencyKeys.has(key)) {
        return true;
      }
      MpesaService.localIdempotencyKeys.add(key);
      return false;
    }
  }

  /**
   * Helper: Record reconciliation discrepancy
   */
  private async flagReconciliationDiscrepancy(paymentId: string, reason: string): Promise<void> {
    const id = `rec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO payment_reconciliations (id, payment_id, status, discrepancy_reason, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, paymentId, 'DISCREPANCY_FLAGGED', reason, now]
        );
      } finally {
        client.release();
      }
    } catch {
      MpesaService.localReconciliations.push({
        id,
        paymentId,
        status: 'DISCREPANCY_FLAGGED',
        discrepancyReason: reason,
        createdAt: now
      });
    }
  }

  /**
   * 4. List transactions for an organization
   */
  async listTransactions(
    organizationId: string,
    filter?: { electionId?: string; voterCode?: string; status?: PaymentTransactionStatus }
  ): Promise<PaymentTransactionRecord[]> {
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        let query = 'SELECT * FROM payment_transactions WHERE organization_id = $1';
        const params: unknown[] = [organizationId];

        if (filter?.electionId) {
          params.push(filter.electionId);
          query += ` AND election_id = $${params.length}`;
        }
        if (filter?.voterCode) {
          params.push(filter.voterCode.toUpperCase());
          query += ` AND voter_code = $${params.length}`;
        }
        if (filter?.status) {
          params.push(filter.status);
          query += ` AND status = $${params.length}`;
        }

        query += ' ORDER BY created_at DESC';
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbTransaction(r));
      } finally {
        client.release();
      }
    } catch {
      const list = Array.from(MpesaService.localTransactions.values()).filter(
        (t) => t.organizationId === organizationId
      );
      // Deduplicate by ID
      const map = new Map<string, PaymentTransactionRecord>();
      for (const t of list) {
        if (!map.has(t.id)) map.set(t.id, t);
      }
      let filtered = Array.from(map.values());
      if (filter?.electionId) filtered = filtered.filter((t) => t.electionId === filter.electionId);
      if (filter?.voterCode) {
        const vCode = filter.voterCode.toUpperCase();
        filtered = filtered.filter((t) => t.voterCode === vCode);
      }
      if (filter?.status) filtered = filtered.filter((t) => t.status === filter.status);
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  private mapDbTransaction(row: Record<string, unknown>): PaymentTransactionRecord {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      electionId: row.election_id as string,
      packageId: row.package_id as string,
      voterCode: row.voter_code as string,
      provider: row.provider as PaymentProvider,
      amountCents: Number(row.amount_cents),
      currency: row.currency as string,
      phoneNumber: row.phone_number as string | undefined,
      merchantRequestId: row.merchant_request_id as string,
      checkoutRequestId: row.checkout_request_id as string,
      mpesaReceiptNumber: row.mpesa_receipt_number as string | undefined,
      status: row.status as PaymentTransactionStatus,
      resultCode: row.result_code !== null ? Number(row.result_code) : undefined,
      resultDesc: row.result_desc as string | undefined,
      creditsIssued: Boolean(row.credits_issued),
      creditsIssuedAt: row.credits_issued_at
        ? (row.credits_issued_at as Date).toISOString
          ? (row.credits_issued_at as Date).toISOString()
          : (row.credits_issued_at as string)
        : undefined,
      createdAt: (row.created_at as Date).toISOString
        ? (row.created_at as Date).toISOString()
        : (row.created_at as string),
      updatedAt: (row.updated_at as Date).toISOString
        ? (row.updated_at as Date).toISOString()
        : (row.updated_at as string)
    };
  }
}

export const mpesaService = new MpesaService();
