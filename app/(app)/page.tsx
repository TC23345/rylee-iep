import { getReadme } from "@/lib/content";
import { requireSignedInUser } from "@/lib/authz";
import { getReadmeChecklistState } from "@/lib/workspace-state";
import { ChecklistMarkdown } from "@/components/ChecklistMarkdown";

// Overview — renders README.md (was #overview / loadReadme in index.html).
export default async function OverviewPage() {
  const actor = await requireSignedInUser();
  const readme = await getReadme();
  let progress = {};
  let progressUnavailable = false;

  try {
    progress = await getReadmeChecklistState(actor);
  } catch {
    progressUnavailable = true;
  }

  return (
    <div className="mx-auto max-w-[72ch]">
      {progressUnavailable && (
        <div className="mb-4 rounded-md border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm text-secondary">
          Checklist progress is temporarily unavailable. Content is still readable.
        </div>
      )}
      <ChecklistMarkdown
        markdown={readme}
        initialChecked={progress}
        checklist={{ source: "readme" }}
      />
    </div>
  );
}
