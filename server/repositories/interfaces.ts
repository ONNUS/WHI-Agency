// WHI Agency — Repository Interfaces
// All data operations go through these typed interfaces.
// Phase 1: JSON flat-file implementations.
// Phase 2: Swap to PgXxxRepository — zero changes to routes or UI.

export type UserRole = 'admin' | 'analyst';

export type ProspectStatus =
  | 'new'
  | 'under_review'
  | 'briefing_scheduled'
  | 'qualified'
  | 'dna_sold'
  | 'disqualified';

// ─── User ────────────────────────────────────────────────────────────────────

export interface RefreshTokenRecord {
  hash: string;      // SHA256 hex of the raw refresh token
  expiresAt: string; // ISO8601
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  passwordHash: string;
  requirePasswordChange: boolean;
  refreshTokenHashes: RefreshTokenRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
  requirePasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(): Promise<UserPublic[]>;
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, patch: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null>;
  hasAdminUser(): Promise<boolean>;
}

// ─── Briefing ─────────────────────────────────────────────────────────────────

export interface BriefingScores {
  blue: number;
  red: number;
  green: number;
  battlespace: number;
  gap: number;
}

export interface Briefing {
  id: string;
  submittedAt: string;
  ipAddress?: string;
  // Form inputs
  businessName: string;
  industry: string;
  location: string;
  blueForceAnswers: string;
  redForceAnswers: string;
  greenForceAnswers: string;
  battlespaceAnswers: string;
  gapAnswers: string;
  // AI results
  scores: BriefingScores;
  overallScore: number;
  criticalVulnerability: string;
  asymmetricLeverage: string;
  combatPlan90Days: { phase1: string; phase2: string; phase3: string };
  executiveSummary: string;
  isGeminiLive: boolean;
  // Links
  prospectId?: string;
}

export interface BriefingIndex {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  overallScore: number;
  submittedAt: string;
  isGeminiLive: boolean;
  prospectId?: string;
}

export interface BriefingRepository {
  create(data: Omit<Briefing, 'id' | 'submittedAt'>): Promise<Briefing>;
  findById(id: string): Promise<Briefing | null>;
  findAll(opts?: ListOptions): Promise<{ items: BriefingIndex[]; total: number }>;
  update(id: string, patch: Partial<Pick<Briefing, 'prospectId'>>): Promise<Briefing | null>;
  delete(id: string): Promise<void>;
  reconcileIndex(): Promise<void>;
}

// ─── Prospect ─────────────────────────────────────────────────────────────────

export interface Prospect {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: ProspectStatus;
  assignedTo?: string; // User ID
  briefingId?: string;
}

export interface ProspectIndex {
  id: string;
  name: string;
  email: string;
  briefingId?: string;
  status: ProspectStatus;
  assignedTo?: string;
  overallScore?: number;
  businessName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProspectRepository {
  create(data: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prospect>;
  findById(id: string): Promise<Prospect | null>;
  findAll(opts?: ListOptions): Promise<{ items: ProspectIndex[]; total: number }>;
  update(
    id: string,
    patch: Partial<Pick<Prospect, 'status' | 'notes' | 'assignedTo' | 'briefingId'>>,
  ): Promise<Prospect | null>;
  reconcileIndex(): Promise<void>;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'submittedAt' | 'overallScore' | 'businessName' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
