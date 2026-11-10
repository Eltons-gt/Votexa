import { describe, it, expect } from 'vitest';
import { electionsService } from './elections.service.js';
import { positionsService } from './positions.service.js';
import { candidatesService } from '../candidates/candidates.service.js';
import { votersService } from '../voters/voters.service.js';
import {
  ElectionCategory,
  ElectionStatus,
  ResultsVisibility,
  CandidateStatus,
  VoterEligibilityStatus
} from '@votexa/shared';
import { AppError } from '../../utils/apiResponse.js';

describe('Election Management Module', () => {
  const orgA = 'org-metro-uni';
  const orgB = 'org-starlight-col';
  const userId = 'usr-demo-owner';

  describe('1. Institutional Elections & Restrictions', () => {
    it('creates an institutional election with default single-vote rules and voter verification required', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Faculty Senate Executive Election',
        description: 'Annual election for faculty representatives.',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        timezone: 'America/New_York'
      });

      expect(election.id).toBeDefined();
      expect(election.category).toBe(ElectionCategory.INSTITUTIONAL);
      expect(election.isPaidVoting).toBe(false);
      expect(election.status).toBe(ElectionStatus.DRAFT);
      expect(election.settings?.allowMultipleVotes).toBe(false);
      expect(election.settings?.maxVotesPerVoter).toBe(1);
      expect(election.settings?.requireVoterVerification).toBe(true);
    });

    it('strictly forbids enabling paid voting on institutional elections', async () => {
      await expect(
        electionsService.createElection(orgA, userId, {
          category: ElectionCategory.INSTITUTIONAL,
          title: 'Illegal Paid Student Vote',
          startTime: new Date(Date.now() + 3600000).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
          isPaidVoting: true
        })
      ).rejects.toThrowError(AppError);

      try {
        await electionsService.createElection(orgA, userId, {
          category: ElectionCategory.INSTITUTIONAL,
          title: 'Illegal Paid Student Vote',
          startTime: new Date(Date.now() + 3600000).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
          isPaidVoting: true
        });
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INSTITUTIONAL_PAID_VOTING_FORBIDDEN');
        expect(appErr.statusCode).toBe(400);
      }
    });

    it('strictly forbids multiple votes per voter on institutional elections', async () => {
      try {
        await electionsService.createElection(orgA, userId, {
          category: ElectionCategory.INSTITUTIONAL,
          title: 'Illegal Multi-Vote Institutional Election',
          startTime: new Date(Date.now() + 3600000).toISOString(),
          endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
          settings: {
            allowMultipleVotes: true,
            maxVotesPerVoter: 5
          }
        });
      } catch (err) {
        const appErr = err as AppError;
        expect(appErr.code).toBe('INSTITUTIONAL_SINGLE_VOTE_ONLY');
        expect(appErr.statusCode).toBe(400);
      }
    });

    it('enforces backend eligibility verification: unregistered voter is rejected', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Honor Society Council',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });
      await electionsService.transitionStatus(orgA, election.id, userId, ElectionStatus.ACTIVE);

      const verification = await votersService.verifyVoterEligibility(orgA, election.id, {
        voterCode: 'UNREGISTERED_VOTER_XYZ'
      });

      expect(verification.isEligible).toBe(false);
      expect(verification.remainingVotesAllowed).toBe(0);
      expect(verification.reason).toContain('not registered');
    });

    it('enforces backend eligibility verification: registered voter is allowed exactly 1 vote and denied double voting', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Alumni Association Board',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        settings: {
          allowedDomains: ['@metro.edu']
        }
      });
      await electionsService.transitionStatus(orgA, election.id, userId, ElectionStatus.ACTIVE);

      const voter = await votersService.registerVoter(orgA, election.id, {
        email: 'alumni.carter@metro.edu',
        firstName: 'Carter',
        lastName: 'Evans',
        eligibilityTag: 'Class of 2020'
      });

      // 1st Check: Eligible
      const check1 = await votersService.verifyVoterEligibility(orgA, election.id, {
        voterCode: voter.voterCode
      });
      expect(check1.isEligible).toBe(true);
      expect(check1.remainingVotesAllowed).toBe(1);

      // Simulate voter having voted
      voter.hasVoted = true;

      // 2nd Check: Blocked
      const check2 = await votersService.verifyVoterEligibility(orgA, election.id, {
        voterCode: voter.voterCode
      });
      expect(check2.isEligible).toBe(false);
      expect(check2.remainingVotesAllowed).toBe(0);
      expect(check2.reason).toContain('Ballot already cast');
    });

    it('enforces institutional email domain restrictions upon voter registration', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Medical School Dean Election',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        settings: {
          allowedDomains: ['@metro.edu', '@university.edu']
        }
      });

      // Invalid domain registration rejected
      await expect(
        votersService.registerVoter(orgA, election.id, {
          email: 'intruder@external-mail.com',
          firstName: 'Bad',
          lastName: 'Actor'
        })
      ).rejects.toThrowError('Voter email domain must match');
    });
  });

  describe('2. Paid Competitions & Rules', () => {
    it('creates a paid competition with multiple votes enabled and price per vote', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.PAID_COMPETITION,
        title: 'Statewide Collegiate Battle of the Bands',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 5).toISOString(),
        settings: {
          resultsVisibility: ResultsVisibility.LIVE,
          allowMultipleVotes: true,
          maxVotesPerVoter: 20,
          votePriceCents: 200 // $2.00 per vote
        }
      });

      expect(election.category).toBe(ElectionCategory.PAID_COMPETITION);
      expect(election.isPaidVoting).toBe(true);
      expect(election.settings?.allowMultipleVotes).toBe(true);
      expect(election.settings?.maxVotesPerVoter).toBe(20);
      expect(election.settings?.votePriceCents).toBe(200);
    });

    it('enforces configured voting limits in paid competitions', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.PAID_COMPETITION,
        title: 'Campus Idol 2026',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        settings: {
          allowMultipleVotes: true,
          maxVotesPerVoter: 5
        }
      });
      await electionsService.transitionStatus(orgA, election.id, userId, ElectionStatus.ACTIVE);

      const voter = await votersService.registerVoter(orgA, election.id, {
        email: 'fan@musiclover.com'
      });

      voter.votesCastCount = 3;
      const check1 = await votersService.verifyVoterEligibility(orgA, election.id, {
        voterCode: voter.voterCode
      });
      expect(check1.isEligible).toBe(true);
      expect(check1.remainingVotesAllowed).toBe(2);

      voter.votesCastCount = 5;
      const check2 = await votersService.verifyVoterEligibility(orgA, election.id, {
        voterCode: voter.voterCode
      });
      expect(check2.isEligible).toBe(false);
      expect(check2.remainingVotesAllowed).toBe(0);
      expect(check2.reason).toContain('Maximum configured vote limit');
    });
  });

  describe('3. Public Opinion Polls & Configurable Policies', () => {
    it('creates a public poll with customizable visibility and participation settings', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.PUBLIC_POLL,
        title: 'Campus Dining Service Quality Poll',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
        allowSelfRegistration: true,
        settings: {
          resultsVisibility: ResultsVisibility.LIVE,
          requireVoterVerification: false
        }
      });

      expect(election.category).toBe(ElectionCategory.PUBLIC_POLL);
      expect(election.allowSelfRegistration).toBe(true);
      expect(election.settings?.resultsVisibility).toBe(ResultsVisibility.LIVE);
      expect(election.settings?.requireVoterVerification).toBe(false);
    });
  });

  describe('4. Lifecycle Management & State Machine Transitions', () => {
    it('allows valid sequential transitions: DRAFT -> SCHEDULED -> ACTIVE -> CLOSED', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Lifecycle Verification Election',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });
      expect(election.status).toBe(ElectionStatus.DRAFT);

      // DRAFT -> SCHEDULED
      const scheduled = await electionsService.transitionStatus(
        orgA,
        election.id,
        userId,
        ElectionStatus.SCHEDULED,
        'Finalized candidate ballot'
      );
      expect(scheduled.status).toBe(ElectionStatus.SCHEDULED);

      // SCHEDULED -> ACTIVE
      const active = await electionsService.transitionStatus(
        orgA,
        election.id,
        userId,
        ElectionStatus.ACTIVE,
        'Polls opened'
      );
      expect(active.status).toBe(ElectionStatus.ACTIVE);

      // ACTIVE -> CLOSED
      const closed = await electionsService.transitionStatus(
        orgA,
        election.id,
        userId,
        ElectionStatus.CLOSED,
        'Polls closed'
      );
      expect(closed.status).toBe(ElectionStatus.CLOSED);

      // Verify audit logs were generated
      const auditLogs = await electionsService.getAuditLogs(orgA, election.id);
      expect(auditLogs.length).toBeGreaterThanOrEqual(4); // Creation + 3 transitions
      const statusChanges = auditLogs.filter((l) => l.action === 'STATUS_CHANGE');
      expect(statusChanges.length).toBe(3);
    });

    it('rejects invalid transitions: CLOSED -> ACTIVE and DRAFT -> CLOSED', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Invalid Transition Election',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });

      // Attempt DRAFT -> CLOSED (invalid without activation)
      await expect(
        electionsService.transitionStatus(orgA, election.id, userId, ElectionStatus.CLOSED)
      ).rejects.toThrowError('Invalid lifecycle transition');

      // Move to ACTIVE then CLOSED
      await electionsService.transitionStatus(orgA, election.id, userId, ElectionStatus.ACTIVE);
      await electionsService.transitionStatus(orgA, election.id, userId, ElectionStatus.CLOSED);

      // Attempt CLOSED -> ACTIVE (cannot reopen closed election)
      await expect(
        electionsService.transitionStatus(orgA, election.id, userId, ElectionStatus.ACTIVE)
      ).rejects.toThrowError('Invalid lifecycle transition');
    });

    it('locks critical voting rules when election is ACTIVE without explicit audit reason', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Rule Lock Election',
        startTime: new Date(Date.now() - 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });
      await electionsService.transitionStatus(orgA, election.id, userId, ElectionStatus.ACTIVE);

      // Attempt to switch category or enable paid voting without audit reason
      await expect(
        electionsService.updateElection(orgA, election.id, userId, {
          category: ElectionCategory.PAID_COMPETITION,
          isPaidVoting: true
        })
      ).rejects.toThrowError('Cannot modify critical voting rules');

      // Permitted with explicit audit reason
      const overridden = await electionsService.updateElection(orgA, election.id, userId, {
        title: 'Rule Lock Election (Audited Adjustment)',
        auditReason: 'Emergency Senate Resolution #42 authorized title correction'
      });
      expect(overridden.title).toBe('Rule Lock Election (Audited Adjustment)');
    });
  });

  describe('5. Positions & Candidate Scoping', () => {
    it('creates positions and candidates bound strictly to the election and position', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Position & Candidate Test Election',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });

      const position = await positionsService.createPosition(orgA, election.id, userId, {
        title: 'Head of Student Welfare',
        description: 'Represents student well-being',
        minSelections: 1,
        maxSelections: 1
      });
      expect(position.id).toBeDefined();
      expect(position.electionId).toBe(election.id);

      const candidate = await candidatesService.createCandidate(orgA, election.id, {
        positionId: position.id,
        name: 'Taylor Rivera',
        bio: 'Dedicated student advocate.',
        manifesto: 'Better dining and campus transit.'
      });
      expect(candidate.id).toBeDefined();
      expect(candidate.positionId).toBe(position.id);
      expect(candidate.status).toBe(CandidateStatus.APPROVED);
    });

    it('rejects registering a candidate to a non-existent or foreign position', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Foreign Position Test Election',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });

      await expect(
        candidatesService.createCandidate(orgA, election.id, {
          positionId: 'pos-non-existent-999',
          name: 'Intruder Candidate'
        })
      ).rejects.toThrowError('The specified position does not exist or belong to this election');
    });
  });

  describe('6. Tenant Isolation', () => {
    it('prevents Organization B from accessing, modifying or transitioning Organization A elections', async () => {
      const electionA = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Secret Org A Election',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });

      // Org B tries to read Org A election
      await expect(
        electionsService.getElectionById(orgB, electionA.id)
      ).rejects.toThrowError('Access denied to this election');

      // Org B tries to modify Org A election
      await expect(
        electionsService.updateElection(orgB, electionA.id, userId, {
          title: 'Hacked Title'
        })
      ).rejects.toThrowError('Access denied to this election');

      // Org B tries to transition Org A election
      await expect(
        electionsService.transitionStatus(orgB, electionA.id, userId, ElectionStatus.ACTIVE)
      ).rejects.toThrowError('Access denied to this election');
    });
  });

  describe('7. Date Validation', () => {
    it('rejects election when endTime is before or equal to startTime', async () => {
      const now = Date.now();
      await expect(
        electionsService.createElection(orgA, userId, {
          category: ElectionCategory.INSTITUTIONAL,
          title: 'Backwards Time Election',
          startTime: new Date(now + 86400000).toISOString(),
          endTime: new Date(now).toISOString()
        })
      ).rejects.toThrowError('End time must be strictly after start time');
    });
  });

  describe('8. Voter Roll CSV Bulk Import', () => {
    it('bulk imports voters and handles duplicates seamlessly', async () => {
      const election = await electionsService.createElection(orgA, userId, {
        category: ElectionCategory.INSTITUTIONAL,
        title: 'Roster Import Election',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString()
      });

      const importResult = await votersService.bulkImportVoters(orgA, election.id, {
        voters: [
          { email: 'student1@metro.edu', firstName: 'Alice', lastName: 'A', eligibilityTag: 'Class 2026' },
          { email: 'student2@metro.edu', firstName: 'Bob', lastName: 'B', eligibilityTag: 'Class 2026' },
          { email: 'student1@metro.edu', firstName: 'Alice Duplicate', lastName: 'A' } // Duplicate
        ]
      });

      expect(importResult.importedCount).toBe(2);
      expect(importResult.skippedCount).toBe(1);
      expect(importResult.voters.length).toBe(2);
      expect(importResult.voters[0]?.voterCode).toMatch(/^VTR-/);
    });
  });
});

