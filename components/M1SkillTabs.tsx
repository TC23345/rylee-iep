"use client";

import { useState } from "react";
import { Markdown } from "@/components/Markdown";

export interface ResolvedLens {
  key: string;
  num: string;
  tabLabel: string;
  panelTitle: string;
  hint: string;
  isPlaceholder: boolean;
  body: string; // markdown (when authored) or the bracketed placeholder text
}

// Ports the .m1s-tabs / .m1s-panels lens switcher. Tabs are color-coded by lens
// (research=sage, module=gold-dim, expert=terracotta) via the `[data-lens]` CSS.
export function M1SkillTabs({ lenses }: { lenses: ResolvedLens[] }) {
  const [active, setActive] = useState(lenses[0]?.key);

  return (
    <>
      <div className="m1s-tabs" role="tablist" aria-label="Context lens">
        {lenses.map((lens) => {
          const on = lens.key === active;
          const tabId = `m1s-tab-${lens.key}`;
          const panelId = `m1s-panel-${lens.key}`;
          return (
            <button
              key={lens.key}
              type="button"
              role="tab"
              className={`m1s-tab${on ? " is-active" : ""}`}
              data-lens={lens.key}
              id={tabId}
              aria-selected={on}
              aria-controls={panelId}
              onClick={() => setActive(lens.key)}
            >
              <span className="m1s-tab-num">{lens.num}</span>
              <span className="m1s-tab-label">{lens.tabLabel}</span>
            </button>
          );
        })}
      </div>

      <div className="m1s-panels">
        {lenses.map((lens) => (
          <section
            key={lens.key}
            role="tabpanel"
            className={`m1s-panel${lens.key === active ? " is-active" : ""}`}
            data-lens={lens.key}
            id={`m1s-panel-${lens.key}`}
            aria-labelledby={`m1s-tab-${lens.key}`}
            hidden={lens.key !== active}
          >
            <div className="m1s-panel-head">
              <span className="m1s-panel-num">{lens.num}</span>
              <h2 className="m1s-panel-title">{lens.panelTitle}</h2>
              <span className="m1s-panel-hint">{lens.hint}</span>
            </div>
            <div className="m1s-panel-body">
              {lens.isPlaceholder ? (
                <p className="m1s-panel-placeholder">{lens.body}</p>
              ) : (
                <Markdown className="m1s-panel-content">{lens.body}</Markdown>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
