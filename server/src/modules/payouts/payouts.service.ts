import {
  OrganizerPayout,
  PayoutReservation,
  PayoutAuditLog,
  OrganizationPayoutAccount,
  PayoutStatus,
  PayoutMethod,
  CreateWithdrawalRequest,
  FinancialAccountType,
  LedgerDirection
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { financialLedgerService } from '../financial-ledger/financial-ledger.service.js';
import { mpesaClient } from '../payments/mpesa.client.js';

export class PayoutsService {
  private static localPayouts = new Map<string, OrganizerPayout>();
  private static localReservations = new Map<string, PayoutReservation>();
  private static localAuditLogs: PayoutAuditLog[] = [];
  private static localAccounts = new Map<string, OrganizationPayoutAccount[]>();

  public static resetState(): void {
    PayoutsService.localPayouts.clear();
    PayoutsService.localReservations.clear();
    PayoutsService.localAuditLogs = [];
    PayoutsService.localAccounts.clear();
  }

  /**
   * 1. Submit Withdrawal Request & Atomically Reserve Funds
   * Invariant: Never deducts permanently at request creation; reserves funds first.
   */
  async requestWithdrawal(
    organizationId: string,
    userId: string,
    req: CreateWithdrawalRequest
  ): Promise<OrganizerPayout> {
    const { amountCents, method, destinationDetails } = req;
    const currency = (req.currency || 'USD').toUpperCase();

    // 1. Amount validation
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new AppError('Withdrawal amount must be a positive integer in cents', 400, 'INVALID_AMOUNT');
    }

    const MIN_WITHDRAWAL_CENTS = 1000; // $10.00 min threshold
    if (amountCents < MIN_WITHDRAWAL_CENTS) {
      throw new AppError(
        `Minimum withdrawal amount is $${(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)} (${MIN_WITHDRAWAL_CENTS} cents)`,
        400,
        'MINIMUM_WITHDRAWAL_NOT_MET'
      );
    }

    // 2. Destination validation
    let normalizedDestination: Record<string, unknown> = { ...destinationDetails };
    if (method === PayoutMethod.MPESA_B2C) {
      if (!destinationDetails.phoneNumber) {
        throw new AppError('M-Pesa phone number is required for mobile disbursement', 400, 'PHONE_REQUIRED');
      }
      const normPhone = mpesaClient.normalizePhoneNumber(destinationDetails.phoneNumber);
      normalizedDestination = {
        ...destinationDetails,
        phoneNumber: normPhone
      };
    } else if (method === PayoutMethod.BANK_TRANSFER) {
      if (!destinationDetails.accountNumber || !destinationDetails.accountName || !destinationDetails.bankName) {
        throw new AppError('Bank account number, account name, and bank name are required', 400, 'BANK_DETAILS_INCOMPLETE');
      }
    }

    // 3. Available Balance Check
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      currency
    );

    if (orgTreasury.availableBalance < amountCents) {
      throw new AppError(
        `Insufficient available earnings. Available: $${(orgTreasury.availableBalance / 100).toFixed(2)}, Requested: $${(amountCents / 100).toFixed(2)}`,
        400,
        'INSUFFICIENT_BALANCE'
      );
    }

    // 4. Check for duplicate pending requests
    const existingPayouts = await this.listPayouts(organizationId);
    const hasDuplicatePending = existingPayouts.some(
      (p) =>
        (p.status === PayoutStatus.REQUESTED || p.status === PayoutStatus.RESERVED || p.status === PayoutStatus.UNDER_REVIEW) &&
        p.amountCents === amountCents &&
        p.method === method
    );

    if (hasDuplicatePending) {
      throw new AppError('A withdrawal request for this exact amount is already pending review.', 409, 'DUPLICATE_PAYOUT_REQUEST');
    }

    // Fixed nominal disbursement fee
    const feeCents = method === PayoutMethod.MPESA_B2C ? 50 : 150; // $0.50 M-Pesa / $1.50 Wire
    const netAmountCents = amountCents - feeCents;
    if (netAmountCents <= 0) {
      throw new AppError('Withdrawal amount must exceed the disbursement processing fee', 400, 'AMOUNT_BELOW_FEE');
    }

    const payoutId = `pot-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const reservationId = `res-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    // 5. ATOMIC RESERVATION: Move funds from available to reserved
    // Uses double-entry ledger reserve batch
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId,
      referenceType: 'PAYOUT_RESERVE',
      referenceId: payoutId,
      description: `Reserve funds for withdrawal request ${payoutId}`,
      entries: [
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.DEBIT,
          amountCents,
          description: `Debit available balance for payout reservation`
        },
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.CREDIT,
          amountCents,
          description: `Credit reserved balance for payout reservation`,
          affectsReserved: true
        }
      ]
    });

    const payout: OrganizerPayout = {
      id: payoutId,
      organizationId,
      payoutAccountId: req.payoutAccountId,
      amountCents,
      feeCents,
      netAmountCents,
      currency,
      method,
      destinationDetails: normalizedDestination,
      status: PayoutStatus.RESERVED,
      requestedBy: userId,
      createdAt: now,
      updatedAt: now
    };

    const reservation: PayoutReservation = {
      id: reservationId,
      payoutId,
      accountId: orgTreasury.id,
      organizationId,
      amountCents,
      status: 'ACTIVE',
      reservedAt: now
    };

    const auditLog: PayoutAuditLog = {
      id: `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      payoutId,
      organizationId,
      performedBy: userId,
      action: 'PAYOUT_REQUESTED_AND_RESERVED',
      fromStatus: PayoutStatus.REQUESTED,
      toStatus: PayoutStatus.RESERVED,
      notes: `Requested $${(amountCents / 100).toFixed(2)} via ${method}. Funds reserved in treasury.`,
      createdAt: now
    };

    // Store in DB / Cache
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        await client.query('BEGIN');

        await client.query(
          `INSERT INTO organizer_payouts (
            id, organization_id, payout_account_id, amount_cents, fee_cents, net_amount_cents,
            currency, method, destination_details, status, requested_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            payout.id,
            payout.organizationId,
            payout.payoutAccountId,
            payout.amountCents,
            payout.feeCents,
            payout.netAmountCents,
            payout.currency,
            payout.method,
            JSON.stringify(payout.destinationDetails),
            payout.status,
            payout.requestedBy,
            now,
            now
          ]
        );

        await client.query(
          `INSERT INTO payout_reservations (
            id, payout_id, account_id, organization_id, amount_cents, status, reserved_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            reservation.id,
            reservation.payoutId,
            reservation.accountId,
            reservation.organizationId,
            reservation.amountCents,
            reservation.status,
            now
          ]
        );

        await client.query(
          `INSERT INTO payout_audit_logs (
            id, payout_id, organization_id, performed_by, action, from_status, to_status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            auditLog.id,
            auditLog.payoutId,
            auditLog.organizationId,
            auditLog.performedBy,
            auditLog.action,
            auditLog.fromStatus,
            auditLog.toStatus,
            auditLog.notes,
            now
          ]
        );

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch {
      PayoutsService.localPayouts.set(payout.id, payout);
      PayoutsService.localReservations.set(payout.id, reservation);
      PayoutsService.localAuditLogs.unshift(auditLog);
    }

    return payout;
  }

  /**
   * 2. Administrator Review & Approval / Rejection
   * Separation of duties invariant: An administrator cannot approve their own withdrawal request!
   */
  async reviewPayout(
    payoutId: string,
    adminUserId: string,
    action: 'APPROVE' | 'REJECT',
    reason?: string
  ): Promise<OrganizerPayout> {
    const payout = await this.getPayoutRecord(payoutId);
    if (!payout) {
      throw new AppError('Payout request not found', 404, 'PAYOUT_NOT_FOUND');
    }

    if (
      payout.status !== PayoutStatus.RESERVED &&
      payout.status !== PayoutStatus.REQUESTED &&
      payout.status !== PayoutStatus.UNDER_REVIEW
    ) {
      throw new AppError(
        `Cannot review payout in current status '${payout.status}'. Expected RESERVED or UNDER_REVIEW.`,
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Separation of Duties Rule
    if (payout.requestedBy === adminUserId) {
      throw new AppError(
        'Separation of duties violation: An administrator cannot review or approve their own withdrawal request.',
        403,
        'SELF_APPROVAL_FORBIDDEN'
      );
    }

    const now = new Date().toISOString();
    const prevStatus = payout.status;

    if (action === 'APPROVE') {
      payout.status = PayoutStatus.APPROVED;
      payout.reviewedBy = adminUserId;
      payout.reviewedAt = now;
      payout.updatedAt = now;

      await this.recordAudit(
        payout.id,
        payout.organizationId,
        adminUserId,
        'PAYOUT_APPROVED',
        prevStatus,
        PayoutStatus.APPROVED,
        reason || 'Approved by administrator for disbursement processing'
      );

      await this.savePayoutRecord(payout);
      return payout;
    }

    // If REJECT: Release Reservation Back to Available Balance!
    payout.status = PayoutStatus.REJECTED;
    payout.reviewedBy = adminUserId;
    payout.reviewedAt = now;
    payout.rejectionReason = reason || 'Rejected by platform administrator';
    payout.updatedAt = now;

    // Release reservation in ledger
    await this.releaseReservation(payout, 'Rejected by administrator: funds restored to available balance');

    await this.recordAudit(
      payout.id,
      payout.organizationId,
      adminUserId,
      'PAYOUT_REJECTED',
      prevStatus,
      PayoutStatus.REJECTED,
      payout.rejectionReason
    );

    await this.savePayoutRecord(payout);
    return payout;
  }

  /**
   * 3. Record Payout Settlement with Mandatory Evidence
   * Invariants:
   *   - Do not mark a payout PAID without settlement evidence.
   *   - A payout cannot be settled twice.
   */
  async recordSettlement(
    payoutId: string,
    adminUserId: string,
    params: {
      settlementEvidence: string;
      providerReference?: string;
      notes?: string;
    }
  ): Promise<OrganizerPayout> {
    const { settlementEvidence, providerReference, notes } = params;

    if (!settlementEvidence || settlementEvidence.trim().length === 0) {
      throw new AppError(
        'Settlement evidence is mandatory (e.g. Bank wire reference, M-Pesa B2C Receipt number).',
        400,
        'SETTLEMENT_EVIDENCE_REQUIRED'
      );
    }

    const payout = await this.getPayoutRecord(payoutId);
    if (!payout) {
      throw new AppError('Payout request not found', 404, 'PAYOUT_NOT_FOUND');
    }

    // Anti-Double-Settlement Check
    if (payout.status === PayoutStatus.PAID) {
      throw new AppError('This payout has already been verified and settled.', 409, 'ALREADY_SETTLED');
    }

    if (payout.status !== PayoutStatus.APPROVED && payout.status !== PayoutStatus.PROCESSING) {
      throw new AppError(
        `Cannot settle payout with status '${payout.status}'. Payout must be APPROVED or PROCESSING.`,
        400,
        'INVALID_STATUS_FOR_SETTLEMENT'
      );
    }

    const now = new Date().toISOString();
    const prevStatus = payout.status;

    // 1. Double-Entry Settlement: Deduct reserved funds from treasury & post balanced ledger batch
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      payout.organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      payout.currency
    );

    const platformTreasury = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PLATFORM_TREASURY,
      payout.currency
    );

    // Balanced settlement entries:
    // DEBIT Organizer Treasury (clears reserved balance): payout.amountCents
    // CREDIT Platform Treasury (payout fee if applicable): payout.feeCents
    // CREDIT Customer Clearing / Bank Payout Outflow: payout.netAmountCents
    // Total Debits === Total Credits!
    const settlementEntries: Array<{
      accountId: string;
      direction: LedgerDirection;
      amountCents: number;
      description?: string;
      affectsReserved?: boolean;
    }> = [
      {
        accountId: orgTreasury.id,
        direction: LedgerDirection.DEBIT,
        amountCents: payout.amountCents,
        description: `Settlement outflow: clear reserved balance for payout ${payout.id}`,
        affectsReserved: true
      }
    ];

    if (payout.feeCents > 0) {
      settlementEntries.push({
        accountId: platformTreasury.id,
        direction: LedgerDirection.CREDIT,
        amountCents: payout.feeCents,
        description: `Disbursement fee collected on payout ${payout.id}`
      });
    }

    const refundPool = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.VOTER_REFUND_POOL,
      payout.currency
    );

    settlementEntries.push({
      accountId: refundPool.id,
      direction: LedgerDirection.CREDIT,
      amountCents: payout.netAmountCents,
      description: `External disbursement transfer: ${settlementEvidence}`
    });

    const ledgerBatch = await financialLedgerService.recordDoubleEntryBatch({
      organizationId: payout.organizationId,
      referenceType: 'PAYOUT_SETTLE',
      referenceId: payout.id,
      description: `Settlement confirmation for payout ${payout.id}`,
      entries: settlementEntries
    });

    // 2. Mark Reservation SETTLED
    await this.markReservationSettled(payout.id);

    // 3. Mark Payout PAID
    payout.status = PayoutStatus.PAID;
    payout.settlementEvidence = settlementEvidence.trim();
    payout.settledAt = now;
    payout.ledgerEntryGroupId = ledgerBatch.entryGroupId;
    payout.updatedAt = now;

    await this.recordAudit(
      payout.id,
      payout.organizationId,
      adminUserId,
      'PAYOUT_SETTLED_AND_PAID',
      prevStatus,
      PayoutStatus.PAID,
      `Settlement verified: ${settlementEvidence}. Ref: ${providerReference || 'N/A'}. ${notes || ''}`
    );

    await this.savePayoutRecord(payout);
    return payout;
  }

  /**
   * 4. Mark Payout Failed & Release Reservation
   */
  async failPayout(payoutId: string, reason: string, adminUserId?: string): Promise<OrganizerPayout> {
    const payout = await this.getPayoutRecord(payoutId);
    if (!payout) {
      throw new AppError('Payout request not found', 404, 'PAYOUT_NOT_FOUND');
    }

    if (payout.status === PayoutStatus.PAID) {
      throw new AppError('Cannot fail a payout that has already been marked PAID.', 400, 'CANNOT_FAIL_SETTLED');
    }

    const now = new Date().toISOString();
    const prevStatus = payout.status;

    payout.status = PayoutStatus.FAILED;
    payout.rejectionReason = reason;
    payout.updatedAt = now;

    // Release reservation
    await this.releaseReservation(payout, `Disbursement failed: ${reason}. Funds released back to available balance.`);

    await this.recordAudit(
      payout.id,
      payout.organizationId,
      adminUserId || 'SYSTEM',
      'PAYOUT_FAILED',
      prevStatus,
      PayoutStatus.FAILED,
      reason
    );

    await this.savePayoutRecord(payout);
    return payout;
  }

  /**
   * 5. Query Payout by ID with full audit log and reservation status
   */
  async getPayout(
    organizationId: string,
    payoutId: string
  ): Promise<{
    payout: OrganizerPayout;
    reservation?: PayoutReservation;
    auditLogs: PayoutAuditLog[];
  }> {
    const payout = await this.getPayoutRecord(payoutId);
    if (!payout || payout.organizationId !== organizationId) {
      throw new AppError('Payout record not found', 404, 'PAYOUT_NOT_FOUND');
    }

    const reservation = await this.getReservation(payoutId);
    const auditLogs = await this.listAuditLogs(payoutId);

    return {
      payout,
      reservation,
      auditLogs
    };
  }

  /**
   * 6. List Payouts for an Organization
   */
  async listPayouts(
    organizationId?: string,
    filter?: { status?: PayoutStatus }
  ): Promise<OrganizerPayout[]> {
    try {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM organizer_payouts';
        const params: unknown[] = [];

        if (organizationId) {
          query += ' WHERE organization_id = $1';
          params.push(organizationId);
        }
        if (filter?.status) {
          query += params.length ? ' AND status = $2' : ' WHERE status = $1';
          params.push(filter.status);
        }

        query += ' ORDER BY created_at DESC';
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbPayout(r));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(PayoutsService.localPayouts.values());
      if (organizationId) {
        list = list.filter((p) => p.organizationId === organizationId);
      }
      if (filter?.status) {
        list = list.filter((p) => p.status === filter.status);
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  /**
   * 7. Save Destination Payout Account
   */
  async savePayoutAccount(
    organizationId: string,
    req: {
      method: PayoutMethod;
      accountName: string;
      accountIdentifier: string;
      bankName?: string;
      swiftCode?: string;
      isDefault?: boolean;
    }
  ): Promise<OrganizationPayoutAccount> {
    const id = `pac-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();

    let identifier = req.accountIdentifier.trim();
    if (req.method === PayoutMethod.MPESA_B2C) {
      identifier = mpesaClient.normalizePhoneNumber(identifier);
    }

    const acc: OrganizationPayoutAccount = {
      id,
      organizationId,
      method: req.method,
      accountName: req.accountName.trim(),
      accountIdentifier: identifier,
      bankName: req.bankName?.trim(),
      swiftCode: req.swiftCode?.trim(),
      isDefault: req.isDefault || false,
      isVerified: true,
      createdAt: now,
      updatedAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        await client.query(
          `INSERT INTO organization_payout_accounts (
            id, organization_id, method, account_name, account_identifier,
            bank_name, swift_code, is_default, is_verified, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            acc.id,
            acc.organizationId,
            acc.method,
            acc.accountName,
            acc.accountIdentifier,
            acc.bankName,
            acc.swiftCode,
            acc.isDefault,
            acc.isVerified,
            now,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = PayoutsService.localAccounts.get(organizationId) || [];
      list.push(acc);
      PayoutsService.localAccounts.set(organizationId, list);
    }

    return acc;
  }

  /**
   * List saved payout destination accounts
   */
  async listPayoutAccounts(organizationId: string): Promise<OrganizationPayoutAccount[]> {
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        const res = await client.query(
          `SELECT * FROM organization_payout_accounts WHERE organization_id = $1 ORDER BY is_default DESC, created_at DESC`,
          [organizationId]
        );
        return res.rows.map((r) => ({
          id: r.id as string,
          organizationId: r.organization_id as string,
          method: r.method as PayoutMethod,
          accountName: r.account_name as string,
          accountIdentifier: r.account_identifier as string,
          bankName: (r.bank_name as string) || undefined,
          swiftCode: (r.swift_code as string) || undefined,
          isDefault: Boolean(r.is_default),
          isVerified: Boolean(r.is_verified),
          createdAt: (r.created_at as Date).toISOString ? (r.created_at as Date).toISOString() : (r.created_at as string),
          updatedAt: (r.updated_at as Date).toISOString ? (r.updated_at as Date).toISOString() : (r.updated_at as string)
        }));
      } finally {
        client.release();
      }
    } catch {
      return PayoutsService.localAccounts.get(organizationId) || [];
    }
  }

  // --- Internal Helpers ---

  private async releaseReservation(payout: OrganizerPayout, reason: string): Promise<void> {
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      payout.organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      payout.currency
    );

    // Balanced reverse: Move funds from reserved back to available
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId: payout.organizationId,
      referenceType: 'PAYOUT_RELEASE',
      referenceId: payout.id,
      description: reason,
      entries: [
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.DEBIT,
          amountCents: payout.amountCents,
          description: `Debit reserved balance to release hold`,
          affectsReserved: true
        },
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.CREDIT,
          amountCents: payout.amountCents,
          description: `Credit back available balance after payout cancellation/rejection`
        }
      ]
    });

    const now = new Date().toISOString();
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE payout_reservations SET status = 'RELEASED', released_at = $1 WHERE payout_id = $2`,
          [now, payout.id]
        );
      } finally {
        client.release();
      }
    } catch {
      const res = PayoutsService.localReservations.get(payout.id);
      if (res) {
        res.status = 'RELEASED';
        res.releasedAt = now;
      }
    }
  }

  private async markReservationSettled(payoutId: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE payout_reservations SET status = 'SETTLED', settled_at = $1 WHERE payout_id = $2`,
          [now, payoutId]
        );
      } finally {
        client.release();
      }
    } catch {
      const res = PayoutsService.localReservations.get(payoutId);
      if (res) {
        res.status = 'SETTLED';
        res.settledAt = now;
      }
    }
  }

  private async recordAudit(
    payoutId: string,
    organizationId: string,
    performedBy: string,
    action: string,
    fromStatus: PayoutStatus | undefined,
    toStatus: PayoutStatus,
    notes?: string
  ): Promise<void> {
    const id = `aud-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const log: PayoutAuditLog = {
      id,
      payoutId,
      organizationId,
      performedBy,
      action,
      fromStatus,
      toStatus,
      notes,
      createdAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO payout_audit_logs (
            id, payout_id, organization_id, performed_by, action, from_status, to_status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [log.id, log.payoutId, log.organizationId, log.performedBy, log.action, log.fromStatus, log.toStatus, log.notes, now]
        );
      } finally {
        client.release();
      }
    } catch {
      PayoutsService.localAuditLogs.unshift(log);
    }
  }

  private async getPayoutRecord(payoutId: string): Promise<OrganizerPayout | null> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(`SELECT * FROM organizer_payouts WHERE id = $1`, [payoutId]);
        if (res.rows.length > 0) return this.mapDbPayout(res.rows[0]);
        return null;
      } finally {
        client.release();
      }
    } catch {
      return PayoutsService.localPayouts.get(payoutId) || null;
    }
  }

  private async savePayoutRecord(payout: OrganizerPayout): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE organizer_payouts
           SET status = $1, reviewed_by = $2, reviewed_at = $3,
               settlement_evidence = $4, settled_at = $5,
               rejection_reason = $6, ledger_entry_group_id = $7, updated_at = $8
           WHERE id = $9`,
          [
            payout.status,
            payout.reviewedBy,
            payout.reviewedAt,
            payout.settlementEvidence,
            payout.settledAt,
            payout.rejectionReason,
            payout.ledgerEntryGroupId,
            payout.updatedAt,
            payout.id
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      PayoutsService.localPayouts.set(payout.id, payout);
    }
  }

  private async getReservation(payoutId: string): Promise<PayoutReservation | undefined> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(`SELECT * FROM payout_reservations WHERE payout_id = $1`, [payoutId]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id as string,
            payoutId: r.payout_id as string,
            accountId: r.account_id as string,
            organizationId: r.organization_id as string,
            amountCents: Number(r.amount_cents),
            status: r.status as 'ACTIVE' | 'RELEASED' | 'SETTLED',
            reservedAt: (r.reserved_at as Date).toISOString ? (r.reserved_at as Date).toISOString() : (r.reserved_at as string),
            releasedAt: r.released_at ? (r.released_at as Date).toISOString() : undefined,
            settledAt: r.settled_at ? (r.settled_at as Date).toISOString() : undefined
          };
        }
        return undefined;
      } finally {
        client.release();
      }
    } catch {
      return PayoutsService.localReservations.get(payoutId);
    }
  }

  private async listAuditLogs(payoutId: string): Promise<PayoutAuditLog[]> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM payout_audit_logs WHERE payout_id = $1 ORDER BY created_at DESC`,
          [payoutId]
        );
        return res.rows.map((r) => ({
          id: r.id as string,
          payoutId: r.payout_id as string,
          organizationId: r.organization_id as string,
          performedBy: r.performed_by as string,
          action: r.action as string,
          fromStatus: r.from_status as PayoutStatus | undefined,
          toStatus: r.to_status as PayoutStatus,
          notes: (r.notes as string) || undefined,
          createdAt: (r.created_at as Date).toISOString ? (r.created_at as Date).toISOString() : (r.created_at as string)
        }));
      } finally {
        client.release();
      }
    } catch {
      return PayoutsService.localAuditLogs.filter((l) => l.payoutId === payoutId);
    }
  }

  private mapDbPayout(row: Record<string, unknown>): OrganizerPayout {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      payoutAccountId: (row.payout_account_id as string) || undefined,
      amountCents: Number(row.amount_cents),
      feeCents: Number(row.fee_cents),
      netAmountCents: Number(row.net_amount_cents),
      currency: row.currency as string,
      method: row.method as PayoutMethod,
      destinationDetails: typeof row.destination_details === 'string'
        ? JSON.parse(row.destination_details as string)
        : (row.destination_details as Record<string, unknown>),
      status: row.status as PayoutStatus,
      requestedBy: row.requested_by as string,
      reviewedBy: (row.reviewed_by as string) || undefined,
      reviewedAt: row.reviewed_at ? (row.reviewed_at as Date).toISOString() : undefined,
      settlementEvidence: (row.settlement_evidence as string) || undefined,
      settledAt: row.settled_at ? (row.settled_at as Date).toISOString() : undefined,
      rejectionReason: (row.rejection_reason as string) || undefined,
      ledgerEntryGroupId: (row.ledger_entry_group_id as string) || undefined,
      createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string),
      updatedAt: (row.updated_at as Date).toISOString ? (row.updated_at as Date).toISOString() : (row.updated_at as string)
    };
  }
}

export const payoutsService = new PayoutsService();
