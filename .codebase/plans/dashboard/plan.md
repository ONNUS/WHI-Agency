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
- Password: `000111`
- Role: `admin`

> ⚠️ Change the Admin password immediately after first login in production.

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
  submissions/     ← {uuid}.json per submission
  contacts/        ← {uuid}.json per contact lead
  users/
    users.json     ← all staff users (array, includes refresh token hashes)
  _index/
    submissions.json   ← lightweight listing index
    contacts.json      ← lightweight listing index
```

---

## Full File Structure After Phase 1

```
/workspaces/WHI-Agency/
  server.ts                              ← Extended with admin routes + auth
  data/
    json/
      dna/
        questionnaire/
          submissions/
          contacts/
          users/
            users.json
          _index/
            submissions.json
            contacts.json
  src/
    types.ts                             ← Extended with admin types
    main.tsx                             ← Wrap with React Router
    App.tsx                              ← Public site (unchanged layout)
    admin/
      AdminApp.tsx                       ← Admin SPA root with auth guard
      context/
        AuthContext.tsx                  ← JWT state + login/logout helpers
      pages/
        LoginPage.tsx
        DashboardPage.tsx
        SubmissionsPage.tsx
        SubmissionDetailPage.tsx
        ContactsPage.tsx
        ContactDetailPage.tsx
        UsersPage.tsx
        UserFormPage.tsx
      components/
        AdminLayout.tsx                  ← Sidebar nav + header wrapper
        ProtectedRoute.tsx               ← Auth guard HOC
        SubmissionTable.tsx
        ContactBoard.tsx
        UserTable.tsx
        ScoreBadge.tsx                   ← Reusable score display
        PillarRadar.tsx                  ← Reuse/wrap RadarChart for admin
      services/
        api.ts                           ← Typed fetch wrappers for admin API
  server/
    middleware/
      auth.ts                            ← JWT verify middleware
      rateLimiter.ts                     ← express-rate-limit configs
    repositories/
      interfaces.ts                      ← Repository interfaces (TS)
      JsonSubmissionRepository.ts
      JsonContactRepository.ts
      JsonUserRepository.ts
    services/
      authService.ts                     ← login, refresh, logout logic
      seedService.ts                     ← First-boot Admin user seed
    routes/
      adminAuth.ts                       ← /api/admin/auth/*
      adminSubmissions.ts                ← /api/admin/submissions/*
      adminContacts.ts                   ← /api/admin/contacts/*
      adminUsers.ts                      ← /api/admin/users/*
      adminStats.ts                      ← /api/admin/stats
```

---

## Phase 1 — Step-by-Step Execution

### Phase 1A: Storage Foundation + Seed

**Goal:** JSON directory structure + user seed runs on server start.

**Steps:**

1. Create `data/json/dna/questionnaire/` with all subdirectories
2. Add `data/` to `.gitignore` (do not commit user data)
3. Create `server/repositories/interfaces.ts` — define `SubmissionRepository`, `ContactRepository`, `UserRepository` TypeScript interfaces
4. Create `server/repositories/JsonUserRepository.ts`
   - `readUsers()` → read + parse `users/users.json` (return `[]` if not found)
   - `writeUsers(users)` → write array atomically
   - `findByUsername(username)` → case-insensitive lookup
   - `findById(id)`
   - `create(data)` → append + write index
   - `update(id, patch)` → find + patch + write
5. Create `server/services/seedService.ts`
   - On call: check if `users.json` exists and contains any `admin` role user
   - If not: generate UUID, bcrypt hash `000111` (cost 12), write initial Admin user
   - Log: `"[WHI] Admin user seeded. Username: Admin — Change password after first login."`
6. Call `seedService` at the top of `startServer()` in `server.ts`

**Validation checkpoint:**
- Run `npm run dev` → server starts, `users.json` is created with hashed Admin record
- Confirm `passwordHash` is NOT `000111` in plain text

---

### Phase 1B: Auth Backend

**Goal:** Secure login + token system before any data routes are exposed.

**New packages:**
```bash
npm install bcrypt jsonwebtoken cookie-parser
npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/cookie-parser
```

**Steps:**

1. Add to `.env`:
   ```
   JWT_ACCESS_SECRET=<generate: openssl rand -hex 32>
   JWT_REFRESH_SECRET=<generate: openssl rand -hex 32>
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   ```

2. Create `server/services/authService.ts`:
   - `login(username, password)`:
     - Find user by username (case-insensitive)
     - If not found or not active → throw `INVALID_CREDENTIALS`
     - `bcrypt.compare(password, user.passwordHash)` → throw `INVALID_CREDENTIALS` if false (constant-time, no username enum)
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

5. Mount route in `server.ts`: `app.use('/api/admin/auth', adminAuthRouter)`

6. Add `cookie-parser` middleware: `app.use(cookieParser())`

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

### Phase 1D: Submission + Contact Persistence

**Goal:** Every `/api/assess` submission is saved; contact form submissions are saved.

**Steps:**

1. Create `server/repositories/JsonSubmissionRepository.ts`:
   - `create(data)`:
     - Generate `crypto.randomUUID()`
     - Write full JSON to `submissions/{uuid}.json`
     - Append lightweight entry to `_index/submissions.json`
     - Return created submission with `id` + `submittedAt`
   - `findById(id)`:
     - Validate `id` is a valid UUID regex `^[0-9a-f-]{36}$`
     - Read `submissions/{id}.json` → parse → return or null
   - `findAll(opts)`:
     - Read `_index/submissions.json`
     - Apply search filter, date range, sort, pagination
     - Return `{ items, total }`
   - `delete(id)`:
     - Delete `submissions/{id}.json`
     - Remove from `_index/submissions.json`

2. Create `server/repositories/JsonContactRepository.ts`: same pattern for `contacts/`

3. Modify `/api/assess` in `server.ts`:
   - After receiving `DiagnosticResult`, call `submissionRepo.create({ ...formData, ...result, ipAddress })`
   - Include `submissionId` in the JSON response back to the frontend

4. Update `BriefingForm.tsx` to receive and store `submissionId` in state after assessment completes

5. Create `server/routes/adminContacts.ts`:
   ```
   POST /api/admin/contacts    ← (no auth required — public contact form)
   ```
   Wire `handleContactSubmit` in `BriefingForm.tsx` to call this endpoint with `submissionId`

**Validation checkpoint:**
- Submit questionnaire → `data/json/dna/questionnaire/submissions/{uuid}.json` file created
- Submit contact form → `data/json/dna/questionnaire/contacts/{uuid}.json` created
- `_index/submissions.json` grows by one entry per submission
- Restarting the server does not lose any submissions

---

### Phase 1E: Admin API Routes

**Goal:** All CRUD endpoints for the dashboard UI. All protected by `requireAuth`.

**Route inventory:**

```
SUBMISSIONS
  GET    /api/admin/submissions            requireAuth  → list with pagination + search
  GET    /api/admin/submissions/:id        requireAuth  → full submission detail
  DELETE /api/admin/submissions/:id        requireAdmin → hard delete file + index entry

CONTACTS
  GET    /api/admin/contacts               requireAuth  → list with status filter
  GET    /api/admin/contacts/:id           requireAuth  → full contact + linked submission
  PATCH  /api/admin/contacts/:id           requireAuth  → update status, notes, assignedTo

USERS
  GET    /api/admin/users                  requireAdmin → list all staff
  POST   /api/admin/users                  requireAdmin → create new staff user
  GET    /api/admin/users/:id              requireAdmin → single user detail
  PATCH  /api/admin/users/:id              requireAdmin → update name, role, isActive
  DELETE /api/admin/users/:id              requireAdmin → deactivate (set isActive: false, NOT delete)

STATS
  GET    /api/admin/stats                  requireAuth  → { submissionCount, contactCount, avgScore, recentSubmissions[5] }
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
npm install --save-dev @types/react-router-dom
```

**Steps:**

1. Update `src/main.tsx` — wrap `<App />` in `<BrowserRouter>`:
   ```tsx
   <BrowserRouter>
     <Routes>
       <Route path="/admin/*" element={<AdminApp />} />
       <Route path="/*" element={<App />} />
     </Routes>
   </BrowserRouter>
   ```

2. Create `src/admin/context/AuthContext.tsx`:
   - State: `{ user, accessToken, isLoading }`
   - `login(username, password)` → POST `/api/admin/auth/login` → store accessToken in memory
   - `logout()` → POST `/api/admin/auth/logout` → clear state
   - On mount: `GET /api/admin/auth/me` using cookie-based refresh if accessToken missing → silent re-auth

3. Create `src/admin/components/ProtectedRoute.tsx`:
   - If `isLoading` → render spinner
   - If no `user` → `<Navigate to="/admin/login" />`
   - Else → render children

4. Create `src/admin/AdminApp.tsx`:
   ```tsx
   <AuthProvider>
     <Routes>
       <Route path="login" element={<LoginPage />} />
       <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
         <Route index element={<DashboardPage />} />
         <Route path="submissions" element={<SubmissionsPage />} />
         <Route path="submissions/:id" element={<SubmissionDetailPage />} />
         <Route path="contacts" element={<ContactsPage />} />
         <Route path="contacts/:id" element={<ContactDetailPage />} />
         <Route path="users" element={<UsersPage />} />
         <Route path="users/new" element={<UserFormPage />} />
         <Route path="users/:id" element={<UserFormPage />} />
       </Route>
     </Routes>
   </AuthProvider>
   ```

5. **`LoginPage.tsx`**:
   - Username + password form
   - Call `authContext.login()`
   - On success → navigate to `/admin/dashboard`
   - Show error on 401
   - Match WHI dark aesthetic (`#0b0c0f`, amber accent `#bc993c`)

6. **`AdminLayout.tsx`**:
   - Fixed left sidebar with nav: Dashboard, Submissions, Contacts (CRM), Users
   - Header: WHI logo, logged-in user name, Logout button
   - `<Outlet />` for page content
   - Responsive collapse for mobile

7. **`DashboardPage.tsx`**:
   - Stat cards: Total Submissions, New Contacts, Avg Overall Score, Active Staff
   - Recent Submissions table (last 5)
   - Data from `GET /api/admin/stats`

8. **`SubmissionsPage.tsx`**:
   - Table: Business Name | Industry | Location | Overall Score | Submitted At
   - Search bar (client-side filter on index data)
   - Score color coding (red < 5, amber 5–7, green > 7)
   - Click row → navigate to `/admin/submissions/:id`

9. **`SubmissionDetailPage.tsx`**:
   - Full submission data display
   - Radar chart (reuse `RadarChart` component)
   - 5-pillar scores
   - 90-day combat plan phases
   - Executive summary
   - Linked contact info (if exists)
   - Delete button (admin only)

10. **`ContactsPage.tsx`**:
    - Status column board or table: `new` | `contacted` | `qualified` | `closed`
    - Filter by status
    - Assign to staff dropdown

11. **`ContactDetailPage.tsx`**:
    - Name, email, phone
    - Status dropdown (PATCH on change)
    - Notes textarea (PATCH on save)
    - Assign to staff
    - Link to associated submission

12. **`UsersPage.tsx`** (admin only):
    - Table: Name | Username | Role | Active | Created
    - Create New User button
    - Toggle active/inactive

13. **`UserFormPage.tsx`** (admin only):
    - Create: Name, Username, Email, Role, Password
    - Edit: Name, Role, isActive (no password reset in Phase 1)

14. **`src/admin/services/api.ts`**:
    - Typed fetch wrapper that injects `Authorization: Bearer ${accessToken}` header
    - Handles 401 → attempt refresh → retry once → redirect to login

---

## Phase 2 — PostgreSQL Migration (Future)

When the business outgrows JSON files (>10,000 submissions, concurrent staff, reporting needs):

1. Add `prisma` + PostgreSQL Docker service
2. Create Prisma schema mirroring the JSON data shapes exactly
3. Implement `PgSubmissionRepository`, `PgContactRepository`, `PgUserRepository`
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
# Runtime
npm install bcrypt jsonwebtoken cookie-parser express-rate-limit express-validator react-router-dom

# Types
npm install --save-dev @types/bcrypt @types/jsonwebtoken @types/cookie-parser @types/react-router-dom
```

### No new packages needed for storage
`fs/promises` and `crypto.randomUUID()` are Node.js built-ins (Node 16+). Zero new dependencies for JSON file operations.

### Full `package.json` dependencies after Phase 1

```json
"dependencies": {
  "@google/genai": "^2.4.0",
  "@tailwindcss/vite": "^4.1.14",
  "@vitejs/plugin-react": "^5.0.4",
  "bcrypt": "^5.1.1",
  "cookie-parser": "^1.4.7",
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
}
```

---

## Environment Variables

Add to `.env` (never commit to git):

```dotenv
# Existing
GEMINI_API_KEY=your_key_here

# New — Auth
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# New — App
NODE_ENV=development
DATA_PATH=./data/json/dna/questionnaire
```

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

- [ ] Server starts cold → `users.json` created → Admin user seeded with hashed password
- [ ] `POST /api/admin/auth/login` `{ username: "Admin", password: "000111" }` → 200 + tokens
- [ ] Wrong credentials → 401 (no timing difference between bad username vs bad password)
- [ ] Submit questionnaire → JSON file written to `data/json/dna/questionnaire/submissions/`
- [ ] Submit contact form → JSON file written to `data/json/dna/questionnaire/contacts/`
- [ ] `GET /api/admin/submissions` without auth → 401
- [ ] `GET /api/admin/submissions` with valid token → 200 + list
- [ ] Navigate to `/admin` → redirect to `/admin/login` (unauthenticated)
- [ ] Login with Admin/000111 → redirect to `/admin/dashboard` → stats visible
- [ ] View submissions list → click entry → full detail page renders with radar chart
- [ ] View contacts → change status → PATCH persists to JSON file
- [ ] Admin can create a new staff user → appears in users list
- [ ] Non-admin staff cannot access `/admin/users`
- [ ] Rate limiter returns 429 after 10 rapid login attempts
- [ ] Free-text with `<script>` or prompt injection patterns → sanitized, not executed
- [ ] Server restart → all previously submitted data still accessible

---

*Plan prepared May 27, 2026 — WHI Agency alpha branch*
