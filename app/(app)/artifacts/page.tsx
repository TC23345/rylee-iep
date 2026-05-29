import Link from "next/link";
import { MODULES, MODULE_BLURB } from "@/lib/data";

// Artifacts — was #artifacts / loadArtifactsPage. Module + skill grids with a
// module filter, now a real shareable `?m=<N>` search param instead of in-memory state.

function statusFor(status: string) {
  if (status === "scaffold") return { label: "Scaffold", cls: "crs-status-skill" };
  if (status === "pending") return { label: "Pending", cls: "crs-status-empty" };
  return { label: "Validated", cls: "crs-status-found" };
}

export default async function ArtifactsPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const filterModuleN = m && /^\d+$/.test(m) ? Number(m) : null;
  const activeFilter = filterModuleN ? `m${filterModuleN}` : "all";

  const modulesToShow = filterModuleN ? MODULES.filter((mod) => mod.n === filterModuleN) : MODULES;

  // Flat, de-duped skill list from MODULES (authored unless the module is pending).
  const seen = new Set<string>();
  const skills: Array<{ slug: string; moduleN: number; authored: boolean }> = [];
  for (const mod of MODULES) {
    for (const d of mod.deliverables) {
      for (const l of d.links) {
        if (l.slug && !seen.has(l.slug)) {
          seen.add(l.slug);
          skills.push({ slug: l.slug, moduleN: mod.n, authored: mod.status !== "pending" });
        }
      }
    }
  }
  const skillsToShow = filterModuleN ? skills.filter((s) => s.moduleN === filterModuleN) : skills;

  const tabs = ["all", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8"];

  return (
    <div className="crs-wrap">
      <div className="art-filter" role="tablist" aria-label="Filter artifacts by module">
        {tabs.map((f) => (
          <Link
            key={f}
            href={f === "all" ? "/artifacts" : `/artifacts?m=${f.slice(1)}`}
            className={`art-filter-tab${f === activeFilter ? " active" : ""}`}
          >
            {f === "all" ? "All" : `M${f.slice(1)}`}
          </Link>
        ))}
      </div>

      <section className="art-section">
        <h2 className="art-section-title">Modules</h2>
        <div className="crs-grid">
          {modulesToShow.map((mod) => {
            const st = statusFor(mod.status);
            const delivCount = mod.deliverables.length;
            const linkedCount = mod.deliverables.filter((d) => d.links.length).length;
            const skillCount = mod.status === "pending" ? 0 : linkedCount;
            const skillMeta = skillCount === 0 ? "skills pending" : `${skillCount} skill${skillCount === 1 ? "" : "s"} authored`;
            return (
              <article className="crs-card" key={mod.n}>
                <div className="crs-card-header">
                  <div className="crs-card-headline">
                    <span className="crs-card-num">M{mod.n}</span>
                    <span className="crs-card-title">{mod.title}</span>
                  </div>
                  <span className={`crs-status ${st.cls}`}>{st.label}</span>
                </div>
                <div className="crs-card-desc">{MODULE_BLURB[mod.n] || mod.short}</div>
                <div className="crs-meta">
                  {delivCount} deliverable{delivCount === 1 ? "" : "s"} · {skillMeta}
                </div>
                <div className="crs-actions">
                  <Link className="btn crs-action" href={`/module/${mod.n}`}>
                    Course Notes
                  </Link>
                  <Link className="btn btn-primary crs-action" href={`/artifacts?m=${mod.n}`}>
                    View Artifacts
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="art-section">
        <h2 className="art-section-title">Skills</h2>
        {skillsToShow.length ? (
          <div className="art-skills-grid">
            {skillsToShow.map((s) => (
              <article className="art-skill-card" key={s.slug}>
                <div className="art-skill-head">
                  <span className="art-skill-mod">M{s.moduleN}</span>
                  <Link className="art-skill-slug" href={`/skill/${s.slug}`}>
                    {s.slug}
                  </Link>
                </div>
                <span className={`crs-status ${s.authored ? "crs-status-found" : "crs-status-empty"}`}>
                  {s.authored ? "Authored" : "Pending"}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="art-empty">No skills for this module yet.</div>
        )}
      </section>

      <section className="art-section">
        <h2 className="art-section-title">Artifacts</h2>
        <div className="art-empty">
          {filterModuleN
            ? `No artifacts produced for Module ${filterModuleN} yet. They'll land here as Rylee + Taylor produce them in the Design and Deliver phases.`
            : "No artifacts produced yet. They'll land here as Rylee + Taylor produce them in the Design and Deliver phases of each module."}
        </div>
      </section>
    </div>
  );
}
