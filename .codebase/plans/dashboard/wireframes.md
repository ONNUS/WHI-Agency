# WHI Agency — Admin Dashboard: Text Wireframes
## Screens for Approval Before Execution

**Prepared:** May 27, 2026  
**Context:** The public DNA™ questionnaire is the Phase 0 "Reconnaissance Briefing" — a pre-qualification gate before the full paid WHI DNA™ assessment. The admin dashboard is the WHI Command Center for managing the Recon → Qualify → DNA → BDS pipeline.

**Terminology used throughout:**
- **Recon Brief / Briefing** = a submitted questionnaire (not "submission")
- **Prospect** = the person/org behind a brief (linked contact info)
- **Readiness Score™** = the aggregate 1–10 score across 5 pillars
- **Pipeline Status** = `new` → `under review` → `briefing scheduled` → `qualified` → `dna sold` → `disqualified`

**Design language:** Dark `#0b0c0f` base, amber/gold `#bc993c` accents, stone text, monospace labels, military-tactical framing — matching the existing public site aesthetic.

---

## Legend

```
[ ]         = button
[_________] = text input / text field
[v]         = dropdown selector
[x]         = close / remove
( )         = radio option
[■]         = filled/active
[□]         = empty/inactive
░░░░░░      = content placeholder / loading block
▓▓▓▓▓▓      = progress bar / fill
│ ─ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼  = layout borders
```

---

---

# SCREEN 01 — Login
## `/admin/login`

```
┌─────────────────────────────────────────────────────────────────────┐
│                         #0b0c0f background                          │
│                                                                     │
│                                                                     │
│                    ┌───────────────────────┐                        │
│                    │  [WHI LOGO SVG]       │                        │
│                    │  W H I                │                        │
│                    └───────────────────────┘                        │
│                                                                     │
│                 ┌──────────────────────────────┐                    │
│                 │  ▄▄ COMMAND CENTER ACCESS ▄▄ │  ← amber mono     │
│                 │  ──────────────────────────  │                    │
│                 │                              │                    │
│                 │  USERNAME                    │                    │
│                 │  [_________________________] │                    │
│                 │                              │                    │
│                 │  PASSWORD                    │                    │
│                 │  [_________________________] │                    │
│                 │                              │                    │
│                 │  [ AUTHORIZE ACCESS ──────▶] │  ← amber button   │
│                 │                              │                    │
│                 │  ── ● SECURE UPLINK ACTIVE   │  ← xs mono text   │
│                 └──────────────────────────────┘                    │
│                                                                     │
│                 Error state (visible on failed auth):               │
│                 │  ⚠  AUTHORIZATION DENIED. VERIFY CREDENTIALS.  │  │
│                                                                     │
│            WHI Agency · Internal Operations · v1.0                 │
│            ── RESTRICTED ACCESS ─────────────────                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- Centered card on full dark background
- WHI logo above card (same SVG from public site)
- "COMMAND CENTER ACCESS" in amber mono caps
- Error banner replaces/appears below the button on failed auth
- No "forgot password" link in Phase 1 (admin resets via users panel)
- After successful login → redirect to `/admin/dashboard`

---

---

# SCREEN 02 — Dashboard Home (Command Center)
## `/admin/dashboard`

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▌ WHI          [■] DASHBOARD  [□] BRIEFINGS  [□] PROSPECTS  [□] STAFF      [↪]│
│ ▌ COMMAND     ─────────────────────────────────────────────────────── [Admin ▼]│
│ ▌ CENTER                                                                        │
│ ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  OPERATIONAL STATUS                            ● LIVE · May 27, 2026  11:42    │
│  ──────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │ RECON BRIEFS   │  │ NEW PROSPECTS  │  │ AVG READINESS  │  │ ACTIVE STAFF │ │
│  │                │  │                │  │     SCORE™     │  │              │ │
│  │     47         │  │      12        │  │      6.4       │  │      3       │ │
│  │ total received │  │ awaiting review│  │  across all    │  │ operators    │ │
│  │ [↑ 3 today]    │  │ [↑ 2 today]    │  │  briefings     │  │              │ │
│  └────────────────┘  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                                                 │
│  ┌──────────────────────────────────────────┐  ┌──────────────────────────────┐│
│  │ RECENT RECONNAISSANCE BRIEFINGS          │  │ PIPELINE STATUS              ││
│  │ ──────────────────────────────────       │  │ ────────────────────         ││
│  │ ORG            SCORE  LOCATION   TIME    │  │                              ││
│  │ ─────────────────────────────────────── │  │  NEW             ●●●●●  12   ││
│  │ Apex Logistics   7.2   DFW       2h ago  │  │  UNDER REVIEW    ●●●    8    ││
│  │ NovaBridge LLC   5.8   Houston   4h ago  │  │  BRIEFING SCHED  ●●     5    ││
│  │ CoreShift Co     4.1   Austin    6h ago  │  │  QUALIFIED       ●●●●   11   ││
│  │ PeakDrive Inc    8.3   Atlanta   8h ago  │  │  DNA SOLD        ●●●    7    ││
│  │ Meridian Group   3.9   DFW       1d ago  │  │  DISQUALIFIED    ●      4    ││
│  │                                          │  │                              ││
│  │             [ VIEW ALL BRIEFINGS ──▶ ]   │  │  [ VIEW PIPELINE ──▶ ]       ││
│  └──────────────────────────────────────────┘  └──────────────────────────────┘│
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ RECENT PROSPECT ACTIVITY                                                  │  │
│  │ ─────────────────────────────────────────────────────────────────────    │  │
│  │ Marcus Sterling    marcus@apexlogistics.com   BRIEFING SCHEDULED  2h ago  │  │
│  │ Diane Wren         d.wren@novabridge.io        UNDER REVIEW        4h ago  │  │
│  │ Ray Castillo       r.castillo@coreshift.com    NEW                 6h ago  │  │
│  │                                                                            │  │
│  │                                    [ VIEW ALL PROSPECTS ──▶ ]             │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- Fixed left sidebar: WHI logo + nav items (`Dashboard`, `Briefings`, `Prospects`, `Staff`)
- Top-right: current user display with logout dropdown
- 4 stat cards: Total Briefs, New Prospects, Avg Score, Active Staff
- "Recent Reconnaissance Briefings" = last 5, with score + location + time
- "Pipeline Status" = compact breakdown of prospect statuses
- "Recent Prospect Activity" = last 3 updated contacts
- All scores are color-coded: red < 5 · amber 5–7 · green ≥ 7

---

---

# SCREEN 03 — Reconnaissance Briefings List
## `/admin/briefings`

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▌ WHI          [□] DASHBOARD  [■] BRIEFINGS  [□] PROSPECTS  [□] STAFF      [↪]│
│ ▌ COMMAND     ─────────────────────────────────────────────────────── [Admin ▼]│
│ ▌ CENTER                                                                        │
│ ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  RECONNAISSANCE BRIEFINGS                      47 total                        │
│  ──────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  [🔍 Search by org name or industry...________] [LOCATION ▼] [SCORE ▼] [DATE▼]│
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │ ORGANIZATION          INDUSTRY          LOCATION        SCORE   RECEIVED  │ │
│  │ ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │ ▶ Apex Logistics Co   Supply Chain      DFW Metroplex   [7.2]   2h ago   │ │
│  │ ▶ NovaBridge LLC      SaaS / Tech       Houston         [5.8]   4h ago   │ │
│  │ ▶ CoreShift Co        Healthcare        Austin          [4.1]   6h ago   │ │
│  │ ▶ PeakDrive Inc       Transportation    Atlanta         [8.3]   8h ago   │ │
│  │ ▶ Meridian Group      Real Estate       DFW Metroplex   [3.9]   1d ago   │ │
│  │ ▶ Orbital Consulting  Professional Svc  National        [6.7]   1d ago   │ │
│  │ ▶ Vertex Capital      Finance           DFW Metroplex   [7.0]   2d ago   │ │
│  │ ▶ TerraLink Corp      Construction      Houston         [5.2]   2d ago   │ │
│  │ ▶ Kestrel Media       Marketing         Austin          [4.8]   3d ago   │ │
│  │ ▶ FrontEdge Partners  Legal             Southern Region [6.1]   3d ago   │ │
│  │                                                                           │ │
│  │  Scores:  [4.1] = red  ·  [5.8] = amber  ·  [7.2] = green               │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  [ ← Prev ]  Page 1 of 5  [ Next → ]          Showing 10 of 47                │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- Clicking any row navigates to `Briefing Detail`
- Score badges color-coded: `< 5.0` red · `5.0–6.9` amber · `7.0+` green
- Filters: Location dropdown (all 9 corridor options), Score range, Date range
- Search works on org name + industry (client-side filter from index)
- Pagination: 10 per page
- No column-level sorting in Phase 1 (date desc by default)

---

---

# SCREEN 04 — Reconnaissance Briefing Detail
## `/admin/briefings/:id`

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▌ WHI          [□] DASHBOARD  [■] BRIEFINGS  [□] PROSPECTS  [□] STAFF      [↪]│
│ ▌ COMMAND     ─────────────────────────────────────────────────────── [Admin ▼]│
│ ▌ CENTER                                                                        │
│ ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  [ ← BACK TO BRIEFINGS ]                                                        │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ RECON BRIEF #a4f2-...                              Received: May 27 2026  │   │
│  │ ─────────────────────────────────────────────────────────────────────── │   │
│  │ APEX LOGISTICS CO                DFW Metroplex · Supply Chain            │   │
│  │                                                   ● GEMINI LIVE BRIEF    │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  ┌────────────────────────────┐   ┌─────────────────────────────────────────┐  │
│  │                            │   │ WHI READINESS SCORE™                    │  │
│  │                            │   │ ─────────────────────────────────────── │  │
│  │    [RADAR CHART SVG]       │   │                                         │  │
│  │     (5-axis spider)        │   │  ● BLUE FORCE      ▓▓▓▓▓▓▓░░░  7.0    │  │
│  │                            │   │  ● RED FORCE       ▓▓▓▓▓▓░░░░  6.0    │  │
│  │                            │   │  ● GREEN FORCE     ▓▓▓▓▓▓▓▓░░  7.5    │  │
│  │                            │   │  ● BATTLESPACE     ▓▓▓▓░░░░░░  4.5    │  │
│  │       OVERALL: 7.2 ★       │   │  ● STRATEGIC GAP   ▓▓▓▓▓▓▓▓░░  7.8    │  │
│  │                            │   │                              ─────────  │  │
│  └────────────────────────────┘   │  AGGREGATE READINESS SCORE™    7.2 / 10│  │
│                                   │                                         │  │
│                                   │  SOURCE: ● Gemini Neural Brief Active   │  │
│                                   └─────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ EXECUTIVE INTELLIGENCE SUMMARY                                            │  │
│  │ ──────────────────────────────                                            │  │
│  │  Apex Logistics shows strong fulfillment architecture and brand authority  │  │
│  │  in the DFW Supply Chain corridor. Primary vulnerability lies in Battlespace│  │
│  │  readiness — legacy tech infrastructure exposes them to AI disruption risk.│  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────┐  ┌───────────────────────────────────┐   │
│  │ ⚠ CRITICAL VULNERABILITY        │  │ ◎ ASYMMETRIC LEVERAGE             │   │
│  │ ─────────────────────────────── │  │ ────────────────────────────────  │   │
│  │  Battlespace exposure: no AI     │  │  Superior fulfillment capacity vs  │   │
│  │  infrastructure. Legacy systems  │  │  competitors locked in manual ops. │   │
│  │  risk platform disruption event. │  │  Deploy AI automation first.       │   │
│  └──────────────────────────────────┘  └───────────────────────────────────┘   │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ FIRST 90-DAY COMBAT PLAN                                                  │  │
│  │ ────────────────────────                                                  │  │
│  │  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐  │  │
│  │  │ ▌ DAYS 1-30        │  │ ▌ DAYS 31-60       │  │ ▌ DAYS 61-90      │  │  │
│  │  │ Phase 01 Vanguard  │  │ Phase 02 Advance   │  │ Phase 03 Fortify  │  │  │
│  │  │                    │  │                    │  │                   │  │  │
│  │  │ Patch legacy tech  │  │ Launch AI-driven   │  │ Automate systems, │  │  │
│  │  │ gaps. Zero-trust   │  │ outbound. Roll out │  │ present 90-day    │  │  │
│  │  │ infra install.     │  │ brand repositioning│  │ ROI. Transition   │  │  │
│  │  │ Cash flow buffer.  │  │ campaign in DFW.   │  │ into BDS retainer │  │  │
│  │  └────────────────────┘  └────────────────────┘  └────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ RAW INTELLIGENCE INPUTS       [▼ EXPAND ANSWERS]                          │  │
│  │ ────────────────────────────────────────────────                          │  │
│  │  (collapsed by default — click to expand all 5 pillar free-text answers)  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ LINKED PROSPECT                                                            │  │
│  │ ──────────────                                                             │  │
│  │  Marcus Sterling · marcus@apexlogistics.com · +1 (214) 555-0199           │  │
│  │  Status: BRIEFING SCHEDULED · Assigned: Sarah K.                          │  │
│  │  [ VIEW PROSPECT RECORD ──▶ ]                                              │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  [ CONVERT TO PROSPECT ──▶ ]   (if no linked prospect yet)                     │
│  ═══════════════════════════════════════ [🗑 DELETE BRIEF] ← admin only, red   │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Expanded Raw Answers state (inside the collapsible):**
```
│  RAW INTELLIGENCE INPUTS       [▲ COLLAPSE ANSWERS]                         │
│  ────────────────────────────────────────────────                           │
│                                                                              │
│  BLUE FORCE — Personnel & Talent Capabilities                                │
│  "Lead founder spends 12h/week in fulfillment. Staff gap in automation..."  │
│                                                                              │
│  RED FORCE — Insulation & Pricing Sovereignty                                │
│  "Traditional competitors copy our freight packages within days..."         │
│                                                                              │
│  GREEN FORCE — Operational Readiness                                         │
│  "Customer support bottleneck at 4+ days SLA. Manual invoicing system..."   │
│                                                                              │
│  BATTLESPACE — Technical Modernity                                           │
│  "Entirely on Google Sheets and legacy ERP. No AI deployment currently..."  │
│                                                                              │
│  STRATEGIC GAP — Capital Velocities                                          │
│  "Cash flow cycle 60+ days. CAC absorbs ~40% of first engagement margin..." │
```

**Notes:**
- "GEMINI LIVE BRIEF" badge shows if AI was active, "ANALYTIC BRIEF" for fallback
- Radar chart is read-only in admin view (no interactive drag)
- Pillar score bars are 0-10 with fill proportional to score
- Overall aggregate score displayed prominently
- Raw answers collapsed by default — expand for full interrogation
- "Linked Prospect" section: if contact info was submitted post-result, show it here with link
- "CONVERT TO PROSPECT" button: appears only when no linked contact exists. Creates a prospect record and links it to this brief
- DELETE is red, requires a confirmation modal, admin-only

---

---

# SCREEN 05 — Prospects / CRM List
## `/admin/prospects`

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▌ WHI          [□] DASHBOARD  [□] BRIEFINGS  [■] PROSPECTS  [□] STAFF      [↪]│
│ ▌ COMMAND     ─────────────────────────────────────────────────────── [Admin ▼]│
│ ▌ CENTER                                                                        │
│ ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  PROSPECT INTELLIGENCE                         32 total                        │
│  ──────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  [🔍 Search by name, email, or org...________]                                 │
│                                                                                 │
│  STATUS FILTER:  [ALL ▼]                                                        │
│  [ ALL ] [ NEW ] [ UNDER REVIEW ] [ BRIEFING SCHEDULED ] [ QUALIFIED ]          │
│  [ DNA SOLD ] [ DISQUALIFIED ]                                                  │
│  ── currently showing: ALL                                                      │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │ NAME                 ORG                 SCORE  STATUS           ASSIGNED │ │
│  │ ─────────────────────────────────────────────────────────────────────── │ │
│  │                                                                           │ │
│  │ ▶ Marcus Sterling    Apex Logistics Co   [7.2]  BRIEFING SCHED.  Sarah K. │ │
│  │ ▶ Diane Wren         NovaBridge LLC      [5.8]  UNDER REVIEW     —        │ │
│  │ ▶ Ray Castillo       CoreShift Co        [4.1]  NEW              —        │ │
│  │ ▶ Jordan Vance       PeakDrive Inc       [8.3]  QUALIFIED        Marcus T.│ │
│  │ ▶ Lena Bowen         Meridian Group      [3.9]  DISQUALIFIED     —        │ │
│  │ ▶ Theo Marsh         Orbital Consulting  [6.7]  DNA SOLD         Sarah K. │ │
│  │ ▶ Priya Delacroix    Vertex Capital      [7.0]  QUALIFIED        —        │ │
│  │ ▶ K. Drummond        TerraLink Corp      [5.2]  UNDER REVIEW     Marcus T.│ │
│  │                                                                           │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  [ ← Prev ]  Page 1 of 4  [ Next → ]          Showing 8 of 32                 │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Status badge colors:**
```
  NEW                 = stone / neutral
  UNDER REVIEW        = amber
  BRIEFING SCHEDULED  = blue
  QUALIFIED           = green
  DNA SOLD            = amber-gold (premium)
  DISQUALIFIED        = red / muted
```

**Notes:**
- Status filter tabs at the top (pill buttons) — clicking filters the list
- Score badge linked from their Recon Brief (if none = `—`)
- "Assigned" column = staff member assigned to manage this prospect
- Clicking row → Prospect Detail (`/admin/prospects/:id`)
- Search is client-side on loaded data (name, email, org name)

---

---

# SCREEN 06 — Prospect Detail / CRM Record
## `/admin/prospects/:id`

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▌ WHI          [□] DASHBOARD  [□] BRIEFINGS  [■] PROSPECTS  [□] STAFF      [↪]│
│ ▌ COMMAND     ─────────────────────────────────────────────────────── [Admin ▼]│
│ ▌ CENTER                                                                        │
│ ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  [ ← BACK TO PROSPECTS ]                                                        │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ Marcus Sterling                                   BRIEFING SCHEDULED [▼] │  │
│  │ marcus@apexlogistics.com · +1 (214) 555-0199                              │  │
│  │ Apex Logistics Co · DFW Metroplex                                         │  │
│  │ Received: May 27, 2026 at 9:14am                                          │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────┐  ┌───────────────────────────────────┐   │
│  │ CONTACT DETAILS                  │  │ PIPELINE MANAGEMENT               │   │
│  │ ─────────────────────────────── │  │ ──────────────────────────────── │   │
│  │                                  │  │                                   │   │
│  │  Name:   Marcus Sterling         │  │  Status:  [ BRIEFING SCHEDULED ▼] │   │
│  │  Email:  marcus@apexlogistics.com│  │                                   │   │
│  │  Phone:  +1 (214) 555-0199       │  │  Assigned To:  [ Sarah K. ▼ ]    │   │
│  │  Org:    Apex Logistics Co       │  │                                   │   │
│  │                                  │  │  [ SAVE CHANGES ]                 │   │
│  └──────────────────────────────────┘  └───────────────────────────────────┘   │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ OPERATIVE NOTES                                                            │  │
│  │ ───────────────────────────────────────────────────────────────────────  │  │
│  │  [                                                                       ] │  │
│  │  [  Called May 27. Marcus confirmed 45-min briefing for June 2 @ 2pm CT. ] │  │
│  │  [  Primary concern: AI readiness gap. Battlespace score = 4.5           ] │  │
│  │  [  Budget confirmed $15k+ range. CEO + COO will be on the call.         ] │  │
│  │  [                                                                       ] │  │
│  │                                                          [ SAVE NOTES ]    │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │ LINKED RECONNAISSANCE BRIEF                                               │  │
│  │ ──────────────────────────                                                │  │
│  │                                                                            │  │
│  │  Brief ID: #a4f2-...    Received: May 27, 2026                            │  │
│  │  Organization: Apex Logistics Co · Supply Chain · DFW Metroplex           │  │
│  │                                                                            │  │
│  │  Readiness Score™:  7.2 / 10                                              │  │
│  │  ● Blue  7.0   ● Red  6.0   ● Green  7.5   ● BS  4.5   ● Gap  7.8        │  │
│  │                                                                            │  │
│  │  Critical Vulnerability: Battlespace exposure — legacy infrastructure.    │  │
│  │                                                                            │  │
│  │                                  [ VIEW FULL BRIEF ──▶ ]                  │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Status dropdown options:**
```
  ( ) NEW
  ( ) UNDER REVIEW
  (●) BRIEFING SCHEDULED   ← current
  ( ) QUALIFIED
  ( ) DNA SOLD
  ( ) DISQUALIFIED
```

**Notes:**
- Status dropdown updates immediately and auto-saves via PATCH on change (with success toast)
- "Assigned To" dropdown lists all active staff; blank = unassigned
- Notes textarea is a free-form log; "SAVE NOTES" sends PATCH to update
- Linked brief shows score summary + quick stats without leaving the page
- "VIEW FULL BRIEF →" navigates to the Briefing Detail screen
- No delete on prospect records in Phase 1 — use DISQUALIFIED status instead

---

---

# SCREEN 07 — Staff / User Management
## `/admin/staff`

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▌ WHI          [□] DASHBOARD  [□] BRIEFINGS  [□] PROSPECTS  [■] STAFF      [↪]│
│ ▌ COMMAND     ─────────────────────────────────────────────────────── [Admin ▼]│
│ ▌ CENTER                                                                        │
│ ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  STAFF MANAGEMENT                     ⚠ ADMIN ACCESS ONLY                     │
│  ──────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│                                                  [ + ADD NEW OPERATIVE ]       │
│                                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐    │
│  │ NAME              USERNAME     ROLE       STATUS     CREATED           │    │
│  │ ──────────────────────────────────────────────────────────────────── │    │
│  │                                                                        │    │
│  │ Admin             Admin        ● ADMIN    ● ACTIVE   Jan 01 2026  [✎] │    │
│  │ Sarah Kovalenko   sarah.k      ○ ANALYST  ● ACTIVE   Mar 15 2026  [✎] │    │
│  │ Marcus Tillman    m.tillman    ○ ANALYST  ● ACTIVE   Apr 02 2026  [✎] │    │
│  │ Dana Reyes        d.reyes      ○ ANALYST  ○ INACTIVE May 10 2026  [✎] │    │
│  │                                                                        │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│                                                                                 │
│  Roles:  ● ADMIN = full access (briefings, prospects, staff, system config)    │
│          ○ ANALYST = briefings + prospects only (no staff management)          │
│                                                                                 │
│  ● ACTIVE = can log in  ·  ○ INACTIVE = access suspended                      │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- Page only accessible to `admin` role users — analysts see a "403 Access Denied" screen
- Edit pencil `[✎]` opens the User Edit Form
- Admin user cannot deactivate their own account (edit button disabled for self)
- No delete — only deactivation (preserve audit integrity)
- Role badge colors: Admin = amber · Analyst = stone
- Status: Active = green · Inactive = red/muted

---

---

# SCREEN 08 — User Form (Create / Edit)
## `/admin/staff/new` and `/admin/staff/:id`

### 8A — Create New Operative

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▌ WHI          [□] DASHBOARD  [□] BRIEFINGS  [□] PROSPECTS  [■] STAFF      [↪]│
│ ▌ COMMAND     ─────────────────────────────────────────────────────── [Admin ▼]│
│ ▌ CENTER                                                                        │
│ ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  [ ← BACK TO STAFF ]                                                            │
│                                                                                 │
│  ADD NEW OPERATIVE                                                              │
│  ──────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                            │  │
│  │  FULL NAME                          USERNAME                              │  │
│  │  [_____________________________]    [_____________________________]       │  │
│  │                                                                            │  │
│  │  EMAIL ADDRESS                                                             │  │
│  │  [___________________________________________________________]            │  │
│  │                                                                            │  │
│  │  TEMPORARY PASSWORD                                                        │  │
│  │  [___________________________________________________________]            │  │
│  │  ── Operative will be required to change password on first login           │  │
│  │                                                                            │  │
│  │  ACCESS ROLE                                                               │  │
│  │  (●) ANALYST — Can view briefings and manage prospects                    │  │
│  │  ( ) ADMIN   — Full system access including staff management               │  │
│  │                                                                            │  │
│  │  STATUS                                                                    │  │
│  │  (●) ACTIVE    ( ) INACTIVE                                                │  │
│  │                                                                            │  │
│  │  [ CANCEL ]                             [ CREATE OPERATIVE ──▶ ]          │  │
│  │                                                                            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 8B — Edit Existing Operative

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [ ← BACK TO STAFF ]                                                             │
│                                                                                 │
│  EDIT OPERATIVE — Sarah Kovalenko                                               │
│  ──────────────────────────────────────────────────────────────────────────── │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                            │  │
│  │  FULL NAME                          USERNAME                              │  │
│  │  [Sarah Kovalenko______________]    [sarah.k (read-only)______________]   │  │
│  │                                                                            │  │
│  │  EMAIL ADDRESS                                                             │  │
│  │  [sarah.k@whi.agency_____________________________________]                │  │
│  │                                                                            │  │
│  │  ACCESS ROLE                                                               │  │
│  │  (●) ANALYST — Can view briefings and manage prospects                    │  │
│  │  ( ) ADMIN   — Full system access including staff management               │  │
│  │                                                                            │  │
│  │  STATUS                                                                    │  │
│  │  (●) ACTIVE    ( ) INACTIVE                                                │  │
│  │                                                                            │  │
│  │  PASSWORD RESET                                                            │  │
│  │  [ ISSUE TEMPORARY PASSWORD ]   ← admin sets a temp, user must change     │  │
│  │                                                                            │  │
│  │  [ CANCEL ]                                      [ SAVE CHANGES ──▶ ]     │  │
│  │                                                                            │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- Username is read-only on edit (cannot be changed after creation)
- "ISSUE TEMPORARY PASSWORD" = text field appears, admin types temp password, user forced to change on next login
- Deactivating yourself as admin is blocked with an error message
- "CREATE OPERATIVE" triggers form validation: all required fields, username uniqueness check, email format
- Success → redirect back to Staff list with toast: "OPERATIVE [NAME] AUTHORIZED"

---

---

# SCREEN 09 — Change Password (Forced on First Login)
## `/admin/account/change-password`

```
┌─────────────────────────────────────────────────────────────────────┐
│                         #0b0c0f background                          │
│                                                                     │
│                    ┌─────────────────────────────────────┐          │
│                    │  [WHI LOGO]                         │          │
│                    └─────────────────────────────────────┘          │
│                                                                     │
│         ┌──────────────────────────────────────────────┐           │
│         │  ⚠  SECURITY PROTOCOL REQUIRED               │           │
│         │  ──────────────────────────────────────────  │           │
│         │  You must set a new secure password before   │           │
│         │  accessing the Command Center.               │           │
│         │                                              │           │
│         │  CURRENT PASSWORD                            │           │
│         │  [_________________________________]         │           │
│         │                                              │           │
│         │  NEW PASSWORD                                │           │
│         │  [_________________________________]         │           │
│         │  ── Min 8 characters                         │           │
│         │                                              │           │
│         │  CONFIRM NEW PASSWORD                        │           │
│         │  [_________________________________]         │           │
│         │                                              │           │
│         │  [ SET NEW PASSWORD AND CONTINUE ──────▶ ]  │           │
│         │                                              │           │
│         └──────────────────────────────────────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- This screen appears on first login (when `requirePasswordChange: true`)
- Cannot be bypassed — accessing any `/admin/*` route redirects here until changed
- After successful password change → redirect to `/admin/dashboard`
- Same dark aesthetic as the login screen

---

---

# SCREEN 10 — Confirm Delete Modal (Briefing)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ██████████████████████████████████████████████████████████████████ │
│  █                                                                ██ │
│  █  ┌─────────────────────────────────────────────────────────┐  ██ │
│  █  │  ⚠ CONFIRM INTELLIGENCE DELETION                        │  ██ │
│  █  │  ─────────────────────────────────────────────────────  │  ██ │
│  █  │                                                          │  ██ │
│  █  │  You are about to permanently delete:                   │  ██ │
│  █  │                                                          │  ██ │
│  █  │  Recon Brief #a4f2-...                                  │  ██ │
│  █  │  Apex Logistics Co · May 27, 2026                       │  ██ │
│  █  │                                                          │  ██ │
│  █  │  This action cannot be undone. The linked prospect      │  ██ │
│  █  │  record will be preserved.                              │  ██ │
│  █  │                                                          │  ██ │
│  █  │  [ CANCEL ]               [ CONFIRM DELETE — RED btn ]  │  ██ │
│  █  │                                                          │  ██ │
│  █  └─────────────────────────────────────────────────────────┘  ██ │
│  █                                                                ██ │
│  ██████████████████████████████████████████████████████████████████ │
└─────────────────────────────────────────────────────────────────────┘
```

---

---

# SCREEN 11 — 403 Access Denied (Analyst accessing Staff)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ▌ WHI          [□] DASHBOARD  [□] BRIEFINGS  [□] PROSPECTS  [■] STAFF      [↪]│
│ ▌ COMMAND     ─────────────────────────────────────────────────────── [Admin ▼]│
│ ▌ CENTER                                                                        │
│ ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│                                                                                 │
│                        ┌───────────────────────────┐                           │
│                        │  ⊘  ACCESS RESTRICTED     │  ← amber icon            │
│                        │                           │                           │
│                        │  CLEARANCE LEVEL          │                           │
│                        │  INSUFFICIENT             │                           │
│                        │                           │                           │
│                        │  This section requires    │                           │
│                        │  ADMIN authorization.     │                           │
│                        │  Contact your Command     │                           │
│                        │  Center administrator.    │                           │
│                        │                           │                           │
│                        │  [ ← RETURN TO DASHBOARD] │                           │
│                        └───────────────────────────┘                           │
│                                                                                 │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

---

# Navigation Summary

```
PUBLIC SITE (unchanged)
  /                           → Landing page (App.tsx)
  /#dna                       → Reconnaissance Briefing section + form
  /api/assess                 → Submit questionnaire (POST)

ADMIN AREA
  /admin                      → Redirect → /admin/login or /admin/dashboard
  /admin/login                → Screen 01: Login
  /admin/account/change-password → Screen 09: Forced password change

  [Protected — all staff]
  /admin/dashboard            → Screen 02: Command Center Home
  /admin/briefings            → Screen 03: Recon Briefings List
  /admin/briefings/:id        → Screen 04: Briefing Detail
  /admin/prospects            → Screen 05: Prospects CRM List
  /admin/prospects/:id        → Screen 06: Prospect Detail

  [Protected — admin only]
  /admin/staff                → Screen 07: Staff Management
  /admin/staff/new            → Screen 08A: Create Operative
  /admin/staff/:id            → Screen 08B: Edit Operative
```

---

# Design Tokens (Consistent with Public Site)

```
Background      #0b0c0f    (primary dark)
Surface         #12151c    (card/panel)
Border          #1c1e26    (subtle dividers)
Amber Accent    #bc993c    (primary CTA, headings, active states)
Amber Hover     #a68634    (button hover)
Text Primary    #e8e4da    (body)
Text Secondary  #a39e94    (labels, meta)
Text Muted      #5a5650    (placeholders, captions)
Score Green     #308c5f    (7.0+ scores)
Score Amber     #b67820    (5.0–6.9 scores)
Score Red       #b13b3f    (< 5.0 scores)
Mono Font       font-mono  (labels, codes, IDs)
Serif Font      font-serif (headings)
```

---

*Wireframes prepared May 27, 2026 — Awaiting approval before execution*
