# Skill-Page Authoring Style

How to write a dashboard skill explanation page — the `content/skills/<slug>/<lens>.md` files that render as the three tabs on a Module-1 skill page.

The *mechanics* (paths, `# H1` → tab title, `*italic*` → panel hint, fallback to placeholder) live in `CLAUDE.md` → **Dashboard content conventions**. This doc is about the **writing**.

## Who's talking to whom

Every page is **Taylor explaining his domain to Rylee**:

- **Author (Taylor)** — the operations side: SEO, business formation, legal/compliance research, branding, back-end systems.
- **Reader (Rylee)** — a BCBA/LBA who is herself a domain expert: fluent in special education, IEPs, and behavior analysis, but **not** in SEO, marketing, or entity law.

The register is **cross-domain translation between equals**: explain your specialty in plain terms to a smart person whose expertise happens to be in another field. Never talk down; never assume she already knows the jargon of your field.

## Voice

- **Preserve the author's hand-written voice.** The personality is the point — colloquial asides ("go bananas," "puts me in mind of," "all branding shenanigans aside," "as cheesy as it sounds") stay.
- **When revising, change the author's words as little as possible.** Fix grammar, flow, coherence, and structure — then stop. Do not flatten, formalize, or "house-style" the prose. If a sentence is awkward but unmistakably the author's, fix only what breaks it and present a diff for approval before applying.
- **Gloss every term of art on first use.** Give a one-clause, plain-terms definition a BCBA can act on — e.g., "search volume is just how many people type a given phrase into Google each month."

## Page shape

Lead a tab from **conclusion → rationale → evidence → detail**, never the reverse:

1. **`# H1`** — the headline / conclusion (becomes the tab label + panel title). Don't make the reader hunt for the answer.
2. **`*italic subtitle*`** — the role / priority framing (becomes the panel hint), e.g. `*Highest priority — Legal/Compliance*`.
3. **Lead paragraph(s)** — set the scene in one or two short paragraphs.
4. **Reference data** in a `<details open>` block so it's present but never dominates.
5. **Rationale paragraph** — the plain-terms "here's why, for a clinician" *above* any raw analysis.
6. **Lead-in sentence** — a short clause that hands off to structured content ("The result of our initial seed phrase query returned the following insights:").
7. **Structured insights** — a numbered list when ordered or prioritized, bullets when not.

Tab → content mapping is **per-skill**. For `business-name` the three tabs are the three decision priorities (Legal/Compliance → research, Branding → module, SEO Upside → expert). Other skills may map their tabs differently — let the content decide, and name each tab via its `# H1`.

## Components

| Pattern | Use it for |
|---|---|
| `<details open>` | Reference data (tables, long lists) that should be available but not the focus |
| Table with right-aligned numerics | Keyword/metric data — numbers right-align via the `---:` column marker |
| Lead-in sentence (bold) | Introducing a list or block: "…returned the following insights:" |
| Rationale paragraph | The plain-terms "why" for the cross-domain reader, placed *before* raw data |
| Blockquote | Set-aside asides, pulled quotes, meta-observations (e.g. the "SEO results are often surprising" note) |
| `## H2` | Breaking a long tab into scannable sections |

## Readability

- **Don't drag on.** The component is already three tabs — each tab earns its length. Cut tangents that don't serve the decision the page documents. (This is why the Related Searches / PAA tail was cut from the SEO tab.)
- **One idea per section.** If a passage runs long, split it with an `## H2`.
- **End where the point ends.** No filler closers, no "in conclusion" padding, no section that exists only to look complete.

## Pre-ship checklist

- [ ] H1 states the conclusion; italic subtitle states the role / priority
- [ ] Every term of art is glossed in plain terms on first use
- [ ] Conclusion comes before evidence; rationale comes before raw insights
- [ ] Reference data sits in a collapsible `<details>` block
- [ ] Author's voice intact — only grammar / flow / structure touched
- [ ] No section that just pads length; each one moves the decision forward
