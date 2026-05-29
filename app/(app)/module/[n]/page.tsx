import { notFound } from "next/navigation";
import { getModule } from "@/lib/data";
import { getModuleSection, getModuleContent, type ContentSection } from "@/lib/content";
import { requireSignedInUser } from "@/lib/authz";
import { getModuleDeliverableState } from "@/lib/workspace-state";
import { ModuleSource } from "@/components/ModuleSource";
import { DeliverableSections } from "@/components/DeliverableSections";

// Module-N — was #module-N / renderModuleMain. Module meta badge + the modules.md
// source chunk (with persistent checkboxes) + deliverable sections from
// content/module-N.md (falling back to the module's deliverables). Fixes the old
// single-digit route limit (architecture §8.7) via a real [n] segment.
export default async function ModulePage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n: nStr } = await params;
  const n = Number(nStr);
  const mod = getModule(n);
  if (!mod || !Number.isInteger(n)) notFound();

  const chunk = await getModuleSection(n);
  const content = await getModuleContent(n);
  const actor = await requireSignedInUser();
  let progress = {};
  let progressUnavailable = false;

  try {
    progress = await getModuleDeliverableState(actor, n);
  } catch {
    progressUnavailable = true;
  }

  const sections: ContentSection[] =
    content ??
    mod!.deliverables.map((d) => ({ heading: d.heading || d.text, body: d.body || "" }));

  return (
    <div>
      <div className="module-meta">
        <span className="badge badge-scaffold">
          Module {mod!.n} Action Plan: [MM-DD-YYYY]
        </span>
      </div>

      {progressUnavailable && (
        <div className="mb-4 rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
          Checklist progress is temporarily unavailable. Module content is still readable.
        </div>
      )}

      {chunk ? (
        <ModuleSource key={n} markdown={chunk} n={n} initialChecked={progress} />
      ) : (
        <div className="module-source md-body">
          <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            Could not load module content from <code>modules.md</code>.
          </p>
        </div>
      )}

      <hr className="module-section-divider" />

      <div className="module-below">
        <DeliverableSections sections={sections} />
      </div>
    </div>
  );
}
