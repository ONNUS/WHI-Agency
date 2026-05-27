# WHI Agency — Dashboard Plan: Tech Gap Audit
## Systematic Review for Gaps, Risks, and Blind Spots

**Audit Date:** May 27, 2026  
**Plan Under Review:** `.codebase/plans/dashboard/plan.md`  
**Auditor:** GitHub Copilot (automated plan review)

---

## Audit Methodology

This document reviews the Phase 1 execution plan against six dimensions:
1. **Security** — auth, data protection, injection, exposure
2. **Stability** — error handling, crash resistance, data integrity
3. **Completeness** — missing steps, unspecified behaviors, edge cases
4. **Tech Compatibility** — version conflicts, Node.js built-in availability, package choices
5. **Migration Readiness** — whether the JSON→PostgreSQL path is actually clean
6. **UX / Functional Gaps** — admin UI edge cases and missing flows

Each finding is rated:
- 🔴 **CRITICAL** — will break the build or cause data loss / security breach
- 🟡 **WARNING** — may cause issues under certain conditions, should be addressed
- 🟢 **NOTE** — improvement or clarification, low urgency

---

## 1. Security Audit

### 1.1 🟡 Initial Password Is Hardcoded and Weak
**Location:** Phase 1A, seed step  
**Issue:** `000111` is an extremely weak password and is documented in a plaintext plan file. If committed to git, it becomes a permanent credential leak.  
**Resolution:**
- Move the seed password to `.env` as `ADMIN_SEED_PASSWORD=000111`
- Seed service reads from `process.env.ADMIN_SEED_PASSWORD`
- Plan already notes "Change password immediately after first login" — enforce this by flagging `requirePasswordChange: true` in the seeded user record and redirecting to a change-password screen before accessing the dashboard
- Add a change-password endpoint: `POST /api/admin/users/me/password`

---

### 1.2 🔴 Refresh Token Storage in `users.json` Creates a Race Condition
**Location:** Phase 1B, auth design  
**Issue:** Multiple concurrent refresh requests could read the stale `users.json` before the first write completes, issuing duplicate valid tokens. With `fs/promises` (not atomic), two near-simultaneous refreshes could both succeed.  
**Resolution:**
- Implement a simple in-memory write lock (async mutex) around `users.json` reads/writes
- Use `fs.rename()` (atomic on same filesystem) as the final write step: write to `users.tmp.json` first, then rename to `users.json`
- Plan the `JsonUserRepository.writeUsers()` method to use this pattern explicitly

---

### 1.3 🟡 `httpOnly` Cookie Requires `sameSite` and `secure` Flags
**Location:** Phase 1B, auth route  
**Issue:** The plan says "set httpOnly refresh cookie" but doesn't specify `sameSite` or `secure`. Without `sameSite: 'strict'` (or `lax`), CSRF is possible on older browsers. Without `secure: true` in production, the cookie transmits over HTTP.  
**Resolution:** Set cookie options explicitly:
```typescript
res.cookie('refresh_token', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/admin/auth',           // scope to auth path only
});
```

---

### 1.4 🟡 CORS Not Specified for Admin Routes
**Location:** Phase 1E, admin API routes  
**Issue:** The plan does not specify CORS configuration. In production, the admin API should only accept requests from the admin dashboard origin. Without CORS config, cross-origin requests from arbitrary domains could reach the API.  
**Resolution:**
- Install `cors` package
- Configure: allow only `http://localhost:3000` in dev, `https://yourdomain.com` in production
- Apply a stricter CORS config to `/api/admin/*` routes vs. the looser config for `/api/assess`

---

### 1.5 🟡 UUID Validation Is Mentioned But Not Fully Specified
**Location:** Phase 1D + 1E  
**Issue:** Plan states "validate UUID format before file I/O" but doesn't define the exact regex or where the validation lives (middleware vs. route handler).  
**Resolution:** Centralize UUID validation in a reusable middleware/helper:
```typescript
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}
```
Apply this in all `/:id` route handlers before any `path.join()` call.

---

### 1.6 🟡 Path Traversal Possible if UUID Validation Is Skipped
**Location:** Phase 1D, `JsonSubmissionRepository.findById()`  
**Issue:** If an attacker sends `id = "../../users/users"`, and UUID validation is not strictly enforced, `path.join(basePath, id + '.json')` could escape the data directory.  
**Resolution:**
- Always validate UUID regex BEFORE constructing file paths
- Additionally, resolve the final path and assert it starts with the expected base directory:
```typescript
const filePath = path.resolve(this.basePath, `${id}.json`);
if (!filePath.startsWith(path.resolve(this.basePath))) {
  throw new Error('Path traversal attempt detected');
}
```

---

### 1.7 🟢 bcrypt Cost Factor Should Be in Config
**Location:** Phase 1A, seed + Phase 1B, auth  
**Issue:** Cost factor 12 is hardcoded. On slower hardware it may be fine; on faster machines it may be too low in future.  
**Resolution:** Read from env: `parseInt(process.env.BCRYPT_ROUNDS || '12', 10)`

---

## 2. Stability Audit

### 2.1 🔴 Index File Corruption on Partial Write
**Location:** Phase 1D, `JsonSubmissionRepository.create()`  
**Issue:** If the process crashes after writing `submissions/{uuid}.json` but before writing `_index/submissions.json`, the index is stale. Conversely, if the index is written first and the full file write fails, the index points to a non-existent file.  
**Resolution:**
- Write the full submission file FIRST
- Only append to the index AFTER the full file write succeeds
- On server start, run a `reconcileIndex()` function that scans the `submissions/` directory and rebuilds `_index/submissions.json` from actual files present
- Call `reconcileIndex()` in `startServer()` before routes are mounted

---

### 2.2 🟡 `_index/submissions.json` Unbounded Growth
**Location:** Phase 1D, index design  
**Issue:** The index file grows indefinitely. At 10,000+ entries it becomes a performance bottleneck — reading and re-writing the full array for every submission.  
**Resolution:** This is acceptable for Phase 1 (the system is designed for low volume). Document a threshold: **if submission count exceeds 5,000, migrate to PostgreSQL.** Add a warning log on server start if index length > 5,000.

---

### 2.3 🟡 No Locking on Concurrent Writes to `_index` Files
**Location:** Phase 1D  
**Issue:** Two simultaneous form submissions could both read `_index/submissions.json`, both append, and the second write overwrites the first's addition.  
**Resolution:**
- Implement a per-file async mutex (simple Promise queue) for index file writes
- This is Phase 1 acceptable risk if traffic is low, but should be documented
- Add a comment in `JsonSubmissionRepository.create()`: `// TODO: Replace with DB atomic insert for high-concurrency (Phase 2)`

---

### 2.4 🟡 `users.json` Missing on First Read Race
**Location:** Phase 1A, Phase 1B  
**Issue:** If multiple requests arrive before `seedService` finishes writing `users.json`, `readUsers()` returns `[]` for all of them. If login is attempted during this window, it silently fails.  
**Resolution:**
- `startServer()` must `await seedService.seed()` before calling `app.listen()`
- This is already implied in the plan but must be stated explicitly as `await`

---

### 2.5 🟢 No Error Boundary for Admin UI Crashes
**Location:** Phase 1F, React admin SPA  
**Issue:** If a data fetch fails or a component throws, the entire admin SPA crashes with a white screen.  
**Resolution:** Add a top-level `<ErrorBoundary>` component in `AdminApp.tsx` that renders a "Something went wrong" screen with a retry button. React 19 has native error boundary support with `use()`.

---

## 3. Completeness Audit

### 3.1 🔴 Change Password Flow Is Missing
**Location:** Phase 1F, User flows  
**Issue:** The plan includes user creation and editing (name, role, isActive) but has no mechanism for a user to change their own password. The seed Admin uses `000111` which must be changed.  
**Resolution:** Add:
- `POST /api/admin/users/me/password` — takes `{ currentPassword, newPassword }`, validates, bcrypt hashes, updates
- `ChangePasswordPage.tsx` or a modal in the dashboard profile menu
- Force redirect to change-password page if `user.requirePasswordChange === true`

---

### 3.2 🟡 Contact Form in `BriefingForm.tsx` Needs `submissionId` Threading
**Location:** Phase 1D  
**Issue:** The plan says the frontend stores `submissionId` in state after assessment, then uses it in the contact form submit. However, `BriefingForm.tsx` currently calls `onDiagnosticComplete(result)` which passes results up to `App.tsx`. The `submissionId` from the API response is not part of the `DiagnosticResult` type.  
**Resolution:**
- Extend `DiagnosticResult` type to include optional `submissionId?: string`
- The API response already returns `submissionId` after Phase 1D change
- `BriefingForm.tsx` can read it from the result and store locally for the contact form

---

### 3.3 🟡 Admin User Cannot Reset Another User's Password
**Location:** Phase 1E, Users API  
**Issue:** The plan defines `PATCH /api/admin/users/:id` for updating name/role/isActive but doesn't include password reset for other users. Admin needs to be able to set a temporary password for a locked-out staff member.  
**Resolution:** Add optional `password` field to the admin user PATCH endpoint (admin only). If `password` is present, bcrypt hash and update. Trigger `requirePasswordChange: true` on the target user.

---

### 3.4 🟡 No Pagination for Contacts List
**Location:** Phase 1E  
**Issue:** Submissions list has "pagination" mentioned but contacts list does not. If contacts grow, reading and returning all of them is slow.  
**Resolution:** Apply the same `ListOptions` pagination pattern to contact list: `{ page, pageSize, status?, search? }`

---

### 3.5 🟢 No Empty State Handling in UI
**Location:** Phase 1F  
**Issue:** On first login with zero submissions, tables will be empty. If empty state is not handled, components may crash on `undefined` or render nothing with no explanation.  
**Resolution:** All table/list components should handle `items.length === 0` with an explicit empty state message.

---

### 3.6 🟢 Stats Endpoint Needs Definition
**Location:** Phase 1E  
**Issue:** The plan says `GET /api/admin/stats` returns `{ submissionCount, contactCount, avgScore, recentSubmissions[5] }` but doesn't specify if `avgScore` is all-time or rolling 30 days.  
**Resolution:** Define clearly: `avgScore` = average `overallScore` across all submissions. Add `recentContacts[5]` alongside `recentSubmissions[5]` for the dashboard.

---

## 4. Tech Compatibility Audit

### 4.1 🟢 `crypto.randomUUID()` Requires Node 16.7+
**Location:** Throughout  
**Issue:** The plan uses `crypto.randomUUID()` as a built-in. This requires Node 16.7+ (not just 16.0).  
**Resolution:** Verify the Docker base image / CI node version. Add to `package.json` engines field:
```json
"engines": { "node": ">=18.0.0" }
```
Node 18 is the safest minimum (LTS) and guarantees `crypto.randomUUID()` availability.

---

### 4.2 🟡 `react-router-dom` v6 Conflicts with Current Routing
**Location:** Phase 1F, `main.tsx`  
**Issue:** The current `App.tsx` uses no router — it's a simple scroll-based SPA. Wrapping `main.tsx` with `<BrowserRouter>` and adding `<Routes>` will change how all existing navigation works. Scroll-based `scrollToSection()` calls in `App.tsx` are fine, but all `<a href>` links or any future routing changes must be aware of the router context.  
**Resolution:**
- Use `path="/*"` wildcard route for the public `<App />` — this will catch everything not starting with `/admin`
- Test that the public landing page still renders correctly after router is added
- Add `<Route path="/" element={<App />} />` as fallback

---

### 4.3 🟢 `express-validator` v7 Requires Express 4+
**Location:** Phase 1C  
**Issue:** Minor — `express-validator` v7 requires Express 4+. Current stack uses Express 4.21.2 — fully compatible. No action needed, just confirming.

---

### 4.4 🟢 `bcrypt` vs `bcryptjs` — Native vs. Pure JS
**Location:** Phase 1B  
**Issue:** `bcrypt` requires native bindings (node-gyp). In some Docker/CI environments, this can fail to build if `python3` or build tools are not available.  
**Resolution:** Use `bcryptjs` (pure JavaScript, zero native deps) as a drop-in replacement for `bcrypt`. The API is identical. Slightly slower (~20%) but fully cross-platform:
```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```
Update all `import bcrypt from 'bcrypt'` to `import bcrypt from 'bcryptjs'`.

---

### 4.5 🟡 `esbuild` Bundle for `server.ts` Must Include New Files
**Location:** `package.json` build script  
**Issue:** The current build script is:
```
esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs
```
`--packages=external` means all `node_modules` are excluded from the bundle (correct). However, the new `server/` directory files (repositories, services, routes, middleware) are first-party code and WILL be bundled automatically since they are imported by `server.ts`. This is correct behavior — no change needed.  
**Confirmation needed:** After adding all new server files, run `npm run build` and confirm `dist/server.cjs` is generated without errors.

---

### 4.6 🟢 TypeScript Strict Mode Compatibility
**Location:** `tsconfig.json`  
**Issue:** New files use `crypto.randomUUID()`, `fs/promises`, and JWT types. Confirm `tsconfig.json` includes `"lib": ["ES2022"]` or higher to access `crypto.randomUUID()` type definitions.  
**Resolution:** Check `tsconfig.json` — if `lib` is not set, add `"lib": ["ES2022", "DOM"]`.

---

## 5. Migration Readiness Audit

### 5.1 🟢 Repository Interfaces Are Well-Defined
**Finding:** The Repository pattern is correctly specified. `SubmissionRepository`, `ContactRepository`, and `UserRepository` interfaces, if properly typed, make the PostgreSQL migration a true drop-in swap.  
**Confirm in implementation:** Interfaces must use only primitive types and defined DTOs — no JSON-file-specific types (like file paths) should leak into the interface contract.

---

### 5.2 🟡 `ListOptions` Type Must Be Database-Agnostic
**Location:** Repository interfaces  
**Issue:** If `ListOptions` contains JSON-file-specific fields (like `sortByFileDate`), the interface is no longer clean for PostgreSQL.  
**Resolution:** Define `ListOptions` generically:
```typescript
interface ListOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'submittedAt' | 'overallScore' | 'businessName';
  sortOrder?: 'asc' | 'desc';
  status?: string;           // for contacts
  dateFrom?: string;         // ISO8601
  dateTo?: string;           // ISO8601
}
```
Both JSON and PostgreSQL implementations can satisfy these options.

---

### 5.3 🟢 Index File Is Migration Bloat
**Finding:** The `_index/` files are a JSON-specific optimization. PostgreSQL doesn't need them. The migration script will need to ignore index files and only import the actual entity files. Document this in the migration checklist.

---

## 6. UX / Functional Gaps Audit

### 6.1 🟡 No Session Timeout Warning in Admin UI
**Location:** Phase 1F  
**Issue:** Access tokens expire in 15 minutes. If an admin is typing a long note when the token expires, the next action silently 401s and they may lose their work.  
**Resolution:**
- The `api.ts` service layer should catch 401, attempt a silent refresh, and retry
- If refresh also fails (token expired/revoked), redirect to login with `?reason=session_expired`
- Show a toast/banner: "Your session expired. Please log in again."

---

### 6.2 🟡 No Feedback When Contact Status Is Updated
**Location:** Phase 1F, `ContactDetailPage.tsx`  
**Issue:** When a staff member changes a contact's status, there's no specified success/error feedback in the UI.  
**Resolution:** Add toast notifications for all PATCH operations. A simple inline toast system (no external library needed — small custom component) suffices for Phase 1.

---

### 6.3 🟢 Submission Detail Page: "Export to PDF" Is Missing
**Finding:** Not required for Phase 1. Document as a Phase 2 feature. No gap for current scope.

---

### 6.4 🟢 No Search on Contacts List
**Location:** Phase 1F, `ContactsPage.tsx`  
**Issue:** The plan mentions status filter for contacts but no text search by name/email.  
**Resolution:** Add client-side search filter on the contacts list (same pattern as submissions list). Filter on `name` and `email` fields from the index data.

---

## 7. Summary Table

| # | Severity | Area | Finding | Action Required |
|---|---|---|---|---|
| 1.1 | 🟡 | Security | Hardcoded seed password in plan | Move to `.env`, add `requirePasswordChange` flag |
| 1.2 | 🔴 | Security | Race condition on `users.json` refresh tokens | Implement write mutex + atomic rename |
| 1.3 | 🟡 | Security | Cookie flags incomplete | Add `sameSite`, `secure`, `path` to `res.cookie()` |
| 1.4 | 🟡 | Security | CORS not specified | Add `cors` package, configure per-route |
| 1.5 | 🟡 | Security | UUID validation unspecified | Centralize regex validator |
| 1.6 | 🟡 | Security | Path traversal possible | Validate + resolve + assert base path |
| 1.7 | 🟢 | Security | bcrypt cost hardcoded | Read from env |
| 2.1 | 🔴 | Stability | Index corruption on crash | Write file first, then index; reconcile on start |
| 2.2 | 🟡 | Stability | Index file unbounded growth | Document 5,000 entry migration threshold |
| 2.3 | 🟡 | Stability | Concurrent write race on index | Async mutex for index writes |
| 2.4 | 🟡 | Stability | Startup race before seed completes | `await seedService.seed()` before `app.listen()` |
| 2.5 | 🟢 | Stability | No error boundary in admin UI | Add top-level `<ErrorBoundary>` |
| 3.1 | 🔴 | Complete | No change-password flow | Add endpoint + page + forced redirect |
| 3.2 | 🟡 | Complete | `submissionId` not threaded to contact form | Extend `DiagnosticResult` type |
| 3.3 | 🟡 | Complete | Admin can't reset other user passwords | Add password field to admin PATCH users |
| 3.4 | 🟡 | Complete | No pagination for contacts | Apply same `ListOptions` pattern |
| 3.5 | 🟢 | Complete | No empty state handling | Add empty state UI to all list components |
| 3.6 | 🟢 | Complete | Stats endpoint ambiguous | Define `avgScore` scope + add `recentContacts` |
| 4.1 | 🟢 | Compat | `crypto.randomUUID()` needs Node 16.7+ | Specify `"engines": { "node": ">=18" }` |
| 4.2 | 🟡 | Compat | React Router may affect public routes | Test public `App.tsx` after router wrap |
| 4.3 | 🟢 | Compat | `express-validator` v7 compat | Confirmed compatible — no action |
| 4.4 | 🟢 | Compat | `bcrypt` native build risk | Switch to `bcryptjs` (pure JS, identical API) |
| 4.5 | 🟡 | Compat | esbuild needs build verification | Run `npm run build` after all server files added |
| 4.6 | 🟢 | Compat | TypeScript `lib` for `crypto` types | Add `"ES2022"` to `tsconfig.json` lib if missing |
| 5.1 | 🟢 | Migration | Repository interfaces well-defined | Confirm no file-specific types leak into interfaces |
| 5.2 | 🟡 | Migration | `ListOptions` must be DB-agnostic | Define generic type per spec above |
| 5.3 | 🟢 | Migration | Index files are JSON-only | Document in migration checklist |
| 6.1 | 🟡 | UX | No session timeout handling | Silent refresh + session expired redirect |
| 6.2 | 🟡 | UX | No feedback on PATCH operations | Add simple toast notification system |
| 6.3 | 🟢 | UX | PDF export missing | Deferred to Phase 2 — documented |
| 6.4 | 🟢 | UX | No text search on contacts | Add client-side name/email filter |

---

## 8. Critical Path Before Execution

These issues MUST be resolved before writing any code:

1. **[1.2] Refresh token write mutex** — design the write-lock strategy for `users.json`
2. **[2.1] Index reconciliation on startup** — define `reconcileIndex()` behavior
3. **[3.1] Change password flow** — add to plan before Phase 1F begins
4. **[4.4] Switch to `bcryptjs`** — update all package references in the plan

These issues SHOULD be resolved in Phase 1:

- [1.3] Cookie security flags — one-liner fix during auth implementation
- [1.4] CORS config — add `cors` to dependency list
- [1.5] + [1.6] UUID validation — implement centralized helper in Phase 1D
- [3.2] `submissionId` threading — extend type in Phase 1D

---

## 9. Revised Dependency List (Post-Audit)

```bash
# Runtime (revised)
npm install bcryptjs jsonwebtoken cookie-parser cors express-rate-limit express-validator react-router-dom

# Types (revised)
npm install --save-dev @types/bcryptjs @types/jsonwebtoken @types/cookie-parser @types/cors @types/react-router-dom
```

Note: `bcrypt` → replaced with `bcryptjs` (finding 4.4).  
Note: `cors` added (finding 1.4).

---

## 10. Final Assessment

**Plan readiness: READY TO EXECUTE with 3 critical pre-execution resolutions**

The plan is architecturally sound. The Repository pattern is correct for future migration. The JSON storage approach is appropriate for the described load. The three critical gaps (refresh token race condition, index corruption, missing change-password flow) are implementation-level details that can be resolved before execution starts — they do not require rethinking the architecture.

No tech stack conflicts or incompatible package combinations were found. The existing codebase is a clean foundation to extend.

---

*Tech Gap Audit completed May 27, 2026 — WHI Agency alpha branch*
