# Votexa Multi-Tenancy Architecture & Security Blueprint

## 1. Multi-Tenancy Strategy

Votexa employs a **Shared Database, Isolated Logical Schema** model with explicit tenant discriminators (`organization_id`) and Row-Level Security (RLS) readiness.

### Key Tenets
1. **Zero Tenant Bleed:** No query across tenant boundaries is ever executed without an explicit `organization_id` constraint.
2. **Deterministic Context Extraction:** The active tenant is extracted on every inbound request and pinned to `req.tenant`.
3. **Defense in Depth:** Even if a malicious request attempts to inject another tenant's entity ID in the path, the query scopes strictly to `WHERE id = $1 AND organization_id = $2`.

---

## 2. Request Lifecycle & Context Resolution

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client (Frontend)
    participant Gateway as Express Gateway / Security Middleware
    participant TenantMid as TenantContext Middleware
    participant Service as Domain Module Service
    participant DB as PostgreSQL Database

    Client->>Gateway: HTTP Request (Bearer Token + X-Organization-Id)
    Gateway->>Gateway: Validate CORS, Helmet, Rate Limits
    Gateway->>Gateway: Authenticate Token via Supabase Auth
    Gateway->>TenantMid: Forward Request with req.user
    TenantMid->>TenantMid: Validate X-Organization-Id & user membership
    TenantMid->>Service: Set req.tenant = { organizationId }
    Service->>DB: SELECT * FROM elections WHERE organization_id = $1
    DB-->>Service: Return isolated tenant records
    Service-->>Client: Standardized ApiResponse envelope
```

---

## 3. Organization Role Hierarchy

```mermaid
flowchart TD
    SA["System SUPER_ADMIN\n(Platform Infrastructure)"]
    OWNER["ORG_OWNER\n(Billing, Payouts, Elections, Members)"]
    ADMIN["ORG_ADMIN\n(Elections, Candidates, Voters)"]
    AUDITOR["ORG_AUDITOR\n(Read-Only Audit Logs & Tally Verification)"]
    MEMBER["ORG_MEMBER\n(Read-Only Dashboard)"]
    VOTER["VOTER\n(Cast Ballot with Voter Code)"]

    SA --> OWNER
    OWNER --> ADMIN
    ADMIN --> AUDITOR
    ADMIN --> MEMBER
    ADMIN --> VOTER
```

