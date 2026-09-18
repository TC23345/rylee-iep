# Acentra design: restyling the Case Log on Acentra Health's brand

Written 2026-09-17 on the `acentra-rebrand` branch. Source material lives in
`docs/brand/`: the logo and favicon Taylor supplied, full-page and hero
screenshots of https://acentra.com/ taken the same day, and a screenshot of our
header with the logo in place. Nothing in this document is applied yet beyond
the logo and favicon; the rest is the plan.

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
**dark-background variant**: 91% of its opaque pixels are Acentra green and the
rest white. On a light surface the white lettering disappears, so it is shown
on an ink tile in the header in both modes. Their light variant is
`logo-retina.png` on their site if we ever want the ink wordmark instead.

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

Light keeps the site's white-and-sand feel; dark is built from the ink so the
logo tile disappears into the header rather than sitting on it.

### 3.1 Light

| Token | Value | Derivation |
|---|---|---|
| `--background` | `#F4F6F6` | ink at 4% over white; cooler than the current cream |
| `--card` | `#FFFFFF` | their page white |
| `--foreground` | `#042126` | ink |
| `--muted` | `#E8EEEE` | ink at 9% |
| `--muted-foreground` | `#4F6B6E` | ink lightened to 4.5:1 on white |
| `--border` / `--input` | `#D6E0E1` | ink at 16% |
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

| Token | Value | Derivation |
|---|---|---|
| `--background` | `#031A1E` | ink darkened 20% |
| `--card` | `#0B2C31` | ink lightened 8% |
| `--foreground` | `#E6F1F0` | mint desaturated to near-white |
| `--muted` | `#123A40` | card lightened |
| `--muted-foreground` | `#9DB9BC` | 4.6:1 on card |
| `--border` / `--input` | `#1E474D` | |
| `--brand` | `#2BBC2B` | unchanged; passes 4.5:1 on ink |
| `--brand-dim` | `#5FD65F` | lifted for text on dark |
| `--primary` / `--primary-foreground` | `#2BBC2B` / `#042126` | same button as light |
| `--secondary` / `--secondary-foreground` | `#ACF2E5` / `#042126` | mint takes teal's job on dark |
| `--accent` / `--accent-foreground` | `#B4EA54` / `#042126` | lime |
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
- Calendar shading uses the brand green ramp instead of gold; the selected
  row highlight becomes mint at 25%.

### 3.4 Case-type chips on the new surfaces

The eleven chip colours were chosen against cream and dark brown. Against
white and ink they still read, but two need a check once applied: lime
(Recon Reply) against the green brand accent, and emerald (Authorization
Revision) against the primary button. If either muddies, shift Recon Reply to
`cyan` and Authorization Revision to `teal`.

## 4. Implementation plan

Each step is a commit on `acentra-rebrand`; nothing merges until the
screenshots in step 6 are approved.

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
| `acentra-logo.webp` | The supplied logo, dark-background variant, 330 by 94 |
| `acentra-favicon.png` | The supplied favicon, 278 by 224 (also `app/icon.png` and `app/apple-icon.png`) |
| `acentra-home-hero.png` | acentra.com above the fold, 1280 wide |
| `acentra-home-full.png` | acentra.com full page |
| `header-light.png` / `header-dark.png` | Our header with the logo tile in each theme |
