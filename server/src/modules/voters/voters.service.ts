import {
  Voter,
  VoterEligibilityStatus,
  RegisterVoterRequest,
  BulkImportVotersRequest,
  BulkImportVotersResponse,
  VerifyVoterEligibilityRequest,
  VerifyVoterEligibilityResponse,
  ElectionInvitation,
  ElectionCategory,
  ElectionStatus
} from '@votexa/shared';
import crypto from 'crypto';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { electionsService } from '../elections/elections.service.js';

export class VotersService {
  private static localVoters = new Map<string, Voter[]>();
  private static localInvitations = new Map<string, ElectionInvitation[]>();

  constructor() {
    this.seedDefaultVoters();
  }

  private seedDefaultVoters() {
    if (VotersService.localVoters.size > 0) return;

    // Seed voters for Metropolitan University Institutional Election
    VotersService.localVoters.set('elec-inst-1', [
      {
        id: 'vtr-1',
        organizationId: 'org-metro-uni',
        electionId: 'elec-inst-1',
        voterCode: 'VTR-METRO-1011',
        email: 'alexander.vance@metro.edu',
        firstName: 'Alexander',
        lastName: 'Vance',
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: 'Faculty of Engineering - Senior',
        hasVoted: false,
        votesCastCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'vtr-2',
        organizationId: 'org-metro-uni',
        electionId: 'elec-inst-1',
        voterCode: 'VTR-METRO-1012',
        email: 'charlotte.sinclair@metro.edu',
        firstName: 'Charlotte',
        lastName: 'Sinclair',
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: 'School of Law - Year 3',
        hasVoted: false,
        votesCastCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'vtr-3',
        organizationId: 'org-metro-uni',
        electionId: 'elec-inst-1',
        voterCode: 'VTR-METRO-1013',
        email: 'devon.okafor@metro.edu',
        firstName: 'Devon',
        lastName: 'Okafor',
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: 'School of Business - Year 2',
        hasVoted: true,
        votesCastCount: 1,
        verifiedAt: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date().toISOString()
      }
    ]);

    // Seed voters for Paid Showcase
    VotersService.localVoters.set('elec-paid-1', [
      {
        id: 'vtr-paid-1',
        organizationId: 'org-metro-uni',
        electionId: 'elec-paid-1',
        voterCode: 'VTR-FAN-501',
        email: 'patron@artsfan.org',
        firstName: 'Elena',
        lastName: 'Gomez',
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: 'VIP Patron Ticket Holder',
        hasVoted: false,
        votesCastCount: 5,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  /**
   * List voters registered for an election.
   */
  async listVoters(
    organizationId: string,
    electionId: string,
    search?: string
  ): Promise<Voter[]> {
    await electionsService.getElectionById(organizationId, electionId);

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        let query = `
          SELECT * FROM voters
          WHERE election_id = $1 AND organization_id = $2
        `;
        const params: unknown[] = [electionId, organizationId];

        if (search && search.trim()) {
          params.push(`%${search.trim().toLowerCase()}%`);
          query += ` AND (LOWER(email) LIKE $${params.length} OR LOWER(voter_code) LIKE $${params.length} OR LOWER(first_name) LIKE $${params.length} OR LOWER(last_name) LIKE $${params.length})`;
        }

        query += ` ORDER BY created_at DESC`;
        const res = await client.query(query, params);

        return res.rows.map((r) => this.mapDbVoter(r));
      } finally {
        client.release();
      }
    } catch {
      let list = VotersService.localVoters.get(electionId) || [];
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (v) =>
            v.voterCode.toLowerCase().includes(q) ||
            (v.email && v.email.toLowerCase().includes(q)) ||
            (v.firstName && v.firstName.toLowerCase().includes(q)) ||
            (v.lastName && v.lastName.toLowerCase().includes(q))
        );
      }
      return list;
    }
  }

  /**
   * Register a single voter into an election.
   */
  async registerVoter(
    organizationId: string,
    electionId: string,
    req: RegisterVoterRequest
  ): Promise<Voter> {
    const election = await electionsService.getElectionById(organizationId, electionId);

    // If institutional, validate email domain if specified in settings
    if (election.category === ElectionCategory.INSTITUTIONAL && election.settings?.allowedDomains?.length) {
      if (!req.email) {
        throw new AppError('Email is required for institutional voter registration', 400, 'EMAIL_REQUIRED');
      }
      const domainMatches = election.settings.allowedDomains.some((d) =>
        req.email!.toLowerCase().endsWith(d.toLowerCase())
      );
      if (!domainMatches) {
        throw new AppError(
          `Voter email domain must match one of: ${election.settings.allowedDomains.join(', ')}`,
          400,
          'INVALID_INSTITUTIONAL_DOMAIN'
        );
      }
    }

    const voterCode = req.voterCode || this.generateVoterCode();
    const existing = await this.listVoters(organizationId, electionId);
    if (existing.some((v) => v.voterCode === voterCode || (req.email && v.email === req.email))) {
      throw new AppError('A voter with this code or email is already registered', 409, 'DUPLICATE_VOTER');
    }

    const voterId = `vtr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newVoter: Voter = {
      id: voterId,
      organizationId,
      electionId,
      voterCode,
      email: req.email?.trim().toLowerCase(),
      phone: req.phone?.trim(),
      firstName: req.firstName?.trim(),
      lastName: req.lastName?.trim(),
      eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
      eligibilityTag: req.eligibilityTag || 'Standard Roster',
      hasVoted: false,
      votesCastCount: 0,
      createdAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        await client.query(
          `INSERT INTO voters (
            id, organization_id, election_id, voter_code, email, phone,
            first_name, last_name, eligibility_status, eligibility_tag,
            has_voted, votes_cast_count, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            newVoter.id,
            newVoter.organizationId,
            newVoter.electionId,
            newVoter.voterCode,
            newVoter.email,
            newVoter.phone,
            newVoter.firstName,
            newVoter.lastName,
            newVoter.eligibilityStatus,
            newVoter.eligibilityTag,
            newVoter.hasVoted,
            newVoter.votesCastCount,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = VotersService.localVoters.get(electionId) || [];
      list.push(newVoter);
      VotersService.localVoters.set(electionId, list);
    }

    return newVoter;
  }

  /**
   * Bulk import voters from CSV data.
   */
  async bulkImportVoters(
    organizationId: string,
    electionId: string,
    req: BulkImportVotersRequest
  ): Promise<BulkImportVotersResponse> {
    await electionsService.getElectionById(organizationId, electionId);

    const existingVoters = await this.listVoters(organizationId, electionId);
    const existingEmails = new Set(existingVoters.map((v) => v.email?.toLowerCase()).filter(Boolean));
    const existingCodes = new Set(existingVoters.map((v) => v.voterCode));

    const imported: Voter[] = [];
    const errors: string[] = [];
    let skippedCount = 0;

    for (const item of req.voters) {
      const email = item.email?.trim().toLowerCase();
      const code = item.voterCode || this.generateVoterCode();

      if (email && existingEmails.has(email)) {
        skippedCount++;
        errors.push(`Duplicate email skipped: ${email}`);
        continue;
      }
      if (existingCodes.has(code)) {
        skippedCount++;
        errors.push(`Duplicate code skipped: ${code}`);
        continue;
      }

      const voter: Voter = {
        id: `vtr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        organizationId,
        electionId,
        voterCode: code,
        email,
        phone: item.phone?.trim(),
        firstName: item.firstName?.trim(),
        lastName: item.lastName?.trim(),
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: item.eligibilityTag || 'CSV Import',
        hasVoted: false,
        votesCastCount: 0,
        createdAt: new Date().toISOString()
      };

      imported.push(voter);
      if (email) existingEmails.add(email);
      existingCodes.add(code);
    }

    // Persist imported voters
    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        for (const v of imported) {
          await client.query(
            `INSERT INTO voters (
              id, organization_id, election_id, voter_code, email, phone,
              first_name, last_name, eligibility_status, eligibility_tag,
              has_voted, votes_cast_count, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (election_id, voter_code) DO NOTHING`,
            [
              v.id,
              v.organizationId,
              v.electionId,
              v.voterCode,
              v.email,
              v.phone,
              v.firstName,
              v.lastName,
              v.eligibilityStatus,
              v.eligibilityTag,
              v.hasVoted,
              v.votesCastCount,
              v.createdAt
            ]
          );
        }
      } finally {
        client.release();
      }
    } catch {
      const list = VotersService.localVoters.get(electionId) || [];
      list.push(...imported);
      VotersService.localVoters.set(electionId, list);
    }

    return {
      importedCount: imported.length,
      skippedCount,
      voters: imported,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Verify voter eligibility against election category rules and settings.
   */
  async verifyVoterEligibility(
    organizationId: string,
    electionId: string,
    req: VerifyVoterEligibilityRequest
  ): Promise<VerifyVoterEligibilityResponse> {
    const election = await electionsService.getElectionById(organizationId, electionId);

    // Check election status
    if (election.status !== ElectionStatus.ACTIVE && election.status !== ElectionStatus.SCHEDULED) {
      return {
        isEligible: false,
        reason: `Election is currently ${election.status}. Voting is only open during ACTIVE status.`,
        remainingVotesAllowed: 0
      };
    }

    const voters = await this.listVoters(organizationId, electionId);
    let matchedVoter: Voter | undefined;

    if (req.voterCode) {
      matchedVoter = voters.find((v) => v.voterCode === req.voterCode);
    } else if (req.email) {
      matchedVoter = voters.find((v) => v.email?.toLowerCase() === req.email!.toLowerCase());
    }

    // 1. INSTITUTIONAL ELECTIONS:
    // - One eligible voter, one vote per position.
    // - No purchase of additional votes.
    // - No voting credits.
    // - Eligibility must be checked by the backend.
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      if (!matchedVoter) {
        return {
          isEligible: false,
          reason: 'Voter is not registered in the institution official voter roll.',
          remainingVotesAllowed: 0
        };
      }

      if (matchedVoter.eligibilityStatus !== VoterEligibilityStatus.ELIGIBLE) {
        return {
          isEligible: false,
          voter: matchedVoter,
          reason: `Voter status is ${matchedVoter.eligibilityStatus}. Only ELIGIBLE voters may participate.`,
          remainingVotesAllowed: 0
        };
      }

      if (matchedVoter.hasVoted) {
        return {
          isEligible: false,
          voter: matchedVoter,
          reason: 'Institutional voting rule: Each voter is permitted strictly one vote per position. Ballot already cast.',
          remainingVotesAllowed: 0
        };
      }

      // Check allowed domains
      if (election.settings?.allowedDomains?.length && matchedVoter.email) {
        const matchesDomain = election.settings.allowedDomains.some((d) =>
          matchedVoter!.email!.toLowerCase().endsWith(d.toLowerCase())
        );
        if (!matchesDomain) {
          return {
            isEligible: false,
            voter: matchedVoter,
            reason: `Voter domain does not match institutional requirements: ${election.settings.allowedDomains.join(', ')}`,
            remainingVotesAllowed: 0
          };
        }
      }

      return {
        isEligible: true,
        voter: matchedVoter,
        remainingVotesAllowed: 1
      };
    }

    // 2. PAID COMPETITIONS:
    // - Multiple votes may be permitted.
    // - Paid voting explicitly enabled.
    // - Voting credits belong to one election only.
    // - Voting limits must be configurable and enforced.
    if (election.category === ElectionCategory.PAID_COMPETITION) {
      const maxVotes = election.settings?.maxVotesPerVoter ?? 50;
      const votesCast = matchedVoter ? (matchedVoter.votesCastCount || 0) : 0;

      if (maxVotes > 0 && votesCast >= maxVotes) {
        return {
          isEligible: false,
          voter: matchedVoter,
          reason: `Maximum configured vote limit (${maxVotes} votes) reached for this paid competition.`,
          remainingVotesAllowed: 0
        };
      }

      const remaining = maxVotes > 0 ? maxVotes - votesCast : 999;
      return {
        isEligible: true,
        voter: matchedVoter,
        remainingVotesAllowed: remaining
      };
    }

    // 3. PUBLIC OPINION POLLS:
    // - Participation and voting policies are configurable.
    const allowMultiple = election.settings?.allowMultipleVotes ?? false;
    if (matchedVoter && matchedVoter.hasVoted && !allowMultiple) {
      return {
        isEligible: false,
        voter: matchedVoter,
        reason: 'Poll configuration allows one response per voter. You have already participated.',
        remainingVotesAllowed: 0
      };
    }

    return {
      isEligible: true,
      voter: matchedVoter,
      remainingVotesAllowed: 1
    };
  }

  /**
   * Generate voter invitations with secure tokens.
   */
  async sendVoterInvitations(
    organizationId: string,
    electionId: string,
    voterIds?: string[]
  ): Promise<ElectionInvitation[]> {
    await electionsService.getElectionById(organizationId, electionId);

    const voters = await this.listVoters(organizationId, electionId);
    const targetVoters = voterIds?.length
      ? voters.filter((v) => voterIds.includes(v.id) && v.email)
      : voters.filter((v) => v.email);

    const invites: ElectionInvitation[] = [];
    const expiresAt = new Date(Date.now() + 86400000 * 7).toISOString(); // 7-day token

    for (const v of targetVoters) {
      const token = `inv-${crypto.randomBytes(16).toString('hex')}`;
      const invite: ElectionInvitation = {
        id: `invite-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        electionId,
        organizationId,
        email: v.email!,
        voterId: v.id,
        token,
        status: 'SENT',
        sentAt: new Date().toISOString(),
        expiresAt,
        createdAt: new Date().toISOString()
      };
      invites.push(invite);
    }

    try {
      const client = await pool.connect();
      try {
        await client.query('SET LOCAL app.current_organization_id = $1', [organizationId]);
        for (const inv of invites) {
          await client.query(
            `INSERT INTO election_invitations (
              id, election_id, organization_id, email, voter_id, token, status, sent_at, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              inv.id,
              inv.electionId,
              inv.organizationId,
              inv.email,
              inv.voterId,
              inv.token,
              inv.status,
              inv.sentAt,
              inv.expiresAt
            ]
          );
        }
      } finally {
        client.release();
      }
    } catch {
      const existing = VotersService.localInvitations.get(electionId) || [];
      existing.push(...invites);
      VotersService.localInvitations.set(electionId, existing);
    }

    return invites;
  }

  private generateVoterCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'VTR-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += '-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private mapDbVoter(row: Record<string, unknown>): Voter {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      electionId: row.election_id as string,
      userId: row.user_id as string | undefined,
      voterCode: row.voter_code as string,
      email: row.email as string | undefined,
      phone: row.phone as string | undefined,
      firstName: row.first_name as string | undefined,
      lastName: row.last_name as string | undefined,
      eligibilityStatus: (row.eligibility_status as VoterEligibilityStatus) || VoterEligibilityStatus.ELIGIBLE,
      eligibilityTag: row.eligibility_tag as string | undefined,
      hasVoted: Boolean(row.has_voted),
      votesCastCount: Number(row.votes_cast_count || 0),
      verifiedAt: row.verified_at ? (row.verified_at as Date).toISOString() : undefined,
      createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string)
    };
  }
}

export const votersService = new VotersService();

