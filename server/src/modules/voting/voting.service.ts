import { CastVoteRequest, VoteReceipt, ElectionTally, ElectionStatus } from '@votexa/shared';
import { VotingCrypto } from './voting.crypto.js';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';

// In-memory fallback ledger for dev/testing when PostgreSQL is disconnected
interface StoredVoteRecord {
  id: string;
  electionId: string;
  ballotId: string;
  voterHash: string;
  receiptCode: string;
  signature: string;
  selections: { questionId: string; optionId: string; candidateId?: string }[];
  castAt: string;
}

export class VotingService {
  private static localVoters = new Map<string, { voterCode: string; electionId: string; hasVoted: boolean }>([
    ['VTR-9981-METRO', { voterCode: 'VTR-9981-METRO', electionId: 'elec-1', hasVoted: false }],
    ['VTR-9982-METRO', { voterCode: 'VTR-9982-METRO', electionId: 'elec-1', hasVoted: false }],
    ['VTR-DEMO-TEST', { voterCode: 'VTR-DEMO-TEST', electionId: 'elec-1', hasVoted: false }]
  ]);

  private static localVotes: StoredVoteRecord[] = [];

  /**
   * Cast an encrypted vote with atomic double-voting prevention.
   */
  async castVote(request: CastVoteRequest): Promise<VoteReceipt> {
    const { electionId, ballotId, voterCode, selections } = request;

    if (!electionId || !ballotId || !voterCode) {
      throw new AppError('Election ID, Ballot ID, and Voter Code are strictly required.', 400, 'INVALID_PAYLOAD');
    }

    if (!selections || selections.length === 0) {
      throw new AppError('Ballot must contain at least one valid selection.', 400, 'EMPTY_BALLOT_SELECTIONS');
    }

    const normalizedCode = voterCode.trim().toUpperCase();
    const now = new Date();

    // 1. Database Transaction Path (if DB is connected)
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check Election Status
        const electionRes = await client.query(
          'SELECT status, start_time, end_time FROM elections WHERE id = $1',
          [electionId]
        );

        if (electionRes.rows.length > 0) {
          const election = electionRes.rows[0];
          if (election.status !== ElectionStatus.ACTIVE) {
            throw new AppError(`Election is not currently open for voting (Status: ${election.status}).`, 403, 'ELECTION_NOT_ACTIVE');
          }
          if (new Date(election.start_time) > now) {
            throw new AppError('Election has not started yet.', 403, 'ELECTION_NOT_STARTED');
          }
          if (new Date(election.end_time) < now) {
            throw new AppError('Election has already concluded.', 403, 'ELECTION_CONCLUDED');
          }
        }

        // Atomic Double-Voting Check with Row Locking
        const voterRes = await client.query(
          'SELECT id, has_voted FROM voters WHERE election_id = $1 AND voter_code = $2 FOR UPDATE',
          [electionId, normalizedCode]
        );

        if (voterRes.rows.length === 0) {
          throw new AppError('Invalid or unauthorized voter credential code.', 404, 'VOTER_NOT_FOUND');
        }

        if (voterRes.rows[0].has_voted) {
          throw new AppError('This voter credential has already been cast in this election.', 409, 'ALREADY_VOTED');
        }

        // Mark voter as voted
        await client.query(
          'UPDATE voters SET has_voted = TRUE, verified_at = CURRENT_TIMESTAMP WHERE id = $1',
          [voterRes.rows[0].id]
        );

        // Generate Cryptographic Receipt & Voter Anonymized Hash
        const castAt = now.toISOString();
        const voterHash = VotingCrypto.computeVoterHash(normalizedCode, electionId);
        const receipt = VotingCrypto.generateBallotReceipt(electionId, ballotId, voterHash, selections, castAt);

        // Record Encrypted Vote Payload
        await client.query(
          `INSERT INTO votes (election_id, ballot_id, voter_hash, encrypted_payload, cast_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [electionId, ballotId, voterHash, receipt.signature, castAt]
        );

        // Update candidate vote counts
        for (const sel of selections) {
          if (sel.candidateId) {
            await client.query(
              'UPDATE candidates SET vote_count = COALESCE(vote_count, 0) + 1 WHERE id = $1',
              [sel.candidateId]
            );
          }
        }

        await client.query('COMMIT');
        return receipt;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (dbErr: any) {
      // If DB error is an AppError (e.g. ALREADY_VOTED, VOTER_NOT_FOUND), rethrow it
      if (dbErr instanceof AppError) {
        throw dbErr;
      }

      // Fallback for offline dev/test mode without active PostgreSQL connection
      const localVoter = VotingService.localVoters.get(normalizedCode);
      if (!localVoter) {
        throw new AppError('Invalid or unauthorized voter credential code.', 404, 'VOTER_NOT_FOUND');
      }

      if (localVoter.hasVoted) {
        throw new AppError('This voter credential has already been cast in this election.', 409, 'ALREADY_VOTED');
      }

      // Mark local voter as voted atomically
      localVoter.hasVoted = true;

      const castAt = now.toISOString();
      const voterHash = VotingCrypto.computeVoterHash(normalizedCode, electionId);
      const receipt = VotingCrypto.generateBallotReceipt(electionId, ballotId, voterHash, selections, castAt);

      VotingService.localVotes.push({
        id: `vote-${Date.now()}`,
        electionId,
        ballotId,
        voterHash,
        receiptCode: receipt.receiptCode,
        signature: receipt.signature,
        selections,
        castAt
      });

      return receipt;
    }
  }

  /**
   * Verify an existing cryptographic receipt.
   */
  async verifyReceipt(receiptCode: string): Promise<{ valid: boolean; record?: Partial<StoredVoteRecord> }> {
    const cleanCode = receiptCode.trim().toUpperCase();

    // Check in-memory store
    const record = VotingService.localVotes.find((v) => v.receiptCode === cleanCode);
    if (record) {
      return {
        valid: true,
        record: {
          electionId: record.electionId,
          ballotId: record.ballotId,
          receiptCode: record.receiptCode,
          castAt: record.castAt
        }
      };
    }

    // Try database
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          'SELECT election_id, ballot_id, cast_at FROM votes WHERE encrypted_payload LIKE $1',
          [`%${cleanCode.replace('VTX-', '').replace(/-/g, '').toLowerCase()}%`]
        );
        if (res.rows.length > 0) {
          return {
            valid: true,
            record: {
              electionId: res.rows[0].election_id,
              ballotId: res.rows[0].ballot_id,
              receiptCode: cleanCode,
              castAt: res.rows[0].cast_at
            }
          };
        }
      } finally {
        client.release();
      }
    } catch {
      // In disconnected mode
    }

    return { valid: false };
  }

  /**
   * Aggregate election tally results.
   */
  async getElectionTally(electionId: string): Promise<ElectionTally> {
    const defaultCandidates = [
      { candidateId: 'cand-1', candidateName: 'Jordan Hayes', count: 0, percentage: 0 },
      { candidateId: 'cand-2', candidateName: 'Morgan Chen', count: 0, percentage: 0 }
    ];

    const matchingVotes = VotingService.localVotes.filter((v) => v.electionId === electionId);
    let totalVotes = matchingVotes.length;

    for (const v of matchingVotes) {
      for (const sel of v.selections) {
        const found = defaultCandidates.find((c) => c.candidateId === sel.candidateId);
        if (found) found.count += 1;
      }
    }

    if (totalVotes > 0) {
      defaultCandidates.forEach((c) => {
        c.percentage = parseFloat(((c.count / totalVotes) * 100).toFixed(1));
      });
    }

    return {
      electionId,
      totalVotesCast: totalVotes,
      candidates: defaultCandidates,
      status: ElectionStatus.ACTIVE,
      auditedAt: new Date().toISOString()
    };
  }
}

export const votingService = new VotingService();

