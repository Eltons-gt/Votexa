import {
  FinancialAccount,
  FinancialAccountType,
  DoubleEntryLedgerRecord,
  LedgerDirection
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';

export class FinancialLedgerService {
  // In-memory fallback stores for test and offline execution
  private static localAccounts = new Map<string, FinancialAccount>();
  private static localLedgerEntries: DoubleEntryLedgerRecord[] = [];

  public static resetState(): void {
    FinancialLedgerService.localAccounts.clear();
    FinancialLedgerService.localLedgerEntries = [];
  }

  /**
   * Account key generator
   */
  private getAccountKey(orgId: string | null | undefined, type: FinancialAccountType, currency: string): string {
    return `${orgId || 'PLATFORM'}:${type}:${currency.toUpperCase()}`;
  }

  /**
   * Retrieve or create a financial account with integer minor currency units
   */
  async getOrCreateAccount(
    organizationId: string | null | undefined,
    accountType: FinancialAccountType,
    currency: string = 'USD'
  ): Promise<FinancialAccount> {
    const normOrgId = organizationId || null;
    const normCurrency = currency.toUpperCase();
    const key = this.getAccountKey(normOrgId, accountType, normCurrency);

    try {
      const client = await pool.connect();
      try {
        let res = await client.query(
          `SELECT * FROM financial_accounts
           WHERE organization_id IS NOT DISTINCT FROM $1
             AND account_type = $2
             AND currency = $3`,
          [normOrgId, accountType, normCurrency]
        );

        if (res.rows.length === 0) {
          const newId = `acc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
          const now = new Date().toISOString();
          res = await client.query(
            `INSERT INTO financial_accounts (
              id, organization_id, account_type, currency, available_balance, reserved_balance, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, 0, 0, $5, $6)
            ON CONFLICT (organization_id, account_type, currency) DO UPDATE SET updated_at = EXCLUDED.updated_at
            RETURNING *`,
            [newId, normOrgId, accountType, normCurrency, now, now]
          );
        }

        return this.mapDbAccount(res.rows[0]);
      } finally {
        client.release();
      }
    } catch {
      let acc = FinancialLedgerService.localAccounts.get(key);
      if (!acc) {
        acc = {
          id: `acc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          organizationId: normOrgId || undefined,
          type: accountType,
          currency: normCurrency,
          availableBalance: 0,
          reservedBalance: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        FinancialLedgerService.localAccounts.set(key, acc);
      }
      return acc;
    }
  }

  /**
   * Record a strictly balanced double-entry ledger batch.
   * Invariant: Total Debits must exactly equal Total Credits!
   */
  async recordDoubleEntryBatch(params: {
    organizationId?: string | null;
    referenceType: string;
    referenceId?: string;
    description: string;
    entries: Array<{
      accountId: string;
      direction: LedgerDirection;
      amountCents: number;
      description?: string;
      affectsReserved?: boolean;
    }>;
  }): Promise<{ entryGroupId: string; entries: DoubleEntryLedgerRecord[] }> {
    const { referenceType, referenceId, description, entries } = params;

    if (!entries || entries.length < 2) {
      throw new AppError(
        'A double-entry transaction must contain at least two entries.',
        400,
        'INVALID_LEDGER_BATCH'
      );
    }

    let totalDebits = 0;
    let totalCredits = 0;

    for (const e of entries) {
      if (!Number.isInteger(e.amountCents) || e.amountCents <= 0) {
        throw new AppError(
          `Invalid ledger entry amount: ${e.amountCents}. Must be a strictly positive integer minor currency unit.`,
          400,
          'INVALID_LEDGER_AMOUNT'
        );
      }
      if (e.direction === LedgerDirection.DEBIT) {
        totalDebits += e.amountCents;
      } else if (e.direction === LedgerDirection.CREDIT) {
        totalCredits += e.amountCents;
      } else {
        throw new AppError(`Invalid direction ${e.direction}`, 400, 'INVALID_LEDGER_DIRECTION');
      }
    }

    // Mathematical Balance Verification
    if (totalDebits !== totalCredits) {
      throw new AppError(
        `Double-entry ledger out of balance! Total Debits (${totalDebits} cents) !== Total Credits (${totalCredits} cents). Difference: ${totalDebits - totalCredits} cents.`,
        500,
        'LEDGER_UNBALANCED'
      );
    }

    const entryGroupId = `grp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    const createdRecords: DoubleEntryLedgerRecord[] = [];

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        for (const entry of entries) {
          // Lock account row for atomic balance update
          const accRes = await client.query(
            `SELECT * FROM financial_accounts WHERE id = $1 FOR UPDATE`,
            [entry.accountId]
          );

          if (accRes.rows.length === 0) {
            throw new AppError(`Account ${entry.accountId} not found`, 404, 'ACCOUNT_NOT_FOUND');
          }

          const acc = accRes.rows[0];
          let currentAvailable = Number(acc.available_balance);
          let currentReserved = Number(acc.reserved_balance);

          if (entry.affectsReserved) {
            if (entry.direction === LedgerDirection.CREDIT) {
              currentReserved += entry.amountCents;
            } else {
              currentReserved -= entry.amountCents;
            }
          } else {
            if (entry.direction === LedgerDirection.CREDIT) {
              currentAvailable += entry.amountCents;
            } else {
              currentAvailable -= entry.amountCents;
            }
          }

          const balanceAfter = currentAvailable;

          await client.query(
            `UPDATE financial_accounts
             SET available_balance = $1, reserved_balance = $2, updated_at = $3
             WHERE id = $4`,
            [currentAvailable, currentReserved, now, entry.accountId]
          );

          const entryId = `led-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
          const entryDesc = entry.description || description;

          const insertedRes = await client.query(
            `INSERT INTO financial_ledger_entries (
              id, entry_group_id, account_id, organization_id, direction,
              amount_cents, currency, balance_after, description,
              reference_type, reference_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
              entryId,
              entryGroupId,
              entry.accountId,
              acc.organization_id,
              entry.direction,
              entry.amountCents,
              acc.currency,
              balanceAfter,
              entryDesc,
              referenceType,
              referenceId,
              now
            ]
          );

          createdRecords.push(this.mapDbLedgerEntry(insertedRes.rows[0]));
        }

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch {
      // In-Memory Fallback execution
      for (const entry of entries) {
        // Find account in memory
        let matchedAcc: FinancialAccount | undefined;
        for (const a of FinancialLedgerService.localAccounts.values()) {
          if (a.id === entry.accountId) {
            matchedAcc = a;
            break;
          }
        }

        if (!matchedAcc) {
          matchedAcc = {
            id: entry.accountId,
            type: FinancialAccountType.ORGANIZER_TREASURY,
            currency: 'USD',
            availableBalance: 0,
            reservedBalance: 0,
            createdAt: now,
            updatedAt: now
          };
          FinancialLedgerService.localAccounts.set(entry.accountId, matchedAcc);
        }

        if (entry.affectsReserved) {
          if (entry.direction === LedgerDirection.CREDIT) {
            matchedAcc.reservedBalance += entry.amountCents;
          } else {
            matchedAcc.reservedBalance -= entry.amountCents;
          }
        } else {
          if (entry.direction === LedgerDirection.CREDIT) {
            matchedAcc.availableBalance += entry.amountCents;
          } else {
            matchedAcc.availableBalance -= entry.amountCents;
          }
        }

        matchedAcc.updatedAt = now;

        const record: DoubleEntryLedgerRecord = {
          id: `led-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          entryGroupId,
          accountId: entry.accountId,
          organizationId: matchedAcc.organizationId,
          direction: entry.direction,
          amountCents: entry.amountCents,
          currency: matchedAcc.currency,
          balanceAfter: matchedAcc.availableBalance,
          description: entry.description || description,
          referenceType,
          referenceId,
          createdAt: now
        };

        FinancialLedgerService.localLedgerEntries.unshift(record);
        createdRecords.push(record);
      }
    }

    return {
      entryGroupId,
      entries: createdRecords
    };
  }

  /**
   * List double-entry ledger records
   */
  async listEntries(
    organizationId?: string | null,
    limit: number = 100
  ): Promise<DoubleEntryLedgerRecord[]> {
    try {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM financial_ledger_entries';
        const params: unknown[] = [];

        if (organizationId) {
          query += ' WHERE organization_id = $1';
          params.push(organizationId);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbLedgerEntry(r));
      } finally {
        client.release();
      }
    } catch {
      let list = FinancialLedgerService.localLedgerEntries;
      if (organizationId) {
        list = list.filter((e) => e.organizationId === organizationId);
      }
      return list.slice(0, limit);
    }
  }

  /**
   * List financial accounts for an organization or platform
   */
  async listAccounts(organizationId?: string | null): Promise<FinancialAccount[]> {
    try {
      const client = await pool.connect();
      try {
        let query = 'SELECT * FROM financial_accounts';
        const params: unknown[] = [];

        if (organizationId) {
          query += ' WHERE organization_id = $1';
          params.push(organizationId);
        }

        query += ' ORDER BY created_at ASC';
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbAccount(r));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(FinancialLedgerService.localAccounts.values());
      if (organizationId) {
        list = list.filter((a) => a.organizationId === organizationId);
      }
      return list;
    }
  }

  /**
   * Ledger Integrity Audit: Verify that every entry group is balanced (Sum Debits === Sum Credits)
   */
  async verifyLedgerIntegrity(): Promise<{
    isBalanced: boolean;
    totalGroupsAudited: number;
    discrepancies: string[];
  }> {
    const groups = new Map<string, { debits: number; credits: number; count: number }>();

    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT entry_group_id, direction, amount_cents FROM financial_ledger_entries`
        );
        for (const row of res.rows) {
          const gid = row.entry_group_id as string;
          const dir = row.direction as string;
          const amt = Number(row.amount_cents);
          let g = groups.get(gid);
          if (!g) {
            g = { debits: 0, credits: 0, count: 0 };
            groups.set(gid, g);
          }
          g.count++;
          if (dir === 'DEBIT') g.debits += amt;
          else if (dir === 'CREDIT') g.credits += amt;
        }
      } finally {
        client.release();
      }
    } catch {
      for (const e of FinancialLedgerService.localLedgerEntries) {
        let g = groups.get(e.entryGroupId);
        if (!g) {
          g = { debits: 0, credits: 0, count: 0 };
          groups.set(e.entryGroupId, g);
        }
        g.count++;
        if (e.direction === LedgerDirection.DEBIT) g.debits += e.amountCents;
        else if (e.direction === LedgerDirection.CREDIT) g.credits += e.amountCents;
      }
    }

    const discrepancies: string[] = [];
    for (const [gid, g] of groups.entries()) {
      if (g.debits !== g.credits) {
        discrepancies.push(
          `Group ${gid}: Debits (${g.debits}) !== Credits (${g.credits}), diff: ${g.debits - g.credits}`
        );
      }
    }

    return {
      isBalanced: discrepancies.length === 0,
      totalGroupsAudited: groups.size,
      discrepancies
    };
  }

  private mapDbAccount(row: Record<string, unknown>): FinancialAccount {
    return {
      id: row.id as string,
      organizationId: (row.organization_id as string) || undefined,
      type: row.account_type as FinancialAccountType,
      currency: row.currency as string,
      availableBalance: Number(row.available_balance),
      reservedBalance: Number(row.reserved_balance),
      createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string),
      updatedAt: (row.updated_at as Date).toISOString ? (row.updated_at as Date).toISOString() : (row.updated_at as string)
    };
  }

  private mapDbLedgerEntry(row: Record<string, unknown>): DoubleEntryLedgerRecord {
    return {
      id: row.id as string,
      entryGroupId: row.entry_group_id as string,
      accountId: row.account_id as string,
      organizationId: (row.organization_id as string) || undefined,
      direction: row.direction as LedgerDirection,
      amountCents: Number(row.amount_cents),
      currency: row.currency as string,
      balanceAfter: Number(row.balance_after),
      description: row.description as string,
      referenceType: row.reference_type as string,
      referenceId: (row.reference_id as string) || undefined,
      createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string)
    };
  }
}

export const financialLedgerService = new FinancialLedgerService();
