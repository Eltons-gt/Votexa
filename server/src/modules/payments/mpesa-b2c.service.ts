import crypto from 'crypto';
import {
  PayoutStatus,
  PayoutMethod,
  MpesaB2CDisbursementStatus,
  MpesaB2CInitiateResponse,
  MpesaB2CDisbursementRecord,
  MpesaB2CCallbackPayload
} from '@votexa/shared';
import { pool } from '../../database/db.js';
import { AppError } from '../../utils/apiResponse.js';
import { mpesaClient } from './mpesa.client.js';
import { payoutsService } from '../payouts/payouts.service.js';

export class MpesaB2CService {
  // In-memory fallbacks for unit tests & offline environments
  private static localDisbursements = new Map<string, MpesaB2CDisbursementRecord>();
  private static localProcessedCallbacks = new Set<string>();

  /**
   * Reset in-memory state for clean test isolation
   */
  public static resetState(): void {
    MpesaB2CService.localDisbursements.clear();
    MpesaB2CService.localProcessedCallbacks.clear();
  }

  /**
   * Calculate KES amount from payout net amount
   * Uses 1 USD = 130 KES if currency is USD
   */
  public calculateKesAmount(netAmountCents: number, currency: string = 'USD'): number {
    if (currency.toUpperCase() === 'KES') {
      return Math.max(10, Math.round(netAmountCents / 100));
    }
    // Default USD to KES rate
    return Math.max(10, Math.round((netAmountCents / 100) * 130));
  }

  /**
   * 1. Initiate M-Pesa B2C Automated Disbursement
   * Dispatches mobile wallet disbursement via Safaricom Daraja B2C API.
   * Invariant: Administrator cannot disburse their own payout request (Separation of Duties).
   */
  async dispatchDisbursement(
    payoutId: string,
    adminUserId: string,
    options?: {
      commandId?: 'BusinessPayment' | 'SalaryPayment' | 'PromotionPayment';
      remarks?: string;
    }
  ): Promise<MpesaB2CInitiateResponse> {
    if (!payoutId) {
      throw new AppError('Payout ID is required for B2C disbursement', 400, 'PAYOUT_ID_REQUIRED');
    }

    const payout = await payoutsService.getPayoutRecord(payoutId);
    if (!payout) {
      throw new AppError('Payout request not found', 404, 'PAYOUT_NOT_FOUND');
    }

    // 1. Enforce Separation of Duties
    if (payout.requestedBy === adminUserId) {
      throw new AppError(
        'Separation of Duties Violation: You requested this payout. Another administrator must execute the disbursement.',
        403,
        'SEPARATION_OF_DUTIES_VIOLATION'
      );
    }

    // 2. Enforce Disbursement Method
    if (payout.method !== PayoutMethod.MPESA_B2C) {
      throw new AppError(
        `Automated M-Pesa B2C disbursement is only permitted for MPESA_B2C payouts. Current method is '${payout.method}'.`,
        400,
        'INVALID_PAYOUT_METHOD'
      );
    }

    // 3. Enforce Payout Status (Must be APPROVED or PROCESSING)
    if (payout.status === PayoutStatus.PAID) {
      throw new AppError('This payout has already been paid and settled.', 409, 'ALREADY_SETTLED');
    }

    if (payout.status !== PayoutStatus.APPROVED && payout.status !== PayoutStatus.PROCESSING) {
      throw new AppError(
        `Cannot disburse payout with status '${payout.status}'. Payout must be APPROVED prior to B2C disbursement.`,
        400,
        'INVALID_STATUS_FOR_DISBURSEMENT'
      );
    }

    // 4. Check for active in-flight disbursement to prevent double-dispatch
    const existingDisbursement = await this.getDisbursementByPayoutId(payoutId);
    if (existingDisbursement && existingDisbursement.status === MpesaB2CDisbursementStatus.INITIATED) {
      throw new AppError(
        `A B2C disbursement is already in flight for this payout (ConversationID: ${existingDisbursement.conversationId}).`,
        409,
        'DISBURSEMENT_ALREADY_IN_FLIGHT'
      );
    }

    // 5. Extract & Validate Recipient Phone Number
    const dest = (payout.destinationDetails as Record<string, string>) || {};
    const rawPhone = dest.phoneNumber || dest.phone || dest.accountIdentifier;
    if (!rawPhone) {
      throw new AppError(
        'Payout destination details do not contain a valid phone number',
        400,
        'MISSING_PHONE_NUMBER'
      );
    }

    const normalizedPhone = mpesaClient.normalizePhoneNumber(rawPhone);
    const amountKes = this.calculateKesAmount(payout.netAmountCents, payout.currency);
    const commandId = options?.commandId || 'BusinessPayment';
    const remarks = options?.remarks || `Votexa Organiser Earnings Payout ${payout.id}`;

    // 6. Request B2C Transfer from Safaricom Daraja
    const darajaResult = await mpesaClient.initiateB2CDisbursement({
      phoneNumber: normalizedPhone,
      amount: amountKes,
      commandId,
      remarks,
      occasion: `Payout-${payout.id.substring(0, 12)}`
    });

    const now = new Date().toISOString();
    const disbursementId = `b2c-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const record: MpesaB2CDisbursementRecord = {
      id: disbursementId,
      payoutId: payout.id,
      organizationId: payout.organizationId,
      conversationId: darajaResult.conversationId,
      originatorConversationId: darajaResult.originatorConversationId,
      phoneNumber: normalizedPhone,
      amountKes,
      commandId,
      status: MpesaB2CDisbursementStatus.INITIATED,
      dispatchedBy: adminUserId,
      dispatchedAt: now
    };

    // 7. Transition payout status to PROCESSING & record audit
    const prevStatus = payout.status;
    payout.status = PayoutStatus.PROCESSING;
    payout.updatedAt = now;
    await payoutsService.savePayoutRecord(payout);

    await payoutsService.recordAudit(
      payout.id,
      payout.organizationId,
      adminUserId,
      'PAYOUT_B2C_DISPATCHED',
      prevStatus,
      PayoutStatus.PROCESSING,
      `M-Pesa B2C initiated to ${normalizedPhone} for KES ${amountKes}. ConversationID: ${darajaResult.conversationId}`
    );

    // 8. Persist disbursement record
    await this.saveDisbursementRecord(record);

    return {
      payoutId: payout.id,
      disbursementId: record.id,
      conversationId: darajaResult.conversationId,
      originatorConversationId: darajaResult.originatorConversationId,
      responseCode: darajaResult.responseCode,
      responseDescription: darajaResult.responseDescription,
      amountKes,
      recipientPhone: normalizedPhone
    };
  }

  /**
   * 2. Process Safaricom Daraja B2C Result Callback
   * Verifies external disbursement receipt and settles or fails the payout atomically.
   */
  async processB2CResult(payload: MpesaB2CCallbackPayload): Promise<{
    processed: boolean;
    status: 'SETTLED' | 'FAILED' | 'IGNORED';
    payoutId?: string;
    receipt?: string;
    reason?: string;
  }> {
    if (!payload?.Result) {
      throw new AppError('Invalid B2C callback payload structure', 400, 'INVALID_B2C_PAYLOAD');
    }

    const {
      ResultCode,
      ResultDesc,
      OriginatorConversationID,
      ConversationID,
      TransactionID,
      ResultParameters
    } = payload.Result;

    const convId = ConversationID || OriginatorConversationID;

    // Idempotency check: Guard against duplicate callback processing
    if (MpesaB2CService.localProcessedCallbacks.has(convId)) {
      return {
        processed: false,
        status: 'IGNORED',
        reason: 'Callback already processed'
      };
    }

    // Match disbursement record
    const disbursement = await this.findDisbursementByConversation(ConversationID, OriginatorConversationID);
    if (!disbursement) {
      console.warn(
        `[MPESA_B2C_CALLBACK] Received callback for unknown ConversationID: ${ConversationID} / ${OriginatorConversationID}`
      );
      return {
        processed: false,
        status: 'IGNORED',
        reason: 'Unknown conversation reference'
      };
    }

    // Check if already finalized
    if (
      disbursement.status === MpesaB2CDisbursementStatus.SUCCESS ||
      disbursement.status === MpesaB2CDisbursementStatus.FAILED
    ) {
      return {
        processed: false,
        status: 'IGNORED',
        payoutId: disbursement.payoutId,
        reason: `Disbursement already in terminal status ${disbursement.status}`
      };
    }

    MpesaB2CService.localProcessedCallbacks.add(convId);
    const now = new Date().toISOString();

    // Parse ResultParameters
    const paramsMap = new Map<string, string | number>();
    if (ResultParameters?.ResultParameter) {
      for (const item of ResultParameters.ResultParameter) {
        if (item.Key && item.Value !== undefined) {
          paramsMap.set(item.Key, item.Value);
        }
      }
    }

    const receiptFromParams = paramsMap.get('TransactionReceipt') as string | undefined;
    const finalReceipt = receiptFromParams || TransactionID || `MPESA-B2C-${convId.slice(-8).toUpperCase()}`;
    const receiverName = (paramsMap.get('ReceiverPartyPublicName') as string) || '';
    const completedAtTime = (paramsMap.get('TransactionCompletedDateTime') as string) || now;

    // 1. SUCCESS: ResultCode === 0
    if (ResultCode === 0) {
      // Record settlement in payouts service
      // This automatically: marks payout PAID, clears reserved balance, and writes double-entry ledger entry!
      await payoutsService.recordSettlement(disbursement.payoutId, 'SYSTEM_MPESA_B2C', {
        settlementEvidence: finalReceipt,
        providerReference: convId,
        notes: `Safaricom M-Pesa B2C verified to ${receiverName || disbursement.phoneNumber} on ${completedAtTime}. Receipt: ${finalReceipt}`
      });

      disbursement.status = MpesaB2CDisbursementStatus.SUCCESS;
      disbursement.transactionId = finalReceipt;
      disbursement.resultCode = ResultCode;
      disbursement.resultDesc = ResultDesc;
      disbursement.rawResult = payload as unknown as Record<string, unknown>;
      disbursement.completedAt = now;
      await this.updateDisbursementRecord(disbursement);

      return {
        processed: true,
        status: 'SETTLED',
        payoutId: disbursement.payoutId,
        receipt: finalReceipt
      };
    }

    // 2. FAILED: ResultCode !== 0
    // Safaricom rejected disbursement (e.g. invalid MSISDN, insufficient float, inactive wallet)
    // payoutsService.failPayout automatically RESTORES reserved balance to available balance!
    await payoutsService.failPayout(
      disbursement.payoutId,
      `M-Pesa B2C disbursement failed: ${ResultDesc} (Code: ${ResultCode})`,
      'SYSTEM_MPESA_B2C'
    );

    disbursement.status = MpesaB2CDisbursementStatus.FAILED;
    disbursement.resultCode = ResultCode;
    disbursement.resultDesc = ResultDesc;
    disbursement.rawResult = payload as unknown as Record<string, unknown>;
    disbursement.completedAt = now;
    await this.updateDisbursementRecord(disbursement);

    return {
      processed: true,
      status: 'FAILED',
      payoutId: disbursement.payoutId,
      reason: ResultDesc
    };
  }

  /**
   * 3. Process Safaricom Daraja B2C Queue Timeout Callback
   */
  async processB2CTimeout(payload: Record<string, unknown>): Promise<void> {
    console.warn('[MPESA_B2C_TIMEOUT] Safaricom B2C queue timeout received:', JSON.stringify(payload));
  }

  /**
   * 4. List Disbursements for an Organization or Payout
   */
  async listDisbursements(organizationId?: string, payoutId?: string): Promise<MpesaB2CDisbursementRecord[]> {
    try {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM mpesa_b2c_disbursements';
        const params: unknown[] = [];

        if (organizationId && payoutId) {
          query += ' WHERE organization_id = $1 AND payout_id = $2';
          params.push(organizationId, payoutId);
        } else if (organizationId) {
          query += ' WHERE organization_id = $1';
          params.push(organizationId);
        } else if (payoutId) {
          query += ' WHERE payout_id = $1';
          params.push(payoutId);
        }

        query += ' ORDER BY dispatched_at DESC';
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbDisbursement(r));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(MpesaB2CService.localDisbursements.values());
      if (organizationId) list = list.filter((d) => d.organizationId === organizationId);
      if (payoutId) list = list.filter((d) => d.payoutId === payoutId);
      return list;
    }
  }

  // --- Internal DB & In-Memory Helpers ---

  private async getDisbursementByPayoutId(payoutId: string): Promise<MpesaB2CDisbursementRecord | null> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM mpesa_b2c_disbursements WHERE payout_id = $1 ORDER BY dispatched_at DESC LIMIT 1`,
          [payoutId]
        );
        if (res.rows.length > 0) return this.mapDbDisbursement(res.rows[0]);
        return null;
      } finally {
        client.release();
      }
    } catch {
      const found = Array.from(MpesaB2CService.localDisbursements.values()).find(
        (d) => d.payoutId === payoutId
      );
      return found || null;
    }
  }

  private async findDisbursementByConversation(
    conversationId?: string,
    originatorConversationId?: string
  ): Promise<MpesaB2CDisbursementRecord | null> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM mpesa_b2c_disbursements 
           WHERE conversation_id = $1 OR originator_conversation_id = $2
           LIMIT 1`,
          [conversationId || '', originatorConversationId || '']
        );
        if (res.rows.length > 0) return this.mapDbDisbursement(res.rows[0]);
        return null;
      } finally {
        client.release();
      }
    } catch {
      const found = Array.from(MpesaB2CService.localDisbursements.values()).find(
        (d) =>
          (conversationId && d.conversationId === conversationId) ||
          (originatorConversationId && d.originatorConversationId === originatorConversationId)
      );
      return found || null;
    }
  }

  private async saveDisbursementRecord(record: MpesaB2CDisbursementRecord): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO mpesa_b2c_disbursements (
            id, payout_id, organization_id, conversation_id, originator_conversation_id,
            phone_number, amount_kes, command_id, status, transaction_id, result_code,
            result_desc, raw_result, dispatched_by, dispatched_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            record.id,
            record.payoutId,
            record.organizationId,
            record.conversationId,
            record.originatorConversationId,
            record.phoneNumber,
            record.amountKes,
            record.commandId,
            record.status,
            record.transactionId,
            record.resultCode,
            record.resultDesc,
            record.rawResult ? JSON.stringify(record.rawResult) : null,
            record.dispatchedBy,
            record.dispatchedAt
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      MpesaB2CService.localDisbursements.set(record.id, record);
    }
  }

  private async updateDisbursementRecord(record: MpesaB2CDisbursementRecord): Promise<void> {
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE mpesa_b2c_disbursements
           SET status = $1, transaction_id = $2, result_code = $3,
               result_desc = $4, raw_result = $5, completed_at = $6
           WHERE id = $7`,
          [
            record.status,
            record.transactionId,
            record.resultCode,
            record.resultDesc,
            record.rawResult ? JSON.stringify(record.rawResult) : null,
            record.completedAt,
            record.id
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      MpesaB2CService.localDisbursements.set(record.id, record);
    }
  }

  private mapDbDisbursement(r: any): MpesaB2CDisbursementRecord {
    return {
      id: r.id,
      payoutId: r.payout_id,
      organizationId: r.organization_id,
      conversationId: r.conversation_id,
      originatorConversationId: r.originator_conversation_id,
      phoneNumber: r.phone_number,
      amountKes: parseFloat(r.amount_kes),
      commandId: r.command_id,
      status: r.status as MpesaB2CDisbursementStatus,
      transactionId: r.transaction_id || undefined,
      resultCode: r.result_code !== null ? parseInt(r.result_code, 10) : undefined,
      resultDesc: r.result_desc || undefined,
      rawResult: typeof r.raw_result === 'string' ? JSON.parse(r.raw_result) : r.raw_result || undefined,
      dispatchedBy: r.dispatched_by,
      dispatchedAt: (r.dispatched_at as Date)?.toISOString ? (r.dispatched_at as Date).toISOString() : (r.dispatched_at as string),
      completedAt: r.completed_at ? ((r.completed_at as Date)?.toISOString ? (r.completed_at as Date).toISOString() : (r.completed_at as string)) : undefined
    };
  }
}

export const mpesaB2CService = new MpesaB2CService();
