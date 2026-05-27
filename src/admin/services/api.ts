// WHI Admin API service
// All requests use credentials: 'include' so httpOnly refresh cookie is sent.
// On 401, silently attempts to refresh the access token once.

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

type OnUnauthorized = () => void;
let _onUnauthorized: OnUnauthorized | null = null;

export function setOnUnauthorized(cb: OnUnauthorized) {
  _onUnauthorized = cb;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
    setAccessToken(null);
    _onUnauthorized?.();
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface UserPublic {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: string;
  isActive: boolean;
  requirePasswordChange: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function authLogin(username: string, password: string) {
  const data = await apiFetch<{ accessToken: string; user: UserPublic }>(
    '/api/admin/auth/login',
    { method: 'POST', body: JSON.stringify({ username, password }) },
    false, // never retry login
  );
  setAccessToken(data.accessToken);
  return data.user;
}

export async function authRefresh() {
  const refreshed = await tryRefresh();
  if (!refreshed) return null;
  return authMe();
}

export async function authMe() {
  return apiFetch<UserPublic>('/api/admin/auth/me');
}

export async function authLogout() {
  await apiFetch('/api/admin/auth/logout', { method: 'POST' }).catch(() => {});
  setAccessToken(null);
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ ok: boolean }>('/api/admin/users/me/password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  briefingCount: number;
  prospectCount: number;
  newProspectCount: number;
  avgScore: number;
  activeStaffCount: number;
  recentBriefings: BriefingIndex[];
  recentProspects: ProspectIndex[];
}

export async function fetchStats() {
  return apiFetch<AdminStats>('/api/admin/stats');
}

// ─── Briefings ────────────────────────────────────────────────────────────────

export interface BriefingScores {
  blue: number;
  red: number;
  green: number;
  battlespace: number;
  gap: number;
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

export interface Briefing {
  id: string;
  submittedAt: string;
  businessName: string;
  industry: string;
  location: string;
  blueForceAnswers: string;
  redForceAnswers: string;
  greenForceAnswers: string;
  battlespaceAnswers: string;
  gapAnswers: string;
  scores: BriefingScores;
  overallScore: number;
  criticalVulnerability: string;
  asymmetricLeverage: string;
  combatPlan90Days: { phase1: string; phase2: string; phase3: string };
  executiveSummary: string;
  isGeminiLive: boolean;
  prospectId?: string;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
}

export async function fetchBriefings(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  if (params.search) q.set('search', params.search);
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  if (params.dateFrom) q.set('dateFrom', params.dateFrom);
  if (params.dateTo) q.set('dateTo', params.dateTo);
  return apiFetch<PagedResult<BriefingIndex>>(`/api/admin/briefings?${q}`);
}

export async function fetchBriefing(id: string) {
  return apiFetch<Briefing>(`/api/admin/briefings/${id}`);
}

export async function deleteBriefing(id: string) {
  return apiFetch<{ ok: boolean }>(`/api/admin/briefings/${id}`, { method: 'DELETE' });
}

// ─── Prospects ────────────────────────────────────────────────────────────────

export type ProspectStatus =
  | 'new'
  | 'under_review'
  | 'briefing_scheduled'
  | 'qualified'
  | 'dna_sold'
  | 'disqualified';

export interface ProspectIndex {
  id: string;
  name: string;
  email: string;
  briefingId?: string;
  status: ProspectStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prospect {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  status: ProspectStatus;
  briefingId?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export async function fetchProspects(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  if (params.search) q.set('search', params.search);
  if (params.status && params.status !== 'all') q.set('status', params.status);
  return apiFetch<PagedResult<ProspectIndex>>(`/api/admin/prospects?${q}`);
}

export async function fetchProspect(id: string) {
  return apiFetch<Prospect>(`/api/admin/prospects/${id}`);
}

export async function patchProspect(
  id: string,
  patch: { status?: ProspectStatus; notes?: string; assignedTo?: string; briefingId?: string },
) {
  return apiFetch<Prospect>(`/api/admin/prospects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function fetchUsers() {
  return apiFetch<UserPublic[]>('/api/admin/users');
}

export async function fetchUser(id: string) {
  return apiFetch<UserPublic>(`/api/admin/users/${id}`);
}

export async function createUser(data: {
  username: string;
  name: string;
  email?: string;
  password: string;
  role: string;
}) {
  return apiFetch<UserPublic>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function patchUser(
  id: string,
  patch: { name?: string; email?: string; role?: string; isActive?: boolean; password?: string },
) {
  return apiFetch<UserPublic>(`/api/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
