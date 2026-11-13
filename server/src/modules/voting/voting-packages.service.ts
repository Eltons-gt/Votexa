import crypto from 'crypto';
import {
  VotingPackage,
  ElectionCategory,
  CreateVotingPackageRequest
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';
import { pool } from '../../database/db.js';
import { electionsService } from '../elections/elections.service.js';

export class VotingPackagesService {
  private static localPackages = new Map<string, VotingPackage[]>();

  constructor() {
    this.seedDefaultPackages();
  }

  private seedDefaultPackages() {
    if (VotingPackagesService.localPackages.size > 0) return;

    // Seed packages for Metropolitan Talent Showcase (elec-paid-1)
    VotingPackagesService.localPackages.set('elec-paid-1', [
      {
        id: 'pkg-1',
        organizationId: 'org-metro-uni',
        electionId: 'elec-paid-1',
        name: 'Single Fan Vote',
        credits: 1,
        priceCents: 100, // $1.00
        currency: 'USD',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pkg-2',
        organizationId: 'org-metro-uni',
        electionId: 'elec-paid-1',
        name: 'Supporter 5-Pack',
        credits: 5,
        priceCents: 450, // $4.50 (10% discount)
        currency: 'USD',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'pkg-3',
        organizationId: 'org-metro-uni',
        electionId: 'elec-paid-1',
        name: 'Superfan 20-Pack',
        credits: 20,
        priceCents: 1600, // $16.00 (20% discount)
        currency: 'USD',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }

  /**
   * List active packages for an election.
   */
  async listPackages(organizationId: string, electionId: string): Promise<VotingPackage[]> {
    const election = await electionsService.getElectionById(organizationId, electionId);

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        const res = await client.query(
          `SELECT * FROM voting_packages
           WHERE election_id = $1 AND organization_id = $2 AND is_active = TRUE
           ORDER BY price_cents ASC`,
          [electionId, organizationId]
        );

        if (res.rows.length === 0 && (election.category === ElectionCategory.PAID_COMPETITION || election.isPaidVoting)) {
          const unitPrice = 1000; // 1000 KES cents = KES 10
          const curr = 'KES';
          const defaultTiers = [
            { name: 'Single Vote', credits: 1, priceCents: unitPrice },
            { name: 'Supporter 5-Pack', credits: 5, priceCents: Math.round(unitPrice * 4.5) },
            { name: 'Fan Supporter 10-Pack', credits: 10, priceCents: Math.round(unitPrice * 8.5) },
            { name: 'Superfan 20-Pack', credits: 20, priceCents: Math.round(unitPrice * 16.0) }
          ];

          const seeded: VotingPackage[] = [];
          for (const tier of defaultTiers) {
            const pkgId = crypto.randomUUID();
            const now = new Date().toISOString();
            await client.query(
              `INSERT INTO voting_packages (id, organization_id, election_id, name, credits, price_cents, currency, is_active, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, $8, $8)`,
              [pkgId, organizationId, electionId, tier.name, tier.credits, tier.priceCents, curr, now]
            );
            seeded.push({
              id: pkgId,
              organizationId,
              electionId,
              name: tier.name,
              credits: tier.credits,
              priceCents: tier.priceCents,
              currency: curr,
              isActive: true,
              createdAt: now,
              updatedAt: now
            });
          }
          return seeded;
        }

        return res.rows.map((r) => this.mapDbPackage(r));
      } finally {
        client.release();
      }
    } catch {
      let list = VotingPackagesService.localPackages.get(electionId) || [];
      if (list.length === 0 && (election.category === ElectionCategory.PAID_COMPETITION || election.isPaidVoting)) {
        const now = new Date().toISOString();
        list = [
          {
            id: `pkg-default-1-${electionId}`,
            organizationId,
            electionId,
            name: 'Single Vote',
            credits: 1,
            priceCents: 1000,
            currency: 'KES',
            isActive: true,
            createdAt: now,
            updatedAt: now
          },
          {
            id: `pkg-default-2-${electionId}`,
            organizationId,
            electionId,
            name: 'Supporter 5-Pack',
            credits: 5,
            priceCents: 4500,
            currency: 'KES',
            isActive: true,
            createdAt: now,
            updatedAt: now
          },
          {
            id: `pkg-default-3-${electionId}`,
            organizationId,
            electionId,
            name: 'Fan Supporter 10-Pack',
            credits: 10,
            priceCents: 8500,
            currency: 'KES',
            isActive: true,
            createdAt: now,
            updatedAt: now
          }
        ];
        VotingPackagesService.localPackages.set(electionId, list);
      }
      return list.filter((p) => p.isActive);
    }
  }

  /**
   * Create a voting package for an election.
   * Institutional elections cannot have packages!
   */
  async createPackage(
    organizationId: string,
    _userId: string,
    req: CreateVotingPackageRequest
  ): Promise<VotingPackage> {
    const election = await electionsService.getElectionById(organizationId, req.electionId);

    if (election.category === ElectionCategory.INSTITUTIONAL) {
      throw new AppError(
        'Institutional elections do not support paid voting packages or credits',
        400,
        'INSTITUTIONAL_PAID_VOTING_FORBIDDEN'
      );
    }

    if (!req.name || req.name.trim().length === 0) {
      throw new AppError('Package name is required', 400, 'INVALID_PACKAGE_NAME');
    }

    if (!req.credits || req.credits <= 0) {
      throw new AppError('Package credits must be greater than 0', 400, 'INVALID_CREDITS');
    }

    if (req.priceCents === undefined || req.priceCents < 0) {
      throw new AppError('Price in cents must be >= 0', 400, 'INVALID_PRICE');
    }

    const pkgId = `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newPackage: VotingPackage = {
      id: pkgId,
      organizationId,
      electionId: req.electionId,
      name: req.name.trim(),
      credits: req.credits,
      priceCents: req.priceCents,
      currency: req.currency || 'USD',
      isActive: req.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };

    try {
      const client = await pool.connect();
      try {
        await client.query("SELECT set_config('app.current_organization_id', $1, false)", [organizationId]);
        await client.query(
          `INSERT INTO voting_packages (
            id, organization_id, election_id, name, credits,
            price_cents, currency, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            newPackage.id,
            newPackage.organizationId,
            newPackage.electionId,
            newPackage.name,
            newPackage.credits,
            newPackage.priceCents,
            newPackage.currency,
            newPackage.isActive,
            now,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = VotingPackagesService.localPackages.get(req.electionId) || [];
      list.push(newPackage);
      VotingPackagesService.localPackages.set(req.electionId, list);
    }

    return newPackage;
  }

  /**
   * Get a package by ID.
   */
  async getPackageById(organizationId: string, electionId: string, packageId: string): Promise<VotingPackage> {
    const packages = await this.listPackages(organizationId, electionId);
    const found = packages.find((p) => p.id === packageId);
    if (!found) {
      throw new AppError('Voting package not found', 404, 'PACKAGE_NOT_FOUND');
    }
    return found;
  }

  private mapDbPackage(row: Record<string, unknown>): VotingPackage {
    return {
      id: row.id as string,
      organizationId: row.organization_id as string,
      electionId: row.election_id as string,
      name: row.name as string,
      credits: Number(row.credits),
      priceCents: Number(row.price_cents),
      currency: row.currency as string,
      isActive: Boolean(row.is_active),
      createdAt: (row.created_at as Date).toISOString ? (row.created_at as Date).toISOString() : (row.created_at as string),
      updatedAt: (row.updated_at as Date).toISOString ? (row.updated_at as Date).toISOString() : (row.updated_at as string)
    };
  }
}

export const votingPackagesService = new VotingPackagesService();

