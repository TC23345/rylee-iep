---
description: Master implementation plan to rebuild the IEP dashboard (index.html) into Next.js 16 + React 19 + Tailwind v4 + shadcn/ui + MongoDB. Reads the verified architecture map and rebuild spec, then executes the phased build. Run in a session with the MongoDB MCP enabled.
argument-hint: "[phase number, optional — omit to start at Phase 0]"
---

# /PLAN-rylee-iep — Dashboard rebuild (Next.js 16 / React 19)

Turns the static single-file `index.html` dashboard into a server-rendered Next.js app with a persistent, editable Course-Modules notepad. This command is the build runbook; the two reference docs below are the source of truth.

## Read first (do not skip)
1. `docs/dashboard-architecture.md` — verified map of the CURRENT app (8 page-views, routes, render fns, exact `:root` tokens, data structures, localStorage keys, 11 flagged quirks).
2. `docs/rebuild-spec.md` — the TARGET blueprint (route map, theme port, Mongo persistence, data model, markdown stack, shadcn component map, MCP tools, QoL menu). All code snippets there are illustrative — re-verify APIs against the live docs linked in §Docs below.
3. `index.html` — read-only reference for any detail the docs don't cover. **Never** edit it.

If `$ARGUMENTS` names a phase number, resume at that phase; otherwise start at Phase 0.

## Version baseline — SUPERSEDES `rebuild-spec.md`
`rebuild-spec.md` was drafted "from knowledge" at Next.js 15. The authoritative current stack (per the attached Next.js 16 guide the user provided) is:

- **Next.js 16.2.x**, **React 19.2.x**, **TypeScript**, **Tailwind v4**, **shadcn/ui** (latest CLI).
- Consequences vs the spec's snippets: `params`/`searchParams` are **async (Promises) — always `await`** them; Tailwind v4 is **CSS-first** (`@import "tailwindcss"`, `@theme`, `@plugin`) with no `tailwind.config.ts` by default; `next/dynamic`, `loading.tsx`, PPR/`cacheComponents` follow the Next 16 conventions in §Patterns.

## How the attached Next.js 16 guide maps to THIS app
That guide targets a *static, public-JSON* dashboard (parse-viewer). We are **not** that — our app has **per-request server data in MongoDB** (notes, progress) and a secret (`MONGODB_URI`). So:

- **Applies directly:** server/client boundary discipline (§Patterns A), `loading.tsx` + Suspense (B), `useTransition` for route/view switches (C), `useDeferredValue` for the search/command palette (D), `next/dynamic({ssr:false})` for heavy client-only widgets (E), **`next/font` (F) — and unlike that guide it IS worth it here because we have brand fonts** (Playfair/DM Sans/DM Mono), keep `<img>`/inline-SVG over `next/image` (we use inline SVG glyphs), no `output:'export'`.
- **Differs / opposite conclusion:** their "lazy-load all reports" §2 is N/A (we have no large JSON payloads); their advice to **skip PPR/`cacheComponents`** was because their app is fully static — **for us PPR is a genuine (optional) win** since we can prerender the static shell + module-MD content and stream the dynamic Mongo notes/progress. Treat PPR as an *opt-in* optimization (Phase 7), not a default — verify it's stable in 16.2 first (§Uncertainties).

---

## Phased build

> Work top-to-bottom; each phase ends with an acceptance check. Commit per phase. Keep `index.html` as the visual oracle — diff the rendered result against it.

### Phase 0 — Scaffold & config
- `npx create-next-app@latest` → TypeScript, App Router, Tailwind v4, ESLint. Match the file tree in `rebuild-spec.md §1`.
- Deps: `mongodb`, `react-markdown remark-gfm rehype-raw`, `@tailwindcss/typography`, `@clerk/nextjs`, `lucide-react`, `sonner`.
- `npx shadcn@latest init` then add: `card tabs badge collapsible sidebar command sonner textarea skeleton scroll-area tooltip button`.
- `next.config.ts`: add **`serverExternalPackages: ['mongodb']`** (keep the native driver out of the bundle — verify the exact key name for 16, see §Uncertainties); do **not** set `output:'export'`.
- `.env.local`: `MONGODB_URI`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (the existing `pk_test_…` key), `CLERK_SECRET_KEY`.
- **MongoDB MCP** (this session): `create-collection` → `notes`, `progress`; `create-index` per §4 of the spec.
- ✅ Accept: `next build` succeeds; dev server boots a blank themed page.

### Phase 1 — Theme & shell
- `next/font` for the three fonts → CSS vars; wire into Tailwind v4 `@theme` (Pattern F).
- `globals.css`: port the **exact** `:root` hex tokens (architecture map §5) onto shadcn semantic vars + expose `gold/terracotta/sage` utilities (spec §2). **Verify the shadcn init produced raw-value CSS vars (Tailwind v4 / oklch-or-hex), not the legacy `hsl(var(--x))` channel wrapping** — if it wrapped, our hex values break (§Uncertainties #8).
- `(app)/layout.tsx`: shadcn **Sidebar** block + topbar — this replaces the hand-rolled `openDrawer`/`getDrawerFocusables` focus trap (free on the shadcn primitive).
- ✅ Accept: side-by-side with `index.html`, the parchment bg (`#F6F3EE`), dark sidebar (`#221E15`), gold accents (`#D4A84B`), and fonts match.

### Phase 2 — Data + content layer
- `lib/data.ts`: port `MODULES / MODULE1_SKILLS / BUSINESS_FILES / BIZ_GROUPS / MODULE_BLURB / SKILL_INDEX / M1S_LENSES` to typed modules. **Fix the Module-7 mismatch** (architecture map §8.1) so all 5 deliverables route. Mind the `M1S_LENSES` num/order inversion (§8.8).
- `lib/content.ts`: server-side reads of `README.md`, `modules.md`, `archive.md`, `content/module-<N>.md`, `content/skills/<slug>/<lens>.md`. Reproduce `extractLeadingH1` (leading `# H1` → tab label + panel title; `*italic*` → hint).
- `components/Markdown.tsx`: react-markdown + remark-gfm + **rehype-raw** (raw `<details>`); port the `.md-body` rules (right-aligned numeric table cols via the `align` prop, dark `<pre>`, terracotta links, blockquotes).
- ✅ Accept: README/archive/module content render identically to the current `marked@9` output (tables, checklists, `<details>`).

### Phase 3 — Routing & pages (mostly Server Components)
- Build the routes from spec §1: `/`, `/business`, `/clients`, `/artifacts` (`?m=` filter), `/module/[n]`, `/skill/[slug]`, `/archive`. **`await params`/`await searchParams`.**
- Active-nav state derives from the real pathname (replaces `.active` toggling). This restores Back/Forward + deep links (architecture map §6 / §8.6).
- M1 slugs (in `MODULE1_SKILLS`) → rich 3-lens page; others → placeholder (Pattern A: render content on the server, keep only the tab interactivity client-side).
- ✅ Accept: every route is deep-linkable and Back/Forward re-renders correctly.

### Phase 4 — MongoDB + notepad + progress (the headline feature)
- `lib/mongodb.ts` singleton (spec §3). `app/actions/notes.ts` + `app/actions/progress.ts` server actions.
- `components/Notepad.tsx`: client `<Textarea>` with debounced autosave + "Saving…/Saved". Consider React 19 **`useActionState`/`useOptimistic`** as the idiomatic alternative to the manual `useTransition`+debounce in the spec (§Uncertainties #6) — pick one, note the choice.
- Mount the notepad on `/module/[n]` (per-module and/or per-deliverable `scope`) — this realizes the README's "Notepad (coming soon)" slot.
- Migrate the three localStorage keys (`rylee-iep-modules`, `mod-<n>-deliv-<i>`, `readme-cb-<i>`) to the `progress` collection; checkbox handlers call the progress server action.
- Use the **MongoDB MCP** to `insert-many` a seed note, then `find` after a save to confirm the server action wrote the expected shape (`collection-schema`).
- ✅ Accept: notepad text and checklist state persist across reload and across devices (DB, not localStorage).

### Phase 5 — QoL / React 19 perceived performance
- `loading.tsx` skeletons (shadcn Skeleton) per segment + Suspense boundaries so the shell stays interactive while a page streams (Pattern B).
- `useTransition` on module/route switches so clicks feel instant; dim the outgoing view via `isPending` (Pattern C).
- Command palette (shadcn **Command**, ⌘K) to jump to any module/skill/page; `useDeferredValue` on its query (Pattern D).
- `next/dynamic({ssr:false})` for heavy client-only widgets (command palette, any future markdown editor) (Pattern E).
- ✅ Accept: no blank boot; nav is instant; ⌘K works.

### Phase 6 — Auth (Clerk, ported)
- `@clerk/nextjs`: `<ClerkProvider>` in root layout, `clerkMiddleware()` gating the `(app)` group, `<SignIn>` gate, `<UserButton>` in the topbar. Reuse the existing publishable key and the appearance vars (`colorPrimary:#D4A84B`, `colorText:#1C1A15`, `colorBackground:#FFFEFB`, `fontFamily:"DM Sans"`). (Current app loads `clerk-js` via a script tag; the port uses the React SDK — §Uncertainties #4.)
- ✅ Accept: invite-only gate behaves like today; signed-in shell shows the user button.

### Phase 7 — Rendering hygiene & caching
- Secrets stay server-side (`MONGODB_URI` never reaches the client; keep `lib/mongodb.ts` and actions server-only). Push `"use client"` to the leaves (Pattern A).
- Content MD (in-repo, rarely changes) → cache/static; Mongo reads → dynamic per request.
- **Optional:** evaluate PPR via `cacheComponents` (Next 16) to prerender the shell + module-MD and stream the dynamic notes/progress. Only if it's stable in 16.2 (§Uncertainties #2).
- `generateMetadata` lives in a Server Component layout (server-only).
- ✅ Accept: `next build` is clean; each route's static/dynamic classification is intentional.

### Phase 8 — Deploy (Railway)
- Deploy as a **server app** (not static export — we need Mongo). Set `MONGODB_URI` (MongoDB Atlas or a Railway Mongo plugin) and the Clerk keys as env vars. Keep the same Railway project/domain if desired.
- ✅ Accept: deployed app persists notepad/progress in production; theme + content match local.

---

## Patterns reference (Next.js 16 / React 19) — apply as cited above
- **A. Server vs Client boundary.** Default to Server Components; mark only interactive leaves `"use client"`. Keep pure libs (`lib/data.ts`, `lib/content.ts`) directive-free so they can be used server-side. (Our data is server-secret-bearing, so this matters more than in the attached static guide.)
- **B. `loading.tsx` + Suspense streaming.** A `loading.tsx` auto-wraps a segment in Suspense; use it for instant skeletons; add inner `<Suspense>` around slow/dynamic parts.
- **C. `useTransition`.** Wrap route/view switches so the old view stays (optionally dimmed) until the new one is ready — pairs with B.
- **D. `useDeferredValue`.** Defer expensive derived lists (command-palette/search results) so typing stays smooth.
- **E. `next/dynamic({ ssr:false })`.** Code-split heavy client-only components; use `.then(m => m.Named)` for named exports; reserve height in the `loading` fallback to avoid CLS.
- **F. `next/font` + Tailwind v4 `@theme`.** Self-host the three brand fonts (no CLS, no Google request); expose as `--font-*` and reference from `@theme`/Chart-free utilities.
- **G. Caching / PPR.** PPR + `use cache` activate only with `cacheComponents: true`. Opt-in for our dynamic pages (Phase 7), not a default.

## Uncertainties / verify against live docs before relying on these
1. **`mongodb` bundling key:** I believe Next 16 uses **`serverExternalPackages`** (renamed from `serverComponentsExternalPackages` in 14). Confirm the exact key for 16.2 and that `mongodb` needs it.
2. **PPR / `cacheComponents` stability in 16.2:** the attached guide names `cacheComponents: true` + `use cache`. Confirm it's stable (not experimental-only) and that it composes with Server Actions before adopting in Phase 7.
3. **shadcn/ui on Next 16 + Tailwind v4 + React 19:** verify the current CLI scaffolds cleanly for this combo and what `components.json`/`@theme` it emits.
4. **Clerk on Next 16:** verify `@clerk/nextjs` supports Next 16 App Router + React 19 and the `clerkMiddleware()` setup; confirm the existing `pk_test_…` key + appearance API port unchanged.
5. **`next/font` ↔ Tailwind v4 `@theme` syntax:** confirm the exact `@theme inline { --font-serif: var(--font-playfair) }` wiring for three families.
6. **Notepad save pattern:** the spec shows manual `useTransition`+debounce; React 19 **`useActionState`/`useOptimistic`** may be cleaner. Decide and document which; verify `revalidatePath` interaction with dynamic Mongo reads.
7. **Async `params`/`searchParams`:** confirmed async in 16 (the attached guide `await params`) — ensure every page/layout awaits them.
8. **Color tokens — hex vs HSL/oklch (highest-risk):** shadcn's Tailwind-v4 templates use raw color values referenced as `var(--background)`; older templates wrap as `hsl(var(--background))` expecting *HSL channels*. We are supplying **exact hex** from `index.html`. Verify the generated components reference vars **raw** (not `hsl(...)`-wrapped) so the hex values render correctly — this is the exact failure mode that produced a wrong "gold" during research. If the template wraps in `hsl()`, either switch the template or convert tokens (and keep the hex as comments).
9. **Content freshness:** decide build-time import vs runtime read for the in-repo MD (runtime read is simplest for an internal tool; build-time is faster but couples deploys to content).
10. **MCP vs app connection:** the MongoDB MCP uses `MDB_MCP_CONNECTION_STRING`; the app uses `MONGODB_URI`. Point both at the same dev instance/db so MCP-seeded data is visible to the running app.

## Definition of done
- All 7 page types render with parity to `index.html` (theme, fonts, content, tables/`<details>`).
- Real routing with working Back/Forward + deep links.
- Course-Modules **notepad persists to MongoDB** with autosave; checklist state migrated to `progress`.
- Clerk gate intact; secrets server-side only.
- `next build` clean; deployed to Railway with persistence in prod.
- The 11 quirks in architecture map §8 are resolved or consciously carried (note which).

## Docs (authoritative — consult during the build)
- Server & Client Components — https://nextjs.org/docs/app/getting-started/server-and-client-components
- Lazy loading / `next/dynamic` — https://nextjs.org/docs/app/guides/lazy-loading
- Fetching Data (`use()`, streaming) — https://nextjs.org/docs/app/getting-started/fetching-data
- Font module (`next/font`, Tailwind v4 `@theme`) — https://nextjs.org/docs/app/api-reference/components/font
- `loading.js` / streaming — https://nextjs.org/docs/app/api-reference/file-conventions/loading
- Caching / Cache Components / PPR — https://nextjs.org/docs/app/getting-started/caching
- `generateMetadata` (server-only) — https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Static exports (limits) — https://nextjs.org/docs/app/guides/static-exports
- React `useTransition` — https://react.dev/reference/react/useTransition
- React `useDeferredValue` — https://react.dev/reference/react/useDeferredValue
- (verify) shadcn/ui — https://ui.shadcn.com/docs · Clerk Next.js — https://clerk.com/docs · MongoDB Node driver — https://www.mongodb.com/docs/drivers/node
