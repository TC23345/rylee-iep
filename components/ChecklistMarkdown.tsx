"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { toast } from "sonner";

import { updateChecklistItemChecked } from "@/app/actions/workspace-state";
import type { ChecklistState } from "@/lib/workspace-state";

type ChecklistSource =
  | { source: "readme" }
  | { source: "module"; moduleNumber: number };

export function ChecklistMarkdown({
  markdown,
  className = "",
  initialChecked,
  checklist,
}: {
  markdown: string;
  className?: string;
  initialChecked: ChecklistState;
  checklist: ChecklistSource;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [checkedMap, setCheckedMap] = useState(initialChecked);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const boxes = root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    const cleanups: Array<() => void> = [];

    boxes.forEach((cb, i) => {
      const li = cb.closest("li") as HTMLElement | null;
      cb.disabled = false;
      cb.checked = !!checkedMap[String(i)];

      const setStruck = () => {
        if (li) {
          li.style.textDecoration = cb.checked ? "line-through" : "";
          li.style.opacity = cb.checked ? ".6" : "";
        }
      };

      setStruck();

      const onChange = () => {
        const nextChecked = cb.checked;
        setCheckedMap((current) => ({ ...current, [i]: nextChecked }));
        setStruck();

        startTransition(async () => {
          const res = await updateChecklistItemChecked({
            ...checklist,
            itemIndex: i,
            checked: nextChecked,
          });
          if (!res.ok) {
            setCheckedMap((current) => ({ ...current, [i]: !nextChecked }));
            cb.checked = !nextChecked;
            setStruck();
            toast.error(res.error);
          }
        });
      };

      cb.addEventListener("change", onChange);
      cleanups.push(() => cb.removeEventListener("change", onChange));
    });

    return () => cleanups.forEach((fn) => fn());
  }, [checkedMap, checklist, markdown]);

  return (
    <div ref={ref} className={`md-body ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
