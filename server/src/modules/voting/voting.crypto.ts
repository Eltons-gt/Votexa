import crypto from 'crypto';
import { VoteSelection, VoteReceipt } from '@votexa/shared';
import { config } from '../../config/index.js';

export class VotingCrypto {
  private static readonly SECRET_SALT = config.jwt.secret || 'votexa-crypto-ballot-salt-key';

  /**
   * Generates a deterministic one-way voter hash.
   * This decouples the voter's physical identity (email/name) from their cast ballot
   * while providing a tamper-evident audit proof that the ballot belonged to a legitimate voter.
   */
  static computeVoterHash(voterCode: string, electionId: string): string {
    return crypto
      .createHmac('sha256', this.SECRET_SALT)
      .update(`${electionId}:${voterCode.trim().toUpperCase()}`)
      .digest('hex');
  }

  /**
   * Generates a tamper-evident cryptographic receipt for the voter.
   * Includes ballot selections, timestamp, election ID, and a digital HMAC signature.
   */
  static generateBallotReceipt(
    electionId: string,
    ballotId: string,
    voterHash: string,
    selections: VoteSelection[],
    castAt: string
  ): VoteReceipt {
    const rawPayload = JSON.stringify({
      electionId,
      ballotId,
      voterHash,
      selections: selections.sort((a, b) => a.questionId.localeCompare(b.questionId)),
      castAt
    });

    const encryptedPayload = crypto
      .createHmac('sha256', this.SECRET_SALT)
      .update(rawPayload)
      .digest('hex');

    // Receipt Code: Compact base32/hex token that the voter can store (e.g. "VTX-RECEIPT-XXXX-XXXX")
    const shortDigest = encryptedPayload.substring(0, 16).toUpperCase();
    const receiptCode = `VTX-${shortDigest.slice(0, 4)}-${shortDigest.slice(4, 8)}-${shortDigest.slice(8, 12)}-${shortDigest.slice(12, 16)}`;

    return {
      receiptCode,
      electionId,
      ballotId,
      voterHash,
      castAt,
      signature: encryptedPayload,
      verified: true
    };
  }

  /**
   * Verifies the authenticity of a receipt against expected ballot data.
   */
  static verifyBallotReceipt(
    receipt: VoteReceipt,
    selections: VoteSelection[]
  ): boolean {
    const computed = this.generateBallotReceipt(
      receipt.electionId,
      receipt.ballotId,
      receipt.voterHash,
      selections,
      receipt.castAt
    );
    return computed.signature === receipt.signature;
  }
}

