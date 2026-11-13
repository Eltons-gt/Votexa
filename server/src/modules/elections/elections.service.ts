import crypto from 'crypto';
import {
  Election,
  ElectionCategory,
  ElectionStatus,
  ElectionSettings,
  ResultsVisibility,
  ElectionAuditLog,
  CreateElectionRequest,
  UpdateElectionRequest,
  UpdateElectionSettingsRequest
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const toUuidOrNull = (val?: string) => (val && UUID_REGEX.test(val) ? val : null);

export class ElectionsService {
  private static localElections = new Map<string, Election>();
  private static localSettings = new Map<string, ElectionSettings>();
  private static localAuditLogs = new Map<string, ElectionAuditLog[]>();

  static getLocalElection(id: string): Election | undefined {
    return ElectionsService.localElections.get(id);
  }

  static getLocalSettings(id: string): ElectionSettings | undefined {
    return ElectionsService.localSettings.get(id);
  }

  constructor() {
    this.seedDefaultElections();
  }

  private seedDefaultElections() {
    if (ElectionsService.localElections.size > 0) return;

    // Seed 1: Institutional Election (Metropolitan University)
    const instId = 'elec-inst-1';
    const instElection: Election = {
      id: instId,
      organizationId: 'org-metro-uni',
      category: ElectionCategory.INSTITUTIONAL,
      title: 'Student Government Executive Council Election 2026',
      description: 'Official annual election for Student Government President and Executive Council.',
      status: ElectionStatus.ACTIVE,
      startTime: new Date(Date.now() - 86400000).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
      timezone: 'America/New_York',
      allowSelfRegistration: false,
      isPaidVoting: false,
      createdById: 'usr-demo-owner',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    };
    ElectionsService.localElections.set(instId, instElection);
    ElectionsService.localSettings.set(instId, {
      id: 'set-inst-1',
      electionId: instId,
      organizationId: 'org-metro-uni',
      resultsVisibility: ResultsVisibility.AFTER_CLOSE,
      allowMultipleVotes: false,
      maxVotesPerVoter: 1,
      votePriceCents: 0,
      currency: 'USD',
      requireVoterVerification: true,
      allowedDomains: ['@metro.edu', '@university.edu'],
      shuffleCandidateOrder: true,
      enableRealTimeTally: true,
      updatedAt: new Date().toISOString()
    });

    // Seed 2: Paid Competition (Metropolitan University Talent Showcase)
    const paidId = 'elec-paid-1';
    const paidElection: Election = {
      id: paidId,
      organizationId: 'org-metro-uni',
      category: ElectionCategory.PAID_COMPETITION,
      title: 'National Collegiate Performing Arts & Talent Showcase',
      description: 'Audience-choice public voting for the top performing arts ensemble. Multiple votes permitted.',
      status: ElectionStatus.ACTIVE,
      startTime: new Date(Date.now() - 3600000 * 12).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 5).toISOString(),
      timezone: 'America/New_York',
      allowSelfRegistration: true,
      isPaidVoting: true,
      createdById: 'usr-demo-owner',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString()
    };
    ElectionsService.localElections.set(paidId, paidElection);
    ElectionsService.localSettings.set(paidId, {
      id: 'set-paid-1',
      electionId: paidId,
      organizationId: 'org-metro-uni',
      resultsVisibility: ResultsVisibility.LIVE,
      allowMultipleVotes: true,
      maxVotesPerVoter: 50,
      votePriceCents: 100, // $1.00 per vote
      currency: 'USD',
      requireVoterVerification: false,
      allowedDomains: [],
      shuffleCandidateOrder: false,
      enableRealTimeTally: true,
      updatedAt: new Date().toISOString()
    });

    // Seed 3: Public Opinion Poll (Campus Transit & Sustainability Poll)
    const pollId = 'elec-poll-1';
    const pollElection: Election = {
      id: pollId,
      organizationId: 'org-metro-uni',
      category: ElectionCategory.PUBLIC_POLL,
      title: 'Campus Carbon Neutrality & Light Rail Transit Initiative',
      description: 'Community opinion survey on campus transport electrification and renewable energy investments.',
      status: ElectionStatus.DRAFT,
      startTime: new Date(Date.now() + 86400000).toISOString(),
      endTime: new Date(Date.now() + 86400000 * 14).toISOString(),
      timezone: 'America/New_York',
      allowSelfRegistration: true,
      isPaidVoting: false,
      createdById: 'usr-demo-owner',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    ElectionsService.localElections.set(pollId, pollElection);
    ElectionsService.localSettings.set(pollId, {
      id: 'set-poll-1',
      electionId: pollId,
      organizationId: 'org-metro-uni',
      resultsVisibility: ResultsVisibility.LIVE,
      allowMultipleVotes: false,
      maxVotesPerVoter: 1,
      votePriceCents: 0,
      currency: 'USD',
      requireVoterVerification: false,
      allowedDomains: [],
      shuffleCandidateOrder: true,
      enableRealTimeTally: true,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * List elections for a tenant, or all elections across the platform if organizationId is omitted.
   */
  async listElections(
    organizationId?: string,
    filter?: { category?: ElectionCategory; status?: ElectionStatus }
  ): Promise<Election[]> {
    try {
      const client = await pool.connect();
      try {
        if (organizationId) {
          await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        }
        let query = `
          SELECT e.*, 
            row_to_json(s.*) as settings
          FROM elections e
          LEFT JOIN election_settings s ON s.election_id = e.id
          WHERE 1=1
        `;
        const params: unknown[] = [];
        if (organizationId) {
          params.push(organizationId);
          query += ` AND e.organization_id = $${params.length}`;
        }

        if (filter?.category) {
          params.push(filter.category);
          query += ` AND e.category = $${params.length}`;
        }
        if (filter?.status) {
          params.push(filter.status);
          query += ` AND e.status = $${params.length}`;
        }

        query += ' ORDER BY e.created_at DESC';
        const res = await client.query(query, params);

        return res.rows.map((row) => this.mapDbElection(row));
      } finally {
        client.release();
      }
    } catch {
      // In-memory fallback
      let elections = Array.from(ElectionsService.localElections.values());
      if (organizationId) {
        elections = elections.filter((e) => e.organizationId === organizationId);
      }

      if (filter?.category) {
        elections = elections.filter((e) => e.category === filter.category);
      }
      if (filter?.status) {
        elections = elections.filter((e) => e.status === filter.status);
      }

      return elections.map((e) => ({
        ...e,
        settings: ElectionsService.localSettings.get(e.id)
      }));
    }
  }

  /**
   * Get election by ID, enforcing tenant isolation.
   */
  async getElectionById(organizationId: string, electionId: string): Promise<Election> {
    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        const res = await client.query(
          `SELECT e.*, row_to_json(s.*) as settings
           FROM elections e
           LEFT JOIN election_settings s ON s.election_id = e.id
           WHERE e.id = $1`,
          [electionId]
        );

        if (res.rows.length === 0) {
          throw new AppError('Election not found', 404, 'ELECTION_NOT_FOUND');
        }

        const election = this.mapDbElection(res.rows[0]);
        if (election.organizationId !== organizationId) {
          throw new AppError('Access denied to this election', 403, 'TENANT_ACCESS_DENIED');
        }
        return election;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AppError) throw err;

      const election = ElectionsService.localElections.get(electionId);
      if (!election) {
        throw new AppError('Election not found', 404, 'ELECTION_NOT_FOUND');
      }
      if (election.organizationId !== organizationId) {
        throw new AppError('Access denied to this election', 403, 'TENANT_ACCESS_DENIED');
      }

      return {
        ...election,
        settings: ElectionsService.localSettings.get(election.id)
      };
    }
  }

  /**
   * Create an election adhering to category-specific rules.
   */
  async createElection(
    organizationId: string,
    userId: string,
    req: CreateElectionRequest
  ): Promise<Election> {
    if (!req.title || req.title.trim().length === 0) {
      throw new AppError('Election title is required', 400, 'INVALID_TITLE');
    }

    if (!req.startTime || !req.endTime) {
      throw new AppError('Start time and end time are required', 400, 'INVALID_DATES');
    }

    const startDate = new Date(req.startTime);
    const endDate = new Date(req.endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new AppError('Invalid date format for election schedule', 400, 'INVALID_DATES');
    }

    if (endDate <= startDate) {
      throw new AppError('End time must be strictly after start time', 400, 'INVALID_DATE_RANGE');
    }

    const category = req.category || ElectionCategory.INSTITUTIONAL;

    // Category Rule Enforcements
    let isPaidVoting = req.isPaidVoting ?? false;
    let allowSelfRegistration = req.allowSelfRegistration ?? false;

    if (category === ElectionCategory.INSTITUTIONAL) {
      if (isPaidVoting || (req.settings?.votePriceCents && req.settings.votePriceCents > 0)) {
        throw new AppError(
          'Institutional elections cannot enable paid voting or vote purchases',
          400,
          'INSTITUTIONAL_PAID_VOTING_FORBIDDEN'
        );
      }
      if (req.settings?.allowMultipleVotes || (req.settings?.maxVotesPerVoter && req.settings.maxVotesPerVoter > 1)) {
        throw new AppError(
          'Institutional elections permit strictly one vote per voter',
          400,
          'INSTITUTIONAL_SINGLE_VOTE_ONLY'
        );
      }
      isPaidVoting = false;
      allowSelfRegistration = false;
    } else if (category === ElectionCategory.PAID_COMPETITION) {
      // Paid competitions require paid voting to be explicitly enabled or configurable
      isPaidVoting = true;
    }

    const electionId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newElection: Election = {
      id: electionId,
      organizationId,
      category,
      title: req.title.trim(),
      description: req.description || '',
      status: ElectionStatus.DRAFT,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      timezone: req.timezone || 'UTC',
      allowSelfRegistration,
      isPaidVoting,
      createdById: userId,
      createdAt: now,
      updatedAt: now
    };

    const newSettings: ElectionSettings = {
      id: crypto.randomUUID(),
      electionId,
      organizationId,
      resultsVisibility: req.settings?.resultsVisibility || (
        category === ElectionCategory.PAID_COMPETITION
          ? ResultsVisibility.LIVE
          : ResultsVisibility.AFTER_CLOSE
      ),
      allowMultipleVotes: category === ElectionCategory.PAID_COMPETITION
        ? (req.settings?.allowMultipleVotes ?? true)
        : false,
      maxVotesPerVoter: category === ElectionCategory.PAID_COMPETITION
        ? (req.settings?.maxVotesPerVoter ?? 50)
        : 1,
      votePriceCents: category === ElectionCategory.PAID_COMPETITION
        ? (req.settings?.votePriceCents ?? 100)
        : 0,
      currency: req.settings?.currency || 'USD',
      requireVoterVerification: category === ElectionCategory.INSTITUTIONAL
        ? true
        : (req.settings?.requireVoterVerification ?? false),
      allowedDomains: req.settings?.allowedDomains || [],
      shuffleCandidateOrder: req.settings?.shuffleCandidateOrder ?? true,
      enableRealTimeTally: req.settings?.enableRealTimeTally ?? true,
      customRules: req.settings?.customRules || {},
      updatedAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query("SELECT set_config('app.current_organization_id', $1, true)", [organizationId]);

        await client.query(
          `INSERT INTO elections (
            id, organization_id, category, title, description, status,
            start_time, end_time, timezone, allow_self_registration,
            is_paid_voting, created_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            newElection.id,
            newElection.organizationId,
            newElection.category,
            newElection.title,
            newElection.description,
            newElection.status,
            newElection.startTime,
            newElection.endTime,
            newElection.timezone,
            newElection.allowSelfRegistration,
            newElection.isPaidVoting,
            toUuidOrNull(newElection.createdById),
            newElection.createdAt,
            newElection.updatedAt
          ]
        );

        await client.query(
          `INSERT INTO election_settings (
            id, election_id, organization_id, results_visibility,
            allow_multiple_votes, max_votes_per_voter, vote_price_cents,
            currency, require_voter_verification, allowed_domains,
            shuffle_candidate_order, enable_real_time_tally, custom_rules,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            newSettings.id,
            newSettings.electionId,
            newSettings.organizationId,
            newSettings.resultsVisibility,
            newSettings.allowMultipleVotes,
            newSettings.maxVotesPerVoter,
            newSettings.votePriceCents,
            newSettings.currency,
            newSettings.requireVoterVerification,
            newSettings.allowedDomains,
            newSettings.shuffleCandidateOrder,
            newSettings.enableRealTimeTally,
            JSON.stringify(newSettings.customRules),
            now,
            now
          ]
        );

        await client.query(
          `INSERT INTO election_audit_logs (
            election_id, organization_id, user_id, action, new_state, reason
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            electionId,
            organizationId,
            toUuidOrNull(userId),
            'ELECTION_CREATED',
            JSON.stringify(newElection),
            'Initial creation of election workspace'
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
      // Store in memory
      ElectionsService.localElections.set(electionId, newElection);
      ElectionsService.localSettings.set(electionId, newSettings);
      this.recordAuditLog(
        electionId,
        organizationId,
        userId,
        'ELECTION_CREATED',
        undefined,
        newElection as unknown as Record<string, unknown>,
        'Initial creation'
      );
    }

    return {
      ...newElection,
      settings: newSettings
    };
  }

  /**
   * Update election properties with locked-rules enforcement.
   */
  async updateElection(
    organizationId: string,
    electionId: string,
    userId: string,
    req: UpdateElectionRequest
  ): Promise<Election> {
    const existing = await this.getElectionById(organizationId, electionId);

    // Prevent changing critical voting rules after voting has started
    const isLiveOrClosed = existing.status === ElectionStatus.ACTIVE || existing.status === ElectionStatus.CLOSED;

    if (isLiveOrClosed) {
      const isCriticalChange =
        (req.category !== undefined && req.category !== existing.category) ||
        (req.isPaidVoting !== undefined && req.isPaidVoting !== existing.isPaidVoting);

      if (isCriticalChange && !req.auditReason) {
        throw new AppError(
          'Cannot modify critical voting rules while election is ACTIVE or CLOSED without explicit audit reason',
          400,
          'VOTING_RULES_LOCKED'
        );
      }
    }

    // Validate dates if modified
    let startTime = existing.startTime;
    let endTime = existing.endTime;

    if (req.startTime) {
      const d = new Date(req.startTime);
      if (isNaN(d.getTime())) throw new AppError('Invalid start time', 400, 'INVALID_DATES');
      startTime = d.toISOString();
    }
    if (req.endTime) {
      const d = new Date(req.endTime);
      if (isNaN(d.getTime())) throw new AppError('Invalid end time', 400, 'INVALID_DATES');
      endTime = d.toISOString();
    }

    if (new Date(endTime) <= new Date(startTime)) {
      throw new AppError('End time must be strictly after start time', 400, 'INVALID_DATE_RANGE');
    }

    // Institutional checks
    const targetCategory = req.category || existing.category;
    const targetPaid = req.isPaidVoting !== undefined ? req.isPaidVoting : existing.isPaidVoting;

    if (targetCategory === ElectionCategory.INSTITUTIONAL && targetPaid) {
      throw new AppError(
        'Institutional elections cannot enable paid voting',
        400,
        'INSTITUTIONAL_PAID_VOTING_FORBIDDEN'
      );
    }

    const updated: Election = {
      ...existing,
      title: req.title ? req.title.trim() : existing.title,
      description: req.description !== undefined ? req.description : existing.description,
      category: targetCategory,
      startTime,
      endTime,
      timezone: req.timezone || existing.timezone,
      allowSelfRegistration: req.allowSelfRegistration !== undefined ? req.allowSelfRegistration : existing.allowSelfRegistration,
      isPaidVoting: targetPaid,
      updatedAt: new Date().toISOString()
    };

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `UPDATE elections SET
            title = $1, description = $2, category = $3,
            start_time = $4, end_time = $5, timezone = $6,
            allow_self_registration = $7, is_paid_voting = $8,
            updated_at = $9
          WHERE id = $10 AND organization_id = $11`,
          [
            updated.title,
            updated.description,
            updated.category,
            updated.startTime,
            updated.endTime,
            updated.timezone,
            updated.allowSelfRegistration,
            updated.isPaidVoting,
            updated.updatedAt,
            electionId,
            organizationId
          ]
        );

        await client.query(
          `INSERT INTO election_audit_logs (
            election_id, organization_id, user_id, action, previous_state, new_state, reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            electionId,
            organizationId,
            userId,
            req.auditReason ? 'RULE_OVERRIDE' : 'ELECTION_UPDATED',
            JSON.stringify(existing),
            JSON.stringify(updated),
            req.auditReason || 'Standard configuration update'
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      ElectionsService.localElections.set(electionId, updated);
      this.recordAuditLog(
        electionId,
        organizationId,
        userId,
        req.auditReason ? 'RULE_OVERRIDE' : 'ELECTION_UPDATED',
        existing as unknown as Record<string, unknown>,
        updated as unknown as Record<string, unknown>,
        req.auditReason || 'Standard configuration update'
      );
    }

    return {
      ...updated,
      settings: ElectionsService.localSettings.get(electionId)
    };
  }

  /**
   * Update election settings (results visibility, voting limits, domains).
   */
  async updateElectionSettings(
    organizationId: string,
    electionId: string,
    userId: string,
    req: UpdateElectionSettingsRequest
  ): Promise<ElectionSettings> {
    const election = await this.getElectionById(organizationId, electionId);
    let existingSettings = ElectionsService.localSettings.get(electionId);

    if (!existingSettings) {
      existingSettings = {
        id: `set-${electionId}`,
        electionId,
        organizationId,
        resultsVisibility: ResultsVisibility.AFTER_CLOSE,
        allowMultipleVotes: false,
        maxVotesPerVoter: 1,
        votePriceCents: 0,
        currency: 'USD',
        requireVoterVerification: true,
        allowedDomains: [],
        shuffleCandidateOrder: true,
        enableRealTimeTally: true,
        updatedAt: new Date().toISOString()
      };
    }

    const isLiveOrClosed = election.status === ElectionStatus.ACTIVE || election.status === ElectionStatus.CLOSED;

    // Check critical rules
    const isCriticalChange =
      (req.allowMultipleVotes !== undefined && req.allowMultipleVotes !== existingSettings.allowMultipleVotes) ||
      (req.maxVotesPerVoter !== undefined && req.maxVotesPerVoter !== existingSettings.maxVotesPerVoter) ||
      (req.votePriceCents !== undefined && req.votePriceCents !== existingSettings.votePriceCents);

    if (isLiveOrClosed && isCriticalChange && !req.auditReason) {
      throw new AppError(
        'Cannot modify critical voting rules while election is ACTIVE or CLOSED without explicit audit reason',
        400,
        'VOTING_RULES_LOCKED'
      );
    }

    // Institutional checks
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      if (req.votePriceCents && req.votePriceCents > 0) {
        throw new AppError(
          'Institutional elections cannot enable paid voting',
          400,
          'INSTITUTIONAL_PAID_VOTING_FORBIDDEN'
        );
      }
      if (req.allowMultipleVotes || (req.maxVotesPerVoter && req.maxVotesPerVoter > 1)) {
        throw new AppError(
          'Institutional elections permit strictly one vote per voter',
          400,
          'INSTITUTIONAL_SINGLE_VOTE_ONLY'
        );
      }
    }

    const updatedSettings: ElectionSettings = {
      ...existingSettings,
      resultsVisibility: req.resultsVisibility || existingSettings.resultsVisibility,
      allowMultipleVotes: req.allowMultipleVotes !== undefined ? req.allowMultipleVotes : existingSettings.allowMultipleVotes,
      maxVotesPerVoter: req.maxVotesPerVoter !== undefined ? req.maxVotesPerVoter : existingSettings.maxVotesPerVoter,
      votePriceCents: req.votePriceCents !== undefined ? req.votePriceCents : existingSettings.votePriceCents,
      currency: req.currency || existingSettings.currency,
      requireVoterVerification: req.requireVoterVerification !== undefined ? req.requireVoterVerification : existingSettings.requireVoterVerification,
      allowedDomains: req.allowedDomains || existingSettings.allowedDomains,
      shuffleCandidateOrder: req.shuffleCandidateOrder !== undefined ? req.shuffleCandidateOrder : existingSettings.shuffleCandidateOrder,
      enableRealTimeTally: req.enableRealTimeTally !== undefined ? req.enableRealTimeTally : existingSettings.enableRealTimeTally,
      updatedAt: new Date().toISOString()
    };

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `UPDATE election_settings SET
            results_visibility = $1, allow_multiple_votes = $2,
            max_votes_per_voter = $3, vote_price_cents = $4,
            currency = $5, require_voter_verification = $6,
            allowed_domains = $7, shuffle_candidate_order = $8,
            enable_real_time_tally = $9, updated_at = $10
          WHERE election_id = $11 AND organization_id = $12`,
          [
            updatedSettings.resultsVisibility,
            updatedSettings.allowMultipleVotes,
            updatedSettings.maxVotesPerVoter,
            updatedSettings.votePriceCents,
            updatedSettings.currency,
            updatedSettings.requireVoterVerification,
            updatedSettings.allowedDomains,
            updatedSettings.shuffleCandidateOrder,
            updatedSettings.enableRealTimeTally,
            updatedSettings.updatedAt,
            electionId,
            organizationId
          ]
        );

        await client.query(
          `INSERT INTO election_audit_logs (
            election_id, organization_id, user_id, action, previous_state, new_state, reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            electionId,
            organizationId,
            userId,
            req.auditReason ? 'RULE_OVERRIDE' : 'SETTINGS_UPDATED',
            JSON.stringify(existingSettings),
            JSON.stringify(updatedSettings),
            req.auditReason || 'Updated election settings'
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      ElectionsService.localSettings.set(electionId, updatedSettings);
      this.recordAuditLog(
        electionId,
        organizationId,
        userId,
        req.auditReason ? 'RULE_OVERRIDE' : 'SETTINGS_UPDATED',
        existingSettings as unknown as Record<string, unknown>,
        updatedSettings as unknown as Record<string, unknown>,
        req.auditReason || 'Updated election settings'
      );
    }

    return updatedSettings;
  }

  /**
   * Transition election lifecycle status with state machine validation and auditing.
   */
  async transitionStatus(
    organizationId: string,
    electionId: string,
    userId: string,
    targetStatus: ElectionStatus,
    reason?: string
  ): Promise<Election> {
    const existing = await this.getElectionById(organizationId, electionId);
    const current = existing.status;

    if (current === targetStatus) {
      return existing;
    }

    // State Machine Transition Rules:
    // DRAFT -> SCHEDULED, ACTIVE, CANCELLED
    // SCHEDULED -> DRAFT, ACTIVE, CANCELLED
    // ACTIVE -> CLOSED, CANCELLED
    // CLOSED -> CANCELLED
    // CANCELLED -> terminal
    const allowedTransitions: Record<ElectionStatus, ElectionStatus[]> = {
      [ElectionStatus.DRAFT]: [ElectionStatus.SCHEDULED, ElectionStatus.ACTIVE, ElectionStatus.CANCELLED],
      [ElectionStatus.SCHEDULED]: [ElectionStatus.DRAFT, ElectionStatus.ACTIVE, ElectionStatus.CANCELLED],
      [ElectionStatus.ACTIVE]: [ElectionStatus.CLOSED, ElectionStatus.CANCELLED, ElectionStatus.PAUSED],
      [ElectionStatus.CLOSED]: [ElectionStatus.CANCELLED],
      [ElectionStatus.CANCELLED]: [],
      [ElectionStatus.PAUSED]: [ElectionStatus.ACTIVE, ElectionStatus.CLOSED, ElectionStatus.CANCELLED],
      [ElectionStatus.CONCLUDED]: [ElectionStatus.CANCELLED],
      [ElectionStatus.AUDITED]: []
    };

    const validNextStates = allowedTransitions[current] || [];
    if (!validNextStates.includes(targetStatus)) {
      throw new AppError(
        `Invalid lifecycle transition from ${current} to ${targetStatus}`,
        400,
        'INVALID_LIFECYCLE_TRANSITION'
      );
    }

    const now = new Date().toISOString();
    const updated: Election = {
      ...existing,
      status: targetStatus,
      updatedAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `UPDATE elections SET status = $1, updated_at = $2 WHERE id = $3 AND organization_id = $4`,
          [targetStatus, now, electionId, organizationId]
        );

        await client.query(
          `INSERT INTO election_audit_logs (
            election_id, organization_id, user_id, action, previous_state, new_state, reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            electionId,
            organizationId,
            userId,
            'STATUS_CHANGE',
            JSON.stringify({ status: current }),
            JSON.stringify({ status: targetStatus }),
            reason || `Transitioned status from ${current} to ${targetStatus}`
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      ElectionsService.localElections.set(electionId, updated);
      this.recordAuditLog(
        electionId,
        organizationId,
        userId,
        'STATUS_CHANGE',
        { status: current },
        { status: targetStatus },
        reason || `Transitioned status from ${current} to ${targetStatus}`
      );
    }

    return {
      ...updated,
      settings: ElectionsService.localSettings.get(electionId)
    };
  }

  /**
   * Fetch audit logs for an election.
   */
  async getAuditLogs(organizationId: string, electionId: string): Promise<ElectionAuditLog[]> {
    await this.getElectionById(organizationId, electionId); // Ensures existence & tenant scoping

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        const res = await client.query(
          `SELECT * FROM election_audit_logs WHERE election_id = $1 ORDER BY created_at DESC`,
          [electionId]
        );
        return res.rows;
      } finally {
        client.release();
      }
    } catch {
      return ElectionsService.localAuditLogs.get(electionId) || [];
    }
  }

  private recordAuditLog(
    electionId: string,
    organizationId: string,
    userId: string,
    action: string,
    previousState?: Record<string, unknown>,
    newState?: Record<string, unknown>,
    reason?: string
  ) {
    const logs = ElectionsService.localAuditLogs.get(electionId) || [];
    logs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      electionId,
      organizationId,
      userId,
      action,
      previousState,
      newState,
      reason,
      createdAt: new Date().toISOString()
    });
    ElectionsService.localAuditLogs.set(electionId, logs);
  }

  private mapDbElection(row: Record<string, unknown>): Election {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      category: (row.category as ElectionCategory) || ElectionCategory.INSTITUTIONAL,
      title: row.title as string,
      description: row.description as string | undefined,
      status: row.status as ElectionStatus,
      startTime: (row.start_time as Date).toISOString ? (row.start_time as Date).toISOString() : (row.start_time as string),
      endTime: (row.end_time as Date).toISOString ? (row.end_time as Date).toISOString() : (row.end_time as string),
      timezone: (row.timezone as string) || 'UTC',
      allowSelfRegistration: Boolean(row.allow_self_registration),
      isPaidVoting: Boolean(row.is_paid_voting),
      packageId: row.package_id as string | undefined,
      createdById: row.created_by as string | undefined,
      certifiedAt: row.certified_at ? (row.certified_at as Date).toISOString() : undefined,
      certifiedBy: row.certified_by as string | undefined,
      settings: row.settings ? (row.settings as ElectionSettings) : undefined,
      createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string),
      updatedAt: (row.updated_at as Date).toISOString ? (row.updated_at as Date).toISOString() : (row.updated_at as string)
    };
  }
}

export const electionsService = new ElectionsService();
