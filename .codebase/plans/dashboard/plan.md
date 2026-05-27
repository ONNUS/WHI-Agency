# WHI Agency — Admin Dashboard Execution Plan
## Backend Dashboard: Base System (Phase 1)

**Prepared:** May 27, 2026  
**Branch:** alpha  
**Reference Audit:** `.codebase/audits/DNA/questionnaire.md`  
**Tech Gap Audit:** `.codebase/plans/dashboard/tech-gap-audit.md`

---

## Overview

Build a secure, staff-only admin dashboard that collects, stores, and surfaces all DNA Reconnaissance Briefing Questionnaire submissions. The system is light and JSON-file-based in Phase 1, with a clean migration path to PostgreSQL in Phase 2+.

**Phase 1 Deliverables:**
1. JSON flat-file storage layer with Repository pattern (PostgreSQL-ready interfaces)
2. Staff authentication (JWT, bcrypt, refresh tokens)
3. Questionnaire submission persistence
4. Contact form persistence (currently lost on every submit)
5. Admin React UI: Login → Dashboard → Submissions → Contacts (CRM) → Users

**Initial credentials (seeded on first boot):**
- Username: `Admin`
- Password: read from `process.env.ADMIN_SEED_PASSWORD` (default `000111`)
- Role: `admin`
- `requirePasswordChange: true` — forced redirect to change-password screen on first login

> ⚠️ Change the Admin password immediately after first login in production. The first-login forced redirect enforces this automatically.

---

## Architecture Decisions

### 1. Repository Pattern (PostgreSQL-Ready by Design)

Every data operation goes through a typed interface. Phase 1 implements these with `fs/promises` JSON files. Phase 2 replaces only the implementation — zero changes to API routes or UI.

```typescript
// Example — same interface, two implementations
interface SubmissionRepository {
  create(data: CreateSubmissionInput): Promise<Submission>;
  findById(id: string): Promise<Submission | null>;
  findAll(opts?: ListOptions): Promise<{ items: SubmissionIndex[]; total: number }>;
  delete(id: string): Promise<void>;
}

class JsonSubmissionRepository implements SubmissionRepository { /* fs/promises */ }
class PgSubmissionRepository implements SubmissionRepository   { /* prisma / pg */ }
```

### 2. Single Server — Extend `server.ts`

No second process. All admin API routes live under `/api/admin/*` in the existing Express app. The admin React UI is a protected route group within the existing Vite SPA.

### 3. JWT Auth — Access + Refresh Token Pair

- **Access token:** short-lived (15 min), stored in memory (JS variable in React)
- **Refresh token:** long-lived (7 days), stored in an `httpOnly` cookie, hash recorded in `users.json`
- On refresh, old token hash is revoked and a new pair is issued
- Logout revokes the refresh token hash from the file

### 4. Storage Path

```
data/json/dna/questionnaire/
  briefings/       ← {uuid}.json per recon brief (was: submissions/)
  prospects/       ← {uuid}.json per prospect/contact lead (was: contacts/)
  users/
    users.json     ← all staff users (array, includes refresh token hashes)
  _index/
    briefings.json     ← lightweight listing index (was: submissions.json)
    prospects.json     ← lightweight listing index (was: contacts.json)
```

> Directories are **never committed to git** (`data/` is gitignored). All repositories call `fs.mkdir(dir, { recursive: true })` on initialization to auto-create missing directories on cold start or fresh Docker container.

---

## Full File Structure After Phase 1

```
/workspaces/WHI-Agency/
  server.ts                              ← Extended with admin routes + auth
  .env                                   ← Created in Phase 1B (gitignored)
  .env.example                           ← Committed template (no real values)
  data/                                  ← Gitignored, auto-created at runtime
    json/
      dna/
        questionnaire/
          briefings/                     ← {uuid}.json per recon brief
          prospects/                     ← {uuid}.json per prospect
          users/
            users.json
          _index/
            briefings.json
            prospects.json
  src/
    types.ts                             ← Extended with admin types + submissionId
    main.tsx                             ← Wrap with React Router
    App.tsx                              ← Public site (unchanged layout)
    admin/
      AdminApp.tsx                       ← Admin SPA root with auth guard
      context/
        AuthContext.tsx                  ← JWT state + login/logout helpers
      pages/
        LoginPage.tsx
        ChangePasswordPage.tsx           ← NEW — forced on first login
        DashboardPage.tsx
        BriefingsPage.tsx                ← was: SubmissionsPage.tsx
        BriefingDetailPage.tsx           ← was: SubmissionDetailPage.tsx
        ProspectsPage.tsx                ← was: ContactsPage.tsx
        ProspectDetailPage.tsx           ← was: ContactDetailPage.tsx
        StaffPage.tsx                    ← was: UsersPage.tsx
        StaffFormPage.tsx                ← was: UserFormPage.tsx
      components/
        AdminLayout.tsx                  ← Sidebar nav + header wrapper
        ProtectedRoute.tsx               ← Auth + requirePasswordChange guard
        AdminOnlyRoute.tsx               ← Role=admin gate (renders 403 if analyst)
        BriefingTable.tsx                ← was: SubmissionTable.tsx
        ProspectBoard.tsx                ← was: ContactBoard.tsx
        StaffTable.tsx                   ← was: UserTable.tsx
        ScoreBadge.tsx                   ← Reusable score display
        PillarRadar.tsx                  ← Reuse/wrap RadarChart for admin
        Toast.tsx                        ← Simple inline toast for PATCH feedback
      services/
        api.ts                           ← Typed fetch wrappers for admin API
  server/
    middleware/
      auth.ts                            ← JWT verify middleware
      rateLimiter.ts                     ← express-rate-limit configs
    repositories/
      interfaces.ts                      ← Repository interfaces (TS)
      JsonBriefingRepository.ts          ← was: JsonSubmissionRepository.ts
      JsonProspectRepository.ts          ← was: JsonContactRepository.ts
      JsonUserRepository.ts
    services/
      authService.ts                     ← login, refresh, logout logic
      seedService.ts                     ← First-boot Admin user seed
    routes/
      adminAuth.ts                       ← /api/admin/auth/*
      adminBriefings.ts                  ← /api/admin/briefings/*
      adminProspects.ts                  ← /api/admin/prospects/*
      adminUsers.ts                      ← /api/admin/users/*
      adminStats.ts                      ← /api/admin/stats
      publicProspects.ts                 ← /api/prospects (public contact form)
```

---

## Phase 1 — Step-by-Step Execution

### Phase 1A: Storage Foundation + Seed

**Goal:** JSON directory structure + user seed runs on server start.

**Steps:**

1. Add `data/` to `.gitignore` (do not commit user data — directories are created at runtime)
2. Create `server/repositories/interfaces.ts` — define `BriefingRepository`, `ProspectRepository`, `UserRepository` TypeScript interfaces
3. Create `server/repositories/JsonUserRepository.ts`
   - Constructor: call `ensureDir(USERS_DIR)` using `fs.mkdir(path, { recursive: true })` before any operation
   - All repositories must call `ensureDir()` in their constructors — data directories are gitignored and must be auto-created on cold start
4. Create `server/repositories/JsonUserRepository.ts` (implementation)
   - `readUsers()` → read + parse `users/users.json` (return `[]` if not found)
   - `writeUsers(users)` → write array atomically
   - `findByUsername(username)` → case-insensitive lookup
   - `findById(id)`
   - `create(data)` → append + write index
   - `update(id, patch)` → find + patch + write
5. Create `server/services/seedService.ts`
   - On call: ensure all data directories exist via `fs.mkdir({ recursive: true })`
   - Check if `users.json` exists and contains any `admin` role user
   - If not: generate UUID, bcryptjs hash from `process.env.ADMIN_SEED_PASSWORD || '000111'` (cost factor from `parseInt(process.env.BCRYPT_ROUNDS || '12', 10)`), write initial Admin user with `requirePasswordChange: true`
   - Log: `"[WHI] Admin user seeded. Username: Admin — Change password on first login."`
6. Call `await seedService.seed()` at the top of `startServer()` in `server.ts` BEFORE `app.listen()`

**Validation checkpoint:**
- Run `npm run dev` → server starts, `users.json` is created with hashed Admin record
- Confirm `passwordHash` is NOT `000111` in plain text

---

### Phase 1B: Auth Backend

**Goal:** Secure login + token system before any data routes are exposed.

**New packages:**
```bash
npm install bcryptjs jsonwebtoken cookie-parser cors
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/cors
```
> Use `bcryptjs` (pure JS, not `bcrypt`) — Docker base is `node:22-alpine` which lacks python3/make for native compilation. `bcryptjs` is a drop-in replacement with an identical API.

**Steps:**

1. Create `.env` file (gitignored) and `.env.example` (committed, no real values):
   ```dotenv
   # Existing
   GEMINI_API_KEY=your_key_here

   # Auth — generate secrets with: openssl rand -hex 32
   JWT_ACCESS_SECRET=
   JWT_REFRESH_SECRET=
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d

   # App
   NODE_ENV=development
   DATA_PATH=./data/json/dna/questionnaire
   BCRYPT_ROUNDS=12
   ADMIN_SEED_PASSWORD=000111
   ```
   Generate real values: `openssl rand -hex 32` for each JWT secret. Never commit `.env`.

2. Create `server/services/authService.ts`:
   - `login(username, password)`:
     - Find user by username (case-insensitive)
     - If not found or not active → throw `INVALID_CREDENTIALS`
     - `bcryptjs.compare(password, user.passwordHash)` → throw `INVALID_CREDENTIALS` if false (constant-time, no username enum)
     - Generate access JWT: `{ sub: user.id, role: user.role, iat, exp }`
     - Generate refresh token: `crypto.randomBytes(64).toString('hex')`
     - Hash refresh token with `crypto.createHash('sha256')`, store hash in user record with expiry
     - Return `{ accessToken, refreshToken, user: { id, username, name, role } }`
   - `refresh(refreshToken)`:
     - Hash incoming token, find matching non-revoked, non-expired record
     - Issue new access token + rotate refresh token (revoke old hash, insert new)
   - `logout(refreshToken)`:
     - Hash incoming token, mark as revoked in user record

3. Create `server/middleware/auth.ts`:
   - `requireAuth`: verify access JWT, attach `req.user = { id, role }` or return 401
   - `requireAdmin`: run `requireAuth` then check `req.user.role === 'admin'` or return 403

4. Create `server/routes/adminAuth.ts`:
   ```
   POST /api/admin/auth/login    → authService.login() → set httpOnly refresh cookie + return accessToken
   POST /api/admin/auth/refresh  → read cookie → authService.refresh() → return new accessToken
   POST /api/admin/auth/logout   → read cookie → authService.logout() → clear cookie
   GET  /api/admin/auth/me       → requireAuth → return req.user
   ```

5. Add middleware to `server.ts` (before routes):
   ```typescript
   import cookieParser from 'cookie-parser';
   import cors from 'cors';

   const corsOptions = {
     origin: process.env.NODE_ENV === 'production'
       ? process.env.ALLOWED_ORIGIN || 'https://yourdomain.com'
       : 'http://localhost:3000',
     credentials: true,  // required for httpOnly cookie on refresh
   };
   app.use(cors(corsOptions));
   app.use(cookieParser());
   ```

6. Mount all admin routes in `server.ts`:
   ```typescript
   app.use('/api/admin/auth', adminAuthRouter);
   app.use('/api/admin/briefings', adminBriefingsRouter);
   app.use('/api/admin/prospects', adminProspectsRouter);
   app.use('/api/admin/users', adminUsersRouter);
   app.use('/api/admin/stats', adminStatsRouter);
   app.use('/api/prospects', publicProspectsRouter);  // public, no auth
   ```

**Validation checkpoint:**
- `POST /api/admin/auth/login` with `{ username: "Admin", password: "000111" }` → 200 + `accessToken` in body + `httpOnly` cookie set
- `POST /api/admin/auth/login` with wrong password → 401
- `GET /api/admin/auth/me` with Bearer token → 200 + user object
- `GET /api/admin/auth/me` without token → 401
- `POST /api/admin/auth/logout` → cookie cleared

---

### Phase 1C: Rate Limiting + Input Sanitization

**Goal:** Protect `/api/assess` from abuse and close prompt injection gap.

**New packages:**
```bash
npm install express-rate-limit express-validator
```

**Steps:**

1. Create `server/middleware/rateLimiter.ts`:
   ```typescript
   export const assessLimiter = rateLimit({
     windowMs: 60 * 60 * 1000,  // 1 hour
     max: 10,
     message: { error: 'Too many assessments from this IP. Try again later.' },
     standardHeaders: true,
     legacyHeaders: false,
   });

   export const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,  // 15 min
     max: 10,
     message: { error: 'Too many login attempts. Try again later.' },
   });
   ```

2. In `server.ts`, apply `assessLimiter` to the `/api/assess` route
3. In `adminAuth.ts`, apply `loginLimiter` to `POST /api/admin/auth/login`

4. In `/api/assess`, sanitize inputs before Gemini prompt:
   ```typescript
   // Strip angle brackets, backticks, and common injection markers
   const sanitize = (s: string) =>
     s.replace(/[<>`\\]/g, '').replace(/\[INST\]|\[\/INST\]|###/g, '').trim().slice(0, 2000);
   ```
   Wrap each `blueForceAnswers`, `redForceAnswers`, etc. through `sanitize()` before the prompt string.
   
5. Add `express-validator` checks at the top of `/api/assess`:
   - `businessName`: required, string, max 200 chars, trim, escape
   - `industry`: required, string, max 200 chars, trim, escape
   - `location`: optional, string, max 100 chars
   - All `*Answers` fields: optional, string, max 2000 chars

**Validation checkpoint:**
- Submit with `businessName` containing `<script>alert(1)</script>` → sanitized, no 500
- Submit 15 times from same IP within 1 hour → 429 after 10th

---

### Phase 1D: Briefing + Prospect Persistence

**Goal:** Every `/api/assess` briefing is persisted to JSON; prospect (contact) form submissions are persisted.

**Steps:**

1. Extend `src/types.ts` — add `submissionId` and `isGeminiLive` to `DiagnosticResult`:
   ```typescript
   export interface DiagnosticResult {
     // ...existing fields...
     isGeminiLive?: boolean;
     submissionId?: string;   // returned after Phase 1D persistence
   }
   ```

2. Create `server/repositories/JsonBriefingRepository.ts` (was: JsonSubmissionRepository):
   - Constructor: `ensureDir(path.join(DATA_PATH, 'briefings'))` + `ensureDir(path.join(DATA_PATH, '_index'))`
   - `create(data)`:
     - Generate `crypto.randomUUID()`
     - Write full JSON to `briefings/{uuid}.json` FIRST
     - Only then append lightweight entry to `_index/briefings.json`
     - Return created briefing with `id` + `submittedAt`
   - `findById(id)`:
     - Validate UUID: `^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`
     - Resolve final path and assert it starts with `DATA_PATH` (path traversal guard)
     - Read `briefings/{id}.json` → parse → return or null
   - `findAll(opts)`:
     - Read `_index/briefings.json`
     - Apply search filter, date range, sort, pagination
     - Return `{ items, total }`
   - `delete(id)`: delete `briefings/{id}.json` + remove from index
   - On startup call `reconcileIndex()`: scan `briefings/` directory, rebuild `_index/briefings.json` from actual files present

3. Create `server/repositories/JsonProspectRepository.ts` (was: JsonContactRepository):
   - Same pattern for `prospects/` + `_index/prospects.json`

4. Modify `/api/assess` in `server.ts`:
   - After receiving `DiagnosticResult`, call `briefingRepo.create({ ...formData, ...result, ipAddress })`
   - Include `submissionId` in the JSON response back to the frontend

5. Create `server/routes/publicProspects.ts`:
   ```
   POST /api/prospects    ← public, no auth — wired from BriefingForm.tsx contact form
   ```
   Wire `handleContactSubmit` in `BriefingForm.tsx` to call `POST /api/prospects` with `{ ...contactForm, submissionId }`

6. Call `reconcileIndex()` on both briefing and prospect repositories in `startServer()` before routes are mounted

**Validation checkpoint:**
- Submit questionnaire → `data/json/dna/questionnaire/briefings/{uuid}.json` file created
- Submit contact form → `data/json/dna/questionnaire/prospects/{uuid}.json` created
- `_index/briefings.json` grows by one entry per briefing
- Restarting the server runs `reconcileIndex()` and all data is accessible

---

### Phase 1E: Admin API Routes

**Goal:** All CRUD endpoints for the dashboard UI. All protected by `requireAuth`.

**Route inventory:**

```
BRIEFINGS (renamed from SUBMISSIONS)
  GET    /api/admin/briefings              requireAuth  → list with pagination + search
  GET    /api/admin/briefings/:id          requireAuth  → full briefing detail
  DELETE /api/admin/briefings/:id          requireAdmin → hard delete file + index entry

PROSPECTS (renamed from CONTACTS)
  GET    /api/admin/prospects              requireAuth  → list with status filter + pagination
  GET    /api/admin/prospects/:id          requireAuth  → full prospect + linked briefing
  PATCH  /api/admin/prospects/:id          requireAuth  → update status, notes, assignedTo

USERS / STAFF
  GET    /api/admin/users                  requireAdmin → list all staff
  POST   /api/admin/users                  requireAdmin → create new staff user
  GET    /api/admin/users/:id              requireAdmin → single user detail
  PATCH  /api/admin/users/:id              requireAdmin → update name, role, isActive; optional password reset (sets requirePasswordChange: true)
  POST   /api/admin/users/me/password      requireAuth  → change own password (current + new)

STATS
  GET    /api/admin/stats                  requireAuth  → { briefingCount, prospectCount, avgScore (all-time), recentBriefings[5], recentProspects[5] }

PUBLIC (no auth)
  POST   /api/assess                       → existing assess endpoint
  POST   /api/prospects                    → public contact form from BriefingForm.tsx
```

**Implementation notes:**
- All `/:id` routes validate UUID format before file I/O — return 400 on invalid format, 404 on file-not-found
- `PATCH` routes merge only whitelisted fields — never allow patching `passwordHash` or `id` via PATCH
- Users endpoint never returns `passwordHash` or `refreshTokens` array in responses
- Admin cannot delete or deactivate their own account

---

### Phase 1F: Admin React UI

**Goal:** Full admin SPA accessible at `/admin/*` routes.

**New packages:**
```bash
npm install react-router-dom
```
> `@types/react-router-dom` is NOT needed — react-router-dom v6 bundles its own TypeScript types. Installing separately causes duplicate type conflicts.

**Steps:**

1. Update `src/main.tsx` — wrap in `<BrowserRouter>` (react-router-dom v6, types bundled):
   ```tsx
   <BrowserRouter>
     <Routes>
       <Route path="/admin/*" element={<AdminApp />} />
       <Route path="/*" element={<App />} />
     </Routes>
   </BrowserRouter>
   ```
   > The public `App.tsx` uses `document.getElementById` for scroll navigation — no `<Link>` components — unaffected by router context.

2. Create `src/admin/context/AuthContext.tsx`:
   - State: `{ user, accessToken, isLoading }`
   - `login(username, password)` → POST `/api/admin/auth/login` → store accessToken in memory
   - `logout()` → POST `/api/admin/auth/logout` → clear state
   - On mount: `GET /api/admin/auth/me` using cookie-based refresh if accessToken missing → silent re-auth

3. Create `src/admin/components/ProtectedRoute.tsx`:
   - If `isLoading` → render spinner
   - If no `user` → `<Navigate to="/admin/login" />`
   - If `user.requirePasswordChange === true` AND current path is not `/admin/account/change-password` → `<Navigate to="/admin/account/change-password" />`
   - Else → render children

   Create `src/admin/components/AdminOnlyRoute.tsx`:
   - Wraps routes that require `role === 'admin'`
   - If `user.role !== 'admin'` → render 403 screen (Screen 11 from wireframes)
   - Else → `<Outlet />`

4. Create `src/admin/AdminApp.tsx`:
   ```tsx
   <AuthProvider>
     <Routes>
       <Route path="login" element={<LoginPage />} />
       <Route path="account/change-password"
              element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
       <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
         <Route index element={<Navigate to="dashboard" replace />} />
         <Route path="dashboard" element={<DashboardPage />} />
         <Route path="briefings" element={<BriefingsPage />} />
         <Route path="briefings/:id" element={<BriefingDetailPage />} />
         <Route path="prospects" element={<ProspectsPage />} />
         <Route path="prospects/:id" element={<ProspectDetailPage />} />
         <Route element={<AdminOnlyRoute />}>
           <Route path="staff" element={<StaffPage />} />
           <Route path="staff/new" element={<StaffFormPage />} />
           <Route path="staff/:id" element={<StaffFormPage />} />
         </Route>
       </Route>
       <Route path="*" element={<Navigate to="dashboard" replace />} />
     </Routes>
   </AuthProvider>
   ```

5. **`LoginPage.tsx`**:
   - Username + password form
   - Call `authContext.login()`
   - On success → if `user.requirePasswordChange` → navigate to `/admin/account/change-password`, else → `/admin/dashboard`
   - Show error on 401
   - Match WHI dark aesthetic (`#0b0c0f`, amber accent `#bc993c`, monospace labels)

5b. **`ChangePasswordPage.tsx`** (new — Screen 09 from wireframes):
   - "SECURITY PROTOCOL REQUIRED" header
   - Fields: Current Password, New Password (min 8), Confirm New Password
   - Calls `POST /api/admin/users/me/password`
   - On success → clears `requirePasswordChange` flag → navigate to `/admin/dashboard`
   - Same WHI dark aesthetic as login screen

6. **`AdminLayout.tsx`**:
   - Fixed left sidebar with nav: **Dashboard · Briefings · Prospects · Staff**
   - Header: WHI logo, logged-in user name, Logout button
   - `<Outlet />` for page content (required — renders child route content)
   - Responsive collapse for mobile
   - Staff nav item visible only if `user.role === 'admin'`

7. **`DashboardPage.tsx`**:
   - Stat cards: Total Briefs, New Prospects, Avg Readiness Score™, Active Staff
   - Recent Briefings table (last 5: org name, score, location, time)
   - Pipeline status breakdown for prospects
   - Recent Prospect Activity (last 3)
   - Data from `GET /api/admin/stats` (returns `briefingCount`, `prospectCount`, `avgScore`, `recentBriefings[5]`, `recentProspects[5]`)

8. **`BriefingsPage.tsx`** (was: SubmissionsPage):
   - Table: Organization | Industry | Location | Readiness Score™ | Received
   - Search bar (client-side filter on index data — org name + industry)
   - Score badges: red < 5.0 · amber 5.0–6.9 · green ≥ 7.0
   - Click row → navigate to `/admin/briefings/:id`
   - Empty state handled ("No reconnaissance briefings received yet")

9. **`BriefingDetailPage.tsx`** (was: SubmissionDetailPage):
   - Header: Brief ID, org name, location/industry, received timestamp
   - Read-only RadarChart (reuse `RadarChart` component, no `onScoreChange` prop)
   - 5-pillar score progress bars + aggregate Readiness Score™
   - Executive Intelligence Summary
   - Critical Vulnerability + Asymmetric Leverage cards
   - First 90-Day Combat Plan (3-phase cards)
   - Raw Intelligence Inputs (collapsible — all 5 pillar answers)
   - Linked Prospect section (or "CONVERT TO PROSPECT" button if no linked prospect)
   - Delete button (admin only, with confirm modal)

10. **`ProspectsPage.tsx`** (was: ContactsPage):
    - Pipeline status filter tabs: ALL · NEW · UNDER REVIEW · BRIEFING SCHEDULED · QUALIFIED · DNA SOLD · DISQUALIFIED
    - Table: Name | Organization | Score | Status | Assigned
    - Search (client-side: name, email, org)
    - Empty state per status filter

11. **`ProspectDetailPage.tsx`** (was: ContactDetailPage):
    - Contact info: name, email, phone, org
    - Pipeline status dropdown (PATCH on change, toast on success)
    - Assigned To dropdown (all active staff)
    - Operative Notes textarea (PATCH on save, toast on success)
    - Linked Briefing section: brief ID, score summary, Critical Vulnerability → link to full brief

12. **`StaffPage.tsx`** (was: UsersPage) — admin only:
    - Table: Name | Username | Role | Status | Created
    - Role badges: amber=ADMIN · stone=ANALYST
    - Status: green=ACTIVE · red=INACTIVE
    - "+ ADD NEW OPERATIVE" button
    - Edit `[✎]` button per row

13. **`StaffFormPage.tsx`** (was: UserFormPage) — admin only:
    - Create mode: Name, Username, Email, Temp Password, Role, Status
    - Edit mode: Name (editable), Username (read-only), Email, Role, Status, "ISSUE TEMPORARY PASSWORD" section
    - Admin cannot deactivate their own account

14. **`src/admin/services/api.ts`**:
    - Typed fetch wrapper that injects `Authorization: Bearer ${accessToken}` header
    - `credentials: 'include'` on all requests (required for httpOnly refresh cookie)
    - On 401: call `POST /api/admin/auth/refresh` → if success, retry original request once → if refresh also fails, redirect to `/admin/login?reason=session_expired`
    - Show toast: "Your session expired. Please log in again." on redirect

---

## Phase 2 — PostgreSQL Migration (Future)

When the business outgrows JSON files (>10,000 submissions, concurrent staff, reporting needs):

1. Add `prisma` + PostgreSQL Docker service
2. Create Prisma schema mirroring the JSON data shapes exactly
3. Implement `PgBriefingRepository`, `PgProspectRepository`, `PgUserRepository`
4. In `server.ts`, swap repository instantiation (one line each)
5. Run migration script: read all JSON files → insert into PostgreSQL
6. Validate all API endpoints return identical shapes
7. Archive `data/json/` after confirmed migration

**Zero changes required to:**
- Any API route handler
- Any admin UI component
- Any `AuthContext` or service layer logic

---

## Dependencies Summary

### New packages to install

```bash
# Runtime — CORRECTED (bcryptjs not bcrypt; cors added)
npm install bcryptjs jsonwebtoken cookie-parser cors express-rate-limit express-validator react-router-dom

# Types — CORRECTED (@types/react-router-dom removed — bundled in v6; @types/cors added)
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/cors
```

> **`bcryptjs` vs `bcrypt`:** Docker base is `node:22-alpine`. Alpine has no `python3`/`make`/`gcc` — `bcrypt` native compilation fails. `bcryptjs` is pure JavaScript, zero native deps, identical API.  
> **`@types/react-router-dom`:** NOT needed — react-router-dom v6+ bundles its own TypeScript types. Installing separately causes duplicate type conflicts.

### No new packages needed for storage
`fs/promises` and `crypto.randomUUID()` are Node.js built-ins (Node 18+, confirmed: running Node 22). Zero new dependencies for JSON file operations.

### Full `package.json` dependencies after Phase 1

```json
"dependencies": {
  "@google/genai": "^2.4.0",
  "@tailwindcss/vite": "^4.1.14",
  "@vitejs/plugin-react": "^5.0.4",
  "bcryptjs": "^2.4.3",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^4.21.2",
  "express-rate-limit": "^7.5.0",
  "express-validator": "^7.2.1",
  "jsonwebtoken": "^9.0.2",
  "lucide-react": "^0.546.0",
  "motion": "^12.23.24",
  "react": "^19.0.1",
  "react-dom": "^19.0.1",
  "react-router-dom": "^6.30.1",
  "vite": "^6.2.3"
},
"devDependencies": {
  "@types/bcryptjs": "^2.4.6",
  "@types/cookie-parser": "^1.4.7",
  "@types/cors": "^2.8.17",
  "@types/express": "^4.17.21",
  "@types/jsonwebtoken": "^9.0.5",
  "@types/node": "^22.14.0"
}
```

---

## Environment Variables

Create `.env` (gitignored — run `openssl rand -hex 32` to generate JWT secrets):

```dotenv
# Existing
GEMINI_API_KEY=your_key_here

# Auth secrets — GENERATE REAL VALUES, never commit
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# App config
NODE_ENV=development
DATA_PATH=./data/json/dna/questionnaire
BCRYPT_ROUNDS=12
ADMIN_SEED_PASSWORD=000111
ALLOWED_ORIGIN=https://yourdomain.com
```

Commit `.env.example` (identical structure, all values blank/placeholder) so new developers know what's required.

---

## `.gitignore` Additions

```gitignore
# User data — never commit
data/

# Environment
.env
.env.local
.env.production
```

---

## Acceptance Criteria (Phase 1 Complete)

**Storage & Auth**
- [ ] Server starts cold with no `data/` directory → directories auto-created → `users.json` created → Admin seeded with bcryptjs hash
- [ ] `POST /api/admin/auth/login` `{ username: "Admin", password: "000111" }` → 200 + `accessToken` + httpOnly `refresh_token` cookie
- [ ] Wrong credentials → 401 (no timing difference between bad username vs bad password — constant-time compare)
- [ ] `GET /api/admin/auth/me` with valid Bearer token → 200 + user object (no passwordHash in response)
- [ ] `GET /api/admin/auth/me` without token → 401
- [ ] `POST /api/admin/auth/logout` → cookie cleared

**Persistence**
- [ ] Submit questionnaire → `data/json/dna/questionnaire/briefings/{uuid}.json` created
- [ ] Submit contact form → `data/json/dna/questionnaire/prospects/{uuid}.json` created
- [ ] `GET /api/admin/briefings` without auth → 401
- [ ] `GET /api/admin/briefings` with valid token → 200 + list
- [ ] Server restart → all previously submitted data accessible (reconcileIndex runs on start)

**Admin SPA**
- [ ] Navigate to `/admin` → redirect to `/admin/login` (unauthenticated)
- [ ] Login with Admin/000111 → forced redirect to `/admin/account/change-password` (requirePasswordChange: true)
- [ ] Change password → redirect to `/admin/dashboard` → stat cards visible
- [ ] View briefings list → click entry → full detail page with read-only radar chart + 90-day plan
- [ ] View prospects → change status → PATCH persists to JSON file + toast confirms
- [ ] Admin creates new staff member → appears in staff list
- [ ] Analyst role cannot access `/admin/staff` → 403 screen shown

**Security**
- [ ] Rate limiter returns 429 after 10 rapid login attempts within 15 min
- [ ] Rate limiter returns 429 after 10 rapid `/api/assess` calls within 1 hour
- [ ] Free-text with `<script>alert(1)</script>` → sanitized, no 500, no XSS
- [ ] UUID path traversal (`../../users/users`) → 400 returned, no file system access outside data dir

**Build**
- [ ] `npm run build` → `dist/server.cjs` generated without errors
- [ ] Docker build (`node:22-alpine`) completes without native compilation errors

---

*Plan prepared May 27, 2026 — WHI Agency alpha branch*
