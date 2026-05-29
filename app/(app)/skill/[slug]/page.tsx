import Link from "next/link";
import { MODULE1_SKILLS, M1S_LENSES, SKILL_INDEX } from "@/lib/data";
import {
  getSkillLens,
  extractLeadingH1,
  placeholderForLens,
} from "@/lib/content";
import { M1SkillTabs, type ResolvedLens } from "@/components/M1SkillTabs";
import { ScopeDisclaimer, type ScopeGate } from "@/components/ScopeDisclaimer";

const SKILL_SCOPE_GATES: Partial<Record<string, ScopeGate[]>> = {
  "entity-setup": ["legal", "tax", "idFPR"],
  "liability-insurance": ["legal", "clinical"],
  "services-fees": ["legal", "clinical"],
  "backend-systems": ["legal"],
  "intake-process": ["legal", "clinical"],
  "iep-eligibility": ["clinical"],
  iee: ["clinical"],
  "esy-disputes": ["legal", "clinical"],
  "dispute-key-terms": ["legal"],
  "mediation-due-process": ["legal"],
  "evaluations-to-supports": ["clinical"],
  "job-transition": ["legal", "tax"],
};

// Skill — was #skill/<slug>. Module-1 slugs render the rich 3-lens page; other
// slugs (or unknown) render the pending placeholder / error.
export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = MODULE1_SKILLS[slug];
  const scopeGates = SKILL_SCOPE_GATES[slug];

  // ── Module-1 authored skill: rich 3-lens page ──────────────────────────
  if (meta) {
    const lenses: ResolvedLens[] = await Promise.all(
      M1S_LENSES.map(async (lens) => {
        const md = await getSkillLens(slug, lens.key);
        if (md) {
          const { title, hint, body } = extractLeadingH1(md);
          return {
            key: lens.key,
            num: lens.num,
            tabLabel: title || lens.label,
            panelTitle: title || `${lens.label} Context`,
            hint: hint || lens.hint,
            isPlaceholder: false,
            body,
          };
        }
        return {
          key: lens.key,
          num: lens.num,
          tabLabel: lens.label,
          panelTitle: `${lens.label} Context`,
          hint: lens.hint,
          isPlaceholder: true,
          body: placeholderForLens(lens.key),
        };
      })
    );

    return (
      <div className="m1s-wrap">
        <header className="m1s-hero">
          <div className="m1s-hero-row">
            <span className="m1s-hero-eyebrow">Module 1 · Skill</span>
            <span className="m1s-hero-chip">Authored</span>
            <span className="m1s-hero-slug">{slug}</span>
          </div>
          <pre className="m1s-frontmatter">
            <code>
              {`---\nname: ${slug}\ndescription: ${meta.description}\n---`}
            </code>
          </pre>
        </header>

        <div className="m1s-deliverable" aria-label="Course deliverable">
          <span className="m1s-deliverable-label">Deliverable</span>
          <span className="m1s-deliverable-text">&quot;{meta.deliverableMatch}&quot;</span>
        </div>

        {scopeGates ? <ScopeDisclaimer gates={scopeGates} /> : null}

        <M1SkillTabs lenses={lenses} />

        <div className="m1s-foot">
          <div className="m1s-foot-note">
            Local skill source stays private in the project workspace.
          </div>
          <div className="m1s-foot-actions">
            <Link className="btn skl-action" href="/module/1">
              ← Back to Module 1
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Unknown slug ────────────────────────────────────────────────────────
  const entry = SKILL_INDEX[slug];
  if (!entry) {
    return (
      <div className="skl-error">
        <h2>Unknown skill</h2>
        <p>
          No skill named <code>{slug}</code> is defined in any module yet.
        </p>
        <div style={{ marginTop: 16 }}>
          <Link className="btn btn-primary" href="/">
            Back to Overview
          </Link>
        </div>
      </div>
    );
  }

  // ── Pending-skill placeholder ────────────────────────────────────────────
  const { mod, deliverable } = entry;
  return (
    <div className="skl-wrap">
      <header className="skl-hero">
        <div className="skl-hero-main">
          <div className="skl-hero-eyebrow">Skill placeholder</div>
          <h1 className="skl-hero-slug">{slug}</h1>
          <p className="skl-hero-sub">
            Authored during <code>/module-debrief {mod.n}</code> once Rylee watches Module{" "}
            {mod.n}. Until then, this page stands in so the deliverable link doesn&apos;t
            dead-end.
          </p>
        </div>
        <div className="skl-hero-stat">
          <div className="skl-hero-stat-label">Pending</div>
          <div className="skl-hero-stat-value">M{mod.n}</div>
        </div>
      </header>

      {scopeGates ? <ScopeDisclaimer gates={scopeGates} /> : null}

      <section className="skl-context">
        <h2>Module context</h2>
        <p>
          This skill belongs to{" "}
          <strong>
            Module {mod.n} — {mod.title}
          </strong>
          .
        </p>
        <p>Deliverable it addresses:</p>
        <p className="skl-deliverable">&quot;{deliverable.text}&quot;</p>
      </section>

      <section className="skl-next">
        <div className="skl-next-title">What happens next</div>
        <div className="skl-next-body">
          After watching Module {mod.n}, Rylee writes local module notes and runs{" "}
          <code>/module-debrief {mod.n}</code>. The debrief authors this skill and the
          other Module {mod.n} skills by merging her notes with Dr. Annie&apos;s actual
          lessons. Once that&apos;s done, this page is replaced by the authored skill.
        </div>
      </section>

      <div className="skl-actions">
        <Link className="btn btn-primary skl-action" href={`/module/${mod.n}`}>
          ← Back to Module {mod.n}
        </Link>
      </div>
    </div>
  );
}
