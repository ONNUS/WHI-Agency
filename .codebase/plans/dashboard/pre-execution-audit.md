# WHI Agency — Pre-Execution Audit
## Final Readiness Check Before Code Implementation

**Audit Date:** May 27, 2026  
**Auditor:** GitHub Copilot  
**Files Cross-Referenced:**
- `plan.md` (the execution plan)
- `tech-gap-audit.md` (30 prior findings)
- `wireframes.md` (approved screens)
- `server.ts` (existing server)
- `src/types.ts` (existing types)
- `src/components/BriefingForm.tsx` (existing form)
- `package.json` (actual dependencies)
- `tsconfig.json` (compiler config)
- `vite.config.ts` (build config)
- `Dockerfile` (base image)

---

## Verdict

| Category | Status |
|---|---|
| Security | ✅ Cleared (after plan fixes below) |
| Build & Deps | ⚠️ 3 fixes required before install |
| Data Layer | ✅ Cleared (after plan fixes below) |
| Auth System | ✅ Cleared |
| API Routes | ⚠️ 2 naming corrections required |
| React SPA | ⚠️ 3 fixes required |
| Terminology Alignment | ⚠️ Full rename required (wireframes vs plan) |
| Docker / Node Compat | ✅ Node 22 on Alpine confirmed — with bcryptjs |

**READY TO EXECUTE: YES — after the plan corrections below are applied.**

---

## Section 1: Blockers Caught (Will Cause Failures If Not Fixed)

### B1 — `bcrypt` (native) on `node:22-alpine` Docker = Build Failure

**Where:** `plan.md` → Dependencies Summary → Phase 1B  
**What:** The plan's bottom-of-document dependency summary still lists `bcrypt` (not `bcryptjs`) both in the `npm install` command and in the `package.json` template:
```
"bcrypt": "^5.1.1"     ← WRONG
```
The Dockerfile base image is `node:22-alpine`. Alpine Linux does not include `python3`, `make`, or `gcc` by default. `bcrypt` requires `node-gyp` (native compilation). The `npm install` step in the Docker build WILL fail.

**Tech-gap-audit finding 4.4** flagged this and prescribed `bcryptjs`. The fix was applied to Phase 1B narrative text but NOT to the final dependencies summary.

**Fix:** Use `bcryptjs` everywhere in the plan. `@types/bcryptjs` for the type definition. Zero API changes — the API is identical to `bcrypt`.

---

### B2 — `cors` Package Missing from Final Dependency List

**Where:** `plan.md` → Dependencies Summary  
**What:** The final `npm install` command and `package.json` template do not include `cors` or `@types/cors`. Tech-gap-audit finding 1.4 mandates it. Without CORS headers:
- The admin SPA will get CORS errors in production
- Cross-origin requests from the browser to the API will be blocked

**Fix:** Add `cors` and `@types/cors` to the install command and the `package.json` template.

---

### B3 — Terminology Mismatch: `submissions`/`contacts` vs. `briefings`/`prospects`

**Where:** `plan.md` everywhere vs. approved `wireframes.md`  
**What:** The approved wireframes define the admin UI with:
- `/admin/briefings` — Screen 03 & 04 ("RECONNAISSANCE BRIEFINGS")
- `/admin/prospects` — Screen 05 & 06 ("PROSPECT INTELLIGENCE")
- Nav labels: `Dashboard · Briefings · Prospects · Staff`
- Data path reference: `briefings/` and `prospects/` directories

The plan uses `submissions` and `contacts` throughout all phases, routes, component names, and file paths. If coded from the plan, every URL will be wrong relative to the wireframes.

**Full rename required:**

| Plan says | Should be | Affects |
|---|---|---|
| `submissions/` (data dir) | `briefings/` | Phase 1A file structure |
| `contacts/` (data dir) | `prospects/` | Phase 1A file structure |
| `_index/submissions.json` | `_index/briefings.json` | Phase 1A |
| `/api/admin/submissions/*` | `/api/admin/briefings/*` | Phase 1E routes |
| `/api/admin/contacts/*` (admin) | `/api/admin/prospects/*` | Phase 1E routes |
| `JsonSubmissionRepository` | `JsonBriefingRepository` | Phase 1D |
| `JsonContactRepository` | `JsonProspectRepository` | Phase 1D |
| `SubmissionRepository` (interface) | `BriefingRepository` | Phase 1D |
| `ContactRepository` (interface) | `ProspectRepository` | Phase 1D |
| `adminSubmissions.ts` (route file) | `adminBriefings.ts` | Phase 1E |
| `adminContacts.ts` (route file) | `adminProspects.ts` | Phase 1E |
| `SubmissionsPage.tsx` | `BriefingsPage.tsx` | Phase 1F |
| `SubmissionDetailPage.tsx` | `BriefingDetailPage.tsx` | Phase 1F |
| `ContactsPage.tsx` | `ProspectsPage.tsx` | Phase 1F |
| `ContactDetailPage.tsx` | `ProspectDetailPage.tsx` | Phase 1F |
| `SubmissionTable.tsx` | `BriefingTable.tsx` | Phase 1F components |
| `ContactBoard.tsx` | `ProspectBoard.tsx` | Phase 1F components |
| `submissions` route in `AdminApp.tsx` | `briefings` | Phase 1F |
| `contacts` route in `AdminApp.tsx` | `prospects` | Phase 1F |
| `AdminLayout` nav: "Submissions" | "Briefings" | Phase 1F |
| `AdminLayout` nav: "Contacts (CRM)" | "Prospects" | Phase 1F |
| `AdminLayout` nav: "Users" | "Staff" | Phase 1F |

> Note: The one exception is the **public contact form endpoint**. `POST /api/admin/contacts` (no auth) should remain accessible from `BriefingForm.tsx` — this can be renamed to `POST /api/prospects` (moved out of `/api/admin/` namespace entirely, since it's public).

---

### B4 — No `.env` File Exists + Plan Doesn't Create It

**Where:** Project root — no `.env` found  
**What:** `server.ts` already calls `dotenv.config()`. The new JWT auth requires `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`, and `NODE_ENV`. If these are missing, `jsonwebtoken` operations will throw at runtime.

**Fix:** Phase 1B must include an explicit step: create `.env` from the template. Generate secrets at that step. The `.env.example` template should be committed; `.env` itself stays gitignored.

---

### B5 — Data Directories Not Auto-Created on Cold Start

**Where:** `plan.md` Phase 1A  
**What:** The plan says "Create `data/json/dna/questionnaire/` with all subdirectories" as a manual step. But:
1. Docker runner stage starts with no `/app/data` directory (only `dist/` is copied from the builder)
2. On a fresh clone, there are no data directories
3. The first file write to `briefings/` or `prospects/` will throw `ENOENT`

**Fix:** The `seedService.ts` and each repository must call `fs.mkdir(dirPath, { recursive: true })` before any read/write operation. All repository constructors should `ensureDir()` on initialization. The `data/` directory is gitignored so it must be created at runtime, always.

---

### B6 — Change-Password Page Missing from `AdminApp.tsx` Route Config

**Where:** `plan.md` Phase 1F, step 4  
**What:** The route config shown in the plan is:
```tsx
<Routes>
  <Route path="login" element={<LoginPage />} />
  <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
    ...all pages...
  </Route>
</Routes>
```
There is no route for `/admin/account/change-password`. This page is:
- Shown in wireframes (Screen 09)
- Flagged as CRITICAL in tech-gap-audit (finding 3.1)
- Required for the forced password change flow on first login

**Fix:** Add the route and the `ProtectedRoute` must intercept `requirePasswordChange: true` to redirect there before allowing access to any other admin page.

---

### B7 — `ProtectedRoute` Logic Incomplete

**Where:** `plan.md` Phase 1F, step 3  
**What:** The `ProtectedRoute` description only says: "If no user → Navigate to login." It does not specify:
1. If `user.requirePasswordChange === true` → redirect to `/admin/account/change-password` (not dashboard)
2. If `adminOnly` prop is present and `user.role !== 'admin'` → render 403 screen (Screen 11 in wireframes)

**Fix:** `ProtectedRoute` needs two props: `adminOnly?: boolean` and must check `requirePasswordChange` before rendering children.

---

### B8 — `adminStats` Router Not Explicitly Mounted in `server.ts`

**Where:** `plan.md` Phase 1E  
**What:** The plan defines `GET /api/admin/stats` in the stats route file but does NOT include an explicit step to `app.use('/api/admin/stats', adminStatsRouter)` in `server.ts`. Every other router has an explicit mount step. Without this, the dashboard stats call returns 404.

**Fix:** Add explicit mount step for `adminStats` in Phase 1E or Phase 1B (where other mounts are set up).

---

## Section 2: Corrections Required (Plan-Level Fixes)

### C1 — `@types/react-router-dom` Is Not Needed (Causes Type Conflicts)

**Where:** `plan.md` Dependencies Summary  
**What:** Since `react-router-dom` v6, TypeScript types are bundled **inside** the package itself. Installing `@types/react-router-dom` separately causes duplicate type definitions and potential TS errors.

**Fix:** Remove `@types/react-router-dom` from the `devDependencies` install command. Only install `react-router-dom`.

---

### C2 — Public Prospect Form Endpoint Should Not Live Under `/api/admin/`

**Where:** `plan.md` Phase 1D  
**What:** `POST /api/admin/contacts` (no auth required) is the public-facing endpoint that `BriefingForm.tsx` calls after the user sees their assessment results. Having a no-auth endpoint under `/api/admin/` is architecturally confusing and fragile — any future blanket auth middleware on `/api/admin/*` would accidentally break it.

**Fix:** Move this to `POST /api/prospects` (public namespace). Wire `BriefingForm.tsx` to `/api/prospects` instead. The admin read/update routes for prospects stay under `/api/admin/prospects/*` (protected).

---

### C3 — `isGeminiLive` Field Not in `DiagnosticResult` Type

**Where:** `src/types.ts` + `server.ts`  
**What:** The `/api/assess` endpoint returns `isGeminiLive: true/false` in its response, but `DiagnosticResult` in `types.ts` doesn't declare this field. When Phase 1D adds `submissionId` to the response, `types.ts` must be updated. Both fields should be added at the same time.

**Fix:** In Phase 1D, extend `DiagnosticResult` with:
```typescript
isGeminiLive?: boolean;
submissionId?: string;
```

---

### C4 — `DATA_PATH` Env Var Used Inconsistently

**Where:** `plan.md` Environment Variables section  
**What:** The plan defines `DATA_PATH=./data/json/dna/questionnaire` as an env var but Phase 1A and the repository implementations use hardcoded relative paths like `data/json/dna/questionnaire/submissions`. The implementation must consistently read the base path from `process.env.DATA_PATH` (with a sensible default) so it works in all environments.

---

### C5 — `AdminApp.tsx` Must Have a Redirect from Index Route

**Where:** `plan.md` Phase 1F  
**What:** When a user navigates to `/admin` (no sub-path), the route should redirect to `/admin/dashboard`. The plan's route config does not include an index redirect.

**Fix:** Add `<Route index element={<Navigate to="dashboard" replace />} />` at the top of the `AdminApp` routes.

---

## Section 3: Confirmations (Things That Are Correct)

### ✅ Node 22 on Alpine — `crypto.randomUUID()` Available
Docker base `node:22-alpine` — well above the Node 18 minimum. `crypto.randomUUID()` is natively available, no polyfill needed.

### ✅ `tsconfig.json` Has `"lib": ["ES2022", "DOM"]`
Confirmed in the actual file. `crypto.randomUUID()` type defs are covered. `fs/promises` covered by `@types/node` (already in devDependencies).

### ✅ `esbuild` Bundle Will Correctly Include `server/` Files
First-party `server/` imports are bundled automatically. Only `node_modules` are externalized via `--packages=external`. Verified correct.

### ✅ `moduleResolution: "bundler"` Does Not Affect `tsx` Dev Runtime
`tsx` uses its own transform (esbuild under the hood). The `tsconfig.json` `moduleResolution: "bundler"` only affects `tsc --noEmit` (the lint script). Dev server runs correctly with either resolution mode.

### ✅ `express-validator` v7 Compatible with Express 4.21.2
Confirmed. No version conflicts.

### ✅ React Router v6 `/*` Wildcard Won't Break `App.tsx`
The public `App.tsx` uses `scrollToSection()` via `document.getElementById()` — no `<Link>` components or route dependencies. The `path="/*"` wildcard in `main.tsx` correctly catches all non-admin routes. The scroll-based navigation is unaffected.

### ✅ Atomic Write Pattern for `users.json` — Design Is Sound
`write to users.tmp.json → fs.rename() to users.json` is atomic on the same filesystem. Docker containers run on a single filesystem partition. This is safe.

### ✅ `reconcileIndex()` on Startup — Correct Crash Recovery Pattern
Writing the full briefing file FIRST, then appending to the index, means a crash between the two leaves the data safe. `reconcileIndex()` on startup scans actual files and rebuilds the index. Sound design.

### ✅ Repository Pattern — Clean Migration Interface
The proposed interfaces use only primitive/DTO types. No JSON-file specifics (file paths, inodes) leak into the interface contract. PostgreSQL migration remains a true drop-in swap.

### ✅ JWT Access in Memory + Refresh in `httpOnly` Cookie
Industry-standard XSS/CSRF balance. Access token in JS memory (gone on tab close), refresh token in httpOnly cookie (XSS-proof). `sameSite: 'strict'` with `/api/admin/auth` path-scoping is correct.

### ✅ Prompt Injection Sanitization Design Is Sound
The `sanitize()` function stripping `<>`, backticks, `[INST]`, `###`, plus `express-validator` max 2000 char limit, prevents the main injection vectors against the Gemini prompt.

---

## Section 4: Summary of All Changes Required in `plan.md`

| # | Type | Change |
|---|---|---|
| B1 | BLOCKER | Replace `bcrypt` → `bcryptjs` + `@types/bcryptjs` throughout |
| B2 | BLOCKER | Add `cors` + `@types/cors` to dependencies |
| B3 | BLOCKER | Full terminology rename: `submissions`→`briefings`, `contacts`→`prospects` |
| B4 | BLOCKER | Add Phase 1B step: create `.env` from template with generated secrets |
| B5 | BLOCKER | Repositories + seed service must `fs.mkdir({ recursive: true })` on init |
| B6 | BLOCKER | Add `/admin/account/change-password` route to `AdminApp.tsx` config |
| B7 | BLOCKER | `ProtectedRoute` must handle `requirePasswordChange` + `adminOnly` |
| B8 | BLOCKER | Add explicit `adminStats` router mount step in `server.ts` |
| C1 | FIX | Remove `@types/react-router-dom` (types bundled in v6) |
| C2 | FIX | Move public prospect form to `POST /api/prospects` (not under `/api/admin/`) |
| C3 | FIX | Add `isGeminiLive?: boolean` + `submissionId?: string` to `DiagnosticResult` |
| C4 | FIX | All repos read base path from `process.env.DATA_PATH` with default |
| C5 | FIX | Add index redirect `<Navigate to="dashboard" />` in `AdminApp` routes |

---

## Section 5: Corrected Final Dependency List

```bash
# Runtime — corrected
npm install bcryptjs jsonwebtoken cookie-parser cors express-rate-limit express-validator react-router-dom

# Dev types — corrected
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/cors
```

> Note: `@types/react-router-dom` REMOVED — types are bundled in react-router-dom v6+.  
> Note: `bcrypt` REPLACED with `bcryptjs` — identical API, pure JS, no native build.  
> Note: `cors` ADDED — CORS headers required for browser ↔ API communication.

---

## Section 6: Corrected File Structure (Post-Rename)

```
data/json/dna/questionnaire/
  briefings/           ← was: submissions/
  prospects/           ← was: contacts/
  users/
    users.json
  _index/
    briefings.json     ← was: submissions.json
    prospects.json     ← was: contacts.json

src/admin/
  pages/
    LoginPage.tsx
    ChangePasswordPage.tsx     ← NEW (was missing)
    DashboardPage.tsx
    BriefingsPage.tsx          ← was: SubmissionsPage.tsx
    BriefingDetailPage.tsx     ← was: SubmissionDetailPage.tsx
    ProspectsPage.tsx          ← was: ContactsPage.tsx
    ProspectDetailPage.tsx     ← was: ContactDetailPage.tsx
    StaffPage.tsx              ← was: UsersPage.tsx
    StaffFormPage.tsx          ← was: UserFormPage.tsx
  components/
    BriefingTable.tsx          ← was: SubmissionTable.tsx
    ProspectBoard.tsx          ← was: ContactBoard.tsx
    ...

server/
  repositories/
    JsonBriefingRepository.ts  ← was: JsonSubmissionRepository.ts
    JsonProspectRepository.ts  ← was: JsonContactRepository.ts
    JsonUserRepository.ts      ← unchanged
  routes/
    adminBriefings.ts          ← was: adminSubmissions.ts
    adminProspects.ts          ← was: adminContacts.ts
    adminUsers.ts              ← unchanged
    adminStats.ts              ← unchanged
```

---

## Section 7: Corrected API Route Map

```
PUBLIC (no auth)
  POST /api/assess            → existing, add persistence in Phase 1D
  POST /api/prospects         → NEW public endpoint (was: POST /api/admin/contacts)

ADMIN AUTH
  POST /api/admin/auth/login
  POST /api/admin/auth/refresh
  POST /api/admin/auth/logout
  GET  /api/admin/auth/me

ADMIN BRIEFINGS (all staff)
  GET    /api/admin/briefings          ← was: /api/admin/submissions
  GET    /api/admin/briefings/:id      ← was: /api/admin/submissions/:id
  DELETE /api/admin/briefings/:id      ← was: /api/admin/submissions/:id (admin only)

ADMIN PROSPECTS (all staff)
  GET    /api/admin/prospects
  GET    /api/admin/prospects/:id
  PATCH  /api/admin/prospects/:id

ADMIN USERS/STAFF (admin only)
  GET    /api/admin/users
  POST   /api/admin/users
  GET    /api/admin/users/:id
  PATCH  /api/admin/users/:id
  POST   /api/admin/users/me/password

ADMIN STATS (all staff)
  GET    /api/admin/stats
```

---

## Section 8: Corrected `AdminApp.tsx` Route Config

```tsx
<AuthProvider>
  <Routes>
    {/* Public admin routes */}
    <Route path="login" element={<LoginPage />} />
    <Route path="account/change-password"
           element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />

    {/* Protected admin routes */}
    <Route element={<ProtectedRoute requireChangePassword><AdminLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="briefings" element={<BriefingsPage />} />
      <Route path="briefings/:id" element={<BriefingDetailPage />} />
      <Route path="prospects" element={<ProspectsPage />} />
      <Route path="prospects/:id" element={<ProspectDetailPage />} />

      {/* Admin-only routes */}
      <Route element={<AdminOnlyRoute />}>
        <Route path="staff" element={<StaffPage />} />
        <Route path="staff/new" element={<StaffFormPage />} />
        <Route path="staff/:id" element={<StaffFormPage />} />
      </Route>
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="dashboard" replace />} />
  </Routes>
</AuthProvider>
```

---

*Pre-execution audit complete — May 27, 2026*  
*All blockers addressed. Plan.md must be updated before execution begins.*
