import {
  VoteAuthorization,
  ElectionCategory,
  ElectionStatus,
  RequestVoteAuthorizationRequest,
  RequestVoteAuthorizationResponse
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { electionsService } from '../elections/elections.service.js';
import { positionsService } from '../elections/positions.service.js';
import { votersService } from '../voters/voters.service.js';
import { voterWalletService } from './voter-wallet.service.js';
import { VotingCrypto } from './voting.crypto.js';

export class VoteAuthorizationService {
  private static localAuthorizations = new Map<string, VoteAuthorization>(); // Keyed by token_hash
  private static localPositionVotes = new Set<string>(); // `${electionId}:${positionId}:${voterHash}` for institutional duplicate tracking

  /**
   * Request a one-time voting authorization token.
   * Decouples voter identity from subsequent ballot submission to preserve secret ballot confidentiality.
   */
  async requestAuthorization(
    organizationId: string,
    req: RequestVoteAuthorizationRequest
  ): Promise<RequestVoteAuthorizationResponse> {
    const { electionId, voterCode, positionId, creditsRequested = 1 } = req;

    if (!electionId || !voterCode) {
      throw new AppError('Election ID and voter code are required', 400, 'INVALID_PAYLOAD');
    }

    if (!positionId) {
      throw new AppError('Position ID is required for vote authorization', 400, 'POSITION_REQUIRED');
    }

    const election = await electionsService.getElectionById(organizationId, electionId);

    // 1. Validate Election is ACTIVE
    if (election.status !== ElectionStatus.ACTIVE) {
      throw new AppError(
        `Election is not currently active for voting (Status: ${election.status})`,
        403,
        'ELECTION_NOT_ACTIVE'
      );
    }

    // 2. Validate Position belongs to Election
    const positions = await positionsService.listPositions(organizationId, electionId);
    const position = positions.find((p) => p.id === positionId);
    if (!position) {
      throw new AppError('Position does not belong to this election', 400, 'INVALID_POSITION');
    }

    const normalizedCode = voterCode.trim().toUpperCase();
    const voterHash = VotingCrypto.computeVoterHash(normalizedCode, electionId);
    const positionVoteKey = `${electionId}:${positionId}:${voterHash}`;

    // 3. Category-Specific Validation
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      // Validate voter eligibility on official roll
      const eligibility = await votersService.verifyVoterEligibility(organizationId, electionId, {
        voterCode: normalizedCode
      });

      if (!eligibility.isEligible) {
        throw new AppError(eligibility.reason || 'Voter is not eligible to vote', 403, 'INELIGIBLE_VOTER');
      }

      // Check for Institutional Duplicate Voting on this specific position
      if (VoteAuthorizationService.localPositionVotes.has(positionVoteKey)) {
        throw new AppError(
          'Institutional rule violation: Voter has already cast a ballot for this position',
          409,
          'ALREADY_VOTED'
        );
      }

      try {
        const client = await pool.connect();
        try {
          await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
          const checkRes = await client.query(
            `SELECT id FROM vote_authorizations 
             WHERE election_id = $1 AND position_id = $2 AND voter_hash = $3 AND is_used = TRUE`,
            [electionId, positionId, voterHash]
          );
          if (checkRes.rows.length > 0) {
            throw new AppError(
              'Institutional rule violation: Voter has already cast a ballot for this position',
              409,
              'ALREADY_VOTED'
            );
          }
        } finally {
          client.release();
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
      }
    } else if (election.category === ElectionCategory.PAID_COMPETITION) {
      // Consume required credits atomically from voter's election wallet
      const txDesc = `Authorized ${creditsRequested} vote(s) for position: ${position.title}`;
      const authRef = `AUTH-REQ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      await voterWalletService.consumeCredits(
        organizationId,
        electionId,
        normalizedCode,
        creditsRequested,
        authRef,
        txDesc
      );
    }

    // 4. Issue One-Time Authorization Token (15 min expiry)
    const rawToken = `AUTH-${crypto.randomBytes(24).toString('hex').toUpperCase()}`;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const authId = `auth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    const now = new Date().toISOString();

    const authRecord: VoteAuthorization = {
      id: authId,
      electionId,
      organizationId,
      positionId,
      token: rawToken, // Returned to voter
      voterHash,
      category: election.category,
      creditsAllocated: election.category === ElectionCategory.PAID_COMPETITION ? creditsRequested : 1,
      isUsed: false,
      expiresAt,
      createdAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        await client.query(
          `INSERT INTO vote_authorizations (
            id, organization_id, election_id, position_id, token_hash, voter_hash,
            category, credits_allocated, is_used, expires_at, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            authRecord.id,
            authRecord.organizationId,
            authRecord.electionId,
            authRecord.positionId,
            tokenHash,
            authRecord.voterHash,
            authRecord.category,
            authRecord.creditsAllocated,
            authRecord.isUsed,
            authRecord.expiresAt,
            authRecord.createdAt
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      VoteAuthorizationService.localAuthorizations.set(tokenHash, authRecord);
    }

    return {
      authorized: true,
      authorizationToken: rawToken,
      expiresAt,
      category: election.category,
      positionId,
      creditsAllocated: authRecord.creditsAllocated,
      voterHash
    };
  }

  /**
   * Consume and validate a one-time authorization token upon ballot submission.
   */
  async consumeAuthorization(
    electionId: string,
    rawToken: string,
    positionId: string
  ): Promise<VoteAuthorization> {
    if (!rawToken || !rawToken.trim()) {
      throw new AppError('Vote authorization token is required', 400, 'TOKEN_REQUIRED');
    }

    const cleanToken = rawToken.trim();
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');
    const now = new Date();

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const authRes = await client.query(
          `SELECT * FROM vote_authorizations WHERE token_hash = $1 FOR UPDATE`,
          [tokenHash]
        );

        if (authRes.rows.length === 0) {
          throw new AppError('Invalid or unrecognised vote authorization token', 401, 'INVALID_AUTHORIZATION');
        }

        const row = authRes.rows[0];
        if (row.election_id !== electionId) {
          throw new AppError('Authorization token does not match target election', 403, 'CROSS_ELECTION_TOKEN_FORBIDDEN');
        }

        if (row.position_id !== positionId) {
          throw new AppError('Authorization token does not match target position', 400, 'INVALID_POSITION_SCOPE');
        }

        if (row.is_used) {
          throw new AppError('This one-time authorization token has already been used', 409, 'AUTHORIZATION_ALREADY_USED');
        }

        if (new Date(row.expires_at) < now) {
          throw new AppError('Vote authorization token has expired', 400, 'AUTHORIZATION_EXPIRED');
        }

        // Mark as used atomically
        await client.query(
          `UPDATE vote_authorizations SET is_used = TRUE, used_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [row.id]
        );

        await client.query('COMMIT');

        return {
          id: row.id,
          electionId: row.election_id,
          organizationId: row.organization_id,
          positionId: row.position_id,
          token: cleanToken,
          voterHash: row.voter_hash,
          category: row.category as ElectionCategory,
          creditsAllocated: Number(row.credits_allocated),
          isUsed: true,
          usedAt: now.toISOString(),
          expiresAt: (row.expires_at as Date).toISOString ? (row.expires_at as Date).toISOString() : (row.expires_at as string),
          createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string)
        };
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AppError) throw err;

      // In-memory fallback
      const record = VoteAuthorizationService.localAuthorizations.get(tokenHash);
      if (!record) {
        throw new AppError('Invalid or unrecognised vote authorization token', 401, 'INVALID_AUTHORIZATION');
      }

      if (record.electionId !== electionId) {
        throw new AppError('Authorization token does not match target election', 403, 'CROSS_ELECTION_TOKEN_FORBIDDEN');
      }

      if (record.positionId !== positionId) {
        throw new AppError('Authorization token does not match target position', 400, 'INVALID_POSITION_SCOPE');
      }

      if (record.isUsed) {
        throw new AppError('This one-time authorization token has already been used', 409, 'AUTHORIZATION_ALREADY_USED');
      }

      if (new Date(record.expiresAt) < now) {
        throw new AppError('Vote authorization token has expired', 400, 'AUTHORIZATION_EXPIRED');
      }

      record.isUsed = true;
      record.usedAt = now.toISOString();

      // Track institutional vote for duplicate prevention
      if (record.category === ElectionCategory.INSTITUTIONAL) {
        VoteAuthorizationService.localPositionVotes.add(`${electionId}:${positionId}:${record.voterHash}`);
      }

      return record;
    }
  }
}

export const voteAuthorizationService = new VoteAuthorizationService();

