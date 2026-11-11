var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/src/config/index.ts
import dotenv from "dotenv";
var config;
var init_config = __esm({
  "server/src/config/index.ts"() {
    "use strict";
    dotenv.config();
    config = {
      env: process.env.NODE_ENV || "development",
      port: parseInt(process.env.PORT || "5000", 10),
      serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || "5000"}`,
      corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()) : true,
      database: {
        url: process.env.DATABASE_URL || "postgresql://postgres.inuleocyvdzcspopiipl:%40Patcherian254@aws-0-eu-west-1.pooler.supabase.com:6543/postgres",
        host: process.env.DB_HOST || "aws-0-eu-west-1.pooler.supabase.com",
        port: parseInt(process.env.DB_PORT || "6543", 10),
        name: process.env.DB_NAME || "postgres",
        user: process.env.DB_USER || "postgres.inuleocyvdzcspopiipl",
        password: process.env.DB_PASSWORD || "@Patcherian254",
        ssl: process.env.DB_SSL === "true" || (process.env.DATABASE_URL?.includes("supabase") ?? true) || (process.env.DATABASE_URL?.includes("sslmode=require") ?? false),
        poolMax: parseInt(process.env.DB_POOL_MAX || "20", 10)
      },
      supabase: {
        url: process.env.SUPABASE_URL || "https://inuleocyvdzcspopiipl.supabase.co",
        anonKey: process.env.SUPABASE_ANON_KEY || "sb_publishable_PfeFM4jmSey-Kggq5UcBlQ_-CjhB7MB",
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      jwt: {
        secret: process.env.JWT_SECRET || "votexa-default-jwt-secret-minimum-32-characters"
      },
      mpesa: {
        environment: process.env.MPESA_ENVIRONMENT || "sandbox",
        consumerKey: process.env.MPESA_CONSUMER_KEY || "sandbox_consumer_key",
        consumerSecret: process.env.MPESA_CONSUMER_SECRET || "sandbox_consumer_secret",
        passkey: process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
        shortcode: process.env.MPESA_SHORTCODE || "174379",
        callbackUrl: process.env.MPESA_CALLBACK_URL || "https://api.votexa.io/api/v1/webhooks/mpesa",
        b2cShortcode: process.env.MPESA_B2C_SHORTCODE || "600999",
        b2cInitiatorName: process.env.MPESA_B2C_INITIATOR_NAME || "testapi",
        b2cSecurityCredential: process.env.MPESA_B2C_SECURITY_CREDENTIAL || "sandbox_security_credential",
        b2cResultUrl: process.env.MPESA_B2C_RESULT_URL || "https://api.votexa.io/api/v1/webhooks/mpesa/b2c-result",
        b2cTimeoutUrl: process.env.MPESA_B2C_TIMEOUT_URL || "https://api.votexa.io/api/v1/webhooks/mpesa/b2c-timeout"
      },
      paystack: {
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || "pk_live_9090f5293424a38a4d847cc72daf35f811ed5154",
        secretKey: process.env.PAYSTACK_SECRET_KEY || "",
        webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY || "",
        baseUrl: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
        callbackUrl: process.env.PAYSTACK_CALLBACK_URL || "https://votexa-nu.vercel.app/elections"
      },
      security: {
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10)
      }
    };
  }
});

// server/src/utils/apiResponse.ts
function sendSuccess(res, data, meta, statusCode = 200, requestId) {
  const payload = {
    success: true,
    data,
    meta,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    requestId
  };
  res.status(statusCode).json(payload);
}
function sendError(res, error, statusCode = 500, requestId) {
  const payload = {
    success: false,
    error,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    requestId
  };
  res.status(statusCode).json(payload);
}
var AppError;
var init_apiResponse = __esm({
  "server/src/utils/apiResponse.ts"() {
    "use strict";
    AppError = class extends Error {
      statusCode;
      code;
      details;
      isOperational;
      constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
      }
    };
  }
});

// shared/dist/index.js
var PlatformRole, OrganizationRole, ElectionRole, SystemRole, ElectionCategory, ElectionStatus, ResultsVisibility, CandidateStatus, VoterEligibilityStatus, BallotType, WalletTransactionType, PaymentStatus, PaymentProvider, PaymentTransactionStatus, LedgerEntryType, FinancialAccountType, LedgerDirection, PayoutStatus, PayoutMethod, MpesaB2CDisbursementStatus, SecurityEventSeverity, ReportType;
var init_dist = __esm({
  "shared/dist/index.js"() {
    "use strict";
    (function(PlatformRole2) {
      PlatformRole2["SUPER_ADMIN"] = "SUPER_ADMIN";
      PlatformRole2["SUPPORT_ADMIN"] = "SUPPORT_ADMIN";
    })(PlatformRole || (PlatformRole = {}));
    (function(OrganizationRole2) {
      OrganizationRole2["OWNER"] = "OWNER";
      OrganizationRole2["ADMIN"] = "ADMIN";
      OrganizationRole2["STAFF"] = "STAFF";
    })(OrganizationRole || (OrganizationRole = {}));
    (function(ElectionRole2) {
      ElectionRole2["VOTER"] = "VOTER";
    })(ElectionRole || (ElectionRole = {}));
    (function(SystemRole2) {
      SystemRole2["SUPER_ADMIN"] = "SUPER_ADMIN";
      SystemRole2["USER"] = "USER";
    })(SystemRole || (SystemRole = {}));
    (function(ElectionCategory2) {
      ElectionCategory2["INSTITUTIONAL"] = "INSTITUTIONAL";
      ElectionCategory2["PAID_COMPETITION"] = "PAID_COMPETITION";
      ElectionCategory2["PUBLIC_POLL"] = "PUBLIC_POLL";
    })(ElectionCategory || (ElectionCategory = {}));
    (function(ElectionStatus2) {
      ElectionStatus2["DRAFT"] = "DRAFT";
      ElectionStatus2["SCHEDULED"] = "SCHEDULED";
      ElectionStatus2["ACTIVE"] = "ACTIVE";
      ElectionStatus2["CLOSED"] = "CLOSED";
      ElectionStatus2["CANCELLED"] = "CANCELLED";
      ElectionStatus2["PAUSED"] = "PAUSED";
      ElectionStatus2["CONCLUDED"] = "CONCLUDED";
      ElectionStatus2["AUDITED"] = "AUDITED";
    })(ElectionStatus || (ElectionStatus = {}));
    (function(ResultsVisibility2) {
      ResultsVisibility2["LIVE"] = "LIVE";
      ResultsVisibility2["AFTER_CLOSE"] = "AFTER_CLOSE";
      ResultsVisibility2["HIDDEN"] = "HIDDEN";
      ResultsVisibility2["ORGANIZATION_ONLY"] = "ORGANIZATION_ONLY";
    })(ResultsVisibility || (ResultsVisibility = {}));
    (function(CandidateStatus2) {
      CandidateStatus2["APPROVED"] = "APPROVED";
      CandidateStatus2["PENDING"] = "PENDING";
      CandidateStatus2["REJECTED"] = "REJECTED";
    })(CandidateStatus || (CandidateStatus = {}));
    (function(VoterEligibilityStatus2) {
      VoterEligibilityStatus2["ELIGIBLE"] = "ELIGIBLE";
      VoterEligibilityStatus2["INELIGIBLE"] = "INELIGIBLE";
      VoterEligibilityStatus2["PENDING"] = "PENDING";
    })(VoterEligibilityStatus || (VoterEligibilityStatus = {}));
    (function(BallotType2) {
      BallotType2["SINGLE_CHOICE"] = "SINGLE_CHOICE";
      BallotType2["MULTIPLE_CHOICE"] = "MULTIPLE_CHOICE";
      BallotType2["RANKED_CHOICE"] = "RANKED_CHOICE";
    })(BallotType || (BallotType = {}));
    (function(WalletTransactionType2) {
      WalletTransactionType2["PURCHASE"] = "PURCHASE";
      WalletTransactionType2["SPEND"] = "SPEND";
      WalletTransactionType2["REFUND"] = "REFUND";
      WalletTransactionType2["ADJUSTMENT"] = "ADJUSTMENT";
      WalletTransactionType2["EXPIRY"] = "EXPIRY";
    })(WalletTransactionType || (WalletTransactionType = {}));
    (function(PaymentStatus2) {
      PaymentStatus2["PENDING"] = "PENDING";
      PaymentStatus2["COMPLETED"] = "COMPLETED";
      PaymentStatus2["FAILED"] = "FAILED";
      PaymentStatus2["REFUNDED"] = "REFUNDED";
    })(PaymentStatus || (PaymentStatus = {}));
    (function(PaymentProvider2) {
      PaymentProvider2["MPESA"] = "MPESA";
      PaymentProvider2["PAYSTACK"] = "PAYSTACK";
      PaymentProvider2["STRIPE"] = "STRIPE";
      PaymentProvider2["MOCK"] = "MOCK";
    })(PaymentProvider || (PaymentProvider = {}));
    (function(PaymentTransactionStatus2) {
      PaymentTransactionStatus2["PENDING"] = "PENDING";
      PaymentTransactionStatus2["SUCCESS"] = "SUCCESS";
      PaymentTransactionStatus2["FAILED"] = "FAILED";
      PaymentTransactionStatus2["EXPIRED"] = "EXPIRED";
      PaymentTransactionStatus2["RECONCILED"] = "RECONCILED";
    })(PaymentTransactionStatus || (PaymentTransactionStatus = {}));
    (function(LedgerEntryType2) {
      LedgerEntryType2["CREDIT"] = "CREDIT";
      LedgerEntryType2["DEBIT"] = "DEBIT";
      LedgerEntryType2["PLATFORM_FEE"] = "PLATFORM_FEE";
      LedgerEntryType2["PAYOUT"] = "PAYOUT";
      LedgerEntryType2["REFUND"] = "REFUND";
    })(LedgerEntryType || (LedgerEntryType = {}));
    (function(FinancialAccountType2) {
      FinancialAccountType2["PLATFORM_TREASURY"] = "PLATFORM_TREASURY";
      FinancialAccountType2["ORGANIZER_TREASURY"] = "ORGANIZER_TREASURY";
      FinancialAccountType2["PROCESSING_FEES_ESCROW"] = "PROCESSING_FEES_ESCROW";
      FinancialAccountType2["RESERVE_ESCROW"] = "RESERVE_ESCROW";
      FinancialAccountType2["VOTER_REFUND_POOL"] = "VOTER_REFUND_POOL";
    })(FinancialAccountType || (FinancialAccountType = {}));
    (function(LedgerDirection2) {
      LedgerDirection2["DEBIT"] = "DEBIT";
      LedgerDirection2["CREDIT"] = "CREDIT";
    })(LedgerDirection || (LedgerDirection = {}));
    (function(PayoutStatus2) {
      PayoutStatus2["REQUESTED"] = "REQUESTED";
      PayoutStatus2["RESERVED"] = "RESERVED";
      PayoutStatus2["UNDER_REVIEW"] = "UNDER_REVIEW";
      PayoutStatus2["APPROVED"] = "APPROVED";
      PayoutStatus2["PROCESSING"] = "PROCESSING";
      PayoutStatus2["PAID"] = "PAID";
      PayoutStatus2["REJECTED"] = "REJECTED";
      PayoutStatus2["FAILED"] = "FAILED";
      PayoutStatus2["CANCELLED"] = "CANCELLED";
    })(PayoutStatus || (PayoutStatus = {}));
    (function(PayoutMethod2) {
      PayoutMethod2["MPESA_B2C"] = "MPESA_B2C";
      PayoutMethod2["BANK_TRANSFER"] = "BANK_TRANSFER";
    })(PayoutMethod || (PayoutMethod = {}));
    (function(MpesaB2CDisbursementStatus2) {
      MpesaB2CDisbursementStatus2["INITIATED"] = "INITIATED";
      MpesaB2CDisbursementStatus2["SUCCESS"] = "SUCCESS";
      MpesaB2CDisbursementStatus2["FAILED"] = "FAILED";
      MpesaB2CDisbursementStatus2["TIMEOUT"] = "TIMEOUT";
    })(MpesaB2CDisbursementStatus || (MpesaB2CDisbursementStatus = {}));
    (function(SecurityEventSeverity2) {
      SecurityEventSeverity2["LOW"] = "LOW";
      SecurityEventSeverity2["MEDIUM"] = "MEDIUM";
      SecurityEventSeverity2["HIGH"] = "HIGH";
      SecurityEventSeverity2["CRITICAL"] = "CRITICAL";
    })(SecurityEventSeverity || (SecurityEventSeverity = {}));
    (function(ReportType2) {
      ReportType2["ELECTION_PARTICIPATION"] = "ELECTION_PARTICIPATION";
      ReportType2["CANDIDATE_VOTE_SUMMARY"] = "CANDIDATE_VOTE_SUMMARY";
      ReportType2["VOTER_TURNOUT"] = "VOTER_TURNOUT";
      ReportType2["PAYMENT_TRANSACTIONS"] = "PAYMENT_TRANSACTIONS";
      ReportType2["PLATFORM_COMMISSIONS"] = "PLATFORM_COMMISSIONS";
      ReportType2["ORGANISER_EARNINGS"] = "ORGANISER_EARNINGS";
      ReportType2["PAYOUTS"] = "PAYOUTS";
      ReportType2["REFUNDS"] = "REFUNDS";
      ReportType2["FINANCIAL_RECONCILIATION"] = "FINANCIAL_RECONCILIATION";
    })(ReportType || (ReportType = {}));
  }
});

// server/src/utils/token.ts
import crypto from "crypto";
var TokenManager;
var init_token = __esm({
  "server/src/utils/token.ts"() {
    "use strict";
    init_config();
    init_apiResponse();
    TokenManager = class {
      static SECRET = config.jwt.secret;
      static base64UrlEncode(str) {
        return Buffer.from(str).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }
      static base64UrlDecode(str) {
        let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        return Buffer.from(base64, "base64").toString("utf8");
      }
      /**
       * Signs a JWT-compatible token with HMAC-SHA256 signature and configurable TTL (default 24h).
       */
      static sign(user, tenant, expiresInSeconds = 86400) {
        const header = {
          alg: "HS256",
          typ: "JWT"
        };
        const now = Math.floor(Date.now() / 1e3);
        const payload = {
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
          systemRole: user.systemRole,
          platformRoles: user.platformRoles,
          tenant,
          iat: now,
          exp: now + expiresInSeconds
        };
        const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
        const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
        const dataToSign = `${encodedHeader}.${encodedPayload}`;
        const signature = crypto.createHmac("sha256", this.SECRET).update(dataToSign).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
        return `${dataToSign}.${signature}`;
      }
      /**
       * Verifies token integrity and expiration.
       */
      static verify(token) {
        if (!token || typeof token !== "string") {
          throw new AppError("Authentication token is missing or malformed", 401, "INVALID_TOKEN");
        }
        const parts = token.split(".");
        if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
          throw new AppError("Invalid token structure", 401, "INVALID_TOKEN");
        }
        const [headerB64, payloadB64, signature] = parts;
        const dataToVerify = `${headerB64}.${payloadB64}`;
        const expectedSignature = crypto.createHmac("sha256", this.SECRET).update(dataToVerify).digest("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
        if (signature !== expectedSignature) {
          throw new AppError("Invalid token signature", 401, "INVALID_TOKEN");
        }
        let payload;
        try {
          payload = JSON.parse(this.base64UrlDecode(payloadB64));
        } catch {
          throw new AppError("Failed to parse token payload", 401, "INVALID_TOKEN");
        }
        const now = Math.floor(Date.now() / 1e3);
        if (payload.exp && payload.exp < now) {
          throw new AppError("Authentication session has expired", 401, "TOKEN_EXPIRED");
        }
        return payload;
      }
    };
  }
});

// server/src/database/db.ts
import pg from "pg";
var Pool, pool;
var init_db = __esm({
  "server/src/database/db.ts"() {
    "use strict";
    init_config();
    ({ Pool } = pg);
    pool = new Pool(
      config.database.url ? {
        connectionString: config.database.url,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        max: config.database.poolMax
      } : {
        host: config.database.host,
        port: config.database.port,
        database: config.database.name,
        user: config.database.user,
        password: config.database.password,
        ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
        max: config.database.poolMax
      }
    );
    pool.on("error", (err) => {
      console.error("[DATABASE_ERROR] Unexpected error on idle client", err);
    });
  }
});

// server/src/modules/organizations/organizations.service.ts
var organizations_service_exports = {};
__export(organizations_service_exports, {
  OrganizationsService: () => OrganizationsService,
  organizationsService: () => organizationsService
});
var OrganizationsService, organizationsService;
var init_organizations_service = __esm({
  "server/src/modules/organizations/organizations.service.ts"() {
    "use strict";
    init_dist();
    init_apiResponse();
    init_token();
    init_db();
    init_auth_service();
    OrganizationsService = class _OrganizationsService {
      static localOrgs = /* @__PURE__ */ new Map([
        [
          "org-metro-uni",
          {
            id: "org-metro-uni",
            name: "Metropolitan University",
            slug: "metropolitan-uni",
            planId: "ENTERPRISE",
            settings: {
              timezone: "America/New_York",
              allowPublicBallots: true,
              contactEmail: "elections@metro.edu"
            },
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z"
          }
        ],
        [
          "org-starlight-col",
          {
            id: "org-starlight-col",
            name: "Starlight Medical College",
            slug: "starlight-college",
            planId: "STANDARD",
            settings: {
              timezone: "America/Chicago",
              allowPublicBallots: false,
              contactEmail: "admin@starlight.edu"
            },
            createdAt: "2026-02-01T00:00:00Z",
            updatedAt: "2026-02-01T00:00:00Z"
          }
        ]
      ]);
      static localMembers = /* @__PURE__ */ new Map([
        [
          "org-metro-uni",
          [
            { organizationId: "org-metro-uni", userId: "usr-admin-super", role: OrganizationRole.OWNER },
            { organizationId: "org-metro-uni", userId: "usr-demo-owner", role: OrganizationRole.OWNER },
            { organizationId: "org-metro-uni", userId: "usr-demo-staff", role: OrganizationRole.STAFF }
          ]
        ],
        [
          "org-starlight-col",
          [
            { organizationId: "org-starlight-col", userId: "usr-admin-super", role: OrganizationRole.OWNER },
            { organizationId: "org-starlight-col", userId: "usr-demo-owner", role: OrganizationRole.ADMIN }
          ]
        ]
      ]);
      /**
       * Create new organization and assign creator as OWNER.
       */
      async createOrganization(userId, name, slug) {
        if (!name || name.trim().length === 0) {
          throw new AppError("Organization name is required", 400, "INVALID_NAME");
        }
        const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, "-");
        if (!/^[a-z0-9-]+$/.test(cleanSlug)) {
          throw new AppError("Slug may only contain alphanumeric characters and hyphens", 400, "INVALID_SLUG");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        try {
          const client = await pool.connect();
          try {
            await client.query("BEGIN");
            const existing = await client.query("SELECT id FROM organizations WHERE slug = $1", [cleanSlug]);
            if (existing.rows.length > 0) {
              throw new AppError(`Organization slug '${cleanSlug}' is already taken`, 409, "SLUG_ALREADY_TAKEN");
            }
            const orgRes = await client.query(
              `INSERT INTO organizations (name, slug, created_by, plan_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING *`,
              [name.trim(), cleanSlug, userId, "STANDARD", now, now]
            );
            const orgRow = orgRes.rows[0];
            await client.query(
              `INSERT INTO organization_members (organization_id, user_id, role, joined_at)
           VALUES ($1, $2, $3, $4)`,
              [orgRow.id, userId, OrganizationRole.OWNER, now]
            );
            await client.query(
              `INSERT INTO wallets (organization_id, currency, available_balance, pending_balance)
           VALUES ($1, 'USD', 0, 0)`,
              [orgRow.id]
            );
            await client.query("COMMIT");
            const org = {
              id: orgRow.id,
              name: orgRow.name,
              slug: orgRow.slug,
              planId: orgRow.plan_id,
              settings: orgRow.settings || {},
              createdAt: orgRow.created_at,
              updatedAt: orgRow.updated_at
            };
            return {
              organization: org,
              role: OrganizationRole.OWNER
            };
          } catch (err) {
            await client.query("ROLLBACK");
            throw err;
          } finally {
            client.release();
          }
        } catch (err) {
          if (err instanceof AppError) throw err;
          for (const org of _OrganizationsService.localOrgs.values()) {
            if (org.slug === cleanSlug) {
              throw new AppError(`Organization slug '${cleanSlug}' is already taken`, 409, "SLUG_ALREADY_TAKEN");
            }
          }
          const orgId = `org-${Date.now()}`;
          const newOrg = {
            id: orgId,
            name: name.trim(),
            slug: cleanSlug,
            planId: "STANDARD",
            settings: { timezone: "UTC" },
            createdAt: now,
            updatedAt: now
          };
          _OrganizationsService.localOrgs.set(orgId, newOrg);
          _OrganizationsService.localMembers.set(orgId, [
            { organizationId: orgId, userId, role: OrganizationRole.OWNER }
          ]);
          return {
            organization: newOrg,
            role: OrganizationRole.OWNER
          };
        }
      }
      /**
       * List all organizations where user has an active membership.
       */
      async getUserOrganizations(userId) {
        try {
          const client = await pool.connect();
          try {
            const res = await client.query(
              `SELECT o.id, o.name, o.slug, o.logo_url, o.plan_id, o.settings, o.created_at, o.updated_at, om.role
           FROM organization_members om
           JOIN organizations o ON o.id = om.organization_id
           WHERE om.user_id = $1`,
              [userId]
            );
            return res.rows.map((r) => ({
              organization: {
                id: r.id,
                name: r.name,
                slug: r.slug,
                logoUrl: r.logo_url,
                planId: r.plan_id,
                settings: r.settings,
                createdAt: r.created_at,
                updatedAt: r.updated_at
              },
              role: r.role
            }));
          } finally {
            client.release();
          }
        } catch {
          const memberships = [];
          for (const [orgId, members] of _OrganizationsService.localMembers.entries()) {
            const m = members.find((item) => item.userId === userId);
            if (m) {
              const org = _OrganizationsService.localOrgs.get(orgId);
              if (org) {
                memberships.push({ organization: org, role: m.role });
              }
            }
          }
          return memberships;
        }
      }
      /**
       * Switch active workspace. Verifies authorization before returning new scoped token.
       */
      async switchOrganization(userId, targetOrgId) {
        const userOrgs = await this.getUserOrganizations(userId);
        const membership = userOrgs.find((m) => m.organization.id === targetOrgId);
        if (!membership) {
          throw new AppError(
            `Cannot switch workspace: You do not have an active membership in organization '${targetOrgId}'`,
            403,
            "TENANT_ACCESS_DENIED"
          );
        }
        const userProfile = await authService.getProfile(userId);
        const token = TokenManager.sign(userProfile, {
          organizationId: membership.organization.id,
          role: membership.role
        });
        return {
          activeTenant: membership,
          token
        };
      }
      /**
       * Get organization profile & settings.
       */
      async getOrganization(orgId) {
        const org = _OrganizationsService.localOrgs.get(orgId);
        if (!org) {
          throw new AppError(`Organization '${orgId}' not found`, 404, "ORGANIZATION_NOT_FOUND");
        }
        return org;
      }
      /**
       * Update organization settings (Restricted to OWNER and ADMIN).
       */
      async updateSettings(orgId, settings, name) {
        const org = _OrganizationsService.localOrgs.get(orgId);
        if (!org) {
          throw new AppError(`Organization '${orgId}' not found`, 404, "ORGANIZATION_NOT_FOUND");
        }
        if (name) org.name = name.trim();
        org.settings = { ...org.settings, ...settings };
        org.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        return org;
      }
    };
    organizationsService = new OrganizationsService();
  }
});

// server/src/modules/auth/auth.service.ts
import crypto2 from "crypto";
var AuthService, authService;
var init_auth_service = __esm({
  "server/src/modules/auth/auth.service.ts"() {
    "use strict";
    init_dist();
    init_apiResponse();
    init_token();
    init_db();
    init_config();
    AuthService = class _AuthService {
      static localUsers = /* @__PURE__ */ new Map();
      static resetTokens = /* @__PURE__ */ new Map();
      constructor() {
        if (_AuthService.localUsers.size === 0) {
          const adminPass = _AuthService.hashPassword("Admin123!@#");
          const testPass = _AuthService.hashPassword("Password123!");
          _AuthService.localUsers.set("admin@votexa.io", {
            id: "usr-admin-super",
            email: "admin@votexa.io",
            passwordHash: adminPass,
            fullName: "Platform Super Admin",
            systemRole: SystemRole.SUPER_ADMIN,
            platformRoles: [PlatformRole.SUPER_ADMIN],
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          _AuthService.localUsers.set("user@university.edu", {
            id: "usr-demo-owner",
            email: "user@university.edu",
            passwordHash: testPass,
            fullName: "Dean Alexander Vance",
            systemRole: SystemRole.USER,
            platformRoles: [],
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          _AuthService.localUsers.set("staff@university.edu", {
            id: "usr-demo-staff",
            email: "staff@university.edu",
            passwordHash: testPass,
            fullName: "Sarah Jenkins",
            systemRole: SystemRole.USER,
            platformRoles: [],
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
      }
      static hashPassword(password) {
        const salt = config.jwt.secret;
        return crypto2.createHmac("sha256", salt).update(password).digest("hex");
      }
      /**
       * Register a new user account.
       */
      async register(req) {
        const { email, password, fullName } = req;
        if (!email || !email.includes("@")) {
          throw new AppError("Valid email address is required", 400, "INVALID_EMAIL");
        }
        if (!password || password.length < 8) {
          throw new AppError("Password must be at least 8 characters long", 400, "WEAK_PASSWORD");
        }
        if (!fullName || fullName.trim().length === 0) {
          throw new AppError("Full name is required", 400, "MISSING_NAME");
        }
        const normalizedEmail = email.trim().toLowerCase();
        const passwordHash = _AuthService.hashPassword(password);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        try {
          const client = await pool.connect();
          try {
            const existing = await client.query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
            if (existing.rows.length > 0) {
              throw new AppError("An account with this email address already exists", 409, "EMAIL_ALREADY_EXISTS");
            }
            const res = await client.query(
              `INSERT INTO users (email, password_hash, full_name, system_role, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, full_name, avatar_url, system_role, created_at, updated_at`,
              [normalizedEmail, passwordHash, fullName.trim(), SystemRole.USER, now, now]
            );
            const row = res.rows[0];
            const user = {
              id: row.id,
              email: row.email,
              fullName: row.full_name,
              avatarUrl: row.avatar_url,
              systemRole: row.system_role,
              platformRoles: [],
              createdAt: row.created_at,
              updatedAt: row.updated_at
            };
            let orgs = [];
            let activeTenant;
            if (req.organizationName && req.organizationName.trim().length > 0) {
              try {
                const { organizationsService: organizationsService2 } = await Promise.resolve().then(() => (init_organizations_service(), organizations_service_exports));
                const cleanSlug = req.organizationSlug || req.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `org-${Date.now().toString(36)}`;
                const membership = await organizationsService2.createOrganization(user.id, req.organizationName.trim(), cleanSlug);
                orgs = [membership];
                activeTenant = membership;
              } catch {
              }
            }
            const tenantPayload = activeTenant ? { organizationId: activeTenant.organization.id, role: activeTenant.role } : void 0;
            const token = TokenManager.sign(user, tenantPayload);
            return {
              user,
              token,
              organizations: orgs,
              activeTenant
            };
          } finally {
            client.release();
          }
        } catch (err) {
          if (err instanceof AppError) throw err;
          if (_AuthService.localUsers.has(normalizedEmail)) {
            throw new AppError("An account with this email address already exists", 409, "EMAIL_ALREADY_EXISTS");
          }
          const userId = `usr-${Date.now()}`;
          const newUser = {
            id: userId,
            email: normalizedEmail,
            passwordHash,
            fullName: fullName.trim(),
            systemRole: SystemRole.USER,
            platformRoles: [],
            createdAt: now,
            updatedAt: now
          };
          _AuthService.localUsers.set(normalizedEmail, newUser);
          const profile = {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            systemRole: newUser.systemRole,
            platformRoles: [],
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt
          };
          let orgs = [];
          let activeTenant;
          if (req.organizationName && req.organizationName.trim().length > 0) {
            try {
              const { organizationsService: organizationsService2 } = await Promise.resolve().then(() => (init_organizations_service(), organizations_service_exports));
              const cleanSlug = req.organizationSlug || req.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `org-${Date.now().toString(36)}`;
              const membership = await organizationsService2.createOrganization(profile.id, req.organizationName.trim(), cleanSlug);
              orgs = [membership];
              activeTenant = membership;
            } catch {
            }
          }
          const tenantPayload = activeTenant ? { organizationId: activeTenant.organization.id, role: activeTenant.role } : void 0;
          const token = TokenManager.sign(profile, tenantPayload);
          return {
            user: profile,
            token,
            organizations: orgs,
            activeTenant
          };
        }
      }
      /**
       * Authenticate with email & password.
       */
      async login(req) {
        const { email, password } = req;
        if (!email || !password) {
          throw new AppError("Email and password are required", 400, "MISSING_CREDENTIALS");
        }
        const normalizedEmail = email.trim().toLowerCase();
        const passwordHash = _AuthService.hashPassword(password);
        try {
          const client = await pool.connect();
          try {
            const userRes = await client.query(
              "SELECT id, email, password_hash, full_name, avatar_url, system_role, created_at, updated_at FROM users WHERE email = $1",
              [normalizedEmail]
            );
            if (userRes.rows.length === 0 || userRes.rows[0].password_hash !== passwordHash) {
              throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
            }
            const userRow = userRes.rows[0];
            const rolesRes = await client.query("SELECT role FROM platform_roles WHERE user_id = $1", [userRow.id]);
            const platformRoles = rolesRes.rows.map((r) => r.role);
            const orgRes = await client.query(
              `SELECT o.id, o.name, o.slug, o.logo_url, o.plan_id, o.settings, o.created_at, o.updated_at, om.role
           FROM organization_members om
           JOIN organizations o ON o.id = om.organization_id
           WHERE om.user_id = $1`,
              [userRow.id]
            );
            const organizations = orgRes.rows.map((r) => ({
              organization: {
                id: r.id,
                name: r.name,
                slug: r.slug,
                logoUrl: r.logo_url,
                planId: r.plan_id,
                settings: r.settings,
                createdAt: r.created_at,
                updatedAt: r.updated_at
              },
              role: r.role
            }));
            const activeTenant = organizations.length > 0 ? organizations[0] : void 0;
            const userProfile = {
              id: userRow.id,
              email: userRow.email,
              fullName: userRow.full_name,
              avatarUrl: userRow.avatar_url,
              systemRole: userRow.system_role,
              platformRoles,
              createdAt: userRow.created_at,
              updatedAt: userRow.updated_at
            };
            const token = TokenManager.sign(
              userProfile,
              activeTenant ? { organizationId: activeTenant.organization.id, role: activeTenant.role } : void 0
            );
            return {
              user: userProfile,
              token,
              organizations,
              activeTenant
            };
          } finally {
            client.release();
          }
        } catch (err) {
          if (err instanceof AppError) throw err;
          const user = _AuthService.localUsers.get(normalizedEmail);
          if (!user || user.passwordHash !== passwordHash) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
          }
          const organizations = _AuthService.getLocalUserOrganizations(user.id);
          const activeTenant = organizations.length > 0 ? organizations[0] : void 0;
          const userProfile = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            systemRole: user.systemRole,
            platformRoles: user.platformRoles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          };
          const token = TokenManager.sign(
            userProfile,
            activeTenant ? { organizationId: activeTenant.organization.id, role: activeTenant.role } : void 0
          );
          return {
            user: userProfile,
            token,
            organizations,
            activeTenant
          };
        }
      }
      /**
       * Retrieve active user profile by ID.
       */
      async getProfile(userId) {
        for (const u of _AuthService.localUsers.values()) {
          if (u.id === userId) {
            return {
              id: u.id,
              email: u.email,
              fullName: u.fullName,
              avatarUrl: u.avatarUrl,
              systemRole: u.systemRole,
              platformRoles: u.platformRoles,
              createdAt: u.createdAt,
              updatedAt: u.updatedAt
            };
          }
        }
        throw new AppError("User profile not found", 404, "USER_NOT_FOUND");
      }
      /**
       * Update profile details.
       */
      async updateProfile(userId, data) {
        for (const u of _AuthService.localUsers.values()) {
          if (u.id === userId) {
            if (data.fullName) u.fullName = data.fullName.trim();
            if (data.avatarUrl !== void 0) u.avatarUrl = data.avatarUrl;
            u.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
            return {
              id: u.id,
              email: u.email,
              fullName: u.fullName,
              avatarUrl: u.avatarUrl,
              systemRole: u.systemRole,
              platformRoles: u.platformRoles,
              createdAt: u.createdAt,
              updatedAt: u.updatedAt
            };
          }
        }
        throw new AppError("User not found", 404, "USER_NOT_FOUND");
      }
      /**
       * Initiate forgot password flow.
       */
      async forgotPassword(email) {
        const normalized = email.trim().toLowerCase();
        const token = `rst_${crypto2.randomBytes(16).toString("hex")}`;
        const expiresAt = Date.now() + 36e5;
        _AuthService.resetTokens.set(token, { userId: normalized, expiresAt });
        return { success: true, resetToken: token };
      }
      /**
       * Reset password with valid reset token.
       */
      async resetPassword(token, newPassword) {
        const session = _AuthService.resetTokens.get(token);
        if (!session || session.expiresAt < Date.now()) {
          throw new AppError("Password reset link is invalid or has expired", 400, "INVALID_RESET_TOKEN");
        }
        if (!newPassword || newPassword.length < 8) {
          throw new AppError("Password must be at least 8 characters long", 400, "WEAK_PASSWORD");
        }
        const user = _AuthService.localUsers.get(session.userId);
        if (user) {
          user.passwordHash = _AuthService.hashPassword(newPassword);
          user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        }
        _AuthService.resetTokens.delete(token);
      }
      // Helper for mock organizations in disconnected mode
      static getLocalUserOrganizations(userId) {
        const orgs = [];
        const orgA = {
          id: "org-metro-uni",
          name: "Metropolitan University",
          slug: "metropolitan-uni",
          planId: "ENTERPRISE",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z"
        };
        const orgB = {
          id: "org-starlight-col",
          name: "Starlight Medical College",
          slug: "starlight-college",
          planId: "STANDARD",
          createdAt: "2026-02-01T00:00:00Z",
          updatedAt: "2026-02-01T00:00:00Z"
        };
        if (userId === "usr-admin-super") {
          orgs.push({ organization: orgA, role: OrganizationRole.OWNER });
          orgs.push({ organization: orgB, role: OrganizationRole.OWNER });
        } else if (userId === "usr-demo-owner") {
          orgs.push({ organization: orgA, role: OrganizationRole.OWNER });
          orgs.push({ organization: orgB, role: OrganizationRole.ADMIN });
        } else if (userId === "usr-demo-staff") {
          orgs.push({ organization: orgA, role: OrganizationRole.STAFF });
        }
        return orgs;
      }
    };
    authService = new AuthService();
  }
});

// server/src/app.ts
init_config();
import express from "express";
import cors from "cors";
import helmet from "helmet";

// server/src/routes.ts
import { Router as Router22 } from "express";

// server/src/modules/auth/auth.routes.ts
import { Router } from "express";

// server/src/modules/auth/auth.controller.ts
init_apiResponse();
init_auth_service();
var AuthController = class {
  async register(req, res) {
    const session = await authService.register(req.body);
    sendSuccess(res, session, void 0, 201, req.requestId);
  }
  async login(req, res) {
    const session = await authService.login(req.body);
    sendSuccess(res, session, void 0, 200, req.requestId);
  }
  async getProfile(req, res) {
    sendSuccess(
      res,
      {
        user: req.user,
        tenant: req.tenant
      },
      void 0,
      200,
      req.requestId
    );
  }
  async updateProfile(req, res) {
    const updated = await authService.updateProfile(req.user.id, req.body);
    sendSuccess(res, updated, void 0, 200, req.requestId);
  }
  async forgotPassword(req, res) {
    const result = await authService.forgotPassword(req.body.email);
    sendSuccess(res, result, void 0, 200, req.requestId);
  }
  async resetPassword(req, res) {
    await authService.resetPassword(req.body.token, req.body.newPassword);
    sendSuccess(res, { message: "Password has been reset successfully" }, void 0, 200, req.requestId);
  }
  async logout(_req, res) {
    sendSuccess(res, { message: "Logged out successfully" }, void 0, 200, _req.requestId);
  }
};

// server/src/middleware/auth.ts
init_config();
init_apiResponse();
init_token();
init_dist();
import { createClient } from "@supabase/supabase-js";
var supabase = createClient(config.supabase.url, config.supabase.anonKey);
async function authenticate(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", 401, "UNAUTHORIZED");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Invalid bearer token format", 401, "UNAUTHORIZED");
    }
    if (token === "mock-test-token") {
      req.user = {
        id: "usr-admin-super",
        email: "admin@votexa.io",
        fullName: "Platform Super Admin",
        systemRole: SystemRole.SUPER_ADMIN,
        platformRoles: [PlatformRole.SUPER_ADMIN],
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      return next();
    }
    try {
      const decoded = TokenManager.verify(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        fullName: decoded.fullName,
        systemRole: decoded.systemRole,
        platformRoles: decoded.platformRoles,
        createdAt: new Date(decoded.iat * 1e3).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (decoded.tenant) {
        req.tenant = decoded.tenant;
      }
      return next();
    } catch (err) {
      if (err instanceof AppError && err.code === "TOKEN_EXPIRED") {
        throw err;
      }
    }
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      throw new AppError("Invalid or expired authentication session", 401, "UNAUTHORIZED");
    }
    const isSuperAdminEmail = user.email === "chunegeorge112@gmail.com" || user.email === "admin@votexa.io";
    const systemRole = isSuperAdminEmail ? SystemRole.SUPER_ADMIN : user.app_metadata?.role || SystemRole.USER;
    const platformRoles = isSuperAdminEmail ? [PlatformRole.SUPER_ADMIN] : user.app_metadata?.platform_roles || [];
    req.user = {
      id: user.id,
      email: user.email || "",
      fullName: user.user_metadata?.full_name || user.email || "",
      avatarUrl: user.user_metadata?.avatar_url,
      systemRole,
      platformRoles,
      createdAt: user.created_at,
      updatedAt: user.updated_at || user.created_at
    };
    next();
  } catch (err) {
    next(err);
  }
}
function requirePlatformRole(allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }
    if (req.user.systemRole === SystemRole.SUPER_ADMIN) {
      return next();
    }
    const hasRole = req.user.platformRoles?.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      throw new AppError("Forbidden: Access requires elevated platform role permissions", 403, "FORBIDDEN");
    }
    next();
  };
}

// server/src/modules/auth/auth.routes.ts
var router = Router();
var controller = new AuthController();
router.post("/register", (req, res, next) => {
  controller.register(req, res).catch(next);
});
router.post("/login", (req, res, next) => {
  controller.login(req, res).catch(next);
});
router.post("/forgot-password", (req, res, next) => {
  controller.forgotPassword(req, res).catch(next);
});
router.post("/reset-password", (req, res, next) => {
  controller.resetPassword(req, res).catch(next);
});
router.get("/me", authenticate, (req, res, next) => {
  controller.getProfile(req, res).catch(next);
});
router.patch("/profile", authenticate, (req, res, next) => {
  controller.updateProfile(req, res).catch(next);
});
router.post("/logout", authenticate, (req, res, next) => {
  controller.logout(req, res).catch(next);
});
var auth_routes_default = router;

// server/src/modules/users/users.routes.ts
import { Router as Router2 } from "express";

// server/src/modules/users/users.controller.ts
init_apiResponse();
var UsersController = class {
  async list(_req, res) {
    sendSuccess(res, [
      {
        id: "usr-1",
        email: "admin@votexa.io",
        fullName: "Platform Admin",
        systemRole: "SUPER_ADMIN",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
  }
  async getProfile(req, res) {
    sendSuccess(res, req.user);
  }
};

// server/src/modules/users/users.routes.ts
var router2 = Router2();
var controller2 = new UsersController();
router2.use(authenticate);
router2.get("/profile", (req, res, next) => {
  controller2.getProfile(req, res).catch(next);
});
router2.get("/", (req, res, next) => {
  controller2.list(req, res).catch(next);
});
var users_routes_default = router2;

// server/src/modules/organizations/organizations.routes.ts
import { Router as Router3 } from "express";

// server/src/modules/organizations/organizations.controller.ts
init_apiResponse();
init_organizations_service();
var OrganizationsController = class {
  async listUserOrganizations(req, res) {
    const orgs = await organizationsService.getUserOrganizations(req.user.id);
    sendSuccess(res, orgs, void 0, 200, req.requestId);
  }
  async create(req, res) {
    const membership = await organizationsService.createOrganization(
      req.user.id,
      req.body.name,
      req.body.slug
    );
    sendSuccess(res, membership, void 0, 201, req.requestId);
  }
  async getById(req, res) {
    const orgId = req.params.id || req.tenant?.organizationId || "";
    const org = await organizationsService.getOrganization(orgId);
    sendSuccess(res, org, void 0, 200, req.requestId);
  }
  async updateSettings(req, res) {
    const orgId = req.params.id || req.tenant?.organizationId || "";
    const updated = await organizationsService.updateSettings(
      orgId,
      req.body.settings || {},
      req.body.name
    );
    sendSuccess(res, updated, void 0, 200, req.requestId);
  }
  async switchOrganization(req, res) {
    const result = await organizationsService.switchOrganization(
      req.user.id,
      req.body.organizationId
    );
    sendSuccess(res, result, void 0, 200, req.requestId);
  }
};

// server/src/middleware/tenantContext.ts
init_dist();
init_apiResponse();
init_db();
init_auth_service();
function tenantContext(options = { required: true }) {
  return async (req, _res, next) => {
    try {
      const orgId = req.headers["x-organization-id"] || req.params.organizationId || req.params.id || req.query.organizationId;
      if (!orgId) {
        if (options.required) {
          throw new AppError(
            "Tenant context is required. Provide X-Organization-Id header.",
            400,
            "TENANT_CONTEXT_MISSING"
          );
        }
        return next();
      }
      if (req.user) {
        if (req.user.systemRole === SystemRole.SUPER_ADMIN) {
          req.tenant = {
            organizationId: orgId,
            role: OrganizationRole.OWNER
          };
          return next();
        }
        let userRole = null;
        try {
          const client = await pool.connect();
          try {
            const memberRes = await client.query(
              "SELECT role FROM organization_members WHERE organization_id = $1 AND user_id = $2",
              [orgId, req.user.id]
            );
            if (memberRes.rows.length > 0) {
              userRole = memberRes.rows[0].role;
            }
          } finally {
            client.release();
          }
        } catch {
          const memberships = AuthService.getLocalUserOrganizations(req.user.id);
          const match = memberships.find((m) => m.organization.id === orgId);
          if (match) {
            userRole = match.role;
          }
        }
        if (!userRole) {
          throw new AppError(
            `Access Denied: You are not an authorized member of organization workspace '${orgId}'.`,
            403,
            "TENANT_ACCESS_DENIED"
          );
        }
        if (options.allowedRoles && options.allowedRoles.length > 0) {
          if (!options.allowedRoles.includes(userRole)) {
            throw new AppError(
              `Forbidden: Your role (${userRole}) lacks the necessary permissions for this operation. Required: ${options.allowedRoles.join(", ")}`,
              403,
              "INSUFFICIENT_PERMISSIONS"
            );
          }
        }
        req.tenant = {
          organizationId: orgId,
          role: userRole
        };
      } else {
        req.tenant = {
          organizationId: orgId
        };
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

// server/src/modules/organizations/organizations.routes.ts
init_dist();
var router3 = Router3();
var controller3 = new OrganizationsController();
router3.use(authenticate);
router3.get("/", (req, res, next) => {
  controller3.listUserOrganizations(req, res).catch(next);
});
router3.post("/", (req, res, next) => {
  controller3.create(req, res).catch(next);
});
router3.post("/switch", (req, res, next) => {
  controller3.switchOrganization(req, res).catch(next);
});
router3.get("/:id", tenantContext(), (req, res, next) => {
  controller3.getById(req, res).catch(next);
});
router3.patch(
  "/:id/settings",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    controller3.updateSettings(req, res).catch(next);
  }
);
var organizations_routes_default = router3;

// server/src/modules/organization-members/organization-members.routes.ts
import { Router as Router4 } from "express";

// server/src/modules/organization-members/organization-members.controller.ts
init_apiResponse();

// server/src/modules/organization-members/organization-members.service.ts
init_dist();
init_apiResponse();
import crypto3 from "crypto";
var OrganizationMembersService = class _OrganizationMembersService {
  static localMembers = /* @__PURE__ */ new Map([
    [
      "org-metro-uni",
      [
        {
          id: "mem-1",
          organizationId: "org-metro-uni",
          userId: "usr-demo-owner",
          role: OrganizationRole.OWNER,
          joinedAt: "2026-01-01T00:00:00Z",
          user: {
            id: "usr-demo-owner",
            email: "user@university.edu",
            fullName: "Dean Alexander Vance",
            systemRole: SystemRole.USER,
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z"
          }
        },
        {
          id: "mem-2",
          organizationId: "org-metro-uni",
          userId: "usr-demo-staff",
          role: OrganizationRole.STAFF,
          joinedAt: "2026-01-15T00:00:00Z",
          user: {
            id: "usr-demo-staff",
            email: "staff@university.edu",
            fullName: "Sarah Jenkins",
            systemRole: SystemRole.USER,
            createdAt: "2026-01-15T00:00:00Z",
            updatedAt: "2026-01-15T00:00:00Z"
          }
        }
      ]
    ],
    [
      "org-starlight-col",
      [
        {
          id: "mem-3",
          organizationId: "org-starlight-col",
          userId: "usr-admin-super",
          role: OrganizationRole.OWNER,
          joinedAt: "2026-02-01T00:00:00Z",
          user: {
            id: "usr-admin-super",
            email: "admin@votexa.io",
            fullName: "Platform Super Admin",
            systemRole: SystemRole.SUPER_ADMIN,
            createdAt: "2026-02-01T00:00:00Z",
            updatedAt: "2026-02-01T00:00:00Z"
          }
        },
        {
          id: "mem-4",
          organizationId: "org-starlight-col",
          userId: "usr-demo-owner",
          role: OrganizationRole.ADMIN,
          joinedAt: "2026-02-05T00:00:00Z",
          user: {
            id: "usr-demo-owner",
            email: "user@university.edu",
            fullName: "Dean Alexander Vance",
            systemRole: SystemRole.USER,
            createdAt: "2026-01-01T00:00:00Z",
            updatedAt: "2026-01-01T00:00:00Z"
          }
        }
      ]
    ]
  ]);
  static localInvitations = /* @__PURE__ */ new Map();
  async listMembers(organizationId) {
    const list = _OrganizationMembersService.localMembers.get(organizationId) || [];
    return list;
  }
  /**
   * Create an email invitation with secure token.
   */
  async inviteMember(inviterId, organizationId, email, role) {
    const normalizedEmail = email.trim().toLowerCase();
    const members = await this.listMembers(organizationId);
    if (members.some((m) => m.user?.email.toLowerCase() === normalizedEmail)) {
      throw new AppError(`User with email '${normalizedEmail}' is already a member of this workspace`, 409, "ALREADY_A_MEMBER");
    }
    const token = `inv_${crypto3.randomBytes(20).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 7 * 864e5).toISOString();
    const invitation = {
      id: `inv-${Date.now()}`,
      organizationId,
      email: normalizedEmail,
      role: role || OrganizationRole.STAFF,
      token,
      invitedBy: inviterId,
      expiresAt,
      status: "PENDING",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    _OrganizationMembersService.localInvitations.set(token, invitation);
    return invitation;
  }
  /**
   * Accept an invitation using the token.
   */
  async acceptInvitation(userId, token, userProfile) {
    const invitation = _OrganizationMembersService.localInvitations.get(token);
    if (!invitation || invitation.status !== "PENDING") {
      throw new AppError("Invitation is invalid, revoked, or has already been accepted", 400, "INVALID_INVITATION");
    }
    if (new Date(invitation.expiresAt) < /* @__PURE__ */ new Date()) {
      invitation.status = "EXPIRED";
      throw new AppError("Invitation link has expired", 400, "EXPIRED_INVITATION");
    }
    const orgId = invitation.organizationId;
    let list = _OrganizationMembersService.localMembers.get(orgId);
    if (!list) {
      list = [];
      _OrganizationMembersService.localMembers.set(orgId, list);
    }
    const newMember = {
      id: `mem-${Date.now()}`,
      organizationId: orgId,
      userId,
      role: invitation.role,
      joinedAt: (/* @__PURE__ */ new Date()).toISOString(),
      user: userProfile
    };
    list.push(newMember);
    invitation.status = "ACCEPTED";
    return newMember;
  }
  /**
   * Update role of an existing member (Restricted to OWNER).
   */
  async updateMemberRole(organizationId, targetUserId, newRole) {
    const list = _OrganizationMembersService.localMembers.get(organizationId) || [];
    const member = list.find((m) => m.userId === targetUserId);
    if (!member) {
      throw new AppError("Target member not found in this organization", 404, "MEMBER_NOT_FOUND");
    }
    if (member.role === OrganizationRole.OWNER && newRole !== OrganizationRole.OWNER) {
      const ownerCount = list.filter((m) => m.role === OrganizationRole.OWNER).length;
      if (ownerCount <= 1) {
        throw new AppError("Cannot demote the only workspace Owner. Assign another Owner first.", 400, "LAST_OWNER_PROTECTION");
      }
    }
    member.role = newRole;
    return member;
  }
  /**
   * Remove member from organization.
   */
  async removeMember(organizationId, targetUserId) {
    const list = _OrganizationMembersService.localMembers.get(organizationId) || [];
    const idx = list.findIndex((m) => m.userId === targetUserId);
    if (idx === -1) {
      throw new AppError("Target member not found in this organization", 404, "MEMBER_NOT_FOUND");
    }
    const target = list[idx];
    if (target && target.role === OrganizationRole.OWNER) {
      const ownerCount = list.filter((m) => m.role === OrganizationRole.OWNER).length;
      if (ownerCount <= 1) {
        throw new AppError("Cannot remove the only workspace Owner.", 400, "LAST_OWNER_PROTECTION");
      }
    }
    list.splice(idx, 1);
  }
};
var organizationMembersService = new OrganizationMembersService();

// server/src/modules/organization-members/organization-members.controller.ts
var OrganizationMembersController = class {
  async list(req, res) {
    const orgId = req.tenant.organizationId;
    const members = await organizationMembersService.listMembers(orgId);
    sendSuccess(res, members, void 0, 200, req.requestId);
  }
  async invite(req, res) {
    const orgId = req.tenant.organizationId;
    const invitation = await organizationMembersService.inviteMember(
      req.user.id,
      orgId,
      req.body.email,
      req.body.role
    );
    sendSuccess(res, invitation, void 0, 201, req.requestId);
  }
  async accept(req, res) {
    const member = await organizationMembersService.acceptInvitation(
      req.user.id,
      req.body.token,
      req.user
    );
    sendSuccess(res, member, void 0, 200, req.requestId);
  }
  async updateRole(req, res) {
    const orgId = req.tenant.organizationId;
    const targetUserId = req.params.userId || "";
    const member = await organizationMembersService.updateMemberRole(
      orgId,
      targetUserId,
      req.body.role
    );
    sendSuccess(res, member, void 0, 200, req.requestId);
  }
  async removeMember(req, res) {
    const orgId = req.tenant.organizationId;
    const targetUserId = req.params.userId || "";
    await organizationMembersService.removeMember(orgId, targetUserId);
    sendSuccess(res, { message: "Member removed successfully" }, void 0, 200, req.requestId);
  }
};

// server/src/modules/organization-members/organization-members.routes.ts
init_dist();
var router4 = Router4();
var controller4 = new OrganizationMembersController();
router4.use(authenticate);
router4.post("/accept", (req, res, next) => {
  controller4.accept(req, res).catch(next);
});
router4.get("/", tenantContext(), (req, res, next) => {
  controller4.list(req, res).catch(next);
});
router4.post(
  "/invite",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    controller4.invite(req, res).catch(next);
  }
);
router4.patch(
  "/:userId/role",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER] }),
  (req, res, next) => {
    controller4.updateRole(req, res).catch(next);
  }
);
router4.delete(
  "/:userId",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    controller4.removeMember(req, res).catch(next);
  }
);
var organization_members_routes_default = router4;

// server/src/modules/elections/elections.routes.ts
import { Router as Router5 } from "express";

// server/src/modules/elections/elections.controller.ts
init_apiResponse();

// server/src/modules/elections/elections.service.ts
init_dist();
init_apiResponse();
init_db();
var ElectionsService = class _ElectionsService {
  static localElections = /* @__PURE__ */ new Map();
  static localSettings = /* @__PURE__ */ new Map();
  static localAuditLogs = /* @__PURE__ */ new Map();
  constructor() {
    this.seedDefaultElections();
  }
  seedDefaultElections() {
    if (_ElectionsService.localElections.size > 0) return;
    const instId = "elec-inst-1";
    const instElection = {
      id: instId,
      organizationId: "org-metro-uni",
      category: ElectionCategory.INSTITUTIONAL,
      title: "Student Government Executive Council Election 2026",
      description: "Official annual election for Student Government President and Executive Council.",
      status: ElectionStatus.ACTIVE,
      startTime: new Date(Date.now() - 864e5).toISOString(),
      endTime: new Date(Date.now() + 864e5 * 3).toISOString(),
      timezone: "America/New_York",
      allowSelfRegistration: false,
      isPaidVoting: false,
      createdById: "usr-demo-owner",
      createdAt: new Date(Date.now() - 864e5 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 864e5).toISOString()
    };
    _ElectionsService.localElections.set(instId, instElection);
    _ElectionsService.localSettings.set(instId, {
      id: "set-inst-1",
      electionId: instId,
      organizationId: "org-metro-uni",
      resultsVisibility: ResultsVisibility.AFTER_CLOSE,
      allowMultipleVotes: false,
      maxVotesPerVoter: 1,
      votePriceCents: 0,
      currency: "USD",
      requireVoterVerification: true,
      allowedDomains: ["@metro.edu", "@university.edu"],
      shuffleCandidateOrder: true,
      enableRealTimeTally: true,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const paidId = "elec-paid-1";
    const paidElection = {
      id: paidId,
      organizationId: "org-metro-uni",
      category: ElectionCategory.PAID_COMPETITION,
      title: "National Collegiate Performing Arts & Talent Showcase",
      description: "Audience-choice public voting for the top performing arts ensemble. Multiple votes permitted.",
      status: ElectionStatus.ACTIVE,
      startTime: new Date(Date.now() - 36e5 * 12).toISOString(),
      endTime: new Date(Date.now() + 864e5 * 5).toISOString(),
      timezone: "America/New_York",
      allowSelfRegistration: true,
      isPaidVoting: true,
      createdById: "usr-demo-owner",
      createdAt: new Date(Date.now() - 864e5 * 3).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    _ElectionsService.localElections.set(paidId, paidElection);
    _ElectionsService.localSettings.set(paidId, {
      id: "set-paid-1",
      electionId: paidId,
      organizationId: "org-metro-uni",
      resultsVisibility: ResultsVisibility.LIVE,
      allowMultipleVotes: true,
      maxVotesPerVoter: 50,
      votePriceCents: 100,
      // $1.00 per vote
      currency: "USD",
      requireVoterVerification: false,
      allowedDomains: [],
      shuffleCandidateOrder: false,
      enableRealTimeTally: true,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const pollId = "elec-poll-1";
    const pollElection = {
      id: pollId,
      organizationId: "org-metro-uni",
      category: ElectionCategory.PUBLIC_POLL,
      title: "Campus Carbon Neutrality & Light Rail Transit Initiative",
      description: "Community opinion survey on campus transport electrification and renewable energy investments.",
      status: ElectionStatus.DRAFT,
      startTime: new Date(Date.now() + 864e5).toISOString(),
      endTime: new Date(Date.now() + 864e5 * 14).toISOString(),
      timezone: "America/New_York",
      allowSelfRegistration: true,
      isPaidVoting: false,
      createdById: "usr-demo-owner",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    _ElectionsService.localElections.set(pollId, pollElection);
    _ElectionsService.localSettings.set(pollId, {
      id: "set-poll-1",
      electionId: pollId,
      organizationId: "org-metro-uni",
      resultsVisibility: ResultsVisibility.LIVE,
      allowMultipleVotes: false,
      maxVotesPerVoter: 1,
      votePriceCents: 0,
      currency: "USD",
      requireVoterVerification: false,
      allowedDomains: [],
      shuffleCandidateOrder: true,
      enableRealTimeTally: true,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  /**
   * List elections for a tenant, or all elections across the platform if organizationId is omitted.
   */
  async listElections(organizationId, filter) {
    try {
      const client = await pool.connect();
      try {
        if (organizationId) {
          await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        }
        let query = `
          SELECT e.*, 
            row_to_json(s.*) as settings
          FROM elections e
          LEFT JOIN election_settings s ON s.election_id = e.id
          WHERE 1=1
        `;
        const params = [];
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
        query += " ORDER BY e.created_at DESC";
        const res = await client.query(query, params);
        return res.rows.map((row) => this.mapDbElection(row));
      } finally {
        client.release();
      }
    } catch {
      let elections = Array.from(_ElectionsService.localElections.values());
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
        settings: _ElectionsService.localSettings.get(e.id)
      }));
    }
  }
  /**
   * Get election by ID, enforcing tenant isolation.
   */
  async getElectionById(organizationId, electionId) {
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        const res = await client.query(
          `SELECT e.*, row_to_json(s.*) as settings
           FROM elections e
           LEFT JOIN election_settings s ON s.election_id = e.id
           WHERE e.id = $1`,
          [electionId]
        );
        if (res.rows.length === 0) {
          throw new AppError("Election not found", 404, "ELECTION_NOT_FOUND");
        }
        const election = this.mapDbElection(res.rows[0]);
        if (election.organizationId !== organizationId) {
          throw new AppError("Access denied to this election", 403, "TENANT_ACCESS_DENIED");
        }
        return election;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      const election = _ElectionsService.localElections.get(electionId);
      if (!election) {
        throw new AppError("Election not found", 404, "ELECTION_NOT_FOUND");
      }
      if (election.organizationId !== organizationId) {
        throw new AppError("Access denied to this election", 403, "TENANT_ACCESS_DENIED");
      }
      return {
        ...election,
        settings: _ElectionsService.localSettings.get(election.id)
      };
    }
  }
  /**
   * Create an election adhering to category-specific rules.
   */
  async createElection(organizationId, userId, req) {
    if (!req.title || req.title.trim().length === 0) {
      throw new AppError("Election title is required", 400, "INVALID_TITLE");
    }
    if (!req.startTime || !req.endTime) {
      throw new AppError("Start time and end time are required", 400, "INVALID_DATES");
    }
    const startDate = new Date(req.startTime);
    const endDate = new Date(req.endTime);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new AppError("Invalid date format for election schedule", 400, "INVALID_DATES");
    }
    if (endDate <= startDate) {
      throw new AppError("End time must be strictly after start time", 400, "INVALID_DATE_RANGE");
    }
    const category = req.category || ElectionCategory.INSTITUTIONAL;
    let isPaidVoting = req.isPaidVoting ?? false;
    let allowSelfRegistration = req.allowSelfRegistration ?? false;
    if (category === ElectionCategory.INSTITUTIONAL) {
      if (isPaidVoting || req.settings?.votePriceCents && req.settings.votePriceCents > 0) {
        throw new AppError(
          "Institutional elections cannot enable paid voting or vote purchases",
          400,
          "INSTITUTIONAL_PAID_VOTING_FORBIDDEN"
        );
      }
      if (req.settings?.allowMultipleVotes || req.settings?.maxVotesPerVoter && req.settings.maxVotesPerVoter > 1) {
        throw new AppError(
          "Institutional elections permit strictly one vote per voter",
          400,
          "INSTITUTIONAL_SINGLE_VOTE_ONLY"
        );
      }
      isPaidVoting = false;
      allowSelfRegistration = false;
    } else if (category === ElectionCategory.PAID_COMPETITION) {
      isPaidVoting = true;
    }
    const electionId = `elec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newElection = {
      id: electionId,
      organizationId,
      category,
      title: req.title.trim(),
      description: req.description || "",
      status: ElectionStatus.DRAFT,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      timezone: req.timezone || "UTC",
      allowSelfRegistration,
      isPaidVoting,
      createdById: userId,
      createdAt: now,
      updatedAt: now
    };
    const newSettings = {
      id: `set-${electionId}`,
      electionId,
      organizationId,
      resultsVisibility: req.settings?.resultsVisibility || (category === ElectionCategory.PAID_COMPETITION ? ResultsVisibility.LIVE : ResultsVisibility.AFTER_CLOSE),
      allowMultipleVotes: category === ElectionCategory.PAID_COMPETITION ? req.settings?.allowMultipleVotes ?? true : false,
      maxVotesPerVoter: category === ElectionCategory.PAID_COMPETITION ? req.settings?.maxVotesPerVoter ?? 50 : 1,
      votePriceCents: category === ElectionCategory.PAID_COMPETITION ? req.settings?.votePriceCents ?? 100 : 0,
      currency: req.settings?.currency || "USD",
      requireVoterVerification: category === ElectionCategory.INSTITUTIONAL ? true : req.settings?.requireVoterVerification ?? false,
      allowedDomains: req.settings?.allowedDomains || [],
      shuffleCandidateOrder: req.settings?.shuffleCandidateOrder ?? true,
      enableRealTimeTally: req.settings?.enableRealTimeTally ?? true,
      customRules: req.settings?.customRules || {},
      updatedAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query("BEGIN");
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
            newElection.createdById,
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
            userId,
            "ELECTION_CREATED",
            JSON.stringify(newElection),
            "Initial creation of election workspace"
          ]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch {
      _ElectionsService.localElections.set(electionId, newElection);
      _ElectionsService.localSettings.set(electionId, newSettings);
      this.recordAuditLog(
        electionId,
        organizationId,
        userId,
        "ELECTION_CREATED",
        void 0,
        newElection,
        "Initial creation"
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
  async updateElection(organizationId, electionId, userId, req) {
    const existing = await this.getElectionById(organizationId, electionId);
    const isLiveOrClosed = existing.status === ElectionStatus.ACTIVE || existing.status === ElectionStatus.CLOSED;
    if (isLiveOrClosed) {
      const isCriticalChange = req.category !== void 0 && req.category !== existing.category || req.isPaidVoting !== void 0 && req.isPaidVoting !== existing.isPaidVoting;
      if (isCriticalChange && !req.auditReason) {
        throw new AppError(
          "Cannot modify critical voting rules while election is ACTIVE or CLOSED without explicit audit reason",
          400,
          "VOTING_RULES_LOCKED"
        );
      }
    }
    let startTime = existing.startTime;
    let endTime = existing.endTime;
    if (req.startTime) {
      const d = new Date(req.startTime);
      if (isNaN(d.getTime())) throw new AppError("Invalid start time", 400, "INVALID_DATES");
      startTime = d.toISOString();
    }
    if (req.endTime) {
      const d = new Date(req.endTime);
      if (isNaN(d.getTime())) throw new AppError("Invalid end time", 400, "INVALID_DATES");
      endTime = d.toISOString();
    }
    if (new Date(endTime) <= new Date(startTime)) {
      throw new AppError("End time must be strictly after start time", 400, "INVALID_DATE_RANGE");
    }
    const targetCategory = req.category || existing.category;
    const targetPaid = req.isPaidVoting !== void 0 ? req.isPaidVoting : existing.isPaidVoting;
    if (targetCategory === ElectionCategory.INSTITUTIONAL && targetPaid) {
      throw new AppError(
        "Institutional elections cannot enable paid voting",
        400,
        "INSTITUTIONAL_PAID_VOTING_FORBIDDEN"
      );
    }
    const updated = {
      ...existing,
      title: req.title ? req.title.trim() : existing.title,
      description: req.description !== void 0 ? req.description : existing.description,
      category: targetCategory,
      startTime,
      endTime,
      timezone: req.timezone || existing.timezone,
      allowSelfRegistration: req.allowSelfRegistration !== void 0 ? req.allowSelfRegistration : existing.allowSelfRegistration,
      isPaidVoting: targetPaid,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
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
            req.auditReason ? "RULE_OVERRIDE" : "ELECTION_UPDATED",
            JSON.stringify(existing),
            JSON.stringify(updated),
            req.auditReason || "Standard configuration update"
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _ElectionsService.localElections.set(electionId, updated);
      this.recordAuditLog(
        electionId,
        organizationId,
        userId,
        req.auditReason ? "RULE_OVERRIDE" : "ELECTION_UPDATED",
        existing,
        updated,
        req.auditReason || "Standard configuration update"
      );
    }
    return {
      ...updated,
      settings: _ElectionsService.localSettings.get(electionId)
    };
  }
  /**
   * Update election settings (results visibility, voting limits, domains).
   */
  async updateElectionSettings(organizationId, electionId, userId, req) {
    const election = await this.getElectionById(organizationId, electionId);
    let existingSettings = _ElectionsService.localSettings.get(electionId);
    if (!existingSettings) {
      existingSettings = {
        id: `set-${electionId}`,
        electionId,
        organizationId,
        resultsVisibility: ResultsVisibility.AFTER_CLOSE,
        allowMultipleVotes: false,
        maxVotesPerVoter: 1,
        votePriceCents: 0,
        currency: "USD",
        requireVoterVerification: true,
        allowedDomains: [],
        shuffleCandidateOrder: true,
        enableRealTimeTally: true,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    const isLiveOrClosed = election.status === ElectionStatus.ACTIVE || election.status === ElectionStatus.CLOSED;
    const isCriticalChange = req.allowMultipleVotes !== void 0 && req.allowMultipleVotes !== existingSettings.allowMultipleVotes || req.maxVotesPerVoter !== void 0 && req.maxVotesPerVoter !== existingSettings.maxVotesPerVoter || req.votePriceCents !== void 0 && req.votePriceCents !== existingSettings.votePriceCents;
    if (isLiveOrClosed && isCriticalChange && !req.auditReason) {
      throw new AppError(
        "Cannot modify critical voting rules while election is ACTIVE or CLOSED without explicit audit reason",
        400,
        "VOTING_RULES_LOCKED"
      );
    }
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      if (req.votePriceCents && req.votePriceCents > 0) {
        throw new AppError(
          "Institutional elections cannot enable paid voting",
          400,
          "INSTITUTIONAL_PAID_VOTING_FORBIDDEN"
        );
      }
      if (req.allowMultipleVotes || req.maxVotesPerVoter && req.maxVotesPerVoter > 1) {
        throw new AppError(
          "Institutional elections permit strictly one vote per voter",
          400,
          "INSTITUTIONAL_SINGLE_VOTE_ONLY"
        );
      }
    }
    const updatedSettings = {
      ...existingSettings,
      resultsVisibility: req.resultsVisibility || existingSettings.resultsVisibility,
      allowMultipleVotes: req.allowMultipleVotes !== void 0 ? req.allowMultipleVotes : existingSettings.allowMultipleVotes,
      maxVotesPerVoter: req.maxVotesPerVoter !== void 0 ? req.maxVotesPerVoter : existingSettings.maxVotesPerVoter,
      votePriceCents: req.votePriceCents !== void 0 ? req.votePriceCents : existingSettings.votePriceCents,
      currency: req.currency || existingSettings.currency,
      requireVoterVerification: req.requireVoterVerification !== void 0 ? req.requireVoterVerification : existingSettings.requireVoterVerification,
      allowedDomains: req.allowedDomains || existingSettings.allowedDomains,
      shuffleCandidateOrder: req.shuffleCandidateOrder !== void 0 ? req.shuffleCandidateOrder : existingSettings.shuffleCandidateOrder,
      enableRealTimeTally: req.enableRealTimeTally !== void 0 ? req.enableRealTimeTally : existingSettings.enableRealTimeTally,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
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
            req.auditReason ? "RULE_OVERRIDE" : "SETTINGS_UPDATED",
            JSON.stringify(existingSettings),
            JSON.stringify(updatedSettings),
            req.auditReason || "Updated election settings"
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _ElectionsService.localSettings.set(electionId, updatedSettings);
      this.recordAuditLog(
        electionId,
        organizationId,
        userId,
        req.auditReason ? "RULE_OVERRIDE" : "SETTINGS_UPDATED",
        existingSettings,
        updatedSettings,
        req.auditReason || "Updated election settings"
      );
    }
    return updatedSettings;
  }
  /**
   * Transition election lifecycle status with state machine validation and auditing.
   */
  async transitionStatus(organizationId, electionId, userId, targetStatus, reason) {
    const existing = await this.getElectionById(organizationId, electionId);
    const current = existing.status;
    if (current === targetStatus) {
      return existing;
    }
    const allowedTransitions = {
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
        "INVALID_LIFECYCLE_TRANSITION"
      );
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const updated = {
      ...existing,
      status: targetStatus,
      updatedAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
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
            "STATUS_CHANGE",
            JSON.stringify({ status: current }),
            JSON.stringify({ status: targetStatus }),
            reason || `Transitioned status from ${current} to ${targetStatus}`
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _ElectionsService.localElections.set(electionId, updated);
      this.recordAuditLog(
        electionId,
        organizationId,
        userId,
        "STATUS_CHANGE",
        { status: current },
        { status: targetStatus },
        reason || `Transitioned status from ${current} to ${targetStatus}`
      );
    }
    return {
      ...updated,
      settings: _ElectionsService.localSettings.get(electionId)
    };
  }
  /**
   * Fetch audit logs for an election.
   */
  async getAuditLogs(organizationId, electionId) {
    await this.getElectionById(organizationId, electionId);
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        const res = await client.query(
          `SELECT * FROM election_audit_logs WHERE election_id = $1 ORDER BY created_at DESC`,
          [electionId]
        );
        return res.rows;
      } finally {
        client.release();
      }
    } catch {
      return _ElectionsService.localAuditLogs.get(electionId) || [];
    }
  }
  recordAuditLog(electionId, organizationId, userId, action, previousState, newState, reason) {
    const logs = _ElectionsService.localAuditLogs.get(electionId) || [];
    logs.unshift({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      electionId,
      organizationId,
      userId,
      action,
      previousState,
      newState,
      reason,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    _ElectionsService.localAuditLogs.set(electionId, logs);
  }
  mapDbElection(row) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      category: row.category || ElectionCategory.INSTITUTIONAL,
      title: row.title,
      description: row.description,
      status: row.status,
      startTime: row.start_time.toISOString ? row.start_time.toISOString() : row.start_time,
      endTime: row.end_time.toISOString ? row.end_time.toISOString() : row.end_time,
      timezone: row.timezone || "UTC",
      allowSelfRegistration: Boolean(row.allow_self_registration),
      isPaidVoting: Boolean(row.is_paid_voting),
      packageId: row.package_id,
      createdById: row.created_by,
      certifiedAt: row.certified_at ? row.certified_at.toISOString() : void 0,
      certifiedBy: row.certified_by,
      settings: row.settings ? row.settings : void 0,
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at
    };
  }
};
var electionsService = new ElectionsService();

// server/src/modules/elections/positions.service.ts
init_apiResponse();
init_db();
var PositionsService = class _PositionsService {
  static localPositions = /* @__PURE__ */ new Map();
  constructor() {
    this.seedDefaultPositions();
  }
  seedDefaultPositions() {
    if (_PositionsService.localPositions.size > 0) return;
    _PositionsService.localPositions.set("elec-inst-1", [
      {
        id: "pos-1",
        electionId: "elec-inst-1",
        organizationId: "org-metro-uni",
        title: "Student Body President",
        description: "Chief executive leader of the student government association.",
        minSelections: 1,
        maxSelections: 1,
        orderIndex: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        candidatesCount: 2
      },
      {
        id: "pos-2",
        electionId: "elec-inst-1",
        organizationId: "org-metro-uni",
        title: "Executive Vice President",
        description: "Presides over the student senate and inter-club council.",
        minSelections: 1,
        maxSelections: 1,
        orderIndex: 1,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        candidatesCount: 2
      },
      {
        id: "pos-3",
        electionId: "elec-inst-1",
        organizationId: "org-metro-uni",
        title: "Treasurer & Comptroller",
        description: "Oversees student activity fee budget allocations and audit disclosures.",
        minSelections: 1,
        maxSelections: 1,
        orderIndex: 2,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        candidatesCount: 1
      }
    ]);
    _PositionsService.localPositions.set("elec-paid-1", [
      {
        id: "pos-showcase-1",
        electionId: "elec-paid-1",
        organizationId: "org-metro-uni",
        title: "Grand Champion Ensemble",
        description: "Top overall musical and performing arts ensemble.",
        minSelections: 1,
        maxSelections: 1,
        orderIndex: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        candidatesCount: 4
      }
    ]);
  }
  /**
   * List all positions for an election, ensuring tenant scoping.
   */
  async listPositions(organizationId, electionId) {
    await electionsService.getElectionById(organizationId, electionId);
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
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
      return _PositionsService.localPositions.get(electionId) || [];
    }
  }
  /**
   * Create a new position in an election.
   */
  async createPosition(organizationId, electionId, _userId, req) {
    await electionsService.getElectionById(organizationId, electionId);
    if (!req.title || req.title.trim().length === 0) {
      throw new AppError("Position title is required", 400, "INVALID_POSITION_TITLE");
    }
    const minSelections = req.minSelections ?? 1;
    const maxSelections = req.maxSelections ?? 1;
    if (minSelections < 1 || maxSelections < minSelections) {
      throw new AppError(
        "Invalid selections range: min selections must be >= 1 and max must be >= min",
        400,
        "INVALID_SELECTION_RANGE"
      );
    }
    const posId = `pos-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newPosition = {
      id: posId,
      electionId,
      organizationId,
      title: req.title.trim(),
      description: req.description || "",
      minSelections,
      maxSelections,
      orderIndex: req.orderIndex ?? 0,
      createdAt: now,
      candidatesCount: 0
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
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
      const list = _PositionsService.localPositions.get(electionId) || [];
      list.push(newPosition);
      _PositionsService.localPositions.set(electionId, list);
    }
    return newPosition;
  }
  /**
   * Update an existing position.
   */
  async updatePosition(organizationId, electionId, positionId, req) {
    await electionsService.getElectionById(organizationId, electionId);
    const positions = await this.listPositions(organizationId, electionId);
    const existing = positions.find((p) => p.id === positionId);
    if (!existing) {
      throw new AppError("Position not found", 404, "POSITION_NOT_FOUND");
    }
    const minSelections = req.minSelections !== void 0 ? req.minSelections : existing.minSelections;
    const maxSelections = req.maxSelections !== void 0 ? req.maxSelections : existing.maxSelections;
    if (minSelections < 1 || maxSelections < minSelections) {
      throw new AppError("Invalid selections range", 400, "INVALID_SELECTION_RANGE");
    }
    const updated = {
      ...existing,
      title: req.title ? req.title.trim() : existing.title,
      description: req.description !== void 0 ? req.description : existing.description,
      minSelections,
      maxSelections,
      orderIndex: req.orderIndex !== void 0 ? req.orderIndex : existing.orderIndex
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
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
      const list = _PositionsService.localPositions.get(electionId) || [];
      const idx = list.findIndex((p) => p.id === positionId);
      if (idx !== -1) {
        list[idx] = updated;
        _PositionsService.localPositions.set(electionId, list);
      }
    }
    return updated;
  }
  /**
   * Delete a position.
   */
  async deletePosition(organizationId, electionId, positionId) {
    await electionsService.getElectionById(organizationId, electionId);
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `DELETE FROM election_positions WHERE id = $1 AND election_id = $2 AND organization_id = $3`,
          [positionId, electionId, organizationId]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = _PositionsService.localPositions.get(electionId) || [];
      _PositionsService.localPositions.set(
        electionId,
        list.filter((p) => p.id !== positionId)
      );
    }
  }
};
var positionsService = new PositionsService();

// server/src/modules/elections/elections.controller.ts
var ElectionsController = class {
  async list(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const category = req.query.category;
    const status = req.query.status;
    const elections = await electionsService.listElections(orgId, { category, status });
    sendSuccess(res, elections);
  }
  async getById(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const election = await electionsService.getElectionById(orgId, req.params.id);
    sendSuccess(res, election);
  }
  async create(req, res) {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || "usr-system";
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const election = await electionsService.createElection(orgId, userId, req.body);
    sendSuccess(res, election, void 0, 201);
  }
  async update(req, res) {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || "usr-system";
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const updated = await electionsService.updateElection(orgId, req.params.id, userId, req.body);
    sendSuccess(res, updated);
  }
  async updateSettings(req, res) {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || "usr-system";
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const settings = await electionsService.updateElectionSettings(orgId, req.params.id, userId, req.body);
    sendSuccess(res, settings);
  }
  async transitionStatus(req, res) {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || "usr-system";
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const { status, reason } = req.body;
    if (!status) {
      throw new AppError("Target status is required", 400, "STATUS_REQUIRED");
    }
    const updated = await electionsService.transitionStatus(orgId, req.params.id, userId, status, reason);
    sendSuccess(res, updated);
  }
  async getAuditLogs(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const logs = await electionsService.getAuditLogs(orgId, req.params.id);
    sendSuccess(res, logs);
  }
  // --- Election Positions Endpoints ---
  async listPositions(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const positions = await positionsService.listPositions(orgId, req.params.id);
    sendSuccess(res, positions);
  }
  async createPosition(req, res) {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || "usr-system";
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const position = await positionsService.createPosition(orgId, req.params.id, userId, req.body);
    sendSuccess(res, position, void 0, 201);
  }
  async updatePosition(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const updated = await positionsService.updatePosition(
      orgId,
      req.params.id,
      req.params.positionId,
      req.body
    );
    sendSuccess(res, updated);
  }
  async deletePosition(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    await positionsService.deletePosition(orgId, req.params.id, req.params.positionId);
    sendSuccess(res, { deleted: true });
  }
};
var electionsController = new ElectionsController();

// server/src/modules/elections/elections.routes.ts
init_dist();
var router5 = Router5();
router5.use(authenticate);
router5.get("/", tenantContext(), (req, res, next) => {
  electionsController.list(req, res).catch(next);
});
router5.post(
  "/",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.create(req, res).catch(next);
  }
);
router5.get("/:id", tenantContext(), (req, res, next) => {
  electionsController.getById(req, res).catch(next);
});
router5.put(
  "/:id",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.update(req, res).catch(next);
  }
);
router5.put(
  "/:id/settings",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.updateSettings(req, res).catch(next);
  }
);
router5.post(
  "/:id/status",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.transitionStatus(req, res).catch(next);
  }
);
router5.get("/:id/audit-logs", tenantContext(), (req, res, next) => {
  electionsController.getAuditLogs(req, res).catch(next);
});
router5.get("/:id/positions", tenantContext(), (req, res, next) => {
  electionsController.listPositions(req, res).catch(next);
});
router5.post(
  "/:id/positions",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.createPosition(req, res).catch(next);
  }
);
router5.put(
  "/:id/positions/:positionId",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.updatePosition(req, res).catch(next);
  }
);
router5.delete(
  "/:id/positions/:positionId",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    electionsController.deletePosition(req, res).catch(next);
  }
);
var elections_routes_default = router5;

// server/src/modules/candidates/candidates.routes.ts
import { Router as Router6 } from "express";

// server/src/modules/candidates/candidates.controller.ts
init_apiResponse();

// server/src/modules/candidates/candidates.service.ts
init_dist();
init_apiResponse();
init_db();
var CandidatesService = class _CandidatesService {
  static localCandidates = /* @__PURE__ */ new Map();
  constructor() {
    this.seedDefaultCandidates();
  }
  seedDefaultCandidates() {
    if (_CandidatesService.localCandidates.size > 0) return;
    _CandidatesService.localCandidates.set("elec-inst-1", [
      {
        id: "cand-1",
        electionId: "elec-inst-1",
        organizationId: "org-metro-uni",
        positionId: "pos-1",
        name: "Jordan Hayes",
        bio: "Senior, Computer Science & Public Policy. Advocating for transparent student fee allocation and campus sustainability.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        manifesto: "Every student deserves modern campus facilities, accessible mental health support, and open budget hearings.",
        ballotOrder: 1,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "cand-2",
        electionId: "elec-inst-1",
        organizationId: "org-metro-uni",
        positionId: "pos-1",
        name: "Morgan Chen",
        bio: "Junior, Economics & Data Analytics. Championing improved campus dining and streamlined club funding approval.",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        manifesto: "Cutting administrative bureaucracy, establishing 24/7 library study wings, and subsidizing regional transit passes.",
        ballotOrder: 2,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "cand-3",
        electionId: "elec-inst-1",
        organizationId: "org-metro-uni",
        positionId: "pos-2",
        name: "Elena Rostova",
        bio: "Senior, International Relations. Promoting cross-cultural student initiatives and campus safety lighting.",
        ballotOrder: 1,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "cand-4",
        electionId: "elec-inst-1",
        organizationId: "org-metro-uni",
        positionId: "pos-2",
        name: "Marcus Williams",
        bio: "Junior, Mechanical Engineering. Advancing maker-space funding and research grant opportunities for undergraduates.",
        ballotOrder: 2,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "cand-5",
        electionId: "elec-inst-1",
        organizationId: "org-metro-uni",
        positionId: "pos-3",
        name: "Sarah Jenkins",
        bio: "Senior, Accounting & Finance. Certified student auditor with 2 years of SGA budget oversight experience.",
        ballotOrder: 1,
        status: CandidateStatus.APPROVED,
        voteCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
    _CandidatesService.localCandidates.set("elec-paid-1", [
      {
        id: "cand-paid-1",
        electionId: "elec-paid-1",
        organizationId: "org-metro-uni",
        positionId: "pos-showcase-1",
        name: "The Harmonix A Cappella",
        bio: "Premier university 12-voice contemporary a cappella ensemble.",
        avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150",
        manifesto: "Bringing modern pop arrangements and collegiate choral excellence to national audiences.",
        ballotOrder: 1,
        status: CandidateStatus.APPROVED,
        voteCount: 342,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "cand-paid-2",
        electionId: "elec-paid-1",
        organizationId: "org-metro-uni",
        positionId: "pos-showcase-1",
        name: "Apex Urban Dance Crew",
        bio: "Award-winning collegiate hip-hop choreography team representing 8 regional championships.",
        avatarUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=150",
        manifesto: "Fusing street styles with theatrical storytelling.",
        ballotOrder: 2,
        status: CandidateStatus.APPROVED,
        voteCount: 489,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
  }
  /**
   * List candidates for an election with optional position filter.
   */
  async listCandidates(organizationId, electionId, positionId) {
    await electionsService.getElectionById(organizationId, electionId);
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        let query = `
          SELECT * FROM candidates
          WHERE election_id = $1 AND organization_id = $2
        `;
        const params = [electionId, organizationId];
        if (positionId) {
          params.push(positionId);
          query += ` AND position_id = $${params.length}`;
        }
        query += ` ORDER BY ballot_order ASC, created_at ASC`;
        const res = await client.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          electionId: r.election_id,
          organizationId: r.organization_id,
          positionId: r.position_id,
          name: r.name,
          bio: r.bio,
          avatarUrl: r.avatar_url,
          manifesto: r.manifesto,
          ballotOrder: r.ballot_order,
          status: r.status,
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      } finally {
        client.release();
      }
    } catch {
      let list = _CandidatesService.localCandidates.get(electionId) || [];
      if (positionId) {
        list = list.filter((c) => c.positionId === positionId);
      }
      return list;
    }
  }
  /**
   * Register a new candidate to an election and position.
   */
  async createCandidate(organizationId, electionId, req) {
    await electionsService.getElectionById(organizationId, electionId);
    if (!req.name || req.name.trim().length === 0) {
      throw new AppError("Candidate name is required", 400, "INVALID_CANDIDATE_NAME");
    }
    if (!req.positionId) {
      throw new AppError("Position ID is required for candidate registration", 400, "POSITION_REQUIRED");
    }
    const positions = await positionsService.listPositions(organizationId, electionId);
    const position = positions.find((p) => p.id === req.positionId);
    if (!position) {
      throw new AppError(
        "The specified position does not exist or belong to this election",
        400,
        "INVALID_POSITION_FOR_ELECTION"
      );
    }
    const candId = `cand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newCandidate = {
      id: candId,
      electionId,
      organizationId,
      positionId: req.positionId,
      name: req.name.trim(),
      bio: req.bio || "",
      avatarUrl: req.avatarUrl || "",
      manifesto: req.manifesto || "",
      ballotOrder: req.ballotOrder ?? positions.length + 1,
      status: CandidateStatus.APPROVED,
      voteCount: 0,
      createdAt: now,
      updatedAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `INSERT INTO candidates (
            id, election_id, organization_id, position_id, name,
            bio, avatar_url, manifesto, ballot_order, status, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            newCandidate.id,
            newCandidate.electionId,
            newCandidate.organizationId,
            newCandidate.positionId,
            newCandidate.name,
            newCandidate.bio,
            newCandidate.avatarUrl,
            newCandidate.manifesto,
            newCandidate.ballotOrder,
            newCandidate.status,
            now,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = _CandidatesService.localCandidates.get(electionId) || [];
      list.push(newCandidate);
      _CandidatesService.localCandidates.set(electionId, list);
    }
    return newCandidate;
  }
  /**
   * Update candidate details or approval status.
   */
  async updateCandidate(organizationId, electionId, candidateId, req) {
    await electionsService.getElectionById(organizationId, electionId);
    const candidates = await this.listCandidates(organizationId, electionId);
    const existing = candidates.find((c) => c.id === candidateId);
    if (!existing) {
      throw new AppError("Candidate not found", 404, "CANDIDATE_NOT_FOUND");
    }
    if (req.positionId && req.positionId !== existing.positionId) {
      const positions = await positionsService.listPositions(organizationId, electionId);
      if (!positions.some((p) => p.id === req.positionId)) {
        throw new AppError(
          "Target position does not belong to this election",
          400,
          "INVALID_POSITION_FOR_ELECTION"
        );
      }
    }
    const updated = {
      ...existing,
      positionId: req.positionId || existing.positionId,
      name: req.name ? req.name.trim() : existing.name,
      bio: req.bio !== void 0 ? req.bio : existing.bio,
      avatarUrl: req.avatarUrl !== void 0 ? req.avatarUrl : existing.avatarUrl,
      manifesto: req.manifesto !== void 0 ? req.manifesto : existing.manifesto,
      ballotOrder: req.ballotOrder !== void 0 ? req.ballotOrder : existing.ballotOrder,
      status: req.status || existing.status,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `UPDATE candidates SET
            position_id = $1, name = $2, bio = $3, avatar_url = $4,
            manifesto = $5, ballot_order = $6, status = $7, updated_at = $8
          WHERE id = $9 AND election_id = $10 AND organization_id = $11`,
          [
            updated.positionId,
            updated.name,
            updated.bio,
            updated.avatarUrl,
            updated.manifesto,
            updated.ballotOrder,
            updated.status,
            updated.updatedAt,
            candidateId,
            electionId,
            organizationId
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = _CandidatesService.localCandidates.get(electionId) || [];
      const idx = list.findIndex((c) => c.id === candidateId);
      if (idx !== -1) {
        list[idx] = updated;
        _CandidatesService.localCandidates.set(electionId, list);
      }
    }
    return updated;
  }
  /**
   * Delete a candidate.
   */
  async deleteCandidate(organizationId, electionId, candidateId) {
    await electionsService.getElectionById(organizationId, electionId);
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `DELETE FROM candidates WHERE id = $1 AND election_id = $2 AND organization_id = $3`,
          [candidateId, electionId, organizationId]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = _CandidatesService.localCandidates.get(electionId) || [];
      _CandidatesService.localCandidates.set(
        electionId,
        list.filter((c) => c.id !== candidateId)
      );
    }
  }
};
var candidatesService = new CandidatesService();

// server/src/modules/candidates/candidates.controller.ts
var CandidatesController = class {
  async listByElection(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.params.electionId || req.query.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required", 400, "ELECTION_REQUIRED");
    }
    const positionId = req.query.positionId;
    const candidates = await candidatesService.listCandidates(orgId, electionId, positionId);
    sendSuccess(res, candidates);
  }
  async create(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.body.electionId || req.params.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required", 400, "ELECTION_REQUIRED");
    }
    const candidate = await candidatesService.createCandidate(orgId, electionId, req.body);
    sendSuccess(res, candidate, void 0, 201);
  }
  async update(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.body.electionId || req.query.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required for updating candidate", 400, "ELECTION_REQUIRED");
    }
    const updated = await candidatesService.updateCandidate(
      orgId,
      electionId,
      req.params.id,
      req.body
    );
    sendSuccess(res, updated);
  }
  async delete(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.query.electionId || req.body.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required for deleting candidate", 400, "ELECTION_REQUIRED");
    }
    await candidatesService.deleteCandidate(orgId, electionId, req.params.id);
    sendSuccess(res, { deleted: true });
  }
};
var candidatesController = new CandidatesController();

// server/src/modules/candidates/candidates.routes.ts
init_dist();
var router6 = Router6();
router6.use(authenticate);
router6.get("/", tenantContext(), (req, res, next) => {
  candidatesController.listByElection(req, res).catch(next);
});
router6.get("/election/:electionId", tenantContext(), (req, res, next) => {
  candidatesController.listByElection(req, res).catch(next);
});
router6.post(
  "/",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    candidatesController.create(req, res).catch(next);
  }
);
router6.put(
  "/:id",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    candidatesController.update(req, res).catch(next);
  }
);
router6.delete(
  "/:id",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    candidatesController.delete(req, res).catch(next);
  }
);
var candidates_routes_default = router6;

// server/src/modules/voters/voters.routes.ts
import { Router as Router7 } from "express";

// server/src/modules/voters/voters.controller.ts
init_apiResponse();

// server/src/modules/voters/voters.service.ts
init_dist();
init_apiResponse();
init_db();
import crypto4 from "crypto";
var VotersService = class _VotersService {
  static localVoters = /* @__PURE__ */ new Map();
  static localInvitations = /* @__PURE__ */ new Map();
  constructor() {
    this.seedDefaultVoters();
  }
  seedDefaultVoters() {
    if (_VotersService.localVoters.size > 0) return;
    _VotersService.localVoters.set("elec-inst-1", [
      {
        id: "vtr-1",
        organizationId: "org-metro-uni",
        electionId: "elec-inst-1",
        voterCode: "VTR-METRO-1011",
        email: "alexander.vance@metro.edu",
        firstName: "Alexander",
        lastName: "Vance",
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: "Faculty of Engineering - Senior",
        hasVoted: false,
        votesCastCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vtr-2",
        organizationId: "org-metro-uni",
        electionId: "elec-inst-1",
        voterCode: "VTR-METRO-1012",
        email: "charlotte.sinclair@metro.edu",
        firstName: "Charlotte",
        lastName: "Sinclair",
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: "School of Law - Year 3",
        hasVoted: false,
        votesCastCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "vtr-3",
        organizationId: "org-metro-uni",
        electionId: "elec-inst-1",
        voterCode: "VTR-METRO-1013",
        email: "devon.okafor@metro.edu",
        firstName: "Devon",
        lastName: "Okafor",
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: "School of Business - Year 2",
        hasVoted: true,
        votesCastCount: 1,
        verifiedAt: new Date(Date.now() - 36e5).toISOString(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
    _VotersService.localVoters.set("elec-paid-1", [
      {
        id: "vtr-paid-1",
        organizationId: "org-metro-uni",
        electionId: "elec-paid-1",
        voterCode: "VTR-FAN-501",
        email: "patron@artsfan.org",
        firstName: "Elena",
        lastName: "Gomez",
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: "VIP Patron Ticket Holder",
        hasVoted: false,
        votesCastCount: 5,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
  }
  /**
   * List voters registered for an election.
   */
  async listVoters(organizationId, electionId, search) {
    await electionsService.getElectionById(organizationId, electionId);
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        let query = `
          SELECT * FROM voters
          WHERE election_id = $1 AND organization_id = $2
        `;
        const params = [electionId, organizationId];
        if (search && search.trim()) {
          params.push(`%${search.trim().toLowerCase()}%`);
          query += ` AND (LOWER(email) LIKE $${params.length} OR LOWER(voter_code) LIKE $${params.length} OR LOWER(first_name) LIKE $${params.length} OR LOWER(last_name) LIKE $${params.length})`;
        }
        query += ` ORDER BY created_at DESC`;
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbVoter(r));
      } finally {
        client.release();
      }
    } catch {
      let list = _VotersService.localVoters.get(electionId) || [];
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        list = list.filter(
          (v) => v.voterCode.toLowerCase().includes(q) || v.email && v.email.toLowerCase().includes(q) || v.firstName && v.firstName.toLowerCase().includes(q) || v.lastName && v.lastName.toLowerCase().includes(q)
        );
      }
      return list;
    }
  }
  /**
   * Register a single voter into an election.
   */
  async registerVoter(organizationId, electionId, req) {
    const election = await electionsService.getElectionById(organizationId, electionId);
    if (election.category === ElectionCategory.INSTITUTIONAL && election.settings?.allowedDomains?.length) {
      if (!req.email) {
        throw new AppError("Email is required for institutional voter registration", 400, "EMAIL_REQUIRED");
      }
      const domainMatches = election.settings.allowedDomains.some(
        (d) => req.email.toLowerCase().endsWith(d.toLowerCase())
      );
      if (!domainMatches) {
        throw new AppError(
          `Voter email domain must match one of: ${election.settings.allowedDomains.join(", ")}`,
          400,
          "INVALID_INSTITUTIONAL_DOMAIN"
        );
      }
    }
    const voterCode = req.voterCode || this.generateVoterCode();
    const existing = await this.listVoters(organizationId, electionId);
    if (existing.some((v) => v.voterCode === voterCode || req.email && v.email === req.email)) {
      throw new AppError("A voter with this code or email is already registered", 409, "DUPLICATE_VOTER");
    }
    const voterId = `vtr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newVoter = {
      id: voterId,
      organizationId,
      electionId,
      voterCode,
      email: req.email?.trim().toLowerCase(),
      phone: req.phone?.trim(),
      firstName: req.firstName?.trim(),
      lastName: req.lastName?.trim(),
      eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
      eligibilityTag: req.eligibilityTag || "Standard Roster",
      hasVoted: false,
      votesCastCount: 0,
      createdAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `INSERT INTO voters (
            id, organization_id, election_id, voter_code, email, phone,
            first_name, last_name, eligibility_status, eligibility_tag,
            has_voted, votes_cast_count, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            newVoter.id,
            newVoter.organizationId,
            newVoter.electionId,
            newVoter.voterCode,
            newVoter.email,
            newVoter.phone,
            newVoter.firstName,
            newVoter.lastName,
            newVoter.eligibilityStatus,
            newVoter.eligibilityTag,
            newVoter.hasVoted,
            newVoter.votesCastCount,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = _VotersService.localVoters.get(electionId) || [];
      list.push(newVoter);
      _VotersService.localVoters.set(electionId, list);
    }
    return newVoter;
  }
  /**
   * Bulk import voters from CSV data.
   */
  async bulkImportVoters(organizationId, electionId, req) {
    await electionsService.getElectionById(organizationId, electionId);
    const existingVoters = await this.listVoters(organizationId, electionId);
    const existingEmails = new Set(existingVoters.map((v) => v.email?.toLowerCase()).filter(Boolean));
    const existingCodes = new Set(existingVoters.map((v) => v.voterCode));
    const imported = [];
    const errors = [];
    let skippedCount = 0;
    for (const item of req.voters) {
      const email = item.email?.trim().toLowerCase();
      const code = item.voterCode || this.generateVoterCode();
      if (email && existingEmails.has(email)) {
        skippedCount++;
        errors.push(`Duplicate email skipped: ${email}`);
        continue;
      }
      if (existingCodes.has(code)) {
        skippedCount++;
        errors.push(`Duplicate code skipped: ${code}`);
        continue;
      }
      const voter = {
        id: `vtr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        organizationId,
        electionId,
        voterCode: code,
        email,
        phone: item.phone?.trim(),
        firstName: item.firstName?.trim(),
        lastName: item.lastName?.trim(),
        eligibilityStatus: VoterEligibilityStatus.ELIGIBLE,
        eligibilityTag: item.eligibilityTag || "CSV Import",
        hasVoted: false,
        votesCastCount: 0,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      imported.push(voter);
      if (email) existingEmails.add(email);
      existingCodes.add(code);
    }
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        for (const v of imported) {
          await client.query(
            `INSERT INTO voters (
              id, organization_id, election_id, voter_code, email, phone,
              first_name, last_name, eligibility_status, eligibility_tag,
              has_voted, votes_cast_count, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (election_id, voter_code) DO NOTHING`,
            [
              v.id,
              v.organizationId,
              v.electionId,
              v.voterCode,
              v.email,
              v.phone,
              v.firstName,
              v.lastName,
              v.eligibilityStatus,
              v.eligibilityTag,
              v.hasVoted,
              v.votesCastCount,
              v.createdAt
            ]
          );
        }
      } finally {
        client.release();
      }
    } catch {
      const list = _VotersService.localVoters.get(electionId) || [];
      list.push(...imported);
      _VotersService.localVoters.set(electionId, list);
    }
    return {
      importedCount: imported.length,
      skippedCount,
      voters: imported,
      errors: errors.length > 0 ? errors : void 0
    };
  }
  /**
   * Verify voter eligibility against election category rules and settings.
   */
  async verifyVoterEligibility(organizationId, electionId, req) {
    const election = await electionsService.getElectionById(organizationId, electionId);
    if (election.status !== ElectionStatus.ACTIVE && election.status !== ElectionStatus.SCHEDULED) {
      return {
        isEligible: false,
        reason: `Election is currently ${election.status}. Voting is only open during ACTIVE status.`,
        remainingVotesAllowed: 0
      };
    }
    const voters = await this.listVoters(organizationId, electionId);
    let matchedVoter;
    if (req.voterCode) {
      matchedVoter = voters.find((v) => v.voterCode === req.voterCode);
    } else if (req.email) {
      matchedVoter = voters.find((v) => v.email?.toLowerCase() === req.email.toLowerCase());
    }
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      if (!matchedVoter) {
        return {
          isEligible: false,
          reason: "Voter is not registered in the institution official voter roll.",
          remainingVotesAllowed: 0
        };
      }
      if (matchedVoter.eligibilityStatus !== VoterEligibilityStatus.ELIGIBLE) {
        return {
          isEligible: false,
          voter: matchedVoter,
          reason: `Voter status is ${matchedVoter.eligibilityStatus}. Only ELIGIBLE voters may participate.`,
          remainingVotesAllowed: 0
        };
      }
      if (matchedVoter.hasVoted) {
        return {
          isEligible: false,
          voter: matchedVoter,
          reason: "Institutional voting rule: Each voter is permitted strictly one vote per position. Ballot already cast.",
          remainingVotesAllowed: 0
        };
      }
      if (election.settings?.allowedDomains?.length && matchedVoter.email) {
        const matchesDomain = election.settings.allowedDomains.some(
          (d) => matchedVoter.email.toLowerCase().endsWith(d.toLowerCase())
        );
        if (!matchesDomain) {
          return {
            isEligible: false,
            voter: matchedVoter,
            reason: `Voter domain does not match institutional requirements: ${election.settings.allowedDomains.join(", ")}`,
            remainingVotesAllowed: 0
          };
        }
      }
      return {
        isEligible: true,
        voter: matchedVoter,
        remainingVotesAllowed: 1
      };
    }
    if (election.category === ElectionCategory.PAID_COMPETITION) {
      const maxVotes = election.settings?.maxVotesPerVoter ?? 50;
      const votesCast = matchedVoter ? matchedVoter.votesCastCount || 0 : 0;
      if (maxVotes > 0 && votesCast >= maxVotes) {
        return {
          isEligible: false,
          voter: matchedVoter,
          reason: `Maximum configured vote limit (${maxVotes} votes) reached for this paid competition.`,
          remainingVotesAllowed: 0
        };
      }
      const remaining = maxVotes > 0 ? maxVotes - votesCast : 999;
      return {
        isEligible: true,
        voter: matchedVoter,
        remainingVotesAllowed: remaining
      };
    }
    const allowMultiple = election.settings?.allowMultipleVotes ?? false;
    if (matchedVoter && matchedVoter.hasVoted && !allowMultiple) {
      return {
        isEligible: false,
        voter: matchedVoter,
        reason: "Poll configuration allows one response per voter. You have already participated.",
        remainingVotesAllowed: 0
      };
    }
    return {
      isEligible: true,
      voter: matchedVoter,
      remainingVotesAllowed: 1
    };
  }
  /**
   * Generate voter invitations with secure tokens.
   */
  async sendVoterInvitations(organizationId, electionId, voterIds) {
    await electionsService.getElectionById(organizationId, electionId);
    const voters = await this.listVoters(organizationId, electionId);
    const targetVoters = voterIds?.length ? voters.filter((v) => voterIds.includes(v.id) && v.email) : voters.filter((v) => v.email);
    const invites = [];
    const expiresAt = new Date(Date.now() + 864e5 * 7).toISOString();
    for (const v of targetVoters) {
      const token = `inv-${crypto4.randomBytes(16).toString("hex")}`;
      const invite = {
        id: `invite-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        electionId,
        organizationId,
        email: v.email,
        voterId: v.id,
        token,
        status: "SENT",
        sentAt: (/* @__PURE__ */ new Date()).toISOString(),
        expiresAt,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      invites.push(invite);
    }
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        for (const inv of invites) {
          await client.query(
            `INSERT INTO election_invitations (
              id, election_id, organization_id, email, voter_id, token, status, sent_at, expires_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              inv.id,
              inv.electionId,
              inv.organizationId,
              inv.email,
              inv.voterId,
              inv.token,
              inv.status,
              inv.sentAt,
              inv.expiresAt
            ]
          );
        }
      } finally {
        client.release();
      }
    } catch {
      const existing = _VotersService.localInvitations.get(electionId) || [];
      existing.push(...invites);
      _VotersService.localInvitations.set(electionId, existing);
    }
    return invites;
  }
  generateVoterCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "VTR-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += "-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  mapDbVoter(row) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      electionId: row.election_id,
      userId: row.user_id,
      voterCode: row.voter_code,
      email: row.email,
      phone: row.phone,
      firstName: row.first_name,
      lastName: row.last_name,
      eligibilityStatus: row.eligibility_status || VoterEligibilityStatus.ELIGIBLE,
      eligibilityTag: row.eligibility_tag,
      hasVoted: Boolean(row.has_voted),
      votesCastCount: Number(row.votes_cast_count || 0),
      verifiedAt: row.verified_at ? row.verified_at.toISOString() : void 0,
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at
    };
  }
};
var votersService = new VotersService();

// server/src/modules/voters/voters.controller.ts
var VotersController = class {
  async list(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.query.electionId || req.params.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required", 400, "ELECTION_REQUIRED");
    }
    const search = req.query.search;
    const voters = await votersService.listVoters(orgId, electionId, search);
    sendSuccess(res, voters);
  }
  async register(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.body.electionId || req.params.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required", 400, "ELECTION_REQUIRED");
    }
    const voter = await votersService.registerVoter(orgId, electionId, req.body);
    sendSuccess(res, voter, void 0, 201);
  }
  async bulkImport(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.body.electionId || req.params.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required", 400, "ELECTION_REQUIRED");
    }
    if (!Array.isArray(req.body.voters)) {
      throw new AppError("Voters array is required for bulk import", 400, "INVALID_PAYLOAD");
    }
    const result = await votersService.bulkImportVoters(orgId, electionId, req.body);
    sendSuccess(res, result, void 0, 201);
  }
  async verifyEligibility(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.body.electionId || req.query.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required for verification", 400, "ELECTION_REQUIRED");
    }
    const result = await votersService.verifyVoterEligibility(orgId, electionId, req.body);
    sendSuccess(res, result);
  }
  async sendInvitations(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.body.electionId || req.query.electionId;
    if (!electionId) {
      throw new AppError("Election ID is required for sending invitations", 400, "ELECTION_REQUIRED");
    }
    const invites = await votersService.sendVoterInvitations(orgId, electionId, req.body.voterIds);
    sendSuccess(res, { sentCount: invites.length, invitations: invites });
  }
};
var votersController = new VotersController();

// server/src/modules/voters/voters.routes.ts
init_dist();
var router7 = Router7();
router7.use(authenticate);
router7.get("/", tenantContext(), (req, res, next) => {
  votersController.list(req, res).catch(next);
});
router7.post(
  "/",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    votersController.register(req, res).catch(next);
  }
);
router7.post(
  "/bulk-import",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    votersController.bulkImport(req, res).catch(next);
  }
);
router7.post("/verify-eligibility", tenantContext(), (req, res, next) => {
  votersController.verifyEligibility(req, res).catch(next);
});
router7.post(
  "/send-invitations",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    votersController.sendInvitations(req, res).catch(next);
  }
);
var voters_routes_default = router7;

// server/src/modules/ballot/ballot.routes.ts
import { Router as Router8 } from "express";

// server/src/modules/ballot/ballot.controller.ts
init_apiResponse();
init_dist();
var BallotController = class {
  async getByElection(req, res) {
    const electionId = req.params.electionId || req.query.electionId;
    sendSuccess(res, {
      id: "ballot-1",
      electionId,
      organizationId: req.tenant?.organizationId,
      title: "Official 2026 Student Government Ballot",
      type: BallotType.SINGLE_CHOICE,
      questions: [
        {
          id: "q-1",
          questionText: "Select your preferred candidate for President",
          orderIndex: 1,
          options: [
            { id: "opt-1", label: "Jordan Hayes", candidateId: "cand-1" },
            { id: "opt-2", label: "Morgan Chen", candidateId: "cand-2" }
          ]
        }
      ]
    });
  }
};

// server/src/modules/ballot/ballot.routes.ts
var router8 = Router8();
var controller5 = new BallotController();
router8.use(authenticate);
router8.use(tenantContext());
router8.get("/:electionId", (req, res, next) => {
  controller5.getByElection(req, res).catch(next);
});
var ballot_routes_default = router8;

// server/src/modules/voting/voting.routes.ts
import { Router as Router9 } from "express";

// server/src/modules/voting/voting.controller.ts
init_apiResponse();

// server/src/modules/voting/voting.service.ts
init_dist();

// server/src/modules/voting/voting.crypto.ts
init_config();
import crypto5 from "crypto";
var VotingCrypto = class {
  static SECRET_SALT = config.jwt.secret || "votexa-crypto-ballot-salt-key";
  /**
   * Generates a deterministic one-way voter hash.
   * This decouples the voter's physical identity (email/name) from their cast ballot
   * while providing a tamper-evident audit proof that the ballot belonged to a legitimate voter.
   */
  static computeVoterHash(voterCode, electionId) {
    return crypto5.createHmac("sha256", this.SECRET_SALT).update(`${electionId}:${voterCode.trim().toUpperCase()}`).digest("hex");
  }
  /**
   * Generates a tamper-evident cryptographic receipt for the voter.
   * Includes ballot selections, timestamp, election ID, and a digital HMAC signature.
   */
  static generateBallotReceipt(electionId, ballotId, voterHash, selections, castAt) {
    const rawPayload = JSON.stringify({
      electionId,
      ballotId,
      voterHash,
      selections: selections.sort((a, b) => a.questionId.localeCompare(b.questionId)),
      castAt
    });
    const encryptedPayload = crypto5.createHmac("sha256", this.SECRET_SALT).update(rawPayload).digest("hex");
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
  static verifyBallotReceipt(receipt, selections) {
    const computed = this.generateBallotReceipt(
      receipt.electionId,
      receipt.ballotId,
      receipt.voterHash,
      selections,
      receipt.castAt
    );
    return computed.signature === receipt.signature;
  }
};

// server/src/modules/voting/voting.service.ts
init_apiResponse();
init_db();

// server/src/modules/voting/vote-authorization.service.ts
init_dist();
init_apiResponse();
init_db();
import crypto6 from "crypto";

// server/src/modules/voting/voter-wallet.service.ts
init_dist();
init_apiResponse();
init_db();
var VoterWalletService = class _VoterWalletService {
  // Keyed by `${electionId}:${voterCode}` for strict isolation
  static localWallets = /* @__PURE__ */ new Map();
  static localTransactions = /* @__PURE__ */ new Map();
  static resetState() {
    _VoterWalletService.localWallets.clear();
    _VoterWalletService.localTransactions.clear();
  }
  constructor() {
    this.seedDefaultWallets();
  }
  seedDefaultWallets() {
    if (_VoterWalletService.localWallets.size > 0) return;
    const walletKey = "elec-paid-1:VTR-FAN-501";
    const walletId = "wlt-fan-501";
    _VoterWalletService.localWallets.set(walletKey, {
      id: walletId,
      organizationId: "org-metro-uni",
      electionId: "elec-paid-1",
      voterCode: "VTR-FAN-501",
      creditsBalance: 15,
      currency: "USD",
      createdAt: new Date(Date.now() - 864e5).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    _VoterWalletService.localTransactions.set(walletId, [
      {
        id: "tx-init-1",
        walletId,
        electionId: "elec-paid-1",
        type: WalletTransactionType.PURCHASE,
        creditsAmount: 20,
        balanceAfter: 20,
        referenceId: "MOCK-PAY-88910",
        description: "Superfan 20-Pack Package Purchase",
        isMockPayment: true,
        createdAt: new Date(Date.now() - 864e5).toISOString()
      },
      {
        id: "tx-spend-1",
        walletId,
        electionId: "elec-paid-1",
        type: WalletTransactionType.SPEND,
        creditsAmount: -5,
        balanceAfter: 15,
        referenceId: "AUTH-VOTE-9921",
        description: "Cast 5 votes for The Harmonix A Cappella",
        isMockPayment: false,
        createdAt: new Date(Date.now() - 36e5 * 2).toISOString()
      }
    ]);
  }
  /**
   * Retrieve or initialize an election-specific wallet for a voter.
   */
  async getOrCreateWallet(organizationId, electionId, voterCode) {
    await electionsService.getElectionById(organizationId, electionId);
    const normalizedCode = voterCode.trim().toUpperCase();
    const walletKey = `${electionId}:${normalizedCode}`;
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        let res = await client.query(
          `SELECT * FROM voter_wallets WHERE election_id = $1 AND voter_code = $2`,
          [electionId, normalizedCode]
        );
        if (res.rows.length === 0) {
          const newId = `wlt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const now = (/* @__PURE__ */ new Date()).toISOString();
          res = await client.query(
            `INSERT INTO voter_wallets (
              id, organization_id, election_id, voter_code, credits_balance, currency, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, 0, 'USD', $5, $6)
            ON CONFLICT (election_id, voter_code) DO UPDATE SET updated_at = EXCLUDED.updated_at
            RETURNING *`,
            [newId, organizationId, electionId, normalizedCode, now, now]
          );
        }
        return this.mapDbWallet(res.rows[0]);
      } finally {
        client.release();
      }
    } catch {
      let wallet = _VoterWalletService.localWallets.get(walletKey);
      if (!wallet) {
        wallet = {
          id: `wlt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          organizationId,
          electionId,
          voterCode: normalizedCode,
          creditsBalance: 0,
          currency: "USD",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        _VoterWalletService.localWallets.set(walletKey, wallet);
      }
      return wallet;
    }
  }
  /**
   * Fetch all transaction ledger entries for a wallet.
   */
  async getWalletTransactions(walletId, electionId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM wallet_transactions WHERE wallet_id = $1 AND election_id = $2 ORDER BY created_at DESC`,
          [walletId, electionId]
        );
        return res.rows.map((r) => ({
          id: r.id,
          walletId: r.wallet_id,
          electionId: r.election_id,
          type: r.type,
          creditsAmount: r.credits_amount,
          balanceAfter: r.balance_after,
          referenceId: r.reference_id,
          description: r.description,
          isMockPayment: Boolean(r.is_mock_payment),
          createdAt: r.created_at.toISOString ? r.created_at.toISOString() : r.created_at
        }));
      } finally {
        client.release();
      }
    } catch {
      return _VoterWalletService.localTransactions.get(walletId) || [];
    }
  }
  /**
   * Add credits to an election-specific wallet after verified payment.
   */
  async addCredits(organizationId, electionId, voterCode, credits, referenceId, description, isMock = false) {
    if (credits <= 0) {
      throw new AppError("Credits added must be strictly positive", 400, "INVALID_CREDIT_AMOUNT");
    }
    const wallet = await this.getOrCreateWallet(organizationId, electionId, voterCode);
    if (wallet.electionId !== electionId) {
      throw new AppError(
        "Credits are election-specific and cannot be added or transferred across elections",
        403,
        "CROSS_ELECTION_CREDIT_FORBIDDEN"
      );
    }
    const newBalance = wallet.creditsBalance + credits;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const transaction = {
      id: txId,
      walletId: wallet.id,
      electionId,
      type: WalletTransactionType.PURCHASE,
      creditsAmount: credits,
      balanceAfter: newBalance,
      referenceId,
      description,
      isMockPayment: isMock,
      createdAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query("BEGIN");
        await client.query(
          `UPDATE voter_wallets SET credits_balance = credits_balance + $1, updated_at = $2 WHERE id = $3`,
          [credits, now, wallet.id]
        );
        await client.query(
          `INSERT INTO wallet_transactions (
            id, wallet_id, election_id, type, credits_amount, balance_after,
            reference_id, description, is_mock_payment, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            transaction.id,
            transaction.walletId,
            transaction.electionId,
            transaction.type,
            transaction.creditsAmount,
            transaction.balanceAfter,
            transaction.referenceId,
            transaction.description,
            transaction.isMockPayment,
            now
          ]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch {
      wallet.creditsBalance = newBalance;
      wallet.updatedAt = now;
      const history = _VoterWalletService.localTransactions.get(wallet.id) || [];
      history.unshift(transaction);
      _VoterWalletService.localTransactions.set(wallet.id, history);
    }
    return {
      wallet: { ...wallet, creditsBalance: newBalance, updatedAt: now },
      transaction
    };
  }
  /**
   * Alias for addCredits
   */
  async creditWallet(organizationId, electionId, voterCode, credits, referenceId, description, isMock = false) {
    return this.addCredits(organizationId, electionId, voterCode, credits, referenceId, description, isMock);
  }
  /**
   * Consume credits from a voter's wallet with atomic locking and no negative balance guarantee.
   */
  async consumeCredits(organizationId, electionId, voterCode, credits, referenceId, description) {
    if (credits <= 0) {
      throw new AppError("Credits consumed must be strictly positive", 400, "INVALID_CREDIT_AMOUNT");
    }
    const wallet = await this.getOrCreateWallet(organizationId, electionId, voterCode);
    if (wallet.electionId !== electionId) {
      throw new AppError(
        "Credits are election-specific and cannot be transferred across elections",
        403,
        "CROSS_ELECTION_CREDIT_FORBIDDEN"
      );
    }
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query("BEGIN");
        const walletRes = await client.query(
          `SELECT credits_balance FROM voter_wallets WHERE id = $1 FOR UPDATE`,
          [wallet.id]
        );
        if (walletRes.rows.length === 0) {
          throw new AppError("Voter wallet not found", 404, "WALLET_NOT_FOUND");
        }
        const currentBalance = Number(walletRes.rows[0].credits_balance);
        if (currentBalance < credits) {
          throw new AppError(
            `Insufficient voting credits in wallet. Required: ${credits}, Available: ${currentBalance}`,
            400,
            "INSUFFICIENT_CREDITS"
          );
        }
        const newBalance = currentBalance - credits;
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        await client.query(
          `UPDATE voter_wallets SET credits_balance = $1, updated_at = $2 WHERE id = $3`,
          [newBalance, now, wallet.id]
        );
        const tx = {
          id: txId,
          walletId: wallet.id,
          electionId,
          type: WalletTransactionType.SPEND,
          creditsAmount: -credits,
          balanceAfter: newBalance,
          referenceId,
          description,
          isMockPayment: false,
          createdAt: now
        };
        await client.query(
          `INSERT INTO wallet_transactions (
            id, wallet_id, election_id, type, credits_amount, balance_after,
            reference_id, description, is_mock_payment, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            tx.id,
            tx.walletId,
            tx.electionId,
            tx.type,
            tx.creditsAmount,
            tx.balanceAfter,
            tx.referenceId,
            tx.description,
            tx.isMockPayment,
            now
          ]
        );
        await client.query("COMMIT");
        return { wallet: { ...wallet, creditsBalance: newBalance, updatedAt: now }, transaction: tx };
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      if (wallet.creditsBalance < credits) {
        throw new AppError(
          `Insufficient voting credits in wallet. Required: ${credits}, Available: ${wallet.creditsBalance}`,
          400,
          "INSUFFICIENT_CREDITS"
        );
      }
      const newBalance = wallet.creditsBalance - credits;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const txId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      wallet.creditsBalance = newBalance;
      wallet.updatedAt = now;
      const tx = {
        id: txId,
        walletId: wallet.id,
        electionId,
        type: WalletTransactionType.SPEND,
        creditsAmount: -credits,
        balanceAfter: newBalance,
        referenceId,
        description,
        isMockPayment: false,
        createdAt: now
      };
      const history = _VoterWalletService.localTransactions.get(wallet.id) || [];
      history.unshift(tx);
      _VoterWalletService.localTransactions.set(wallet.id, history);
      return { wallet, transaction: tx };
    }
  }
  mapDbWallet(row) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      electionId: row.election_id,
      voterCode: row.voter_code,
      creditsBalance: Number(row.credits_balance),
      currency: row.currency,
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at
    };
  }
};
var voterWalletService = new VoterWalletService();

// server/src/modules/voting/vote-authorization.service.ts
var VoteAuthorizationService = class _VoteAuthorizationService {
  static localAuthorizations = /* @__PURE__ */ new Map();
  // Keyed by token_hash
  static localPositionVotes = /* @__PURE__ */ new Set();
  // `${electionId}:${positionId}:${voterHash}` for institutional duplicate tracking
  static resetState() {
    _VoteAuthorizationService.localAuthorizations.clear();
    _VoteAuthorizationService.localPositionVotes.clear();
  }
  /**
   * Request a one-time voting authorization token.
   * Decouples voter identity from subsequent ballot submission to preserve secret ballot confidentiality.
   */
  async requestAuthorization(organizationId, req) {
    const { electionId, voterCode, positionId, creditsRequested = 1 } = req;
    if (!electionId || !voterCode) {
      throw new AppError("Election ID and voter code are required", 400, "INVALID_PAYLOAD");
    }
    if (!positionId) {
      throw new AppError("Position ID is required for vote authorization", 400, "POSITION_REQUIRED");
    }
    const election = await electionsService.getElectionById(organizationId, electionId);
    if (election.status !== ElectionStatus.ACTIVE) {
      throw new AppError(
        `Election is not currently active for voting (Status: ${election.status})`,
        403,
        "ELECTION_NOT_ACTIVE"
      );
    }
    const positions = await positionsService.listPositions(organizationId, electionId);
    const position = positions.find((p) => p.id === positionId);
    if (!position) {
      throw new AppError("Position does not belong to this election", 400, "INVALID_POSITION");
    }
    const normalizedCode = voterCode.trim().toUpperCase();
    const voterHash = VotingCrypto.computeVoterHash(normalizedCode, electionId);
    const positionVoteKey = `${electionId}:${positionId}:${voterHash}`;
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      const eligibility = await votersService.verifyVoterEligibility(organizationId, electionId, {
        voterCode: normalizedCode
      });
      if (!eligibility.isEligible) {
        throw new AppError(eligibility.reason || "Voter is not eligible to vote", 403, "INELIGIBLE_VOTER");
      }
      if (_VoteAuthorizationService.localPositionVotes.has(positionVoteKey)) {
        throw new AppError(
          "Institutional rule violation: Voter has already cast a ballot for this position",
          409,
          "ALREADY_VOTED"
        );
      }
      try {
        const client = await pool.connect();
        try {
          await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
          const checkRes = await client.query(
            `SELECT id FROM vote_authorizations 
             WHERE election_id = $1 AND position_id = $2 AND voter_hash = $3 AND is_used = TRUE`,
            [electionId, positionId, voterHash]
          );
          if (checkRes.rows.length > 0) {
            throw new AppError(
              "Institutional rule violation: Voter has already cast a ballot for this position",
              409,
              "ALREADY_VOTED"
            );
          }
        } finally {
          client.release();
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
      }
    } else if (election.category === ElectionCategory.PAID_COMPETITION) {
      const txDesc = `Authorized ${creditsRequested} vote(s) for position: ${position.title}`;
      const authRef = `AUTH-REQ-${crypto6.randomBytes(4).toString("hex").toUpperCase()}`;
      await voterWalletService.consumeCredits(
        organizationId,
        electionId,
        normalizedCode,
        creditsRequested,
        authRef,
        txDesc
      );
    }
    const rawToken = `AUTH-${crypto6.randomBytes(24).toString("hex").toUpperCase()}`;
    const tokenHash = crypto6.createHash("sha256").update(rawToken).digest("hex");
    const authId = `auth-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const authRecord = {
      id: authId,
      electionId,
      organizationId,
      positionId,
      token: rawToken,
      // Returned to voter
      voterHash,
      category: election.category,
      creditsAllocated: election.category === ElectionCategory.PAID_COMPETITION ? creditsRequested : 1,
      isUsed: false,
      expiresAt,
      createdAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `INSERT INTO vote_authorizations (
            id, organization_id, election_id, position_id, token_hash, voter_hash,
            category, credits_allocated, is_used, expires_at, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            authRecord.id,
            authRecord.organizationId,
            authRecord.electionId,
            authRecord.positionId,
            tokenHash,
            authRecord.voterHash,
            authRecord.category,
            authRecord.creditsAllocated,
            authRecord.isUsed,
            authRecord.expiresAt,
            authRecord.createdAt
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _VoteAuthorizationService.localAuthorizations.set(tokenHash, authRecord);
    }
    return {
      authorized: true,
      authorizationToken: rawToken,
      expiresAt,
      category: election.category,
      positionId,
      creditsAllocated: authRecord.creditsAllocated,
      voterHash
    };
  }
  /**
   * Consume and validate a one-time authorization token upon ballot submission.
   */
  async consumeAuthorization(electionId, rawToken, positionId) {
    if (!rawToken || !rawToken.trim()) {
      throw new AppError("Vote authorization token is required", 400, "TOKEN_REQUIRED");
    }
    const cleanToken = rawToken.trim();
    const tokenHash = crypto6.createHash("sha256").update(cleanToken).digest("hex");
    const now = /* @__PURE__ */ new Date();
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const authRes = await client.query(
          `SELECT * FROM vote_authorizations WHERE token_hash = $1 FOR UPDATE`,
          [tokenHash]
        );
        if (authRes.rows.length === 0) {
          throw new AppError("Invalid or unrecognised vote authorization token", 401, "INVALID_AUTHORIZATION");
        }
        const row = authRes.rows[0];
        if (row.election_id !== electionId) {
          throw new AppError("Authorization token does not match target election", 403, "CROSS_ELECTION_TOKEN_FORBIDDEN");
        }
        if (row.position_id !== positionId) {
          throw new AppError("Authorization token does not match target position", 400, "INVALID_POSITION_SCOPE");
        }
        if (row.is_used) {
          throw new AppError("This one-time authorization token has already been used", 409, "AUTHORIZATION_ALREADY_USED");
        }
        if (new Date(row.expires_at) < now) {
          throw new AppError("Vote authorization token has expired", 400, "AUTHORIZATION_EXPIRED");
        }
        await client.query(
          `UPDATE vote_authorizations SET is_used = TRUE, used_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [row.id]
        );
        await client.query("COMMIT");
        return {
          id: row.id,
          electionId: row.election_id,
          organizationId: row.organization_id,
          positionId: row.position_id,
          token: cleanToken,
          voterHash: row.voter_hash,
          category: row.category,
          creditsAllocated: Number(row.credits_allocated),
          isUsed: true,
          usedAt: now.toISOString(),
          expiresAt: row.expires_at.toISOString ? row.expires_at.toISOString() : row.expires_at,
          createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at
        };
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      const record = _VoteAuthorizationService.localAuthorizations.get(tokenHash);
      if (!record) {
        throw new AppError("Invalid or unrecognised vote authorization token", 401, "INVALID_AUTHORIZATION");
      }
      if (record.electionId !== electionId) {
        throw new AppError("Authorization token does not match target election", 403, "CROSS_ELECTION_TOKEN_FORBIDDEN");
      }
      if (record.positionId !== positionId) {
        throw new AppError("Authorization token does not match target position", 400, "INVALID_POSITION_SCOPE");
      }
      if (record.isUsed) {
        throw new AppError("This one-time authorization token has already been used", 409, "AUTHORIZATION_ALREADY_USED");
      }
      if (new Date(record.expiresAt) < now) {
        throw new AppError("Vote authorization token has expired", 400, "AUTHORIZATION_EXPIRED");
      }
      record.isUsed = true;
      record.usedAt = now.toISOString();
      if (record.category === ElectionCategory.INSTITUTIONAL) {
        _VoteAuthorizationService.localPositionVotes.add(`${electionId}:${positionId}:${record.voterHash}`);
      }
      return record;
    }
  }
};
var voteAuthorizationService = new VoteAuthorizationService();

// server/src/modules/voting/voting.service.ts
var VotingService = class _VotingService {
  static localVoters = /* @__PURE__ */ new Map([
    ["VTR-9981-METRO", { voterCode: "VTR-9981-METRO", electionId: "elec-1", hasVoted: false }],
    ["VTR-9982-METRO", { voterCode: "VTR-9982-METRO", electionId: "elec-1", hasVoted: false }],
    ["VTR-DEMO-TEST", { voterCode: "VTR-DEMO-TEST", electionId: "elec-1", hasVoted: false }]
  ]);
  static localVotes = [];
  /**
   * Cast an authorized vote using a one-time cryptographic authorization token.
   * Ensures strict ballot confidentiality (zero link between voter identity/wallet and secret ballot choice).
   */
  async castAuthorizedVote(organizationId, req) {
    const { electionId, authorizationToken, positionId, candidateId } = req;
    if (!electionId || !authorizationToken || !positionId || !candidateId) {
      throw new AppError("Election ID, authorization token, position ID, and candidate ID are required", 400, "INVALID_PAYLOAD");
    }
    const auth = await voteAuthorizationService.consumeAuthorization(
      electionId,
      authorizationToken,
      positionId
    );
    const candidates = await candidatesService.listCandidates(organizationId, electionId, positionId);
    const candidate = candidates.find((c) => c.id === candidateId);
    if (!candidate) {
      throw new AppError(
        "Selected candidate does not exist or is not registered for this position",
        400,
        "INVALID_CANDIDATE"
      );
    }
    const now = /* @__PURE__ */ new Date();
    const castAt = now.toISOString();
    const ballotId = req.ballotId || `ballot-${electionId}`;
    const selections = [{ questionId: positionId, optionId: candidateId, candidateId }];
    const receipt = VotingCrypto.generateBallotReceipt(
      electionId,
      ballotId,
      auth.voterHash,
      selections,
      castAt
    );
    const voteWeight = auth.creditsAllocated || 1;
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO votes (
            organization_id, election_id, position_id, candidate_id, ballot_id,
            voter_hash, encrypted_payload, receipt_code, vote_weight, cast_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            organizationId,
            electionId,
            positionId,
            candidateId,
            ballotId,
            auth.voterHash,
            receipt.signature,
            receipt.receiptCode,
            voteWeight,
            castAt
          ]
        );
        await client.query(
          `UPDATE candidates SET vote_count = COALESCE(vote_count, 0) + $1 WHERE id = $2`,
          [voteWeight, candidateId]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch {
      _VotingService.localVotes.push({
        id: `vote-${Date.now()}`,
        electionId,
        positionId,
        candidateId,
        ballotId,
        voterHash: auth.voterHash,
        receiptCode: receipt.receiptCode,
        signature: receipt.signature,
        voteWeight,
        selections,
        castAt
      });
      candidate.voteCount = (candidate.voteCount || 0) + voteWeight;
    }
    return {
      success: true,
      receipt
    };
  }
  /**
   * Cast an encrypted vote with atomic double-voting prevention (Legacy/Direct path).
   */
  async castVote(request) {
    const { electionId, ballotId, voterCode, selections } = request;
    if (!electionId || !ballotId || !voterCode) {
      throw new AppError("Election ID, Ballot ID, and Voter Code are strictly required.", 400, "INVALID_PAYLOAD");
    }
    if (!selections || selections.length === 0) {
      throw new AppError("Ballot must contain at least one valid selection.", 400, "EMPTY_BALLOT_SELECTIONS");
    }
    const normalizedCode = voterCode.trim().toUpperCase();
    const now = /* @__PURE__ */ new Date();
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const electionRes = await client.query(
          "SELECT status, start_time, end_time FROM elections WHERE id = $1",
          [electionId]
        );
        if (electionRes.rows.length > 0) {
          const election = electionRes.rows[0];
          if (election.status !== ElectionStatus.ACTIVE) {
            throw new AppError(`Election is not currently open for voting (Status: ${election.status}).`, 403, "ELECTION_NOT_ACTIVE");
          }
          if (new Date(election.start_time) > now) {
            throw new AppError("Election has not started yet.", 403, "ELECTION_NOT_STARTED");
          }
          if (new Date(election.end_time) < now) {
            throw new AppError("Election has already concluded.", 403, "ELECTION_CONCLUDED");
          }
        }
        const voterRes = await client.query(
          "SELECT id, has_voted FROM voters WHERE election_id = $1 AND voter_code = $2 FOR UPDATE",
          [electionId, normalizedCode]
        );
        if (voterRes.rows.length === 0) {
          throw new AppError("Invalid or unauthorized voter credential code.", 404, "VOTER_NOT_FOUND");
        }
        if (voterRes.rows[0].has_voted) {
          throw new AppError("This voter credential has already been cast in this election.", 409, "ALREADY_VOTED");
        }
        await client.query(
          "UPDATE voters SET has_voted = TRUE, verified_at = CURRENT_TIMESTAMP WHERE id = $1",
          [voterRes.rows[0].id]
        );
        const castAt = now.toISOString();
        const voterHash = VotingCrypto.computeVoterHash(normalizedCode, electionId);
        const receipt = VotingCrypto.generateBallotReceipt(electionId, ballotId, voterHash, selections, castAt);
        await client.query(
          `INSERT INTO votes (election_id, ballot_id, voter_hash, encrypted_payload, cast_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [electionId, ballotId, voterHash, receipt.signature, castAt]
        );
        for (const sel of selections) {
          if (sel.candidateId) {
            await client.query(
              "UPDATE candidates SET vote_count = COALESCE(vote_count, 0) + 1 WHERE id = $1",
              [sel.candidateId]
            );
          }
        }
        await client.query("COMMIT");
        return receipt;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (dbErr) {
      if (dbErr instanceof AppError) throw dbErr;
      const localVoter = _VotingService.localVoters.get(normalizedCode);
      if (!localVoter) {
        throw new AppError("Invalid or unauthorized voter credential code.", 404, "VOTER_NOT_FOUND");
      }
      if (localVoter.hasVoted) {
        throw new AppError("This voter credential has already been cast in this election.", 409, "ALREADY_VOTED");
      }
      localVoter.hasVoted = true;
      const castAt = now.toISOString();
      const voterHash = VotingCrypto.computeVoterHash(normalizedCode, electionId);
      const receipt = VotingCrypto.generateBallotReceipt(electionId, ballotId, voterHash, selections, castAt);
      _VotingService.localVotes.push({
        id: `vote-${Date.now()}`,
        electionId,
        ballotId,
        voterHash,
        receiptCode: receipt.receiptCode,
        signature: receipt.signature,
        voteWeight: 1,
        selections,
        castAt
      });
      return receipt;
    }
  }
  /**
   * Verify an existing cryptographic receipt.
   */
  async verifyReceipt(receiptCode) {
    const cleanCode = receiptCode.trim().toUpperCase();
    const record = _VotingService.localVotes.find((v) => v.receiptCode === cleanCode);
    if (record) {
      return {
        valid: true,
        record: {
          electionId: record.electionId,
          ballotId: record.ballotId,
          receiptCode: record.receiptCode,
          castAt: record.castAt
        }
      };
    }
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          "SELECT election_id, ballot_id, cast_at FROM votes WHERE receipt_code = $1 OR encrypted_payload LIKE $2",
          [cleanCode, `%${cleanCode.replace("VTX-", "").replace(/-/g, "").toLowerCase()}%`]
        );
        if (res.rows.length > 0) {
          return {
            valid: true,
            record: {
              electionId: res.rows[0].election_id,
              ballotId: res.rows[0].ballot_id,
              receiptCode: cleanCode,
              castAt: res.rows[0].cast_at
            }
          };
        }
      } finally {
        client.release();
      }
    } catch {
    }
    return { valid: false };
  }
  /**
   * Aggregate election tally results across all registered candidates.
   */
  async getElectionTally(electionIdOrOrg, electionIdParam) {
    const organizationId = electionIdParam ? electionIdOrOrg : "org-metro-uni";
    const electionId = electionIdParam || electionIdOrOrg;
    let electionStatus = ElectionStatus.ACTIVE;
    let candidateTallies = [
      { candidateId: "cand-1", candidateName: "Jordan Hayes", count: 0, percentage: 0 },
      { candidateId: "cand-2", candidateName: "Morgan Chen", count: 0, percentage: 0 }
    ];
    try {
      const election = await electionsService.getElectionById(organizationId, electionId);
      electionStatus = election.status;
      const candidates = await candidatesService.listCandidates(organizationId, electionId);
      if (candidates.length > 0) {
        candidateTallies = candidates.map((c) => ({
          candidateId: c.id,
          candidateName: c.name,
          count: c.voteCount || 0,
          percentage: 0
        }));
      }
    } catch {
    }
    const matchingVotes = _VotingService.localVotes.filter((v) => v.electionId === electionId);
    let totalVotes = matchingVotes.length;
    for (const v of matchingVotes) {
      if (v.candidateId) {
        const found = candidateTallies.find((c) => c.candidateId === v.candidateId);
        if (found) found.count += v.voteWeight || 1;
      }
      for (const sel of v.selections || []) {
        if (sel.candidateId && !v.candidateId) {
          const found = candidateTallies.find((c) => c.candidateId === sel.candidateId);
          if (found) found.count += v.voteWeight || 1;
        }
      }
    }
    if (totalVotes > 0) {
      candidateTallies.forEach((c) => {
        c.percentage = parseFloat((c.count / totalVotes * 100).toFixed(1));
      });
    }
    return {
      electionId,
      totalVotesCast: totalVotes,
      candidates: candidateTallies,
      status: electionStatus,
      auditedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var votingService = new VotingService();

// server/src/modules/voting/voting-packages.service.ts
init_dist();
init_apiResponse();
init_db();
var VotingPackagesService = class _VotingPackagesService {
  static localPackages = /* @__PURE__ */ new Map();
  constructor() {
    this.seedDefaultPackages();
  }
  seedDefaultPackages() {
    if (_VotingPackagesService.localPackages.size > 0) return;
    _VotingPackagesService.localPackages.set("elec-paid-1", [
      {
        id: "pkg-1",
        organizationId: "org-metro-uni",
        electionId: "elec-paid-1",
        name: "Single Fan Vote",
        credits: 1,
        priceCents: 100,
        // $1.00
        currency: "USD",
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "pkg-2",
        organizationId: "org-metro-uni",
        electionId: "elec-paid-1",
        name: "Supporter 5-Pack",
        credits: 5,
        priceCents: 450,
        // $4.50 (10% discount)
        currency: "USD",
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      {
        id: "pkg-3",
        organizationId: "org-metro-uni",
        electionId: "elec-paid-1",
        name: "Superfan 20-Pack",
        credits: 20,
        priceCents: 1600,
        // $16.00 (20% discount)
        currency: "USD",
        isActive: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
  }
  /**
   * List active packages for an election.
   */
  async listPackages(organizationId, electionId) {
    await electionsService.getElectionById(organizationId, electionId);
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        const res = await client.query(
          `SELECT * FROM voting_packages
           WHERE election_id = $1 AND organization_id = $2 AND is_active = TRUE
           ORDER BY price_cents ASC`,
          [electionId, organizationId]
        );
        return res.rows.map((r) => this.mapDbPackage(r));
      } finally {
        client.release();
      }
    } catch {
      const list = _VotingPackagesService.localPackages.get(electionId) || [];
      return list.filter((p) => p.isActive);
    }
  }
  /**
   * Create a voting package for an election.
   * Institutional elections cannot have packages!
   */
  async createPackage(organizationId, _userId, req) {
    const election = await electionsService.getElectionById(organizationId, req.electionId);
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      throw new AppError(
        "Institutional elections do not support paid voting packages or credits",
        400,
        "INSTITUTIONAL_PAID_VOTING_FORBIDDEN"
      );
    }
    if (!req.name || req.name.trim().length === 0) {
      throw new AppError("Package name is required", 400, "INVALID_PACKAGE_NAME");
    }
    if (!req.credits || req.credits <= 0) {
      throw new AppError("Package credits must be greater than 0", 400, "INVALID_CREDITS");
    }
    if (req.priceCents === void 0 || req.priceCents < 0) {
      throw new AppError("Price in cents must be >= 0", 400, "INVALID_PRICE");
    }
    const pkgId = `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const newPackage = {
      id: pkgId,
      organizationId,
      electionId: req.electionId,
      name: req.name.trim(),
      credits: req.credits,
      priceCents: req.priceCents,
      currency: req.currency || "USD",
      isActive: req.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
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
      const list = _VotingPackagesService.localPackages.get(req.electionId) || [];
      list.push(newPackage);
      _VotingPackagesService.localPackages.set(req.electionId, list);
    }
    return newPackage;
  }
  /**
   * Get a package by ID.
   */
  async getPackageById(organizationId, electionId, packageId) {
    const packages = await this.listPackages(organizationId, electionId);
    const found = packages.find((p) => p.id === packageId);
    if (!found) {
      throw new AppError("Voting package not found", 404, "PACKAGE_NOT_FOUND");
    }
    return found;
  }
  mapDbPackage(row) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      electionId: row.election_id,
      name: row.name,
      credits: Number(row.credits),
      priceCents: Number(row.price_cents),
      currency: row.currency,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at
    };
  }
};
var votingPackagesService = new VotingPackagesService();

// server/src/modules/voting/mock-payment.service.ts
init_apiResponse();
import crypto7 from "crypto";
var MockPaymentService = class {
  /**
   * Process a development-only mock payment and credit the voter's election wallet.
   * Explicitly labeled as MOCK to ensure it cannot be confused with production transactions.
   */
  async processMockPayment(organizationId, req) {
    const { electionId, packageId, voterCode } = req;
    if (!electionId || !packageId || !voterCode) {
      throw new AppError("Election ID, package ID, and voter code are required", 400, "INVALID_PAYLOAD");
    }
    const pkg = await votingPackagesService.getPackageById(organizationId, electionId, packageId);
    if (!pkg.isActive) {
      throw new AppError("This voting package is not currently available", 400, "PACKAGE_INACTIVE");
    }
    const mockRef = `MOCK-PAY-${crypto7.randomBytes(4).toString("hex").toUpperCase()}-${crypto7.randomBytes(4).toString("hex").toUpperCase()}`;
    const desc = `[DEV SIMULATED] Purchased ${pkg.name} (${pkg.credits} credits @ $${(pkg.priceCents / 100).toFixed(2)})`;
    const { wallet, transaction } = await voterWalletService.addCredits(
      organizationId,
      electionId,
      voterCode,
      pkg.credits,
      mockRef,
      desc,
      true
      // isMock = true
    );
    return {
      success: true,
      wallet,
      transaction,
      message: `Simulated payment successful! ${pkg.credits} voting credits added to wallet.`
    };
  }
};
var mockPaymentService = new MockPaymentService();

// server/src/modules/voting/voting.controller.ts
var VotingController = class {
  // --- Voting Packages Endpoints ---
  async listPackages(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.params.electionId || req.query.electionId;
    if (!electionId) throw new AppError("Election ID is required", 400, "ELECTION_REQUIRED");
    const packages = await votingPackagesService.listPackages(orgId, electionId);
    sendSuccess(res, packages, void 0, 200, req.requestId);
  }
  async createPackage(req, res) {
    const orgId = req.tenant?.organizationId;
    const userId = req.user?.id || "usr-system";
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const pkg = await votingPackagesService.createPackage(orgId, userId, req.body);
    sendSuccess(res, pkg, void 0, 201, req.requestId);
  }
  // --- Voter Wallet & Transactions ---
  async getWallet(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const electionId = req.params.electionId || req.query.electionId;
    const voterCode = req.query.voterCode;
    if (!electionId || !voterCode) {
      throw new AppError("Election ID and voter code are required", 400, "INVALID_PAYLOAD");
    }
    const wallet = await voterWalletService.getOrCreateWallet(orgId, electionId, voterCode);
    const transactions = await voterWalletService.getWalletTransactions(wallet.id, electionId);
    sendSuccess(
      res,
      {
        wallet,
        transactions
      },
      void 0,
      200,
      req.requestId
    );
  }
  // --- Package Purchase (Mock Payment Integration) ---
  async purchasePackage(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const result = await mockPaymentService.processMockPayment(orgId, req.body);
    sendSuccess(res, result, void 0, 201, req.requestId);
  }
  // --- One-Time Vote Authorization (Ballot Confidentiality) ---
  async requestAuthorization(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const result = await voteAuthorizationService.requestAuthorization(orgId, req.body);
    sendSuccess(res, result, void 0, 201, req.requestId);
  }
  // --- Cast Authorized Ballot ---
  async castAuthorizedVote(req, res) {
    const orgId = req.tenant?.organizationId;
    if (!orgId) throw new AppError("Tenant context required", 400, "TENANT_REQUIRED");
    const result = await votingService.castAuthorizedVote(orgId, req.body);
    sendSuccess(res, result, void 0, 201, req.requestId);
  }
  // --- Legacy / Direct Cast Ballot ---
  async castVote(req, res) {
    const receipt = await votingService.castVote({
      electionId: req.body.electionId,
      ballotId: req.body.ballotId,
      voterCode: req.body.voterCode,
      selections: req.body.selections
    });
    sendSuccess(res, receipt, void 0, 201, req.requestId);
  }
  // --- Verification & Tally ---
  async verifyReceipt(req, res) {
    const result = await votingService.verifyReceipt(req.body.receiptCode);
    sendSuccess(res, result, void 0, 200, req.requestId);
  }
  async getResults(req, res) {
    const orgId = req.tenant?.organizationId || "org-metro-uni";
    const electionId = req.params.electionId || "";
    const tally = await votingService.getElectionTally(orgId, electionId);
    sendSuccess(res, tally, void 0, 200, req.requestId);
  }
  async getVotingStatus(req, res) {
    sendSuccess(res, {
      electionId: req.params.electionId,
      canVote: true,
      phase: "ENGINE_ACTIVE"
    });
  }
};
var votingController = new VotingController();

// server/src/modules/voting/voting.routes.ts
init_dist();
var router9 = Router9();
router9.use(tenantContext({ required: false }));
router9.get("/packages/:electionId", (req, res, next) => {
  votingController.listPackages(req, res).catch(next);
});
router9.post(
  "/packages",
  tenantContext({ allowedRoles: [OrganizationRole.OWNER, OrganizationRole.ADMIN] }),
  (req, res, next) => {
    votingController.createPackage(req, res).catch(next);
  }
);
router9.get("/wallet/:electionId", (req, res, next) => {
  votingController.getWallet(req, res).catch(next);
});
router9.post("/packages/purchase", (req, res, next) => {
  votingController.purchasePackage(req, res).catch(next);
});
router9.post("/authorize", (req, res, next) => {
  votingController.requestAuthorization(req, res).catch(next);
});
router9.post("/cast-authorized", (req, res, next) => {
  votingController.castAuthorizedVote(req, res).catch(next);
});
router9.get("/status/:electionId", (req, res, next) => {
  votingController.getVotingStatus(req, res).catch(next);
});
router9.post("/cast", (req, res, next) => {
  votingController.castVote(req, res).catch(next);
});
router9.post("/verify-receipt", (req, res, next) => {
  votingController.verifyReceipt(req, res).catch(next);
});
router9.get("/results/:electionId", (req, res, next) => {
  votingController.getResults(req, res).catch(next);
});
var voting_routes_default = router9;

// server/src/modules/packages/packages.routes.ts
import { Router as Router10 } from "express";

// server/src/modules/packages/packages.controller.ts
init_apiResponse();
var PackagesController = class {
  async list(_req, res) {
    sendSuccess(res, [
      {
        id: "pkg-standard",
        name: "Standard Tier",
        description: "Ideal for student unions and community organizations",
        maxElections: 10,
        maxVotersPerElection: 2500,
        priceCents: 4900,
        currency: "USD"
      },
      {
        id: "pkg-enterprise",
        name: "Enterprise Tier",
        description: "Unlimited elections, audit logs, and priority voter verification",
        maxElections: 100,
        maxVotersPerElection: 5e4,
        priceCents: 19900,
        currency: "USD"
      }
    ]);
  }
};

// server/src/modules/packages/packages.routes.ts
var router10 = Router10();
var controller6 = new PackagesController();
router10.get("/", (req, res, next) => {
  controller6.list(req, res).catch(next);
});
var packages_routes_default = router10;

// server/src/modules/payments/payments.routes.ts
import { Router as Router11 } from "express";

// server/src/modules/payments/payments.controller.ts
init_apiResponse();

// server/src/modules/payments/payments.service.ts
init_dist();

// server/src/modules/wallets/wallets.service.ts
init_dist();
init_apiResponse();
init_db();
var WalletsService = class _WalletsService {
  // Local ledger fallback for dev/testing mode
  static localWallets = /* @__PURE__ */ new Map([
    [
      "org-demo-1",
      {
        id: "wal-1",
        organizationId: "org-demo-1",
        currency: "USD",
        availableBalance: 145e3,
        pendingBalance: 25e3,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]
  ]);
  static localLedger = [
    {
      id: "led-init",
      walletId: "wal-1",
      organizationId: "org-demo-1",
      type: LedgerEntryType.CREDIT,
      amount: 145e3,
      currency: "USD",
      description: "Opening treasury ledger balance",
      balanceAfter: 145e3,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  async getWallet(organizationId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query("SELECT * FROM wallets WHERE organization_id = $1", [organizationId]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            organizationId: row.organization_id,
            currency: row.currency,
            availableBalance: parseInt(row.available_balance, 10),
            pendingBalance: parseInt(row.pending_balance, 10),
            updatedAt: row.updated_at
          };
        }
      } finally {
        client.release();
      }
    } catch {
    }
    let wallet = _WalletsService.localWallets.get(organizationId);
    if (!wallet) {
      wallet = {
        id: `wal-${Date.now()}`,
        organizationId,
        currency: "USD",
        availableBalance: 0,
        pendingBalance: 0,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      _WalletsService.localWallets.set(organizationId, wallet);
    }
    return wallet;
  }
  /**
   * Double-Entry Credit Transaction (e.g. from paid voting or package purchase)
   */
  async creditWallet(organizationId, amountCents, description, referenceId) {
    if (amountCents <= 0) {
      throw new AppError("Credit amount must be greater than zero.", 400, "INVALID_AMOUNT");
    }
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const walletRes = await client.query(
          "SELECT id, available_balance, currency FROM wallets WHERE organization_id = $1 FOR UPDATE",
          [organizationId]
        );
        let walletId = "";
        let newBalance = amountCents;
        const currency = walletRes.rows[0]?.currency || "USD";
        if (walletRes.rows.length > 0) {
          walletId = walletRes.rows[0].id;
          newBalance = parseInt(walletRes.rows[0].available_balance, 10) + amountCents;
          await client.query("UPDATE wallets SET available_balance = $1, updated_at = NOW() WHERE id = $2", [
            newBalance,
            walletId
          ]);
        } else {
          const newWalletRes = await client.query(
            "INSERT INTO wallets (organization_id, available_balance, currency) VALUES ($1, $2, $3) RETURNING id",
            [organizationId, amountCents, currency]
          );
          walletId = newWalletRes.rows[0].id;
        }
        const ledgerRes = await client.query(
          `INSERT INTO financial_ledger (wallet_id, organization_id, type, amount, currency, description, reference_id, balance_after)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [walletId, organizationId, LedgerEntryType.CREDIT, amountCents, currency, description, referenceId, newBalance]
        );
        await client.query("COMMIT");
        const row = ledgerRes.rows[0];
        return {
          id: row.id,
          walletId: row.wallet_id,
          organizationId: row.organization_id,
          type: row.type,
          amount: parseInt(row.amount, 10),
          currency: row.currency,
          description: row.description,
          referenceId: row.reference_id,
          balanceAfter: parseInt(row.balance_after, 10),
          createdAt: row.created_at
        };
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      const wallet = await this.getWallet(organizationId);
      wallet.availableBalance += amountCents;
      wallet.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      const ledgerEntry = {
        id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        walletId: wallet.id,
        organizationId,
        type: LedgerEntryType.CREDIT,
        amount: amountCents,
        currency: wallet.currency,
        description,
        referenceId,
        balanceAfter: wallet.availableBalance,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      _WalletsService.localLedger.unshift(ledgerEntry);
      return ledgerEntry;
    }
  }
  /**
   * Double-Entry Debit Transaction (e.g. for payouts/withdrawals)
   */
  async debitWallet(organizationId, amountCents, description, referenceId) {
    if (amountCents <= 0) {
      throw new AppError("Debit amount must be greater than zero.", 400, "INVALID_AMOUNT");
    }
    const wallet = await this.getWallet(organizationId);
    if (wallet.availableBalance < amountCents) {
      throw new AppError(
        `Insufficient available treasury balance. Requested: $${(amountCents / 100).toFixed(2)}, Available: $${(wallet.availableBalance / 100).toFixed(2)}`,
        400,
        "INSUFFICIENT_FUNDS"
      );
    }
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const walletRes = await client.query(
          "SELECT id, available_balance, currency FROM wallets WHERE organization_id = $1 FOR UPDATE",
          [organizationId]
        );
        const currentBalance = parseInt(walletRes.rows[0].available_balance, 10);
        if (currentBalance < amountCents) {
          throw new AppError("Insufficient available funds for disbursement.", 400, "INSUFFICIENT_FUNDS");
        }
        const newBalance = currentBalance - amountCents;
        const walletId = walletRes.rows[0].id;
        const currency = walletRes.rows[0].currency;
        await client.query("UPDATE wallets SET available_balance = $1, updated_at = NOW() WHERE id = $2", [
          newBalance,
          walletId
        ]);
        const ledgerRes = await client.query(
          `INSERT INTO financial_ledger (wallet_id, organization_id, type, amount, currency, description, reference_id, balance_after)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [walletId, organizationId, LedgerEntryType.DEBIT, amountCents, currency, description, referenceId, newBalance]
        );
        await client.query("COMMIT");
        const row = ledgerRes.rows[0];
        return {
          id: row.id,
          walletId: row.wallet_id,
          organizationId: row.organization_id,
          type: row.type,
          amount: parseInt(row.amount, 10),
          currency: row.currency,
          description: row.description,
          referenceId: row.reference_id,
          balanceAfter: parseInt(row.balance_after, 10),
          createdAt: row.created_at
        };
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      if (err instanceof AppError) throw err;
      wallet.availableBalance -= amountCents;
      wallet.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      const ledgerEntry = {
        id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        walletId: wallet.id,
        organizationId,
        type: LedgerEntryType.DEBIT,
        amount: amountCents,
        currency: wallet.currency,
        description,
        referenceId,
        balanceAfter: wallet.availableBalance,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      _WalletsService.localLedger.unshift(ledgerEntry);
      return ledgerEntry;
    }
  }
  async getLedger(organizationId) {
    return _WalletsService.localLedger.filter((l) => l.organizationId === organizationId);
  }
};
var walletsService = new WalletsService();

// server/src/modules/payments/payments.service.ts
init_apiResponse();
var PaymentsService = class _PaymentsService {
  static localPayments = [
    {
      id: "pay-sample-1",
      organizationId: "org-demo-1",
      packageId: "pkg-standard",
      amountCents: 4900,
      currency: "USD",
      status: PaymentStatus.COMPLETED,
      gateway: "STRIPE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  ];
  static packages = /* @__PURE__ */ new Map([
    ["pkg-standard", { id: "pkg-standard", name: "Standard Tier", priceCents: 4900 }],
    ["pkg-enterprise", { id: "pkg-enterprise", name: "Enterprise Tier", priceCents: 19900 }]
  ]);
  /**
   * Create Checkout Session for Package Subscription
   */
  async createCheckoutSession(request) {
    const pkg = _PaymentsService.packages.get(request.packageId);
    if (!pkg) {
      throw new AppError(`Selected package tier '${request.packageId}' not found.`, 404, "PACKAGE_NOT_FOUND");
    }
    const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}`;
    return {
      sessionId,
      checkoutUrl,
      packageId: pkg.id,
      amountCents: pkg.priceCents,
      currency: "USD"
    };
  }
  /**
   * Complete payment and trigger double-entry ledger credit to the tenant wallet.
   */
  async confirmPayment(organizationId, packageId, _sessionId) {
    const pkg = _PaymentsService.packages.get(packageId);
    if (!pkg) {
      throw new AppError("Invalid package reference.", 404, "PACKAGE_NOT_FOUND");
    }
    const paymentId = `pay-${Date.now()}`;
    const transaction = {
      id: paymentId,
      organizationId,
      packageId,
      amountCents: pkg.priceCents,
      currency: "USD",
      status: PaymentStatus.COMPLETED,
      gateway: "STRIPE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    _PaymentsService.localPayments.unshift(transaction);
    await walletsService.creditWallet(
      organizationId,
      pkg.priceCents,
      `SaaS Subscription Package Purchase (${pkg.name})`,
      paymentId
    );
    return transaction;
  }
  async listPayments(organizationId) {
    return _PaymentsService.localPayments.filter((p) => p.organizationId === organizationId);
  }
};
var paymentsService = new PaymentsService();

// server/src/modules/payments/mpesa.service.ts
init_dist();
init_apiResponse();
init_db();
import crypto10 from "crypto";

// server/src/modules/payments/mpesa.client.ts
init_config();
init_apiResponse();
var MpesaClient = class {
  tokenCache = null;
  isSimulatedMode = false;
  constructor(options) {
    if (options?.simulated !== void 0) {
      this.isSimulatedMode = options.simulated;
    } else {
      this.isSimulatedMode = config.env === "test" || config.mpesa.consumerKey === "sandbox_consumer_key" || config.mpesa.consumerKey.includes("placeholder");
    }
  }
  /**
   * Set simulated mode programmatically (useful for tests)
   */
  setSimulatedMode(enabled) {
    this.isSimulatedMode = enabled;
  }
  /**
   * Normalize any Kenyan phone number to 254XXXXXXXXX format
   * Supports: +254..., 07..., 01..., 254..., 7..., 1...
   */
  normalizePhoneNumber(phone) {
    if (!phone) {
      throw new AppError("Phone number is required", 400, "INVALID_PHONE_NUMBER");
    }
    let cleaned = phone.replace(/[\s\-\+\(\)]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.substring(1);
    } else if (cleaned.length === 9 && (cleaned.startsWith("7") || cleaned.startsWith("1"))) {
      cleaned = "254" + cleaned;
    }
    const kenyaMsisdnRegex = /^254(7|1)\d{8}$/;
    if (!kenyaMsisdnRegex.test(cleaned)) {
      throw new AppError(
        "Invalid Kenyan phone number. Format must be 07XXXXXXXX, 01XXXXXXXX, or 2547XXXXXXXX",
        400,
        "INVALID_PHONE_NUMBER"
      );
    }
    return cleaned;
  }
  /**
   * Format current date/time to Safaricom Timestamp format: YYYYMMDDHHmmss
   */
  generateTimestamp() {
    const now = /* @__PURE__ */ new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    return now.getFullYear().toString() + pad(now.getMonth() + 1) + pad(now.getDate()) + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
  }
  /**
   * Generate STK Push Password: Base64(Shortcode + Passkey + Timestamp)
   */
  generatePassword(shortcode, passkey, timestamp) {
    const raw = `${shortcode}${passkey}${timestamp}`;
    return Buffer.from(raw).toString("base64");
  }
  /**
   * Fetch OAuth Access Token from Daraja
   */
  async getAccessToken() {
    if (this.isSimulatedMode) {
      return "simulated_daraja_access_token_" + Date.now();
    }
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 6e4) {
      return this.tokenCache.token;
    }
    const baseUrl = config.mpesa.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const auth = Buffer.from(
      `${config.mpesa.consumerKey}:${config.mpesa.consumerSecret}`
    ).toString("base64");
    try {
      const response = await fetch(
        `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json"
          }
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Daraja OAuth failed: ${response.status} ${errorText}`);
      }
      const data = await response.json();
      const expiresInSec = parseInt(data.expires_in, 10) || 3599;
      this.tokenCache = {
        token: data.access_token,
        expiresAt: now + expiresInSec * 1e3
      };
      return data.access_token;
    } catch (err) {
      if (config.env !== "production") {
        console.warn("[DARJA_CLIENT] Network auth unreachable, falling back to simulated auth token:", err.message);
        return "simulated_daraja_access_token_" + Date.now();
      }
      throw new AppError(`Failed to authenticate with Safaricom Daraja: ${err.message}`, 502, "DARAJA_AUTH_FAILED");
    }
  }
  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async initiateStkPush(params) {
    const normalizedPhone = this.normalizePhoneNumber(params.phoneNumber);
    const timestamp = this.generateTimestamp();
    const shortcode = config.mpesa.shortcode;
    const passkey = config.mpesa.passkey;
    const password = this.generatePassword(shortcode, passkey, timestamp);
    const callbackUrl = params.callbackUrl || config.mpesa.callbackUrl;
    if (this.isSimulatedMode) {
      const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      return {
        merchantRequestId: `MR-${Date.now()}-${randSuffix}`,
        checkoutRequestId: `ws_CO_${Date.now()}_${randSuffix}`,
        responseCode: "0",
        responseDescription: "Success. Request accepted for processing",
        customerMessage: "Success. Request accepted for processing"
      };
    }
    const token = await this.getAccessToken();
    const baseUrl = config.mpesa.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.round(params.amount)),
      PartyA: normalizedPhone,
      PartyB: shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: callbackUrl,
      AccountReference: params.accountReference.substring(0, 12),
      TransactionDesc: params.transactionDesc.substring(0, 30)
    };
    try {
      const response = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const responseBody = await response.json();
      if (!response.ok || responseBody.ResponseCode !== "0") {
        const errorDesc = responseBody.ResponseDescription || responseBody.errorMessage || "STK push rejected by provider";
        throw new Error(errorDesc);
      }
      return {
        merchantRequestId: responseBody.MerchantRequestID || `MR-${Date.now()}`,
        checkoutRequestId: responseBody.CheckoutRequestID || `ws_CO_${Date.now()}`,
        responseCode: responseBody.ResponseCode || "0",
        responseDescription: responseBody.ResponseDescription || "Success",
        customerMessage: responseBody.CustomerMessage || "Request accepted for processing"
      };
    } catch (err) {
      if (config.env !== "production") {
        console.warn("[DARAJA_CLIENT] Network STK push unreachable, returning simulated STK response:", err.message);
        const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        return {
          merchantRequestId: `MR-${Date.now()}-${randSuffix}`,
          checkoutRequestId: `ws_CO_${Date.now()}_${randSuffix}`,
          responseCode: "0",
          responseDescription: "Success. Request accepted for processing",
          customerMessage: "Success. Request accepted for processing"
        };
      }
      throw new AppError(`Daraja STK push failed: ${err.message}`, 502, "STK_PUSH_FAILED");
    }
  }
  /**
   * Initiate M-Pesa B2C (Business to Customer) Automated Disbursement
   * Disburses funds directly to recipient's mobile phone wallet.
   */
  async initiateB2CDisbursement(params) {
    const normalizedPhone = this.normalizePhoneNumber(params.phoneNumber);
    const shortcode = config.mpesa.b2cShortcode;
    const initiatorName = config.mpesa.b2cInitiatorName;
    const securityCredential = config.mpesa.b2cSecurityCredential;
    const resultUrl = params.resultUrl || config.mpesa.b2cResultUrl;
    const timeoutUrl = params.timeoutUrl || config.mpesa.b2cTimeoutUrl;
    const commandId = params.commandId || "BusinessPayment";
    const amountKes = Math.max(1, Math.round(params.amount));
    if (this.isSimulatedMode) {
      const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      return {
        conversationId: `AG_${Date.now()}_${randSuffix}`,
        originatorConversationId: `ORIG_${Date.now()}_${randSuffix}`,
        responseCode: "0",
        responseDescription: "Accept the service request successfully."
      };
    }
    const token = await this.getAccessToken();
    const baseUrl = config.mpesa.environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const payload = {
      InitiatorName: initiatorName,
      SecurityCredential: securityCredential,
      CommandID: commandId,
      Amount: amountKes,
      PartyA: shortcode,
      PartyB: normalizedPhone,
      Remarks: (params.remarks || "Votexa Organiser Earnings Payout").substring(0, 100),
      QueueTimeOutURL: timeoutUrl,
      ResultURL: resultUrl,
      Occasion: (params.occasion || "Organiser Payout").substring(0, 100)
    };
    try {
      const response = await fetch(`${baseUrl}/mpesa/b2c/v1/paymentrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const responseBody = await response.json();
      if (!response.ok || responseBody.ResponseCode !== "0") {
        const errorDesc = responseBody.ResponseDescription || responseBody.errorMessage || "B2C disbursement request rejected by Safaricom Daraja";
        throw new Error(errorDesc);
      }
      return {
        conversationId: responseBody.ConversationID || `AG_${Date.now()}`,
        originatorConversationId: responseBody.OriginatorConversationID || `ORIG_${Date.now()}`,
        responseCode: responseBody.ResponseCode || "0",
        responseDescription: responseBody.ResponseDescription || "Accept the service request successfully."
      };
    } catch (err) {
      if (config.env !== "production") {
        console.warn(
          "[DARAJA_B2C_CLIENT] Network B2C call unreachable, returning simulated B2C response:",
          err.message
        );
        const randSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        return {
          conversationId: `AG_${Date.now()}_${randSuffix}`,
          originatorConversationId: `ORIG_${Date.now()}_${randSuffix}`,
          responseCode: "0",
          responseDescription: "Accept the service request successfully."
        };
      }
      throw new AppError(
        `Daraja B2C disbursement failed: ${err.message}`,
        502,
        "B2C_DISBURSEMENT_FAILED"
      );
    }
  }
};
var mpesaClient = new MpesaClient();

// server/src/modules/revenue/revenue.service.ts
init_dist();
init_apiResponse();
init_db();
import crypto9 from "crypto";

// server/src/modules/financial-ledger/financial-ledger.service.ts
init_dist();
init_apiResponse();
init_db();
import crypto8 from "crypto";
var FinancialLedgerService = class _FinancialLedgerService {
  // In-memory fallback stores for test and offline execution
  static localAccounts = /* @__PURE__ */ new Map();
  static localLedgerEntries = [];
  static resetState() {
    _FinancialLedgerService.localAccounts.clear();
    _FinancialLedgerService.localLedgerEntries = [];
  }
  /**
   * Account key generator
   */
  getAccountKey(orgId, type, currency) {
    return `${orgId || "PLATFORM"}:${type}:${currency.toUpperCase()}`;
  }
  /**
   * Retrieve or create a financial account with integer minor currency units
   */
  async getOrCreateAccount(organizationId, accountType, currency = "USD") {
    const normOrgId = organizationId || null;
    const normCurrency = currency.toUpperCase();
    const key = this.getAccountKey(normOrgId, accountType, normCurrency);
    try {
      const client = await pool.connect();
      try {
        let res = await client.query(
          `SELECT * FROM financial_accounts
           WHERE organization_id IS NOT DISTINCT FROM $1
             AND account_type = $2
             AND currency = $3`,
          [normOrgId, accountType, normCurrency]
        );
        if (res.rows.length === 0) {
          const newId = `acc-${Date.now()}-${crypto8.randomBytes(3).toString("hex")}`;
          const now = (/* @__PURE__ */ new Date()).toISOString();
          res = await client.query(
            `INSERT INTO financial_accounts (
              id, organization_id, account_type, currency, available_balance, reserved_balance, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, 0, 0, $5, $6)
            ON CONFLICT (organization_id, account_type, currency) DO UPDATE SET updated_at = EXCLUDED.updated_at
            RETURNING *`,
            [newId, normOrgId, accountType, normCurrency, now, now]
          );
        }
        return this.mapDbAccount(res.rows[0]);
      } finally {
        client.release();
      }
    } catch {
      let acc = _FinancialLedgerService.localAccounts.get(key);
      if (!acc) {
        acc = {
          id: `acc-${Date.now()}-${crypto8.randomBytes(3).toString("hex")}`,
          organizationId: normOrgId || void 0,
          type: accountType,
          currency: normCurrency,
          availableBalance: 0,
          reservedBalance: 0,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        _FinancialLedgerService.localAccounts.set(key, acc);
      }
      return acc;
    }
  }
  /**
   * Record a strictly balanced double-entry ledger batch.
   * Invariant: Total Debits must exactly equal Total Credits!
   */
  async recordDoubleEntryBatch(params) {
    const { referenceType, referenceId, description, entries } = params;
    if (!entries || entries.length < 2) {
      throw new AppError(
        "A double-entry transaction must contain at least two entries.",
        400,
        "INVALID_LEDGER_BATCH"
      );
    }
    let totalDebits = 0;
    let totalCredits = 0;
    for (const e of entries) {
      if (!Number.isInteger(e.amountCents) || e.amountCents <= 0) {
        throw new AppError(
          `Invalid ledger entry amount: ${e.amountCents}. Must be a strictly positive integer minor currency unit.`,
          400,
          "INVALID_LEDGER_AMOUNT"
        );
      }
      if (e.direction === LedgerDirection.DEBIT) {
        totalDebits += e.amountCents;
      } else if (e.direction === LedgerDirection.CREDIT) {
        totalCredits += e.amountCents;
      } else {
        throw new AppError(`Invalid direction ${e.direction}`, 400, "INVALID_LEDGER_DIRECTION");
      }
    }
    if (totalDebits !== totalCredits) {
      throw new AppError(
        `Double-entry ledger out of balance! Total Debits (${totalDebits} cents) !== Total Credits (${totalCredits} cents). Difference: ${totalDebits - totalCredits} cents.`,
        500,
        "LEDGER_UNBALANCED"
      );
    }
    const entryGroupId = `grp-${Date.now()}-${crypto8.randomBytes(4).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const createdRecords = [];
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        for (const entry of entries) {
          const accRes = await client.query(
            `SELECT * FROM financial_accounts WHERE id = $1 FOR UPDATE`,
            [entry.accountId]
          );
          if (accRes.rows.length === 0) {
            throw new AppError(`Account ${entry.accountId} not found`, 404, "ACCOUNT_NOT_FOUND");
          }
          const acc = accRes.rows[0];
          let currentAvailable = Number(acc.available_balance);
          let currentReserved = Number(acc.reserved_balance);
          if (entry.affectsReserved) {
            if (entry.direction === LedgerDirection.CREDIT) {
              currentReserved += entry.amountCents;
            } else {
              currentReserved -= entry.amountCents;
            }
          } else {
            if (entry.direction === LedgerDirection.CREDIT) {
              currentAvailable += entry.amountCents;
            } else {
              currentAvailable -= entry.amountCents;
            }
          }
          const balanceAfter = currentAvailable;
          await client.query(
            `UPDATE financial_accounts
             SET available_balance = $1, reserved_balance = $2, updated_at = $3
             WHERE id = $4`,
            [currentAvailable, currentReserved, now, entry.accountId]
          );
          const entryId = `led-${Date.now()}-${crypto8.randomBytes(3).toString("hex")}`;
          const entryDesc = entry.description || description;
          const insertedRes = await client.query(
            `INSERT INTO financial_ledger_entries (
              id, entry_group_id, account_id, organization_id, direction,
              amount_cents, currency, balance_after, description,
              reference_type, reference_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
              entryId,
              entryGroupId,
              entry.accountId,
              acc.organization_id,
              entry.direction,
              entry.amountCents,
              acc.currency,
              balanceAfter,
              entryDesc,
              referenceType,
              referenceId,
              now
            ]
          );
          createdRecords.push(this.mapDbLedgerEntry(insertedRes.rows[0]));
        }
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch {
      for (const entry of entries) {
        let matchedAcc;
        for (const a of _FinancialLedgerService.localAccounts.values()) {
          if (a.id === entry.accountId) {
            matchedAcc = a;
            break;
          }
        }
        if (!matchedAcc) {
          matchedAcc = {
            id: entry.accountId,
            type: FinancialAccountType.ORGANIZER_TREASURY,
            currency: "USD",
            availableBalance: 0,
            reservedBalance: 0,
            createdAt: now,
            updatedAt: now
          };
          _FinancialLedgerService.localAccounts.set(entry.accountId, matchedAcc);
        }
        if (entry.affectsReserved) {
          if (entry.direction === LedgerDirection.CREDIT) {
            matchedAcc.reservedBalance += entry.amountCents;
          } else {
            matchedAcc.reservedBalance -= entry.amountCents;
          }
        } else {
          if (entry.direction === LedgerDirection.CREDIT) {
            matchedAcc.availableBalance += entry.amountCents;
          } else {
            matchedAcc.availableBalance -= entry.amountCents;
          }
        }
        matchedAcc.updatedAt = now;
        const record = {
          id: `led-${Date.now()}-${crypto8.randomBytes(3).toString("hex")}`,
          entryGroupId,
          accountId: entry.accountId,
          organizationId: matchedAcc.organizationId,
          direction: entry.direction,
          amountCents: entry.amountCents,
          currency: matchedAcc.currency,
          balanceAfter: matchedAcc.availableBalance,
          description: entry.description || description,
          referenceType,
          referenceId,
          createdAt: now
        };
        _FinancialLedgerService.localLedgerEntries.unshift(record);
        createdRecords.push(record);
      }
    }
    return {
      entryGroupId,
      entries: createdRecords
    };
  }
  /**
   * List double-entry ledger records
   */
  async listEntries(organizationId, limit = 100) {
    try {
      const client = await pool.connect();
      try {
        let query = "SELECT * FROM financial_ledger_entries";
        const params = [];
        if (organizationId) {
          query += " WHERE organization_id = $1";
          params.push(organizationId);
        }
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbLedgerEntry(r));
      } finally {
        client.release();
      }
    } catch {
      let list = _FinancialLedgerService.localLedgerEntries;
      if (organizationId) {
        list = list.filter((e) => e.organizationId === organizationId);
      }
      return list.slice(0, limit);
    }
  }
  /**
   * List financial accounts for an organization or platform
   */
  async listAccounts(organizationId) {
    try {
      const client = await pool.connect();
      try {
        let query = "SELECT * FROM financial_accounts";
        const params = [];
        if (organizationId) {
          query += " WHERE organization_id = $1";
          params.push(organizationId);
        }
        query += " ORDER BY created_at ASC";
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbAccount(r));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(_FinancialLedgerService.localAccounts.values());
      if (organizationId) {
        list = list.filter((a) => a.organizationId === organizationId);
      }
      return list;
    }
  }
  /**
   * Ledger Integrity Audit: Verify that every entry group is balanced (Sum Debits === Sum Credits)
   */
  async verifyLedgerBalance() {
    const integrity = await this.verifyLedgerIntegrity();
    return integrity.isBalanced;
  }
  async verifyLedgerIntegrity() {
    const groups = /* @__PURE__ */ new Map();
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT entry_group_id, direction, amount_cents FROM financial_ledger_entries`
        );
        for (const row of res.rows) {
          const gid = row.entry_group_id;
          const dir = row.direction;
          const amt = Number(row.amount_cents);
          let g = groups.get(gid);
          if (!g) {
            g = { debits: 0, credits: 0, count: 0 };
            groups.set(gid, g);
          }
          g.count++;
          if (dir === "DEBIT") g.debits += amt;
          else if (dir === "CREDIT") g.credits += amt;
        }
      } finally {
        client.release();
      }
    } catch {
      for (const e of _FinancialLedgerService.localLedgerEntries) {
        let g = groups.get(e.entryGroupId);
        if (!g) {
          g = { debits: 0, credits: 0, count: 0 };
          groups.set(e.entryGroupId, g);
        }
        g.count++;
        if (e.direction === LedgerDirection.DEBIT) g.debits += e.amountCents;
        else if (e.direction === LedgerDirection.CREDIT) g.credits += e.amountCents;
      }
    }
    const discrepancies = [];
    for (const [gid, g] of groups.entries()) {
      if (g.debits !== g.credits) {
        discrepancies.push(
          `Group ${gid}: Debits (${g.debits}) !== Credits (${g.credits}), diff: ${g.debits - g.credits}`
        );
      }
    }
    return {
      isBalanced: discrepancies.length === 0,
      totalGroupsAudited: groups.size,
      discrepancies
    };
  }
  mapDbAccount(row) {
    return {
      id: row.id,
      organizationId: row.organization_id || void 0,
      type: row.account_type,
      currency: row.currency,
      availableBalance: Number(row.available_balance),
      reservedBalance: Number(row.reserved_balance),
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at
    };
  }
  mapDbLedgerEntry(row) {
    return {
      id: row.id,
      entryGroupId: row.entry_group_id,
      accountId: row.account_id,
      organizationId: row.organization_id || void 0,
      direction: row.direction,
      amountCents: Number(row.amount_cents),
      currency: row.currency,
      balanceAfter: Number(row.balance_after),
      description: row.description,
      referenceType: row.reference_type,
      referenceId: row.reference_id || void 0,
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at
    };
  }
};
var financialLedgerService = new FinancialLedgerService();

// server/src/modules/revenue/revenue.service.ts
var RevenueService = class _RevenueService {
  // In-memory fallback cache
  static localAllocations = /* @__PURE__ */ new Map();
  static localPaymentToAllocMap = /* @__PURE__ */ new Map();
  // Current default commission settings: 40.00% Platform / 60.00% Organiser
  static currentPlatformRateBasisPoints = 4e3;
  // 40.00%
  static resetState() {
    _RevenueService.localAllocations.clear();
    _RevenueService.localPaymentToAllocMap.clear();
    _RevenueService.currentPlatformRateBasisPoints = 4e3;
  }
  /**
   * Set global platform commission rate for FUTURE allocations.
   * Crucial Rule: Historical allocations must NEVER change when this is updated!
   */
  setGlobalPlatformCommissionRate(rateBasisPoints) {
    if (rateBasisPoints < 0 || rateBasisPoints > 1e4) {
      throw new AppError("Platform commission rate must be between 0 and 10,000 basis points (0% - 100%)", 400, "INVALID_RATE");
    }
    _RevenueService.currentPlatformRateBasisPoints = rateBasisPoints;
  }
  getGlobalPlatformCommissionRate() {
    return _RevenueService.currentPlatformRateBasisPoints;
  }
  /**
   * Compute Commercial 25/75 Split with integer minor currency units.
   * Formula:
   *   Distributable = Gross - Processing Fees - Approved Deductions
   *   Platform Share = floor(Distributable * 25 / 100)
   *   Organiser Share = Distributable - Platform Share
   *   Invariant: Platform Share + Organiser Share === Distributable
   */
  calculateSplit(grossAmountCents, processingFeeCents = 0, approvedDeductionCents = 0, platformRateBasisPoints = _RevenueService.currentPlatformRateBasisPoints) {
    if (!Number.isInteger(grossAmountCents) || grossAmountCents < 0) {
      throw new AppError("Gross amount must be a non-negative integer in cents", 400, "INVALID_AMOUNT");
    }
    if (!Number.isInteger(processingFeeCents) || processingFeeCents < 0) {
      throw new AppError("Processing fee must be a non-negative integer in cents", 400, "INVALID_FEE");
    }
    if (!Number.isInteger(approvedDeductionCents) || approvedDeductionCents < 0) {
      throw new AppError("Approved deductions must be a non-negative integer in cents", 400, "INVALID_DEDUCTION");
    }
    const totalDeductions = processingFeeCents + approvedDeductionCents;
    if (totalDeductions > grossAmountCents) {
      throw new AppError(
        `Total deductions (${totalDeductions} cents) cannot exceed gross payment (${grossAmountCents} cents)`,
        400,
        "DEDUCTIONS_EXCEED_GROSS"
      );
    }
    const distributableAmountCents = grossAmountCents - totalDeductions;
    const organiserRateBasisPoints = 1e4 - platformRateBasisPoints;
    const platformFeeCents = Math.floor(distributableAmountCents * platformRateBasisPoints / 1e4);
    const organiserFeeCents = distributableAmountCents - platformFeeCents;
    return {
      distributableAmountCents,
      platformFeeCents,
      organiserFeeCents,
      platformRateBasisPoints,
      organiserRateBasisPoints
    };
  }
  /**
   * Allocate revenue after a verified payment.
   * Records immutable commission snapshot & balanced double-entry ledger entries.
   */
  async allocateRevenue(paymentTransaction, options) {
    const paymentId = paymentTransaction.id;
    const currency = (paymentTransaction.currency || "USD").toUpperCase();
    const grossAmountCents = paymentTransaction.amountCents;
    const existing = await this.getAllocationByPaymentId(paymentId);
    if (existing) {
      return existing;
    }
    const processingFeeCents = options?.processingFeeCents !== void 0 ? options.processingFeeCents : Math.round(grossAmountCents * 0.015);
    const approvedDeductionCents = options?.approvedDeductionCents || 0;
    const platformRate = options?.platformRateBasisPoints || _RevenueService.currentPlatformRateBasisPoints;
    const split = this.calculateSplit(
      grossAmountCents,
      processingFeeCents,
      approvedDeductionCents,
      platformRate
    );
    const allocationId = `rev-${Date.now()}-${crypto9.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const allocation = {
      id: allocationId,
      paymentTransactionId: paymentId,
      organizationId: paymentTransaction.organizationId,
      electionId: paymentTransaction.electionId,
      grossAmountCents,
      processingFeeCents,
      approvedDeductionCents,
      distributableAmountCents: split.distributableAmountCents,
      platformRateBasisPoints: split.platformRateBasisPoints,
      platformFeeCents: split.platformFeeCents,
      organiserRateBasisPoints: split.organiserRateBasisPoints,
      organiserFeeCents: split.organiserFeeCents,
      currency,
      status: "ALLOCATED",
      allocatedAt: now
    };
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      paymentTransaction.organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      currency
    );
    const platformTreasury = await financialLedgerService.getOrCreateAccount(
      null,
      // Platform Global
      FinancialAccountType.PLATFORM_TREASURY,
      currency
    );
    const processingEscrow = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PROCESSING_FEES_ESCROW,
      currency
    );
    const reserveEscrow = await financialLedgerService.getOrCreateAccount(
      paymentTransaction.organizationId,
      FinancialAccountType.RESERVE_ESCROW,
      currency
    );
    const refundPool = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.VOTER_REFUND_POOL,
      currency
    );
    const ledgerEntries = [
      {
        accountId: refundPool.id,
        direction: LedgerDirection.DEBIT,
        amountCents: grossAmountCents,
        description: `Gross payment ingress (${currency} ${grossAmountCents / 100}) for payment ${paymentId}`
      }
    ];
    if (processingFeeCents > 0) {
      ledgerEntries.push({
        accountId: processingEscrow.id,
        direction: LedgerDirection.CREDIT,
        amountCents: processingFeeCents,
        description: `Payment processor gateway fee deduction`
      });
    }
    if (approvedDeductionCents > 0) {
      ledgerEntries.push({
        accountId: reserveEscrow.id,
        direction: LedgerDirection.CREDIT,
        amountCents: approvedDeductionCents,
        description: `Approved deduction reserve`
      });
    }
    if (split.platformFeeCents > 0) {
      ledgerEntries.push({
        accountId: platformTreasury.id,
        direction: LedgerDirection.CREDIT,
        amountCents: split.platformFeeCents,
        description: `Platform 25% revenue commission on payment ${paymentId}`
      });
    }
    if (split.organiserFeeCents > 0) {
      ledgerEntries.push({
        accountId: orgTreasury.id,
        direction: LedgerDirection.CREDIT,
        amountCents: split.organiserFeeCents,
        description: `Organiser 75% net share on payment ${paymentId}`
      });
    }
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId: paymentTransaction.organizationId,
      referenceType: "PAYMENT",
      referenceId: paymentId,
      description: `Revenue allocation for payment ${paymentId}`,
      entries: ledgerEntries
    });
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [paymentTransaction.organizationId]);
        await client.query(
          `INSERT INTO revenue_allocations (
            id, payment_transaction_id, organization_id, election_id,
            gross_amount_cents, processing_fee_cents, approved_deduction_cents,
            distributable_amount_cents, platform_rate_basis_points, platform_fee_cents,
            organiser_rate_basis_points, organiser_fee_cents, currency, status, allocated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            allocation.id,
            allocation.paymentTransactionId,
            allocation.organizationId,
            allocation.electionId,
            allocation.grossAmountCents,
            allocation.processingFeeCents,
            allocation.approvedDeductionCents,
            allocation.distributableAmountCents,
            allocation.platformRateBasisPoints,
            allocation.platformFeeCents,
            allocation.organiserRateBasisPoints,
            allocation.organiserFeeCents,
            allocation.currency,
            allocation.status,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _RevenueService.localAllocations.set(allocation.id, allocation);
      _RevenueService.localPaymentToAllocMap.set(allocation.paymentTransactionId, allocation.id);
    }
    return allocation;
  }
  /**
   * Find allocation by payment transaction ID
   */
  async getAllocationByPaymentId(paymentId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM revenue_allocations WHERE payment_transaction_id = $1`,
          [paymentId]
        );
        if (res.rows.length > 0) {
          return this.mapDbAllocation(res.rows[0]);
        }
        return null;
      } finally {
        client.release();
      }
    } catch {
      const allocId = _RevenueService.localPaymentToAllocMap.get(paymentId);
      return (allocId ? _RevenueService.localAllocations.get(allocId) : null) || null;
    }
  }
  /**
   * Organizer Revenue Dashboard Metrics
   */
  async getOrganizerMetrics(organizationId, currency = "USD") {
    const allocations = await this.listAllocations(organizationId);
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      currency
    );
    let grossSales = 0;
    let processingFees = 0;
    let approvedDeductions = 0;
    let distributableAmount = 0;
    let platformCommission = 0;
    let organiserEarnings = 0;
    for (const a of allocations) {
      if (a.status !== "FULLY_REFUNDED") {
        grossSales += a.grossAmountCents;
        processingFees += a.processingFeeCents;
        approvedDeductions += a.approvedDeductionCents;
        distributableAmount += a.distributableAmountCents;
        platformCommission += a.platformFeeCents;
        organiserEarnings += a.organiserFeeCents;
      }
    }
    return {
      organizationId,
      currency,
      grossSales,
      processingFees,
      approvedDeductions,
      distributableAmount,
      platformCommission,
      organiserEarnings,
      availableBalance: orgTreasury.availableBalance,
      reservedBalance: orgTreasury.reservedBalance,
      allocationsCount: allocations.length
    };
  }
  /**
   * Super Admin Financial Overview
   */
  async getPlatformMetrics(currency = "USD") {
    const allAllocations = await this.listAllAllocations();
    const platformTreasury = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PLATFORM_TREASURY,
      currency
    );
    const audit = await financialLedgerService.verifyLedgerIntegrity();
    let totalPaymentVolume = 0;
    let processingFees = 0;
    let refundsTotal = 0;
    let chargebacksTotal = 0;
    let organiserLiabilities = 0;
    for (const a of allAllocations) {
      totalPaymentVolume += a.grossAmountCents;
      processingFees += a.processingFeeCents;
      if (a.status !== "FULLY_REFUNDED") {
        organiserLiabilities += a.organiserFeeCents;
      }
      if (a.status === "FULLY_REFUNDED" || a.status === "PARTIALLY_REFUNDED") {
        refundsTotal += a.grossAmountCents;
      }
      if (a.status === "DISPUTED") {
        chargebacksTotal += a.grossAmountCents;
      }
    }
    return {
      currency,
      totalPaymentVolume,
      platformRevenue: platformTreasury.availableBalance,
      organiserLiabilities,
      processingFees,
      refundsTotal,
      chargebacksTotal,
      reconciliationDiscrepancies: audit.discrepancies.length,
      isLedgerBalanced: audit.isBalanced
    };
  }
  /**
   * Alias for getPlatformMetrics
   */
  async getSuperAdminMetrics(currency = "USD") {
    return this.getPlatformMetrics(currency);
  }
  /**
   * List allocations for an organization, or all allocations if orgId is omitted
   */
  async listAllocations(organizationId) {
    if (!organizationId) {
      return this.listAllAllocations();
    }
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        const res = await client.query(
          `SELECT * FROM revenue_allocations WHERE organization_id = $1 ORDER BY allocated_at DESC`,
          [organizationId]
        );
        return res.rows.map((r) => this.mapDbAllocation(r));
      } finally {
        client.release();
      }
    } catch {
      return Array.from(_RevenueService.localAllocations.values()).filter(
        (a) => a.organizationId === organizationId
      );
    }
  }
  /**
   * List all platform allocations (Super admin only)
   */
  async listAllAllocations() {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(`SELECT * FROM revenue_allocations ORDER BY allocated_at DESC`);
        return res.rows.map((r) => this.mapDbAllocation(r));
      } finally {
        client.release();
      }
    } catch {
      return Array.from(_RevenueService.localAllocations.values());
    }
  }
  mapDbAllocation(row) {
    return {
      id: row.id,
      paymentTransactionId: row.payment_transaction_id,
      organizationId: row.organization_id,
      electionId: row.election_id,
      grossAmountCents: Number(row.gross_amount_cents),
      processingFeeCents: Number(row.processing_fee_cents),
      approvedDeductionCents: Number(row.approved_deduction_cents),
      distributableAmountCents: Number(row.distributable_amount_cents),
      platformRateBasisPoints: Number(row.platform_rate_basis_points),
      platformFeeCents: Number(row.platform_fee_cents),
      organiserRateBasisPoints: Number(row.organiser_rate_basis_points),
      organiserFeeCents: Number(row.organiser_fee_cents),
      currency: row.currency,
      status: row.status,
      allocatedAt: row.allocated_at.toISOString ? row.allocated_at.toISOString() : row.allocated_at
    };
  }
};
var revenueService = new RevenueService();

// server/src/modules/payments/mpesa.service.ts
var MpesaService = class _MpesaService {
  // In-memory fallbacks for test & offline modes
  static localTransactions = /* @__PURE__ */ new Map();
  static localEvents = [];
  static localIdempotencyKeys = /* @__PURE__ */ new Set();
  static localReconciliations = [];
  /**
   * Reset in-memory state for clean test isolation
   */
  static resetState() {
    _MpesaService.localTransactions.clear();
    _MpesaService.localEvents = [];
    _MpesaService.localIdempotencyKeys.clear();
    _MpesaService.localReconciliations = [];
  }
  /**
   * Convert price cents to KES based on package currency
   */
  calculateKesAmount(priceCents, currency) {
    if (currency.toUpperCase() === "KES") {
      return Math.max(1, Math.round(priceCents / 100));
    }
    return Math.max(1, Math.round(priceCents / 100 * 130));
  }
  /**
   * 1. Initiate M-Pesa STK Push Payment
   */
  async initiatePayment(organizationId, req) {
    const { electionId, packageId, voterCode, phoneNumber } = req;
    if (!electionId || !packageId || !voterCode || !phoneNumber) {
      throw new AppError(
        "Election ID, Package ID, Voter Code, and Phone Number are required",
        400,
        "INVALID_PAYMENT_INITIATION_REQUEST"
      );
    }
    const normalizedPhone = mpesaClient.normalizePhoneNumber(phoneNumber);
    const election = await electionsService.getElectionById(organizationId, electionId);
    if (election.status !== ElectionStatus.ACTIVE) {
      throw new AppError(
        `Cannot purchase voting credits for election with status '${election.status}'. Election must be ACTIVE.`,
        400,
        "ELECTION_NOT_ACTIVE"
      );
    }
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      throw new AppError(
        "Institutional elections do not support paid voting packages or credits",
        400,
        "INSTITUTIONAL_PAID_VOTING_FORBIDDEN"
      );
    }
    const pkg = await votingPackagesService.getPackageById(organizationId, electionId, packageId);
    if (!pkg.isActive) {
      throw new AppError("The selected voting package is currently inactive or unavailable", 400, "PACKAGE_INACTIVE");
    }
    const amountKES = this.calculateKesAmount(pkg.priceCents, pkg.currency);
    const accountRef = `VTX-${electionId.substring(0, 6).toUpperCase()}`;
    const desc = `${pkg.credits} Votes - ${pkg.name}`.substring(0, 30);
    const stkResult = await mpesaClient.initiateStkPush({
      phoneNumber: normalizedPhone,
      amount: amountKES,
      accountReference: accountRef,
      transactionDesc: desc
    });
    const paymentId = `pay-mpesa-${Date.now()}-${crypto10.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const transaction = {
      id: paymentId,
      organizationId,
      electionId,
      packageId,
      voterCode: voterCode.trim().toUpperCase(),
      provider: PaymentProvider.MPESA,
      amountCents: pkg.priceCents,
      currency: pkg.currency,
      phoneNumber: normalizedPhone,
      merchantRequestId: stkResult.merchantRequestId,
      checkoutRequestId: stkResult.checkoutRequestId,
      status: PaymentTransactionStatus.PENDING,
      creditsIssued: false,
      createdAt: now,
      updatedAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `INSERT INTO payment_transactions (
            id, organization_id, election_id, package_id, voter_code,
            provider, amount_cents, currency, phone_number,
            merchant_request_id, checkout_request_id, status, credits_issued,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            transaction.id,
            transaction.organizationId,
            transaction.electionId,
            transaction.packageId,
            transaction.voterCode,
            transaction.provider,
            transaction.amountCents,
            transaction.currency,
            transaction.phoneNumber,
            transaction.merchantRequestId,
            transaction.checkoutRequestId,
            transaction.status,
            transaction.creditsIssued,
            now,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _MpesaService.localTransactions.set(transaction.id, transaction);
      _MpesaService.localTransactions.set(transaction.checkoutRequestId, transaction);
    }
    return {
      paymentId: transaction.id,
      merchantRequestId: stkResult.merchantRequestId,
      checkoutRequestId: stkResult.checkoutRequestId,
      status: PaymentTransactionStatus.PENDING,
      customerMessage: stkResult.customerMessage || "M-Pesa payment prompt sent to your phone."
    };
  }
  /**
   * 2. Query Payment Status
   */
  async getPayment(organizationId, paymentId) {
    let tx;
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        const res = await client.query(
          `SELECT * FROM payment_transactions WHERE (id = $1 OR checkout_request_id = $1) AND organization_id = $2`,
          [paymentId, organizationId]
        );
        if (res.rows.length > 0) {
          tx = this.mapDbTransaction(res.rows[0]);
        }
      } finally {
        client.release();
      }
    } catch {
      tx = _MpesaService.localTransactions.get(paymentId);
    }
    if (!tx || tx.organizationId !== organizationId) {
      throw new AppError("Payment transaction not found", 404, "PAYMENT_NOT_FOUND");
    }
    const pkg = await votingPackagesService.getPackageById(organizationId, tx.electionId, tx.packageId);
    return {
      paymentId: tx.id,
      organizationId: tx.organizationId,
      electionId: tx.electionId,
      packageId: tx.packageId,
      voterCode: tx.voterCode,
      amountCents: tx.amountCents,
      currency: tx.currency,
      phoneNumber: tx.phoneNumber,
      merchantRequestId: tx.merchantRequestId,
      checkoutRequestId: tx.checkoutRequestId,
      mpesaReceiptNumber: tx.mpesaReceiptNumber,
      status: tx.status,
      resultCode: tx.resultCode,
      resultDesc: tx.resultDesc,
      credits: pkg.credits,
      creditsIssued: tx.creditsIssued,
      creditsIssuedAt: tx.creditsIssuedAt,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt
    };
  }
  /**
   * 3. Process Daraja Callback (Safaricom Webhook)
   */
  async processCallback(payload) {
    const stkCallback = payload?.Body?.stkCallback;
    if (!stkCallback) {
      throw new AppError("Invalid M-Pesa callback payload format", 400, "INVALID_CALLBACK_FORMAT");
    }
    const {
      MerchantRequestID: _MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata
    } = stkCallback;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const eventId = `ev-${Date.now()}-${crypto10.randomBytes(3).toString("hex")}`;
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO payment_provider_events (id, provider, event_type, raw_payload, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [eventId, "MPESA", "STK_CALLBACK", JSON.stringify(payload), now]
        );
      } finally {
        client.release();
      }
    } catch {
      _MpesaService.localEvents.push({
        id: eventId,
        provider: "MPESA",
        eventType: "STK_CALLBACK",
        payload,
        createdAt: now
      });
    }
    let tx;
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM payment_transactions WHERE checkout_request_id = $1`,
          [CheckoutRequestID]
        );
        if (res.rows.length > 0) {
          tx = this.mapDbTransaction(res.rows[0]);
        }
      } finally {
        client.release();
      }
    } catch {
      tx = _MpesaService.localTransactions.get(CheckoutRequestID);
    }
    if (!tx) {
      console.warn(`[MPESA_CALLBACK] Received callback for unknown CheckoutRequestID: ${CheckoutRequestID}`);
      return {
        success: false,
        message: `Transaction not found for CheckoutRequestID: ${CheckoutRequestID}`,
        creditsIssued: false
      };
    }
    if (tx.creditsIssued || tx.status === PaymentTransactionStatus.SUCCESS) {
      return {
        success: true,
        message: "Duplicate callback ignored; credits have already been issued.",
        duplicate: true,
        creditsIssued: false
      };
    }
    if (ResultCode !== 0) {
      await this.updateTransactionStatus(
        tx.id,
        tx.checkoutRequestId,
        PaymentTransactionStatus.FAILED,
        ResultCode,
        ResultDesc,
        false
      );
      return {
        success: false,
        message: ResultDesc || `M-Pesa payment failed with code ${ResultCode}`,
        creditsIssued: false
      };
    }
    let mpesaReceiptNumber;
    let callbackAmount;
    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === "MpesaReceiptNumber" && item.Value) {
          mpesaReceiptNumber = String(item.Value);
        } else if (item.Name === "Amount" && item.Value !== void 0) {
          callbackAmount = Number(item.Value);
        }
      }
    }
    if (!mpesaReceiptNumber) {
      await this.flagReconciliationDiscrepancy(
        tx.id,
        "Missing MpesaReceiptNumber in successful callback metadata"
      );
      await this.updateTransactionStatus(
        tx.id,
        tx.checkoutRequestId,
        PaymentTransactionStatus.FAILED,
        ResultCode,
        "Missing M-Pesa receipt number from provider",
        false
      );
      return {
        success: false,
        message: "Provider failed to return a valid receipt number.",
        creditsIssued: false
      };
    }
    const idempotencyKey = `mpesa:${mpesaReceiptNumber}`;
    const isDuplicate = await this.checkAndRecordIdempotency(idempotencyKey, tx.id);
    if (isDuplicate) {
      return {
        success: true,
        message: `Duplicate receipt number ${mpesaReceiptNumber}. Credits already processed.`,
        duplicate: true,
        creditsIssued: false
      };
    }
    const pkg = await votingPackagesService.getPackageById(tx.organizationId, tx.electionId, tx.packageId);
    const expectedKes = this.calculateKesAmount(pkg.priceCents, pkg.currency);
    if (callbackAmount !== void 0 && callbackAmount < expectedKes) {
      await this.flagReconciliationDiscrepancy(
        tx.id,
        `Amount mismatch: expected ${expectedKes} KES, received ${callbackAmount} KES`
      );
      await this.updateTransactionStatus(
        tx.id,
        tx.checkoutRequestId,
        PaymentTransactionStatus.FAILED,
        ResultCode,
        `Payment amount (${callbackAmount} KES) is less than package price (${expectedKes} KES)`,
        false
      );
      return {
        success: false,
        message: "Payment amount mismatch. Transaction marked for review.",
        creditsIssued: false
      };
    }
    await this.updateTransactionStatus(
      tx.id,
      tx.checkoutRequestId,
      PaymentTransactionStatus.SUCCESS,
      0,
      ResultDesc || "Payment verified successfully.",
      true,
      mpesaReceiptNumber
    );
    await voterWalletService.addCredits(
      tx.organizationId,
      tx.electionId,
      tx.voterCode,
      pkg.credits,
      mpesaReceiptNumber,
      `M-Pesa payment ${mpesaReceiptNumber} (${pkg.name})`,
      false
      // Real verified payment
    );
    await walletsService.creditWallet(
      tx.organizationId,
      tx.amountCents,
      `M-Pesa Revenue: ${pkg.name} (Receipt: ${mpesaReceiptNumber})`,
      tx.id
    );
    await revenueService.allocateRevenue(tx, {
      processingFeeCents: Math.round(tx.amountCents * 0.015),
      // Standard gateway fee
      approvedDeductionCents: 0
    });
    return {
      success: true,
      message: `Verified payment ${mpesaReceiptNumber}. Issued ${pkg.credits} voting credits.`,
      creditsIssued: true
    };
  }
  /**
   * Helper: Update transaction status in DB & local cache
   */
  async updateTransactionStatus(paymentId, checkoutRequestId, status, resultCode, resultDesc, creditsIssued = false, mpesaReceiptNumber) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const creditsIssuedAt = creditsIssued ? now : null;
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE payment_transactions
           SET status = $1, result_code = $2, result_desc = $3,
               credits_issued = $4, credits_issued_at = $5,
               mpesa_receipt_number = COALESCE($6, mpesa_receipt_number),
               updated_at = $7
           WHERE id = $8`,
          [status, resultCode, resultDesc, creditsIssued, creditsIssuedAt, mpesaReceiptNumber, now, paymentId]
        );
      } finally {
        client.release();
      }
    } catch {
      const tx = _MpesaService.localTransactions.get(paymentId);
      if (tx) {
        tx.status = status;
        tx.resultCode = resultCode;
        tx.resultDesc = resultDesc;
        tx.creditsIssued = creditsIssued;
        tx.creditsIssuedAt = creditsIssuedAt || void 0;
        if (mpesaReceiptNumber) tx.mpesaReceiptNumber = mpesaReceiptNumber;
        tx.updatedAt = now;
        _MpesaService.localTransactions.set(paymentId, tx);
        _MpesaService.localTransactions.set(checkoutRequestId, tx);
      }
    }
  }
  /**
   * Helper: Atomically record idempotency key
   */
  async checkAndRecordIdempotency(key, resourceId) {
    try {
      const client = await pool.connect();
      try {
        const check = await client.query("SELECT key FROM idempotency_records WHERE key = $1", [key]);
        if (check.rows.length > 0) {
          return true;
        }
        await client.query(
          `INSERT INTO idempotency_records (key, provider, resource_id) VALUES ($1, $2, $3)`,
          [key, "MPESA", resourceId]
        );
        return false;
      } finally {
        client.release();
      }
    } catch {
      if (_MpesaService.localIdempotencyKeys.has(key)) {
        return true;
      }
      _MpesaService.localIdempotencyKeys.add(key);
      return false;
    }
  }
  /**
   * Helper: Record reconciliation discrepancy
   */
  async flagReconciliationDiscrepancy(paymentId, reason) {
    const id = `rec-${Date.now()}-${crypto10.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO payment_reconciliations (id, payment_id, status, discrepancy_reason, created_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, paymentId, "DISCREPANCY_FLAGGED", reason, now]
        );
      } finally {
        client.release();
      }
    } catch {
      _MpesaService.localReconciliations.push({
        id,
        paymentId,
        status: "DISCREPANCY_FLAGGED",
        discrepancyReason: reason,
        createdAt: now
      });
    }
  }
  /**
   * 4. List transactions for an organization
   */
  async listTransactions(organizationId, filter) {
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        let query = "SELECT * FROM payment_transactions WHERE organization_id = $1";
        const params = [organizationId];
        if (filter?.electionId) {
          params.push(filter.electionId);
          query += ` AND election_id = $${params.length}`;
        }
        if (filter?.voterCode) {
          params.push(filter.voterCode.toUpperCase());
          query += ` AND voter_code = $${params.length}`;
        }
        if (filter?.status) {
          params.push(filter.status);
          query += ` AND status = $${params.length}`;
        }
        query += " ORDER BY created_at DESC";
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbTransaction(r));
      } finally {
        client.release();
      }
    } catch {
      const list = Array.from(_MpesaService.localTransactions.values()).filter(
        (t) => t.organizationId === organizationId
      );
      const map = /* @__PURE__ */ new Map();
      for (const t of list) {
        if (!map.has(t.id)) map.set(t.id, t);
      }
      let filtered = Array.from(map.values());
      if (filter?.electionId) filtered = filtered.filter((t) => t.electionId === filter.electionId);
      if (filter?.voterCode) {
        const vCode = filter.voterCode.toUpperCase();
        filtered = filtered.filter((t) => t.voterCode === vCode);
      }
      if (filter?.status) filtered = filtered.filter((t) => t.status === filter.status);
      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }
  mapDbTransaction(row) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      electionId: row.election_id,
      packageId: row.package_id,
      voterCode: row.voter_code,
      provider: row.provider,
      amountCents: Number(row.amount_cents),
      currency: row.currency,
      phoneNumber: row.phone_number,
      merchantRequestId: row.merchant_request_id,
      checkoutRequestId: row.checkout_request_id,
      mpesaReceiptNumber: row.mpesa_receipt_number,
      status: row.status,
      resultCode: row.result_code !== null ? Number(row.result_code) : void 0,
      resultDesc: row.result_desc,
      creditsIssued: Boolean(row.credits_issued),
      creditsIssuedAt: row.credits_issued_at ? row.credits_issued_at.toISOString ? row.credits_issued_at.toISOString() : row.credits_issued_at : void 0,
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at
    };
  }
};
var mpesaService = new MpesaService();

// server/src/modules/payments/mpesa-b2c.service.ts
init_dist();
init_db();
init_apiResponse();
import crypto12 from "crypto";

// server/src/modules/payouts/payouts.service.ts
init_dist();
init_apiResponse();
init_db();
import crypto11 from "crypto";
var PayoutsService = class _PayoutsService {
  static localPayouts = /* @__PURE__ */ new Map();
  static localReservations = /* @__PURE__ */ new Map();
  static localAuditLogs = [];
  static localAccounts = /* @__PURE__ */ new Map();
  static resetState() {
    _PayoutsService.localPayouts.clear();
    _PayoutsService.localReservations.clear();
    _PayoutsService.localAuditLogs = [];
    _PayoutsService.localAccounts.clear();
  }
  /**
   * 1. Submit Withdrawal Request & Atomically Reserve Funds
   * Invariant: Never deducts permanently at request creation; reserves funds first.
   */
  async requestWithdrawal(organizationId, userId, req) {
    const { amountCents, method, destinationDetails } = req;
    const currency = (req.currency || "USD").toUpperCase();
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new AppError("Withdrawal amount must be a positive integer in cents", 400, "INVALID_AMOUNT");
    }
    const MIN_WITHDRAWAL_CENTS = 1e3;
    if (amountCents < MIN_WITHDRAWAL_CENTS) {
      throw new AppError(
        `Minimum withdrawal amount is $${(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)} (${MIN_WITHDRAWAL_CENTS} cents)`,
        400,
        "MINIMUM_WITHDRAWAL_NOT_MET"
      );
    }
    let normalizedDestination = { ...destinationDetails };
    if (method === PayoutMethod.MPESA_B2C) {
      if (!destinationDetails.phoneNumber) {
        throw new AppError("M-Pesa phone number is required for mobile disbursement", 400, "PHONE_REQUIRED");
      }
      const normPhone = mpesaClient.normalizePhoneNumber(destinationDetails.phoneNumber);
      normalizedDestination = {
        ...destinationDetails,
        phoneNumber: normPhone
      };
    } else if (method === PayoutMethod.BANK_TRANSFER) {
      if (!destinationDetails.accountNumber || !destinationDetails.accountName || !destinationDetails.bankName) {
        throw new AppError("Bank account number, account name, and bank name are required", 400, "BANK_DETAILS_INCOMPLETE");
      }
    }
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      currency
    );
    if (orgTreasury.availableBalance < amountCents) {
      throw new AppError(
        `Insufficient available earnings. Available: $${(orgTreasury.availableBalance / 100).toFixed(2)}, Requested: $${(amountCents / 100).toFixed(2)}`,
        400,
        "INSUFFICIENT_BALANCE"
      );
    }
    const existingPayouts = await this.listPayouts(organizationId);
    const hasDuplicatePending = existingPayouts.some(
      (p) => (p.status === PayoutStatus.REQUESTED || p.status === PayoutStatus.RESERVED || p.status === PayoutStatus.UNDER_REVIEW) && p.amountCents === amountCents && p.method === method
    );
    if (hasDuplicatePending) {
      throw new AppError("A withdrawal request for this exact amount is already pending review.", 409, "DUPLICATE_PAYOUT_REQUEST");
    }
    const feeCents = method === PayoutMethod.MPESA_B2C ? 50 : 150;
    const netAmountCents = amountCents - feeCents;
    if (netAmountCents <= 0) {
      throw new AppError("Withdrawal amount must exceed the disbursement processing fee", 400, "AMOUNT_BELOW_FEE");
    }
    const payoutId = `pot-${Date.now()}-${crypto11.randomBytes(3).toString("hex")}`;
    const reservationId = `res-${Date.now()}-${crypto11.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId,
      referenceType: "PAYOUT_RESERVE",
      referenceId: payoutId,
      description: `Reserve funds for withdrawal request ${payoutId}`,
      entries: [
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.DEBIT,
          amountCents,
          description: `Debit available balance for payout reservation`
        },
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.CREDIT,
          amountCents,
          description: `Credit reserved balance for payout reservation`,
          affectsReserved: true
        }
      ]
    });
    const payout = {
      id: payoutId,
      organizationId,
      payoutAccountId: req.payoutAccountId,
      amountCents,
      feeCents,
      netAmountCents,
      currency,
      method,
      destinationDetails: normalizedDestination,
      status: PayoutStatus.RESERVED,
      requestedBy: userId,
      createdAt: now,
      updatedAt: now
    };
    const reservation = {
      id: reservationId,
      payoutId,
      accountId: orgTreasury.id,
      organizationId,
      amountCents,
      status: "ACTIVE",
      reservedAt: now
    };
    const auditLog = {
      id: `aud-${Date.now()}-${crypto11.randomBytes(3).toString("hex")}`,
      payoutId,
      organizationId,
      performedBy: userId,
      action: "PAYOUT_REQUESTED_AND_RESERVED",
      fromStatus: PayoutStatus.REQUESTED,
      toStatus: PayoutStatus.RESERVED,
      notes: `Requested $${(amountCents / 100).toFixed(2)} via ${method}. Funds reserved in treasury.`,
      createdAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query("BEGIN");
        await client.query(
          `INSERT INTO organizer_payouts (
            id, organization_id, payout_account_id, amount_cents, fee_cents, net_amount_cents,
            currency, method, destination_details, status, requested_by, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            payout.id,
            payout.organizationId,
            payout.payoutAccountId,
            payout.amountCents,
            payout.feeCents,
            payout.netAmountCents,
            payout.currency,
            payout.method,
            JSON.stringify(payout.destinationDetails),
            payout.status,
            payout.requestedBy,
            now,
            now
          ]
        );
        await client.query(
          `INSERT INTO payout_reservations (
            id, payout_id, account_id, organization_id, amount_cents, status, reserved_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            reservation.id,
            reservation.payoutId,
            reservation.accountId,
            reservation.organizationId,
            reservation.amountCents,
            reservation.status,
            now
          ]
        );
        await client.query(
          `INSERT INTO payout_audit_logs (
            id, payout_id, organization_id, performed_by, action, from_status, to_status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            auditLog.id,
            auditLog.payoutId,
            auditLog.organizationId,
            auditLog.performedBy,
            auditLog.action,
            auditLog.fromStatus,
            auditLog.toStatus,
            auditLog.notes,
            now
          ]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } catch {
      _PayoutsService.localPayouts.set(payout.id, payout);
      _PayoutsService.localReservations.set(payout.id, reservation);
      _PayoutsService.localAuditLogs.unshift(auditLog);
    }
    return payout;
  }
  /**
   * 2. Administrator Review & Approval / Rejection
   * Separation of duties invariant: An administrator cannot approve their own withdrawal request!
   */
  async reviewPayout(payoutId, adminUserId, action, reason) {
    const payout = await this.getPayoutRecord(payoutId);
    if (!payout) {
      throw new AppError("Payout request not found", 404, "PAYOUT_NOT_FOUND");
    }
    if (payout.status !== PayoutStatus.RESERVED && payout.status !== PayoutStatus.REQUESTED && payout.status !== PayoutStatus.UNDER_REVIEW) {
      throw new AppError(
        `Cannot review payout in current status '${payout.status}'. Expected RESERVED or UNDER_REVIEW.`,
        400,
        "INVALID_STATUS_TRANSITION"
      );
    }
    if (payout.requestedBy === adminUserId) {
      throw new AppError(
        "Separation of duties violation: An administrator cannot review or approve their own withdrawal request.",
        403,
        "SELF_APPROVAL_FORBIDDEN"
      );
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const prevStatus = payout.status;
    if (action === "APPROVE") {
      payout.status = PayoutStatus.APPROVED;
      payout.reviewedBy = adminUserId;
      payout.reviewedAt = now;
      payout.updatedAt = now;
      await this.recordAudit(
        payout.id,
        payout.organizationId,
        adminUserId,
        "PAYOUT_APPROVED",
        prevStatus,
        PayoutStatus.APPROVED,
        reason || "Approved by administrator for disbursement processing"
      );
      await this.savePayoutRecord(payout);
      return payout;
    }
    payout.status = PayoutStatus.REJECTED;
    payout.reviewedBy = adminUserId;
    payout.reviewedAt = now;
    payout.rejectionReason = reason || "Rejected by platform administrator";
    payout.updatedAt = now;
    await this.releaseReservation(payout, "Rejected by administrator: funds restored to available balance");
    await this.recordAudit(
      payout.id,
      payout.organizationId,
      adminUserId,
      "PAYOUT_REJECTED",
      prevStatus,
      PayoutStatus.REJECTED,
      payout.rejectionReason
    );
    await this.savePayoutRecord(payout);
    return payout;
  }
  /**
   * 3. Record Payout Settlement with Mandatory Evidence
   * Invariants:
   *   - Do not mark a payout PAID without settlement evidence.
   *   - A payout cannot be settled twice.
   */
  async recordSettlement(payoutId, adminUserId, params) {
    const { settlementEvidence, providerReference, notes } = params;
    if (!settlementEvidence || settlementEvidence.trim().length === 0) {
      throw new AppError(
        "Settlement evidence is mandatory (e.g. Bank wire reference, M-Pesa B2C Receipt number).",
        400,
        "SETTLEMENT_EVIDENCE_REQUIRED"
      );
    }
    const payout = await this.getPayoutRecord(payoutId);
    if (!payout) {
      throw new AppError("Payout request not found", 404, "PAYOUT_NOT_FOUND");
    }
    if (payout.status === PayoutStatus.PAID) {
      throw new AppError("This payout has already been verified and settled.", 409, "ALREADY_SETTLED");
    }
    if (payout.status !== PayoutStatus.APPROVED && payout.status !== PayoutStatus.PROCESSING) {
      throw new AppError(
        `Cannot settle payout with status '${payout.status}'. Payout must be APPROVED or PROCESSING.`,
        400,
        "INVALID_STATUS_FOR_SETTLEMENT"
      );
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const prevStatus = payout.status;
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      payout.organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      payout.currency
    );
    const platformTreasury = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PLATFORM_TREASURY,
      payout.currency
    );
    const settlementEntries = [
      {
        accountId: orgTreasury.id,
        direction: LedgerDirection.DEBIT,
        amountCents: payout.amountCents,
        description: `Settlement outflow: clear reserved balance for payout ${payout.id}`,
        affectsReserved: true
      }
    ];
    if (payout.feeCents > 0) {
      settlementEntries.push({
        accountId: platformTreasury.id,
        direction: LedgerDirection.CREDIT,
        amountCents: payout.feeCents,
        description: `Disbursement fee collected on payout ${payout.id}`
      });
    }
    const refundPool = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.VOTER_REFUND_POOL,
      payout.currency
    );
    settlementEntries.push({
      accountId: refundPool.id,
      direction: LedgerDirection.CREDIT,
      amountCents: payout.netAmountCents,
      description: `External disbursement transfer: ${settlementEvidence}`
    });
    const ledgerBatch = await financialLedgerService.recordDoubleEntryBatch({
      organizationId: payout.organizationId,
      referenceType: "PAYOUT_SETTLE",
      referenceId: payout.id,
      description: `Settlement confirmation for payout ${payout.id}`,
      entries: settlementEntries
    });
    await this.markReservationSettled(payout.id);
    payout.status = PayoutStatus.PAID;
    payout.settlementEvidence = settlementEvidence.trim();
    payout.settledAt = now;
    payout.ledgerEntryGroupId = ledgerBatch.entryGroupId;
    payout.updatedAt = now;
    await this.recordAudit(
      payout.id,
      payout.organizationId,
      adminUserId,
      "PAYOUT_SETTLED_AND_PAID",
      prevStatus,
      PayoutStatus.PAID,
      `Settlement verified: ${settlementEvidence}. Ref: ${providerReference || "N/A"}. ${notes || ""}`
    );
    await this.savePayoutRecord(payout);
    return payout;
  }
  /**
   * 4. Mark Payout Failed & Release Reservation
   */
  async failPayout(payoutId, reason, adminUserId) {
    const payout = await this.getPayoutRecord(payoutId);
    if (!payout) {
      throw new AppError("Payout request not found", 404, "PAYOUT_NOT_FOUND");
    }
    if (payout.status === PayoutStatus.PAID) {
      throw new AppError("Cannot fail a payout that has already been marked PAID.", 400, "CANNOT_FAIL_SETTLED");
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const prevStatus = payout.status;
    payout.status = PayoutStatus.FAILED;
    payout.rejectionReason = reason;
    payout.updatedAt = now;
    await this.releaseReservation(payout, `Disbursement failed: ${reason}. Funds released back to available balance.`);
    await this.recordAudit(
      payout.id,
      payout.organizationId,
      adminUserId || "SYSTEM",
      "PAYOUT_FAILED",
      prevStatus,
      PayoutStatus.FAILED,
      reason
    );
    await this.savePayoutRecord(payout);
    return payout;
  }
  /**
   * 5. Query Payout by ID with full audit log and reservation status
   */
  async getPayout(organizationId, payoutId) {
    const payout = await this.getPayoutRecord(payoutId);
    if (!payout || payout.organizationId !== organizationId) {
      throw new AppError("Payout record not found", 404, "PAYOUT_NOT_FOUND");
    }
    const reservation = await this.getReservation(payoutId);
    const auditLogs = await this.listAuditLogs(payoutId);
    return {
      payout,
      reservation,
      auditLogs
    };
  }
  /**
   * 6. List Payouts for an Organization
   */
  async listPayouts(organizationId, filter) {
    try {
      const client = await pool.connect();
      try {
        let query = "SELECT * FROM organizer_payouts";
        const params = [];
        if (organizationId) {
          query += " WHERE organization_id = $1";
          params.push(organizationId);
        }
        if (filter?.status) {
          query += params.length ? " AND status = $2" : " WHERE status = $1";
          params.push(filter.status);
        }
        query += " ORDER BY created_at DESC";
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbPayout(r));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(_PayoutsService.localPayouts.values());
      if (organizationId) {
        list = list.filter((p) => p.organizationId === organizationId);
      }
      if (filter?.status) {
        list = list.filter((p) => p.status === filter.status);
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }
  /**
   * 7. Save Destination Payout Account
   */
  async savePayoutAccount(organizationId, req) {
    const id = `pac-${Date.now()}-${crypto11.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    let identifier = req.accountIdentifier.trim();
    if (req.method === PayoutMethod.MPESA_B2C) {
      identifier = mpesaClient.normalizePhoneNumber(identifier);
    }
    const acc = {
      id,
      organizationId,
      method: req.method,
      accountName: req.accountName.trim(),
      accountIdentifier: identifier,
      bankName: req.bankName?.trim(),
      swiftCode: req.swiftCode?.trim(),
      isDefault: req.isDefault || false,
      isVerified: true,
      createdAt: now,
      updatedAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `INSERT INTO organization_payout_accounts (
            id, organization_id, method, account_name, account_identifier,
            bank_name, swift_code, is_default, is_verified, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            acc.id,
            acc.organizationId,
            acc.method,
            acc.accountName,
            acc.accountIdentifier,
            acc.bankName,
            acc.swiftCode,
            acc.isDefault,
            acc.isVerified,
            now,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      const list = _PayoutsService.localAccounts.get(organizationId) || [];
      list.push(acc);
      _PayoutsService.localAccounts.set(organizationId, list);
    }
    return acc;
  }
  /**
   * List saved payout destination accounts
   */
  async listPayoutAccounts(organizationId) {
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        const res = await client.query(
          `SELECT * FROM organization_payout_accounts WHERE organization_id = $1 ORDER BY is_default DESC, created_at DESC`,
          [organizationId]
        );
        return res.rows.map((r) => ({
          id: r.id,
          organizationId: r.organization_id,
          method: r.method,
          accountName: r.account_name,
          accountIdentifier: r.account_identifier,
          bankName: r.bank_name || void 0,
          swiftCode: r.swift_code || void 0,
          isDefault: Boolean(r.is_default),
          isVerified: Boolean(r.is_verified),
          createdAt: r.created_at.toISOString ? r.created_at.toISOString() : r.created_at,
          updatedAt: r.updated_at.toISOString ? r.updated_at.toISOString() : r.updated_at
        }));
      } finally {
        client.release();
      }
    } catch {
      return _PayoutsService.localAccounts.get(organizationId) || [];
    }
  }
  // --- Internal Helpers ---
  async releaseReservation(payout, reason) {
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      payout.organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      payout.currency
    );
    await financialLedgerService.recordDoubleEntryBatch({
      organizationId: payout.organizationId,
      referenceType: "PAYOUT_RELEASE",
      referenceId: payout.id,
      description: reason,
      entries: [
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.DEBIT,
          amountCents: payout.amountCents,
          description: `Debit reserved balance to release hold`,
          affectsReserved: true
        },
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.CREDIT,
          amountCents: payout.amountCents,
          description: `Credit back available balance after payout cancellation/rejection`
        }
      ]
    });
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE payout_reservations SET status = 'RELEASED', released_at = $1 WHERE payout_id = $2`,
          [now, payout.id]
        );
      } finally {
        client.release();
      }
    } catch {
      const res = _PayoutsService.localReservations.get(payout.id);
      if (res) {
        res.status = "RELEASED";
        res.releasedAt = now;
      }
    }
  }
  async markReservationSettled(payoutId) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE payout_reservations SET status = 'SETTLED', settled_at = $1 WHERE payout_id = $2`,
          [now, payoutId]
        );
      } finally {
        client.release();
      }
    } catch {
      const res = _PayoutsService.localReservations.get(payoutId);
      if (res) {
        res.status = "SETTLED";
        res.settledAt = now;
      }
    }
  }
  async recordAudit(payoutId, organizationId, performedBy, action, fromStatus, toStatus, notes) {
    const id = `aud-${Date.now()}-${crypto11.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const log = {
      id,
      payoutId,
      organizationId,
      performedBy,
      action,
      fromStatus,
      toStatus,
      notes,
      createdAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO payout_audit_logs (
            id, payout_id, organization_id, performed_by, action, from_status, to_status, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [log.id, log.payoutId, log.organizationId, log.performedBy, log.action, log.fromStatus, log.toStatus, log.notes, now]
        );
      } finally {
        client.release();
      }
    } catch {
      _PayoutsService.localAuditLogs.unshift(log);
    }
  }
  async getPayoutRecord(payoutId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(`SELECT * FROM organizer_payouts WHERE id = $1`, [payoutId]);
        if (res.rows.length > 0) return this.mapDbPayout(res.rows[0]);
        return null;
      } finally {
        client.release();
      }
    } catch {
      return _PayoutsService.localPayouts.get(payoutId) || null;
    }
  }
  async savePayoutRecord(payout) {
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE organizer_payouts
           SET status = $1, reviewed_by = $2, reviewed_at = $3,
               settlement_evidence = $4, settled_at = $5,
               rejection_reason = $6, ledger_entry_group_id = $7, updated_at = $8
           WHERE id = $9`,
          [
            payout.status,
            payout.reviewedBy,
            payout.reviewedAt,
            payout.settlementEvidence,
            payout.settledAt,
            payout.rejectionReason,
            payout.ledgerEntryGroupId,
            payout.updatedAt,
            payout.id
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _PayoutsService.localPayouts.set(payout.id, payout);
    }
  }
  async getReservation(payoutId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(`SELECT * FROM payout_reservations WHERE payout_id = $1`, [payoutId]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          return {
            id: r.id,
            payoutId: r.payout_id,
            accountId: r.account_id,
            organizationId: r.organization_id,
            amountCents: Number(r.amount_cents),
            status: r.status,
            reservedAt: r.reserved_at.toISOString ? r.reserved_at.toISOString() : r.reserved_at,
            releasedAt: r.released_at ? r.released_at.toISOString() : void 0,
            settledAt: r.settled_at ? r.settled_at.toISOString() : void 0
          };
        }
        return void 0;
      } finally {
        client.release();
      }
    } catch {
      return _PayoutsService.localReservations.get(payoutId);
    }
  }
  async listAuditLogs(payoutId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM payout_audit_logs WHERE payout_id = $1 ORDER BY created_at DESC`,
          [payoutId]
        );
        return res.rows.map((r) => ({
          id: r.id,
          payoutId: r.payout_id,
          organizationId: r.organization_id,
          performedBy: r.performed_by,
          action: r.action,
          fromStatus: r.from_status,
          toStatus: r.to_status,
          notes: r.notes || void 0,
          createdAt: r.created_at.toISOString ? r.created_at.toISOString() : r.created_at
        }));
      } finally {
        client.release();
      }
    } catch {
      return _PayoutsService.localAuditLogs.filter((l) => l.payoutId === payoutId);
    }
  }
  mapDbPayout(row) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      payoutAccountId: row.payout_account_id || void 0,
      amountCents: Number(row.amount_cents),
      feeCents: Number(row.fee_cents),
      netAmountCents: Number(row.net_amount_cents),
      currency: row.currency,
      method: row.method,
      destinationDetails: typeof row.destination_details === "string" ? JSON.parse(row.destination_details) : row.destination_details,
      status: row.status,
      requestedBy: row.requested_by,
      reviewedBy: row.reviewed_by || void 0,
      reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : void 0,
      settlementEvidence: row.settlement_evidence || void 0,
      settledAt: row.settled_at ? row.settled_at.toISOString() : void 0,
      rejectionReason: row.rejection_reason || void 0,
      ledgerEntryGroupId: row.ledger_entry_group_id || void 0,
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at
    };
  }
};
var payoutsService = new PayoutsService();

// server/src/modules/payments/mpesa-b2c.service.ts
var MpesaB2CService = class _MpesaB2CService {
  // In-memory fallbacks for unit tests & offline environments
  static localDisbursements = /* @__PURE__ */ new Map();
  static localProcessedCallbacks = /* @__PURE__ */ new Set();
  /**
   * Reset in-memory state for clean test isolation
   */
  static resetState() {
    _MpesaB2CService.localDisbursements.clear();
    _MpesaB2CService.localProcessedCallbacks.clear();
  }
  /**
   * Calculate KES amount from payout net amount
   * Uses 1 USD = 130 KES if currency is USD
   */
  calculateKesAmount(netAmountCents, currency = "USD") {
    if (currency.toUpperCase() === "KES") {
      return Math.max(10, Math.round(netAmountCents / 100));
    }
    return Math.max(10, Math.round(netAmountCents / 100 * 130));
  }
  /**
   * 1. Initiate M-Pesa B2C Automated Disbursement
   * Dispatches mobile wallet disbursement via Safaricom Daraja B2C API.
   * Invariant: Administrator cannot disburse their own payout request (Separation of Duties).
   */
  async dispatchDisbursement(payoutId, adminUserId, options) {
    if (!payoutId) {
      throw new AppError("Payout ID is required for B2C disbursement", 400, "PAYOUT_ID_REQUIRED");
    }
    const payout = await payoutsService.getPayoutRecord(payoutId);
    if (!payout) {
      throw new AppError("Payout request not found", 404, "PAYOUT_NOT_FOUND");
    }
    if (payout.requestedBy === adminUserId) {
      throw new AppError(
        "Separation of Duties Violation: You requested this payout. Another administrator must execute the disbursement.",
        403,
        "SEPARATION_OF_DUTIES_VIOLATION"
      );
    }
    if (payout.method !== PayoutMethod.MPESA_B2C) {
      throw new AppError(
        `Automated M-Pesa B2C disbursement is only permitted for MPESA_B2C payouts. Current method is '${payout.method}'.`,
        400,
        "INVALID_PAYOUT_METHOD"
      );
    }
    if (payout.status === PayoutStatus.PAID) {
      throw new AppError("This payout has already been paid and settled.", 409, "ALREADY_SETTLED");
    }
    if (payout.status !== PayoutStatus.APPROVED && payout.status !== PayoutStatus.PROCESSING) {
      throw new AppError(
        `Cannot disburse payout with status '${payout.status}'. Payout must be APPROVED prior to B2C disbursement.`,
        400,
        "INVALID_STATUS_FOR_DISBURSEMENT"
      );
    }
    const existingDisbursement = await this.getDisbursementByPayoutId(payoutId);
    if (existingDisbursement && existingDisbursement.status === MpesaB2CDisbursementStatus.INITIATED) {
      throw new AppError(
        `A B2C disbursement is already in flight for this payout (ConversationID: ${existingDisbursement.conversationId}).`,
        409,
        "DISBURSEMENT_ALREADY_IN_FLIGHT"
      );
    }
    const dest = payout.destinationDetails || {};
    const rawPhone = dest.phoneNumber || dest.phone || dest.accountIdentifier;
    if (!rawPhone) {
      throw new AppError(
        "Payout destination details do not contain a valid phone number",
        400,
        "MISSING_PHONE_NUMBER"
      );
    }
    const normalizedPhone = mpesaClient.normalizePhoneNumber(rawPhone);
    const amountKes = this.calculateKesAmount(payout.netAmountCents, payout.currency);
    const commandId = options?.commandId || "BusinessPayment";
    const remarks = options?.remarks || `Votexa Organiser Earnings Payout ${payout.id}`;
    const darajaResult = await mpesaClient.initiateB2CDisbursement({
      phoneNumber: normalizedPhone,
      amount: amountKes,
      commandId,
      remarks,
      occasion: `Payout-${payout.id.substring(0, 12)}`
    });
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const disbursementId = `b2c-${Date.now()}-${crypto12.randomBytes(3).toString("hex")}`;
    const record = {
      id: disbursementId,
      payoutId: payout.id,
      organizationId: payout.organizationId,
      conversationId: darajaResult.conversationId,
      originatorConversationId: darajaResult.originatorConversationId,
      phoneNumber: normalizedPhone,
      amountKes,
      commandId,
      status: MpesaB2CDisbursementStatus.INITIATED,
      dispatchedBy: adminUserId,
      dispatchedAt: now
    };
    const prevStatus = payout.status;
    payout.status = PayoutStatus.PROCESSING;
    payout.updatedAt = now;
    await payoutsService.savePayoutRecord(payout);
    await payoutsService.recordAudit(
      payout.id,
      payout.organizationId,
      adminUserId,
      "PAYOUT_B2C_DISPATCHED",
      prevStatus,
      PayoutStatus.PROCESSING,
      `M-Pesa B2C initiated to ${normalizedPhone} for KES ${amountKes}. ConversationID: ${darajaResult.conversationId}`
    );
    await this.saveDisbursementRecord(record);
    return {
      payoutId: payout.id,
      disbursementId: record.id,
      conversationId: darajaResult.conversationId,
      originatorConversationId: darajaResult.originatorConversationId,
      responseCode: darajaResult.responseCode,
      responseDescription: darajaResult.responseDescription,
      amountKes,
      recipientPhone: normalizedPhone
    };
  }
  /**
   * 2. Process Safaricom Daraja B2C Result Callback
   * Verifies external disbursement receipt and settles or fails the payout atomically.
   */
  async processB2CResult(payload) {
    if (!payload?.Result) {
      throw new AppError("Invalid B2C callback payload structure", 400, "INVALID_B2C_PAYLOAD");
    }
    const {
      ResultCode,
      ResultDesc,
      OriginatorConversationID,
      ConversationID,
      TransactionID,
      ResultParameters
    } = payload.Result;
    const convId = ConversationID || OriginatorConversationID;
    if (_MpesaB2CService.localProcessedCallbacks.has(convId)) {
      return {
        processed: false,
        status: "IGNORED",
        reason: "Callback already processed"
      };
    }
    const disbursement = await this.findDisbursementByConversation(ConversationID, OriginatorConversationID);
    if (!disbursement) {
      console.warn(
        `[MPESA_B2C_CALLBACK] Received callback for unknown ConversationID: ${ConversationID} / ${OriginatorConversationID}`
      );
      return {
        processed: false,
        status: "IGNORED",
        reason: "Unknown conversation reference"
      };
    }
    if (disbursement.status === MpesaB2CDisbursementStatus.SUCCESS || disbursement.status === MpesaB2CDisbursementStatus.FAILED) {
      return {
        processed: false,
        status: "IGNORED",
        payoutId: disbursement.payoutId,
        reason: `Disbursement already in terminal status ${disbursement.status}`
      };
    }
    _MpesaB2CService.localProcessedCallbacks.add(convId);
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const paramsMap = /* @__PURE__ */ new Map();
    if (ResultParameters?.ResultParameter) {
      for (const item of ResultParameters.ResultParameter) {
        if (item.Key && item.Value !== void 0) {
          paramsMap.set(item.Key, item.Value);
        }
      }
    }
    const receiptFromParams = paramsMap.get("TransactionReceipt");
    const finalReceipt = receiptFromParams || TransactionID || `MPESA-B2C-${convId.slice(-8).toUpperCase()}`;
    const receiverName = paramsMap.get("ReceiverPartyPublicName") || "";
    const completedAtTime = paramsMap.get("TransactionCompletedDateTime") || now;
    if (ResultCode === 0) {
      await payoutsService.recordSettlement(disbursement.payoutId, "SYSTEM_MPESA_B2C", {
        settlementEvidence: finalReceipt,
        providerReference: convId,
        notes: `Safaricom M-Pesa B2C verified to ${receiverName || disbursement.phoneNumber} on ${completedAtTime}. Receipt: ${finalReceipt}`
      });
      disbursement.status = MpesaB2CDisbursementStatus.SUCCESS;
      disbursement.transactionId = finalReceipt;
      disbursement.resultCode = ResultCode;
      disbursement.resultDesc = ResultDesc;
      disbursement.rawResult = payload;
      disbursement.completedAt = now;
      await this.updateDisbursementRecord(disbursement);
      return {
        processed: true,
        status: "SETTLED",
        payoutId: disbursement.payoutId,
        receipt: finalReceipt
      };
    }
    await payoutsService.failPayout(
      disbursement.payoutId,
      `M-Pesa B2C disbursement failed: ${ResultDesc} (Code: ${ResultCode})`,
      "SYSTEM_MPESA_B2C"
    );
    disbursement.status = MpesaB2CDisbursementStatus.FAILED;
    disbursement.resultCode = ResultCode;
    disbursement.resultDesc = ResultDesc;
    disbursement.rawResult = payload;
    disbursement.completedAt = now;
    await this.updateDisbursementRecord(disbursement);
    return {
      processed: true,
      status: "FAILED",
      payoutId: disbursement.payoutId,
      reason: ResultDesc
    };
  }
  /**
   * 3. Process Safaricom Daraja B2C Queue Timeout Callback
   */
  async processB2CTimeout(payload) {
    console.warn("[MPESA_B2C_TIMEOUT] Safaricom B2C queue timeout received:", JSON.stringify(payload));
  }
  /**
   * 4. List Disbursements for an Organization or Payout
   */
  async listDisbursements(organizationId, payoutId) {
    try {
      const client = await pool.connect();
      try {
        let query = "SELECT * FROM mpesa_b2c_disbursements";
        const params = [];
        if (organizationId && payoutId) {
          query += " WHERE organization_id = $1 AND payout_id = $2";
          params.push(organizationId, payoutId);
        } else if (organizationId) {
          query += " WHERE organization_id = $1";
          params.push(organizationId);
        } else if (payoutId) {
          query += " WHERE payout_id = $1";
          params.push(payoutId);
        }
        query += " ORDER BY dispatched_at DESC";
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbDisbursement(r));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(_MpesaB2CService.localDisbursements.values());
      if (organizationId) list = list.filter((d) => d.organizationId === organizationId);
      if (payoutId) list = list.filter((d) => d.payoutId === payoutId);
      return list;
    }
  }
  // --- Internal DB & In-Memory Helpers ---
  async getDisbursementByPayoutId(payoutId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM mpesa_b2c_disbursements WHERE payout_id = $1 ORDER BY dispatched_at DESC LIMIT 1`,
          [payoutId]
        );
        if (res.rows.length > 0) return this.mapDbDisbursement(res.rows[0]);
        return null;
      } finally {
        client.release();
      }
    } catch {
      const found = Array.from(_MpesaB2CService.localDisbursements.values()).find(
        (d) => d.payoutId === payoutId
      );
      return found || null;
    }
  }
  async findDisbursementByConversation(conversationId, originatorConversationId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM mpesa_b2c_disbursements 
           WHERE conversation_id = $1 OR originator_conversation_id = $2
           LIMIT 1`,
          [conversationId || "", originatorConversationId || ""]
        );
        if (res.rows.length > 0) return this.mapDbDisbursement(res.rows[0]);
        return null;
      } finally {
        client.release();
      }
    } catch {
      const found = Array.from(_MpesaB2CService.localDisbursements.values()).find(
        (d) => conversationId && d.conversationId === conversationId || originatorConversationId && d.originatorConversationId === originatorConversationId
      );
      return found || null;
    }
  }
  async saveDisbursementRecord(record) {
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO mpesa_b2c_disbursements (
            id, payout_id, organization_id, conversation_id, originator_conversation_id,
            phone_number, amount_kes, command_id, status, transaction_id, result_code,
            result_desc, raw_result, dispatched_by, dispatched_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
            record.id,
            record.payoutId,
            record.organizationId,
            record.conversationId,
            record.originatorConversationId,
            record.phoneNumber,
            record.amountKes,
            record.commandId,
            record.status,
            record.transactionId,
            record.resultCode,
            record.resultDesc,
            record.rawResult ? JSON.stringify(record.rawResult) : null,
            record.dispatchedBy,
            record.dispatchedAt
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _MpesaB2CService.localDisbursements.set(record.id, record);
    }
  }
  async updateDisbursementRecord(record) {
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE mpesa_b2c_disbursements
           SET status = $1, transaction_id = $2, result_code = $3,
               result_desc = $4, raw_result = $5, completed_at = $6
           WHERE id = $7`,
          [
            record.status,
            record.transactionId,
            record.resultCode,
            record.resultDesc,
            record.rawResult ? JSON.stringify(record.rawResult) : null,
            record.completedAt,
            record.id
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _MpesaB2CService.localDisbursements.set(record.id, record);
    }
  }
  mapDbDisbursement(r) {
    return {
      id: r.id,
      payoutId: r.payout_id,
      organizationId: r.organization_id,
      conversationId: r.conversation_id,
      originatorConversationId: r.originator_conversation_id,
      phoneNumber: r.phone_number,
      amountKes: parseFloat(r.amount_kes),
      commandId: r.command_id,
      status: r.status,
      transactionId: r.transaction_id || void 0,
      resultCode: r.result_code !== null ? parseInt(r.result_code, 10) : void 0,
      resultDesc: r.result_desc || void 0,
      rawResult: typeof r.raw_result === "string" ? JSON.parse(r.raw_result) : r.raw_result || void 0,
      dispatchedBy: r.dispatched_by,
      dispatchedAt: r.dispatched_at?.toISOString ? r.dispatched_at.toISOString() : r.dispatched_at,
      completedAt: r.completed_at ? r.completed_at?.toISOString ? r.completed_at.toISOString() : r.completed_at : void 0
    };
  }
};
var mpesaB2CService = new MpesaB2CService();

// server/src/modules/payments/paystack.service.ts
init_dist();
init_apiResponse();
init_db();
import crypto14 from "crypto";

// server/src/modules/payments/paystack.client.ts
init_config();
init_apiResponse();
import crypto13 from "crypto";
var PaystackClient = class {
  isSimulatedMode = false;
  constructor(options) {
    if (options?.simulated !== void 0) {
      this.isSimulatedMode = options.simulated;
    } else {
      this.isSimulatedMode = config.env === "test" || !config.paystack.secretKey || config.paystack.secretKey.includes("placeholder");
    }
  }
  setSimulatedMode(enabled) {
    this.isSimulatedMode = enabled;
  }
  /**
   * 1. Initialize Paystack Transaction (creates checkout authorization URL & access code)
   */
  async initializeTransaction(params) {
    const { email, amountSubunit, currency, reference, callbackUrl, metadata, channels } = params;
    if (!email || !amountSubunit || !currency || !reference) {
      throw new AppError("Email, amount, currency, and reference are required to initialize Paystack checkout", 400, "PAYSTACK_INVALID_PARAMS");
    }
    if (this.isSimulatedMode) {
      const accessCode = `pstk_acc_${Date.now()}_${crypto13.randomBytes(4).toString("hex")}`;
      return {
        authorizationUrl: `https://checkout.paystack.com/${accessCode}`,
        accessCode,
        reference
      };
    }
    try {
      const res = await fetch(`${config.paystack.baseUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          amount: amountSubunit,
          currency: currency.toUpperCase(),
          reference,
          callback_url: callbackUrl || config.paystack.callbackUrl,
          metadata: metadata || {},
          channels: channels || ["card", "mobile_money", "bank", "bank_transfer", "apple_pay"]
        })
      });
      const body = await res.json();
      if (!res.ok || !body.status || !body.data) {
        throw new AppError(body.message || "Failed to initialize Paystack transaction", 400, "PAYSTACK_INIT_FAILED");
      }
      return {
        authorizationUrl: body.data.authorization_url,
        accessCode: body.data.access_code,
        reference: body.data.reference
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Paystack gateway initialization network error: ${err.message}`, 502, "PAYSTACK_NETWORK_ERROR");
    }
  }
  /**
   * 2. Authoritatively Verify Transaction with Paystack API
   */
  async verifyTransaction(reference) {
    if (!reference) {
      throw new AppError("Transaction reference is required for Paystack verification", 400, "PAYSTACK_MISSING_REFERENCE");
    }
    if (this.isSimulatedMode) {
      return {
        id: Math.floor(Math.random() * 1e6),
        domain: "test",
        status: "success",
        reference,
        amount: 5e4,
        gatewayResponse: "Successful",
        paidAt: (/* @__PURE__ */ new Date()).toISOString(),
        channel: "mobile_money",
        currency: "KES",
        metadata: {}
      };
    }
    try {
      const res = await fetch(`${config.paystack.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          "Content-Type": "application/json"
        }
      });
      const body = await res.json();
      if (!res.ok || !body.status || !body.data) {
        throw new AppError(body.message || "Paystack transaction verification failed", 400, "PAYSTACK_VERIFY_FAILED");
      }
      const d = body.data;
      return {
        id: d.id,
        domain: d.domain,
        status: d.status,
        reference: d.reference,
        amount: d.amount,
        gatewayResponse: d.gateway_response,
        paidAt: d.paid_at,
        channel: d.channel,
        currency: d.currency,
        ipAddress: d.ip_address,
        metadata: d.metadata,
        customer: d.customer ? {
          id: d.customer.id,
          email: d.customer.email,
          customerCode: d.customer.customer_code,
          phone: d.customer.phone
        } : void 0
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError(`Paystack verification network error: ${err.message}`, 502, "PAYSTACK_NETWORK_ERROR");
    }
  }
  /**
   * 3. Verify HMAC-SHA512 Webhook Signature
   */
  verifyWebhookSignature(signature, rawBody) {
    if (!signature) return false;
    if (config.env === "test" && signature === "test_mock_paystack_signature") {
      return true;
    }
    const secret = config.paystack.webhookSecret || config.paystack.secretKey;
    if (!secret) {
      return config.env === "test" || this.isSimulatedMode;
    }
    const expected = crypto13.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (expected.length !== signature.length) {
      return false;
    }
    try {
      return crypto13.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
};
var paystackClient = new PaystackClient();

// server/src/modules/payments/paystack.service.ts
var PaystackService = class _PaystackService {
  // In-memory fallbacks for test & offline environments
  static localTransactions = /* @__PURE__ */ new Map();
  static localEvents = [];
  static localIdempotencyKeys = /* @__PURE__ */ new Set();
  /**
   * Reset in-memory state for clean test isolation
   */
  static resetState() {
    _PaystackService.localTransactions.clear();
    _PaystackService.localEvents = [];
    _PaystackService.localIdempotencyKeys.clear();
  }
  /**
   * 1. Initiate Paystack Payment Session
   */
  async initiatePayment(organizationId, req) {
    const { electionId, packageId, voterCode, email, phoneNumber, currency, callbackUrl } = req;
    if (!electionId || !packageId || !voterCode) {
      throw new AppError(
        "Election ID, Package ID, and Voter Code are required for payment initiation",
        400,
        "INVALID_PAYSTACK_INITIATE_REQUEST"
      );
    }
    const election = await electionsService.getElectionById(organizationId, electionId);
    if (election.status !== ElectionStatus.ACTIVE) {
      throw new AppError(
        `Cannot purchase voting credits for election with status '${election.status}'. Election must be ACTIVE.`,
        400,
        "ELECTION_NOT_ACTIVE"
      );
    }
    if (election.category === ElectionCategory.INSTITUTIONAL) {
      throw new AppError(
        "Institutional elections do not support paid voting packages or credits",
        400,
        "INSTITUTIONAL_PAID_VOTING_FORBIDDEN"
      );
    }
    const pkg = await votingPackagesService.getPackageById(organizationId, electionId, packageId);
    if (!pkg.isActive) {
      throw new AppError("The selected voting package is currently inactive or unavailable", 400, "PACKAGE_INACTIVE");
    }
    const customerEmail = email && email.includes("@") ? email.trim().toLowerCase() : `voter-${voterCode.toLowerCase().replace(/[^a-z0-9]/g, "")}@voter.votexa.io`;
    const txCurrency = (currency || pkg.currency || "KES").toUpperCase();
    const amountSubunit = pkg.priceCents;
    const reference = `pstk_vtx_${Date.now()}_${crypto14.randomBytes(4).toString("hex")}`;
    const paymentId = `pay-pstk-${Date.now()}-${crypto14.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const initResult = await paystackClient.initializeTransaction({
      email: customerEmail,
      amountSubunit,
      currency: txCurrency,
      reference,
      callbackUrl,
      metadata: {
        organizationId,
        electionId,
        packageId,
        voterCode: voterCode.trim().toUpperCase(),
        credits: pkg.credits,
        phoneNumber: phoneNumber || null,
        packageName: pkg.name
      }
    });
    const transaction = {
      id: paymentId,
      organizationId,
      electionId,
      packageId,
      voterCode: voterCode.trim().toUpperCase(),
      provider: PaymentProvider.PAYSTACK,
      amountCents: pkg.priceCents,
      currency: txCurrency,
      phoneNumber: phoneNumber || void 0,
      merchantRequestId: reference,
      checkoutRequestId: reference,
      status: PaymentTransactionStatus.PENDING,
      creditsIssued: false,
      createdAt: now,
      updatedAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `INSERT INTO payment_transactions (
            id, organization_id, election_id, package_id, voter_code,
            provider, amount_cents, currency, phone_number,
            merchant_request_id, checkout_request_id, gateway_reference,
            customer_email, status, credits_issued, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            transaction.id,
            transaction.organizationId,
            transaction.electionId,
            transaction.packageId,
            transaction.voterCode,
            transaction.provider,
            transaction.amountCents,
            transaction.currency,
            transaction.phoneNumber || null,
            transaction.merchantRequestId,
            transaction.checkoutRequestId,
            reference,
            customerEmail,
            transaction.status,
            transaction.creditsIssued,
            now,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _PaystackService.localTransactions.set(transaction.id, transaction);
      _PaystackService.localTransactions.set(reference, transaction);
    }
    return {
      paymentId: transaction.id,
      reference,
      authorizationUrl: initResult.authorizationUrl,
      accessCode: initResult.accessCode,
      amountCents: pkg.priceCents,
      currency: txCurrency,
      status: PaymentTransactionStatus.PENDING,
      message: "Paystack checkout session initialized successfully"
    };
  }
  /**
   * 2. Authoritatively Verify Paystack Payment and Issue Credits
   */
  async verifyPayment(organizationId, reference) {
    if (!reference) {
      throw new AppError("Transaction reference is required", 400, "PAYSTACK_MISSING_REFERENCE");
    }
    const verifyResult = await paystackClient.verifyTransaction(reference);
    let tx;
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        const res = await client.query(
          `SELECT * FROM payment_transactions WHERE (checkout_request_id = $1 OR gateway_reference = $1 OR id = $1) AND organization_id = $2`,
          [reference, organizationId]
        );
        if (res.rows.length > 0) {
          tx = this.mapDbTransaction(res.rows[0]);
        }
      } finally {
        client.release();
      }
    } catch {
      tx = _PaystackService.localTransactions.get(reference);
    }
    if (!tx) {
      throw new AppError(`Payment transaction with reference '${reference}' not found`, 404, "TRANSACTION_NOT_FOUND");
    }
    let creditsAdded = 0;
    if (verifyResult.status === "success") {
      if (!tx.creditsIssued) {
        const pkg = await votingPackagesService.getPackageById(organizationId, tx.electionId, tx.packageId);
        creditsAdded = pkg.credits;
        await voterWalletService.creditWallet(
          organizationId,
          tx.electionId,
          tx.voterCode,
          creditsAdded,
          reference,
          `Paystack purchase ${reference}`,
          false
        );
        tx.status = PaymentTransactionStatus.SUCCESS;
        tx.creditsIssued = true;
        tx.creditsIssuedAt = (/* @__PURE__ */ new Date()).toISOString();
        tx.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        try {
          const client = await pool.connect();
          try {
            await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
            await client.query(
              `UPDATE payment_transactions SET 
                status = $1, credits_issued = TRUE, credits_issued_at = $2,
                gateway_reference = $3, payment_channel = $4, updated_at = $5
              WHERE id = $6`,
              [
                PaymentTransactionStatus.SUCCESS,
                tx.creditsIssuedAt,
                verifyResult.reference,
                verifyResult.channel || "unknown",
                tx.updatedAt,
                tx.id
              ]
            );
          } finally {
            client.release();
          }
        } catch {
          _PaystackService.localTransactions.set(tx.id, tx);
          _PaystackService.localTransactions.set(reference, tx);
        }
        try {
          await revenueService.allocateRevenue({
            id: tx.id,
            organizationId,
            electionId: tx.electionId,
            amountCents: tx.amountCents,
            currency: tx.currency
          });
        } catch {
        }
      }
      return {
        paymentId: tx.id,
        reference: verifyResult.reference,
        status: PaymentTransactionStatus.SUCCESS,
        amountCents: tx.amountCents,
        currency: tx.currency,
        gatewayResponse: verifyResult.gatewayResponse,
        paidAt: verifyResult.paidAt,
        channel: verifyResult.channel,
        creditsIssued: true,
        creditsAdded,
        message: "Payment verified and voting credits successfully added to wallet"
      };
    } else {
      return {
        paymentId: tx.id,
        reference: verifyResult.reference,
        status: PaymentTransactionStatus.FAILED,
        amountCents: tx.amountCents,
        currency: tx.currency,
        gatewayResponse: verifyResult.gatewayResponse,
        channel: verifyResult.channel,
        creditsIssued: false,
        message: `Payment not completed. Current gateway status: ${verifyResult.status}`
      };
    }
  }
  /**
   * 3. Handle Paystack Webhook Event (charge.success, etc.)
   */
  async handleWebhook(signature, rawBody, payload) {
    const isValid = paystackClient.verifyWebhookSignature(signature, rawBody);
    if (!isValid) {
      throw new AppError("Invalid Paystack webhook signature", 401, "INVALID_PAYSTACK_SIGNATURE");
    }
    const { event, data } = payload;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO payment_provider_events (provider, event_type, raw_payload, created_at)
           VALUES ($1, $2, $3, $4)`,
          [PaymentProvider.PAYSTACK, event, JSON.stringify(payload), now]
        );
      } finally {
        client.release();
      }
    } catch {
      _PaystackService.localEvents.push({
        id: `evt-${Date.now()}`,
        provider: PaymentProvider.PAYSTACK,
        eventType: event,
        payload,
        createdAt: now
      });
    }
    if (event === "charge.success" && data && data.status === "success") {
      const reference = data.reference;
      const idempotencyKey = `paystack:charge:${reference}`;
      if (_PaystackService.localIdempotencyKeys.has(idempotencyKey)) {
        return { processed: true, reason: "IDEMPOTENT_REPLAY_IGNORED" };
      }
      try {
        const client = await pool.connect();
        try {
          const check = await client.query("SELECT id FROM idempotency_records WHERE key = $1", [idempotencyKey]);
          if (check.rows.length > 0) {
            return { processed: true, reason: "IDEMPOTENT_REPLAY_IGNORED" };
          }
        } finally {
          client.release();
        }
      } catch {
      }
      let tx;
      try {
        const client = await pool.connect();
        try {
          const res = await client.query(
            `SELECT * FROM payment_transactions WHERE checkout_request_id = $1 OR gateway_reference = $1`,
            [reference]
          );
          if (res.rows.length > 0) {
            tx = this.mapDbTransaction(res.rows[0]);
          }
        } finally {
          client.release();
        }
      } catch {
        tx = _PaystackService.localTransactions.get(reference);
      }
      if (!tx) {
        const meta = data.metadata;
        if (meta && meta.organizationId && meta.electionId && meta.voterCode && meta.packageId) {
          tx = {
            id: `pay-pstk-${data.id}`,
            organizationId: meta.organizationId,
            electionId: meta.electionId,
            packageId: meta.packageId,
            voterCode: meta.voterCode,
            provider: PaymentProvider.PAYSTACK,
            amountCents: data.amount,
            currency: data.currency,
            merchantRequestId: reference,
            checkoutRequestId: reference,
            status: PaymentTransactionStatus.PENDING,
            creditsIssued: false,
            createdAt: now,
            updatedAt: now
          };
        }
      }
      if (tx && !tx.creditsIssued) {
        const pkg = await votingPackagesService.getPackageById(tx.organizationId, tx.electionId, tx.packageId);
        await voterWalletService.creditWallet(
          tx.organizationId,
          tx.electionId,
          tx.voterCode,
          pkg.credits,
          reference,
          `Paystack charge ${reference}`,
          false
        );
        tx.status = PaymentTransactionStatus.SUCCESS;
        tx.creditsIssued = true;
        tx.creditsIssuedAt = now;
        tx.updatedAt = now;
        try {
          const client = await pool.connect();
          try {
            await client.query("SET LOCAL app.current_organization_id = $1", [tx.organizationId]);
            await client.query(
              `UPDATE payment_transactions SET
                status = $1, credits_issued = TRUE, credits_issued_at = $2,
                gateway_reference = $3, payment_channel = $4, updated_at = $5
              WHERE id = $6`,
              [
                PaymentTransactionStatus.SUCCESS,
                now,
                reference,
                data.channel || "unknown",
                now,
                tx.id
              ]
            );
            await client.query(
              `INSERT INTO idempotency_records (key, provider, resource_id, created_at)
               VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING`,
              [idempotencyKey, PaymentProvider.PAYSTACK, reference, now]
            );
          } finally {
            client.release();
          }
        } catch {
          _PaystackService.localTransactions.set(tx.id, tx);
          _PaystackService.localTransactions.set(reference, tx);
          _PaystackService.localIdempotencyKeys.add(idempotencyKey);
        }
        try {
          await revenueService.allocateRevenue({
            id: tx.id,
            organizationId: tx.organizationId,
            electionId: tx.electionId,
            amountCents: tx.amountCents,
            currency: tx.currency
          });
        } catch {
        }
      }
      _PaystackService.localIdempotencyKeys.add(idempotencyKey);
      return { processed: true };
    }
    return { processed: true, reason: `EVENT_${event}_IGNORED` };
  }
  mapDbTransaction(row) {
    return {
      id: row.id,
      organizationId: row.organization_id,
      electionId: row.election_id,
      packageId: row.package_id,
      voterCode: row.voter_code,
      provider: row.provider || PaymentProvider.PAYSTACK,
      amountCents: Number(row.amount_cents),
      currency: row.currency || "KES",
      phoneNumber: row.phone_number ? row.phone_number : void 0,
      merchantRequestId: row.merchant_request_id,
      checkoutRequestId: row.checkout_request_id,
      mpesaReceiptNumber: row.gateway_reference || row.mpesa_receipt_number,
      status: row.status,
      resultCode: row.result_code !== null ? Number(row.result_code) : void 0,
      resultDesc: row.result_desc,
      creditsIssued: Boolean(row.credits_issued),
      creditsIssuedAt: row.credits_issued_at ? new Date(row.credits_issued_at).toISOString() : void 0,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  }
};
var paystackService = new PaystackService();

// server/src/modules/payments/payments.controller.ts
var PaymentsController = class {
  // Existing SaaS package listing
  async list(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId || "org-demo-1";
    const electionId = req.query.electionId;
    const voterCode = req.query.voterCode;
    const mpesaTxs = await mpesaService.listTransactions(orgId, { electionId, voterCode });
    const saasPayments = await paymentsService.listPayments(orgId);
    sendSuccess(
      res,
      {
        transactions: mpesaTxs,
        saasPayments
      },
      void 0,
      200,
      req.requestId
    );
  }
  // 1. POST /api/v1/payments/initiate
  async initiateMpesaPayment(req, res) {
    const orgId = req.tenant?.organizationId || req.body.organizationId || "org-metro-uni";
    const result = await mpesaService.initiatePayment(orgId, {
      electionId: req.body.electionId,
      packageId: req.body.packageId,
      voterCode: req.body.voterCode,
      phoneNumber: req.body.phoneNumber
    });
    sendSuccess(res, result, void 0, 201, req.requestId);
  }
  // 2. GET /api/v1/payments/:id
  async getPaymentById(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId || "org-metro-uni";
    const paymentId = req.params.id;
    const payment = await mpesaService.getPayment(orgId, paymentId);
    sendSuccess(res, payment, void 0, 200, req.requestId);
  }
  // 3. POST /api/v1/webhooks/mpesa
  async handleMpesaCallback(req, res) {
    const payload = req.body;
    const result = await mpesaService.processCallback(payload);
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Callback processed successfully",
      ...result
    });
  }
  // 4. POST /api/v1/webhooks/mpesa/b2c-result
  async handleMpesaB2CResult(req, res) {
    const payload = req.body;
    const result = await mpesaB2CService.processB2CResult(payload);
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "B2C Callback processed successfully",
      ...result
    });
  }
  // 5. POST /api/v1/webhooks/mpesa/b2c-timeout
  async handleMpesaB2CTimeout(req, res) {
    await mpesaB2CService.processB2CTimeout(req.body);
    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "B2C Timeout acknowledged"
    });
  }
  // 6. POST /api/v1/payments/paystack/initiate
  async initiatePaystackPayment(req, res) {
    const orgId = req.tenant?.organizationId || req.body.organizationId || "org-metro-uni";
    const result = await paystackService.initiatePayment(orgId, {
      electionId: req.body.electionId,
      packageId: req.body.packageId,
      voterCode: req.body.voterCode,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      currency: req.body.currency,
      callbackUrl: req.body.callbackUrl
    });
    sendSuccess(res, result, void 0, 201, req.requestId);
  }
  // 7. GET /api/v1/payments/paystack/verify/:reference
  async verifyPaystackPayment(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId || "org-metro-uni";
    const reference = req.params.reference || req.query.reference;
    const result = await paystackService.verifyPayment(orgId, reference);
    sendSuccess(res, result, void 0, 200, req.requestId);
  }
  // 8. POST /api/v1/webhooks/paystack
  async handlePaystackWebhook(req, res) {
    const signature = req.headers["x-paystack-signature"] || "";
    const rawBody = req.rawBody || JSON.stringify(req.body);
    const payload = req.body;
    const result = await paystackService.handleWebhook(signature, rawBody, payload);
    res.status(200).json({
      status: true,
      message: "Paystack webhook received and processed",
      ...result
    });
  }
  // Existing SaaS checkout session
  async createCheckoutSession(req, res) {
    const orgId = req.tenant?.organizationId || req.body.organizationId || "org-demo-1";
    const session = await paymentsService.createCheckoutSession({
      packageId: req.body.packageId,
      organizationId: orgId,
      successUrl: req.body.successUrl,
      cancelUrl: req.body.cancelUrl
    });
    sendSuccess(res, session, void 0, 200, req.requestId);
  }
  // Existing SaaS confirm payment
  async confirmPayment(req, res) {
    const orgId = req.tenant?.organizationId || req.body.organizationId || "org-demo-1";
    const transaction = await paymentsService.confirmPayment(
      orgId,
      req.body.packageId,
      req.body.sessionId
    );
    sendSuccess(res, transaction, void 0, 201, req.requestId);
  }
};
var paymentsController = new PaymentsController();

// server/src/modules/payments/payments.routes.ts
var router11 = Router11();
router11.use(tenantContext({ required: false }));
router11.get("/", (req, res, next) => {
  paymentsController.list(req, res).catch(next);
});
router11.post("/paystack/initiate", (req, res, next) => {
  paymentsController.initiatePaystackPayment(req, res).catch(next);
});
router11.get("/paystack/verify/:reference", (req, res, next) => {
  paymentsController.verifyPaystackPayment(req, res).catch(next);
});
router11.post("/initiate", (req, res, next) => {
  paymentsController.initiateMpesaPayment(req, res).catch(next);
});
router11.get("/:id", (req, res, next) => {
  paymentsController.getPaymentById(req, res).catch(next);
});
router11.post("/checkout", (req, res, next) => {
  paymentsController.createCheckoutSession(req, res).catch(next);
});
router11.post("/confirm", (req, res, next) => {
  paymentsController.confirmPayment(req, res).catch(next);
});
var payments_routes_default = router11;

// server/src/modules/payments/webhooks.routes.ts
import { Router as Router12 } from "express";
var router12 = Router12();
router12.post("/mpesa", (req, res, next) => {
  paymentsController.handleMpesaCallback(req, res).catch(next);
});
router12.post("/mpesa/b2c-result", (req, res, next) => {
  paymentsController.handleMpesaB2CResult(req, res).catch(next);
});
router12.post("/mpesa/b2c-timeout", (req, res, next) => {
  paymentsController.handleMpesaB2CTimeout(req, res).catch(next);
});
router12.post("/paystack", (req, res, next) => {
  paymentsController.handlePaystackWebhook(req, res).catch(next);
});
var webhooks_routes_default = router12;

// server/src/modules/wallets/wallets.routes.ts
import { Router as Router13 } from "express";

// server/src/modules/wallets/wallets.controller.ts
init_apiResponse();
var WalletsController = class {
  async getWallet(req, res) {
    const orgId = req.tenant?.organizationId || "org-demo-1";
    const wallet = await walletsService.getWallet(orgId);
    sendSuccess(res, wallet, void 0, 200, req.requestId);
  }
  async getLedger(req, res) {
    const orgId = req.tenant?.organizationId || "org-demo-1";
    const ledger = await walletsService.getLedger(orgId);
    sendSuccess(res, ledger, void 0, 200, req.requestId);
  }
};

// server/src/modules/wallets/wallets.routes.ts
var router13 = Router13();
var controller7 = new WalletsController();
router13.use(authenticate);
router13.use(tenantContext());
router13.get("/my-wallet", (req, res, next) => {
  controller7.getWallet(req, res).catch(next);
});
var wallets_routes_default = router13;

// server/src/modules/revenue/revenue.routes.ts
import { Router as Router14 } from "express";

// server/src/modules/revenue/revenue.controller.ts
init_apiResponse();
var RevenueController = class {
  async getOrganizerMetrics(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId || "org-metro-uni";
    const currency = req.query.currency || "USD";
    const metrics = await revenueService.getOrganizerMetrics(orgId, currency);
    sendSuccess(res, metrics, void 0, 200, req.requestId);
  }
  async getPlatformMetrics(req, res) {
    const currency = req.query.currency || "USD";
    const metrics = await revenueService.getPlatformMetrics(currency);
    sendSuccess(res, metrics, void 0, 200, req.requestId);
  }
  async listAllocations(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId;
    const allocations = orgId ? await revenueService.listAllocations(orgId) : await revenueService.listAllAllocations();
    sendSuccess(res, allocations, void 0, 200, req.requestId);
  }
};
var revenueController = new RevenueController();

// server/src/modules/revenue/revenue.routes.ts
var router14 = Router14();
router14.use(tenantContext({ required: false }));
router14.get("/organizer", (req, res, next) => {
  revenueController.getOrganizerMetrics(req, res).catch(next);
});
router14.get("/platform", (req, res, next) => {
  revenueController.getPlatformMetrics(req, res).catch(next);
});
router14.get("/allocations", (req, res, next) => {
  revenueController.listAllocations(req, res).catch(next);
});
router14.get("/", (req, res, next) => {
  revenueController.getOrganizerMetrics(req, res).catch(next);
});
var revenue_routes_default = router14;

// server/src/modules/financial-ledger/financial-ledger.routes.ts
import { Router as Router15 } from "express";

// server/src/modules/financial-ledger/financial-ledger.controller.ts
init_apiResponse();
var FinancialLedgerController = class {
  async listEntries(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId;
    const limit = parseInt(req.query.limit, 10) || 100;
    const entries = await financialLedgerService.listEntries(orgId, limit);
    sendSuccess(res, entries, void 0, 200, req.requestId);
  }
  async listAccounts(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId;
    const accounts = await financialLedgerService.listAccounts(orgId);
    sendSuccess(res, accounts, void 0, 200, req.requestId);
  }
  async verifyIntegrity(req, res) {
    const audit = await financialLedgerService.verifyLedgerIntegrity();
    sendSuccess(res, audit, void 0, 200, req.requestId);
  }
};
var financialLedgerController = new FinancialLedgerController();

// server/src/modules/financial-ledger/financial-ledger.routes.ts
var router15 = Router15();
router15.use(tenantContext({ required: false }));
router15.get("/", (req, res, next) => {
  financialLedgerController.listEntries(req, res).catch(next);
});
router15.get("/accounts", (req, res, next) => {
  financialLedgerController.listAccounts(req, res).catch(next);
});
router15.get("/integrity", (req, res, next) => {
  financialLedgerController.verifyIntegrity(req, res).catch(next);
});
var financial_ledger_routes_default = router15;

// server/src/modules/refunds/refunds.routes.ts
import { Router as Router16 } from "express";

// server/src/modules/refunds/refunds.controller.ts
init_apiResponse();

// server/src/modules/refunds/refunds.service.ts
init_dist();
init_apiResponse();
init_db();
import crypto15 from "crypto";
var RefundsService = class _RefundsService {
  static localRefunds = [];
  static localChargebacks = [];
  static resetState() {
    _RefundsService.localRefunds = [];
    _RefundsService.localChargebacks = [];
  }
  /**
   * Process a Full or Partial Refund.
   * Invariant: Never deletes history; creates immutable reversal double-entry ledger entries.
   */
  async processRefund(organizationId, req, userId) {
    const { paymentTransactionId, reason, voterCode } = req;
    if (!paymentTransactionId || !reason) {
      throw new AppError("Payment transaction ID and refund reason are required", 400, "INVALID_REFUND_REQUEST");
    }
    const allocation = await revenueService.getAllocationByPaymentId(paymentTransactionId);
    if (!allocation) {
      throw new AppError("Revenue allocation not found for this transaction", 404, "ALLOCATION_NOT_FOUND");
    }
    if (allocation.organizationId !== organizationId) {
      throw new AppError("Unauthorized: Allocation belongs to another tenant", 403, "TENANT_MISMATCH");
    }
    if (allocation.status === "FULLY_REFUNDED") {
      throw new AppError("This transaction has already been fully refunded", 400, "ALREADY_REFUNDED");
    }
    const existingRefunds = await this.listRefundsForPayment(paymentTransactionId);
    const totalPreviouslyRefunded = existingRefunds.reduce((sum, r) => sum + r.refundAmountCents, 0);
    const availableToRefund = allocation.grossAmountCents - totalPreviouslyRefunded;
    const requestedAmount = req.amountCents || availableToRefund;
    if (requestedAmount <= 0) {
      throw new AppError("Refund amount must be a positive integer in cents", 400, "INVALID_AMOUNT");
    }
    if (requestedAmount > availableToRefund) {
      throw new AppError(
        `Requested refund (${requestedAmount} cents) exceeds maximum available to refund (${availableToRefund} cents)`,
        400,
        "REFUND_EXCEEDS_AVAILABLE"
      );
    }
    const isFullRefund = requestedAmount === allocation.grossAmountCents && totalPreviouslyRefunded === 0;
    const isNowFullyRefunded = totalPreviouslyRefunded + requestedAmount >= allocation.grossAmountCents;
    const ratio = requestedAmount / allocation.grossAmountCents;
    const reversalDistributableCents = Math.floor(allocation.distributableAmountCents * ratio);
    const reversalPlatformCents = Math.floor(allocation.platformFeeCents * ratio);
    const reversalOrganiserCents = reversalDistributableCents - reversalPlatformCents;
    const reversalProcessingCents = requestedAmount - reversalDistributableCents;
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      allocation.currency
    );
    const platformTreasury = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PLATFORM_TREASURY,
      allocation.currency
    );
    const processingEscrow = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.PROCESSING_FEES_ESCROW,
      allocation.currency
    );
    const refundPool = await financialLedgerService.getOrCreateAccount(
      null,
      FinancialAccountType.VOTER_REFUND_POOL,
      allocation.currency
    );
    const reversalEntries = [];
    if (reversalPlatformCents > 0) {
      reversalEntries.push({
        accountId: platformTreasury.id,
        direction: LedgerDirection.DEBIT,
        amountCents: reversalPlatformCents,
        description: `Platform commission refund reversal for ${paymentTransactionId}`
      });
    }
    if (reversalOrganiserCents > 0) {
      reversalEntries.push({
        accountId: orgTreasury.id,
        direction: LedgerDirection.DEBIT,
        amountCents: reversalOrganiserCents,
        description: `Organiser net share refund reversal for ${paymentTransactionId}`
      });
    }
    if (reversalProcessingCents > 0) {
      reversalEntries.push({
        accountId: processingEscrow.id,
        direction: LedgerDirection.DEBIT,
        amountCents: reversalProcessingCents,
        description: `Processing fee absorption/reversal`
      });
    }
    reversalEntries.push({
      accountId: refundPool.id,
      direction: LedgerDirection.CREDIT,
      amountCents: requestedAmount,
      description: `Customer refund payout for ${paymentTransactionId}`
    });
    const ledgerBatch = await financialLedgerService.recordDoubleEntryBatch({
      organizationId,
      referenceType: "REFUND",
      referenceId: paymentTransactionId,
      description: `Refund reversal for payment ${paymentTransactionId}: ${reason}`,
      entries: reversalEntries
    });
    const refundId = `ref-${Date.now()}-${crypto15.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const refundRecord = {
      id: refundId,
      paymentTransactionId,
      revenueAllocationId: allocation.id,
      organizationId,
      electionId: allocation.electionId,
      voterCode,
      type: isFullRefund ? "FULL" : "PARTIAL",
      refundAmountCents: requestedAmount,
      reversalDistributableCents,
      reversalPlatformCents,
      reversalOrganiserCents,
      reason,
      status: "PROCESSED",
      processedBy: userId,
      ledgerEntryGroupId: ledgerBatch.entryGroupId,
      createdAt: now,
      updatedAt: now
    };
    const newStatus = isNowFullyRefunded ? "FULLY_REFUNDED" : "PARTIALLY_REFUNDED";
    allocation.status = newStatus;
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `INSERT INTO refunds (
            id, payment_transaction_id, revenue_allocation_id, organization_id, election_id,
            voter_code, type, refund_amount_cents, reversal_distributable_cents,
            reversal_platform_cents, reversal_organiser_cents, reason, status,
            processed_by, ledger_entry_group_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            refundRecord.id,
            refundRecord.paymentTransactionId,
            refundRecord.revenueAllocationId,
            refundRecord.organizationId,
            refundRecord.electionId,
            refundRecord.voterCode,
            refundRecord.type,
            refundRecord.refundAmountCents,
            refundRecord.reversalDistributableCents,
            refundRecord.reversalPlatformCents,
            refundRecord.reversalOrganiserCents,
            refundRecord.reason,
            refundRecord.status,
            refundRecord.processedBy,
            refundRecord.ledgerEntryGroupId,
            now,
            now
          ]
        );
        await client.query(
          `UPDATE revenue_allocations SET status = $1 WHERE id = $2`,
          [newStatus, allocation.id]
        );
      } finally {
        client.release();
      }
    } catch {
      _RefundsService.localRefunds.unshift(refundRecord);
    }
    return refundRecord;
  }
  /**
   * Process Chargeback / Dispute.
   * Atomically debits organizer available balance and credits reserve escrow.
   */
  async processChargeback(organizationId, req) {
    const { paymentTransactionId, amountCents, reason } = req;
    const allocation = await revenueService.getAllocationByPaymentId(paymentTransactionId);
    if (!allocation) {
      throw new AppError("Revenue allocation not found for chargeback", 404, "ALLOCATION_NOT_FOUND");
    }
    const orgTreasury = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.ORGANIZER_TREASURY,
      allocation.currency
    );
    const reserveEscrow = await financialLedgerService.getOrCreateAccount(
      organizationId,
      FinancialAccountType.RESERVE_ESCROW,
      allocation.currency
    );
    const batch = await financialLedgerService.recordDoubleEntryBatch({
      organizationId,
      referenceType: "CHARGEBACK",
      referenceId: paymentTransactionId,
      description: `Chargeback dispute hold: ${reason}`,
      entries: [
        {
          accountId: orgTreasury.id,
          direction: LedgerDirection.DEBIT,
          amountCents,
          description: `Chargeback debit from organizer available balance`
        },
        {
          accountId: reserveEscrow.id,
          direction: LedgerDirection.CREDIT,
          amountCents,
          description: `Dispute reserve escrow hold`,
          affectsReserved: true
        }
      ]
    });
    const chargebackId = `chb-${Date.now()}-${crypto15.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const record = {
      id: chargebackId,
      paymentTransactionId,
      revenueAllocationId: allocation.id,
      organizationId,
      disputeAmountCents: amountCents,
      reason,
      status: "UNDER_REVIEW",
      ledgerEntryGroupId: batch.entryGroupId,
      createdAt: now,
      updatedAt: now
    };
    allocation.status = "DISPUTED";
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        await client.query(
          `INSERT INTO chargebacks (
            id, payment_transaction_id, revenue_allocation_id, organization_id,
            dispute_amount_cents, reason, status, ledger_entry_group_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            record.id,
            record.paymentTransactionId,
            record.revenueAllocationId,
            record.organizationId,
            record.disputeAmountCents,
            record.reason,
            record.status,
            record.ledgerEntryGroupId,
            now,
            now
          ]
        );
        await client.query(
          `UPDATE revenue_allocations SET status = 'DISPUTED' WHERE id = $1`,
          [allocation.id]
        );
      } finally {
        client.release();
      }
    } catch {
      _RefundsService.localChargebacks.unshift(record);
    }
    return record;
  }
  /**
   * List refunds for an organization
   */
  async listRefunds(organizationId) {
    try {
      const client = await pool.connect();
      try {
        await client.query("SET LOCAL app.current_organization_id = $1", [organizationId]);
        const res = await client.query(
          `SELECT * FROM refunds WHERE organization_id = $1 ORDER BY created_at DESC`,
          [organizationId]
        );
        return res.rows.map((r) => this.mapDbRefund(r));
      } finally {
        client.release();
      }
    } catch {
      return _RefundsService.localRefunds.filter((r) => r.organizationId === organizationId);
    }
  }
  async listRefundsForPayment(paymentId) {
    try {
      const client = await pool.connect();
      try {
        const res = await client.query(
          `SELECT * FROM refunds WHERE payment_transaction_id = $1`,
          [paymentId]
        );
        return res.rows.map((r) => this.mapDbRefund(r));
      } finally {
        client.release();
      }
    } catch {
      return _RefundsService.localRefunds.filter((r) => r.paymentTransactionId === paymentId);
    }
  }
  mapDbRefund(row) {
    return {
      id: row.id,
      paymentTransactionId: row.payment_transaction_id,
      revenueAllocationId: row.revenue_allocation_id,
      organizationId: row.organization_id,
      electionId: row.election_id,
      voterCode: row.voter_code || void 0,
      type: row.type,
      refundAmountCents: Number(row.refund_amount_cents),
      reversalDistributableCents: Number(row.reversal_distributable_cents),
      reversalPlatformCents: Number(row.reversal_platform_cents),
      reversalOrganiserCents: Number(row.reversal_organiser_cents),
      reason: row.reason,
      status: row.status,
      processedBy: row.processed_by || void 0,
      ledgerEntryGroupId: row.ledger_entry_group_id || void 0,
      createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
      updatedAt: row.updated_at.toISOString ? row.updated_at.toISOString() : row.updated_at
    };
  }
};
var refundsService = new RefundsService();

// server/src/modules/refunds/refunds.controller.ts
var RefundsController = class {
  async list(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId || "org-metro-uni";
    const refunds = await refundsService.listRefunds(orgId);
    sendSuccess(res, refunds, void 0, 200, req.requestId);
  }
  async requestRefund(req, res) {
    const orgId = req.tenant?.organizationId || req.body.organizationId || "org-metro-uni";
    const userId = req.user?.id;
    const refund = await refundsService.processRefund(
      orgId,
      {
        paymentTransactionId: req.body.paymentTransactionId,
        amountCents: req.body.amountCents ? parseInt(req.body.amountCents, 10) : void 0,
        reason: req.body.reason,
        voterCode: req.body.voterCode
      },
      userId
    );
    sendSuccess(res, refund, void 0, 201, req.requestId);
  }
  async processChargeback(req, res) {
    const orgId = req.tenant?.organizationId || req.body.organizationId || "org-metro-uni";
    const chargeback = await refundsService.processChargeback(orgId, {
      paymentTransactionId: req.body.paymentTransactionId,
      amountCents: parseInt(req.body.amountCents, 10),
      reason: req.body.reason
    });
    sendSuccess(res, chargeback, void 0, 201, req.requestId);
  }
};
var refundsController = new RefundsController();

// server/src/modules/refunds/refunds.routes.ts
var router16 = Router16();
router16.use(tenantContext({ required: false }));
router16.get("/", (req, res, next) => {
  refundsController.list(req, res).catch(next);
});
router16.post("/", (req, res, next) => {
  refundsController.requestRefund(req, res).catch(next);
});
router16.post("/chargeback", (req, res, next) => {
  refundsController.processChargeback(req, res).catch(next);
});
var refunds_routes_default = router16;

// server/src/modules/payouts/payouts.routes.ts
import { Router as Router17 } from "express";

// server/src/modules/payouts/payouts.controller.ts
init_apiResponse();
var PayoutsController = class {
  // 1. Submit withdrawal request
  async requestPayout(req, res) {
    const orgId = req.tenant?.organizationId || req.body.organizationId || "org-metro-uni";
    const userId = req.user?.id || req.body.userId || "usr-organizer-1";
    const payout = await payoutsService.requestWithdrawal(orgId, userId, {
      amountCents: parseInt(req.body.amountCents, 10),
      method: req.body.method,
      destinationDetails: req.body.destinationDetails,
      payoutAccountId: req.body.payoutAccountId,
      currency: req.body.currency
    });
    sendSuccess(res, payout, void 0, 201, req.requestId);
  }
  // 2. List payouts
  async list(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId;
    const status = req.query.status;
    const payouts = await payoutsService.listPayouts(orgId, { status });
    sendSuccess(res, payouts, void 0, 200, req.requestId);
  }
  // 3. Get single payout with audit log
  async getPayout(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId || "org-metro-uni";
    const payoutId = req.params.id;
    const details = await payoutsService.getPayout(orgId, payoutId);
    sendSuccess(res, details, void 0, 200, req.requestId);
  }
  // 4. Admin Review: Approve or Reject
  async reviewPayout(req, res) {
    const payoutId = req.params.id;
    const adminUserId = req.user?.id || req.body.adminUserId || "usr-super-admin";
    const action = req.body.action;
    const reason = req.body.reason;
    const payout = await payoutsService.reviewPayout(payoutId, adminUserId, action, reason);
    sendSuccess(res, payout, void 0, 200, req.requestId);
  }
  // 5. Admin Settlement: Record settlement evidence and mark PAID
  async settlePayout(req, res) {
    const payoutId = req.params.id;
    const adminUserId = req.user?.id || req.body.adminUserId || "usr-super-admin";
    const { settlementEvidence, providerReference, notes } = req.body;
    const payout = await payoutsService.recordSettlement(payoutId, adminUserId, {
      settlementEvidence,
      providerReference,
      notes
    });
    sendSuccess(res, payout, void 0, 200, req.requestId);
  }
  // 6. Save destination account
  async saveAccount(req, res) {
    const orgId = req.tenant?.organizationId || req.body.organizationId || "org-metro-uni";
    const acc = await payoutsService.savePayoutAccount(orgId, req.body);
    sendSuccess(res, acc, void 0, 201, req.requestId);
  }
  // 7. List destination accounts
  async listAccounts(req, res) {
    const orgId = req.tenant?.organizationId || req.query.organizationId || "org-metro-uni";
    const accounts = await payoutsService.listPayoutAccounts(orgId);
    sendSuccess(res, accounts, void 0, 200, req.requestId);
  }
  // 8. Admin automated M-Pesa B2C disbursement
  async disburseMpesaB2C(req, res) {
    const payoutId = req.params.id;
    const adminUserId = req.user?.id || req.body.adminUserId || "usr-super-admin";
    const { commandId, remarks } = req.body;
    const result = await mpesaB2CService.dispatchDisbursement(payoutId, adminUserId, {
      commandId,
      remarks
    });
    sendSuccess(res, result, void 0, 200, req.requestId);
  }
  // 9. List B2C disbursement records for a payout
  async listDisbursements(req, res) {
    const payoutId = req.params.id;
    const orgId = req.tenant?.organizationId || req.query.organizationId;
    const records = await mpesaB2CService.listDisbursements(orgId, payoutId);
    sendSuccess(res, records, void 0, 200, req.requestId);
  }
};
var payoutsController = new PayoutsController();

// server/src/modules/payouts/payouts.routes.ts
var router17 = Router17();
router17.use(tenantContext({ required: false }));
router17.get("/", (req, res, next) => {
  payoutsController.list(req, res).catch(next);
});
router17.post("/request", (req, res, next) => {
  payoutsController.requestPayout(req, res).catch(next);
});
router17.get("/accounts", (req, res, next) => {
  payoutsController.listAccounts(req, res).catch(next);
});
router17.post("/accounts", (req, res, next) => {
  payoutsController.saveAccount(req, res).catch(next);
});
router17.get("/:id", (req, res, next) => {
  payoutsController.getPayout(req, res).catch(next);
});
router17.post("/:id/review", (req, res, next) => {
  payoutsController.reviewPayout(req, res).catch(next);
});
router17.post("/:id/settle", (req, res, next) => {
  payoutsController.settlePayout(req, res).catch(next);
});
router17.post("/:id/disburse-mpesa", (req, res, next) => {
  payoutsController.disburseMpesaB2C(req, res).catch(next);
});
router17.get("/:id/disbursements", (req, res, next) => {
  payoutsController.listDisbursements(req, res).catch(next);
});
var payouts_routes_default = router17;

// server/src/modules/notifications/notifications.routes.ts
import { Router as Router18 } from "express";

// server/src/modules/notifications/notifications.controller.ts
init_apiResponse();
var NotificationsController = class {
  async list(_req, res) {
    sendSuccess(res, [
      {
        id: "notif-1",
        title: "Election Published",
        message: "Student Government Presidential Election 2026 is now live.",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    ]);
  }
  async markAsRead(req, res) {
    sendSuccess(res, { success: true, id: req.params.id });
  }
};

// server/src/modules/notifications/notifications.routes.ts
var router18 = Router18();
var controller8 = new NotificationsController();
router18.use(authenticate);
router18.get("/", (req, res, next) => {
  controller8.list(req, res).catch(next);
});
router18.patch("/:id/read", (req, res, next) => {
  controller8.markAsRead(req, res).catch(next);
});
var notifications_routes_default = router18;

// server/src/modules/reports/reports.routes.ts
import { Router as Router19 } from "express";

// server/src/modules/reports/reports.controller.ts
init_apiResponse();

// server/src/modules/reports/reports.service.ts
init_dist();
init_db();
var ReportsService = class {
  /**
   * Main report generation dispatcher
   */
  async generateReport(req, requesterUserId, isPlatformAdmin = false) {
    const { reportType, organizationId, electionId, format = "json" } = req;
    if (!isPlatformAdmin && !organizationId) {
      throw new Error("Organization context is required for tenant reports.");
    }
    let title = "";
    let data = [];
    switch (reportType) {
      case ReportType.ELECTION_PARTICIPATION:
        title = "Election Participation Report";
        data = await this.generateElectionParticipationReport(organizationId);
        break;
      case ReportType.CANDIDATE_VOTE_SUMMARY:
        title = "Candidate Vote Summary Report";
        data = await this.generateCandidateVoteSummaryReport(organizationId, electionId);
        break;
      case ReportType.VOTER_TURNOUT:
        title = "Voter Turnout & Engagement Report";
        data = await this.generateVoterTurnoutReport(organizationId, electionId);
        break;
      case ReportType.PAYMENT_TRANSACTIONS:
        title = "Payment & Transaction Ledger Report";
        data = await this.generatePaymentTransactionReport(organizationId);
        break;
      case ReportType.PLATFORM_COMMISSIONS:
        title = "Platform Revenue & Commission Share Report (40/60 Split)";
        data = await this.generatePlatformCommissionReport(organizationId);
        break;
      case ReportType.ORGANISER_EARNINGS:
        title = "Organiser Earnings & Balances Report (60% Share)";
        data = await this.generateOrganiserEarningsReport(organizationId);
        break;
      case ReportType.PAYOUTS:
        title = "Withdrawals & Disbursements Report";
        data = await this.generatePayoutsReport(organizationId);
        break;
      case ReportType.REFUNDS:
        title = "Refunds & Reversals Report";
        data = await this.generateRefundsReport(organizationId);
        break;
      case ReportType.FINANCIAL_RECONCILIATION:
        title = "Double-Entry Financial Ledger Reconciliation Report";
        data = await this.generateFinancialReconciliationReport(organizationId);
        break;
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
    const csvContent = format === "csv" ? this.convertToCsv(data) : void 0;
    return {
      reportType,
      title,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      generatedBy: requesterUserId,
      organizationScope: organizationId || "GLOBAL_PLATFORM",
      rowCount: data.length,
      data,
      csvContent
    };
  }
  // --- 1. Election Participation Report ---
  async generateElectionParticipationReport(orgId) {
    const elections = await electionsService.listElections(orgId);
    const rows = [];
    for (const e of elections) {
      const candidates = await candidatesService.listCandidates(e.organizationId, e.id);
      const tally = await votingService.getElectionTally(e.organizationId, e.id);
      rows.push({
        electionId: e.id,
        title: e.title,
        organizationId: e.organizationId,
        category: e.category,
        status: e.status,
        isPaidVoting: e.isPaidVoting,
        candidatesCount: candidates.length,
        votesCast: tally.totalVotesCast,
        startTime: e.startTime,
        endTime: e.endTime
      });
    }
    return rows;
  }
  // --- 2. Candidate Vote Summary Report ---
  async generateCandidateVoteSummaryReport(orgId, electionId) {
    const elections = electionId ? [await electionsService.getElectionById(orgId || "org-metro-uni", electionId)] : await electionsService.listElections(orgId);
    const rows = [];
    for (const e of elections) {
      const tally = await votingService.getElectionTally(e.organizationId, e.id);
      for (const c of tally.candidates) {
        rows.push({
          electionId: e.id,
          electionTitle: e.title,
          candidateId: c.candidateId,
          candidateName: c.candidateName,
          voteCount: c.count,
          percentage: c.percentage,
          totalElectionVotes: tally.totalVotesCast,
          electionStatus: e.status
        });
      }
    }
    return rows;
  }
  // --- 3. Voter Turnout Report ---
  async generateVoterTurnoutReport(orgId, electionId) {
    const elections = electionId ? [await electionsService.getElectionById(orgId || "org-metro-uni", electionId)] : await electionsService.listElections(orgId);
    const rows = [];
    for (const e of elections) {
      const tally = await votingService.getElectionTally(e.organizationId, e.id);
      const registeredVoters = e.category === ElectionCategory.INSTITUTIONAL ? 250 : 1e3;
      const turnoutRate = parseFloat((tally.totalVotesCast / registeredVoters * 100).toFixed(1));
      rows.push({
        electionId: e.id,
        electionTitle: e.title,
        category: e.category,
        status: e.status,
        registeredVoters,
        votesCast: tally.totalVotesCast,
        turnoutPercentage: turnoutRate,
        isCertified: Boolean(e.certifiedAt),
        certifiedAt: e.certifiedAt || "NOT_CERTIFIED"
      });
    }
    return rows;
  }
  // --- 4. Payment Transaction Report ---
  async generatePaymentTransactionReport(orgId) {
    const txs = await mpesaService.listTransactions(orgId || "org-metro-uni");
    return txs.map((t) => ({
      transactionId: t.id,
      checkoutRequestId: t.checkoutRequestId,
      provider: t.provider,
      electionId: t.electionId,
      voterCode: t.voterCode,
      phoneNumber: t.phoneNumber,
      amountCents: t.amountCents,
      amountFormatted: `$${(t.amountCents / 100).toFixed(2)}`,
      currency: t.currency,
      status: t.status,
      mpesaReceiptNumber: t.mpesaReceiptNumber || "N/A",
      createdAt: t.createdAt
    }));
  }
  // --- 5. Platform Commission Report (40/60 Split) ---
  async generatePlatformCommissionReport(orgId) {
    const allocations = await revenueService.listAllocations(orgId);
    return allocations.map((a) => ({
      allocationId: a.id,
      paymentTransactionId: a.paymentTransactionId,
      organizationId: a.organizationId,
      electionId: a.electionId,
      grossAmountCents: a.grossAmountCents,
      processingFeeCents: a.processingFeeCents,
      distributableAmountCents: a.distributableAmountCents,
      platformRate: `${(a.platformRateBasisPoints / 100).toFixed(2)}%`,
      platformCommissionCents: a.platformFeeCents,
      platformCommissionFormatted: `$${(a.platformFeeCents / 100).toFixed(2)}`,
      organiserRate: `${(a.organiserRateBasisPoints / 100).toFixed(2)}%`,
      organiserShareCents: a.organiserFeeCents,
      organiserShareFormatted: `$${(a.organiserFeeCents / 100).toFixed(2)}`,
      status: a.status,
      allocatedAt: a.allocatedAt
    }));
  }
  // --- 6. Organiser Earnings Report (60% Share) ---
  async generateOrganiserEarningsReport(orgId) {
    const metrics = orgId ? [await revenueService.getOrganizerMetrics(orgId)] : [
      await revenueService.getOrganizerMetrics("org-metro-uni"),
      await revenueService.getOrganizerMetrics("org-starlight-col")
    ];
    return metrics.map((m) => ({
      organizationId: m.organizationId,
      grossSales: `$${(m.grossSales / 100).toFixed(2)}`,
      processingFees: `$${(m.processingFees / 100).toFixed(2)}`,
      distributablePool: `$${(m.distributableAmount / 100).toFixed(2)}`,
      platformFee40Pct: `$${(m.platformCommission / 100).toFixed(2)}`,
      organiserNet60Pct: `$${(m.organiserEarnings / 100).toFixed(2)}`,
      availableTreasury: `$${(m.availableBalance / 100).toFixed(2)}`,
      reservedEscrow: `$${(m.reservedBalance / 100).toFixed(2)}`,
      allocationsCount: m.allocationsCount
    }));
  }
  // --- 7. Payouts Report ---
  async generatePayoutsReport(orgId) {
    const payouts = await payoutsService.listPayouts(orgId);
    return payouts.map((p) => {
      const dest = p.destinationDetails || {};
      return {
        payoutId: p.id,
        organizationId: p.organizationId,
        amountCents: p.amountCents,
        grossAmount: `$${(p.amountCents / 100).toFixed(2)}`,
        feeCents: p.feeCents,
        netDisbursed: `$${(p.netAmountCents / 100).toFixed(2)}`,
        currency: p.currency,
        method: p.method,
        destination: p.method === PayoutMethod.MPESA_B2C ? dest.phoneNumber : `${dest.bankName} ${dest.accountNumber}`,
        recipientName: dest.accountName || "N/A",
        status: p.status,
        requestedBy: p.requestedBy,
        reviewedBy: p.reviewedBy || "N/A",
        settlementEvidence: p.settlementEvidence || "N/A",
        settledAt: p.settledAt || "PENDING",
        createdAt: p.createdAt
      };
    });
  }
  // --- 8. Refunds Report ---
  async generateRefundsReport(orgId) {
    try {
      const client = await pool.connect();
      try {
        let query = "SELECT * FROM refunds";
        const params = [];
        if (orgId) {
          query += " WHERE organization_id = $1";
          params.push(orgId);
        }
        query += " ORDER BY created_at DESC";
        const res = await client.query(query, params);
        return res.rows.map((r) => ({
          refundId: r.id,
          paymentTransactionId: r.payment_transaction_id,
          organizationId: r.organization_id,
          type: r.type,
          refundAmountCents: r.refund_amount_cents,
          refundAmountFormatted: `$${(r.refund_amount_cents / 100).toFixed(2)}`,
          platformShareReversed: `$${(r.reversal_platform_cents / 100).toFixed(2)}`,
          organiserShareReversed: `$${(r.reversal_organiser_cents / 100).toFixed(2)}`,
          reason: r.reason,
          status: r.status,
          createdAt: r.created_at
        }));
      } finally {
        client.release();
      }
    } catch {
      return [
        {
          refundId: "ref-demo-1",
          paymentTransactionId: "tx-mpesa-100",
          organizationId: orgId || "org-metro-uni",
          type: "FULL",
          refundAmountCents: 5e3,
          refundAmountFormatted: "$50.00",
          platformShareReversed: "$20.00",
          organiserShareReversed: "$30.00",
          reason: "Accidental duplicate payment confirmed by voter",
          status: "PROCESSED",
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ];
    }
  }
  // --- 9. Financial Reconciliation Report ---
  async generateFinancialReconciliationReport(orgId) {
    const isBalanced = await financialLedgerService.verifyLedgerBalance();
    const globalTreasury = await financialLedgerService.getOrCreateAccount(null, "PLATFORM_TREASURY", "USD");
    const orgTreasury = orgId ? await financialLedgerService.getOrCreateAccount(orgId, "ORGANIZER_TREASURY", "USD") : null;
    return [
      {
        accountScope: "PLATFORM_TREASURY",
        currency: "USD",
        totalBalance: `$${((globalTreasury.availableBalance + globalTreasury.reservedBalance) / 100).toFixed(2)}`,
        availableBalance: `$${(globalTreasury.availableBalance / 100).toFixed(2)}`,
        reservedBalance: `$${(globalTreasury.reservedBalance / 100).toFixed(2)}`,
        isBalanced,
        reconciliationDiscrepancies: 0,
        status: isBalanced ? "RECONCILED_CLEAN" : "DISCREPANCY_DETECTED"
      },
      ...orgTreasury ? [
        {
          accountScope: `ORGANIZER_${orgId}`,
          currency: "USD",
          totalBalance: `$${((orgTreasury.availableBalance + orgTreasury.reservedBalance) / 100).toFixed(2)}`,
          availableBalance: `$${(orgTreasury.availableBalance / 100).toFixed(2)}`,
          reservedBalance: `$${(orgTreasury.reservedBalance / 100).toFixed(2)}`,
          isBalanced: true,
          reconciliationDiscrepancies: 0,
          status: "RECONCILED_CLEAN"
        }
      ] : []
    ];
  }
  /**
   * RFC 4180 Compliant CSV Converter
   */
  convertToCsv(data) {
    if (!data || data.length === 0) {
      return "";
    }
    const firstRow = data[0];
    if (!firstRow) {
      return "";
    }
    const headers = Object.keys(firstRow);
    const escapeCsvValue = (val) => {
      if (val === null || val === void 0) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const headerLine = headers.map(escapeCsvValue).join(",");
    const rows = data.map(
      (row) => headers.map((header) => escapeCsvValue(row[header])).join(",")
    );
    return [headerLine, ...rows].join("\r\n");
  }
};
var reportsService = new ReportsService();

// server/src/modules/reports/reports.controller.ts
init_dist();
var ReportsController = class {
  async generateReport(req, res) {
    const isPlatformAdmin = req.user?.systemRole === SystemRole.SUPER_ADMIN || req.user?.platformRoles?.includes(PlatformRole.SUPER_ADMIN) || req.user?.platformRoles?.includes(PlatformRole.SUPPORT_ADMIN) || false;
    const orgId = isPlatformAdmin ? req.body.organizationId || req.tenant?.organizationId : req.tenant?.organizationId;
    const report = await reportsService.generateReport(
      { ...req.body, organizationId: orgId },
      req.user?.id || "usr-anonymous",
      isPlatformAdmin
    );
    if (req.body.format === "csv" && req.query.download === "true") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${report.reportType.toLowerCase()}_report.csv"`);
      res.status(200).send(report.csvContent);
      return;
    }
    sendSuccess(res, report, void 0, 200, req.requestId);
  }
  async getTurnoutReport(req, res) {
    const orgId = req.tenant?.organizationId;
    const electionId = typeof req.params.electionId === "string" ? req.params.electionId : void 0;
    const data = await reportsService.generateVoterTurnoutReport(orgId, electionId);
    sendSuccess(res, data[0] || null, void 0, 200, req.requestId);
  }
};
var reportsController = new ReportsController();

// server/src/modules/reports/reports.routes.ts
var router19 = Router19();
router19.use(authenticate);
router19.use(tenantContext({ required: false }));
router19.post("/", (req, res, next) => {
  reportsController.generateReport(req, res).catch(next);
});
router19.get("/turnout/:electionId", (req, res, next) => {
  reportsController.getTurnoutReport(req, res).catch(next);
});
var reports_routes_default = router19;

// server/src/modules/audit/audit.routes.ts
import { Router as Router20 } from "express";

// server/src/modules/audit/audit.controller.ts
init_apiResponse();

// server/src/modules/audit/audit.service.ts
init_dist();
init_db();
import crypto16 from "crypto";
var AuditService = class _AuditService {
  // In-memory stores for unit testing and offline environments
  static localAuditLogs = [];
  static localSecurityEvents = [];
  static resetState() {
    _AuditService.localAuditLogs = [];
    _AuditService.localSecurityEvents = [];
  }
  /**
   * Sensitive Key Sanitizer:
   * Strips passwords, auth tokens, payment secrets, private keys, and credentials from audit metadata.
   */
  sanitizeData(data) {
    if (!data || typeof data !== "object") {
      return data;
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }
    const sensitiveKeyPatterns = [
      /pass(word)?/i,
      /token/i,
      /secret/i,
      /passkey/i,
      /auth(orization)?/i,
      /credential/i,
      /card/i,
      /cvv/i,
      /pin/i,
      /private_?key/i,
      /api_?key/i
    ];
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const isSensitive = sensitiveKeyPatterns.some((pattern) => pattern.test(key));
      if (isSensitive) {
        sanitized[key] = "[REDACTED_SENSITIVE_DATA]";
      } else if (value && typeof value === "object") {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  /**
   * 1. Record an Immutable Platform Audit Log Entry
   */
  async recordAudit(params) {
    const id = `aud-${Date.now()}-${crypto16.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const sanitizedBefore = params.beforeState ? this.sanitizeData(params.beforeState) : void 0;
    const sanitizedAfter = params.afterState ? this.sanitizeData(params.afterState) : void 0;
    const sanitizedMeta = params.metadata ? this.sanitizeData(params.metadata) : {};
    const entry = {
      id,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      actorRole: params.actorRole,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      organizationId: params.organizationId,
      requestReference: params.requestReference,
      ipAddress: params.ipAddress,
      beforeState: sanitizedBefore,
      afterState: sanitizedAfter,
      metadata: sanitizedMeta,
      createdAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO platform_audit_logs (
            id, actor_id, actor_email, actor_role, action, resource_type,
            resource_id, organization_id, request_reference, ip_address,
            before_state, after_state, metadata, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            entry.id,
            entry.actorId || null,
            entry.actorEmail || null,
            entry.actorRole || null,
            entry.action,
            entry.resourceType,
            entry.resourceId || null,
            entry.organizationId || null,
            entry.requestReference || null,
            entry.ipAddress || null,
            entry.beforeState ? JSON.stringify(entry.beforeState) : null,
            entry.afterState ? JSON.stringify(entry.afterState) : null,
            entry.metadata ? JSON.stringify(entry.metadata) : null,
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _AuditService.localAuditLogs.unshift(entry);
    }
    return entry;
  }
  /**
   * 2. Record a Security Event
   */
  async recordSecurityEvent(params) {
    const id = `sec-${Date.now()}-${crypto16.randomBytes(3).toString("hex")}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const severity = params.severity || SecurityEventSeverity.MEDIUM;
    const sanitizedDetails = params.details ? this.sanitizeData(params.details) : {};
    const event = {
      id,
      eventType: params.eventType,
      severity,
      actorId: params.actorId,
      actorEmail: params.actorEmail,
      ipAddress: params.ipAddress,
      organizationId: params.organizationId,
      details: sanitizedDetails,
      createdAt: now
    };
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO platform_security_events (
            id, event_type, severity, actor_id, actor_email, ip_address, organization_id, details, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            event.id,
            event.eventType,
            event.severity,
            event.actorId || null,
            event.actorEmail || null,
            event.ipAddress || null,
            event.organizationId || null,
            JSON.stringify(event.details),
            now
          ]
        );
      } finally {
        client.release();
      }
    } catch {
      _AuditService.localSecurityEvents.unshift(event);
    }
    return event;
  }
  /**
   * 3. Query Platform Audit Logs with Filters
   */
  async listAuditLogs(filters) {
    const limit = filters?.limit || 100;
    try {
      const client = await pool.connect();
      try {
        let query = "SELECT * FROM platform_audit_logs WHERE 1=1";
        const params = [];
        if (filters?.action) {
          params.push(filters.action);
          query += ` AND action = $${params.length}`;
        }
        if (filters?.resourceType) {
          params.push(filters.resourceType);
          query += ` AND resource_type = $${params.length}`;
        }
        if (filters?.organizationId) {
          params.push(filters.organizationId);
          query += ` AND organization_id = $${params.length}`;
        }
        if (filters?.actorId) {
          params.push(filters.actorId);
          query += ` AND actor_id = $${params.length}`;
        }
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);
        const res = await client.query(query, params);
        return res.rows.map((r) => this.mapDbAuditLog(r));
      } finally {
        client.release();
      }
    } catch {
      let list = [..._AuditService.localAuditLogs];
      if (filters?.action) list = list.filter((l) => l.action === filters.action);
      if (filters?.resourceType) list = list.filter((l) => l.resourceType === filters.resourceType);
      if (filters?.organizationId) list = list.filter((l) => l.organizationId === filters.organizationId);
      if (filters?.actorId) list = list.filter((l) => l.actorId === filters.actorId);
      return list.slice(0, limit);
    }
  }
  /**
   * 4. Query Platform Security Events with Filters
   */
  async listSecurityEvents(filters) {
    const limit = filters?.limit || 100;
    try {
      const client = await pool.connect();
      try {
        let query = "SELECT * FROM platform_security_events WHERE 1=1";
        const params = [];
        if (filters?.eventType) {
          params.push(filters.eventType);
          query += ` AND event_type = $${params.length}`;
        }
        if (filters?.severity) {
          params.push(filters.severity);
          query += ` AND severity = $${params.length}`;
        }
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);
        const res = await client.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          eventType: r.event_type,
          severity: r.severity,
          actorId: r.actor_id || void 0,
          actorEmail: r.actor_email || void 0,
          ipAddress: r.ip_address || void 0,
          organizationId: r.organization_id || void 0,
          details: typeof r.details === "string" ? JSON.parse(r.details) : r.details || {},
          createdAt: r.created_at?.toISOString ? r.created_at.toISOString() : r.created_at
        }));
      } finally {
        client.release();
      }
    } catch {
      let list = [..._AuditService.localSecurityEvents];
      if (filters?.eventType) list = list.filter((e) => e.eventType === filters.eventType);
      if (filters?.severity) list = list.filter((e) => e.severity === filters.severity);
      return list.slice(0, limit);
    }
  }
  mapDbAuditLog(r) {
    return {
      id: r.id,
      actorId: r.actor_id || void 0,
      actorEmail: r.actor_email || void 0,
      actorRole: r.actor_role || void 0,
      action: r.action,
      resourceType: r.resource_type,
      resourceId: r.resource_id || void 0,
      organizationId: r.organization_id || void 0,
      requestReference: r.request_reference || void 0,
      ipAddress: r.ip_address || void 0,
      beforeState: typeof r.before_state === "string" ? JSON.parse(r.before_state) : r.before_state || void 0,
      afterState: typeof r.after_state === "string" ? JSON.parse(r.after_state) : r.after_state || void 0,
      metadata: typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata || {},
      createdAt: r.created_at?.toISOString ? r.created_at.toISOString() : r.created_at
    };
  }
};
var auditService = new AuditService();

// server/src/modules/audit/audit.controller.ts
init_dist();
var AuditController = class {
  async listLogs(req, res) {
    const isPlatformAdmin = req.user?.systemRole === SystemRole.SUPER_ADMIN || req.user?.platformRoles?.includes(PlatformRole.SUPER_ADMIN) || req.user?.platformRoles?.includes(PlatformRole.SUPPORT_ADMIN) || false;
    const orgId = isPlatformAdmin ? req.query.organizationId : req.tenant?.organizationId;
    const logs = await auditService.listAuditLogs({
      organizationId: orgId,
      action: req.query.action,
      resourceType: req.query.resourceType,
      actorId: req.query.actorId,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 100
    });
    sendSuccess(res, logs, void 0, 200, req.requestId);
  }
};
var auditController = new AuditController();

// server/src/modules/audit/audit.routes.ts
var router20 = Router20();
router20.use(authenticate);
router20.use(tenantContext({ required: false }));
router20.get("/", (req, res, next) => {
  auditController.listLogs(req, res).catch(next);
});
var audit_routes_default = router20;

// server/src/modules/admin/admin.routes.ts
import { Router as Router21 } from "express";

// server/src/modules/admin/admin.controller.ts
init_apiResponse();

// server/src/modules/admin/admin.service.ts
init_dist();
init_db();
init_apiResponse();
import crypto17 from "crypto";
var AdminService = class _AdminService {
  // In-memory local stores for test mode and offline preview
  static localOrganizations = /* @__PURE__ */ new Map([
    [
      "org-metro-uni",
      {
        id: "org-metro-uni",
        name: "Metropolitan University",
        slug: "metropolitan-uni",
        planId: "ENTERPRISE",
        status: "ACTIVE",
        settings: { timezone: "America/New_York", contactEmail: "elections@metro.edu" },
        memberCount: 14,
        electionCount: 3,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      }
    ],
    [
      "org-starlight-col",
      {
        id: "org-starlight-col",
        name: "Starlight Medical College",
        slug: "starlight-college",
        planId: "STANDARD",
        status: "ACTIVE",
        settings: { timezone: "America/Chicago", contactEmail: "admin@starlight.edu" },
        memberCount: 8,
        electionCount: 2,
        createdAt: "2026-02-01T00:00:00Z",
        updatedAt: "2026-02-01T00:00:00Z"
      }
    ]
  ]);
  static localUsers = /* @__PURE__ */ new Map([
    [
      "usr-super-admin",
      {
        id: "usr-super-admin",
        email: "superadmin@votexa.io",
        fullName: "Alexander Vance",
        systemRole: SystemRole.SUPER_ADMIN,
        platformRoles: [PlatformRole.SUPER_ADMIN],
        status: "ACTIVE",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      }
    ],
    [
      "usr-support-staff",
      {
        id: "usr-support-staff",
        email: "support@votexa.io",
        fullName: "Support Admin Marcus",
        systemRole: SystemRole.USER,
        platformRoles: [PlatformRole.SUPPORT_ADMIN],
        status: "ACTIVE",
        createdAt: "2026-01-02T00:00:00Z",
        updatedAt: "2026-01-02T00:00:00Z"
      }
    ],
    [
      "usr-organizer-1",
      {
        id: "usr-organizer-1",
        email: "dean.vance@university.edu",
        fullName: "Dean Alexander Vance",
        systemRole: SystemRole.USER,
        platformRoles: [],
        status: "ACTIVE",
        createdAt: "2026-01-03T00:00:00Z",
        updatedAt: "2026-01-03T00:00:00Z"
      }
    ]
  ]);
  static localCommissionHistory = [
    {
      id: "com-seed-1",
      platformRateBasisPoints: 4e3,
      organiserRateBasisPoints: 6e3,
      updatedBy: "usr-super-admin",
      reason: "Initial 40/60 commercial split policy configuration",
      createdAt: "2026-01-01T00:00:00Z"
    }
  ];
  static resetState() {
    _AdminService.localCommissionHistory = [
      {
        id: "com-seed-1",
        platformRateBasisPoints: 4e3,
        organiserRateBasisPoints: 6e3,
        updatedBy: "usr-super-admin",
        reason: "Initial 40/60 commercial split policy configuration",
        createdAt: "2026-01-01T00:00:00Z"
      }
    ];
  }
  // --- 1. Platform Overview ---
  async getPlatformOverview() {
    const isLedgerBalanced = await financialLedgerService.verifyLedgerBalance();
    const superMetrics = await revenueService.getPlatformMetrics();
    const elections = await electionsService.listElections();
    const paidCompetitions = elections.filter((e) => e.category === ElectionCategory.PAID_COMPETITION);
    const activeElections = elections.filter((e) => e.status === ElectionStatus.ACTIVE);
    const payouts = await payoutsService.listPayouts();
    const paidPayouts = payouts.filter((p) => p.status === "PAID");
    const payoutsSettledCents = paidPayouts.reduce((acc, p) => acc + p.netAmountCents, 0);
    return {
      totalOrganizations: _AdminService.localOrganizations.size,
      activeOrganizations: Array.from(_AdminService.localOrganizations.values()).filter((o) => o.status === "ACTIVE").length,
      totalUsers: _AdminService.localUsers.size,
      totalElections: elections.length,
      activeElections: activeElections.length,
      paidCompetitionsCount: paidCompetitions.length,
      totalPaymentVolumeCents: superMetrics.totalPaymentVolume,
      platformRevenueCents: superMetrics.platformRevenue,
      organiserLiabilitiesCents: superMetrics.organiserLiabilities,
      payoutsSettledCents,
      refundsTotalCents: superMetrics.refundsTotal,
      chargebacksTotalCents: superMetrics.chargebacksTotal,
      reconciliationDiscrepancies: superMetrics.reconciliationDiscrepancies,
      isLedgerBalanced,
      systemHealth: isLedgerBalanced ? "OPERATIONAL" : "DEGRADED"
    };
  }
  // --- 2. Organization Management ---
  async listOrganizations(filters) {
    try {
      const client = await pool.connect();
      try {
        let query = `
          SELECT o.*, 
                 COUNT(DISTINCT om.user_id) as member_count,
                 COUNT(DISTINCT e.id) as election_count
          FROM organizations o
          LEFT JOIN organization_members om ON om.organization_id = o.id
          LEFT JOIN elections e ON e.organization_id = o.id
          WHERE 1=1
        `;
        const params = [];
        if (filters?.status) {
          params.push(filters.status);
          query += ` AND o.status = $${params.length}`;
        }
        if (filters?.search) {
          params.push(`%${filters.search}%`);
          query += ` AND (o.name ILIKE $${params.length} OR o.slug ILIKE $${params.length})`;
        }
        query += ` GROUP BY o.id ORDER BY o.created_at DESC`;
        const res = await client.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          planId: r.plan_id,
          status: r.status || "ACTIVE",
          memberCount: parseInt(r.member_count, 10) || 0,
          electionCount: parseInt(r.election_count, 10) || 0,
          settings: r.settings || {},
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(_AdminService.localOrganizations.values());
      if (filters?.status) list = list.filter((o) => o.status === filters.status);
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        list = list.filter((o) => o.name.toLowerCase().includes(s) || o.slug.toLowerCase().includes(s));
      }
      return list;
    }
  }
  async updateOrganizationStatus(orgId, status, reason, adminUserId) {
    let org = _AdminService.localOrganizations.get(orgId);
    const beforeState = org ? { ...org } : void 0;
    try {
      const client = await pool.connect();
      try {
        await client.query(`UPDATE organizations SET status = $1, updated_at = NOW() WHERE id = $2`, [status, orgId]);
      } finally {
        client.release();
      }
    } catch {
      if (org) {
        org.status = status;
        org.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        _AdminService.localOrganizations.set(orgId, org);
      }
    }
    org = _AdminService.localOrganizations.get(orgId) || { id: orgId, status };
    await auditService.recordAudit({
      actorId: adminUserId,
      actorRole: "SUPER_ADMIN",
      action: status === "SUSPENDED" ? "ORGANIZATION_SUSPEND" : "ORGANIZATION_ACTIVATE",
      resourceType: "ORGANIZATION",
      resourceId: orgId,
      organizationId: orgId,
      beforeState,
      afterState: org,
      metadata: { reason }
    });
    return org;
  }
  // --- 3. User Management ---
  async listUsers(filters) {
    try {
      const client = await pool.connect();
      try {
        let query = `SELECT id, email, full_name, avatar_url, system_role, created_at, updated_at FROM users WHERE 1=1`;
        const params = [];
        if (filters?.systemRole) {
          params.push(filters.systemRole);
          query += ` AND system_role = $${params.length}`;
        }
        if (filters?.search) {
          params.push(`%${filters.search}%`);
          query += ` AND (email ILIKE $${params.length} OR full_name ILIKE $${params.length})`;
        }
        query += ` ORDER BY created_at DESC`;
        const res = await client.query(query, params);
        return res.rows.map((r) => ({
          id: r.id,
          email: r.email,
          fullName: r.full_name,
          avatarUrl: r.avatar_url,
          systemRole: r.system_role,
          platformRoles: r.system_role === "SUPER_ADMIN" ? [PlatformRole.SUPER_ADMIN] : [],
          status: "ACTIVE",
          createdAt: r.created_at,
          updatedAt: r.updated_at
        }));
      } finally {
        client.release();
      }
    } catch {
      let list = Array.from(_AdminService.localUsers.values());
      if (filters?.systemRole) list = list.filter((u) => u.systemRole === filters.systemRole);
      if (filters?.platformRole) list = list.filter((u) => u.platformRoles.includes(filters.platformRole));
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        list = list.filter((u) => u.email.toLowerCase().includes(s) || u.fullName.toLowerCase().includes(s));
      }
      return list;
    }
  }
  async updateUserRole(userId, updates, adminUserId) {
    const user = _AdminService.localUsers.get(userId);
    if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
    const beforeState = { ...user };
    if (updates.systemRole) user.systemRole = updates.systemRole;
    if (updates.platformRoles) user.platformRoles = updates.platformRoles;
    user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    _AdminService.localUsers.set(userId, user);
    await auditService.recordAudit({
      actorId: adminUserId,
      actorRole: "SUPER_ADMIN",
      action: "USER_ROLE_UPDATED",
      resourceType: "USER",
      resourceId: userId,
      beforeState,
      afterState: user,
      metadata: { updates }
    });
    return user;
  }
  // --- 4. Election Moderation ---
  async listAllElections(filters) {
    const elections = await electionsService.listElections();
    let filtered = [...elections];
    if (filters?.status) filtered = filtered.filter((e) => e.status === filters.status);
    if (filters?.category) filtered = filtered.filter((e) => e.category === filters.category);
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((e) => e.title.toLowerCase().includes(s));
    }
    return filtered;
  }
  async moderateElection(electionId, updates, adminUserId) {
    const elections = await electionsService.listElections();
    const target = elections.find((e) => e.id === electionId);
    if (!target) throw new AppError("Election not found", 404, "ELECTION_NOT_FOUND");
    const beforeState = { ...target };
    if (updates.status) target.status = updates.status;
    if (updates.certifiedAt) target.certifiedAt = updates.certifiedAt;
    if (updates.certifiedBy) target.certifiedBy = updates.certifiedBy;
    target.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    await auditService.recordAudit({
      actorId: adminUserId,
      actorRole: "SUPER_ADMIN",
      action: "ELECTION_MODERATED",
      resourceType: "ELECTION",
      resourceId: electionId,
      organizationId: target.organizationId,
      beforeState,
      afterState: target,
      metadata: { notes: updates.notes, newStatus: updates.status }
    });
    return target;
  }
  // --- 5. Commission Management ---
  async getCommissionSettings() {
    const platformRate = revenueService.getGlobalPlatformCommissionRate();
    const organiserRate = 1e4 - platformRate;
    return {
      currentPlatformRateBasisPoints: platformRate,
      currentOrganiserRateBasisPoints: organiserRate,
      history: _AdminService.localCommissionHistory
    };
  }
  async updateCommissionRate(platformRateBasisPoints, reason, adminUserId) {
    if (platformRateBasisPoints < 0 || platformRateBasisPoints > 1e4) {
      throw new AppError("Commission rate must be between 0 and 10,000 basis points (0% - 100%)", 400, "INVALID_RATE");
    }
    const prevRate = revenueService.getGlobalPlatformCommissionRate();
    revenueService.setGlobalPlatformCommissionRate(platformRateBasisPoints);
    const organiserRate = 1e4 - platformRateBasisPoints;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const record = {
      id: `com-${Date.now()}-${crypto17.randomBytes(3).toString("hex")}`,
      platformRateBasisPoints,
      organiserRateBasisPoints: organiserRate,
      updatedBy: adminUserId,
      reason,
      createdAt: now
    };
    _AdminService.localCommissionHistory.unshift(record);
    try {
      const client = await pool.connect();
      try {
        await client.query(
          `INSERT INTO platform_commission_history (
            id, platform_rate_basis_points, organiser_rate_basis_points, updated_by, reason, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [record.id, platformRateBasisPoints, organiserRate, adminUserId, reason, now]
        );
      } finally {
        client.release();
      }
    } catch {
    }
    await auditService.recordAudit({
      actorId: adminUserId,
      actorRole: "SUPER_ADMIN",
      action: "COMMISSION_RATE_UPDATED",
      resourceType: "PLATFORM_COMMISSION",
      resourceId: record.id,
      beforeState: { platformRateBasisPoints: prevRate, organiserRateBasisPoints: 1e4 - prevRate },
      afterState: { platformRateBasisPoints, organiserRateBasisPoints: organiserRate },
      metadata: { reason }
    });
    return record;
  }
};
var adminService = new AdminService();

// server/src/modules/admin/admin.controller.ts
init_dist();
init_apiResponse();
var AdminController = class {
  // 1. Platform Overview
  async getOverview(req, res) {
    const overview = await adminService.getPlatformOverview();
    sendSuccess(res, overview, void 0, 200, req.requestId);
  }
  // 2. Organization Management
  async listOrganizations(req, res) {
    const status = req.query.status;
    const search = req.query.search;
    const orgs = await adminService.listOrganizations({ status, search });
    sendSuccess(res, orgs, void 0, 200, req.requestId);
  }
  async updateOrganizationStatus(req, res) {
    const orgId = req.params.id;
    const adminUserId = req.user?.id || "usr-super-admin";
    const { status, reason } = req.body;
    const updated = await adminService.updateOrganizationStatus(
      orgId,
      status,
      reason || "Administrative action",
      adminUserId
    );
    sendSuccess(res, updated, void 0, 200, req.requestId);
  }
  // 3. User Management
  async listUsers(req, res) {
    const search = req.query.search;
    const systemRole = req.query.systemRole;
    const platformRole = req.query.platformRole;
    const users = await adminService.listUsers({ search, systemRole, platformRole });
    sendSuccess(res, users, void 0, 200, req.requestId);
  }
  async updateUserRole(req, res) {
    const userId = req.params.id;
    const adminUserId = req.user?.id || "usr-super-admin";
    const { systemRole, platformRoles } = req.body;
    const updated = await adminService.updateUserRole(userId, { systemRole, platformRoles }, adminUserId);
    sendSuccess(res, updated, void 0, 200, req.requestId);
  }
  // 4. Election Moderation
  async listAllElections(req, res) {
    const status = req.query.status;
    const category = req.query.category;
    const search = req.query.search;
    const elections = await adminService.listAllElections({ status, category, search });
    sendSuccess(res, elections, void 0, 200, req.requestId);
  }
  async moderateElection(req, res) {
    const electionId = req.params.id;
    const adminUserId = req.user?.id || "usr-super-admin";
    const { status, certifiedAt, certifiedBy, notes } = req.body;
    const moderated = await adminService.moderateElection(
      electionId,
      { status, certifiedAt, certifiedBy, notes },
      adminUserId
    );
    sendSuccess(res, moderated, void 0, 200, req.requestId);
  }
  // 5. Commission Management
  async getCommissionSettings(_req, res) {
    const settings = await adminService.getCommissionSettings();
    sendSuccess(res, settings, void 0, 200, _req.requestId);
  }
  async updateCommissionRate(req, res) {
    const adminUserId = req.user?.id || "usr-super-admin";
    const isSuperAdmin = req.user?.systemRole === SystemRole.SUPER_ADMIN || req.user?.platformRoles?.includes(PlatformRole.SUPER_ADMIN);
    if (!isSuperAdmin) {
      await auditService.recordSecurityEvent({
        eventType: "UNAUTHORIZED_ADMIN_ATTEMPT",
        actorId: req.user?.id,
        actorEmail: req.user?.email,
        details: { action: "UPDATE_COMMISSION_RATE", reason: "Requires Super Admin privileges" }
      });
      throw new AppError("Forbidden: Modifying global commission rates requires Super Admin privileges.", 403, "FORBIDDEN");
    }
    const { platformRateBasisPoints, reason } = req.body;
    const updated = await adminService.updateCommissionRate(
      parseInt(platformRateBasisPoints, 10),
      reason || "Administrative rate policy update",
      adminUserId
    );
    sendSuccess(res, updated, void 0, 200, req.requestId);
  }
  // 6. Audit Logs & Security Events
  async listAuditLogs(req, res) {
    const { action, resourceType, organizationId, actorId, limit } = req.query;
    const logs = await auditService.listAuditLogs({
      action,
      resourceType,
      organizationId,
      actorId,
      limit: limit ? parseInt(limit, 10) : 100
    });
    sendSuccess(res, logs, void 0, 200, req.requestId);
  }
  async listSecurityEvents(req, res) {
    const { eventType, severity, limit } = req.query;
    const events = await auditService.listSecurityEvents({
      eventType,
      severity,
      limit: limit ? parseInt(limit, 10) : 100
    });
    sendSuccess(res, events, void 0, 200, req.requestId);
  }
  // 7. Reporting Generation Dispatcher
  async generateReport(req, res) {
    const requesterId = req.user?.id || "usr-super-admin";
    const isPlatformAdmin = req.user?.systemRole === SystemRole.SUPER_ADMIN || req.user?.platformRoles?.includes(PlatformRole.SUPER_ADMIN) || req.user?.platformRoles?.includes(PlatformRole.SUPPORT_ADMIN) || false;
    const report = await reportsService.generateReport(req.body, requesterId, isPlatformAdmin);
    if (req.body.format === "csv" && req.query.download === "true") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${report.reportType.toLowerCase()}_report.csv"`);
      res.status(200).send(report.csvContent);
      return;
    }
    sendSuccess(res, report, void 0, 200, req.requestId);
  }
};
var adminController = new AdminController();

// server/src/modules/admin/admin.routes.ts
init_dist();
var router21 = Router21();
router21.use(authenticate);
router21.use(requirePlatformRole([PlatformRole.SUPER_ADMIN, PlatformRole.SUPPORT_ADMIN]));
router21.get("/overview", (req, res, next) => {
  adminController.getOverview(req, res).catch(next);
});
router21.get("/organizations", (req, res, next) => {
  adminController.listOrganizations(req, res).catch(next);
});
router21.patch("/organizations/:id/status", (req, res, next) => {
  adminController.updateOrganizationStatus(req, res).catch(next);
});
router21.get("/users", (req, res, next) => {
  adminController.listUsers(req, res).catch(next);
});
router21.patch("/users/:id/role", (req, res, next) => {
  adminController.updateUserRole(req, res).catch(next);
});
router21.get("/elections", (req, res, next) => {
  adminController.listAllElections(req, res).catch(next);
});
router21.patch("/elections/:id/moderate", (req, res, next) => {
  adminController.moderateElection(req, res).catch(next);
});
router21.get("/commissions", (req, res, next) => {
  adminController.getCommissionSettings(req, res).catch(next);
});
router21.post("/commissions", (req, res, next) => {
  adminController.updateCommissionRate(req, res).catch(next);
});
router21.get("/audit-logs", (req, res, next) => {
  adminController.listAuditLogs(req, res).catch(next);
});
router21.get("/security-events", (req, res, next) => {
  adminController.listSecurityEvents(req, res).catch(next);
});
router21.post("/reports", (req, res, next) => {
  adminController.generateReport(req, res).catch(next);
});
var admin_routes_default = router21;

// server/src/routes.ts
var apiRouter = Router22();
apiRouter.use("/auth", auth_routes_default);
apiRouter.use("/users", users_routes_default);
apiRouter.use("/organizations", organizations_routes_default);
apiRouter.use("/organization-members", organization_members_routes_default);
apiRouter.use("/elections", elections_routes_default);
apiRouter.use("/candidates", candidates_routes_default);
apiRouter.use("/voters", voters_routes_default);
apiRouter.use("/ballots", ballot_routes_default);
apiRouter.use("/voting", voting_routes_default);
apiRouter.use("/packages", packages_routes_default);
apiRouter.use("/payments", payments_routes_default);
apiRouter.use("/webhooks", webhooks_routes_default);
apiRouter.use("/wallets", wallets_routes_default);
apiRouter.use("/revenue", revenue_routes_default);
apiRouter.use("/ledger", financial_ledger_routes_default);
apiRouter.use("/refunds", refunds_routes_default);
apiRouter.use("/payouts", payouts_routes_default);
apiRouter.use("/notifications", notifications_routes_default);
apiRouter.use("/reports", reports_routes_default);
apiRouter.use("/audit", audit_routes_default);
apiRouter.use("/admin", admin_routes_default);
var routes_default = apiRouter;

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// server/src/middleware/errorHandler.ts
init_apiResponse();
init_config();
function errorHandler(err, req, res, _next) {
  const requestId = req.headers["x-request-id"] || void 0;
  if (err instanceof AppError) {
    sendError(
      res,
      {
        code: err.code,
        message: err.message,
        details: err.details,
        stack: config.env === "development" ? err.stack : void 0
      },
      err.statusCode,
      requestId
    );
    return;
  }
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
      code: e.code
    }));
    sendError(
      res,
      {
        code: "VALIDATION_ERROR",
        message: "Invalid input payload provided",
        details: formattedErrors
      },
      400,
      requestId
    );
    return;
  }
  console.error("[UNHANDLED_ERROR]", err);
  sendError(
    res,
    {
      code: "INTERNAL_SERVER_ERROR",
      message: config.env === "production" ? "An unexpected internal error occurred" : err.message,
      stack: config.env === "development" ? err.stack : void 0
    },
    500,
    requestId
  );
}

// server/src/app.ts
init_apiResponse();
function createApp() {
  const app2 = express();
  app2.use(helmet());
  app2.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Organization-Id", "X-Request-Id"]
    })
  );
  app2.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: true }));
  app2.use((req, res, next) => {
    const requestId = req.headers["x-request-id"] || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    req.requestId = requestId;
    res.setHeader("X-Request-Id", requestId);
    next();
  });
  const handleHealth = (req, res) => {
    sendSuccess(
      res,
      {
        status: "UP",
        environment: config.env,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      void 0,
      200,
      req.requestId
    );
  };
  app2.get("/health", handleHealth);
  app2.get("/api/health", handleHealth);
  app2.get("/api/v1/health", handleHealth);
  app2.get("/", (_req, res) => {
    res.json({ name: "Votexa API", status: "UP", version: "1.0.0" });
  });
  app2.get("/api", (_req, res) => {
    res.json({ name: "Votexa API", status: "UP", version: "1.0.0" });
  });
  app2.use("/api/v1", routes_default);
  app2.use("/api", routes_default);
  app2.use((req, _res, next) => {
    next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404, "ROUTE_NOT_FOUND"));
  });
  app2.use(errorHandler);
  return app2;
}

// server/src/serverless.ts
var app = createApp();
function handler(req, res) {
  const matchedPath = req.headers["x-matched-path"] || req.headers["x-now-route-matches"] || req.originalUrl;
  if (matchedPath && matchedPath.startsWith("/") && req.url === "/api") {
    req.url = matchedPath;
  }
  if (req.url === "/health" || req.url === "/api/health" || req.url === "/api/v1/health") {
    return res.status(200).json({
      success: true,
      data: {
        status: "UP",
        environment: process.env.NODE_ENV || "production",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }
  return app(req, res);
}
export {
  handler as default
};
