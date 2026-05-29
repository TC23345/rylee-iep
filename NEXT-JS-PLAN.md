# NEXT-JS-PLAN.md - Rylee IEP Secure Next.js Rebuild

This plan is now complete for the rebuild milestone. The old single-file dashboard has been retired, and the production surface is the root-level Next.js App Router app.

Current state as of 2026-05-29:

- Branch: `nextjs-rebuild`
- Completed rebuild commit: `69411a8` (`feat: promote secure Next.js dashboard to root`)
- Production platform: Railway project `rylee-iep`, service `rylee-iep`
- Production URL: `https://rylee-iep-production.up.railway.app`
- Production source branch: `nextjs-rebuild`
- Railway provider: Railpack Node provider
- Runtime app: root Next.js server app, not static export
- Local checks: `pnpm lint` and `pnpm build` pass from repo root
- Live checks: `/api/health` returns ok, `/` redirects anonymous users to `/sign-in`, and `/sign-in` loads
- Persistence model: MongoDB metadata-only v1, with PII-heavy intake intentionally deferred

## Current State Audit

1. **Preserve the branch and working tree:**
    - [x] Stay on `nextjs-rebuild`.
      Comment: Work continued on the rebuild branch and was pushed to `origin/nextjs-rebuild`.
    - [x] Treat the scaffold/theme work as the baseline rather than restarting.
      Comment: Existing route, component, content, and server modules were promoted into the root app.
    - [x] Review generated and untracked rebuild files before editing.
      Comment: App files, docs, screenshots, content, and generated artifacts were checked before promotion.
    - [x] Remove the old `index.html` runtime artifact after successful Next.js deployment.
      Comment: Railway now deploys the root Next.js app; `index.html` is no longer needed in the repo root.

2. **Confirm verification baseline:**
    - [x] `pnpm lint` passes from repo root.
      Comment: Verified after root promotion and security/data changes.
    - [x] `pnpm build` passes from repo root.
      Comment: Verified after root promotion and deployment configuration.
    - [x] Anonymous dashboard access is blocked.
      Comment: Anonymous `/` redirects to `/sign-in` locally and in production.
    - [x] Health route is public and works.
      Comment: `/api/health` is used by Railway and returns ok.
    - [x] No secrets are committed.
      Comment: `.env*` remains ignored except `.env.example`, which contains names only.

## Phase 1 - Stabilize The Existing Nested App

1. **Fix lint and build issues:**
    - [x] Update `hooks/use-mobile.ts` to avoid synchronous state updates in effects.
      Comment: Reworked with `useSyncExternalStore`.
    - [x] Fix `components/M1SkillTabs.tsx` accessibility.
      Comment: Proper tab and panel ids/ARIA wiring were added.
    - [x] Replace `form.watch([...])` in `components/NewClientModal.tsx`.
      Comment: `useWatch` is now used for derived client id preview.
    - [x] Run `pnpm lint`.
      Comment: Passed before and after root promotion.
    - [x] Run `pnpm build`.
      Comment: Passed before and after root promotion.

2. **Reconcile untracked app work:**
    - [x] Keep useful route pages and components.
      Comment: Archive, artifacts, business, clients, module, and skill routes now live under root `app/`.
    - [x] Keep markdown, module, deliverable, skill-tab, disclaimer, and client-modal components.
      Comment: These now live under root `components/`.
    - [x] Keep server modules for content, MongoDB, clients, audit, authz, and workspace state.
      Comment: These now live under root `lib/`.
    - [x] Ignore generated Playwright and screenshot artifacts.
      Comment: `.gitignore` covers `.playwright-mcp/`, generated screenshots, logs, `.next/`, and env files.

## Phase 2 - Promote Next.js To The Repository Root

1. **Move the Next app up one level:**
    - [x] Move `app/`, `components/`, `hooks/`, `lib/`, `public/`, and config files from `clerk-nextjs/` to repo root.
      Comment: Root now contains the deployed Next.js app.
    - [x] Move package and tool configs to repo root.
      Comment: Root `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, and `components.json` are canonical.
    - [x] Preserve root content files.
      Comment: `README.md`, `modules.md`, `archive.md`, and `content/**` remain the dashboard content source.
    - [x] Remove the old nested scaffold files.
      Comment: The root app builds and deploys without the nested scaffold.
    - [x] Keep `@/` imports working.
      Comment: Root `tsconfig.json` preserves the path alias.

2. **Fix root path assumptions:**
    - [x] Read root `README.md`, `modules.md`, `archive.md`, `content/**`, and `.claude/**`.
      Comment: Content loading is rooted at the repo.
    - [x] Probe `workspace/business/*` without serving raw workspace files.
      Comment: The business page reports local status only.
    - [x] Keep `.claude` canonical.
      Comment: `AGENTS.md` was corrected to reference `.claude` instead of `.Codex`.
    - [x] Update dashboard references away from the static app.
      Comment: `CLAUDE.md`, `README.md`, and historical docs now describe the Next.js runtime accurately.

3. **Clean root config:**
    - [x] Keep `serverExternalPackages: ["mongodb"]`.
      Comment: The MongoDB driver remains server-only.
    - [x] Keep `turbopack.root`.
      Comment: Required in this environment because Next otherwise infers `C:\Users\TC933` from a parent lockfile.
    - [x] Pin pnpm for Railway.
      Comment: `packageManager: "pnpm@11.2.2"` is set.

## Phase 3 - Add Server-Side Clerk Security

1. **Add protected routing:**
    - [x] Create root `proxy.ts` using `clerkMiddleware()`.
      Comment: Non-public routes are protected.
    - [x] Add `app/sign-in/[[...sign-in]]/page.tsx`.
      Comment: Clerk sign-in renders at `/sign-in`.
    - [x] Keep sign-up invite-only for now.
      Comment: No public sign-up route was added.

2. **Add server-side authorization helpers:**
    - [x] Create `lib/authz.ts`.
      Comment: Signed-in and workspace-admin helpers are available.
    - [x] Re-check auth inside Server Actions.
      Comment: Client creation and progress mutations check auth server-side.
    - [x] Avoid UI-only authorization.
      Comment: Mutations are protected server-side, not by hidden buttons.

3. **Make sensitive modules server-only:**
    - [x] Add `import "server-only"` to sensitive server modules.
      Comment: Mongo, content, client, workspace-state, and audit modules are server-only.
    - [x] Keep env reads lazy.
      Comment: Mongo URI is read only when a connection is requested.
    - [x] Accept both `MONGODB_URI` and `MONGO_URI`.
      Comment: `MONGODB_URI` remains canonical, but local setup now tolerates the common alias.
    - [x] Validate mutation payloads with `zod`.
      Comment: Client creation and progress updates are schema-validated.

## Phase 4 - Refactor MongoDB To Minimal Metadata

1. **Replace full mock client persistence:**
    - [x] Remove full-intake fields from v1 persistence.
      Comment: Parent contact details, school names, disability details, dates of birth, documents, and presenting concerns are not stored.
    - [x] Use `client_index` for client metadata.
      Comment: `lib/clients.ts` targets `client_index`.
    - [x] Store only minimal index fields.
      Comment: `orgId`, `clientId`, `clientDisplayName`, `districtAbbr`, `status`, timestamps, and creator metadata are stored.
    - [x] Derive `clientId` and display name on client and server.
      Comment: Server Action re-derives ids before writing.
    - [x] Enforce district abbreviation only.
      Comment: Validation rejects spaces and full district names.

2. **Refactor New Client UI:**
    - [x] Rename the modal to "New client index entry."
      Comment: UI text frames this as metadata-only.
    - [x] Collect only first name, last initial, district abbreviation, and status.
      Comment: Full intake storage is intentionally deferred.
    - [x] Add PII warning copy.
      Comment: The modal tells users not to enter parent contact details, school names, disability details, dates of birth, or documents.
    - [x] Surface database failures safely.
      Comment: Save errors do not leak connection details or secrets.

3. **Add workspace progress persistence:**
    - [x] Create `workspace_state`.
      Comment: README and module checkbox state use Mongo-backed server actions.
    - [x] Scope workspace state by org and user.
      Comment: Workspace state keys include both.
    - [x] Replace localStorage for README/module checklist state.
      Comment: `ChecklistMarkdown` and `ModuleSource` now persist through `workspace_state`.

4. **Add audit trail:**
    - [x] Create `audit_events`.
      Comment: `lib/audit.ts` writes non-PII audit records.
    - [x] Log client index creation and progress updates.
      Comment: Existing mutations write audit events.
    - [x] Store non-PII metadata only.
      Comment: Audit metadata stores ids, status, module number, item index, and booleans only.

## Phase 5 - Complete Dashboard Pages

1. **Overview:**
    - [x] Render root `README.md`.
      Comment: Overview reads root `README.md`.
    - [x] Persist README checkbox state through MongoDB.
      Comment: Overview uses the shared Mongo-backed markdown checklist component.
    - [x] Convert the README CTA to a Next route.
      Comment: The Business link now points to `/business`.

2. **Modules:**
    - [x] Keep `/module/[n]` with awaited params.
      Comment: Dynamic module routing is App Router compatible.
    - [x] Render module checklist from `modules.md`.
      Comment: The parsed module chunk renders on each module page.
    - [x] Render sections from `content/module-N.md`.
      Comment: Deliverable sections use authored content when available.
    - [x] Preserve Initial Research, Module Knowledge, and Rylee Expert placeholders.
      Comment: Existing placeholder behavior remains.

3. **Business, clients, artifacts, skills, archive:**
    - [x] Business shows decision status without exposing raw `workspace/` files.
      Comment: Local file status is probed server-side.
    - [x] Clients shows sanitized `client_index` rows only.
      Comment: Full intake fields are not persisted or rendered.
    - [x] Artifacts keeps shareable `?m=N` filtering.
      Comment: Route implementation accepts search params.
    - [x] Skill pages keep authored Module 1 rich tabs and placeholders where content is pending.
      Comment: Skill route renders authored lens content when present.
    - [x] Archive renders `archive.md`.
      Comment: Archive reads the root markdown file.

## Phase 6 - Illinois, PII, And Professional-Scope Guardrails

1. **Enforce PII policy in app data:**
    - [x] No full student names in persisted metadata.
      Comment: `clientDisplayName` uses first name plus last initial only.
    - [x] No full district names in persisted metadata.
      Comment: Only district abbreviation is accepted.
    - [x] No parent contact details in MongoDB v1.
      Comment: Parent/contact fields are absent from schema and UI.
    - [x] No dates of birth, EIN, SSN, NPI of minors, uploaded documents, or school records.
      Comment: These fields do not exist in the v1 model.

2. **Add scope disclaimer surfaces:**
    - [x] Add reusable disclaimer component.
      Comment: `components/ScopeDisclaimer.tsx` reads the shared professional-boundary framing.
    - [x] Use disclaimer around legal, tax, IDFPR, insurance, and clinical-boundary surfaces.
      Comment: Business and scoped skill pages include the disclaimer.
    - [x] Route attorney, CPA, IDFPR, and clinical questions appropriately.
      Comment: The app does not assert legal/tax/IDFPR/clinical conclusions.

3. **Gate future real-client features:**
    - [x] Document that full intake persistence requires encryption, consent, retention, and attorney-review work.
      Comment: Modal, clients page, and this plan preserve that boundary.
    - [x] Keep current full-intake screenshots as prototype evidence only.
      Comment: The screenshot-driven form-save feature is a future scoped feature, not part of v1 metadata-only persistence.

## Phase 7 - Railway Deployment

Current Railway context:

- Project: `rylee-iep`
- Environment: `production`
- Service: `rylee-iep`
- Domain: `https://rylee-iep-production.up.railway.app`
- Deployed branch/commit: `nextjs-rebuild` / `69411a8`
- Detected provider: Node via Railpack

1. **Prepare Railway service:**
    - [x] Deploy from GitHub repo `TC23345/rylee-iep`.
      Comment: Branch `nextjs-rebuild` is pushed and selected.
    - [x] Use repo root as the service root.
      Comment: `source.rootDirectory` is unset, so Railway uses the repo root.
    - [x] Use a server app, not static export.
      Comment: Railway builds `pnpm build` and starts `pnpm start`.
    - [x] Force Node provider through `railpack.json`.
      Comment: This prevents staticfile detection now that the old `index.html` is removed.
    - [x] Add and configure `/api/health`.
      Comment: Railway healthcheck path is `/api/health`.

2. **Set Railway environment variables:**
    - [x] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
      Comment: Set in Railway production.
    - [x] `CLERK_SECRET_KEY`
      Comment: Set in Railway production as a secret.
    - [x] `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
      Comment: Set in Railway production.
    - [x] `MONGODB_URI`
      Comment: Set in Railway production as a secret.
    - [x] `MONGODB_DB=rylee_iep`
      Comment: Set in Railway production.

3. **Deploy and verify:**
    - [x] Push the completed branch.
      Comment: `origin/nextjs-rebuild` is tracking the local branch.
    - [x] Verify Railway build succeeds.
      Comment: Newest deployment succeeded with Railpack Node.
    - [x] Verify unauthenticated protected routes do not serve dashboard content.
      Comment: Production `/` redirects to `/sign-in`.
    - [x] Verify sign-in route loads.
      Comment: Production `/sign-in` returns 200.
    - [x] Verify healthcheck.
      Comment: Production `/api/health` returns ok.

## Phase 8 - Acceptance Tests

1. **Local checks:**
    - [x] `pnpm lint` passes from repo root.
      Comment: Verified.
    - [x] `pnpm build` passes from repo root.
      Comment: Verified.
    - [x] No Turbopack workspace-root warning remains.
      Comment: Explicit root pin remains in `next.config.ts`.
    - [x] No secrets are committed.
      Comment: Only `.env.example` is tracked.

2. **Security checks:**
    - [x] Unauthenticated users cannot access dashboard pages.
      Comment: Protected routes redirect to Clerk sign-in.
    - [x] Direct mutation calls re-check auth.
      Comment: Server Actions call auth helpers.
    - [x] Non-admin users cannot mutate.
      Comment: Client-index creation requires workspace admin.
    - [x] Mongo reads/writes are scoped.
      Comment: Client index is org-scoped; workspace state is org/user-scoped.
    - [x] Audit events are written for implemented mutations.
      Comment: Current creation/progress mutations write non-PII audit events.

3. **Data checks:**
    - [x] `client_index` contains minimal metadata only.
      Comment: Current schema matches the metadata-only v1 model.
    - [x] No full intake details are stored in MongoDB v1.
      Comment: Full intake fields are absent from schema, actions, and UI.
    - [x] Module and README checklist state no longer depends on localStorage.
      Comment: Both use `workspace_state`.
    - [x] Workspace files remain local-only and gitignored.
      Comment: App does not expose raw `workspace/` files.

4. **UX checks:**
    - [x] Core protected routes render behind Clerk.
      Comment: Dashboard pages are available through real Next routes.
    - [x] Browser Back/Forward uses real routes instead of hash routing.
      Comment: The old hash SPA has been replaced by App Router routes.
    - [x] Visual direction remains tied to the prototype.
      Comment: Brand tokens and legacy page CSS are retained while features continue to mature.

## Post-Rebuild Feature Backlog

These are intentionally outside the completed rebuild milestone and should become the next plan:

- Add note-taking surfaces for each module deliverable, with autosave to MongoDB.
- Add client form submission flows beyond the metadata-only index once encryption, consent, retention, and attorney-review boundaries are defined.
- Add client detail pages that keep PII out of git and out of unaudited surfaces.
- Add client archive/update flows and matching audit events.
- Add module completion rollups and optional UI preferences in `workspace_state`.
- Add authenticated browser verification once test credentials are available.
- Replace remaining legacy CSS over time with tighter component-level styles once features settle.

## Implementation Notes

- The Next.js rebuild is complete; future work should build on the root app rather than the removed static file.
- Keep the app internal-only. Do not build a public marketing site in this workspace.
- Keep `.claude` canonical; do not switch to `.agents` or `.Codex`.
- Keep full intake persistence deferred until encryption, consent, retention, and attorney-review requirements are designed.
- Keep `MONGODB_URI` canonical in production. `MONGO_URI` is accepted as a local alias to reduce setup friction.
