import { describe, it, expect } from 'vitest';
import { votingService } from './voting.service.js';
import { VotingCrypto } from './voting.crypto.js';
import { AppError } from '../../utils/apiResponse.js';

describe('Phase 2 Cryptographic Voting Engine', () => {
  const electionId = 'elec-1';
  const ballotId = 'ballot-1';

  it('should successfully cast a ballot and return a cryptographic receipt', async () => {
    const voterCode = 'VTR-DEMO-TEST';
    const selections = [{ questionId: 'q-1', optionId: 'opt-1', candidateId: 'cand-1' }];

    const receipt = await votingService.castVote({
      electionId,
      ballotId,
      voterCode,
      selections
    });

    expect(receipt).toBeDefined();
    expect(receipt.receiptCode).toMatch(/^VTX-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(receipt.signature).toBeDefined();
    expect(receipt.verified).toBe(true);
    expect(receipt.electionId).toBe(electionId);
    expect(receipt.voterHash).toBeDefined();
  });

  it('should prevent double-voting and throw ALREADY_VOTED (409)', async () => {
    const voterCode = 'VTR-DEMO-TEST';
    const selections = [{ questionId: 'q-1', optionId: 'opt-2', candidateId: 'cand-2' }];

    await expect(
      votingService.castVote({
        electionId,
        ballotId,
        voterCode,
        selections
      })
    ).rejects.toThrowError(AppError);

    try {
      await votingService.castVote({ electionId, ballotId, voterCode, selections });
    } catch (err: any) {
      expect(err.code).toBe('ALREADY_VOTED');
      expect(err.statusCode).toBe(409);
    }
  });

  it('should reject unauthorized or unknown voter codes with VOTER_NOT_FOUND (404)', async () => {
    await expect(
      votingService.castVote({
        electionId,
        ballotId,
        voterCode: 'VTR-FAKE-UNKNOWN',
        selections: [{ questionId: 'q-1', optionId: 'opt-1' }]
      })
    ).rejects.toThrowError(AppError);
  });

  it('should reject empty ballot selections with EMPTY_BALLOT_SELECTIONS (400)', async () => {
    await expect(
      votingService.castVote({
        electionId,
        ballotId,
        voterCode: 'VTR-9981-METRO',
        selections: []
      })
    ).rejects.toThrowError(AppError);
  });

  it('should verify an authentic cryptographic receipt', async () => {
    const voterHash = VotingCrypto.computeVoterHash('VTR-SAMPLE', electionId);
    const selections = [{ questionId: 'q-1', optionId: 'opt-1' }];
    const castAt = new Date().toISOString();

    const receipt = VotingCrypto.generateBallotReceipt(electionId, ballotId, voterHash, selections, castAt);
    const isValid = VotingCrypto.verifyBallotReceipt(receipt, selections);

    expect(isValid).toBe(true);

    // Tampered selections must fail verification
    const tamperedSelections = [{ questionId: 'q-1', optionId: 'opt-tampered' }];
    const isTamperedValid = VotingCrypto.verifyBallotReceipt(receipt, tamperedSelections);
    expect(isTamperedValid).toBe(false);
  });

  it('should aggregate election tally accurately', async () => {
    const tally = await votingService.getElectionTally(electionId);
    expect(tally).toBeDefined();
    expect(tally.electionId).toBe(electionId);
    expect(tally.totalVotesCast).toBeGreaterThanOrEqual(1);
    expect(tally.candidates.length).toBeGreaterThan(0);
  });
});

