# Rebuild Spec — `index.html` → Next.js + TypeScript + Tailwind + shadcn/ui + MongoDB

Companion to `docs/dashboard-architecture.md` (the verified map of the current app). This is the blueprint a fresh Claude Code session — **with a MongoDB MCP enabled** — builds the new app from. Scope: planning only; no code is scaffolded by this document.

**Sourcing (read before trusting snippets):**
- ✅ **Web-verified:** the MongoDB MCP tool list + config; the markdown stack (`react-markdown` + `remark-gfm` + `rehype-raw`).
- ⚠️ **From knowledge (re-verify against live docs in the build session):** App Router, Tailwind v4, and current shadcn/ui CLI snippets. Doc domains (nextjs.org, ui.shadcn.com, tailwindcss.com) were network-blocked when this was written. **Version baseline: target Next.js 16.2 / React 19.2 / Tailwind v4** (snippets here were drafted against 15 — `params`/`searchParams` are async, await them). The runbook `.claude/commands/PLAN-rylee-iep.md` carries the authoritative version notes + Next 16/React 19 patterns; follow it over any 15-era detail below.
- 🎨 **Color tokens are verbatim** from `index.html` `:root` (cross-checked against the map). Never substitute invented values.

---

## 1. Target stack & project structure

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind (v4) · shadcn/ui · MongoDB (Node driver). Server app on Railway (not static export) so the notepad can persist. Keep **Clerk** for auth.

```
app/
  layout.tsx                  # next/font (Playfair/DM Sans/DM Mono) → CSS vars; Clerk provider; Sonner <Toaster>
  globals.css                 # theme tokens + Tailwind
  (app)/                      # authed route group (shares the sidebar+topbar shell layout)
    layout.tsx                # <AppShell>: Sidebar + Topbar + content-scroll
    page.tsx                  # Overview  (was #overview / loadReadme)
    business/page.tsx         # Business  (was #business / loadBusinessPage)
    clients/page.tsx          # Clients   (was #clients / loadClientsPage)
    artifacts/page.tsx        # Artifacts (was #artifacts / loadArtifactsPage)  — formerly "Course"
    module/[n]/page.tsx       # Module-N  (was #module-N / renderModuleMain)  ← NOTEPAD LIVES HERE
    skill/[slug]/page.tsx     # Skill     (was #skill/<slug>; M1 → rich page, M2–M8 → placeholder)
    archive/page.tsx          # Archive   (was #archive / loadArchive)
  actions/
    notes.ts                  # 'use server' — saveNote/getNote
    progress.ts               # 'use server' — toggle/get checklist state
components/
  ui/                         # shadcn components (generated)
  Markdown.tsx                # react-markdown renderer (replaces marked.js)
  Notepad.tsx                 # client textarea + debounced autosave
  AppSidebar.tsx  Topbar.tsx
lib/
  mongodb.ts                  # MongoClient singleton (HMR-safe)
  content.ts                  # read content/*.md + modules.md at build/request time
  data.ts                     # MODULES / MODULE1_SKILLS / BIZ_GROUPS / etc. (typed)
content/  (unchanged)         # README.md, modules.md, archive.md, content/module-N.md, content/skills/<slug>/<lens>.md
```

### Route map (current hash → real Next route)
| Current | New route | Notes |
|---|---|---|
| `#overview` | `/` | renders `README.md` |
| `#business` | `/business` | `BUSINESS_FILES` + `BIZ_GROUPS`; `workspace/business/*` probes become server reads |
| `#clients` | `/clients` | `workspace/clients/manifest.json` → server read |
| `#artifacts` / `#artifacts/m<N>` | `/artifacts?m=<N>` | filter via search param (real, shareable) |
| `#module-<N>` | `/module/[n]` | **Course Modules workspace + notepad.** Fixes the single-digit `\d` route limit |
| `#skill/<slug>` | `/skill/[slug]` | M1 slug → rich 3-lens page; else placeholder |
| `#archive` | `/archive` | renders `archive.md` |

**There is no standalone "Course" page in the current app** — "Course Modules" is the sidebar module list driving the Module-N view, and `#artifacts` is the *former* Course page (leftover `.crs-*`/cohort code, see map §8). The rebuild keeps modules at `/module/[n]`; optionally add a `/modules` index (QoL, §8). Real routing restores Back/Forward + deep links (the current app has **no `hashchange`/`popstate`** listener — map §6).

---

## 2. Theme port (CRITICAL — exact tokens)

Current `:root` (verbatim from `index.html`, map §5):

```
--bg #F6F3EE   --bg-card #FFFEFB   --sidebar-bg #221E15
--gold #D4A84B   --gold-dim #9A7930   --terracotta #B85C38   --sage #4F7C5C
--text #1C1A15   --text-muted #7A7060   --border #E3DDD3
--sidebar-text #EDE7D9   --sidebar-dim #9C9080
--badge-pre rgba(212,168,75,.18)   --check-done #4F7C5C
```
Fonts: **Playfair Display** (headings) · **DM Sans** (body) · **DM Mono** (code/eyebrows/nums).

### `app/layout.tsx` — fonts via `next/font`
```tsx
import { Playfair_Display, DM_Sans, DM_Mono } from "next/font/google";
const playfair = Playfair_Display({ subsets:["latin"], weight:["400","600"], style:["normal","italic"], variable:"--font-playfair" });
const dmSans   = DM_Sans({ subsets:["latin"], weight:["300","400","500","600"], variable:"--font-dm-sans" });
const dmMono   = DM_Mono({ subsets:["latin"], weight:["400","500"], variable:"--font-dm-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### `app/globals.css` — keep EXACT hex, map onto shadcn semantic vars
shadcn's defaults are HSL; we keep the **exact hex** as the source of truth to avoid conversion drift (Tailwind v4 / modern shadcn accept any color format in the vars). The dark sidebar (`#221E15`) is a fixed dark surface in both light/dark modes.

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

:root {
  /* brand tokens (verbatim) */
  --gold:#D4A84B; --gold-dim:#9A7930; --terracotta:#B85C38; --sage:#4F7C5C;
  --ink:#1C1A15; --parchment:#F6F3EE; --card-bg:#FFFEFB; --hairline:#E3DDD3;

  /* shadcn semantic mapping */
  --background:#F6F3EE;            --foreground:#1C1A15;
  --card:#FFFEFB;                  --card-foreground:#1C1A15;
  --popover:#FFFEFB;              --popover-foreground:#1C1A15;
  --primary:#D4A84B;               --primary-foreground:#1C1A15;   /* ink on gold */
  --secondary:#B85C38;             --secondary-foreground:#FFFEFB; /* terracotta */
  --muted:#EDE8DF;                 --muted-foreground:#7A7060;
  --accent:#4F7C5C;                --accent-foreground:#FFFEFB;    /* sage */
  --destructive:#B85C38;           --destructive-foreground:#FFFEFB;
  --border:#E3DDD3;  --input:#E3DDD3;  --ring:#D4A84B;
  --radius:0.5rem;

  /* shadcn sidebar block — fixed dark surface */
  --sidebar:#221E15;               --sidebar-foreground:#EDE7D9;
  --sidebar-primary:#D4A84B;       --sidebar-primary-foreground:#221E15;
  --sidebar-accent:rgba(212,168,75,.12); --sidebar-accent-foreground:#EDE7D9;
  --sidebar-border:rgba(237,231,217,.08); --sidebar-ring:#D4A84B;
}

@theme inline {
  --color-background: var(--background);   --color-foreground: var(--foreground);
  --color-card: var(--card);               --color-primary: var(--primary);
  --color-secondary: var(--secondary);     --color-muted: var(--muted);
  --color-accent: var(--accent);           --color-border: var(--border);
  --color-ring: var(--ring);
  /* expose brand utilities: bg-gold / text-terracotta / border-sage, etc. */
  --color-gold: var(--gold);   --color-gold-dim: var(--gold-dim);
  --color-terracotta: var(--terracotta);   --color-sage: var(--sage);
  --color-ink: var(--ink);     --color-parchment: var(--parchment);
  --font-serif: var(--font-playfair);  --font-sans: var(--font-dm-sans);  --font-mono: var(--font-dm-mono);
}

body { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }
h1,h2,h3,h4 { font-family: var(--font-serif); }
code,pre,kbd { font-family: var(--font-mono); }
```
> `.dark` block optional (QoL §8) — the sidebar stays `#221E15` regardless. Lens-tab accent colors to preserve (map §5): **research → sage**, **module → gold-dim**, **expert → terracotta**.

### Non-token hard-coded colors worth carrying (map §5)
`#3A342B` (md-body text) · `#EDE8DF` (inline-code/empty-status bg → `--muted`) · `#D4C9B5` (code-on-dark) · `#FFF8F4` (link hover) · `#2E2719` (btn-primary hover). Fold these into the theme rather than re-hard-coding.

---

## 3. MongoDB persistence (runtime via driver)

### `lib/mongodb.ts` — HMR-safe singleton
```ts
import { MongoClient, Db } from "mongodb";
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI");

let cached = (global as any)._mongo as { client?: MongoClient; promise?: Promise<MongoClient> } | undefined;
if (!cached) cached = (global as any)._mongo = {};
if (!cached.promise) cached.promise = new MongoClient(uri, { maxPoolSize: 10 }).connect();

export async function getDb(name = "rylee_iep"): Promise<Db> {
  const client = cached!.client ??= await cached!.promise!;
  return client.db(name);
}
```

### `app/actions/notes.ts` — server actions (upsert)
```ts
"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/mongodb";

type Scope = "module" | "section" | "skill";

export async function getNote(scope: Scope, refId: string) {
  const db = await getDb();
  return db.collection("notes").findOne({ scope, refId });
}

export async function saveNote({ scope, refId, body }: { scope: Scope; refId: string; body: string }) {
  const db = await getDb();
  await db.collection("notes").updateOne(
    { scope, refId },
    { $set: { body, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );
  revalidatePath(`/module/${refId}`); // when scope==="module"
}
```

### Notepad — client component, debounced autosave
```tsx
"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { saveNote } from "@/app/actions/notes";

export function Notepad({ scope, refId, initial = "" }:{ scope:"module"|"section"|"skill"; refId:string; initial?:string }) {
  const [body, setBody] = useState(initial);
  const [status, setStatus] = useState<"idle"|"saving"|"saved">("idle");
  const [, start] = useTransition();
  const t = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (body === initial) return;
    clearTimeout(t.current);
    t.current = setTimeout(() => {
      setStatus("saving");
      start(async () => { await saveNote({ scope, refId, body }); setStatus("saved"); setTimeout(()=>setStatus("idle"),1500); });
    }, 800);
    return () => clearTimeout(t.current);
  }, [body]); // eslint-disable-line

  return (
    <div className="flex flex-col gap-1">
      <Textarea value={body} onChange={e=>setBody(e.target.value)} className="min-h-48 font-mono text-sm" placeholder="Notes…" />
      <span className="text-xs text-muted-foreground h-4">{status==="saving"?"Saving…":status==="saved"?"✓ Saved":""}</span>
    </div>
  );
}
```
Server Component pages call `await getNote(...)` directly and pass `initial` (no API layer). This realizes the README's **"Notepad (coming soon)"** slot, attached to each Module-N deliverable section and/or the module as a whole.

---

## 4. Data model (MongoDB)

**`notes`** — replaces the marked-but-absent notepad:
```json
{ "_id": "…", "scope": "module", "refId": "3", "body": "## takeaways…", "updatedAt": "2026-05-25T…Z", "userId": "rylee" }
```
Index: `{ scope:1, refId:1, userId:1 }` (unique if single-user-per-note).

**`progress`** — migrates the three localStorage keys (`rylee-iep-modules`, `mod-<n>-deliv-<i>`, `readme-cb-<i>`; map §7):
```json
{ "_id":"…", "userId":"rylee", "type":"module-deliverable", "moduleNumber":3, "index":0, "done":true, "updatedAt":"…" }
{ "_id":"…", "userId":"rylee", "type":"module-done",        "moduleNumber":3, "done":true }
{ "_id":"…", "userId":"rylee", "type":"readme-checkbox",    "index":2, "done":true }
```
Index: `{ userId:1, type:1, moduleNumber:1 }`.

Sample queries:
```ts
await db.collection("progress").findOne({ userId, type:"module-deliverable", moduleNumber:3, index:0 });
await db.collection("progress").updateOne(
  { userId, type:"module-deliverable", moduleNumber:3, index:0 },
  { $set:{ done:true, updatedAt:new Date() } }, { upsert:true });
// "X of Y deliverables done per module"
await db.collection("progress").aggregate([
  { $match:{ userId, type:"module-deliverable", done:true } },
  { $group:{ _id:"$moduleNumber", done:{ $sum:1 } } }, { $sort:{ _id:1 } } ]).toArray();
```

---

## 5. Markdown rendering (replace `marked@9`)

Stack (✅ web-verified): `react-markdown` + `remark-gfm` (GFM tables/checklists) + `rehype-raw` (so raw `<details>`/`<summary>` in content still renders).
```bash
npm i react-markdown remark-gfm rehype-raw && npm i -D @tailwindcss/typography
```
```tsx
// components/Markdown.tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-stone max-w-none md-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // right-align numeric cols like the current `---:` tables
          th: ({ align, ...p }) => <th className={align==="right"?"text-right":""} {...p} />,
          td: ({ align, ...p }) => <td className={align==="right"?"text-right":""} {...p} />,
        }}
      >{children}</ReactMarkdown>
    </div>
  );
}
```
Port the current **`.md-body`** rules (map §5) into `prose` overrides or a `.md-body` layer: heading fonts, terracotta links, dark `<pre>` (`#221E15` bg / `#D4C9B5` text), hairline tables, custom `<details>` chevron, blockquote list styling. **MDX vs react-markdown:** react-markdown renders runtime strings (our content files are fetched/edited) — simpler + safer; choose MDX only if a content file later needs embedded interactive components.

Content files stay in-repo and are read server-side (`lib/content.ts`) for `/` (README), `/archive`, `/module/[n]` (modules.md + content/module-N.md), and the M1 lens tabs (`content/skills/<slug>/<lens>.md`). The current `extractLeadingH1` behavior (a leading `# H1` → tab label + panel title; `*italic*` → hint) must be reproduced for the lens tabs.

---

## 6. shadcn component map

```bash
npx shadcn@latest init
npx shadcn@latest add card tabs badge collapsible sidebar command sonner textarea skeleton scroll-area tooltip button
```
(`components.json` + `lib/utils.ts`'s `cn()` come from `init`.)

| Current pattern (map §3/§5) | shadcn / approach |
|---|---|
| `.m1s-tabs` / `.m1s-tab` (3 lens tabs, color-coded) | **Tabs** + `data-[state=active]` accent (research=sage, module=gold-dim, expert=terracotta) |
| `.biz-item`, `.crs-card`, `.art-skill-card`, `.ws-card` | **Card** |
| `.badge-scaffold/-cohort/-local`, `.biz-status`, status pills | **Badge** (variants: gold / terracotta / sage) |
| `<details>`/`.md-body details` + `.skill-group` accordion | **Collapsible** (or Accordion for the sidebar skills) |
| `.sidebar` + `#module-progress-list` + `#skills-list` | **Sidebar** block (`SidebarProvider/Sidebar/SidebarMenu…`) — gives the mobile drawer + focus trap for free (replaces hand-rolled `openDrawer`/`getDrawerFocusables`) |
| `.topbar` (title, badges, user button) | plain header in `(app)/layout.tsx` + `SidebarTrigger` |
| `.btn`, `.btn-primary`, `.biz-action`, `.skl-action` | **Button** (`default`/`outline`/`ghost`) |
| `marked` output surface `.md-body` | **`<Markdown>`** (§5) |
| autosave/save feedback, "Open file" results | **Sonner** toasts |
| `loading`/initial fetch states | **Skeleton** |
| long lists / sidebar | **ScrollArea** |
| glyph/info affordances | **Tooltip** |
| (new) global search/jump | **Command** (⌘K palette, §8) |

Auth screens (`#auth-loading`/`#auth-gate`/`#app-shell`) → Clerk's Next.js components (`<ClerkProvider>`, `<SignIn>`, `<UserButton>`) with the same appearance vars (`colorPrimary:#D4A84B`, `colorText:#1C1A15`, `colorBackground:#FFFEFB`, `fontFamily:"DM Sans"`).

---

## 7. MongoDB MCP (dev aid — fresh session only, ✅ web-verified)

Enable in the build session's MCP config:
```json
{ "mcpServers": { "MongoDB": {
  "command": "npx",
  "args": ["-y", "mongodb-mcp-server@latest"],
  "env": { "MDB_MCP_CONNECTION_STRING": "mongodb://localhost:27017/rylee_iep_dev" } } } }
```
Verified tools: `list-databases` · `list-collections` · `create-collection` · `create-index` · `collection-schema` · `collection-indexes` · `find` · `count` · `insert-many` · `update-many` · `delete-many` · `aggregate` · `drop-collection`.

Dev workflow with the MCP:
1. `create-collection` → `notes`, `progress`.
2. `create-index` → `{scope:1,refId:1,userId:1}` on `notes`; `{userId:1,type:1,moduleNumber:1}` on `progress`.
3. `insert-many` → seed a couple of `notes` to render against.
4. After the notepad saves, `find` on `notes`/`progress` to confirm the server action wrote correctly; `collection-schema` to sanity-check shape.

**Not used in production** — the deployed app talks to MongoDB through the driver (`lib/mongodb.ts` + `MONGODB_URI`). For prod use MongoDB Atlas or a Railway Mongo plugin; set `MONGODB_URI` as a Railway env var.

---

## 8. QoL feature menu (pick what to build)

- [ ] **Real routing** — Back/Forward + shareable deep links (fixes map §6/§8.6; the single biggest upgrade).
- [ ] **Notepad w/ autosave** (§3) — the headline feature, on `/module/[n]`.
- [ ] **DB-backed checklists** — migrate the 3 localStorage keys to `progress` (§4); cross-device.
- [ ] **Toasts** on save/error (Sonner).
- [ ] **Loading skeletons** + proper **error/empty** states (`error.tsx`, `not-found.tsx`, `loading.tsx`).
- [ ] **Command palette (⌘K)** — jump to any module/skill/page.
- [ ] **`/modules` index** — a real Course landing page (the current app only has the sidebar list).
- [ ] **Keyboard nav + focus management** — largely free via shadcn Sidebar/Command/Dialog primitives.
- [ ] **Responsive refinements** — shadcn Sidebar handles the off-canvas drawer + trap (replaces hand-rolled code).
- [ ] **Dark mode** — tokens already define light values; add a `.dark` block (sidebar stays dark either way).

---

## 9. Migration notes & quirks to fix (from map §8)

- **Module-7 deliverable mismatch:** `MODULES[6]` has 5 deliverables (`iee`, `esy-disputes`, `dispute-key-terms`, `mediation-due-process`, `evaluations-to-supports`) but the sidebar only links 3. Reconcile the source-of-truth list during the data port so every deliverable has a route.
- **Drop dead code:** `renderDeliverableLinks` (unused), the always-`'Active'` `statLabel` ternary, orphaned cohort machinery (`computeCohortState`/`COURSE_START`/`COURSE_WEEKS`/`.crs-hero*`/`.crs-progress*`), unused `.art-hero` CSS.
- **`#artifacts` is the former Course page** — decide whether it stays "Artifacts" or is reframed now that modules + notepad cover the course workflow.
- **Single-source the data:** move `MODULES`/`MODULE1_SKILLS`/`BUSINESS_FILES`/`BIZ_GROUPS`/`MODULE_BLURB`/`SKILL_INDEX` into typed `lib/data.ts`; keep `M1S_LENSES` but note its num/order inversion (§8.8) when rendering tab numbers.
- **Keep Clerk** auth + the `pk_test_…` key/appearance; gate the `(app)` route group with Clerk middleware.
- **Content files unchanged** — the rebuild reads the same `README.md`/`modules.md`/`archive.md`/`content/**` so no content migration is needed; only the *render* path changes (marked → react-markdown) and *editable* state moves to MongoDB.
