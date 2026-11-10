# Votexa Multi-Tenant Financial Treasury & Double-Entry Ledger

## 1. Accounting Philosophy

Votexa implements a strict **double-entry ledger system** for all financial interactions across tenants:
- All financial balances are stored in **smallest currency units (cents)** to prevent floating-point rounding errors.
- Every balance mutation (`CREDIT` or `DEBIT`) generates an immutable entry in the `financial_ledger` table with `balance_after`.
- No wallet balance can ever be directly overwritten via `UPDATE ... SET available_balance = X` without an atomic transaction inserting a corresponding audit row.
- **Overdraft Prevention:** Any withdrawal, refund, or payout that exceeds `available_balance` is rejected with `INSUFFICIENT_FUNDS` (status 400).

---

## 2. Ledger Transaction Types

| Type | Direction | Trigger | Description |
|---|---|---|---|
| `CREDIT` | + Inflow | Package subscription, paid voting ticket | Adds cleared funds to tenant wallet |
| `DEBIT` | - Outflow | Payout disbursement, subscription renewal | Deducts funds from tenant wallet |
| `PLATFORM_FEE`| - Fee | Revenue split deduction | Votexa platform commission |
| `PAYOUT` | - Outflow | Bank account withdrawal | Cleared withdrawal to connected account |
| `REFUND` | - Outflow | Dispute or election cancellation | Reversal of a prior credit |

---

## 3. Stripe & Checkout Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Organization Admin
    participant Client as React Client (Frontend)
    participant API as Payments Controller
    participant Engine as Wallets & Ledger Service
    participant Stripe as Stripe Gateway

    Admin->>Client: Select Package (Standard: $49, Enterprise: $199)
    Client->>API: POST /api/v1/payments/checkout { packageId }
    API->>Stripe: Create Checkout Session
    Stripe-->>API: { sessionId, checkoutUrl }
    API-->>Client: Return Session Details
    Client->>API: POST /api/v1/payments/confirm { packageId, sessionId }
    API->>Engine: creditWallet(organizationId, amountCents, description, paymentId)
    Engine->>Engine: UPDATE wallets SET available_balance = balance + amount
    Engine->>Engine: INSERT INTO financial_ledger (type: CREDIT, amount, balance_after)
    Engine-->>Client: 201 Created { transaction, updatedWallet }
    Client-->>Admin: Show Treasury Vault Updated Banner
```

