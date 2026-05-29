# NEXT-JS-PLAN.md — Rylee IEP Secure Next.js Rebuild

This is the working implementation checklist for finishing the `index.html` → Next.js rebuild of Rylee's internal IEP advocacy dashboard.

Current state as of this plan:

- Branch: `nextjs-rebuild`
- Committed rebuild baseline: `23e7323` (`feat(rebuild): Phase 0-1 - scaffold deps/shadcn + brand theme & app shell`)
- Existing deployed Railway production app is still the static dashboard from `master` commit `89db9ee`
- Final target remains a root-level Next.js server app deployed to Railway
- Root `pnpm lint` and `pnpm build` pass locally
- Anonymous browser smoke test redirects protected dashboard routes to local `/sign-in`

## Current State Audit

Before changing behavior, preserve and understand the handoff state.

1. **Preserve the branch and working tree:**
    - [x] Stay on `nextjs-rebuild`.
      Comment: Work continued on the rebuild branch.
    - [x] Treat `23e7323` as the scaffold/theme baseline.
      Comment: The root promotion builds on that scaffold rather than restarting.
    - [x] Review all untracked rebuild files before editing.
      Comment: Existing route, component, content, and server modules were inspected before moving them.
    - [x] Do not delete or overwrite user/agent work unless it is confirmed generated junk.
      Comment: Root docs/content were preserved; generated artifacts are ignored.
    - [x] Keep `index.html` as the visual reference only; do not edit it.
      Comment: The static prototype remains untouched.

2. **Track current uncommitted work:**
    - [x] Modified tracked files: `clerk-nextjs/app/(app)/page.tsx`, `clerk-nextjs/app/globals.css`.
      Comment: These changes were carried into the promoted root app.
    - [x] Untracked route pages: archive, artifacts, business, clients, module, skill.
      Comment: These routes now live under root `app/`.
    - [x] Untracked components: markdown renderer, module source, deliverable sections, skill tabs, new client modal.
      Comment: These components now live under root `components/`.
    - [x] Untracked server modules: content loader, Mongo client, client schema, client DAL.
      Comment: These modules now live under root `lib/` and were refactored where needed.
    - [x] Generated visual artifacts are ignored unless intentionally retained.
      Comment: `v-*.png` and `.playwright-mcp/` are gitignored.

3. **Confirm current verification baseline:**
    - [x] `pnpm build` passes inside `clerk-nextjs/`.
      Comment: Verified before promotion.
    - [x] `pnpm lint` passes inside `clerk-nextjs/`.
      Comment: React Compiler and accessibility warnings were fixed before promotion.
    - [x] There is no longer a missing `proxy.ts` / middleware gate.
      Comment: Root `proxy.ts` now uses Clerk middleware.
    - [x] Clerk provider exists and protected routes are server-gated.
      Comment: App layout also checks `requireSignedInUser()`.
    - [x] MongoDB no longer uses the mock full-intake `clients` persistence path.
      Comment: V1 writes metadata-only rows to `client_index`.

## Phase 1 — Stabilize The Existing Nested App

Get the current `clerk-nextjs/` work clean before moving it to the root.

1. **Fix lint failures and warnings:**
    - [x] Update `hooks/use-mobile.ts` so it does not synchronously call `setState` inside the effect body.
      Comment: Reworked with `useSyncExternalStore`.
    - [x] Fix `components/M1SkillTabs.tsx` accessibility by using proper `role="tab"` / `role="tabpanel"` semantics or removing unsupported `aria-selected`.
      Comment: Tab and panel ids/ARIA wiring were added.
    - [x] Replace `form.watch([...])` in `components/NewClientModal.tsx` with `useWatch` or isolate it so React Compiler no longer warns.
      Comment: `useWatch` is now used for derived client id preview.
    - [x] Run `pnpm lint`.
      Comment: Passed inside nested app before promotion.
    - [x] Run `pnpm build`.
      Comment: Passed inside nested app before promotion.

2. **Reconcile untracked files into the app deliberately:**
    - [x] Keep useful route pages and components.
      Comment: Route/component work was promoted to root.
    - [x] Keep `legacy-pages.css` while visual parity is still being ported.
      Comment: Root app still imports the legacy page CSS.
    - [x] Keep `lib/content.ts`, `lib/mongodb.ts`, and related server modules, but refactor them in later phases.
      Comment: Content and Mongo helpers were kept and updated for root paths/lazy env reads.
    - [ ] Decide whether `v-clients.png` and `v-modal.png` stay as ignored reference artifacts or move under `docs/assets/`.
    - [x] Add `.playwright-mcp/` to `.gitignore` unless those files are intentionally retained.
      Comment: Added to root `.gitignore`.

3. **Protect against premature real-data entry:**
    - [x] Keep all current client-intake UI marked as sample/mock only until Phase 5 refactor.
      Comment: The full-intake modal was removed from the production path instead.
    - [x] Do not enter real student or parent PII while the current full-intake Mongo model exists.
      Comment: The current modal now blocks that class of data by only collecting index metadata.
    - [x] Replace mock-only full intake with metadata-only client index.
      Comment: `client_index` stores only org/user/client id/display/district/status/timestamps.
    - [x] Confirm `.env.local` remains gitignored.
      Comment: Root `.gitignore` covers `.env*` except `.env.example`.
    - [x] Confirm secrets are not printed in logs or committed files.
      Comment: No secret values were added to committed files.

## Phase 2 — Promote Next.js To The Repository Root

The final app should run from `C:\Users\TC933\Projects\rylee-iep`, not permanently from `clerk-nextjs/`.

1. **Move the Next app up one level:**
    - [x] Move `app/`, `components/`, `hooks/`, `lib/`, `public/`, and config files from `clerk-nextjs/` to repo root.
      Comment: Root now contains the Next app.
    - [x] Move `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, and `components.json` to repo root.
      Comment: Root `pnpm install`, lint, and build now run against these files.
    - [x] Merge with existing root files rather than overwriting root content files.
      Comment: Root `README.md`, `modules.md`, `archive.md`, and `content/**` stayed canonical.
    - [x] Remove the nested `clerk-nextjs/` scaffold only after the root app passes build.
      Comment: Scaffold files were removed after root build passed; a leftover ignored `.next/` directory may remain until Windows releases file handles.
    - [x] Ensure imports using `@/` still resolve.
      Comment: Root `tsconfig.json` preserves the `@/*` path alias.

2. **Fix root path assumptions:**
    - [x] `lib/content.ts` should read root `README.md`, `modules.md`, `archive.md`, `content/**`, and `.claude/**`.
      Comment: Content reads now split root files from `content/**`.
    - [x] Business status probes should read `workspace/business/*` from root.
      Comment: The old nested `..` path was removed.
    - [x] The app must not expose raw `workspace/` files through public routes.
      Comment: Business page only probes status and keeps "Open file" disabled.
    - [x] Remove duplicated nested `clerk-nextjs/content/` once root content loading works.
      Comment: Nested app content was not promoted over root content.
    - [x] Keep `.claude` as canonical; do not switch to `.agents` or `.Codex`.
      Comment: The plan and app continue to reference `.claude`.

3. **Clean root config:**
    - [x] Keep `serverExternalPackages: ["mongodb"]` if still needed by Next 16.
      Comment: Still present in `next.config.ts`.
    - [ ] Remove `turbopack.root` if root promotion makes it unnecessary.
      Comment: Tried removing it, but Next inferred `C:\Users\TC933` because of another lockfile above the project. Keep the explicit root pin in this environment.
    - [x] Ensure root `.gitignore` covers `node_modules/`, `.next/`, `.env*`, `.playwright-mcp/`, and generated screenshots unless intentionally tracked.
      Comment: Root `.gitignore` was expanded for Next, tools, logs, and generated images.
    - [x] Run `pnpm install` from repo root.
      Comment: Completed successfully.
    - [x] Run `pnpm lint` and `pnpm build` from repo root.
      Comment: Both pass.

## Phase 3 — Add Server-Side Clerk Security

Replace the current client-visible/static-style auth posture with real server-side route protection.

1. **Add Clerk protected routing:**
    - [x] Create root `proxy.ts` using `clerkMiddleware()`.
      Comment: Root proxy protects all non-public app routes.
    - [x] Public routes: `/sign-in(.*)` only.
      Comment: Sign-up is not exposed in-app for now.
    - [x] Protected routes: `/`, `/business`, `/clients`, `/artifacts`, `/module(.*)`, `/skill(.*)`, `/archive`, `/settings(.*)`, and `/api(.*)`.
      Comment: Anonymous `/` browser smoke test redirects to `/sign-in`.
    - [x] Add `app/sign-in/[[...sign-in]]/page.tsx`.
      Comment: Clerk sign-in renders at the local route.
    - [ ] Add `app/sign-up/[[...sign-up]]/page.tsx` only if sign-up is intentionally available; otherwise keep access invite-only in Clerk.

2. **Add server-side authorization helpers:**
    - [x] Create `lib/authz.ts`.
      Comment: Added signed-in and admin helpers.
    - [x] Add `requireSignedInUser()` for basic protected reads.
      Comment: Used by app layout and module/client reads.
    - [x] Add `requireWorkspaceAdmin()` for mutations and settings.
      Comment: Used by client-index creation.
    - [x] Re-check auth inside every Server Action and Route Handler.
      Comment: Current Server Actions recheck auth before mutation.
    - [x] Do not rely on layouts, sidebars, or hidden buttons for authorization.
      Comment: Mutation paths enforce auth server-side.

3. **Make sensitive modules server-only:**
    - [x] Add `import "server-only"` to Mongo, content-loader, client-index, workspace-state, and audit modules.
      Comment: Server-only boundaries were added.
    - [x] Move env-var reads inside lazy getters where build-time evaluation could fail.
      Comment: Mongo URI is read lazily.
    - [x] Keep `MONGODB_URI` and `CLERK_SECRET_KEY` server-only.
      Comment: `.env.example` documents them without values; code does not expose them to client components.
    - [x] Validate every mutation payload with `zod`.
      Comment: Client creation and module progress updates are validated.
    - [x] Return only sanitized fields to client components.
      Comment: Client page renders `client_index` metadata only.

## Phase 4 — Refactor MongoDB To Minimal Metadata

The agreed v1 model is security-first and metadata-only. Full intake persistence is deferred.

1. **Replace current full mock `clients` persistence:**
    - [x] Stop persisting parent names, phone, email, school name, presenting concerns, supports, evaluations, referral history, and logistics in MongoDB v1.
      Comment: These fields were removed from the schema and modal.
    - [x] Replace the current `clients` collection path with a `client_index` collection.
      Comment: `lib/clients.ts` now targets `client_index`.
    - [x] Store only: `orgId`, `clientId`, `clientDisplayName`, `districtAbbr`, `status`, `createdBy`, `createdAt`, `updatedAt`, and optional `archivedAt`.
      Comment: This is the current `ClientIndexDoc` shape.
    - [x] Enforce `clientId` format `<first-name-lowercase>-<last-initial>-<district-abbr>`.
      Comment: Client id is derived on client and server.
    - [x] Enforce district abbreviation only; never full district names.
      Comment: District field validation allows only letters/numbers with no spaces.

2. **Refactor New Client UI:**
    - [x] Rename/copy text from "New client intake" to "New client index entry" or equivalent.
      Comment: Modal title and copy now frame the feature as index-only.
    - [x] Collect only first name, last initial, district abbreviation, and status.
      Comment: The full intake fields were removed.
    - [x] Derive `clientId` and display name on both client and server.
      Comment: Client preview is informational; Server Action re-derives before writing.
    - [x] Keep the richer intake modal only as a prototype if useful, not production data entry.
      Comment: Production path no longer contains full intake fields.
    - [x] Add copy that full intake storage is intentionally deferred until encryption/consent work.
      Comment: Modal and clients page both state this.

3. **Add workspace progress persistence:**
    - [x] Create `workspace_state` collection.
      Comment: Added `lib/workspace-state.ts`.
    - [ ] Store module completion, deliverable checklist state, README checklist state, and UI preferences.
      Comment: Deliverable and README checklist state are stored; module completion rollups and UI preferences remain pending.
    - [x] Scope by `orgId` and `userId`.
      Comment: Workspace state keys include both.
    - [x] Replace `localStorage` in `ModuleSource`.
      Comment: Module checkboxes now call a Server Action and use Mongo-backed initial state.
    - [x] Add server actions or route handlers for progress updates with optimistic UI rollback.
      Comment: `updateModuleDeliverableChecked()` updates optimistically and rolls back on failure.

4. **Add audit trail:**
    - [x] Create `audit_events` collection.
      Comment: Added `lib/audit.ts`.
    - [ ] Log progress updates, client index creation/update/archive, failed authorization, and settings changes.
      Comment: Creation and progress updates are logged; update/archive/settings/failed-auth events remain pending.
    - [x] Store non-PII metadata only.
      Comment: Audit metadata stores ids, status, module number, item index, and booleans only.
    - [x] Index by `orgId + createdAt`.
      Comment: Audit indexes include `orgId, createdAt`.
    - [ ] Do not add an audit viewer until core persistence is stable unless time allows.

## Phase 5 — Complete Dashboard Pages

Use the current route work as the baseline and finish product behavior.

1. **Overview:**
    - [x] Render root `README.md`.
      Comment: Overview reads root `README.md`.
    - [x] Convert README checkbox state from localStorage to `workspace_state`.
      Comment: Overview now uses the shared Mongo-backed `ChecklistMarkdown` component.
    - [ ] Preserve markdown styling and CTA behavior.
    - [ ] Convert hash-style links to Next routes.
    - [ ] Add missing-content error handling.

2. **Modules:**
    - [x] Keep `/module/[n]` with awaited `params`.
      Comment: Dynamic module route uses awaited params.
    - [x] Render module checklist from `modules.md`.
      Comment: Module source renders the parsed module chunk.
    - [x] Render sections from `content/module-N.md`.
      Comment: Deliverable sections use `content/module-N.md` when present.
    - [x] Preserve Initial Research, Module Knowledge, and Rylee Expert placeholders.
      Comment: Existing placeholder behavior remains.
    - [ ] Add Mongo-backed notes only if scoped and secured.

3. **Business, clients, artifacts, skills, archive:**
    - [x] Business shows decision status without exposing raw `workspace/` files.
      Comment: Business probes local file status but does not serve workspace files.
    - [x] Clients shows sanitized `client_index` rows only.
      Comment: Full intake fields are not persisted or rendered.
    - [ ] Artifacts keeps shareable `?m=N` filtering.
    - [ ] Skill pages keep authored Module 1 rich tabs and pending placeholders for Modules 2-8.
    - [x] Archive renders `archive.md`.
      Comment: Archive reads root `archive.md`.

4. **Responsive UI and states:**
    - [ ] Preserve the dark sidebar and gold-accent dashboard look.
    - [ ] Verify mobile drawer behavior.
    - [ ] Add loading, empty, error, and unauthorized states.
    - [ ] Ensure text does not overflow buttons, cards, or modal surfaces.
    - [ ] Use lucide icons for controls where icons improve scanability.

## Phase 6 — Illinois, PII, And Professional-Scope Guardrails

Keep the app useful without letting it cross legal, tax, IDFPR, or clinical lines.

1. **Enforce PII policy in app data:**
    - [x] No full student names in persisted metadata.
      Comment: `clientDisplayName` uses first name + last initial only.
    - [x] No full district names in persisted metadata.
      Comment: Only district abbreviation is accepted.
    - [x] No parent contact details in MongoDB v1.
      Comment: Parent/contact fields are absent from the v1 schema.
    - [x] No full DOBs.
      Comment: DOB fields are absent from the v1 schema.
    - [x] No EIN, SSN, NPI of minors, school records, or uploaded documents.
      Comment: No such fields exist in the v1 data model.

2. **Add scope disclaimer surfaces:**
    - [x] Add a reusable disclaimer component based on `.claude/shared/disclaimer.md`.
      Comment: Added `components/ScopeDisclaimer.tsx`.
    - [x] Use it around entity setup, insurance, services agreement, dispute, and clinical-determination surfaces.
      Comment: Rendered on the business page and scoped skill pages.
    - [x] Keep LLC vs PLLC / IDFPR position as "verify with IDFPR/attorney."
      Comment: Disclaimer routes IDFPR positions to verification rather than assertion.
    - [x] Route tax decisions to CPA.
      Comment: Tax scope is included in the disclaimer gates.
    - [x] Route contract drafting to attorney.
      Comment: Legal scope is included in the disclaimer gates.

3. **Gate future real-client features:**
    - [x] Document that full intake persistence requires a future encryption + consent + retention pass.
      Comment: Modal, clients page, and plan notes state this.
    - [x] Do not enable full intake persistence before that pass.
      Comment: Full intake persistence was removed from v1.
    - [ ] Keep current full-intake UI/screenshots as prototype evidence only.
    - [x] Add "real PII disabled" copy where relevant.
      Comment: New-client modal warns against entering sensitive details.
    - [ ] Revisit after course modules clarify backend/client-process requirements.

## Phase 7 — Railway Deployment

Use Railway as the production target for the root Next.js server app.

Current Railway context:

- Project: `rylee-iep`
- Environment: `production`
- Service: `rylee-iep`
- Domain: `https://rylee-iep-production.up.railway.app`
- Current deployed branch/commit: `master` / `89db9ee`
- Current detected provider: `staticfile`
- Final desired provider: Next.js server app

1. **Prepare Railway service for root Next.js:**
    - [ ] Deploy from GitHub repo `TC23345/rylee-iep`.
    - [x] Use repo root as the service root after Phase 2.
      Comment: Railway service `source.rootDirectory` is unset, so it uses the repo root.
    - [x] Do not use static export.
      Comment: The app builds as a Next.js server app and `package.json` has no static export script.
    - [x] Let Railway infer Next.js if possible; otherwise set build/start commands explicitly.
      Comment: Railway service config now sets Railpack, `pnpm build`, and `pnpm start`.
    - [x] Force Railpack to treat the root app as Node instead of staticfile.
      Comment: Added `railpack.json` with `provider: "node"` because root `index.html` is intentionally retained as a visual reference.
    - [x] Pin the package manager for Railway builds.
      Comment: Added `packageManager: "pnpm@11.2.2"` so Railpack can install pnpm before `pnpm build`.
    - [x] Add a health route only if Railway needs a healthcheck path.
      Comment: Added public `/api/health` and configured it as the Railway healthcheck path.

2. **Set Railway environment variables:**
    - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - [ ] `CLERK_SECRET_KEY`
    - [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
    - [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` only if sign-up route is kept
    - [ ] `MONGODB_URI`
    - [ ] `MONGODB_DB=rylee_iep`
    - [ ] `RYLEE_ADMIN_USER_IDS` if not relying on Clerk org admin role
      Comment: Railway currently has only platform-provided variables; app-level Clerk/Mongo variables are not set.

3. **Deploy and verify:**
    - [ ] Push the completed branch.
      Comment: Railway is still connected to `master`; deploying before this branch is pushed/selected will rebuild the old static app.
    - [ ] Merge or deploy the intended branch to Railway.
    - [ ] Verify unauthenticated protected routes do not serve dashboard content.
    - [ ] Verify Clerk sign-in works.
    - [ ] Verify admin can persist module progress and client index metadata.
    - [ ] Verify MongoDB unavailable state is controlled and does not leak secrets.

## Phase 8 — Acceptance Tests

Do not call the rebuild complete until these pass.

1. **Local checks:**
    - [x] `pnpm lint` passes from repo root.
      Comment: Verified after root promotion and security/data changes.
    - [x] `pnpm build` passes from repo root.
      Comment: Verified after root promotion and security/data changes.
    - [x] No Turbopack workspace-root warning remains.
      Comment: Build output is clean on that issue.
    - [ ] Stage/review promoted root implementation files before commit.
    - [ ] No secrets are committed.

2. **Security checks:**
    - [x] Unauthenticated users cannot access dashboard pages.
      Comment: Browser smoke test redirects `/` to `/sign-in`.
    - [x] Direct mutation calls re-check auth.
      Comment: Server Actions call auth helpers.
    - [x] Non-admin users cannot mutate.
      Comment: Client-index creation requires `requireWorkspaceAdmin()`.
    - [x] Mongo reads/writes are scoped by org/user where applicable.
      Comment: Client index is org-scoped; workspace state is org/user-scoped.
    - [x] Audit events are written for important mutations.
      Comment: Current creation/progress mutations write non-PII audit events.

3. **Data checks:**
    - [x] `client_index` contains minimal metadata only.
      Comment: Current schema matches the metadata-only v1 model.
    - [x] No full intake details are stored in MongoDB v1.
      Comment: Full intake fields are absent from schema/actions/UI.
    - [x] Module progress persists across reload and devices.
      Comment: Module checkboxes now persist through `workspace_state`.
    - [x] README/module checkbox state no longer depends on localStorage.
      Comment: README and module checklists both use `workspace_state` through `ChecklistMarkdown`.
    - [ ] Workspace files remain local-only and gitignored.

4. **UX checks:**
    - [ ] Sidebar, module pages, business page, clients page, artifacts page, skill pages, and archive all render.
      Comment: Anonymous browser smoke test confirms protected routes redirect; authenticated walkthrough remains pending.
    - [ ] Mobile layout works without overlap.
    - [ ] Module 7 shows all five deliverable-linked skills.
    - [ ] Browser Back/Forward works through real routes.
    - [ ] Visual direction matches the current static prototype.

## Implementation Notes

- Continue the existing work; do not restart from scratch.
- The largest correction is architectural: server-side Clerk protection plus metadata-only Mongo persistence.
- Keep the app internal-only. Do not build a public marketing site in this pass.
- Keep `.claude` canonical; do not switch to `.agents` or `.Codex`.
- Do not persist parent contact details, school names, disability details, dates of birth, uploaded documents, EIN, SSN, NPI of minors, or full district names in MongoDB v1.
- Full intake persistence requires a future encryption, consent, retention, and attorney-review pass.
- Use Railway only after local lint/build/security checks pass.
