import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { type ContentSection, sectionBodyOrPlaceholder } from "@/lib/content";

// Ports renderModuleBelow + renderSectionBody: each section is a heading + body; the
// body splits on blank lines, bracketed "[…]" blocks render as muted placeholders and
// the rest as markdown. Server component (no interactivity).
function bodyBlocks(body: string): string[] {
  return sectionBodyOrPlaceholder(body)
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export function DeliverableSections({ sections }: { sections: ContentSection[] }) {
  return (
    <>
      {sections.map((s, i) => (
        <section key={i} className="deliverable-section">
          <h2>{s.heading}</h2>
          <div className="deliverable-section-body md-body">
            {bodyBlocks(s.body).map((block, j) =>
              block.startsWith("[") ? (
                <p key={j} className="placeholder">
                  {block}
                </p>
              ) : (
                <ReactMarkdown
                  key={j}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {block}
                </ReactMarkdown>
              )
            )}
          </div>
        </section>
      ))}
    </>
  );
}
