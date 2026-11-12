import {
  RefundRecord,
  ChargebackRecord,
  CreateRefundRequest,
  CreateChargebackRequest,
  FinancialAccountType,
  LedgerDirection
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { revenueService } from '../revenue/revenue.service.js';
import { financialLedgerService } from '../financial-ledger/financial-ledger.service.js';

export class RefundsService {
  private static localRefunds: RefundRecord[] = [];
  private static localChargebacks: ChargebackRecord[] = [];

  public static resetState(): void {
    RefundsService.localRefunds = [];
    RefundsService.localChargebacks = [];
  }

  /**
   * Process a Full or Partial Refund.
   * Invariant: Never deletes history; creates immutable reversal double-entry ledger entries.
   */
  async processRefund(
    organizationId: string,
    req: CreateRefundRequest,
    userId?: string
  ): Promise<RefundRecord> {
    const { paymentTransactionId, reason, voterCode } = req;
    if (!paymentTransactionId || !reason) {
      throw new AppError('Payment transaction ID and refund reason are required', 400, 'INVALID_REFUND_REQUEST');
    }

    // 1. Fetch Revenue Allocation
    const allocation = await revenueService.getAllocationByPaymentId(paymentTransactionId);
    if (!allocation) {
      throw new AppError('Revenue allocation not found for this transaction', 404, 'ALLOCATION_NOT_FOUND');
    }

    if (allocation.organizationId !== organizationId) {
      throw new AppError('Unauthorized: Allocation belongs to another tenant', 403, 'TENANT_MISMATCH');
    }

    if (allocation.status === 'FULLY_REFUNDED') {
      throw new AppError('This transaction has already been fully refunded', 400, 'ALREADY_REFUNDED');
    }

    // Check existing refunds for partial limits
    const existingRefunds = await this.listRefundsForPayment(paymentTransactionId);
    const totalPreviouslyRefunded = existingRefunds.reduce((sum, r) => sum + r.refundAmountCents, 0);
    const availableToRefund = allocation.grossAmountCents - totalPreviouslyRefunded;

    const requestedAmount = req.amountCents || availableToRefund;
    if (requestedAmount <= 0) {
      throw new AppError('Refund amount must be a positive integer in cents', 400, 'INVALID_AMOUNT');
    }
    if (requestedAmount > availableToRefund) {
      throw new AppError(
        `Requested refund (${requestedAmount} cents) exceeds maximum available to refund (${availableToRefund} cents)`,
        400,
        'REFUND_EXCEEDS_AVAILABLE'
      );
    }

    const isFullRefund = requestedAmount === allocation.grossAmountCents && totalPreviouslyRefunded === 0;
    const isNowFullyRefunded = totalPreviouslyRefunded + requestedAmount >= allocation.grossAmountCents;

    // 2. Calculate Proportional Reversals
    const ratio = requestedAmount / allocation.grossAmountCents;
    const reversalDistributableCents = Math.floor(allocation.distributableAmountCents * ratio);
    const reversalPlatformCents = Math.floor(allocation.platformFeeCents * ratio);
    // Organiser share as exact remainder to guarantee no rounding drift
    const reversalOrganiserCents = reversalDistributableCents - reversalPlatformCents;
    const reversalProcessingCents = requestedAmount - reversalDistributableCents;

    // 3. Post Reversal Double-Entry Ledger Entries
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      allocation.currency
    );

    const platformTreasury = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PLATFORM_TREASURY,
      allocation.currency
    );

    const processingEscrow = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PROCESSING_FEES_ESCROW,
      allocation.currency
    );

    const refundPool = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.VOTER_REFUND_POOL,
      allocation.currency
    );

    // Reversal Debits and Credits
    // DEBIT Platform Treasury (reversal of commission)
    // DEBIT Organizer Treasury (reversal of earnings)
    // DEBIT Processing Escrow (reversal of fee)
    // CREDIT Voter Refund Pool (funds returned to voter)
    // Total Debits === Total Credits === requestedAmount!
    const reversalEntries: Array<{
      accountId: string;
      direction: LedgerDirection;
      amountCents: number;
      description?: string;
    }> = [];

    if (reversalPlatformCents > 0) {
      reversalEntries.push({
        accountId: platformTreasury.id,
        direction: LedgerDirection.DEBIT,
        amountCents: reversalPlatformCents,
        description: `Platform commission refund reversal for ${paymentTransactionId}`
      });
    }

    if (reversalOrganiserCents > 0) {
      reversalEntries.push({
        accountId: orgTreasury.id,
        direction: LedgerDirection.DEBIT,
        amountCents: reversalOrganiserCents,
        description: `Organiser net share refund reversal for ${paymentTransactionId}`
      });
    }

    if (reversalProcessingCents > 0) {
      reversalEntries.push({
        accountId: processingEscrow.id,
        direction: LedgerDirection.DEBIT,
        amountCents: reversalProcessingCents,
        description: `Processing fee absorption/reversal`
      });
    }

    reversalEntries.push({
      accountId: refundPool.id,
      direction: LedgerDirection.CREDIT,
      amountCents: requestedAmount,
      description: `Customer refund payout for ${paymentTransactionId}`
    });

    const ledgerBatch = await financialLedgerService.recordDoubleEntryBatch({
      organizationId,
      referenceType: 'REFUND',
      referenceId: paymentTransactionId,
      description: `Refund reversal for payment ${paymentTransactionId}: ${reason}`,
      entries: reversalEntries
    });

    // 4. Record Immutable Refund Entry
    const refundId = `ref-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const refundRecord: RefundRecord = {
      id: refundId,
      paymentTransactionId,
      revenueAllocationId: allocation.id,
      organizationId,
      electionId: allocation.electionId,
      voterCode,
      type: isFullRefund ? 'FULL' : 'PARTIAL',
      refundAmountCents: requestedAmount,
      reversalDistributableCents,
      reversalPlatformCents,
      reversalOrganiserCents,
      reason,
      status: 'PROCESSED',
      processedBy: userId,
      ledgerEntryGroupId: ledgerBatch.entryGroupId,
      createdAt: now,
      updatedAt: now
    };

    // Update allocation status in DB/cache
    const newStatus = isNowFullyRefunded ? 'FULLY_REFUNDED' : 'PARTIALLY_REFUNDED';
    allocation.status = newStatus;

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `INSERT INTO refunds (
            id, payment_transaction_id, revenue_allocation_id, organization_id, election_id,
            voter_code, type, refund_amount_cents, reversal_distributable_cents,
            reversal_platform_cents, reversal_organiser_cents, reason, status,
            processed_by, ledger_entry_group_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            refundRecord.id,
            refundRecord.paymentTransactionId,
            refundRecord.revenueAllocationId,
            refundRecord.organizationId,
            refundRecord.electionId,
            refundRecord.voterCode,
            refundRecord.type,
            refundRecord.refundAmountCents,
            refundRecord.reversalDistributableCents,
            refundRecord.reversalPlatformCents,
            refundRecord.reversalOrganiserCents,
            refundRecord.reason,
            refundRecord.status,
            refundRecord.processedBy,
            refundRecord.ledgerEntryGroupId,
            now,
            now
          ]
        );

        await client.query(
          `UPDATE revenue_allocations SET status = $1 WHERE id = $2`,
          [newStatus, allocation.id]
        );
      } finally {
        client.release();
      }
    } catch {
      RefundsService.localRefunds.unshift(refundRecord);
    }

    return refundRecord;
  }

  /**
   * Process Chargeback / Dispute.
   * Atomically debits organizer available balance and credits reserve escrow.
   */
  async processChargeback(
    organizationId: string,
    req: CreateChargebackRequest
  ): Promise<ChargebackRecord> {
    const { paymentTransactionId, amountCents, reason } = req;
    const allocation = await revenueService.getAllocationByPaymentId(paymentTransactionId);
    if (!allocation) {
      throw new AppError('Revenue allocation not found for chargeback', 404, 'ALLOCATION_NOT_FOUND');
    }

    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      allocation.currency
    );

    const reserveEscrow = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.RESERVE_ESCROW,
      allocation.currency
    );

    // Balanced ledger batch: Move funds into dispute reserve
    const batch = await financialLedgerService.recordDoubleEntryBatch({
      organizationId,
      referenceType: 'CHARGEBACK',
      referenceId: paymentTransactionId,
      description: `Chargeback dispute hold: ${reason}`,
      entries: [
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.DEBIT,
          amountCents,
          description: `Chargeback debit from organizer available balance`
        },
        {
          accountId: reserveEscrow.id,
          direction: LedgerDirection.CREDIT,
          amountCents,
          description: `Dispute reserve escrow hold`,
          affectsReserved: true
        }
      ]
    });

    const chargebackId = `chb-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const record: ChargebackRecord = {
      id: chargebackId,
      paymentTransactionId,
      revenueAllocationId: allocation.id,
      organizationId,
      disputeAmountCents: amountCents,
      reason,
      status: 'UNDER_REVIEW',
      ledgerEntryGroupId: batch.entryGroupId,
      createdAt: now,
      updatedAt: now
    };

    allocation.status = 'DISPUTED';

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `INSERT INTO chargebacks (
            id, payment_transaction_id, revenue_allocation_id, organization_id,
            dispute_amount_cents, reason, status, ledger_entry_group_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            record.id,
            record.paymentTransactionId,
            record.revenueAllocationId,
            record.organizationId,
            record.disputeAmountCents,
            record.reason,
            record.status,
            record.ledgerEntryGroupId,
            now,
            now
          ]
        );

        await client.query(
          `UPDATE revenue_allocations SET status = 'DISPUTED' WHERE id = $1`,
          [allocation.id]
        );
      } finally {
        client.release();
      }
    } catch {
      RefundsService.localChargebacks.unshift(record);
    }

    return record;
  }

  /**
   * List refunds for an organization
   */
  async listRefunds(organizationId: string): Promise<RefundRecord[]> {
    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        const res = await client.query(
          `SELECT * FROM refunds WHERE organization_id = $1 ORDER BY created_at DESC`,
          [organizationId]
        );
        return res.rows.map((r) => this.mapDbRefund(r));
      } finally {
        client.release();
      }
    } catch {
      return RefundsService.localRefunds.filter((r) => r.organizationId === organizationId);
    }
  }

  private async listRefundsForPayment(paymentId: string): Promise<RefundRecord[]> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM refunds WHERE payment_transaction_id = $1`,
          [paymentId]
        );
        return res.rows.map((r) => this.mapDbRefund(r));
      } finally {
        client.release();
      }
    } catch {
      return RefundsService.localRefunds.filter((r) => r.paymentTransactionId === paymentId);
    }
  }

  private mapDbRefund(row: Record<string, unknown>): RefundRecord {
    return {
      id: row.id as string,
      paymentTransactionId: row.payment_transaction_id as string,
      revenueAllocationId: row.revenue_allocation_id as string,
      organizationId: row.organization_id as string,
      electionId: row.election_id as string,
      voterCode: (row.voter_code as string) || undefined,
      type: row.type as 'PARTIAL' | 'FULL',
      refundAmountCents: Number(row.refund_amount_cents),
      reversalDistributableCents: Number(row.reversal_distributable_cents),
      reversalPlatformCents: Number(row.reversal_platform_cents),
      reversalOrganiserCents: Number(row.reversal_organiser_cents),
      reason: row.reason as string,
      status: row.status as 'REQUESTED' | 'APPROVED' | 'PROCESSED' | 'REJECTED',
      processedBy: (row.processed_by as string) || undefined,
      ledgerEntryGroupId: (row.ledger_entry_group_id as string) || undefined,
      createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string),
      updatedAt: (row.updated_at as Date).toISOString ? (row.updated_at as Date).toISOString() : (row.updated_at as string)
    };
  }
}

export const refundsService = new RefundsService();

