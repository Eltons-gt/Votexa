import {
  RevenueAllocation,
  OrganizerRevenueMetrics,
  SuperAdminFinancialMetrics,
  FinancialAccountType,
  LedgerDirection
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { financialLedgerService } from '../financial-ledger/financial-ledger.service.js';

export interface RevenueAllocationOptions {
  processingFeeCents?: number;
  approvedDeductionCents?: number;
  platformRateBasisPoints?: number; // Defaults to 2500 (25%)
}

export class RevenueService {
  // In-memory fallback cache
  private static localAllocations = new Map<string, RevenueAllocation>();
  private static localPaymentToAllocMap = new Map<string, string>();

  // Current default commission settings: 40.00% Platform / 60.00% Organiser
  private static currentPlatformRateBasisPoints: number = 4000; // 40.00%

  public static resetState(): void {
    RevenueService.localAllocations.clear();
    RevenueService.localPaymentToAllocMap.clear();
    RevenueService.currentPlatformRateBasisPoints = 4000;
  }

  /**
   * Set global platform commission rate for FUTURE allocations.
   * Crucial Rule: Historical allocations must NEVER change when this is updated!
   */
  public setGlobalPlatformCommissionRate(rateBasisPoints: number): void {
    if (rateBasisPoints < 0 || rateBasisPoints > 10000) {
      throw new AppError('Platform commission rate must be between 0 and 10,000 basis points (0% - 100%)', 400, 'INVALID_RATE');
    }
    RevenueService.currentPlatformRateBasisPoints = rateBasisPoints;
  }

  /**
   * Compute Commercial 25/75 Split with integer minor currency units.
   * Formula:
   *   Distributable = Gross - Processing Fees - Approved Deductions
   *   Platform Share = floor(Distributable * 25 / 100)
   *   Organiser Share = Distributable - Platform Share
   *   Invariant: Platform Share + Organiser Share === Distributable
   */
  public calculateSplit(
    grossAmountCents: number,
    processingFeeCents: number = 0,
    approvedDeductionCents: number = 0,
    platformRateBasisPoints: number = RevenueService.currentPlatformRateBasisPoints
  ): {
    distributableAmountCents: number;
    platformFeeCents: number;
    organiserFeeCents: number;
    platformRateBasisPoints: number;
    organiserRateBasisPoints: number;
  } {
    if (!Number.isInteger(grossAmountCents) || grossAmountCents < 0) {
      throw new AppError('Gross amount must be a non-negative integer in cents', 400, 'INVALID_AMOUNT');
    }
    if (!Number.isInteger(processingFeeCents) || processingFeeCents < 0) {
      throw new AppError('Processing fee must be a non-negative integer in cents', 400, 'INVALID_FEE');
    }
    if (!Number.isInteger(approvedDeductionCents) || approvedDeductionCents < 0) {
      throw new AppError('Approved deductions must be a non-negative integer in cents', 400, 'INVALID_DEDUCTION');
    }

    const totalDeductions = processingFeeCents + approvedDeductionCents;
    if (totalDeductions > grossAmountCents) {
      throw new AppError(
        `Total deductions (${totalDeductions} cents) cannot exceed gross payment (${grossAmountCents} cents)`,
        400,
        'DEDUCTIONS_EXCEED_GROSS'
      );
    }

    const distributableAmountCents = grossAmountCents - totalDeductions;
    const organiserRateBasisPoints = 10000 - platformRateBasisPoints;

    // Platform share calculated using integer arithmetic
    const platformFeeCents = Math.floor((distributableAmountCents * platformRateBasisPoints) / 10000);

    // Organiser share is calculated as remainder to guarantee zero rounding error
    const organiserFeeCents = distributableAmountCents - platformFeeCents;

    return {
      distributableAmountCents,
      platformFeeCents,
      organiserFeeCents,
      platformRateBasisPoints,
      organiserRateBasisPoints
    };
  }

  /**
   * Allocate revenue after a verified payment.
   * Records immutable commission snapshot & balanced double-entry ledger entries.
   */
  async allocateRevenue(
    paymentTransaction: {
      id: string;
      organizationId: string;
      electionId: string;
      amountCents: number;
      currency?: string;
    },
    options?: RevenueAllocationOptions
  ): Promise<RevenueAllocation> {
    const paymentId = paymentTransaction.id;
    const currency = (paymentTransaction.currency || 'USD').toUpperCase();
    const grossAmountCents = paymentTransaction.amountCents;

    // 1. Idempotency Check: Verify if revenue is already allocated for this payment
    const existing = await this.getAllocationByPaymentId(paymentId);
    if (existing) {
      return existing;
    }

    // Default processing fee estimation (e.g. 1.5% gateway fee if not explicitly specified)
    const processingFeeCents =
      options?.processingFeeCents !== undefined
        ? options.processingFeeCents
        : Math.round(grossAmountCents * 0.015);

    const approvedDeductionCents = options?.approvedDeductionCents || 0;
    const platformRate = options?.platformRateBasisPoints || RevenueService.currentPlatformRateBasisPoints;

    // 2. Perform Commercial 25/75 Split
    const split = this.calculateSplit(
      grossAmountCents,
      processingFeeCents,
      approvedDeductionCents,
      platformRate
    );

    const allocationId = `rev-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    const allocation: RevenueAllocation = {
      id: allocationId,
      paymentTransactionId: paymentId,
      organizationId: paymentTransaction.organizationId,
      electionId: paymentTransaction.electionId,
      grossAmountCents,
      processingFeeCents,
      approvedDeductionCents,
      distributableAmountCents: split.distributableAmountCents,
      platformRateBasisPoints: split.platformRateBasisPoints,
      platformFeeCents: split.platformFeeCents,
      organiserRateBasisPoints: split.organiserRateBasisPoints,
      organiserFeeCents: split.organiserFeeCents,
      currency,
      status: 'ALLOCATED',
      allocatedAt: now
    };

    // 3. Double-Entry Financial Accounts Retrieval
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      paymentTransaction.organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      currency
    );

    const platformTreasury = await financialLedgerService.getOrCreateAccount(
      null, // Platform Global
      FinancialAccountType.PLATFORM_TREASURY,
      currency
    );

    const processingEscrow = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PROCESSING_FEES_ESCROW,
      currency
    );

    const reserveEscrow = await financialLedgerService.getOrCreateAccount(
      paymentTransaction.organizationId,
      FinancialAccountType.RESERVE_ESCROW,
      currency
    );

    const refundPool = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.VOTER_REFUND_POOL,
      currency
    );

    // 4. Construct Balanced Double-Entry Batch
    // DEBIT customer clearing (voter refund pool / payment ingress)
    // CREDIT Processing Escrow (fees)
    // CREDIT Reserve Escrow (deductions)
    // CREDIT Platform Treasury (25% commission)
    // CREDIT Organizer Treasury (75% net earnings)
    const ledgerEntries: Array<{
      accountId: string;
      direction: LedgerDirection;
      amountCents: number;
      description?: string;
    }> = [
      {
        accountId: refundPool.id,
        direction: LedgerDirection.DEBIT,
        amountCents: grossAmountCents,
        description: `Gross payment ingress (${currency} ${grossAmountCents / 100}) for payment ${paymentId}`
      }
    ];

    if (processingFeeCents > 0) {
      ledgerEntries.push({
        accountId: processingEscrow.id,
        direction: LedgerDirection.CREDIT,
        amountCents: processingFeeCents,
        description: `Payment processor gateway fee deduction`
      });
    }

    if (approvedDeductionCents > 0) {
      ledgerEntries.push({
        accountId: reserveEscrow.id,
        direction: LedgerDirection.CREDIT,
        amountCents: approvedDeductionCents,
        description: `Approved deduction reserve`
      });
    }

    if (split.platformFeeCents > 0) {
      ledgerEntries.push({
        accountId: platformTreasury.id,
        direction: LedgerDirection.CREDIT,
        amountCents: split.platformFeeCents,
        description: `Platform 25% revenue commission on payment ${paymentId}`
      });
    }

    if (split.organiserFeeCents > 0) {
      ledgerEntries.push({
        accountId: orgTreasury.id,
        direction: LedgerDirection.CREDIT,
        amountCents: split.organiserFeeCents,
        description: `Organiser 75% net share on payment ${paymentId}`
      });
    }

    // Dispatch balanced double-entry batch
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId: paymentTransaction.organizationId,
      referenceType: 'PAYMENT',
      referenceId: paymentId,
      description: `Revenue allocation for payment ${paymentId}`,
      entries: ledgerEntries
    });

    // 5. Store Revenue Allocation Record in DB / Local Cache
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [paymentTransaction.organizationId]);
        await client.query(
          `INSERT INTO revenue_allocations (
            id, payment_transaction_id, organization_id, election_id,
            gross_amount_cents, processing_fee_cents, approved_deduction_cents,
            distributable_amount_cents, platform_rate_basis_points, platform_fee_cents,
            organiser_rate_basis_points, organiser_fee_cents, currency, status, allocated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            allocation.id,
            allocation.paymentTransactionId,
            allocation.organizationId,
            allocation.electionId,
            allocation.grossAmountCents,
            allocation.processingFeeCents,
            allocation.approvedDeductionCents,
            allocation.distributableAmountCents,
            allocation.platformRateBasisPoints,
            allocation.platformFeeCents,
            allocation.organiserRateBasisPoints,
            allocation.organiserFeeCents,
            allocation.currency,
            allocation.status,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      RevenueService.localAllocations.set(allocation.id, allocation);
      RevenueService.localPaymentToAllocMap.set(allocation.paymentTransactionId, allocation.id);
    }

    return allocation;
  }

  /**
   * Find allocation by payment transaction ID
   */
  async getAllocationByPaymentId(paymentId: string): Promise<RevenueAllocation | null> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM revenue_allocations WHERE payment_transaction_id = $1`,
          [paymentId]
        );
        if (res.rows.length > 0) {
          return this.mapDbAllocation(res.rows[0]);
        }
        return null;
      } finally {
        client.release();
      }
    } catch {
      const allocId = RevenueService.localPaymentToAllocMap.get(paymentId);
      return (allocId ? RevenueService.localAllocations.get(allocId) : null) || null;
    }
  }

  /**
   * Organizer Revenue Dashboard Metrics
   */
  async getOrganizerMetrics(organizationId: string, currency: string = 'USD'): Promise<OrganizerRevenueMetrics> {
    const allocations = await this.listAllocations(organizationId);
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      currency
    );

    let grossSales = 0;
    let processingFees = 0;
    let approvedDeductions = 0;
    let distributableAmount = 0;
    let platformCommission = 0;
    let organiserEarnings = 0;

    for (const a of allocations) {
      if (a.status !== 'FULLY_REFUNDED') {
        grossSales += a.grossAmountCents;
        processingFees += a.processingFeeCents;
        approvedDeductions += a.approvedDeductionCents;
        distributableAmount += a.distributableAmountCents;
        platformCommission += a.platformFeeCents;
        organiserEarnings += a.organiserFeeCents;
      }
    }

    return {
      organizationId,
      currency,
      grossSales,
      processingFees,
      approvedDeductions,
      distributableAmount,
      platformCommission,
      organiserEarnings,
      availableBalance: orgTreasury.availableBalance,
      reservedBalance: orgTreasury.reservedBalance,
      allocationsCount: allocations.length
    };
  }

  /**
   * Super Admin Financial Overview
   */
  async getPlatformMetrics(currency: string = 'USD'): Promise<SuperAdminFinancialMetrics> {
    const allAllocations = await this.listAllAllocations();
    const platformTreasury = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PLATFORM_TREASURY,
      currency
    );

    const audit = await financialLedgerService.verifyLedgerIntegrity();

    let totalPaymentVolume = 0;
    let processingFees = 0;
    let refundsTotal = 0;
    let chargebacksTotal = 0;
    let organiserLiabilities = 0;

    for (const a of allAllocations) {
      totalPaymentVolume += a.grossAmountCents;
      processingFees += a.processingFeeCents;
      if (a.status !== 'FULLY_REFUNDED') {
        organiserLiabilities += a.organiserFeeCents;
      }
      if (a.status === 'FULLY_REFUNDED' || a.status === 'PARTIALLY_REFUNDED') {
        refundsTotal += a.grossAmountCents;
      }
      if (a.status === 'DISPUTED') {
        chargebacksTotal += a.grossAmountCents;
      }
    }

    return {
      currency,
      totalPaymentVolume,
      platformRevenue: platformTreasury.availableBalance,
      organiserLiabilities,
      processingFees,
      refundsTotal,
      chargebacksTotal,
      reconciliationDiscrepancies: audit.discrepancies.length,
      isLedgerBalanced: audit.isBalanced
    };
  }

  /**
   * List allocations for an organization
   */
  async listAllocations(organizationId: string): Promise<RevenueAllocation[]> {
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        const res = await client.query(
          `SELECT * FROM revenue_allocations WHERE organization_id = $1 ORDER BY allocated_at DESC`,
          [organizationId]
        );
        return res.rows.map((r) => this.mapDbAllocation(r));
      } finally {
        client.release();
      }
    } catch {
      return Array.from(RevenueService.localAllocations.values()).filter(
        (a) => a.organizationId === organizationId
      );
    }
  }

  /**
   * List all platform allocations (Super admin only)
   */
  async listAllAllocations(): Promise<RevenueAllocation[]> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(`SELECT * FROM revenue_allocations ORDER BY allocated_at DESC`);
        return res.rows.map((r) => this.mapDbAllocation(r));
      } finally {
        client.release();
      }
    } catch {
      return Array.from(RevenueService.localAllocations.values());
    }
  }

  private mapDbAllocation(row: Record<string, unknown>): RevenueAllocation {
    return {
      id: row.id as string,
      paymentTransactionId: row.payment_transaction_id as string,
      organizationId: row.organization_id as string,
      electionId: row.election_id as string,
      grossAmountCents: Number(row.gross_amount_cents),
      processingFeeCents: Number(row.processing_fee_cents),
      approvedDeductionCents: Number(row.approved_deduction_cents),
      distributableAmountCents: Number(row.distributable_amount_cents),
      platformRateBasisPoints: Number(row.platform_rate_basis_points),
      platformFeeCents: Number(row.platform_fee_cents),
      organiserRateBasisPoints: Number(row.organiser_rate_basis_points),
      organiserFeeCents: Number(row.organiser_fee_cents),
      currency: row.currency as string,
      status: row.status as 'ALLOCATED' | 'PARTIALLY_REFUNDED' | 'FULLY_REFUNDED' | 'DISPUTED',
      allocatedAt: (row.allocated_at as Date).toISOString ? (row.allocated_at as Date).toISOString() : (row.allocated_at as string)
    };
  }
}

export const revenueService = new RevenueService();
