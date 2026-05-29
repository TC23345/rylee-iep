import { getReadme } from "@/lib/content";
import { requireSignedInUser } from "@/lib/authz";
import { getReadmeChecklistState } from "@/lib/workspace-state";
import { ChecklistMarkdown } from "@/components/ChecklistMarkdown";

// Overview renders README.md, replacing the former static dashboard overview.
export default async function OverviewPage() {
  const actor = await requireSignedInUser();
  const readme = await getReadme();
  let progress = {};

  try {
    progress = await getReadmeChecklistState(actor);
  } catch {
    progress = {};
  }

  return (
    <div className="mx-auto max-w-[72ch]">
      <ChecklistMarkdown
        markdown={readme}
        initialChecked={progress}
        checklist={{ source: "readme" }}
      />
    </div>
  );
}
