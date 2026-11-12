import crypto from 'crypto';
import {
  ElectionPosition,
  CreatePositionRequest,
  UpdatePositionRequest
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { electionsService } from './elections.service.js';

export class PositionsService {
  private static localPositions = new Map<string, ElectionPosition[]>();

  constructor() {
    this.seedDefaultPositions();
  }

  private seedDefaultPositions() {
    if (PositionsService.localPositions.size > 0) return;

    // Default positions for Metropolitan University Election
    PositionsService.localPositions.set('elec-inst-1', [
      {
        id: 'pos-1',
        electionId: 'elec-inst-1',
        organizationId: 'org-metro-uni',
        title: 'Student Body President',
        description: 'Chief executive leader of the student government association.',
        minSelections: 1,
        maxSelections: 1,
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        candidatesCount: 2
      },
      {
        id: 'pos-2',
        electionId: 'elec-inst-1',
        organizationId: 'org-metro-uni',
        title: 'Executive Vice President',
        description: 'Presides over the student senate and inter-club council.',
        minSelections: 1,
        maxSelections: 1,
        orderIndex: 1,
        createdAt: new Date().toISOString(),
        candidatesCount: 2
      },
      {
        id: 'pos-3',
        electionId: 'elec-inst-1',
        organizationId: 'org-metro-uni',
        title: 'Treasurer & Comptroller',
        description: 'Oversees student activity fee budget allocations and audit disclosures.',
        minSelections: 1,
        maxSelections: 1,
        orderIndex: 2,
        createdAt: new Date().toISOString(),
        candidatesCount: 1
      }
    ]);

    // Positions for Talent Showcase
    PositionsService.localPositions.set('elec-paid-1', [
      {
        id: 'pos-showcase-1',
        electionId: 'elec-paid-1',
        organizationId: 'org-metro-uni',
        title: 'Grand Champion Ensemble',
        description: 'Top overall musical and performing arts ensemble.',
        minSelections: 1,
        maxSelections: 1,
        orderIndex: 0,
        createdAt: new Date().toISOString(),
        candidatesCount: 4
      }
    ]);
  }

  /**
   * List all positions for an election, ensuring tenant scoping.
   */
  async listPositions(organizationId: string, electionId: string): Promise<ElectionPosition[]> {
    // Verifies tenant access to election
    await electionsService.getElectionById(organizationId, electionId);

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        const res = await client.query(
          `SELECT p.*, COUNT(c.id)::int as candidates_count
           FROM election_positions p
           LEFT JOIN candidates c ON c.position_id = p.id
           WHERE p.election_id = $1 AND p.organization_id = $2
           GROUP BY p.id
           ORDER BY p.order_index ASC, p.created_at ASC`,
          [electionId, organizationId]
        );
        return res.rows.map((r) => ({
          id: r.id,
          electionId: r.election_id,
          organizationId: r.organization_id,
          title: r.title,
          description: r.description,
          minSelections: r.min_selections,
          maxSelections: r.max_selections,
          orderIndex: r.order_index,
          createdAt: r.created_at,
          candidatesCount: r.candidates_count
        }));
      } finally {
        client.release();
      }
    } catch {
      return PositionsService.localPositions.get(electionId) || [];
    }
  }

  /**
   * Create a new position in an election.
   */
  async createPosition(
    organizationId: string,
    electionId: string,
    _userId: string,
    req: CreatePositionRequest
  ): Promise<ElectionPosition> {
    await electionsService.getElectionById(organizationId, electionId);

    if (!req.title || req.title.trim().length === 0) {
      throw new AppError('Position title is required', 400, 'INVALID_POSITION_TITLE');
    }

    const minSelections = req.minSelections ?? 1;
    const maxSelections = req.maxSelections ?? 1;

    if (minSelections < 1 || maxSelections < minSelections) {
      throw new AppError(
        'Invalid selections range: min selections must be >= 1 and max must be >= min',
        400,
        'INVALID_SELECTION_RANGE'
      );
    }

    const posId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newPosition: ElectionPosition = {
      id: posId,
      electionId,
      organizationId,
      title: req.title.trim(),
      description: req.description || '',
      minSelections,
      maxSelections,
      orderIndex: req.orderIndex ?? 0,
      createdAt: now,
      candidatesCount: 0
    };

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `INSERT INTO election_positions (
            id, election_id, organization_id, title, description,
            min_selections, max_selections, order_index, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            newPosition.id,
            newPosition.electionId,
            newPosition.organizationId,
            newPosition.title,
            newPosition.description,
            newPosition.minSelections,
            newPosition.maxSelections,
            newPosition.orderIndex,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = PositionsService.localPositions.get(electionId) || [];
      list.push(newPosition);
      PositionsService.localPositions.set(electionId, list);
    }

    return newPosition;
  }

  /**
   * Update an existing position.
   */
  async updatePosition(
    organizationId: string,
    electionId: string,
    positionId: string,
    req: UpdatePositionRequest
  ): Promise<ElectionPosition> {
    await electionsService.getElectionById(organizationId, electionId);

    const positions = await this.listPositions(organizationId, electionId);
    const existing = positions.find((p) => p.id === positionId);
    if (!existing) {
      throw new AppError('Position not found', 404, 'POSITION_NOT_FOUND');
    }

    const minSelections = req.minSelections !== undefined ? req.minSelections : existing.minSelections;
    const maxSelections = req.maxSelections !== undefined ? req.maxSelections : existing.maxSelections;

    if (minSelections < 1 || maxSelections < minSelections) {
      throw new AppError('Invalid selections range', 400, 'INVALID_SELECTION_RANGE');
    }

    const updated: ElectionPosition = {
      ...existing,
      title: req.title ? req.title.trim() : existing.title,
      description: req.description !== undefined ? req.description : existing.description,
      minSelections,
      maxSelections,
      orderIndex: req.orderIndex !== undefined ? req.orderIndex : existing.orderIndex
    };

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `UPDATE election_positions SET
            title = $1, description = $2, min_selections = $3,
            max_selections = $4, order_index = $5
          WHERE id = $6 AND election_id = $7 AND organization_id = $8`,
          [
            updated.title,
            updated.description,
            updated.minSelections,
            updated.maxSelections,
            updated.orderIndex,
            positionId,
            electionId,
            organizationId
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = PositionsService.localPositions.get(electionId) || [];
      const idx = list.findIndex((p) => p.id === positionId);
      if (idx !== -1) {
        list[idx] = updated;
        PositionsService.localPositions.set(electionId, list);
      }
    }

    return updated;
  }

  /**
   * Delete a position.
   */
  async deletePosition(organizationId: string, electionId: string, positionId: string): Promise<void> {
    await electionsService.getElectionById(organizationId, electionId);

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `DELETE FROM election_positions WHERE id = $1 AND election_id = $2 AND organization_id = $3`,
          [positionId, electionId, organizationId]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = PositionsService.localPositions.get(electionId) || [];
      PositionsService.localPositions.set(
        electionId,
        list.filter((p) => p.id !== positionId)
      );
    }
  }
}

export const positionsService = new PositionsService();

