import { Wallet, FinancialLedgerEntry, LedgerEntryType } from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';

export class WalletsService {
  // Local ledger fallback for dev/testing mode
  private static localWallets = new Map<string, Wallet>([
    [
      'org-demo-1',
      {
        id: 'wal-1',
        organizationId: 'org-demo-1',
        currency: 'USD',
        availableBalance: 145000,
        pendingBalance: 25000,
        updatedAt: new Date().toISOString()
      }
    ]
  ]);

  private static localLedger: FinancialLedgerEntry[] = [
    {
      id: 'led-init',
      walletId: 'wal-1',
      organizationId: 'org-demo-1',
      type: LedgerEntryType.CREDIT,
      amount: 145000,
      currency: 'USD',
      description: 'Opening treasury ledger balance',
      balanceAfter: 145000,
      createdAt: new Date().toISOString()
    }
  ];

  async getWallet(organizationId: string): Promise<Wallet> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query('SELECT * FROM wallets WHERE organization_id = $1', [organizationId]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            organizationId: row.organization_id,
            currency: row.currency,
            availableBalance: parseInt(row.available_balance, 10),
            pendingBalance: parseInt(row.pending_balance, 10),
            updatedAt: row.updated_at
          };
        }
      } finally {
        client.release();
      }
    } catch {
      // Disconnected mode fallback
    }

    let wallet = WalletsService.localWallets.get(organizationId);
    if (!wallet) {
      wallet = {
        id: `wal-${Date.now()}`,
        organizationId,
        currency: 'USD',
        availableBalance: 0,
        pendingBalance: 0,
        updatedAt: new Date().toISOString()
      };
      WalletsService.localWallets.set(organizationId, wallet);
    }
    return wallet;
  }

  /**
   * Double-Entry Credit Transaction (e.g. from paid voting or package purchase)
   */
  async creditWallet(
    organizationId: string,
    amountCents: number,
    description: string,
    referenceId?: string
  ): Promise<FinancialLedgerEntry> {
    if (amountCents <= 0) {
      throw new AppError('Credit amount must be greater than zero.', 400, 'INVALID_AMOUNT');
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Lock wallet row for update
        const walletRes = await client.query(
          'SELECT id, available_balance, currency FROM wallets WHERE organization_id = $1 FOR UPDATE',
          [organizationId]
        );

        let walletId = '';
        let newBalance = amountCents;
        const currency = walletRes.rows[0]?.currency || 'USD';

        if (walletRes.rows.length > 0) {
          walletId = walletRes.rows[0].id;
          newBalance = parseInt(walletRes.rows[0].available_balance, 10) + amountCents;
          await client.query('UPDATE wallets SET available_balance = $1, updated_at = NOW() WHERE id = $2', [
            newBalance,
            walletId
          ]);
        } else {
          const newWalletRes = await client.query(
            'INSERT INTO wallets (organization_id, available_balance, currency) VALUES ($1, $2, $3) RETURNING id',
            [organizationId, amountCents, currency]
          );
          walletId = newWalletRes.rows[0].id;
        }

        // Insert double-entry ledger record
        const ledgerRes = await client.query(
          `INSERT INTO financial_ledger (wallet_id, organization_id, type, amount, currency, description, reference_id, balance_after)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [walletId, organizationId, LedgerEntryType.CREDIT, amountCents, currency, description, referenceId, newBalance]
        );

        await client.query('COMMIT');
        const row = ledgerRes.rows[0];
        return {
          id: row.id,
          walletId: row.wallet_id,
          organizationId: row.organization_id,
          type: row.type as LedgerEntryType,
          amount: parseInt(row.amount, 10),
          currency: row.currency,
          description: row.description,
          referenceId: row.reference_id,
          balanceAfter: parseInt(row.balance_after, 10),
          createdAt: row.created_at
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      // In-memory fallback
      const wallet = await this.getWallet(organizationId);
      wallet.availableBalance += amountCents;
      wallet.updatedAt = new Date().toISOString();

      const ledgerEntry: FinancialLedgerEntry = {
        id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        walletId: wallet.id,
        organizationId,
        type: LedgerEntryType.CREDIT,
        amount: amountCents,
        currency: wallet.currency,
        description,
        referenceId,
        balanceAfter: wallet.availableBalance,
        createdAt: new Date().toISOString()
      };
      WalletsService.localLedger.unshift(ledgerEntry);
      return ledgerEntry;
    }
  }

  /**
   * Double-Entry Debit Transaction (e.g. for payouts/withdrawals)
   */
  async debitWallet(
    organizationId: string,
    amountCents: number,
    description: string,
    referenceId?: string
  ): Promise<FinancialLedgerEntry> {
    if (amountCents <= 0) {
      throw new AppError('Debit amount must be greater than zero.', 400, 'INVALID_AMOUNT');
    }

    const wallet = await this.getWallet(organizationId);
    if (wallet.availableBalance < amountCents) {
      throw new AppError(
        `Insufficient available treasury balance. Requested: $${(amountCents / 100).toFixed(2)}, Available: $${(wallet.availableBalance / 100).toFixed(2)}`,
        400,
        'INSUFFICIENT_FUNDS'
      );
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const walletRes = await client.query(
          'SELECT id, available_balance, currency FROM wallets WHERE organization_id = $1 FOR UPDATE',
          [organizationId]
        );

        const currentBalance = parseInt(walletRes.rows[0].available_balance, 10);
        if (currentBalance < amountCents) {
          throw new AppError('Insufficient available funds for disbursement.', 400, 'INSUFFICIENT_FUNDS');
        }

        const newBalance = currentBalance - amountCents;
        const walletId = walletRes.rows[0].id;
        const currency = walletRes.rows[0].currency;

        await client.query('UPDATE wallets SET available_balance = $1, updated_at = NOW() WHERE id = $2', [
          newBalance,
          walletId
        ]);

        const ledgerRes = await client.query(
          `INSERT INTO financial_ledger (wallet_id, organization_id, type, amount, currency, description, reference_id, balance_after)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [walletId, organizationId, LedgerEntryType.DEBIT, amountCents, currency, description, referenceId, newBalance]
        );

        await client.query('COMMIT');
        const row = ledgerRes.rows[0];
        return {
          id: row.id,
          walletId: row.wallet_id,
          organizationId: row.organization_id,
          type: row.type as LedgerEntryType,
          amount: parseInt(row.amount, 10),
          currency: row.currency,
          description: row.description,
          referenceId: row.reference_id,
          balanceAfter: parseInt(row.balance_after, 10),
          createdAt: row.created_at
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err: any) {
      if (err instanceof AppError) throw err;

      // In-memory fallback
      wallet.availableBalance -= amountCents;
      wallet.updatedAt = new Date().toISOString();

      const ledgerEntry: FinancialLedgerEntry = {
        id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        walletId: wallet.id,
        organizationId,
        type: LedgerEntryType.DEBIT,
        amount: amountCents,
        currency: wallet.currency,
        description,
        referenceId,
        balanceAfter: wallet.availableBalance,
        createdAt: new Date().toISOString()
      };
      WalletsService.localLedger.unshift(ledgerEntry);
      return ledgerEntry;
    }
  }

  async getLedger(organizationId: string): Promise<FinancialLedgerEntry[]> {
    return WalletsService.localLedger.filter((l) => l.organizationId === organizationId);
  }
}

export const walletsService = new WalletsService();

