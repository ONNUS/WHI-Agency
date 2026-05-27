# WHI Agency — DNA Reconnaissance Briefing Questionnaire
## Full System Audit

**Audit Date:** May 27, 2026  
**Branch:** alpha  
**Scope:** Complete audit of the Reconnaissance Briefing Questionnaire feature — architecture, data flow, AI integration, gaps, and backend dashboard blueprint.

---

## 1. System Overview

The **Reconnaissance Briefing Questionnaire** (codename: DNA) is the primary lead-capture and client intelligence engine on the WHI Agency landing page. It presents as a militaristic, strategic multi-step intake form that:

1. Collects business intelligence from a potential client across five doctrine pillars.
2. Submits the data to a Node/Express API endpoint (`/api/assess`).
3. The API runs either a **live Gemini AI analysis** or a **deterministic fallback scoring algorithm**.
4. Returns a structured `DiagnosticResult` rendered as a tactical "Readiness Report" with a radar chart, combat plan, and a contact capture form.

The questionnaire is the top-of-funnel lead magnet for WHI's Strategy Retainer product.

---

## 2. Current Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend Framework | React | 19.0.1 |
| Language | TypeScript | ~5.8.2 |
| Styling | Tailwind CSS (v4 via Vite plugin) | 4.1.14 |
| Bundler / Dev Server | Vite | 6.2.3 |
| Animations | Motion (Framer Motion successor) | 12.23.24 |
| Icons | Lucide React | 0.546.0 |
| Backend Runtime | Node.js (tsx in dev, esbuild CJS bundle in prod) | — |
| Backend Framework | Express | 4.21.2 |
| AI Engine | Google Gemini via `@google/genai` | 2.4.0 |
| Environment Config | dotenv | 17.2.3 |
| Container | Docker (Dockerfile + docker-compose.yml present) | — |
| Linting / Type Check | TypeScript `tsc --noEmit` | — |

**No database, no auth, no session persistence currently exists.**

### Target Stack (Phase 1 — JSON File Storage)

| Layer | Technology | Notes |
|---|---|---|
| **Storage** | **JSON flat files** (`fs/promises`) | `data/json/dna/questionnaire/` — no external DB dependency |
| **Auth** | `bcrypt` + `jsonwebtoken` | Password hashing + JWT access/refresh tokens |
| **Rate Limiting** | `express-rate-limit` | Protect `/api/assess` + auth endpoints |
| **Input Validation** | `express-validator` | Sanitize free-text before Gemini prompt injection |
| **ID Generation** | `crypto.randomUUID()` | Node 16+ built-in — no extra package needed |
| **Migration Path** | Repository Pattern (interfaces) | Swap JSON repos for PostgreSQL repos without touching API or UI |

---

## 3. File Map — Questionnaire System

```
server.ts                        ← Express API + Vite dev-server bootstrap
src/
  types.ts                       ← TypeScript interfaces: ReconBriefing, DiagnosticResult, PillarScore
  App.tsx                        ← Root layout; holds diagnosticResult state; passes callbacks to BriefingForm
  components/
    BriefingForm.tsx             ← Primary questionnaire UI (4-step multi-part form + results display)
    RadarChart.tsx               ← SVG radar/spider chart — renders 5-pillar scores; interactive drag support
    DNABackground.tsx            ← Canvas-animated particle background used in DNA section
    AnimatedMazeBackground.tsx   ← Alternative canvas background
    AnimatedPathBackground.tsx   ← Alternative canvas background
    PillarsGrid.tsx              ← Marketing visual grid showing the 5 pillars
    IntelAccordion.tsx           ← FAQ / intel accordion component
    WHILogo.tsx                  ← SVG brand logo component
```

---

## 4. Data Models

### 4.1 `ReconBriefing` — Form Input Payload
```typescript
interface ReconBriefing {
  businessName: string;         // Required — Organization name
  industry: string;             // Required — Industry/sector vertical
  location: string;             // Pre-filled dropdown (9 Texas/US corridor options)
  blueForceAnswers: string;     // Free-text — Personnel & talent capabilities
  redForceAnswers: string;      // Free-text — Competitive pressure & pricing
  greenForceAnswers: string;    // Free-text — Fulfillment & operational scalability
  battlespaceAnswers: string;   // Free-text — AI/tech readiness & regulatory burden
  gapAnswers: string;           // Free-text — Cash flow, margins, capital velocity
}
```

### 4.2 `DiagnosticResult` — AI/API Response
```typescript
interface DiagnosticResult {
  scores: {
    blue: number;         // 1–10: Internal Talent & Offer Strength
    red: number;          // 1–10: Competitive Insulation
    green: number;        // 1–10: Operational Readiness
    battlespace: number;  // 1–10: Tech/AI Modernity
    gap: number;          // 1–10: Margin & Capital Health
  };
  overallScore: number;                  // Average of 5 scores
  criticalVulnerability: string;         // Highest-risk failure vector narrative
  asymmetricLeverage: string;            // Top exploitable growth opportunity
  combatPlan90Days: {
    phase1: string;   // Days 1–30: Immediate Hardening
    phase2: string;   // Days 31–60: Operational Alignment
    phase3: string;   // Days 61–90: Velocity Generation
  };
  executiveSummary: string;              // 2–3 sentence boardroom briefing
  isGeminiLive?: boolean;                // Internal flag: true = Gemini processed, false = fallback
}
```

### 4.3 Contact Capture (Post-Result) — Local State Only
```typescript
// Currently NEVER persisted — only lives in BriefingForm local state
{
  name: string;    // Required
  email: string;   // Required
  phone: string;   // Optional
  notes: string;   // Optional (unused in current UI)
}
```

---

## 5. Form Flow — Step-by-Step Breakdown

```
STEP 1 — Target Parameters
  ├── Organization Name (text, required)
  ├── Industry / Sector (text, required)
  └── Operational Corridor / Region (select, 9 options, default: DFW Metroplex)

STEP 2 — Force Intelligence
  ├── BLUE FORCE: Personnel & System Gap Capabilities (textarea, free-text)
  └── RED FORCE: Insulation & Pricing Sovereignty (textarea, free-text)

STEP 3 — Operational Readiness
  ├── GREEN FORCE: Operational Readiness & Scaling Ratio (textarea, free-text)
  └── BATTLESPACE: Technical Modernity & System Disruption (textarea, free-text)

STEP 4 — Strategic Gap
  └── STRATEGIC GAP: Capital Velocities & Margin Security (textarea, free-text)
      └── Authorization disclaimer shown before submit

SUBMIT → POST /api/assess

RESULT VIEW (replaces form UI)
  ├── Radar Chart (5-axis SVG; interactive score dragging supported)
  ├── Executive Analysis (executiveSummary)
  ├── Critical Vulnerability card
  ├── Asymmetric Leverage card
  ├── 90-Day Combat Plan (3 phase columns)
  └── Contact Capture Form → "Authorize Discovery Briefing Call"
       ├── Name (required)
       ├── Business Email (required)
       ├── Secure Telephone (optional)
       └── Submit → contactSubmitted = true (no API call made — LOCAL ONLY)
```

**Total Steps:** 4 (navigation via Next/Back buttons, no skipping)  
**Validation:** Step 1 requires `businessName` + `industry` before advancing. All other fields are optional text.

---

## 6. API Endpoint — `/api/assess`

**Method:** `POST`  
**Location:** `server.ts`  
**Request Body:** `ReconBriefing` (JSON)  
**Response Body:** `DiagnosticResult + { isGeminiLive: boolean }`

### Processing Logic:

```
1. Validate: businessName + industry required → 400 if missing
2. If GEMINI_API_KEY is configured:
   └── Call Gemini model "gemini-3.5-flash" with structured schema prompt
       └── Returns structured JSON DiagnosticResult
       └── Sets isGeminiLive: true
3. Else (fallback / API error):
   └── Keyword-scoring algorithm runs against combined free-text answers
       ├── Base scores: blue=7, red=5, green=6, battlespace=4, gap=6
       ├── Keyword matches adjust scores ±1 to ±3
       ├── All scores clamped to [2, 10]
       └── Deterministic combatPlan + criticalVulnerability chosen by lowest score
           └── Sets isGeminiLive: false
```

### Gemini Prompt Doctrine:
- System role: "Head of Strategic Intelligence at WHI Agency"
- Uses militaristic strategic intelligence framing
- Schema-enforced JSON response via `responseMimeType: "application/json"` + `responseSchema`
- Structured output ensures consistent `DiagnosticResult` shape

### Frontend Error Handling:
- If API call fails entirely → client constructs hardcoded `mockResult` (scores all 5, generic text)
- Mock result displayed identically to real results — no user-visible error state

---

## 7. Current System Gaps (Critical for Dashboard Build)

| Gap | Impact |
|---|---|
| **No data persistence** | All submissions are ephemeral — lost on page refresh. Zero CRM. |
| **Contact form never submits to API** | `handleContactSubmit` only sets `contactSubmitted = true`. No network request. No lead capture. |
| **No authentication** | No admin, no staff, no client access control. |
| **No database** | No storage layer exists at all (no SQL, no NoSQL, no file store). |
| **No submission ID / tracking** | Submissions have no UUID, timestamp, or metadata. |
| **No admin visibility** | No one at WHI can view, filter, or act on submitted questionnaires. |
| **No PDF/export** | Results cannot be saved, exported, or shared by the client or staff. |
| **No rate limiting** | `/api/assess` has no rate limiting — vulnerable to abuse / Gemini API cost spikes. |
| **No input sanitization** | Free-text fields pass directly into the Gemini prompt with template strings — prompt injection risk. |
| **GEMINI_API_KEY in env only** | If `.env` is misconfigured in production, the fallback silently activates with no notification. |

---

## 8. The Five Doctrine Pillars — Reference

| Pillar | Key | Color | Domain |
|---|---|---|---|
| Blue Force | `blue` | Blue `#2e63a6` | Internal talent, leadership, offer pricing, executive bandwidth |
| Red Force | `red` | Red `#b13b3f` | Competitive positioning, brand insulation, pricing sovereignty |
| Green Force | `green` | Green `#308c5f` | Fulfillment capacity, operational scalability, system stress limits |
| Battlespace | `battlespace` | Purple `#6647b1` | AI readiness, tech infrastructure, cybersecurity, regulatory burden |
| Strategic Gap | `gap` | Amber `#b67820` | Cash flow, unit economics, capital velocity, margin security |

---

## 9. Backend Dashboard Blueprint

### 9.1 Scope: Phase 1 (Base System)

Build a standalone backend admin application that:
- Authenticates WHI staff via secure login
- Stores all questionnaire submissions with full data + metadata
- Provides a CRM-style view to browse, search, filter, and read submissions
- Connects the existing contact capture form to actual storage

**Phase 1 Modules:**
1. **Authentication** — Staff login (email + password), JWT sessions, role-based access
2. **Dashboard Home** — Submission count, recent activity, score distributions
3. **User Management** — Admin can create/edit/deactivate staff accounts
4. **Form Manager (CRM)** — View all questionnaire submissions, detail view per submission, contact notes

---

### 9.2 Recommended Stack for Dashboard

| Layer | Recommendation | Rationale |
|---|---|---|
| Backend Framework | **Express** (extend existing `server.ts`) | Already in the project; avoid adding a second server |
| Storage (Phase 1) | **JSON flat files** via `fs/promises` | Zero external dependency, instant setup, easy to inspect/backup |
| Storage (Phase 2+) | **PostgreSQL** via Prisma ORM | Future upgrade path — repository interfaces isolate the swap |
| Auth | **JWT** (access + refresh tokens) + **bcrypt** for passwords | Stateless, fits Express; no additional auth service needed |
| Refresh Tokens | **JSON file store** (`data/json/dna/questionnaire/users/`) | Stored alongside user records; revocable via file update |
| Admin UI | **React** (new route in existing Vite app, protected by auth guard) | Reuses existing component/styling infrastructure |
| Routing (Admin) | **React Router v6** | SPA routing for dashboard pages |
| State Management | **React Context** + `useState` (start simple) | No need for Redux at Phase 1 |
| API Communication | **Fetch API** with typed service layer | Consistent with existing code |
| Email (future) | **Resend** or **Nodemailer** | Notification on new submission |

---

### 9.3 Data Storage Schema (Phase 1 — JSON Files)

**Root path:** `data/json/dna/questionnaire/`

```
data/json/dna/questionnaire/
  submissions/
    {uuid}.json        ← one file per submission (full payload)
  contacts/
    {uuid}.json        ← one file per contact lead
  users/
    users.json         ← array of staff user objects (small, single file)
  _index/
    submissions.json   ← lightweight index array for list views
    contacts.json      ← lightweight index array for CRM list views
```

**Submission file (`submissions/{uuid}.json`):**
```json
{
  "id": "uuid-v4",
  "businessName": "string",
  "industry": "string",
  "location": "string",
  "blueAnswers": "string",
  "redAnswers": "string",
  "greenAnswers": "string",
  "battlespaceAnswers": "string",
  "gapAnswers": "string",
  "scores": { "blue": 0, "red": 0, "green": 0, "battlespace": 0, "gap": 0 },
  "overallScore": 0,
  "criticalVulnerability": "string",
  "asymmetricLeverage": "string",
  "combatPlan90Days": { "phase1": "", "phase2": "", "phase3": "" },
  "executiveSummary": "string",
  "isGeminiLive": false,
  "ipAddress": "string",
  "submittedAt": "ISO8601"
}
```

**Contact file (`contacts/{uuid}.json`):**
```json
{
  "id": "uuid-v4",
  "submissionId": "uuid-v4 | null",
  "name": "string",
  "email": "string",
  "phone": "string",
  "notes": "string",
  "status": "new | contacted | qualified | closed",
  "assignedTo": "staffUserId | null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Users file (`users/users.json`):**
```json
[
  {
    "id": "uuid-v4",
    "username": "Admin",
    "email": "admin@whi.agency",
    "name": "WHI Admin",
    "role": "admin",
    "passwordHash": "bcrypt($2b$12$...)",
    "isActive": true,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601",
    "refreshTokens": [
      { "tokenHash": "sha256(...)", "expiresAt": "ISO8601", "revoked": false }
    ]
  }
]
```

**Submissions Index (`_index/submissions.json`):**
```json
[
  {
    "id": "uuid-v4",
    "businessName": "string",
    "industry": "string",
    "location": "string",
    "overallScore": 7.2,
    "submittedAt": "ISO8601"
  }
]
```

> **PostgreSQL Migration Note:** All file I/O is abstracted behind Repository interfaces. To migrate, swap `JsonSubmissionRepository` for `PgSubmissionRepository` — API routes and UI code are untouched.

---

### 9.4 New API Endpoints (Dashboard)

```
AUTH
  POST   /api/admin/auth/login          ← email + password → access_token + refresh_token
  POST   /api/admin/auth/refresh        ← refresh_token → new access_token
  POST   /api/admin/auth/logout         ← revoke refresh token

SUBMISSIONS (protected)
  GET    /api/admin/submissions         ← list with pagination, search, filters
  GET    /api/admin/submissions/:id     ← full detail view
  DELETE /api/admin/submissions/:id     ← admin only

CONTACTS (protected)
  GET    /api/admin/contacts            ← list all contacts/leads
  GET    /api/admin/contacts/:id        ← contact detail + linked submission
  PATCH  /api/admin/contacts/:id        ← update status, notes, assigned_to

USERS (protected, admin only)
  GET    /api/admin/users               ← list staff
  POST   /api/admin/users               ← create staff user
  PATCH  /api/admin/users/:id           ← update name, role, is_active
  DELETE /api/admin/users/:id           ← deactivate (soft delete)

DASHBOARD STATS (protected)
  GET    /api/admin/stats               ← submission counts, avg scores, recent activity
```

---

### 9.5 Frontend Dashboard Routes

```
/admin                  → redirect to /admin/login or /admin/dashboard
/admin/login            → Staff Login Page
/admin/dashboard        → Dashboard Home (stats, recent submissions)
/admin/submissions      → Submissions Table (search, filter by score/date/location)
/admin/submissions/:id  → Submission Detail (full radar + report + linked contact)
/admin/contacts         → CRM Leads List (status board: new → contacted → qualified → closed)
/admin/contacts/:id     → Contact Detail (edit status, notes, assign to staff)
/admin/users            → User Management (admin only)
/admin/users/new        → Create Staff User (admin only)
/admin/users/:id        → Edit Staff User (admin only)
```

---

## 10. Existing Code Modifications Required

| File | Change |
|---|---|
| `server.ts` | Add auth middleware, new `/api/admin/*` routes, JSON repository layer |
| `src/components/BriefingForm.tsx` | Wire contact submit to `POST /api/admin/contacts` instead of local state only |
| `server.ts` `/api/assess` | Add rate limiting, sanitize inputs before Gemini prompt injection, persist submission to JSON file before returning result |
| `src/App.tsx` | Add `<Route>` logic or lazy-load admin SPA bundle |
| `package.json` | Add: `bcrypt`, `jsonwebtoken`, `express-rate-limit`, `express-validator`, `react-router-dom`, `@types/bcrypt`, `@types/jsonwebtoken` |

---

## 11. Security Requirements

| Concern | Mitigation |
|---|---|
| **Prompt injection** via free-text fields | Sanitize / escape user input before template string interpolation into Gemini prompt. Wrap in a safe delimiter structure. |
| **Password storage** | `bcrypt` with cost factor ≥ 12. Never store plaintext. |
| **JWT secrets** | 256-bit random secret in env. Separate signing keys for access vs. refresh tokens. |
| **Rate limiting** | `express-rate-limit` on `/api/assess` (max 5/IP/hour) and `/api/admin/auth/login` (max 10/IP/15min). |
| **CORS** | Restrict admin API CORS to the dashboard origin. |
| **JSON path traversal** | Validate UUIDs with regex before using as filenames. Never interpolate raw user input into file paths. |
| **Sensitive data** | Never log `password_hash` or raw tokens. Mask PII in logs. |
| **HTTPS** | Enforce TLS in production (terminate at reverse proxy / container host). |

---

## 12. Execution Plan — Phase 1

```
Week 1: JSON Storage Layer + Auth Backend
  ├── Create data/json/dna/questionnaire/ directory structure
  ├── Build Repository interfaces + JSON file implementations
  ├── Seed initial Admin user (username: Admin, bcrypt-hashed password)
  ├── Implement POST /api/admin/auth/login + /refresh + /logout
  ├── bcrypt password hashing, JWT access/refresh token issuance
  └── Auth middleware for protected routes

Week 2: Submission Persistence + Contact Wire-up
  ├── Modify /api/assess to write submission JSON file before returning result
  ├── Return submission_id to frontend
  ├── Wire BriefingForm contact form to POST /api/admin/contacts with submission_id
  └── Add rate limiting + input sanitization to /api/assess

Week 3: Admin API Routes
  ├── GET /api/admin/submissions (index-based list + filters)
  ├── GET /api/admin/submissions/:id (read full JSON file)
  ├── GET /api/admin/contacts + PATCH /api/admin/contacts/:id
  ├── GET/POST/PATCH/DELETE /api/admin/users (admin role guard)
  └── GET /api/admin/stats

Week 4: Admin React UI
  ├── /admin/login — auth form, token storage in httpOnly cookie or memory
  ├── /admin/dashboard — stats cards, recent submissions table
  ├── /admin/submissions — sortable/filterable table + detail modal/page
  ├── /admin/contacts — CRM status board
  └── /admin/users — user management table + create/edit forms
```

---

## 13. Notes for Future Phases

- **Client Logins:** The `staff` table `role` field can extend to `'client'`; submissions can be linked to a client account so clients review their own results.
- **PDF Export:** Render `DiagnosticResult` server-side with `puppeteer` or `@react-pdf/renderer` for branded PDF delivery.
- **Email Notifications:** Trigger on new contact submission — notify assigned analyst via Resend/Nodemailer.
- **Webhook / CRM Integration:** Push contacts to HubSpot, GoHighLevel, or similar on status change.
- **Audit Trail:** The `activity_log` table is pre-designed to support full admin action history.
- **Multi-tenancy:** Structure allows future per-client workspaces by adding a `client_id` FK to submissions.

---

---

## 14. Storage Migration Checklist (JSON → PostgreSQL, Future)

When ready to migrate from JSON to PostgreSQL, the following steps apply — no changes to API routes or admin UI:

- [ ] Add `pg` or `prisma` to `package.json`
- [ ] Create PostgreSQL schema matching JSON data shapes
- [ ] Implement `PgSubmissionRepository`, `PgContactRepository`, `PgUserRepository`
- [ ] Replace `JsonXxxRepository` instances in `server.ts` with Pg versions via dependency injection
- [ ] Write one-time migration script to import existing JSON files into PostgreSQL
- [ ] Validate all API endpoints return identical response shapes
- [ ] Remove `data/json/` after confirmed migration

---

*Audit last updated: May 27, 2026 — Updated to reflect JSON flat-file storage strategy and migration path to PostgreSQL.*
