import Link from "next/link";
import { stat } from "node:fs/promises";
import path from "node:path";
import { ScopeDisclaimer } from "@/components/ScopeDisclaimer";
import { BUSINESS_FILES, BIZ_GROUPS } from "@/lib/data";

// Business — was #business / loadBusinessPage. BUSINESS_FILES grouped by BIZ_GROUPS,
// each item's status probed server-side against the local (gitignored) workspace/.
// "Open file" is a disabled placeholder: workspace/ is not served by Next (local-only);
// "Run skill" deep-links to the in-app skill page.

const BizGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </svg>
);

async function probe(file: string): Promise<"found" | "empty"> {
  try {
    const s = await stat(path.join(process.cwd(), "workspace", "business", file));
    return s.isFile() && s.size > 0 ? "found" : "empty";
  } catch {
    return "empty";
  }
}

export default async function BusinessPage() {
  const probed = await Promise.all(
    BUSINESS_FILES.map(async (item) => ({ ...item, status: await probe(item.file) }))
  );
  const bySlug = Object.fromEntries(probed.map((it) => [it.skill, it]));
  const foundCount = probed.filter((it) => it.status === "found").length;
  const total = probed.length;

  return (
    <div className="biz-wrap">
      <header className="biz-hero">
        <div className="biz-hero-text">
          <h1>Business decisions</h1>
          <p className="biz-hero-sub">
            Rylee&apos;s six Module&nbsp;1 decisions — registered, priced, insured, and
            ready to onboard a first client.
          </p>
          <div className="biz-hero-note">
            Business decision files stay local-only and gitignored.
          </div>
        </div>
        <div className="biz-hero-stat">
          <div className="biz-hero-stat-num">
            {foundCount}
            <em> / {total}</em>
          </div>
          <div className="biz-hero-stat-label">Captured</div>
        </div>
      </header>

      <ScopeDisclaimer gates={["legal", "tax", "idFPR", "clinical"]} />

      {BIZ_GROUPS.map((group) => {
        const items = group.slugs.map((slug) => bySlug[slug]).filter(Boolean);
        if (!items.length) return null;
        return (
          <section className="biz-group" key={group.title}>
            <h2 className="biz-group-title">{group.title}</h2>
            <div className="biz-group-list">
              {items.map((it) => {
                const isFound = it.status === "found";
                return (
                  <article className="biz-item" key={it.skill}>
                    <div className="biz-item-glyph">
                      <BizGlyph />
                    </div>
                    <div className="biz-item-meta">
                      <div className="biz-item-title">{it.title}</div>
                      <div className="biz-item-desc">{it.desc}</div>
                    </div>
                    <div className="biz-item-side">
                      <span className={`biz-status ${isFound ? "biz-status-found" : "biz-status-empty"}`}>
                        {isFound ? "On disk" : "Not captured"}
                      </span>
                      <div className="biz-item-actions">
                        <span
                          className="btn biz-action biz-action--muted"
                          aria-disabled="true"
                          title="Local-only files are not served by the app"
                        >
                          Open file
                        </span>
                        <Link className="btn btn-primary biz-action" href={`/skill/${it.skill}`}>
                          Run skill
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
