# WHI Agency — Blog System Integration Plan
**Version:** 2.0 (Audited & Updated)  
**Date:** June 2, 2026  
**Branch:** alpha  
**Source concept:** `.codebase/concepts/blog/` (to be deleted after execution)  
**Goal:** Fully integrate the blog/Insights system into the main codebase with a live backend, zero localStorage dependency, and no disruption to the existing DNA Questionnaire + Admin panel.

---

## Audit Results — Issues Found & Resolved in v2.0

The following 20 issues were identified during codebase audit of the plan against the live code and corrected below:

1. **`BlogSolutionItem` type was incomplete** — Concept's phase view uses `items: [{title, desc}]` per phase but the original plan only had `highlights: string[]`. Fixed: added `phaseItems?: Array<{title: string; desc: string}>` to `BlogSolutionItem`.
2. **`BlogSolutionItem` missing `videoUrl`** — Solution 01 in the concept embeds a hardcoded Google Drive video. Fixed: added `videoUrl?: string` to `BlogSolutionItem`.
3. **`UnpuzzledCaseStudy.tsx` hardcoded "Behind the Consultation" section** — Two paragraphs of static text not from `post.content`. Fixed: this text is stored in `post.content` as markdown in the seed data.
4. **`UnpuzzledCaseStudy.tsx` hardcoded "Explore More" related posts** — Three placeholder case study cards at the bottom have no data backing. Fixed: these are rendered from other published posts fetched at page load, or shown as empty/hidden if no other posts exist.
5. **`SharedHeader` not in file manifest** — Plan referenced a "SharedHeader" component that doesn't exist. Fixed: blog pages render their own dark nav bar (inline, not a shared component) — no existing code extracted or broken.
6. **`server.ts` startup missing `blogRepo.reconcileIndex()`** — All existing repos call `reconcileIndex()` on startup. Fixed: added to startup sequence.
7. **`ListOptions` has a specific sortBy union** — Existing `ListOptions.sortBy` is typed as a fixed union of briefing/prospect-specific field names. Fixed: confirmed `BlogListOptions` is a fully separate interface (no conflict).
8. **App.tsx nav uses `<button>` not `<Link>`** — All current nav items are scroll buttons. Adding "Insights" requires a `<Link>` not a scroll button. Fixed: explicitly specified as `<Link to="/blog">` using react-router-dom (already available via BrowserRouter context in main.tsx).
9. **App.tsx does not currently import react-router-dom** — Fixed: explicit import additions listed in Step 13.
10. **`publishDate` format inconsistency** — Concept stores human-readable strings (e.g. "Jun 2, 2026"). Backend must use ISO8601 for consistent sorting. Fixed: backend always stores ISO8601; frontend formats for display.
11. **`BlogEditorPage.tsx` date input** — Admin must be able to set publish date. Fixed: use a `<input type="date">` field; convert to/from ISO8601 on load and save.
12. **`fillDemoTemplate` in concept editor** — Retained in `BlogEditorPage.tsx` as a developer convenience feature.
13. **`UnpuzzledCaseStudy.tsx` sidebar sections** — "What is WHI DNA?" and "Request Case Briefing" sidebar panels are hardcoded text. Fixed: preserved as-is (they are branding content, not data-driven). "Request Case Briefing" button scrolls to `/#assessment-portal`.
14. **Concept solutions accordion is light-themed** — All `bg-white`, `border-slate-200` etc. must be converted to dark theme in migration. Fixed: explicitly called out per-section in Step 12.
15. **`src/pages/blog/` directory needs to be created** — Added to execution notes.
16. **`reconcileIndex()` missing from `BlogRepository` interface** — Fixed: added to the interface definition for consistency with other repos.
17. **Client-side vs server-side filtering mismatch** — Concept does ALL filtering client-side. Production version must trigger new API calls on filter change. Fixed: explicitly specified in Step 11.
18. **`AdminStats` interface update location in `api.ts`** — The exact existing interface block is now specified in Step 10.
19. **"Related posts" section** — needs data backing. Fixed: `BlogPostPage.tsx` fetches `GET /api/blog?pageSize=3` on mount to populate "Explore More" with real published posts (excluding current post).
20. **`UnpuzzledCaseStudy.tsx` "Behind the Consultation" section is light-themed** — Fixed: converted to dark `bg-[#12151c]` in migration.

---

## Guiding Decisions (Pre-answered Questions)

| Question | Decision |
|---|---|
| Where does the public blog live in the URL tree? | `/blog` and `/blog/:slug` — separate from the main marketing page scroll sections |
| How does the public blog relate to the marketing site nav? | Add a "Insights" nav link in the main site header (App.tsx) that routes to `/blog` |
| What ID strategy? | UUID as canonical `id`, add a `slug` field (kebab-case, unique) for readable URLs |
| Blog stored alongside other data? | Yes — `data/json/dna/questionnaire/posts/` + `_index/posts.json`, following exact existing pattern |
| Who can create/edit/delete posts? | `requireAuth` for create/update (any logged-in staff); `requireAdmin` for delete |
| Color palette for public blog? | Dark theme matching main site — `bg-[#0b0c0f]`, `text-[#e8e4da]`, `#bc993c` accents — NOT the light slate concept palette |
| Color palette for admin blog pages? | Match existing admin dark theme — same as BriefingsPage, DashboardPage |
| Is the Unpuzzled case study seed data needed? | Yes — `seedService.ts` extended to seed the Unpuzzled post on first run if no posts exist |
| What happens to the concept's `localStorage` state? | Removed entirely — all reads/writes go through REST API |
| Does the concept's `BlogEditor` become an admin page? | Yes — migrated and rewritten to use API calls, styled to admin dark theme |
| Does `UnpuzzledCaseStudy.tsx` become a reusable template or a one-off? | Reusable — it renders any `BlogPost` with `type === 'case-study'` — the Unpuzzled post is just seed data |
| Does the blog break existing routes? | No — blog is additive only. No existing routes change. |
| Is `motion/react` available? | Yes — already in `package.json` |
| Are any new npm packages needed? | No — all required packages already installed |

---

## Architecture Overview

```
PUBLIC ROUTES                       ADMIN ROUTES
─────────────────────────────       ──────────────────────────────────────
GET  /blog                          GET    /admin/blog
GET  /blog/:slug                    GET    /admin/blog/new
                                    GET    /admin/blog/:id/edit
                                    
API ROUTES (public)                 API ROUTES (admin, JWT protected)
─────────────────────────────       ──────────────────────────────────────
GET  /api/blog                      GET    /api/admin/blog
GET  /api/blog/:slug                GET    /api/admin/blog/:id
                                    POST   /api/admin/blog
                                    PATCH  /api/admin/blog/:id
                                    DELETE /api/admin/blog/:id  (admin only)
```

### Data Flow

```
Browser (React)
  │
  ├── Public: fetch /api/blog[/:slug]
  │     └── publicBlog route (no auth)
  │           └── JsonBlogRepository.findAll({ published: true })
  │                 └── data/json/dna/questionnaire/_index/posts.json
  │                       └── data/json/dna/questionnaire/posts/{uuid}.json
  │
  └── Admin: fetch /api/admin/blog[...]  (Bearer JWT)
        └── adminBlog route (requireAuth / requireAdmin)
              └── JsonBlogRepository (full CRUD)
```

---

## File Manifest — What Gets Created / Modified / Deleted

### NEW FILES

```
server/
  repositories/
    JsonBlogRepository.ts          ← CRUD repository (mirrors JsonBriefingRepository pattern)
  routes/
    publicBlog.ts                  ← GET /api/blog, GET /api/blog/:slug
    adminBlog.ts                   ← Full admin CRUD

src/
  types/
    blog.ts                        ← BlogPost + all sub-types (Author, ClientInfo, etc.)
  utils/
    googleDrive.ts                 ← getGoogleDriveDirectLink() moved from concept
  pages/
    blog/
      BlogPage.tsx                 ← Public hub (migrated BlogHub.tsx, dark theme)
      BlogPostPage.tsx             ← Public post detail + case study renderer
  admin/
    pages/
      BlogsPage.tsx                ← Admin blog list (pattern: BriefingsPage.tsx)
      BlogEditorPage.tsx           ← Admin create/edit (migrated BlogEditor.tsx)
```

### MODIFIED FILES

```
server/
  repositories/
    interfaces.ts                  ← Add BlogPost, BlogIndex, BlogRepository, ListOptions blog fields
  services/
    seedService.ts                 ← Add blog seed (Unpuzzled post on first run)
server.ts                          ← Wire publicBlog + adminBlog routes + JsonBlogRepository
src/
  types.ts                         ← Re-export from src/types/blog.ts
  App.tsx                          ← Add /blog/* routes, "Insights" nav link
  admin/
    AdminApp.tsx                   ← Add /admin/blog/*, /admin/blog/new, /admin/blog/:id/edit routes
    components/
      AdminLayout.tsx              ← Add "Blog" nav item (BookOpen icon)
    services/
      api.ts                       ← Add all blog API functions
    pages/
      DashboardPage.tsx            ← Add blog stat cards (postCount, publishedCount, draftCount)
  admin/
    routes/
      adminStats.ts                ← Add blog metrics to stats response
```

### DELETED (after full execution)

```
.codebase/concepts/blog/           ← Entire directory removed
```

---

## Wireframes

### WF-1: Public Blog Hub — `/blog`

```
┌──────────────────────────────────────────────────────────────────┐
│ [STICKY HEADER — same as main site, dark bg-[#0b0c0f]]           │
│  WHI LOGO    Paradigm / DNA / Solutions / ... / [Insights] / CTA │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ bg-[#0b0c0f]  px-4 py-16 max-w-7xl                              │
│                                                                  │
│  ● LIVE  METRIC CHANNELS OPERATIONAL: 2026          [font-mono]  │
│                                                                  │
│  Insights & Intelligence                [text-[#e8e4da] text-5xl]│
│  Strategic roadmaps, audits, and case analyses from WHI.         │
│                                                    [Search ____] │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ★ SPOTLIGHT STRATEGIC CASE ANALYSIS                              │
│ ┌─────────────────────────────┬──────────────────────────────┐  │
│ │ CATEGORY badge  ⏱ read time │  [featured post image hero]  │  │
│ │                             │  dark overlay + audit brief  │  │
│ │ Title (large, hover:red)    │  badge                       │  │
│ │                             │                              │  │
│ │ Excerpt text                │                              │  │
│ │                             │                              │  │
│ │ #tag  #tag  #tag            │                              │  │
│ │ ─────────────────────────── │                              │  │
│ │ [avatar] Author  Role   →   │                              │  │
│ └─────────────────────────────┴──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────┬───────────────────────────────────────────────────┐
│ FILTERS RAIL │  POST GRID  (3-col on desktop, 1-col mobile)      │
│              │                                                   │
│ Publication  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│ Type         │  │ [image]  │  │ [image]  │  │ [image]  │       │
│ ○ All (n)    │  │ category │  │ category │  │ category │       │
│ ○ Case Study │  │ Title    │  │ Title    │  │ Title    │       │
│ ○ Article    │  │ Excerpt  │  │ Excerpt  │  │ Excerpt  │       │
│              │  │ #tag     │  │ #tag     │  │ #tag     │       │
│ Categories   │  │ author   │  │ author   │  │ author   │       │
│ [dynamic]    │  └──────────┘  └──────────┘  └──────────┘       │
│              │                                                   │
│ Tags         │  [Load More / Pagination]                        │
│ [dynamic]    │                                                   │
└──────────────┴───────────────────────────────────────────────────┘

[FOOTER — matching main site]
```

**Colour mapping from concept → production dark theme:**

| Concept (light)       | Production (dark)          |
|---|---|
| `bg-slate-50`         | `bg-[#0b0c0f]`             |
| `text-slate-900`      | `text-[#e8e4da]`           |
| `bg-white`            | `bg-[#12151c]`             |
| `border-slate-200`    | `border-[#1c1e26]`         |
| `text-red-600` (CTA)  | `text-[#bc993c]`           |
| `bg-slate-900` badge  | `bg-[#bc993c]/20` + border |
| `text-slate-500`      | `text-stone-500`           |

---

### WF-2: Public Blog Post Detail — `/blog/:slug`

```
┌──────────────────────────────────────────────────────────────────┐
│ [STICKY BREADCRUMB BAR — bg-[#12151c] border-b]                  │
│  ← Back to Insights              [CATEGORY badge]  [Share][Save] │
└──────────────────────────────────────────────────────────────────┘

IF post.type === 'case-study' AND post.id === 'unpuzzled-aba-success'
  → renders <CaseStudyLayout post={post} /> (migrated UnpuzzledCaseStudy.tsx)
  
IF post.type === 'case-study' AND any other case study
  → renders <CaseStudyLayout post={post} /> (same generic template)

IF post.type === 'article'
  → renders <ArticleLayout post={post} />

─────────────────────────────
CASE STUDY LAYOUT:

┌──────────────────────────────────────────────────────────────────┐
│ bg-black  py-16  [ambient background image + grid overlay]       │
│                                                                  │
│  [client logo or fallback SVG]                                   │
│  CASE STUDY BRIEFING          [amber text-xs font-mono]          │
│  Post Title                   [text-5xl font-extrabold white]    │
│  Subtitle                     [text-xl text-slate-400]           │
│  Author | Date | Read Time    [metadata row]                     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ CLIENT INTEL                                                     │
│  Industry: ___   Location: ___   Profile: ___                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ CRITICAL VULNERABILITIES         [red alert icons]               │
│  [title]  [desc]  ...                                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ GROWTH ROADMAP PHASES  [tab selector: Phase 1 / 2 / 3]           │
│  Active phase items list with animated reveal                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ PLAYBOOK SOLUTIONS  [accordion / card list]                      │
│  01  Solution Title  —  desc  — highlights                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ VERIFIED OUTCOMES  [metric grid]                                 │
│  [10X]  label  desc  |  [62%]  label  desc                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ CLIENT QUOTE  [dark card, italic]                                │
└──────────────────────────────────────────────────────────────────┘

─────────────────────────────
ARTICLE LAYOUT:

┌──────────────────────────────────────────────────────────────────┐
│ bg-[#0b0c0f]  py-16                                             │
│  INSIGHT ANALYSIS  [text-[#bc993c] font-mono uppercase]          │
│  Post Title                   [text-5xl font-extrabold]          │
│  Author | Date | Read Time    [metadata row]                     │
│  [hero image full-width with overlay]                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ max-w-3xl centered prose                                         │
│  [markdown content rendered as HTML — no external library,       │
│   use simple regex/split renderer for headings, bold, lists]     │
└──────────────────────────────────────────────────────────────────┘
```

---

### WF-3: Admin Blog List — `/admin/blog`

```
┌─────────────────────────────────────────────────────────────────┐
│ [Admin Sidebar — existing layout, + Blog nav item]              │
│                                                                 │
│  Dashboard                                                      │
│  Recon Briefings                                                │
│  Prospects                                                      │
│  ─────────────────                                              │
│  📖 Blog & Insights  ← NEW nav item                             │
│  ─────────────────                                              │
│  [ADMIN] Staff                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Blog & Insights                        [+ New Post button]      │
│ XX TOTAL  (YY published, ZZ drafts)                             │
│                                                                 │
│ [Search input]  [Type: All / Case Study / Article]              │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐    │
│ │ Title    │ Type       │ Category │ Status  │ Date   │ Act │   │
│ ├──────────────────────────────────────────────────────────┤    │
│ │ Post A   │ Case Study │ ABA Hlth │ ● Live  │ Jun 1  │ ✏  │   │
│ │ Post B   │ Article    │ Ops Plan │ ○ Draft │ May 28 │ ✏  │   │
│ └──────────────────────────────────────────────────────────┘    │
│                                                                 │
│ [← Prev]  Page 1 of N  [Next →]                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### WF-4: Admin Blog Editor — `/admin/blog/new` and `/admin/blog/:id/edit`

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to Blog List                                             │
│ New Post / Edit: "Post Title"                                   │
│                                                                 │
│ [General] [Content] [Case Study]  ← tab switcher               │
│ ────────────────────────────────────────────────────────────    │
│                                                                 │
│ GENERAL TAB:                                                    │
│  Title ___________________  Subtitle ___________________        │
│  Excerpt (textarea) ____________________________________        │
│  Category ___________  Tags (comma sep) _______________         │
│  Type: ● Article  ○ Case Study                                 │
│  Read Time ______   Image URL ______________________________    │
│  Author Name _______  Role ___________  Avatar URL ________    │
│  [★ Featured]  [✓ Published]                                   │
│                                                                 │
│ CONTENT TAB:                                                    │
│  Markdown Body (textarea, full width, monospace)                │
│                                                                 │
│ CASE STUDY TAB (only shown if type === case-study):             │
│  Client Industry ______  Location _______  Profile _______     │
│                                                                 │
│  CRITICAL VULNERABILITIES              [+ Add Vulnerability]    │
│  [title] [desc]  [✕]                                           │
│                                                                 │
│  SOLUTIONS / PLAYBOOK PILLARS          [+ Add Solution]         │
│  [01] [title] [desc] [highlights]  [✕]                         │
│                                                                 │
│  RESULTS / METRICS                     [+ Add Metric]           │
│  [10X] [label] [desc]  [✕]                                     │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│ [Load Demo Template]  [Fill Case Study Demo]   [Save Post →]   │
└─────────────────────────────────────────────────────────────────┘
```

---

### WF-5: Dashboard Stats Update

```
┌──────────────────────────────────────────────────────────────────┐
│ EXISTING STAT CARDS:                                             │
│ [Recon Briefings]  [Prospects]  [Avg Score]  [Active Operatives] │
│                                                                  │
│ NEW STAT CARDS (added row):                                      │
│ [Blog Posts]       [Published]  [Drafts]                         │
│  total posts        live posts   unpublished                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Execution Steps — In Order

Each step is self-contained and testable before moving to the next. No step breaks the existing system.

---

### STEP 1 — Extend `interfaces.ts` with Blog types

**File:** `server/repositories/interfaces.ts`

The existing `ListOptions` interface has a narrowly typed `sortBy` union: `'submittedAt' | 'overallScore' | 'businessName' | 'createdAt' | 'updatedAt'`. Do NOT modify it. Blog uses a fully separate `BlogListOptions`.

Add after the `ProspectRepository` block (end of file):

```typescript
// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export interface BlogClientInfo {
  industry: string;
  location: string;
  profile: string;
}

export interface BlogVulnerability {
  title: string;
  desc: string;
}

// phaseItems mirrors the concept's per-phase sub-items {title, desc}.
// videoUrl is for embedding a Google Drive or hosted video inside a solution expansion.
export interface BlogSolutionItem {
  num: string;
  title: string;
  desc: string;
  highlights?: string[];                          // short outcome bullet strings
  phaseItems?: Array<{ title: string; desc: string }>; // for growth roadmap phase view
  videoUrl?: string;                              // optional embedded video URL
}

export interface BlogMetricItem {
  value: string;
  label: string;
  desc: string;
}

export interface BlogQuoteItem {
  text: string;
  author: string;
  role: string;
}

export interface BlogPost {
  id: string;             // UUID
  slug: string;           // kebab-case, unique, URL-safe — set on create, never changes
  type: 'case-study' | 'article';
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;        // markdown prose body (articles) or supplemental text (case studies)
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;    // ISO8601 — formatted for display on the frontend
  published: boolean;
  featured?: boolean;
  author: BlogAuthor;
  image: string;
  logo?: string;          // client logo URL (Google Drive or hosted)
  clientInfo?: BlogClientInfo;
  criticalVulnerabilities?: BlogVulnerability[];
  solutions?: BlogSolutionItem[];
  results?: BlogMetricItem[];
  quotes?: BlogQuoteItem[];
  createdAt: string;      // ISO8601
  updatedAt: string;      // ISO8601
}

// BlogIndex is the lightweight summary stored in the flat index file.
// It contains everything needed to render a blog card — never includes
// content, solutions, vulnerabilities, results, or quotes.
export interface BlogIndex {
  id: string;
  slug: string;
  type: 'case-study' | 'article';
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;
  published: boolean;
  featured?: boolean;
  author: BlogAuthor;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// Separate from ListOptions to avoid polluting the existing shared interface
// (ListOptions.sortBy has a fixed union scoped to Briefing/Prospect fields).
export interface BlogListOptions {
  page?: number;
  pageSize?: number;
  search?: string;       // matches title, excerpt, category, tags
  type?: 'case-study' | 'article';
  category?: string;
  tag?: string;
  published?: boolean;   // undefined = all; true = published only; false = drafts only
  sortBy?: 'publishDate' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface BlogRepository {
  create(data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost>;
  findById(id: string): Promise<BlogPost | null>;
  findBySlug(slug: string): Promise<BlogPost | null>;
  findAll(opts?: BlogListOptions): Promise<{ items: BlogIndex[]; total: number }>;
  update(id: string, patch: Partial<Omit<BlogPost, 'id' | 'createdAt'>>): Promise<BlogPost | null>;
  delete(id: string): Promise<void>;
  reconcileIndex(): Promise<void>; // consistent with BriefingRepository / ProspectRepository
}
```

**Test:** `npm run lint` passes with no errors.

---

### STEP 2 — Create `JsonBlogRepository.ts`

**File:** `server/repositories/JsonBlogRepository.ts` (new)

Follows the exact same `AsyncMutex` + `atomicWrite` + index/individual-file pattern as `JsonBriefingRepository.ts`.

```typescript
// Full implementation skeleton:

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type { BlogPost, BlogIndex, BlogRepository, BlogListOptions } from './interfaces.js';

// AsyncMutex — copy exactly from JsonBriefingRepository.ts (same class)
// atomicWrite — copy exactly
// ensureDir — copy exactly

export class JsonBlogRepository implements BlogRepository {
  private readonly postsDir: string;        // dataPath/posts/
  private readonly indexFile: string;       // dataPath/_index/posts.json
  private readonly indexMutex = new AsyncMutex();

  constructor(dataPath: string) {
    this.postsDir = path.join(dataPath, 'posts');
    this.indexFile = path.join(dataPath, '_index', 'posts.json');
    Promise.all([
      ensureDir(this.postsDir),
      ensureDir(path.join(dataPath, '_index')),
    ]).catch(() => {});
  }

  // create(): generate UUID id, set createdAt/updatedAt, write post file, update index
  // findById(): read posts/{id}.json
  // findBySlug(): read index, find matching slug, then findById
  // findAll(opts): read index, apply filters (published, type, category, tag, search),
  //               sort, paginate — returns { items: BlogIndex[], total: number }
  // update(): read post file, merge patch, write back, update index entry
  // delete(): delete post file, remove from index
}
```

**Slug generation rule:** `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)` — called on create only; never changes on update (to preserve URLs). If caller provides a slug in the create payload, use that directly.

**Slug collision handling:** After generating the slug, check the index for any existing entry with the same slug. If a collision exists, append `-2`, `-3`, etc. until unique.

**`reconcileIndex()`:** Reads all `posts/*.json` files, rebuilds the `_index/posts.json` from scratch. Same pattern as `JsonBriefingRepository.reconcileIndex()`.

**`.js` extension rule:** All imports inside `server/repositories/JsonBlogRepository.ts` must use the `.js` extension on local imports (e.g. `import type { BlogPost } from './interfaces.js'`) to match the ESM module resolution in the rest of the backend.

**Test:** `npm run lint` — no errors. Repository instantiates without errors in `server.ts`.

---

### STEP 3 — Create `server/routes/publicBlog.ts`

**File:** `server/routes/publicBlog.ts` (new)

```typescript
import { Router } from 'express';
import type { Request, Response } from 'express';
import type { JsonBlogRepository } from '../repositories/JsonBlogRepository.js';

export function createPublicBlogRouter(blogRepo: JsonBlogRepository) {
  const router = Router();

  // GET /api/blog
  // Query: page, pageSize, type, category, tag, search
  // ALWAYS filters published: true — never exposes drafts publicly
  router.get('/', async (req: Request, res: Response) => {
    const { page, pageSize, type, category, tag, search } = req.query;
    const result = await blogRepo.findAll({
      page: page ? parseInt(String(page), 10) : 1,
      pageSize: pageSize ? parseInt(String(pageSize), 10) : 12,
      search: search ? String(search) : undefined,
      type: type as any,
      category: category ? String(category) : undefined,
      tag: tag ? String(tag) : undefined,
      published: true,   // HARDCODED — public route only returns published posts
    });
    res.json(result);
  });

  // GET /api/blog/:slug
  // Returns single post if published. 404 if not found or not published.
  router.get('/:slug', async (req: Request, res: Response) => {
    const post = await blogRepo.findBySlug(req.params.slug);
    if (!post || !post.published) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    res.json(post);
  });

  return router;
}
```

**Security note:** The `published: true` guard is hardcoded and cannot be bypassed by query params. Draft posts are invisible to unauthenticated callers.

**Test:** `curl http://localhost:3000/api/blog` returns `{ items: [], total: 0 }` before seed runs.

---

### STEP 4 — Create `server/routes/adminBlog.ts`

**File:** `server/routes/adminBlog.ts` (new)

```typescript
import { Router } from 'express';
import type { Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import type { JsonBlogRepository } from '../repositories/JsonBlogRepository.js';

// Reuse the sanitize helper — import from server.ts or duplicate inline
function sanitizeField(s: string, maxLen = 5000): string {
  return s.replace(/[<>`\\]/g, '').replace(/\[INST\]|\[\/INST\]|###/g, '').trim().slice(0, maxLen);
}

export function createAdminBlogRouter(blogRepo: JsonBlogRepository) {
  const router = Router();

  // GET /api/admin/blog — all posts (drafts + published)
  router.get('/', requireAuth, async (req: Request, res: Response) => { ... });

  // GET /api/admin/blog/:id
  router.get('/:id', requireAuth, async (req: Request, res: Response) => { ... });

  // POST /api/admin/blog — create new post
  // Validates: title, excerpt required; sanitizes all string fields
  router.post('/', requireAuth, async (req: Request, res: Response) => { ... });

  // PATCH /api/admin/blog/:id — update post
  // Only allows patching: title, subtitle, excerpt, content, category, tags,
  //   readTime, publishDate, published, featured, author, image, logo,
  //   clientInfo, criticalVulnerabilities, solutions, results, quotes
  // Does NOT allow patching: id, slug, createdAt
  router.patch('/:id', requireAuth, async (req: Request, res: Response) => { ... });

  // DELETE /api/admin/blog/:id — admin only
  router.delete('/:id', requireAdmin, async (req: Request, res: Response) => { ... });

  return router;
}
```

**Test:** All CRUD operations work via curl/Postman with valid JWT.

---

### STEP 5 — Wire blog routes into `server.ts`

**File:** `server.ts`

Add to the existing repository imports block (top of file, with other repository imports):
```typescript
import { JsonBlogRepository } from "./server/repositories/JsonBlogRepository.js";
```

Add to the existing routes imports block:
```typescript
import { createPublicBlogRouter } from "./server/routes/publicBlog.js";
import { createAdminBlogRouter } from "./server/routes/adminBlog.js";
```

Add after the existing repository instantiations (`const userRepo = ...`, `const briefingRepo = ...`, `const prospectRepo = ...`):
```typescript
const blogRepo = new JsonBlogRepository(DATA_PATH);
```

Add after the existing admin route registrations, before the public prospects route:
```typescript
app.use("/api/admin/blog", createAdminBlogRouter(blogRepo));
```

Add after the existing public routes:
```typescript
app.use("/api/blog", createPublicBlogRouter(blogRepo));
```

Update the `startServer()` function — change the `seedService.seed` call and add `blogRepo.reconcileIndex()`:
```typescript
// Before:
await seedService.seed(userRepo);
await briefingRepo.reconcileIndex();
await prospectRepo.reconcileIndex();

// After:
await seedService.seed(userRepo, blogRepo);
await briefingRepo.reconcileIndex();
await prospectRepo.reconcileIndex();
await blogRepo.reconcileIndex();
```

Also update the `createAdminStatsRouter` call to pass `blogRepo`:
```typescript
// Before:
app.use("/api/admin/stats", createAdminStatsRouter(briefingRepo, prospectRepo, userRepo));

// After:
app.use("/api/admin/stats", createAdminStatsRouter(briefingRepo, prospectRepo, userRepo, blogRepo));
```

**Test:** Server starts without errors. `npm run dev` succeeds.

---

### STEP 6 — Extend `seedService.ts` with Unpuzzled blog post

**File:** `server/services/seedService.ts`

Add a second parameter `blogRepo: JsonBlogRepository`. On startup, if the blog has zero posts, insert the Unpuzzled ABA case study as seed data.

```typescript
import type { JsonBlogRepository } from '../repositories/JsonBlogRepository.js';

export async function seed(
  userRepo: JsonUserRepository,
  blogRepo: JsonBlogRepository,
): Promise<void> {
  // ─── Existing admin user seed (unchanged) ─────────────────────────────────
  const hasAdmin = await userRepo.hasAdminUser();
  if (!hasAdmin) {
    // ... (existing user seed code unchanged)
  }

  // ─── Blog seed ─────────────────────────────────────────────────────────────
  // Only seeds if no posts exist at all.
  const existing = await blogRepo.findAll({ page: 1, pageSize: 1 });
  if (existing.total === 0) {
    await blogRepo.create({
      slug: 'unpuzzled-aba-success',
      type: 'case-study',
      title: 'From 0 to 10X Patient Volume: How Unpuzzled ABA Scaled in Atlanta',
      subtitle: 'A full-spectrum growth roadmap for an ABA therapy center entering a crowded healthcare market.',
      excerpt: 'Unpuzzled ABA faced PE-backed competition and zero brand presence. We mapped a 3-phase growth system delivering 10X patient volume and community authority.',
      // content stores supplemental prose for the "Behind the Consultation" section
      content: `When launching clinical infrastructure, the primary bottleneck is never just advertising — it is clinical staffing ratios. By aligning RBT scaling structures as automated pipeline scripts synced to parent registration gates, WHI was able to scale patient volumes without creating clinical backlogs or violating state-level licensing quotas.\n\nThe introduction of automated accounting systems freed executive leadership from managing billing cycles manually, reducing claims processing delays from weeks down to hours. This efficiency gain enabled direct reinvestment into clinic facilities and client outreach programs.`,
      category: 'Healthcare Growth',
      tags: ['ABA Therapy', 'Healthcare', 'Patient Acquisition', 'Digital Marketing', 'Growth Roadmap'],
      readTime: '8 min read',
      publishDate: new Date().toISOString(),  // ISO8601 — formatted for display on frontend
      published: true,
      featured: true,
      author: {
        name: 'WHI Strategy Team',
        role: 'Growth Intelligence Division',
        avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=120',
      },
      image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
      logo: 'https://docs.google.com/uc?export=view&id=175lRpH57sElHUTpphstCzUuVvBS3KXXG',
      clientInfo: {
        industry: 'ABA Therapy / Behavioral Healthcare',
        location: 'Atlanta, GA',
        profile: 'Startup ABA Therapy Center — Pre-revenue at engagement',
      },
      criticalVulnerabilities: [
        { title: 'PE Competition Pressure', desc: 'Over-saturation from heavily funded corporate ABA competitors dominating paid channels.' },
        { title: 'Zero Brand Presence', desc: 'No local community trust or recognition — starting from a blank slate in a referral-driven industry.' },
        { title: 'Workforce Scarcity', desc: 'Critical shortage of qualified BCBAs and RBTs constraining capacity growth.' },
        { title: 'Payor Complexity', desc: 'Insurance authorization backlogs and multi-payor credential delays slowing intake.' },
      ],
      solutions: [
        {
          num: '01',
          title: 'Foundation Building',
          desc: 'BCBA recruitment, brand identity, digital infrastructure, and pediatrician referral partnerships.',
          highlights: ['Brand identity system', 'SEO-optimized website launch', 'Medical referral pipeline'],
          // phaseItems populates the interactive Growth Roadmap phase view
          phaseItems: [
            { title: 'BCBA Recruitment & Branding', desc: 'Hiring qualified clinical leadership while establishing a mission-driven brand identity.' },
            { title: 'Digital Infrastructure', desc: 'Optimizing website SEO and social media channels to ensure immediate local community visibility.' },
            { title: 'Medical Partnership Outreach', desc: 'Initiating referral-based relationships with regional pediatricians and diagnostic hubs.' },
          ],
          // videoUrl populates the embedded video inside the expanded solution panel
          videoUrl: 'https://drive.google.com/file/d/1TW0rpOBFc0AjoFd2aaGN43BV-aOlvEMQ/preview',
        },
        {
          num: '02',
          title: 'Client Acquisition Engine',
          desc: 'Targeted localized campaigns, RBT workforce scaling, and social proof collection.',
          highlights: ['Localized intent ads', 'Parent seminar pods', 'Review velocity system'],
          phaseItems: [
            { title: 'Targeted Marketing Campaigns', desc: 'Launching localized intent-based digital ads and hosting parents seminar pods.' },
            { title: 'RBT Workforce Scaling', desc: 'Establishing fast, secure onboarding scripts to match support technicians with child count.' },
            { title: 'Social Proof & Referrals', desc: 'Gathering pristine client ratings of safety and clinic atmosphere to drive local reviews.' },
          ],
        },
        {
          num: '03',
          title: 'Expansion & Club Launch',
          desc: 'The Unpuzzled Club ecosystem, content library, and multi-site template development.',
          highlights: ['Membership portal', 'Clinical podcast', 'Regional expansion template'],
          phaseItems: [
            { title: 'The Unpuzzled Club Ecosystem', desc: 'Launching custom membership portals, sibling clubs, and parent therapy circles.' },
            { title: 'Educational Content Library', desc: 'Establishing an authoritative clinical podcast and syndicating parenting guidebooks.' },
            { title: 'Sustained Growth Systems', desc: 'Developing regional multi-site templates and secondary market pipeline funnels.' },
          ],
        },
      ],
      results: [
        { value: '10X', label: 'Patient Volume', desc: 'Monthly active patients from launch baseline to 12-month mark.' },
        { value: '3', label: 'Growth Phases', desc: 'Systematic roadmap executed across Foundation, Acquisition, and Expansion phases.' },
        { value: '#1', label: 'Local Authority', desc: 'Top-ranked ABA provider in targeted Atlanta zip codes by Google Maps.' },
      ],
      quotes: [
        {
          text: '"Partnering with WHI Agency transformed how we connect with local families. Because of the foundation we built during the DNA process, we\'ve been able to reach and enroll more children..."',
          author: 'Tonette Murphy',
          role: 'Unpuzzled ABA Founder',
        },
      ],
    });
    console.log('[WHI] Blog seed: Unpuzzled ABA case study created.');
  }
}
```

**Test:** On `npm run dev` from clean state, `data/json/dna/questionnaire/posts/` directory is created and contains one post file. `GET /api/blog` returns 1 item.

---

### STEP 7 — Extend `adminStats.ts` with blog counts

**File:** `server/routes/adminStats.ts`

The current function signature is:
```typescript
export function createAdminStatsRouter(
  briefingRepo: JsonBriefingRepository,
  prospectRepo: JsonProspectRepository,
  userRepo: JsonUserRepository,
)
```

Change to add `blogRepo` as a 4th parameter:
```typescript
export function createAdminStatsRouter(
  briefingRepo: JsonBriefingRepository,
  prospectRepo: JsonProspectRepository,
  userRepo: JsonUserRepository,
  blogRepo: JsonBlogRepository,
)
```

Add import at top of file:
```typescript
import type { JsonBlogRepository } from '../repositories/JsonBlogRepository.js';
```

Add to the `Promise.all` inside the handler (or as a separate parallel query after):
```typescript
const allBlogPosts = await blogRepo.findAll({ page: 1, pageSize: 10000 });
const publishedBlogCount = allBlogPosts.items.filter(p => p.published).length;
const draftBlogCount = allBlogPosts.total - publishedBlogCount;

res.json({
  // ...all existing fields unchanged...
  blogPostCount: allBlogPosts.total,
  publishedBlogCount,
  draftBlogCount,
});
```

The `server.ts` update to pass `blogRepo` is covered in Step 5.

**Test:** `GET /api/admin/stats` returns `blogPostCount`, `publishedBlogCount`, `draftBlogCount`.

---

### STEP 8 — Create `src/types/blog.ts`

**File:** `src/types/blog.ts` (new — create the `src/types/` directory)

This is the exact frontend mirror of the backend interfaces. Must stay in sync with `server/repositories/interfaces.ts`. Includes the `phaseItems` and `videoUrl` fields added in Step 1.

```typescript
export interface BlogAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export interface BlogClientInfo {
  industry: string;
  location: string;
  profile: string;
}

export interface BlogVulnerability {
  title: string;
  desc: string;
}

export interface BlogSolutionItem {
  num: string;
  title: string;
  desc: string;
  highlights?: string[];
  phaseItems?: Array<{ title: string; desc: string }>;
  videoUrl?: string;
}

export interface BlogMetricItem {
  value: string;
  label: string;
  desc: string;
}

export interface BlogQuoteItem {
  text: string;
  author: string;
  role: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  type: 'case-study' | 'article';
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;    // ISO8601 from API — format with toLocaleDateString for display
  published: boolean;
  featured?: boolean;
  author: BlogAuthor;
  image: string;
  logo?: string;
  clientInfo?: BlogClientInfo;
  criticalVulnerabilities?: BlogVulnerability[];
  solutions?: BlogSolutionItem[];
  results?: BlogMetricItem[];
  quotes?: BlogQuoteItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogIndex {
  id: string;
  slug: string;
  type: 'case-study' | 'article';
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: string;
  publishDate: string;
  published: boolean;
  featured?: boolean;
  author: BlogAuthor;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// Utility: format ISO8601 publishDate for display
export function formatPublishDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
```

Also add re-export to existing `src/types.ts` (append at end of file — do not modify existing type definitions):
```typescript
export type { BlogPost, BlogIndex, BlogAuthor, BlogClientInfo,
  BlogVulnerability, BlogSolutionItem, BlogMetricItem, BlogQuoteItem } from './types/blog';
export { formatPublishDate } from './types/blog';
```

**Test:** `npm run lint` — no errors.

---

### STEP 9 — Create `src/utils/googleDrive.ts`

**File:** `src/utils/googleDrive.ts` (new)

Direct migration of `.codebase/concepts/blog/src/utils.ts`. No changes to logic.

```typescript
export function getGoogleDriveDirectLink(url: string | undefined): string {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com')) {
    const fileIdMatch = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || 
                        trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://docs.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
  }
  return trimmedUrl;
}
```

**Test:** Unit-testable in isolation. Used by BlogPage, BlogPostPage, and admin editor preview.

---

### STEP 10 — Add blog API functions to `src/admin/services/api.ts`

**File:** `src/admin/services/api.ts`

First, update the existing `AdminStats` interface (it's currently defined around line 125). Add three fields:
```typescript
export interface AdminStats {
  briefingCount: number;
  prospectCount: number;
  newProspectCount: number;
  avgScore: number;
  activeStaffCount: number;
  recentBriefings: BriefingIndex[];
  recentProspects: ProspectIndex[];
  // ── New blog fields ──
  blogPostCount: number;
  publishedBlogCount: number;
  draftBlogCount: number;
}
```

Then append the following block at the **end** of `api.ts` (after the last `patchUser` function):

```typescript
// ─── Blog ─────────────────────────────────────────────────────────────────────

import type { BlogPost, BlogIndex } from '../../types/blog';

export type { BlogPost, BlogIndex };

export interface BlogPagedResult {
  items: BlogIndex[];
  total: number;
}

export async function fetchAdminBlogPosts(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  category?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<BlogPagedResult> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  if (params.search) q.set('search', params.search);
  if (params.type) q.set('type', params.type);
  if (params.category) q.set('category', params.category);
  if (params.tag) q.set('tag', params.tag);
  if (params.sortBy) q.set('sortBy', params.sortBy);
  if (params.sortOrder) q.set('sortOrder', params.sortOrder);
  return apiFetch<BlogPagedResult>(`/api/admin/blog?${q}`);
}

export async function fetchAdminBlogPost(id: string): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/api/admin/blog/${id}`);
}

// On create, the server generates id, slug (from title), createdAt, updatedAt.
export async function createBlogPost(
  data: Omit<BlogPost, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,
): Promise<BlogPost> {
  return apiFetch<BlogPost>('/api/admin/blog', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// slug cannot be patched — the server ignores it if included.
export async function updateBlogPost(
  id: string,
  patch: Partial<Omit<BlogPost, 'id' | 'slug' | 'createdAt'>>,
): Promise<BlogPost> {
  return apiFetch<BlogPost>(`/api/admin/blog/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

// Requires admin role — server enforces with requireAdmin middleware.
export async function deleteBlogPost(id: string): Promise<void> {
  return apiFetch<void>(`/api/admin/blog/${id}`, { method: 'DELETE' });
}
```

**Note on `import type` at top of function block:** TypeScript 5.x supports inline import types in function files. If the linter flags the inline import, move it to the top of the file alongside other imports.

**Test:** TypeScript compiles. `npm run lint` clean.

---

### STEP 11 — Create `src/pages/blog/BlogPage.tsx` (public hub)

**File:** `src/pages/blog/BlogPage.tsx` (new)

Migration of `BlogHub.tsx` from the concept. Key differences from concept:

1. **Data source:** `useEffect` fetches `GET /api/blog` instead of receiving `posts` prop from localStorage state.
2. **Colour palette:** All `bg-white` → `bg-[#12151c]`, `text-slate-900` → `text-[#e8e4da]`, `border-slate-200` → `border-[#1c1e26]`, `text-red-600` accents → `text-[#bc993c]`. Featured post button accent changes from red to gold.
3. **Navigation:** Clicking a post calls `navigate('/blog/' + post.slug)` instead of lifting state to parent.
4. **No `viewMode` toggle** — the CMS editor is only accessible via `/admin/blog`, not from the public page.
5. **Loading state:** While fetching, show skeleton cards (3 cards with `animate-pulse`).
6. **Header:** Reuse the sticky site header from `App.tsx` via React Router — this page is rendered inside `<App>` or gets the shared header.

Structure:
```
export default function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogIndex[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'case-study' | 'article'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [page, setPage] = useState(1);
  
  // fetch on filter/page change...
  // render BlogHub layout with dark theme...
}
```

**Test:** `/blog` renders the Unpuzzled case study (from seed) as the featured post.

---

### STEP 12 — Create `src/pages/blog/BlogPostPage.tsx` (public post detail)

**File:** `src/pages/blog/BlogPostPage.tsx` (new)

This is a unified post detail page that handles both `article` and `case-study` types.

```
export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setPost)
      .catch(code => { if (code === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [slug]);

  if (notFound) return <NotFoundMessage />;
  if (loading) return <LoadingSpinner />;
  if (!post) return null;

  return post.type === 'case-study'
    ? <CaseStudyLayout post={post} onBack={() => navigate('/blog')} />
    : <ArticleLayout post={post} onBack={() => navigate('/blog')} />;
}
```

`CaseStudyLayout` is the migrated `UnpuzzledCaseStudy.tsx` — generalized so it works for any case study post, not just the Unpuzzled one. The hardcoded phase data in the concept is replaced with `post.solutions` data:
- **Growth Roadmap phase tabs:** rendered from `post.solutions[n].phaseItems` (the new `phaseItems` field added in Step 1). Phase title comes from `post.solutions[n].title`.
- **Embedded video:** rendered from `post.solutions[n].videoUrl` (only shown if present).
- **"Behind the Consultation" section:** rendered from `post.content` as pre-formatted text (split on `\n\n` into paragraphs).
- **"Related Posts" section at bottom:** populated by fetching `GET /api/blog?pageSize=3` on mount and filtering out the current post slug. If fewer than 3 other posts exist, show only what's available. If none, hide the section entirely.
- **All light-theme colours in the concept (bg-white, border-slate-200, text-slate-900) are converted to dark theme** in the solutions accordion, "Behind the Consultation" section, and "What is WHI DNA?" sidebar panel.
- **"Request Case Briefing" button** in the sidebar: `onClick={() => window.location.href = '/#assessment-portal'}` — navigates to the main site assessment section.
- **"What is WHI DNA?" sidebar panel:** kept as hardcoded branding text (not data-driven).
- **The logo fallback SVG** and `setLogoError` logic from the concept are preserved exactly.

`ArticleLayout` renders:
- Hero section (dark, title, author metadata)
- `post.image` full-width with dark overlay
- Post `content` markdown rendered via a simple inline function (no external library):
  ```typescript
  function renderMarkdown(md: string): string {
    return md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-[#e8e4da] mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[#e8e4da] mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#e8e4da] mt-10 mb-4">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#e8e4da] font-bold">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-stone-400">$1</em>')
      .replace(/^\* (.+)$/gm, '<li class="ml-4 list-disc text-stone-300">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-stone-300">$2</li>')
      .replace(/\n\n/g, '</p><p class="text-stone-300 leading-relaxed mb-4">')
      .replace(/^(?!<[h|l])(.+)$/gm, '<p class="text-stone-300 leading-relaxed mb-4">$1</p>');
  }
  ```
  Rendered with `dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}` — safe because content is admin-authored and stored, not user-generated.

**Test:** Navigating to `/blog/unpuzzled-aba-success` renders the full Unpuzzled case study layout.

---

### STEP 13 — Wire public blog routes into `src/App.tsx`

**File:** `src/App.tsx`

The main `App` component currently renders a single-page scroll layout. It does NOT currently import anything from `react-router-dom`. `main.tsx` already wraps everything in `<BrowserRouter>`, so `useLocation`, `Link`, `Routes`, and `Route` are all available.

**Exact additions required:**

**1. Add imports** at the top of `App.tsx` (alongside existing imports):
```typescript
import { useLocation, Link, Routes, Route } from 'react-router-dom';
import BlogPage from './pages/blog/BlogPage';
import BlogPostPage from './pages/blog/BlogPostPage';
```

**2. Add `useLocation` hook** inside the `App()` function body, before any existing state:
```typescript
const location = useLocation();
const isBlog = location.pathname.startsWith('/blog');
```

**3. Add early return** immediately before the existing `return (` statement of the marketing page:
```typescript
// ── Blog branch: separate layout, same dark theme ──────────────────────────
if (isBlog) {
  return (
    <div className="min-h-screen bg-[#0b0c0f] text-[#e8e4da] font-sans antialiased">
      {/* Self-contained blog nav bar — matches main site header style */}
      <header className="sticky top-0 z-40 bg-[#0b0c0f]/90 backdrop-blur-md border-b border-stone-900 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="group flex items-center">
            <WHILogo className="h-7 sm:h-8 hover:opacity-85 transition-opacity" />
          </Link>
          <nav className="hidden md:flex items-center space-x-8 font-mono text-[12px] tracking-widest text-[#e8e4da] font-semibold">
            <Link to="/#paradigm" className="hover:text-white uppercase transition-colors">The Paradigm</Link>
            <Link to="/#dna" className="hover:text-white uppercase transition-colors">The DNA™</Link>
            <Link to="/blog" className="text-[#bc993c] uppercase transition-colors">Insights</Link>
          </nav>
          <Link
            to="/#assessment-portal"
            className="hidden sm:inline-block px-5 py-2.5 bg-[#bc993c] text-stone-950 font-mono text-xs font-bold tracking-widest uppercase hover:bg-[#a68634] transition-all rounded shadow-lg"
          >
            INITIATE ASSESSMENT
          </Link>
        </div>
      </header>
      <Routes>
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
      </Routes>
    </div>
  );
}
// ── End blog branch ──────────────────────────────────────────────────────────
```

**4. Add "Insights" link to the existing desktop nav** inside the existing `<nav>` block. The current nav items are all `<button onClick={() => scrollToSection(...)}>`. Insert `<Link>` (not a button) for Insights:
```typescript
// After the last existing nav button ("COMMAND TEAM"), add:
<Link
  to="/blog"
  className="hover:text-white uppercase transition-colors cursor-pointer"
>
  Insights
</Link>
```

**5. Add "INSIGHTS" to the existing mobile menu** inside the mobile menu `<div>`, after the last existing `<button>` (before the "INITIATE ASSESSMENT" button at the bottom):
```typescript
<Link
  to="/blog"
  onClick={() => setMobileMenuOpen(false)}
  className="py-1.5 hover:text-stone-100"
>
  INSIGHTS
</Link>
```

**No other changes to `App.tsx`.** The existing state, scroll handlers, sections, and the main `return (...)` are completely untouched.

**Test:** 
- Main site loads normally at `/`
- "Insights" nav link navigates to `/blog`
- Back button or logo link returns to `/`
- All existing scroll-section buttons still work
- `/blog/unpuzzled-aba-success` renders the case study

---

### STEP 14 — Create `src/admin/pages/BlogsPage.tsx` (admin blog list)

**File:** `src/admin/pages/BlogsPage.tsx` (new)

Pattern follows `BriefingsPage.tsx` exactly. Dark admin theme. Shows all posts (drafts + published). Key differences:
- `+ New Post` button routes to `/admin/blog/new`
- Status badge: green "Live" dot for published, grey "Draft" for unpublished
- Table columns: Title, Type, Category, Status, Date, Actions (edit icon)
- Type filter tabs: All / Case Study / Article
- Row click or edit icon → `/admin/blog/:id/edit`

```typescript
export default function BlogsPage() {
  useEffect(() => { document.title = 'Blog & Insights | WHI Agency'; ... }, []);
  const [items, setItems] = useState<BlogIndex[]>([]);
  // ...pagination, search, type filter...
  
  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#e8e4da]">Blog & Insights</h1>
          <div className="text-stone-500 font-mono text-xs tracking-widest mt-0.5">
            {total} TOTAL
          </div>
        </div>
        <div className="flex gap-2">
          {/* search form */}
          <Link to="/admin/blog/new"
            className="bg-[#bc993c]/20 hover:bg-[#bc993c]/30 text-[#bc993c] font-mono text-xs tracking-widest px-3 py-1.5 rounded transition-colors">
            + NEW POST
          </Link>
        </div>
      </div>
      {/* table */}
    </div>
  );
}
```

**Test:** `/admin/blog` lists the Unpuzzled post with "Live" status badge.

---

### STEP 15 — Create `src/admin/pages/BlogEditorPage.tsx` (admin CMS editor)

**File:** `src/admin/pages/BlogEditorPage.tsx` (new)

Migration of `BlogEditor.tsx` from the concept. Key differences:

1. **Data source:** On mount, read `params.id` from `useParams()`. If it exists, fetch `GET /api/admin/blog/:id` and populate all form state fields from the loaded post.
2. **Save:** On form submit:
   - If creating (no `params.id`): call `createBlogPost(payload)` — server generates `id`, `slug`, `createdAt`, `updatedAt`
   - If editing (has `params.id`): call `updateBlogPost(id, patch)` — slug cannot be patched
3. **Delete:** Calls `deleteBlogPost(id)` with a `window.confirm()` guard. Button only rendered if `user?.role === 'admin'`.
4. **No `onSetPosts` prop / no localStorage** — all state is server-driven.
5. **Colour palette:** Full admin dark theme. Systematic replacements:
   - `bg-white` / `bg-slate-50` → `bg-[#12151c]`
   - `border-slate-200` / `border-slate-100` → `border-[#1c1e26]`
   - `text-slate-900` → `text-[#e8e4da]`
   - `text-slate-500` / `text-slate-600` → `text-stone-400`
   - `text-indigo-600` / `bg-indigo-600` → `text-[#bc993c]` / `bg-[#bc993c]/20`
   - Form inputs: `bg-slate-50 border-slate-200` → `bg-[#0b0c0f] border-[#1c1e26] text-[#e8e4da]`
   - Focus ring: `focus:ring-indigo-500` → `focus:border-[#bc993c]`
   - Tab active: `border-indigo-600 text-indigo-600` → `border-[#bc993c] text-[#bc993c]`
6. **Slug display:** Read-only preview shown below the title input: `URL: /blog/{computed-slug}`. Computed on the client as `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 80)`. Shows the slug from loaded data if editing.
7. **Publish date field:** Use `<input type="date">` for setting the publish date. Convert ISO8601 → `YYYY-MM-DD` for the input value on load; convert `YYYY-MM-DD` → ISO8601 on save.
8. **Success toast:** Uses the existing `Toast` component from `src/admin/components/Toast.tsx` (already styled for admin dark theme). Show on successful save.
9. **Navigation:** After save success, navigate to `/admin/blog` using `useNavigate()`.
10. **`fillDemoTemplate` function:** Retained from the concept as a developer convenience tool.
11. **Case Study tab extra fields:** Add form inputs for `phaseItems` (per solution) and `videoUrl` (per solution) to match the updated `BlogSolutionItem` type. These are expandable sub-panels inside each solution entry.

The three-tab form structure (General / Content / Case Study) is preserved exactly.

**Test:** Create a new article post from admin. It appears in `/admin/blog` and at `/blog/:slug`.

---

### STEP 16 — Wire blog routes into `src/admin/AdminApp.tsx`

**File:** `src/admin/AdminApp.tsx`

Add imports:
```typescript
import BlogsPage from './pages/BlogsPage';
import BlogEditorPage from './pages/BlogEditorPage';
```

Add routes inside the `<AdminLayout>` protected route group:
```typescript
<Route path="blog" element={<BlogsPage />} />
<Route path="blog/new" element={<BlogEditorPage />} />
<Route path="blog/:id/edit" element={<BlogEditorPage />} />
```

**Test:** All three routes load without 404. Protected by existing `ProtectedRoute` wrapper.

---

### STEP 17 — Add Blog nav item to `src/admin/components/AdminLayout.tsx`

**File:** `src/admin/components/AdminLayout.tsx`

Add to `navItems` array:
```typescript
import { BookOpen } from 'lucide-react'; // already available in lucide-react

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/briefings', icon: FileText, label: 'Recon Briefings' },
  { to: '/admin/prospects', icon: Users, label: 'Prospects' },
  { to: '/admin/blog', icon: BookOpen, label: 'Blog & Insights' }, // ← NEW
];
```

**Test:** Sidebar shows "Blog & Insights" item. Active state highlights correctly.

---

### STEP 18 — Update Dashboard stat cards in `DashboardPage.tsx`

**File:** `src/admin/pages/DashboardPage.tsx`

Add three new stat cards using the existing `StatCard` component:
```typescript
<StatCard
  label="Blog Posts"
  value={stats?.blogPostCount ?? '—'}
  sub={stats ? `${stats.publishedBlogCount} published` : undefined}
/>
<StatCard
  label="Published"
  value={stats?.publishedBlogCount ?? '—'}
  sub="Live posts"
/>
<StatCard
  label="Drafts"
  value={stats?.draftBlogCount ?? '—'}
  sub="Unpublished"
/>
```

Expand the stat grid from `grid-cols-2 lg:grid-cols-4` to `grid-cols-2 lg:grid-cols-4 xl:grid-cols-7` or keep the existing 4-col grid and add a second row.

**Test:** Dashboard shows blog post counts.

---

## Risk Register & Mitigations

| Risk | Mitigation |
|---|---|
| Blog routes conflict with existing `/api/assess` or `/api/prospects` | Blog routes use `/api/blog` and `/api/admin/blog` — no overlap with existing paths |
| Public `/blog` URL conflicts with marketing page scroll sections | `App.tsx` uses `location.pathname.startsWith('/blog')` branch — marketing sections only render on non-blog paths |
| `UnpuzzledCaseStudy.tsx` hardcoded phases break for other case studies | Migrate to use `post.solutions` as the phase source — the hardcoded data in the concept becomes seed data only |
| `localStorage` state from concept leaks into production | No localStorage code is migrated — all reads/writes go through fetch. App.tsx localStorage check from concept is not migrated |
| Blog seed data re-runs on every restart | `seedService` guards with `existing.total === 0` check — only runs once |
| Image links from Google Drive stop working | `getGoogleDriveDirectLink` transformer already handles this. Unsplash fallbacks provided in seed data |
| Slug collisions on create | `JsonBlogRepository.create()` checks slug uniqueness against index and appends `-2`, `-3` if conflict |
| Admin can delete a post they don't own | `DELETE` route uses `requireAdmin` — only admin role can delete any post |
| Draft posts visible via public API | `publicBlog.ts` routes hardcode `published: true` — not controllable via query params |
| Markdown XSS in article content | `dangerouslySetInnerHTML` is acceptable here because content is admin-authored, not user-generated. The sanitizeField helper strips `<>` characters on API input regardless |

---

## Testing Checklist (pre-delete of concept folder)

- [ ] `npm run lint` passes with zero errors
- [ ] `npm run dev` starts server with no errors
- [ ] `GET /api/blog` returns the Unpuzzled seed post
- [ ] `GET /api/blog/unpuzzled-aba-success` returns full post object
- [ ] `GET /api/blog/nonexistent-slug` returns 404
- [ ] `GET /api/blog/some-draft-post` returns 404 (draft not exposed)
- [ ] Admin login works unchanged
- [ ] `/admin/blog` shows the Unpuzzled post
- [ ] `/admin/blog/new` opens blank editor form
- [ ] Creating a new article post via admin → appears at `/blog/:slug`
- [ ] Editing the Unpuzzled post via admin → changes persist after page reload
- [ ] Deleting a post via admin (admin role) removes it from public list
- [ ] Delete button not visible for analyst role
- [ ] `/blog` renders featured case study hero
- [ ] Clicking "Deconstruct Blueprint" on featured post → `/blog/unpuzzled-aba-success`
- [ ] Case study page renders all phases, metrics, and quotes
- [ ] Growth Roadmap phase tabs display correctly from `solution.phaseItems` data (not hardcoded)
- [ ] Expanding Solution 01 shows embedded video via `solution.videoUrl` iframe
- [ ] "Behind the Consultation" section renders from `post.content` on dark `bg-[#12151c]` background
- [ ] "Explore More" related posts at bottom of case study shows real API posts (not placeholders)
- [ ] "Request Case Briefing" sidebar button navigates to `/#assessment-portal`
- [ ] "What is WHI DNA?" sidebar panel renders on dark background
- [ ] `/blog` search filter triggers a new API call (network tab shows new request on each keypress with debounce)
- [ ] Type filter (All / Case Study / Article) triggers new API call (server-side, not client-side array filter)
- [ ] Category and tag filters trigger new API calls
- [ ] Publish date stored as ISO8601 in JSON; displays as human-readable in UI
- [ ] Admin blog editor date input shows `YYYY-MM-DD`; saves back as ISO8601
- [ ] Main marketing site scroll sections still work (paradigm, DNA, solutions, etc.)
- [ ] "Insights" link in main site header navigates to `/blog` (not a button, a `<Link>` element)
- [ ] Back button on blog post returns to `/blog`
- [ ] Dashboard shows blog stat cards
- [ ] `GET /api/admin/stats` includes `blogPostCount`, `publishedBlogCount`, `draftBlogCount`
- [ ] All existing briefing, prospect, and user functionality unchanged

---

## Execution Order (Summary)

```
Step 1   interfaces.ts         — add BlogPost, BlogIndex, BlogRepository types
Step 2   JsonBlogRepository.ts — new repository file
Step 3   publicBlog.ts         — new public API routes
Step 4   adminBlog.ts          — new admin API routes
Step 5   server.ts             — wire blogRepo + routes
Step 6   seedService.ts        — add Unpuzzled seed post
Step 7   adminStats.ts         — add blog counts to stats response
Step 8   src/types/blog.ts     — frontend types (new file)
Step 9   src/utils/googleDrive.ts — utility migration (new file)
Step 10  src/admin/services/api.ts — add blog API functions
Step 11  src/pages/blog/BlogPage.tsx — public hub (new file)
Step 12  src/pages/blog/BlogPostPage.tsx — public detail (new file)
Step 13  src/App.tsx           — wire /blog routes + Insights nav link
Step 14  src/admin/pages/BlogsPage.tsx — admin list (new file)
Step 15  src/admin/pages/BlogEditorPage.tsx — admin editor (new file)
Step 16  src/admin/AdminApp.tsx — wire admin blog routes
Step 17  src/admin/components/AdminLayout.tsx — add Blog nav item
Step 18  src/admin/pages/DashboardPage.tsx — add blog stat cards

FINAL    Run full testing checklist above
FINAL    Delete .codebase/concepts/blog/ directory
```

Total: **18 steps**, all additive — no existing functionality is removed or modified until Step 13 which only adds a conditional branch to `App.tsx`.
