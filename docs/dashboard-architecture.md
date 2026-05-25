# Dashboard Architecture — `index.html`

Source: `/home/user/rylee-iep/index.html` (3,009 lines, single-file SPA). This document is the rebuild map for porting to Next.js / TypeScript / Tailwind / shadcn. All identifiers, route strings, content paths, and CSS token values below are verbatim from the source.

---

## 1. App shape (2–3 sentence summary)

A hash-routed, single-file static SPA gated behind Clerk auth. It renders eight `.page-view` containers (Overview, Module, Business, Clients, Artifacts, Skill placeholder, Module-1 skill page, Archive) — exactly one is `.active` at a time — switching purely via JS class toggles plus `history.replaceState` (no `pushState`, no `hashchange`/`popstate` listener). Most content is fetched client-side as Markdown from well-known paths (`README.md`, `archive.md`, `modules.md`, `content/module-<N>.md`, `content/skills/<slug>/<lens>.md`) and rendered through `marked@9`; module/skill/business metadata is hard-coded in JS data structures (`MODULES`, `MODULE1_SKILLS`, `BUSINESS_FILES`, etc.).

---

## 2. ASCII site map

```
                        ┌─────────────────────────────────────────────┐
                        │  Clerk auth gate (always first)             │
                        │   #auth-loading  → showLoading()  (spinner) │
                        │   #auth-gate     → showGate()  (mountSignIn)│
                        │   #app-shell     → showApp() → init() once  │
                        └──────────────────┬──────────────────────────┘
                                           │ window.Clerk.user present
                                           ▼
   ┌──────────────────────── .shell #app-shell ─────────────────────────────┐
   │                                                                          │
   │  SIDEBAR (#sidebar)                       MAIN (.main)                   │
   │  ─────────────────────                    ─────────────                  │
   │  Navigate                                 TOPBAR (.topbar)               │
   │   • Overview   ─data-page="overview"─┐     • #topbar-title (updated/fn)  │
   │                                       │     • .nav-toggle (mobile burger) │
   │  Workspace                            │     • #topbar-badges             │
   │   • Business   ─data-page="business"─┤     • #topbar-user (Clerk button) │
   │   • Clients    ─data-page="clients"──┤                                   │
   │   • Artifacts  ─data-page="artifacts"┤    CONTENT-SCROLL (.content-scroll)│
   │                                       └──▶ showPage(page)                 │
   │  Course Modules (#module-progress-list, rendered by renderModuleProgress)│
   │   • [✓] M1 .. M8 (.module-label) ────────▶ showModule(n)  → #module-N    │
   │     (checkbox .module-check persists "done" to localStorage)             │
   │                                                                          │
   │  Skills (section-toggle collapses #skills-list)                          │
   │   ▸ Module 1 (expanded)                                                  │
   │      business-name / entity-setup / liability-insurance /               │
   │      services-fees / backend-systems / intake-process                   │
   │        └ data-sidebar-skill → showSkill(slug) → showM1Skill → #skill/<s> │
   │   ▸ Module 2..8 (skill-link--pending)                                    │
   │        └ data-sidebar-skill → showSkill(slug) → placeholder → #skill/<s> │
   │                                                                          │
   │   • Archive    ─data-page="archive"──────▶ showPage('archive')          │
   │  sidebar-footer (workspace/ note)                                        │
   └──────────────────────────────────────────────────────────────────────────┘

   PAGE VIEWS (one .active at a time):
     #page-overview   ← showPage('overview')        loadReadme()  fetch README.md
     #page-module     ← showModule(n)               renderModuleMain(n)  (DEFAULT view in static HTML)
     #page-business   ← showPage('business')         loadBusinessPage()  probe workspace/business/*.md
     #page-clients    ← showPage('clients')          loadClientsPage()  fetch workspace/clients/manifest.json
     #page-artifacts  ← showPage('artifacts')        loadArtifactsPage(filter)  (in-page filter tabs)
     #page-skill      ← showSkill(slug) [M2–M8]      renderSkillPlaceholder(slug)
     #page-m1skill    ← showSkill(slug) [M1]→showM1Skill  renderM1SkillPage(slug)  (3 lens tabs)
     #page-archive    ← showPage('archive')          loadArchive()  fetch archive.md

   IN-PAGE CTAs / cross-links:
     Overview README   a[data-page-link]            → showPage(...)
     Module deliverable [data-skill-link]            → showSkill(slug)
     Business "Run skill" [data-skill-link]          → showSkill(slug)
     Business item "Open file"                       → href workspace/business/<file> (new tab)
     Artifacts "Course Notes" [data-module-link]     → showModule(n)
     Artifacts "View Artifacts"/tabs [data-artifacts-filter] → loadArtifactsPage('m<N>'|'all')
     Artifacts skill card [data-sidebar-skill]       → showSkill(slug)
     M1 skill "← Back to Module 1" [data-m1s-back]   → showModule(1)
     Skill placeholder "← Back" [data-skl-module]    → showModule(n)  (reads dataset.sklModule — correct camelCase mapping, works)
     Skill placeholder "Back to Overview" [data-skl-back] → showPage('overview')

   DEEP-LINK HASH ROUTES (parsed once in init()):
     #overview | #business | #clients | #artifacts | #archive   → showPage(hash)
     #module-N            (single digit \d)                     → showModule(N)
     #skill/<slug>        ([\w-]+)                               → showSkill(slug)
     #artifacts/m<N>      (m\d+)                                 → showPage('artifacts') w/ filter
     (anything else / empty)                                    → showModule(1)
```

---

## 3. Per-page breakdown

### Auth screens (global, outside `.shell`)

| Screen | Container ID | Driven by | Notes |
|---|---|---|---|
| Loading | `#auth-loading` (`.auth-loading`) | `showLoading()` | Spinner + "Checking sign-in…". Error text swapped in by `bootClerk()` on failure. |
| Sign-in gate | `#auth-gate` (`.auth-gate`) | `showGate()` | `window.Clerk.mountSignIn(#clerk-signin-slot, {...})`. Brand "Rylee's **IEP** Practice", sub "Sign in to continue. Access is invite-only." |
| App | `#app-shell` (`.shell`) | `showApp()` | Reveals shell, mounts `Clerk.mountUserButton(#topbar-user)`, calls `init()` once (guarded by `appBooted`). |

All three carry `[hidden]` toggled exclusively; CSS rule `.auth-loading[hidden], .auth-gate[hidden], .shell[hidden] { display:none !important }`.

### Overview — `#page-overview`
- Render fn: `loadReadme()`. Inner target `#readme-content`.
- Data source: `fetch('./README.md')` → `marked.parse`.
- Post-render: wires GFM checkboxes (persist `readme-cb-<i>` in localStorage, `removeAttribute('disabled')`); slugifies every `h2` into an `id`; wires `a[data-page-link]` → `showPage`.
- Container is `.page-view md-body`; CSS `#page-overview { max-width:72ch; margin:0 auto }`.
- Special component: `.overview-cta` (styled link; the README authors these).

### Module-N — `#page-module` (DEFAULT active view in static HTML)
- Inner target `#module-main-content`. Render fn: `showModule(n)` → `renderModuleMain(n)`.
- This `.page-view` ships with `class="page-view active"` in the static body — the only one pre-active.
- Data sources: `moduleMdSections[n]` (from `modules.md` via `loadModulesMd`/`parseModulesMd`) + `moduleContentSections[n]` (from `content/module-<N>.md` via `loadModuleContent`/`parseModuleContentSections`) + the `MODULES` array.
- Structure produced:
  - `.module-meta` → `<span class="badge badge-scaffold">Module N Action Plan: [MM-DD-YYYY]</span>` (uses `mod.actionPlanDate || 'MM-DD-YYYY'`; no module defines `actionPlanDate`).
  - `.module-source md-body` → `marked.parse(mdChunk)` (the modules.md section).
  - `<hr class="module-section-divider">`
  - `.module-below #module-below-<n>` → `renderModuleBelow(mod)`: prefers `content/module-<N>.md` sections; else falls back to `mod.deliverables`. Each section is `.deliverable-section > h2 + .deliverable-section-body md-body` via `renderSectionBody` (which expands `[Paragraph]`/empty → `CONTEXT_PLACEHOLDERS`).
- Interactive: source-list checkboxes persist `mod-<n>-deliv-<i>` and strike-through their `<li>`; `[data-skill-link]` → `showSkill`.
- Topbar title set to `Module <n> — <mod.short>`.

### Business — `#page-business`
- Inner target `#business-wrap` (`.biz-wrap`). Render fn: `loadBusinessPage()`.
- Data source: `BUSINESS_FILES` array + live `probeFile('./workspace/business/<file>')` (HEAD, falls back to GET) → status `'found'`/`'empty'`.
- Layout: `.biz-hero` (title, sub, note, `.biz-hero-stat-num` `<foundCount> / <total>` + label "Captured"); then `BIZ_GROUPS` rendered as `.biz-group > .biz-group-title + .biz-group-list`, each item `.biz-item` (glyph `BIZ_GLYPH`, title, desc, `.biz-status` found/empty, "Open file" link, "Run skill" `[data-skill-link]`).
- Interactive: `[data-skill-link]` → `showSkill`.

### Clients — `#page-clients`
- Inner target `#clients-wrap` (`.cli-wrap`). Render fn: `loadClientsPage()`.
- Data source: `fetch('./workspace/clients/manifest.json')` (array of client_ids; absent → empty).
- Sections (string-concatenated): `.cli-hero` (count stat) + `.cli-pii` (sample `marcus-t-d214` / `Marcus T.`) + `.cli-add` (run `/new-client`) + `.cli-section` roster (`.cli-roster` rows or `.cli-roster-empty`) + `.cli-section` anatomy (`.cli-tree` ASCII folder tree).
- No event wiring beyond static "Open folder" links.

### Artifacts — `#page-artifacts`
- Inner target `#artifacts-wrap` (`.crs-wrap`). Render fn: `loadArtifactsPage(filter)`.
- Data source: `MODULES` (modules + flattened skills) + `MODULE_BLURB`. In-memory filter state `currentArtifactsFilter` (`'all'` or `'m<N>'`).
- Structure: `.art-filter` tabs (`all`, `m1`..`m8`) + three `.art-section`s: **Modules** (`.crs-grid` of `.crs-card` via `renderModuleCard`, statuses Scaffold/Pending/Validated), **Skills** (`.art-skills-grid` of `.art-skill-card` via `renderSkillCard`, Authored/Pending), **Artifacts** (always `.art-empty` placeholder copy).
- Interactive: `[data-module-link]` → `showModule`; `[data-artifacts-filter]` → re-render + `history.replaceState` hash; `[data-sidebar-skill]` → `showSkill`.
- NOTE: this page reuses `.crs-*` class names but does NOT use `.crs-hero`/`.crs-progress` (those are orphaned — see §7).

### Skill placeholder (M2–M8) — `#page-skill`
- Inner target `#skill-wrap` (`.skl-wrap`). Render fn: `renderSkillPlaceholder(slug)` (via `showSkill`).
- Data source: `SKILL_INDEX[slug]` (built from `MODULES` by `buildSkillIndex()`).
- Structure: `.skl-hero` (eyebrow, slug, sub, `.skl-hero-stat` "Pending / M<n>") + `.skl-context` (module + deliverable text) + `.skl-next` (what `/module-debrief` does) + `.skl-actions` ("← Back to Module n" `[data-skl-module]`, "View /module-debrief" link). Unknown slug → `.skl-error` + "Back to Overview" `[data-skl-back]`.

### Module-1 skill page — `#page-m1skill`
- Inner target `#m1skill-wrap` (`.m1s-wrap`). Render fn: `renderM1SkillPage(slug)` (via `showM1Skill`, reached when `MODULE1_SKILLS[slug]` exists).
- Data source: `MODULE1_SKILLS[slug]` (title/description/deliverableMatch) + `M1S_LENSES` + per-lens markdown `content/skills/<slug>/<lens>.md` (cached in `m1sContentCache`).
- Structure: `.m1s-hero` (eyebrow "Module 1 · Skill", chip "Authored", slug, `.m1s-frontmatter` YAML preview) + `.m1s-deliverable` + `.m1s-tabs` (role=tablist, 3 `.m1s-tab` from `M1S_LENSES`) + `.m1s-panels` (3 `.m1s-panel`) + `.m1s-foot`.
- Interactive: tab switching toggles `.is-active` on `[data-m1s-tab]` / `[data-m1s-panel]`; each panel hydrated async via `loadM1SkillLens` + `extractLeadingH1` (a leading `# Heading` promotes both tab label and panel title; `*italic*` subtitle replaces the hint); `[data-m1s-back]` → `showModule(1)`. Unknown M1 slug → `.skl-error` "Unknown Module 1 skill".

### Archive — `#page-archive`
- Inner target `#archive-content` (`.page-view md-body`). Render fn: `loadArchive()`.
- Data source: `fetch('./archive.md')` → `marked.parse`. No post-processing.

---

## 4. Global / shared UI

### Auth gate
- Three top-level siblings `#auth-loading`, `#auth-gate`, `#app-shell`, mutually exclusive via `[hidden]`. State machine in JS: `showLoading()` → `bootClerk()` polls `window.Clerk` (≤10s @50ms) → `Clerk.load()` → `applyAuthState()` (`Clerk.user` ? `showApp()` : `showGate()`) → `Clerk.addListener(applyAuthState)`.
- Clerk script tag in `<head>`: `data-clerk-publishable-key="pk_test_bmF0aW9uYWwtc2hhcmstNDYuY2xlcmsuYWNjb3VudHMuZGV2JA"`, src `https://national-shark-46.clerk.accounts.dev/npm/@clerk/clerk-js@5/dist/clerk.browser.js`, `async`.
- Clerk appearance variables (sign-in): `colorPrimary:#D4A84B`, `colorText:#1C1A15`, `colorBackground:#FFFEFB`, `colorInputBackground:#FFFEFB`, `borderRadius:8px`, `fontFamily:"DM Sans", sans-serif`. User button: `colorPrimary:#D4A84B`.

### Topbar (`.topbar`)
- `#topbar-title` (`.topbar-title`) — text reset by `showPage`/`showModule`/`showSkill`/`showM1Skill`.
- `.nav-toggle` — mobile hamburger (SVG), `aria-controls="sidebar"`, `display:none` until `≤768px`.
- `#topbar-badges` — static `.badge badge-scaffold` "Pre-cohort" + `.badge badge-cohort` "Jun 1 Start".
- `#topbar-user` (`.topbar-user`) — Clerk user button mount point.

### Sidebar (`.sidebar #sidebar`)
- Header: `.sidebar-logo`, `.sidebar-sub` "Workspace Dashboard", `.cohort-pill` "Summer 2026 · Starts Jun 1" (pulsing dot).
- Sections: Navigate (Overview), Workspace (Business/Clients/Artifacts), Course Modules (`#module-progress-list`, populated by `renderModuleProgress`), Skills (`.sidebar-section-toggle` collapses `#skills-list`; 8 `.skill-group`s, M1 `expanded`), Archive nav-item, `.sidebar-footer`.
- Active state: `.nav-item.active` / `.module-label.active` (gold left-border). Skill groups toggle `.skill-group.expanded` + `aria-expanded`.

### Mobile drawer (focus trap = YES)
- Elements: `#sidebar` (becomes fixed off-canvas `≤768px`), `.nav-toggle`, `.nav-backdrop`.
- `openDrawer()`: stores `lastFocusBeforeDrawer`, adds `.open`, shows backdrop (forces reflow then `.visible`), sets `aria-expanded`, `body.style.overflow='hidden'`, focuses first focusable.
- `closeDrawer()`: removes `.open`/`.visible`, restores overflow, hides backdrop after 220ms, restores focus.
- Focus trap: `keydown` handler — `Escape` closes; `Tab`/`Shift+Tab` wraps within `getDrawerFocusables()` (`a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])`).
- `autoCloseOnNav()` closes drawer on nav-item/module-label click when `matchMedia('(max-width: 768px)')`.

### Footer (`.sidebar-footer`)
- Static note: `workspace/` is local-only (gitignored). (There is no separate page footer — only the sidebar footer.)

---

## 5. CSS design system

### Fonts (Google Fonts, loaded in `<head>`)
- `'Playfair Display', serif` — headings (weights 400/600 + italic 400).
- `'DM Sans', sans-serif` — body/default (`html, body`; weights 300/400/500/600).
- `'DM Mono', monospace` — code, paths, eyebrows, nums (weights 400/500).

### `:root` custom properties — EXACT values (lines 21–36)

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#F6F3EE` | App background (parchment) |
| `--bg-card` | `#FFFEFB` | Card / panel / topbar background |
| `--sidebar-bg` | `#221E15` | Sidebar, code `<pre>`, tree, frontmatter (dark ink) |
| `--gold` | `#D4A84B` | Primary accent, active states, progress fill, focus ring |
| `--gold-dim` | `#9A7930` | Muted gold — eyebrows, nums, group titles, chevrons |
| `--terracotta` | `#B85C38` | Links, deliverable links, "expert" lens, code text |
| `--sage` | `#4F7C5C` | "research" lens, found/validated status, "local" badge |
| `--text` | `#1C1A15` | Primary text (ink) |
| `--text-muted` | `#7A7060` | Secondary/muted text |
| `--border` | `#E3DDD3` | Borders, dividers, hairlines |
| `--sidebar-text` | `#EDE7D9` | Sidebar primary text |
| `--sidebar-dim` | `#9C9080` | Sidebar muted/inactive text |
| `--badge-pre` | `rgba(212,168,75,.18)` | `.badge-scaffold` background |
| `--check-done` | `#4F7C5C` | Checkbox accent-color |

Note: `--gold` `#D4A84B` = `rgb(212,168,75)`; `--terracotta` `#B85C38` = `rgb(184,92,56)`; `--sage`/`--check-done` `#4F7C5C` = `rgb(79,124,92)`. These three rgb triples recur in many `rgba(...)` tints throughout the stylesheet (e.g. `rgba(212,168,75,.06)`, `rgba(184,92,56,.12)`, `rgba(79,124,92,.15)`).

### Hard-coded (non-token) colors worth porting
- `#3A342B` — body/li/td text in `.md-body` and several panels.
- `#EDE8DF` — inline `code` bg, `.status-empty`/`.biz-status-empty`/`.crs-status-empty` bg, `.btn:hover` bg.
- `#D4C9B5` — pre-code text on dark bg (`.md-body pre code`, `.cli-tree`, `.m1s-frontmatter`).
- `#E9DEC8` — `.cli-tree-file`.
- `#FFF8F4` — `.deliverable-link:hover` / `.overview-cta:hover` bg.
- `#2E2719` — `.btn-primary:hover` bg.
- `#CFC7BA` — `.btn:hover` border.
- `#5A5040` — `.info-banner p`.
- `#c4a96a` — inline footer `<code>` color (hard-coded in markup).

### Reusable class families

| Prefix | Purpose |
|---|---|
| `.md-body*` | Markdown render surface: `h1/h2/h3`, `p`, `blockquote`, `ul/ol/li`, `code`, `pre`, `a`, `hr`, `table/thead/tbody`, `input[type=checkbox]`, `details/summary`. Shared by Overview, Archive, module sections, M1 panels. |
| `.biz-*` | Business page: `biz-wrap`, `biz-hero(-text/-sub/-note/-stat/-stat-num/-stat-label)`, `biz-group(-title/-list)`, `biz-item(-glyph/-meta/-title/-desc/-side/-actions)`, `biz-status(-found/-empty)`, `biz-action(--muted)`. |
| `.crs-*` | "Course" card system (used by Artifacts modules grid + a fully orphaned hero/progress block): `crs-wrap`, `crs-hero*` (ORPHAN), `crs-progress*` (ORPHAN), `crs-grid`, `crs-card(-header/-headline/-num/-title/-desc)`, `crs-meta`, `crs-status(-found/-empty/-skill)`, `crs-actions`, `crs-action(--muted)`. |
| `.cli-*` | Clients page: `cli-wrap`, `cli-hero*`, `cli-pii(-item/-label/-code/-hint)`, `cli-add(-glyph/-body/-title/-desc)`, `cli-section(-title)`, `cli-roster(-row/-id/-empty)`, `cli-tree(-folder/-file/-branch/-desc)`. |
| `.art-*` | Artifacts page chrome: `art-hero(-sub)` (hero styled but UNUSED by render), `art-filter(-tab)`, `art-section(-title)`, `art-empty`, `art-skills-grid`, `art-skill-card(-head/-mod/-slug)`. |
| `.m1s-*` | Module-1 skill page: `m1s-wrap`, `m1s-hero(-row/-eyebrow/-chip/-slug/-desc)`, `m1s-frontmatter`, `m1s-deliverable(-label/-text)`, `m1s-tabs`, `m1s-tab(-num/-label)` + `.is-active` + `[data-lens]` color variants (research=sage, module=gold-dim, expert=terracotta), `m1s-panels`, `m1s-panel(-head/-num/-title/-hint/-body/-placeholder/-content)`, `m1s-foot(-note/-actions)`. |
| `.skl-*` | Skill placeholder page: `skl-wrap`, `skl-hero(-main/-eyebrow/-slug/-sub/-stat/-stat-label/-stat-value)`, `skl-context`, `skl-deliverable`, `skl-next(-title/-body)`, `skl-actions`, `skl-action`, `skl-error`. |
| `.badge*` | Topbar/meta pills: `badge`, `badge-scaffold` (gold), `badge-cohort` (terracotta), `badge-local` (sage). |
| `.btn*` | Buttons: `btn`, `btn-primary` (dark). |
| status helpers | `.status-empty/-found/-skill` (legacy `.ws-card` set), plus per-page `.biz-status-*` / `.crs-status-*`. |
| nav/shell | `.shell`, `.sidebar*`, `.nav-item(.active)`, `.module-*`, `.skill-link(--pending/.placeholder)`, `.skill-group(.expanded)`, `.sidebar-section-toggle`, `.topbar*`, `.nav-toggle`, `.nav-backdrop(.visible)`, `.content-scroll`, `.page-view(.active)`. |
| auth | `.auth-loading(-card/-logo/-spinner/-text)`, `.auth-gate(-card/-brand/-sub)`, `.topbar-user`. |
| misc components | `.info-banner`, `.card-grid`, `.ws-card`, `.client-empty`, `.module-note-row`, `.loading`, `.overview-cta(-label/-arrow)`, `.deliverable-*`. |

### Responsive breakpoints
- `@media (max-width:1024px) and (min-width:769px)` — narrows sidebar to 220px, tightens padding.
- `@media (max-width:768px)` — sidebar becomes fixed off-canvas drawer (`min(86vw,320px)`, `translateX(-100%)`, `.open` reveals), `.nav-toggle` shows, larger tap targets, topbar/cards reflow to column.
- `@media (max-width:480px)` — two-row topbar, single-column grids.
- `@media (prefers-reduced-motion:reduce)` — kills animations/transitions.
- `@media (min-width:1281px)` — centers topbar + content into a 960px band via `padding-inline: max(..., calc((100% - 960px)/2))`.
- `@media (max-width:1024px) and (min-width:769px)` width handling + safe-area `env(...)` insets on mobile.

---

## 6. Routing model

- **Hash formats:** `#overview`, `#business`, `#clients`, `#artifacts`, `#archive`, `#module-<N>`, `#skill/<slug>`, `#artifacts/m<N>`.
- **Parse point:** routes are parsed exactly once in `init()` (called from `showApp()` after auth). Regexes: `/^module-(\d)$/` (single digit only), `/^skill\/([\w-]+)$/`, `/^artifacts\/(m\d+)$/`; plain-page allowlist `['overview','business','clients','artifacts','archive']`; fallback `showModule(1)`.
- **View switching:** every navigator removes `.active` from all `.page-view`, adds it to the target, then toggles `.nav-item.active` / `.module-label.active`. Display is pure CSS (`.page-view{display:none}` / `.page-view.active{display:block}`).
- **History:** `history.replaceState(null, '', <hash>)` is called in **5** places — `showModule`, `showM1Skill`, `showSkill`, `showPage`, and the artifacts filter handler. `history.pushState` is used **0** times. There is **no** `hashchange` or `popstate` listener — so the browser Back button does NOT re-route within the app (it only changes the hash without re-rendering); deep links work solely on initial load.
- **Full-reload avoidance:** all in-app `<a href="#...">` links call `e.preventDefault()` in their click handlers and invoke the relevant `show*`/`load*` fn directly. Sidebar nav-items are `<button data-page>` (no href). The `[data-skill-link]` / `[data-sidebar-skill]` / `[data-module-link]` / `[data-artifacts-filter]` / `[data-m1s-back]` / `[data-skl-module]` / `[data-skl-back]` / `[data-page-link]` attributes are the click-delegation hooks.

---

## 7. State & persistence

### localStorage keys
| Key | Written by | Meaning |
|---|---|---|
| `rylee-iep-modules` (const `STORAGE_KEY`) | `renderModuleProgress` change handler | JSON object `{ "<n>": true/false }` — sidebar module "done" checkboxes. |
| `mod-<n>-deliv-<i>` | `renderModuleMain` source-checkbox handler | `'1'`/`'0'` per module-source deliverable checkbox. |
| `readme-cb-<i>` | `loadReadme` checkbox handler | `'1'`/`'0'` per README GFM checkbox. |

No `sessionStorage` usage.

### In-memory caches / mutable state
- `m1sContentCache` — `Map`, key `"<slug>/<lens>"` → markdown string (per-lens content fetch cache; caches empty string on miss/404).
- `moduleMdSections` — object `{ <n>: "## <title>\n\n<body>" }` from `modules.md`.
- `moduleContentSections` — object `{ <n>: [{heading, body}, ...] | null }` from `content/module-<N>.md`.
- `modState` — object loaded from `rylee-iep-modules` via `loadModuleState()`.
- `currentModule` (number, default 1), `currentPage` (string, default `'overview'`), `currentArtifactsFilter` (`'all'`/`'m<N>'`), `appBooted` (bool), `lastFocusBeforeDrawer` (Element).

### Global JS data structures (BY NAME)
- **`PAGE_TITLES`** — `{ overview, business, clients, artifacts, archive }` → topbar title strings.
- **`BUSINESS_FILES`** — array of 6 `{ file, title, desc, skill }` (business-name, entity-setup, liability-insurance, services-fees, backend-systems, intake-process).
- **`CONTEXT_PLACEHOLDERS`** — const string holding the 3 bracketed lens placeholders (Initial Research / Module Knowledge / Rylee's Expert), split on blank lines.
- **`MODULES`** — array of 8 `{ n, short, title, status, deliverables[] }`; each deliverable `{ text, links:[{slug}] }` (+ optional `heading`/`body`). `status` ∈ `scaffold` (M1) / `pending` (M2–M8). M1 has 5 deliverables, M2–M6 & M8 have 3, **M7 has 5**.
- **`MODULE1_SKILLS`** — object keyed by slug (6 entries) → `{ title, description, deliverableMatch }`. Presence here is what routes a slug to `showM1Skill` vs the placeholder.
- **`M1S_LENSES`** — array of 3 `{ key, num, label, hint }`. ORDER: `expert`(01,"Rylee's Expert","Weighs heaviest downstream"), `research`(02,"Initial Research","Pre-module orientation"), `module`(03,"Module Knowledge","Synthesized from lesson"). (See quirk §8 — the `num` ordering does not match `key` semantic order.)
- **`SKILL_INDEX`** — built by `buildSkillIndex()` from `MODULES`: `{ <slug>: { mod, deliverable } }`. First-wins on duplicate slugs.
- **`BIZ_GROUPS`** — array of 4 `{ title, slugs[] }` (Identity & Entity / Risk / Money / Operations).
- **`BIZ_GLYPH`**, **`CLI_ADD_GLYPH`** — inline SVG string constants.
- **`MODULE_BLURB`** — `{ 1..8: string }` one-line module descriptions (Artifacts cards).
- **`COURSE_START`** (`new Date('2026-06-01T00:00:00')`) and **`COURSE_WEEKS`** (`12`) — consumed only by `computeCohortState` (see §8, dead).
- **`STORAGE_KEY`** — `'rylee-iep-modules'`.
- `skillHref(slug)` helper → `.claude/skills/<slug>/SKILL.md`.

### Content fetch path templates (all relative, `./`)
- `./modules.md`
- `./content/module-<N>.md`
- `./content/skills/<slug>/<lens>.md` (lens ∈ research|module|expert)
- `./README.md`
- `./archive.md`
- `./workspace/business/<file>.md` (HEAD probe, GET fallback)
- `./workspace/clients/manifest.json`
- (linked, not fetched) `./workspace/clients/<id>/`, `.claude/commands/module-debrief.md`, `.claude/skills/<slug>/SKILL.md`

---

## 8. Flagged quirks / ambiguities

1. **Module-7 deliverable mismatch (MODULES vs sidebar HTML).** `MODULES[6]` (n:7) defines **5** deliverables with slugs `iee`, `esy-disputes`, `dispute-key-terms`, `mediation-due-process`, `evaluations-to-supports`. The sidebar Skills accordion `data-mod="7"` lists only **3**: `iee`, `esy-disputes`, `evaluations-to-supports`. So `dispute-key-terms` and `mediation-due-process` exist in `SKILL_INDEX` and the Artifacts skill grid but have NO sidebar link. (Also: `MODULE_BLURB[7]` text "IEEs, ESY, dispute resolution…" matches the 5-deliverable intent.)

2. **Dead `statLabel` ternary in `loadClientsPage`** (line ~2650): `const statLabel = count === 0 ? 'Active' : (count === 1 ? 'Active' : 'Active');` — all three branches return `'Active'`. Pure dead code.

3. **Orphaned cohort/progress machinery.** `computeCohortState()`, `isLargeStat()`, `COURSE_START`, `COURSE_WEEKS`, and the entire `.crs-hero*` + `.crs-progress*` CSS block are defined/styled but **never called or rendered**. `loadArtifactsPage` only emits `.art-filter`, `.crs-grid`/`.crs-card`, `.art-skills-grid`, `.art-empty`. The comment "Artifacts page (formerly Course)" confirms this is leftover from a prior Course page.

4. **`.art-hero` CSS unused.** Styled (`.art-hero`, `.art-hero h1`, `.art-hero-sub`) but `loadArtifactsPage` renders no `.art-hero` element.

5. **Skill-placeholder Back button is fine (no bug).** The handler binds `[data-skl-module]` and calls `showModule(parseInt(a.dataset.sklModule,10))`; `data-skl-module` → `dataset.sklModule` is the correct HTML→DOM camelCase mapping, so it works. Noted only because it's the one place the camelCase mapping is non-obvious. The adjacent "View /module-debrief" link is a real `target="_blank"` href (not in-app routed).

6. **`history.replaceState` only (no pushState / no popstate listener).** Browser Back/Forward changes the URL hash but does not re-trigger any render — in-app history is effectively non-navigable backward. Deep-linking only resolves on hard load via `init()`.

7. **Module route regex is single-digit (`\d`).** `#module-10`+ would not match (only `#module-1`..`#module-9`). With 8 modules this is currently harmless but a latent limit.

8. **`M1S_LENSES` num/order inversion.** The array order is expert→research→module but the displayed `num` labels are 01/02/03 in that same array order, so tab #1 ("01") is "Rylee's Expert", #2 ("02") is "Initial Research", #3 ("03") is "Module Knowledge". The CONTEXT_PLACEHOLDERS string is authored in the opposite conceptual order (research, module, expert), and `m1sPlaceholderFor` maps by `key` (not index), so placeholders stay correct — but anyone porting should not assume tab number == placeholder paragraph index.

9. **`marked.setOptions({ breaks:false, gfm:true })`** is global; GFM checkboxes/tables depend on this.

10. **`#page-module` is the default active view in static HTML** (`class="page-view active"`), and the routing fallback is `showModule(1)`. Overview is the visual "home" in the sidebar but Module-1 is what renders if the hash is empty/unrecognized.

11. **`renderDeliverableLinks` is fully dead code** — defined at line 2002 but called from **zero** sites (confirmed via grep). Module pages render via `renderModuleBelow` (sections). It builds `.deliverable-links` / `.deliverable-link` markup that nothing ever invokes; the `.deliverable-link*` CSS and `data-skill-link` routing therefore only matter for paths that DO emit them (Business "Run skill" buttons and module-source `[data-skill-link]` injected via content). Safe to drop in the port.
