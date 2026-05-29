import { ChecklistMarkdown } from "@/components/ChecklistMarkdown";
import type { ModuleDeliverableState } from "@/lib/workspace-state";

// Renders the modules.md chunk and wires each markdown checkbox to Mongo-backed
// workspace_state progress scoped by orgId + userId.
export function ModuleSource({
  markdown,
  n,
  initialChecked,
}: {
  markdown: string;
  n: number;
  initialChecked: ModuleDeliverableState;
}) {
  return (
    <ChecklistMarkdown
      markdown={markdown}
      className="module-source"
      initialChecked={initialChecked}
      checklist={{ source: "module", moduleNumber: n }}
    />
  );
}
