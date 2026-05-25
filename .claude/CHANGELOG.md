# .claude CHANGELOG

Append-only log of changes to skills, commands, assets, and shared references. Add a dated entry every time a skill is edited or a new skill is authored — `/module-debrief` writes here automatically; manual edits should add their own entry.

Format:

```
## YYYY-MM-DD — <short summary>

- **What**: <skill or file path>
- **Why**: <module N debrief / typo / Rylee's correction / etc.>
- **Who**: <Rylee + Claude | Taylor + Claude>
```

---

## 2026-05-21 — Initial scaffold

- **What**: created `.claude/` structure (`shared/`, `commands/`, `skills/`), migrated four Module-1 starter skills (business-name, entity-setup, services-fees, intake-process) from `iep-skills-and-commands/`, drafted two new Module-1 skills (liability-insurance, backend-systems), wrote `CLAUDE.md`, `.gitignore`, four `shared/*.md` files, and four commands (new-client, module-debrief, checklist, weekly-review)
- **Why**: foundation for course progression. Modules 2–8 skills will be authored as Rylee reaches each module
- **Who**: Taylor + Claude

## 2026-05-24 — Dashboard skill-page convention + first authored skill (business-name)

- **What**:
  - Moved `.claude/shared/rylee-profile.md` → `profile.md` at the repo root; updated references in `CLAUDE.md` and `.claude/shared/pii-policy.md`.
  - Overview page (`README.md`): dropped the Skills explanatory subsection, added a horizontal rule between the Workflow Framework and Workspace sections, added an in-app CTA card linking to the Business workspace (uses `showPage('business')`, no full reload).
  - Established the dashboard skill-page content convention: `content/skills/<slug>/<lens>.md` (lens ∈ {research, module, expert}). `index.html`'s `renderM1SkillPage` hydrates each lens panel from those files — a leading `# H1` is promoted to the tab label + panel title, an optional `*italic subtitle*` on the next line is promoted to the panel hint, and the rest renders as the panel body. Missing files fall back to the bracketed placeholder.
  - Authored the first complete Module-1 skill page — `content/skills/business-name/{research,module,expert}.md` — splitting the Keystone IEP Advocacy LLC research across three priority tabs: Highest priority / Legal-Compliance (research lens), Second priority / Branding (module lens), Third priority / SEO Upside (expert lens). Trimmed the SEO tab's Related-Searches/PAA tail to keep the explanation pages readable across three tabs.
  - Added `.md-body` styling for markdown tables, `<details>`/`<summary>` collapsibles, and lists inside blockquotes.
  - Documented the above in `CLAUDE.md` under a new `## Dashboard content conventions` section.
- **Why**: First module deliverable surfaces on the dashboard; the content convention had to land before Modules 2–8 (and the other Module-1 skills) layer in.
- **Who**: Taylor + Claude
