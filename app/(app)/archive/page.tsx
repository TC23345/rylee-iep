import { getArchive } from "@/lib/content";
import { Markdown } from "@/components/Markdown";

// Archive — renders archive.md (was #archive / loadArchive in index.html).
export default async function ArchivePage() {
  const archive = await getArchive();
  return <Markdown className="mx-auto max-w-[72ch]">{archive}</Markdown>;
}
