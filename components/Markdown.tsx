// Renders markdown strings with the same feature set as the current app's marked@9:
// GFM tables/checklists (remark-gfm) and raw <details>/<summary> HTML (rehype-raw).
// Output is wrapped in `.md-body`, whose rules carry the former static dashboard styling.
// No "use client" — renders on the server.

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const components: Components = {
  // Preserve the former dashboard behavior: right-aligned numeric columns get tabular-nums.
  // via the `.md-body th[align="right"]` rule. react-markdown emits alignment as an
  // inline style, so mirror it onto the `align` attribute the CSS keys off.
  th: ({ style, ...props }) => (
    <th align={style?.textAlign === "right" ? "right" : undefined} {...props} />
  ),
  td: ({ style, ...props }) => (
    <td align={style?.textAlign === "right" ? "right" : undefined} {...props} />
  ),
};

export function Markdown({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={`md-body ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
