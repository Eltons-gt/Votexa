import {
  VoterWallet,
  WalletTransaction,
  WalletTransactionType
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { electionsService } from '../elections/elections.service.js';

export class VoterWalletService {
  // Keyed by `${electionId}:${voterCode}` for strict isolation
  private static localWallets = new Map<string, VoterWallet>();
  private static localTransactions = new Map<string, WalletTransaction[]>();

  constructor() {
    this.seedDefaultWallets();
  }

  private seedDefaultWallets() {
    if (VoterWalletService.localWallets.size > 0) return;

    // Seed wallet for Metropolitan Talent Showcase voter (elec-paid-1)
    const walletKey = 'elec-paid-1:VTR-FAN-501';
    const walletId = 'wlt-fan-501';
    VoterWalletService.localWallets.set(walletKey, {
      id: walletId,
      organizationId: 'org-metro-uni',
      electionId: 'elec-paid-1',
      voterCode: 'VTR-FAN-501',
      creditsBalance: 15,
      currency: 'USD',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    });

    VoterWalletService.localTransactions.set(walletId, [
      {
        id: 'tx-init-1',
        walletId,
        electionId: 'elec-paid-1',
        type: WalletTransactionType.PURCHASE,
        creditsAmount: 20,
        balanceAfter: 20,
        referenceId: 'MOCK-PAY-88910',
        description: 'Superfan 20-Pack Package Purchase',
        isMockPayment: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'tx-spend-1',
        walletId,
        electionId: 'elec-paid-1',
        type: WalletTransactionType.SPEND,
        creditsAmount: -5,
        balanceAfter: 15,
        referenceId: 'AUTH-VOTE-9921',
        description: 'Cast 5 votes for The Harmonix A Cappella',
        isMockPayment: false,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]);
  }

  /**
   * Retrieve or initialize an election-specific wallet for a voter.
   */
  async getOrCreateWallet(
    organizationId: string,
    electionId: string,
    voterCode: string
  ): Promise<VoterWallet> {
    await electionsService.getElectionById(organizationId, electionId);

    const normalizedCode = voterCode.trim().toUpperCase();
    const walletKey = `${electionId}:${normalizedCode}`;

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        
        let res = await client.query(
          `SELECT * FROM voter_wallets WHERE election_id = $1 AND voter_code = $2`,
          [electionId, normalizedCode]
        );

        if (res.rows.length === 0) {
          const newId = `wlt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const now = new Date().toISOString();
          res = await client.query(
            `INSERT INTO voter_wallets (
              id, organization_id, election_id, voter_code, credits_balance, currency, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, 0, 'USD', $5, $6)
            ON CONFLICT (election_id, voter_code) DO UPDATE SET updated_at = EXCLUDED.updated_at
            RETURNING *`,
            [newId, organizationId, electionId, normalizedCode, now, now]
          );
        }

        return this.mapDbWallet(res.rows[0]);
      } finally {
        client.release();
      }
    } catch {
      let wallet = VoterWalletService.localWallets.get(walletKey);
      if (!wallet) {
        wallet = {
          id: `wlt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          organizationId,
          electionId,
          voterCode: normalizedCode,
          creditsBalance: 0,
          currency: 'USD',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        VoterWalletService.localWallets.set(walletKey, wallet);
      }
      return wallet;
    }
  }

  /**
   * Fetch all transaction ledger entries for a wallet.
   */
  async getWalletTransactions(walletId: string, electionId: string): Promise<WalletTransaction[]> {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM wallet_transactions WHERE wallet_id = $1 AND election_id = $2 ORDER BY created_at DESC`,
          [walletId, electionId]
        );
        return res.rows.map((r) => ({
          id: r.id,
          walletId: r.wallet_id,
          electionId: r.election_id,
          type: r.type as WalletTransactionType,
          creditsAmount: r.credits_amount,
          balanceAfter: r.balance_after,
          referenceId: r.reference_id,
          description: r.description,
          isMockPayment: Boolean(r.is_mock_payment),
          createdAt: (r.created_at as Date).toISOString ? (r.created_at as Date).toISOString() : (r.created_at as string)
        }));
      } finally {
        client.release();
      }
    } catch {
      return VoterWalletService.localTransactions.get(walletId) || [];
    }
  }

  /**
   * Add credits to an election-specific wallet after verified payment.
   */
  async addCredits(
    organizationId: string,
    electionId: string,
    voterCode: string,
    credits: number,
    referenceId: string,
    description: string,
    isMock: boolean = false
  ): Promise<{ wallet: VoterWallet; transaction: WalletTransaction }> {
    if (credits <= 0) {
      throw new AppError('Credits added must be strictly positive', 400, 'INVALID_CREDIT_AMOUNT');
    }

    const wallet = await this.getOrCreateWallet(organizationId, electionId, voterCode);

    // Cross-Election Check: Verify wallet strictly matches electionId
    if (wallet.electionId !== electionId) {
      throw new AppError(
        'Credits are election-specific and cannot be added or transferred across elections',
        403,
        'CROSS_ELECTION_CREDIT_FORBIDDEN'
      );
    }

    const newBalance = wallet.creditsBalance + credits;
    const now = new Date().toISOString();
    const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const transaction: WalletTransaction = {
      id: txId,
      walletId: wallet.id,
      electionId,
      type: WalletTransactionType.PURCHASE,
      creditsAmount: credits,
      balanceAfter: newBalance,
      referenceId,
      description,
      isMockPayment: isMock,
      createdAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        await client.query('BEGIN');

        await client.query(
          `UPDATE voter_wallets SET credits_balance = credits_balance + $1, updated_at = $2 WHERE id = $3`,
          [credits, now, wallet.id]
        );

        await client.query(
          `INSERT INTO wallet_transactions (
            id, wallet_id, election_id, type, credits_amount, balance_after,
            reference_id, description, is_mock_payment, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            transaction.id,
            transaction.walletId,
            transaction.electionId,
            transaction.type,
            transaction.creditsAmount,
            transaction.balanceAfter,
            transaction.referenceId,
            transaction.description,
            transaction.isMockPayment,
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
      wallet.creditsBalance = newBalance;
      wallet.updatedAt = now;
      const history = VoterWalletService.localTransactions.get(wallet.id) || [];
      history.unshift(transaction);
      VoterWalletService.localTransactions.set(wallet.id, history);
    }

    return {
      wallet: { ...wallet, creditsBalance: newBalance, updatedAt: now },
      transaction
    };
  }

  /**
   * Consume credits from a voter's wallet with atomic locking and no negative balance guarantee.
   */
  async consumeCredits(
    organizationId: string,
    electionId: string,
    voterCode: string,
    credits: number,
    referenceId: string,
    description: string
  ): Promise<{ wallet: VoterWallet; transaction: WalletTransaction }> {
    if (credits <= 0) {
      throw new AppError('Credits consumed must be strictly positive', 400, 'INVALID_CREDIT_AMOUNT');
    }

    const wallet = await this.getOrCreateWallet(organizationId, electionId, voterCode);

    // Cross-Election Check
    if (wallet.electionId !== electionId) {
      throw new AppError(
        'Credits are election-specific and cannot be transferred across elections',
        403,
        'CROSS_ELECTION_CREDIT_FORBIDDEN'
      );
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        await client.query('BEGIN');

        // Atomic row lock on wallet
        const walletRes = await client.query(
          `SELECT credits_balance FROM voter_wallets WHERE id = $1 FOR UPDATE`,
          [wallet.id]
        );

        if (walletRes.rows.length === 0) {
          throw new AppError('Voter wallet not found', 404, 'WALLET_NOT_FOUND');
        }

        const currentBalance = Number(walletRes.rows[0].credits_balance);
        if (currentBalance < credits) {
          throw new AppError(
            `Insufficient voting credits in wallet. Required: ${credits}, Available: ${currentBalance}`,
            400,
            'INSUFFICIENT_CREDITS'
          );
        }

        const newBalance = currentBalance - credits;
        const now = new Date().toISOString();
        const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        await client.query(
          `UPDATE voter_wallets SET credits_balance = $1, updated_at = $2 WHERE id = $3`,
          [newBalance, now, wallet.id]
        );

        const tx: WalletTransaction = {
          id: txId,
          walletId: wallet.id,
          electionId,
          type: WalletTransactionType.SPEND,
          creditsAmount: -credits,
          balanceAfter: newBalance,
          referenceId,
          description,
          isMockPayment: false,
          createdAt: now
        };

        await client.query(
          `INSERT INTO wallet_transactions (
            id, wallet_id, election_id, type, credits_amount, balance_after,
            reference_id, description, is_mock_payment, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            tx.id,
            tx.walletId,
            tx.electionId,
            tx.type,
            tx.creditsAmount,
            tx.balanceAfter,
            tx.referenceId,
            tx.description,
            tx.isMockPayment,
            now
          ]
        );

        await client.query('COMMIT');
        return { wallet: { ...wallet, creditsBalance: newBalance, updatedAt: now }, transaction: tx };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AppError) throw err;

      // In-memory fallback
      if (wallet.creditsBalance < credits) {
        throw new AppError(
          `Insufficient voting credits in wallet. Required: ${credits}, Available: ${wallet.creditsBalance}`,
          400,
          'INSUFFICIENT_CREDITS'
        );
      }

      const newBalance = wallet.creditsBalance - credits;
      const now = new Date().toISOString();
      const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      wallet.creditsBalance = newBalance;
      wallet.updatedAt = now;

      const tx: WalletTransaction = {
        id: txId,
        walletId: wallet.id,
        electionId,
        type: WalletTransactionType.SPEND,
        creditsAmount: -credits,
        balanceAfter: newBalance,
        referenceId,
        description,
        isMockPayment: false,
        createdAt: now
      };

      const history = VoterWalletService.localTransactions.get(wallet.id) || [];
      history.unshift(tx);
      VoterWalletService.localTransactions.set(wallet.id, history);

      return { wallet, transaction: tx };
    }
  }

  private mapDbWallet(row: Record<string, unknown>): VoterWallet {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      electionId: row.election_id as string,
      voterCode: row.voter_code as string,
      creditsBalance: Number(row.credits_balance),
      currency: row.currency as string,
      createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string),
      updatedAt: (row.updated_at as Date).toISOString ? (row.updated_at as Date).toISOString() : (row.updated_at as string)
    };
  }
}

export const voterWalletService = new VoterWalletService();
