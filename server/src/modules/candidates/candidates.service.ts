import crypto from 'crypto';
import {
  Candidate,
  CandidateStatus,
  CreateCandidateRequest,
  UpdateCandidateRequest
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { electionsService } from '../elections/elections.service.js';
import { positionsService } from '../elections/positions.service.js';

export class CandidatesService {
  private static localCandidates = new Map<string, Candidate[]>();

  constructor() {
    this.seedDefaultCandidates();
  }

  private seedDefaultCandidates() {
    if (CandidatesService.localCandidates.size > 0) return;

    CandidatesService.localCandidates.set('elec-inst-1', [
      {
        id: 'cand-1',
        electionId: 'elec-inst-1',
        organizationId: 'org-metro-uni',
        positionId: 'pos-1',
        name: 'Jordan Hayes',
        bio: 'Senior, Computer Science & Public Policy. Advocating for transparent student fee allocation and campus sustainability.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        manifesto: 'Every student deserves modern campus facilities, accessible mental health support, and open budget hearings.',
        ballotOrder: 1,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'cand-2',
        electionId: 'elec-inst-1',
        organizationId: 'org-metro-uni',
        positionId: 'pos-1',
        name: 'Morgan Chen',
        bio: 'Junior, Economics & Data Analytics. Championing improved campus dining and streamlined club funding approval.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        manifesto: 'Cutting administrative bureaucracy, establishing 24/7 library study wings, and subsidizing regional transit passes.',
        ballotOrder: 2,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'cand-3',
        electionId: 'elec-inst-1',
        organizationId: 'org-metro-uni',
        positionId: 'pos-2',
        name: 'Elena Rostova',
        bio: 'Senior, International Relations. Promoting cross-cultural student initiatives and campus safety lighting.',
        ballotOrder: 1,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'cand-4',
        electionId: 'elec-inst-1',
        organizationId: 'org-metro-uni',
        positionId: 'pos-2',
        name: 'Marcus Williams',
        bio: 'Junior, Mechanical Engineering. Advancing maker-space funding and research grant opportunities for undergraduates.',
        ballotOrder: 2,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'cand-5',
        electionId: 'elec-inst-1',
        organizationId: 'org-metro-uni',
        positionId: 'pos-3',
        name: 'Sarah Jenkins',
        bio: 'Senior, Accounting & Finance. Certified student auditor with 2 years of SGA budget oversight experience.',
        ballotOrder: 1,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: new Date().toISOString()
      }
    ]);

    // Candidates for Paid Showcase
    CandidatesService.localCandidates.set('elec-paid-1', [
      {
        id: 'cand-paid-1',
        electionId: 'elec-paid-1',
        organizationId: 'org-metro-uni',
        positionId: 'pos-showcase-1',
        name: 'The Harmonix A Cappella',
        bio: 'Premier university 12-voice contemporary a cappella ensemble.',
        avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150',
        manifesto: 'Bringing modern pop arrangements and collegiate choral excellence to national audiences.',
        ballotOrder: 1,
        status: CandidateStatus.APPROVED,
        voteCount: 342,
        createdAt: new Date().toISOString()
      },
      {
        id: 'cand-paid-2',
        electionId: 'elec-paid-1',
        organizationId: 'org-metro-uni',
        positionId: 'pos-showcase-1',
        name: 'Apex Urban Dance Crew',
        bio: 'Award-winning collegiate hip-hop choreography team representing 8 regional championships.',
        avatarUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=150',
        manifesto: 'Fusing street styles with theatrical storytelling.',
        ballotOrder: 2,
        status: CandidateStatus.APPROVED,
        voteCount: 489,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  /**
   * List candidates for an election with optional position filter.
   */
  async listCandidates(
    organizationId: string,
    electionId: string,
    positionId?: string
  ): Promise<Candidate[]> {
    await electionsService.getElectionById(organizationId, electionId);

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        let query = `
          SELECT * FROM candidates
          WHERE election_id = $1 AND organization_id = $2
        `;
        const params: unknown[] = [electionId, organizationId];

        if (positionId) {
          params.push(positionId);
          query += ` AND position_id = $${params.length}`;
        }

        query += ` ORDER BY ballot_order ASC, created_at ASC`;
        const res = await client.query(query, params);

        return res.rows.map((r) => ({
          id: r.id,
          electionId: r.election_id,
          organizationId: r.organization_id,
          positionId: r.position_id,
          name: r.name,
          bio: r.bio,
          avatarUrl: r.avatar_url,
          manifesto: r.manifesto,
          ballotOrder: r.ballot_order,
          status: r.status as CandidateStatus,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      } finally {
        client.release();
      }
    } catch {
      let list = CandidatesService.localCandidates.get(electionId) || [];
      if (positionId) {
        list = list.filter((c) => c.positionId === positionId);
      }
      return list;
    }
  }

  /**
   * Register a new candidate to an election and position.
   */
  async createCandidate(
    organizationId: string,
    electionId: string,
    req: CreateCandidateRequest
  ): Promise<Candidate> {
    await electionsService.getElectionById(organizationId, electionId);

    if (!req.name || req.name.trim().length === 0) {
      throw new AppError('Candidate name is required', 400, 'INVALID_CANDIDATE_NAME');
    }

    if (!req.positionId) {
      throw new AppError('Position ID is required for candidate registration', 400, 'POSITION_REQUIRED');
    }

    // Verify position belongs to this election and organization
    const positions = await positionsService.listPositions(organizationId, electionId);
    const position = positions.find((p) => p.id === req.positionId);
    if (!position) {
      throw new AppError(
        'The specified position does not exist or belong to this election',
        400,
        'INVALID_POSITION_FOR_ELECTION'
      );
    }

    const candId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newCandidate: Candidate = {
      id: candId,
      electionId,
      organizationId,
      positionId: req.positionId,
      name: req.name.trim(),
      bio: req.bio || '',
      avatarUrl: req.avatarUrl || '',
      manifesto: req.manifesto || '',
      ballotOrder: req.ballotOrder ?? (positions.length + 1),
      status: CandidateStatus.APPROVED,
      voteCount: 0,
      createdAt: now,
      updatedAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `INSERT INTO candidates (
            id, election_id, organization_id, position_id, name,
            bio, avatar_url, manifesto, ballot_order, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            newCandidate.id,
            newCandidate.electionId,
            newCandidate.organizationId,
            newCandidate.positionId,
            newCandidate.name,
            newCandidate.bio,
            newCandidate.avatarUrl,
            newCandidate.manifesto,
            newCandidate.ballotOrder,
            newCandidate.status,
            now,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = CandidatesService.localCandidates.get(electionId) || [];
      list.push(newCandidate);
      CandidatesService.localCandidates.set(electionId, list);
    }

    return newCandidate;
  }

  /**
   * Update candidate details or approval status.
   */
  async updateCandidate(
    organizationId: string,
    electionId: string,
    candidateId: string,
    req: UpdateCandidateRequest
  ): Promise<Candidate> {
    await electionsService.getElectionById(organizationId, electionId);

    const candidates = await this.listCandidates(organizationId, electionId);
    const existing = candidates.find((c) => c.id === candidateId);
    if (!existing) {
      throw new AppError('Candidate not found', 404, 'CANDIDATE_NOT_FOUND');
    }

    if (req.positionId && req.positionId !== existing.positionId) {
      const positions = await positionsService.listPositions(organizationId, electionId);
      if (!positions.some((p) => p.id === req.positionId)) {
        throw new AppError(
          'Target position does not belong to this election',
          400,
          'INVALID_POSITION_FOR_ELECTION'
        );
      }
    }

    const updated: Candidate = {
      ...existing,
      positionId: req.positionId || existing.positionId,
      name: req.name ? req.name.trim() : existing.name,
      bio: req.bio !== undefined ? req.bio : existing.bio,
      avatarUrl: req.avatarUrl !== undefined ? req.avatarUrl : existing.avatarUrl,
      manifesto: req.manifesto !== undefined ? req.manifesto : existing.manifesto,
      ballotOrder: req.ballotOrder !== undefined ? req.ballotOrder : existing.ballotOrder,
      status: req.status || existing.status,
      updatedAt: new Date().toISOString()
    };

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `UPDATE candidates SET
            position_id = $1, name = $2, bio = $3, avatar_url = $4,
            manifesto = $5, ballot_order = $6, status = $7, updated_at = $8
          WHERE id = $9 AND election_id = $10 AND organization_id = $11`,
          [
            updated.positionId,
            updated.name,
            updated.bio,
            updated.avatarUrl,
            updated.manifesto,
            updated.ballotOrder,
            updated.status,
            updated.updatedAt,
            candidateId,
            electionId,
            organizationId
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = CandidatesService.localCandidates.get(electionId) || [];
      const idx = list.findIndex((c) => c.id === candidateId);
      if (idx !== -1) {
        list[idx] = updated;
        CandidatesService.localCandidates.set(electionId, list);
      }
    }

    return updated;
  }

  /**
   * Delete a candidate.
   */
  async deleteCandidate(organizationId: string, electionId: string, candidateId: string): Promise<void> {
    await electionsService.getElectionById(organizationId, electionId);

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `DELETE FROM candidates WHERE id = $1 AND election_id = $2 AND organization_id = $3`,
          [candidateId, electionId, organizationId]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = CandidatesService.localCandidates.get(electionId) || [];
      CandidatesService.localCandidates.set(
        electionId,
        list.filter((c) => c.id !== candidateId)
      );
    }
  }
}

export const candidatesService = new CandidatesService();

