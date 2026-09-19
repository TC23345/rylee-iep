# Acentra design: restyling the Case Log on Acentra Health's brand

Written 2026-09-17 on the `acentra-rebrand` branch. Source material lives in
`docs/brand/`: the logo and favicon Taylor supplied, full-page and hero
screenshots of https://acentra.com/ taken the same day, and a screenshot of our
header with the logo in place. Sections 3 and 4 are applied on this branch
(commits "Rebrand step 1" through "step 5"); the screenshots in section 5 show
the result and are what to review before merging.

## 1. What acentra.com actually uses

Measured from the live site's computed styles, not eyeballed.

| Role on their site | Value | Where it shows |
|---|---|---|
| Ink (text, dark buttons) | `#042126` rgb(4, 33, 38) | body text, cookie buttons, 390 of 500 sampled elements |
| Teal | `#005F68` | `h2` headings |
| Navy | `#15295A` | paragraphs in content sections |
| Link navy | `#15497E` | links, nav links |
| Green (primary action) | `#2BBC2B` | "Explore All Solutions" button, ink text on it |
| Green, deep | `#1C8B38` | secondary green surfaces |
| Lime | `#B4EA54` | a single accent |
| Mint | `#ACF2E5` | soft highlight surfaces |
| Sand | `#F2ECE4` | warm neutral section background |
| White | `#FFFFFF` | page and footer |

Typography: **Roboto 700** for headings (h1 65px, h2 40px), **Lato 400** for
body, links and buttons (14 to 18px), Inter in a few HubSpot modules. Buttons
are pills (40 to 42px radius); the primary is green with ink text at Roboto 700,
the secondary is white with an ink border. The hero is a dark photograph with
white type and the white logo variant.

The logo we were given (`docs/brand/acentra-logo.webp`, 330 by 94) is the
white-on-dark variant: the "acentra" wordmark is green and only the small
"Health" line beneath it is white. acentra.com serves the same 330 by 94 PNG
in an ink-"Health" variant (`acentra-logo-retina.png`) and a white one; its
"SVG" footer logo is a raster wrapped in an SVG, so there is no vector to be
had. The header therefore uses `acentra-wordmark.png`, the top 57 rows of the
PNG: the green wordmark alone on a transparent background, which reads on
both light and dark surfaces without a tile.

## 2. How we standardize the app's UI and UX

The app grew feature by feature over two days. Before restyling, this is the
set of rules that keeps it feeling like one product, and the places where we
already broke them.

### 2.1 One source of colour

- Every colour comes from a token in `app/globals.css` (`:root` and `.dark`).
  Components use semantic utilities only: `bg-card`, `text-muted-foreground`,
  `border-border`, `bg-primary`, and so on.
- No hex values in components. Current violations to clean up: the ink tile
  behind the logo (`bg-[#042126]` in `app/(app)/layout.tsx`), and the Clerk
  palette hard-coded in `components/ClerkAppearanceProvider.tsx`. Both should
  read the same tokens as everything else.
- Brand accent utilities (`bg-gold`, `text-gold`, `text-gold-dim`, `bg-gold/10`,
  `bg-gold/15`) appear in the tab strip, the calendar shading, the selected-row
  highlight, the progress dots and the quick-pick chips. They become one
  `--brand` token so a rebrand is a token change, not a search and replace.
- Case-type colours (`CASE_TYPE_STYLES` in `lib/entry-schema.ts`) are data,
  not brand; they stay as they are in both themes. They must never be reused
  for anything that is not a case type.

### 2.2 One type scale

- Two families only: a heading face and a body face, plus a monospace face for
  case numbers and times. Today that is Playfair, DM Sans and DM Mono; after the
  rebrand it is Roboto, Lato and DM Mono.
- Scale: page title 30px, section title 24px, card title 20px, body 14px,
  small 12px, micro 10.5px (chip counts). Headings never all-caps.
- Numbers are always `tabular-nums`; case numbers are always monospace.

### 2.3 One set of surfaces and controls

| Piece | Rule |
|---|---|
| Page | `max-w-5xl`, 16px side gutter, 32px between sections |
| Card | `rounded-lg border border-border bg-card shadow-sm`, 20px padding |
| Table | header row 48px, body rows about 41px, hairline dividers, no zebra |
| Button | 32px tall; primary (brand), outline, ghost, icon (32 square). One primary per view |
| Chip | 28px pill; dot, label, count; pressed state is a filled card with a ring |
| Field | 32px; borderless when inline in a table, bordered in dialogs; edge shows on hover and focus |
| Dialog | `sm:max-w-md`, serif-free title after the rebrand, one primary action bottom-right |
| Toast | bottom centre, 8 s when it carries Undo |
| Empty state | shadcn `Empty` with a title and one sentence that says what to do |

### 2.4 One set of behaviours

- Inline edits save on blur; pickers save on pick. No Save buttons on rows.
- Destructive actions are hold-to-confirm with Undo, never a modal.
- Multi-step forms show "1 / 2" and progress dots; the Next button is never the
  same React node as the submit button.
- Filters are chips; a chip both filters and reports its count.
- Every list that can be empty has an empty state that names the next action.

### 2.5 Mobile and accessibility floor

- Every screen is checked at 390px wide and 1280px wide, in light and dark.
- Headers stack on phones: title row, then a full-width primary action with
  icon buttons at its right.
- Horizontal scroll is allowed only inside a table region or a chip row, never
  on the page.
- Icon-only buttons carry `aria-label` and a tooltip; toggles carry
  `aria-pressed` or `aria-expanded`; live summaries use `aria-live="polite"`.
- Focus rings are visible (`focus-visible:ring-2 ring-ring/50`).

### 2.6 How we enforce it

- Playwright screenshots of `/`, `/month/<ym>`, the add dialog and the sign-in
  page at both widths and both themes, kept in `docs/brand/` after each
  visual change.
- A grep for hex literals and `gold` in `app/` and `components/` must return
  nothing once the rebrand lands.
- New shadcn pieces are added with the CLI and never hand-edited except to fix
  a broken import.

## 3. The Acentra token set

Light keeps the site's white-and-sand feel; dark is a neutral graphite with the
green held back to a single accent.

### 3.1 Light

| Token | Value | Derivation |
|---|---|---|
| `--background` | `#F3EDE4` | their sand; warm page (2026-09-18, replaced the cool `#F4F6F6`) |
| `--card` / `--popover` | `#FFFCF7` | warm ivory instead of pure white |
| `--foreground` | `#042126` | ink |
| `--muted` | `#ECE4D8` | deeper sand |
| `--table-head` | `#EBE2D4` | table header rows; warm tan, never green |
| `--muted-foreground` | `#6B6155` | warm taupe, over 4.5:1 on ivory |
| `--border` / `--input` | `#E2D8CA` / `#DCD1C1` | taupe |
| `--brand` (replaces gold) | `#2BBC2B` | their primary green |
| `--brand-dim` | `#1C8B38` | their deep green, for text on light surfaces |
| `--primary` / `--primary-foreground` | `#2BBC2B` / `#042126` | their primary button exactly |
| `--secondary` / `--secondary-foreground` | `#005F68` / `#FFFFFF` | teal |
| `--accent` / `--accent-foreground` | `#ACF2E5` / `#042126` | mint highlight |
| `--destructive` | `#B42318` | not on their site; chosen to sit beside the green |
| `--ring` | `#2BBC2B` | brand |
| `--sand` | `#F2ECE4` | optional warm surface for the month card |
| link colour | `#15497E` | their link navy |

### 3.2 Dark

A conventional graphite dark theme. Green appears only where it means
something: the primary button, the active tab, the calendar shading and focus
rings. Surfaces, text and borders carry no green tint, so the one accent reads
as an accent rather than a second green fighting the first.

| Token | Value | Derivation |
|---|---|---|
| `--background` | `#0F1214` | graphite, near-black with a cool cast |
| `--card` | `#171B1E` | one step up from the page |
| `--foreground` | `#E7E9EA` | off-white |
| `--muted` | `#22272B` | two steps up; hover surfaces |
| `--muted-foreground` | `#9AA3A8` | 5.1:1 on card |
| `--border` / `--input` | `#2B3236` | |
| `--brand` | `#2BBC2B` | unchanged |
| `--brand-dim` | `#6FD66F` | lifted for green text on dark |
| `--primary` / `--primary-foreground` | `#2BBC2B` / `#06210A` | the one green button |
| `--secondary` / `--secondary-foreground` | `#2A3236` / `#E7E9EA` | neutral, no mint |
| `--accent` / `--accent-foreground` | `#1D2F22` / `#CDEACD` | the hint of green: a dark green wash for highlighted rows |
| `--destructive` | `#F0705A` | |
| `--ring` | `#2BBC2B` | |
| link colour | `#8EC5FF` | navy lifted for dark |

`color-scheme: dark` stays on `.dark` so native pickers follow.

### 3.3 Type and shape

- Headings: Roboto 700 via `next/font/google`, replacing Playfair Display.
- Body and controls: Lato 400 and 700, replacing DM Sans.
- Numbers and case ids: DM Mono, unchanged.
- Buttons become pills (`rounded-full`) to match their site; cards and
  dialogs stay at 8 to 12px. Chips are already pills.
- Calendar shading uses a five-step green ramp (`--heat-1` to `--heat-5`,
  light: pale to deep green; dark: dim to vivid green), spread between the
  month's lightest and busiest logged days so a run of similar days still
  shows its differences. Text on each step flips for contrast. The selected
  row highlight becomes the accent at 25%.

### 3.4 Case-type chips on the new surfaces

The eleven chip colours were chosen against cream and dark brown. Against
white and ink they still read, but two need a check once applied: lime
(Recon Reply) against the green brand accent, and emerald (Authorization
Revision) against the primary button. If either muddies, shift Recon Reply to
`cyan` and Authorization Revision to `teal`.

## 4. Implementation plan

Each step is a commit on `acentra-rebrand`. Steps 1 to 6 are done; the branch
waits on review of the screenshots below before merging.

1. **Tokens.** Replace the `:root` and `.dark` blocks in `app/globals.css`
   with section 3. Add `--brand` and `--brand-dim`, keep `--gold` as an alias
   of `--brand` for one release so nothing breaks mid-way.
2. **Fonts.** Swap Playfair and DM Sans for Roboto and Lato in `app/layout.tsx`
   and the `@theme` font variables.
3. **Utilities.** Replace `gold` classes with `brand` across
   `components/MonthNav.tsx`, `components/MonthInsightCards.tsx`,
   `components/DailyCountsTable.tsx`, `components/AddEntryDialog.tsx`,
   `components/EntryForm.tsx`, `components/EntryTable.tsx` and
   `components/TypeMix.tsx`. Move the logo tile colour to a token.
4. **Clerk.** Point `components/ClerkAppearanceProvider.tsx` at the new
   values so the sign-in card and account menu match.
5. **Buttons.** Make `variant="default"` and the `btn-primary` class the green
   pill; keep outline and ghost as they are.
6. **Screenshots and sign-off.** Capture `/`, `/month/2026-09`, the add
   dialog and `/sign-in` at 390 and 1280 in both themes into `docs/brand/`,
   then merge.

## 5. Files in docs/brand

| File | What it is |
|---|---|
| `acentra-logo.webp` | The supplied logo, white-"Health" variant, 330 by 94 |
| `acentra-logo-retina.png` / `acentra-logo-white.png` | The same logo as served by acentra.com, ink and white "Health" variants |
| `acentra-footer-logo.svg` | Their footer logo; a raster wrapped in SVG, kept for reference only |
| `acentra-wordmark.png` | The cropped green wordmark used in the header (also `public/brand/`) |
| `ry-avatar.jpg` | Rylee's profile photo, 200 by 200; uploaded to her Clerk profile on 2026-09-17 |
| `acentra-favicon.png` | The supplied favicon, 278 by 224 (also `app/icon.png` and `app/apple-icon.png`) |
| `acentra-home-hero.png` | acentra.com above the fold, 1280 wide |
| `acentra-home-full.png` | acentra.com full page |
| `header-light.png` / `header-dark.png` | Our header with the wordmark in each theme |
| `rebrand-home-{light,dark}-1280.png` | Daily Case Counts page after the restyle, desktop |
| `rebrand-home-light-390.png` | The same at phone width |
| `rebrand-month-{light,dark}-1280.png` | A month tab after the restyle, desktop |
| `rebrand-month-{light,dark}-390.png` | A month tab at phone width, with the day's rows and chips |
| `rebrand-dialog-light-1280.png` | The two-step add dialog with the green pill Next |
| `rebrand-calendar-{light,dark}-1280.png` | The month card with the five-step heat ramp |
| `rebrand-signin-{light,dark}-390.png` | Clerk sign-in card on the new palette |
