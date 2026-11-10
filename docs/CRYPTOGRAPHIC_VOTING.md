# Votexa Cryptographic Voting Protocol & Security Guarantees

## 1. Overview & Guarantees
The **Votexa Cryptographic Voting Engine** provides four essential guarantees required for high-stakes institutional elections:
1. **Eligibility & Single-Vote Enforcement:** Only verified voters with active, valid credentials can cast a ballot, and no voter can cast more than once.
2. **Voter Anonymity:** The voter's physical identity (name, email) is cryptographically decoupled from their cast selections using an HMAC-SHA-256 one-way voter hash.
3. **Individual Verifiability:** Voters receive a unique cryptographic receipt code (e.g. `VTX-XXXX-XXXX-XXXX-XXXX`) allowing them to verify their ballot was registered in the official ledger.
4. **Universal Verifiability & Tamper Evidence:** Any modification to candidate choices or timestamps invalidates the digital signature.

---

## 2. Cryptographic Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Voter as Verified Voter
    participant Client as React Client (Frontend)
    participant Engine as Voting Service & Crypto Engine
    participant DB as PostgreSQL Transactional Ledger

    Voter->>Client: Input Voter Code (VTR-XXXX) & Select Candidate
    Client->>Engine: POST /api/v1/voting/cast { electionId, voterCode, selections }
    Engine->>DB: Check Election Status (ACTIVE) & Window
    Engine->>DB: SELECT FOR UPDATE on voters WHERE voter_code = $1
    alt Already Voted
        DB-->>Engine: has_voted == true
        Engine-->>Client: 409 Conflict (ALREADY_VOTED)
    else Eligible
        Engine->>Engine: computeVoterHash(voterCode, electionId)
        Engine->>Engine: generateBallotReceipt(payload, HMAC-SHA-256)
        Engine->>DB: UPDATE voters SET has_voted = TRUE
        Engine->>DB: INSERT INTO votes (voter_hash, signature, cast_at)
        Engine->>DB: COMMIT TRANSACTION
        Engine-->>Client: 201 Created { receiptCode, signature, castAt }
        Client-->>Voter: Display Cryptographic Receipt & Copy Button
    end
```

---

## 3. Double-Voting Prevention

Double voting is prevented through three defensive layers:
1. **Database Row Lock:** `SELECT ... FOR UPDATE` acquires an exclusive lock on the voter's record for the duration of the transaction.
2. **Atomic State Transition:** `UPDATE voters SET has_voted = TRUE WHERE has_voted = FALSE` guarantees that concurrent requests cannot both succeed.
3. **Database Unique Constraints:** Unique composite index on `votes(election_id, voter_hash)` prevents any duplicate ballot insertion at the database storage engine layer.

