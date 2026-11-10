/**
 * Votexa Shared Domain Models, Enums, and API Contracts
 */

// ==========================================
// User & Multi-Tenancy Roles
// ==========================================
export enum PlatformRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  SUPPORT_ADMIN = 'SUPPORT_ADMIN'
}

export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF'
}

export enum ElectionRole {
  VOTER = 'VOTER'
}

export enum SystemRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  USER = 'USER'
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  systemRole: SystemRole;
  platformRoles?: PlatformRole[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  timezone?: string;
  allowPublicBallots?: boolean;
  defaultElectionDurationDays?: number;
  contactEmail?: string;
}

export interface Organization {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string;
  planId?: string;
  settings?: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  joinedAt: string;
  user?: UserProfile;
}

export interface OrganizationInvitation {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationRole;
  token: string;
  invitedBy: string;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  createdAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserOrganizationMembership {
  organization: Organization;
  role: OrganizationRole;
}

export interface AuthSessionResponse {
  user: UserProfile;
  token: string;
  organizations: UserOrganizationMembership[];
  activeTenant?: UserOrganizationMembership;
}

export interface SwitchOrganizationRequest {
  organizationId: string;
}

export interface InviteMemberRequest {
  email: string;
  role: OrganizationRole;
}

// ==========================================
// Election & Ballot Domain
// ==========================================
export enum ElectionCategory {
  INSTITUTIONAL = 'INSTITUTIONAL',
  PAID_COMPETITION = 'PAID_COMPETITION',
  PUBLIC_POLL = 'PUBLIC_POLL'
}

export enum ElectionStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
  // Backward compatibility aliases
  PAUSED = 'PAUSED',
  CONCLUDED = 'CONCLUDED',
  AUDITED = 'AUDITED'
}

export enum ResultsVisibility {
  LIVE = 'LIVE',
  AFTER_CLOSE = 'AFTER_CLOSE',
  HIDDEN = 'HIDDEN',
  ORGANIZATION_ONLY = 'ORGANIZATION_ONLY'
}

export enum CandidateStatus {
  APPROVED = 'APPROVED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED'
}

export enum VoterEligibilityStatus {
  ELIGIBLE = 'ELIGIBLE',
  INELIGIBLE = 'INELIGIBLE',
  PENDING = 'PENDING'
}

export enum BallotType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  RANKED_CHOICE = 'RANKED_CHOICE'
}

export interface ElectionSettings {
  id: string;
  electionId: string;
  organizationId: string;
  resultsVisibility: ResultsVisibility;
  allowMultipleVotes: boolean;
  maxVotesPerVoter: number;
  votePriceCents: number;
  currency: string;
  requireVoterVerification: boolean;
  allowedDomains: string[];
  shuffleCandidateOrder: boolean;
  enableRealTimeTally: boolean;
  customRules?: Record<string, unknown>;
  updatedAt: string;
}

export interface ElectionPosition {
  id: string;
  electionId: string;
  organizationId: string;
  title: string;
  description?: string;
  minSelections: number;
  maxSelections: number;
  orderIndex: number;
  createdAt: string;
  candidatesCount?: number;
}

export interface Election {
  id: string;
  organizationId: string;
  category: ElectionCategory;
  title: string;
  description?: string;
  status: ElectionStatus;
  startTime: string;
  endTime: string;
  timezone: string;
  allowSelfRegistration: boolean;
  isPaidVoting: boolean;
  packageId?: string;
  createdById?: string;
  certifiedAt?: string;
  certifiedBy?: string;
  settings?: ElectionSettings;
  positions?: ElectionPosition[];
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  electionId: string;
  organizationId: string;
  positionId?: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  manifesto?: string;
  ballotOrder: number;
  status: CandidateStatus;
  voteCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Voter {
  id: string;
  organizationId: string;
  electionId: string;
  userId?: string;
  voterCode: string;
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  eligibilityStatus?: VoterEligibilityStatus;
  eligibilityTag?: string;
  hasVoted: boolean;
  votesCastCount?: number;
  verifiedAt?: string;
  createdAt: string;
}

export interface ElectionInvitation {
  id: string;
  electionId: string;
  organizationId: string;
  email: string;
  voterId?: string;
  token: string;
  status: 'PENDING' | 'SENT' | 'ACCEPTED' | 'EXPIRED';
  sentAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface ElectionAuditLog {
  id: string;
  electionId: string;
  organizationId: string;
  userId: string;
  action: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  reason?: string;
  createdAt: string;
}

export interface CreateElectionRequest {
  category: ElectionCategory;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone?: string;
  allowSelfRegistration?: boolean;
  isPaidVoting?: boolean;
  settings?: Partial<ElectionSettings>;
}

export interface UpdateElectionRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  timezone?: string;
  allowSelfRegistration?: boolean;
  isPaidVoting?: boolean;
  category?: ElectionCategory;
  auditReason?: string;
}

export interface UpdateElectionSettingsRequest {
  resultsVisibility?: ResultsVisibility;
  allowMultipleVotes?: boolean;
  maxVotesPerVoter?: number;
  votePriceCents?: number;
  currency?: string;
  requireVoterVerification?: boolean;
  allowedDomains?: string[];
  shuffleCandidateOrder?: boolean;
  enableRealTimeTally?: boolean;
  auditReason?: string;
}

export interface UpdateElectionStatusRequest {
  status: ElectionStatus;
  reason?: string;
}

export interface CreatePositionRequest {
  title: string;
  description?: string;
  minSelections?: number;
  maxSelections?: number;
  orderIndex?: number;
}

export interface UpdatePositionRequest {
  title?: string;
  description?: string;
  minSelections?: number;
  maxSelections?: number;
  orderIndex?: number;
}

export interface CreateCandidateRequest {
  positionId: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  manifesto?: string;
  ballotOrder?: number;
}

export interface UpdateCandidateRequest {
  positionId?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  manifesto?: string;
  ballotOrder?: number;
  status?: CandidateStatus;
}

export interface RegisterVoterRequest {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  eligibilityTag?: string;
  voterCode?: string;
}

export interface BulkImportVotersRequest {
  voters: Array<{
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    eligibilityTag?: string;
    voterCode?: string;
  }>;
}

export interface BulkImportVotersResponse {
  importedCount: number;
  skippedCount: number;
  voters: Voter[];
  errors?: string[];
}

export interface VerifyVoterEligibilityRequest {
  voterCode?: string;
  email?: string;
}

export interface VerifyVoterEligibilityResponse {
  isEligible: boolean;
  voter?: Voter;
  reason?: string;
  remainingVotesAllowed: number;
}

export interface BallotOption {
  id: string;
  label: string;
  candidateId?: string;
  orderIndex: number;
}

export interface BallotQuestion {
  id: string;
  ballotId: string;
  questionText: string;
  orderIndex: number;
  options: BallotOption[];
}

export interface Ballot {
  id: string;
  organizationId: string;
  electionId: string;
  title: string;
  description?: string;
  type: BallotType;
  questions: BallotQuestion[];
}

// ==========================================
// Cryptographic Voting Engine Contracts (Phase 2)
// ==========================================
export interface VoteSelection {
  questionId: string;
  optionId: string;
  candidateId?: string;
}

export interface CastVoteRequest {
  electionId: string;
  ballotId: string;
  voterCode: string;
  selections: VoteSelection[];
}

export interface VoteReceipt {
  receiptCode: string;
  electionId: string;
  ballotId: string;
  voterHash: string;
  castAt: string;
  signature: string;
  verified: boolean;
}

export interface CandidateTally {
  candidateId: string;
  candidateName: string;
  count: number;
  percentage: number;
  isLeading?: boolean;
}

export interface PositionTally {
  positionId: string;
  positionTitle: string;
  totalVotesCast: number;
  candidates: CandidateTally[];
  winnerCandidateId?: string;
  winnerCandidateName?: string;
}

export interface ElectionTally {
  electionId: string;
  totalVotesCast: number;
  candidates: CandidateTally[];
  status: ElectionStatus;
  auditedAt?: string;
}

export interface CertifiedResultsReport {
  electionId: string;
  electionTitle: string;
  category: ElectionCategory;
  status: ElectionStatus;
  isEmbargoed: boolean;
  embargoReason?: string;
  resultsVisibility: ResultsVisibility;
  totalRegisteredVoters: number;
  totalBallotsCast: number;
  turnoutPercentage: number;
  positions: PositionTally[];
  certifiedAt?: string;
  certifiedBy?: string;
  generatedAt: string;
}

// ==========================================
// Voting Packages & Election-Specific Voter Wallets
// ==========================================
export enum WalletTransactionType {
  PURCHASE = 'PURCHASE',
  SPEND = 'SPEND',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
  EXPIRY = 'EXPIRY'
}

export interface VotingPackage {
  id: string;
  organizationId: string;
  electionId: string;
  name: string;
  credits: number;
  priceCents: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VoterWallet {
  id: string;
  organizationId: string;
  electionId: string;
  voterCode: string;
  creditsBalance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  electionId: string;
  type: WalletTransactionType;
  creditsAmount: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  isMockPayment: boolean;
  createdAt: string;
}

export interface VoteAuthorization {
  id: string;
  electionId: string;
  organizationId: string;
  positionId?: string;
  token: string;
  voterHash: string;
  category: ElectionCategory;
  creditsAllocated: number;
  isUsed: boolean;
  usedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateVotingPackageRequest {
  electionId: string;
  name: string;
  credits: number;
  priceCents: number;
  currency?: string;
  isActive?: boolean;
}

export interface PurchasePackageRequest {
  electionId: string;
  packageId: string;
  voterCode: string;
  paymentMethod?: 'MOCK_SANDBOX' | 'CARD';
  mockCardNumber?: string;
}

export interface PurchasePackageResponse {
  success: boolean;
  wallet: VoterWallet;
  transaction: WalletTransaction;
  message: string;
}

export interface RequestVoteAuthorizationRequest {
  electionId: string;
  voterCode: string;
  positionId?: string;
  creditsRequested?: number;
}

export interface RequestVoteAuthorizationResponse {
  authorized: boolean;
  authorizationToken: string;
  expiresAt: string;
  category: ElectionCategory;
  positionId?: string;
  creditsAllocated: number;
  voterHash: string;
}

export interface CastAuthorizedVoteRequest {
  electionId: string;
  authorizationToken: string;
  positionId: string;
  candidateId: string;
  ballotId?: string;
}

export interface CastAuthorizedVoteResponse {
  success: boolean;
  receipt: VoteReceipt;
  remainingCredits?: number;
}

// ==========================================
// Finance, Ledger & Payments
// ==========================================
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentProvider {
  MPESA = 'MPESA',
  STRIPE = 'STRIPE',
  MOCK = 'MOCK'
}

export enum PaymentTransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  RECONCILED = 'RECONCILED'
}

export interface PaymentTransactionRecord {
  id: string;
  organizationId: string;
  electionId: string;
  packageId: string;
  voterCode: string;
  provider: PaymentProvider;
  amountCents: number;
  currency: string;
  phoneNumber?: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  mpesaReceiptNumber?: string;
  status: PaymentTransactionStatus;
  resultCode?: number;
  resultDesc?: string;
  creditsIssued: boolean;
  creditsIssuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProviderEvent {
  id: string;
  paymentId?: string;
  provider: PaymentProvider;
  eventType: string;
  rawPayload: Record<string, unknown>;
  createdAt: string;
}

export interface PaymentReconciliation {
  id: string;
  paymentId: string;
  reconciledBy: string;
  status: 'RESOLVED' | 'DISCREPANCY_FLAGGED' | 'MANUAL_REVIEW';
  discrepancyReason?: string;
  notes?: string;
  createdAt: string;
}

export interface IdempotencyRecord {
  id: string;
  key: string;
  provider: PaymentProvider;
  resourceId: string;
  createdAt: string;
}

export interface MpesaInitiatePaymentRequest {
  electionId: string;
  packageId: string;
  voterCode: string;
  phoneNumber: string;
}

export interface MpesaInitiatePaymentResponse {
  paymentId: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  status: PaymentTransactionStatus;
  customerMessage: string;
}

export interface MpesaCallbackMetadataItem {
  Name: string;
  Value?: string | number;
}

export interface MpesaStkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: MpesaCallbackMetadataItem[];
  };
}

export interface MpesaCallbackPayload {
  Body: {
    stkCallback: MpesaStkCallback;
  };
}

export interface MpesaPaymentStatusResponse {
  paymentId: string;
  organizationId: string;
  electionId: string;
  packageId: string;
  voterCode: string;
  amountCents: number;
  currency: string;
  phoneNumber?: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  mpesaReceiptNumber?: string;
  status: PaymentTransactionStatus;
  resultCode?: number;
  resultDesc?: string;
  credits: number;
  creditsIssued: boolean;
  creditsIssuedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum LedgerEntryType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  PLATFORM_FEE = 'PLATFORM_FEE',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND'
}

export interface Wallet {
  id: string;
  organizationId: string;
  currency: string;
  availableBalance: number; // In cents
  pendingBalance: number;
  updatedAt: string;
}

export interface FinancialLedgerEntry {
  id: string;
  walletId: string;
  organizationId: string;
  type: LedgerEntryType;
  amount: number; // In cents
  currency: string;
  description: string;
  referenceId?: string;
  balanceAfter: number;
  createdAt: string;
}

// ==========================================
// Financial Engine: Accounts, Double-Entry & Revenue Sharing
// ==========================================
export enum FinancialAccountType {
  PLATFORM_TREASURY = 'PLATFORM_TREASURY',
  ORGANIZER_TREASURY = 'ORGANIZER_TREASURY',
  PROCESSING_FEES_ESCROW = 'PROCESSING_FEES_ESCROW',
  RESERVE_ESCROW = 'RESERVE_ESCROW',
  VOTER_REFUND_POOL = 'VOTER_REFUND_POOL'
}

export enum LedgerDirection {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export interface FinancialAccount {
  id: string;
  organizationId?: string;
  type: FinancialAccountType;
  currency: string;
  availableBalance: number; // In cents
  reservedBalance: number; // In cents
  createdAt: string;
  updatedAt: string;
}

export interface DoubleEntryLedgerRecord {
  id: string;
  entryGroupId: string;
  accountId: string;
  organizationId?: string;
  direction: LedgerDirection;
  amountCents: number; // Always positive integer
  currency: string;
  balanceAfter: number;
  description: string;
  referenceType: string;
  referenceId?: string;
  createdAt: string;
}

export interface RevenueAllocation {
  id: string;
  paymentTransactionId: string;
  organizationId: string;
  electionId: string;
  grossAmountCents: number;
  processingFeeCents: number;
  approvedDeductionCents: number;
  distributableAmountCents: number;
  platformRateBasisPoints: number; // 2500 = 25.00%
  platformFeeCents: number;
  organiserRateBasisPoints: number; // 7500 = 75.00%
  organiserFeeCents: number;
  currency: string;
  status: 'ALLOCATED' | 'PARTIALLY_REFUNDED' | 'FULLY_REFUNDED' | 'DISPUTED';
  allocatedAt: string;
}

export interface RefundRecord {
  id: string;
  paymentTransactionId: string;
  revenueAllocationId: string;
  organizationId: string;
  electionId: string;
  voterCode?: string;
  type: 'PARTIAL' | 'FULL';
  refundAmountCents: number;
  reversalDistributableCents: number;
  reversalPlatformCents: number;
  reversalOrganiserCents: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSED' | 'REJECTED';
  processedBy?: string;
  ledgerEntryGroupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChargebackRecord {
  id: string;
  paymentTransactionId: string;
  revenueAllocationId: string;
  organizationId: string;
  disputeAmountCents: number;
  reason: string;
  status: 'UNDER_REVIEW' | 'LOST' | 'WON';
  ledgerEntryGroupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRefundRequest {
  paymentTransactionId: string;
  amountCents?: number; // If omitted or equal to gross, full refund
  reason: string;
  voterCode?: string;
}

export interface CreateChargebackRequest {
  paymentTransactionId: string;
  amountCents: number;
  reason: string;
}

export interface OrganizerRevenueMetrics {
  organizationId: string;
  currency: string;
  grossSales: number;
  processingFees: number;
  approvedDeductions: number;
  distributableAmount: number;
  platformCommission: number;
  organiserEarnings: number;
  availableBalance: number;
  reservedBalance: number;
  allocationsCount: number;
}

export interface SuperAdminFinancialMetrics {
  currency: string;
  totalPaymentVolume: number;
  platformRevenue: number;
  organiserLiabilities: number;
  processingFees: number;
  refundsTotal: number;
  chargebacksTotal: number;
  reconciliationDiscrepancies: number;
  isLedgerBalanced: boolean;
}

export interface CheckoutSessionRequest {
  packageId: string;
  organizationId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  packageId: string;
  amountCents: number;
  currency: string;
}

// ==========================================
// Standard API Envelope & Error Contracts
// ==========================================
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[] | Record<string, unknown>;
  stack?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiErrorPayload;
  meta?: PaginationMeta;
  timestamp: string;
  requestId?: string;
}
