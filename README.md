# Votexa | Multi-Tenant Third-Party Voting SaaS Platform

[![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v18+-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5+-blue.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v3+-38bdf8.svg)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15+-336791.svg)](https://www.postgresql.org)
[![Supabase](https://img.shields.io/badge/Auth-Supabase-3ecf8e.svg)](https://supabase.com)

**Votexa** is an enterprise-grade multi-tenant third-party voting SaaS platform designed to deliver secure, transparent, and auditable election management for universities, student unions, corporate boards, and civic institutions.

---

## Architecture Overview

```
Votexa/
├── client/                     # Feature-Based Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── components/ui/      # shadcn/ui accessible component primitives
│   │   ├── features/           # Feature modules:
│   │   │   ├── administration/ # Platform governance & metrics
│   │   │   ├── authentication/ # Supabase auth integration & forms
│   │   │   ├── candidates/     # Candidate cards & rosters
│   │   │   ├── elections/      # Election management & cards
│   │   │   ├── organizations/  # Multi-tenant overview & switcher
│   │   │   ├── payments/       # SaaS pricing packages & checkout preview
│   │   │   ├── payouts/        # Payout disbursement tables & forms
│   │   │   ├── revenue/        # Financial KPIs & revenue breakdown
│   │   │   ├── voters/         # Voter directory & verification
│   │   │   ├── voting/         # Official ballot preview & voting interface
│   │   │   └── wallets/        # Treasury balance & flow tracker
│   │   ├── lib/                # API client, supabase instance, utils
│   │   ├── App.tsx             # Interactive application shell
│   │   └── main.tsx            # Frontend entry point
│   └── vite.config.ts          # Vite build config with path aliases
│
├── server/                     # Modular Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # Environment validation with safe defaults
│   │   ├── database/           # PostgreSQL pool & migration runner
│   │   │   ├── migrations/     # Transactional SQL migration scripts
│   │   │   └── migrate.ts      # Automated migration runner
│   │   ├── middleware/         # Security, Auth, TenantContext, ErrorHandler
│   │   ├── modules/            # 19 Modular Domain Modules:
│   │   │   ├── admin           ├── elections       ├── packages      ├── users
│   │   │   ├── audit           ├── financial-ledger├── payments      ├── voters
│   │   │   ├── auth            ├── notifications   ├── payouts       ├── voting
│   │   │   ├── ballot          ├── organization-members ├── refunds  └── wallets
│   │   │   ├── candidates      ├── organizations   ├── reports
│   │   │   └── revenue
│   │   ├── utils/              # Standardized API response formatters & AppError
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server entry point
│   └── vitest.config.ts        # Automated backend test suite
│
├── shared/                     # Shared DTOs, Enums, and API Contracts
│   ├── src/index.ts            # Type contracts used across client and server
│   └── tsconfig.json
│
├── docs/                       # Comprehensive Architecture Documentation
│   ├── ARCHITECTURE.md         # System design, data flow & security
│   ├── API_CONVENTIONS.md      # Envelopes, status codes, endpoints catalog
│   ├── DATABASE_SCHEMA.md      # PostgreSQL tables, ER diagram & indexing
│   └── MULTI_TENANCY.md        # Tenant isolation & RBAC model
│
├── .env.example                # Root environment variable template
├── .gitignore                  # Git ignore rules protecting secrets & build artifacts
├── tsconfig.base.json          # Consistent baseline TypeScript configuration
└── package.json                # Root monorepo workspace scripts
```

---

## Quick Start & Development Setup

### 1. Prerequisites
- **Node.js**: `v20.0.0` or higher (verified with `v22.18.0`)
- **npm**: `v10.0.0` or higher (verified with `10.9.3`)
- **PostgreSQL**: Local or cloud PostgreSQL instance (optional for initial frontend/mock testing)

### 2. Install Dependencies
From the repository root:
```bash
npm install
```

### 3. Environment Configuration
Copy the template `.env.example` to `.env` in the root (or in `server/.env` and `client/.env`):
```bash
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 4. Build Shared Types & Packages
```bash
npm run build:shared
```

### 5. Run Database Migrations
When your PostgreSQL instance is running:
```bash
npm run db:migrate
```

### 6. Start Development Servers
Run both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
# Server only
npm run dev:server

# Client only
npm run dev:client
```

---

## Automated Testing

Run the automated test suites across all workspaces:
```bash
npm test
```

Individual test execution:
```bash
# Server tests (Vitest)
npm run test:server

# Client tests (Vitest)
npm run test:client
```

---

## TypeScript Consistency & Typecheck

Check type safety across the entire monorepo without emitting code:
```bash
npm run lint
```

Or perform production builds:
```bash
npm run build
```

---

## Phase 1 Acceptance Verification

- [x] **Repository Assessment**: Inspected repository state; verified clean origin and zero technical debt.
- [x] **Frontend Architecture**: Established feature-based React + Vite + TypeScript structure with Tailwind CSS & shadcn/ui components.
- [x] **Backend Architecture**: Established 19 modular Express domain modules with centralized routing, error handling, and multi-tenant isolation middleware.
- [x] **Database Migration Foundation**: Built transactional SQL migration runner and schema (`001_initial_schema.sql`).
- [x] **API Conventions**: Unified `{ success, data, error, meta, timestamp, requestId }` envelope and `AppError` class.
- [x] **Secret Isolation**: Frontend is strictly restricted to `VITE_` variables; backend secrets are completely decoupled.
- [x] **Automated Tests**: Vitest configured with passing test suites.
- [x] **Phase 2 Scope Preserved**: Voting and payment engines are established as modular contracts/skeletons ready for implementation in Phase 2.

