"use client";

import { useState } from "react";
import type { Plan } from "@/lib/schema";

const sections = [
  ["themes", "Themes"],
  ["menu", "Menu"],
  ["activities", "Activities"],
  ["decor", "Decor"],
] as const;

type SectionKey = (typeof sections)[number][0];

function IdeaList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 text-sm">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export function IdeasPanel({ ideas }: { ideas: Plan["ideas"] }) {
  const [tab, setTab] = useState<SectionKey>("themes");

  function moveTab(direction: 1 | -1) {
    const index = sections.findIndex(([key]) => key === tab);
    const next =
      sections[(index + direction + sections.length) % sections.length][0];
    setTab(next);
    document.getElementById(`ideas-tab-${next}`)?.focus();
  }

  return (
    <>
      <div className="hidden gap-4 print:grid">
        {sections.map(([key, label]) => (
          <section
            key={key}
            className="print-card grid gap-2 print:break-inside-avoid"
          >
            <h4 className="font-medium">{label}</h4>
            <IdeaList items={ideas[key]} />
          </section>
        ))}
      </div>
      <div className="grid gap-4 md:hidden print:hidden">
        {sections.map(([key, label]) => (
          <section key={key} className="grid gap-2">
            <h4 className="font-medium">{label}</h4>
            <IdeaList items={ideas[key]} />
          </section>
        ))}
      </div>
      <div className="hidden gap-3 md:grid print:hidden">
        <div role="tablist" aria-label="Ideas" className="flex flex-wrap gap-2">
          {sections.map(([key, label]) => {
            const selected = tab === key;
            return (
              <button
                key={key}
                id={`ideas-tab-${key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`ideas-panel-${key}`}
                tabIndex={selected ? 0 : -1}
                className="min-h-11 border-b-[3px] border-transparent bg-transparent px-3 text-base font-medium text-foreground aria-selected:border-primary"
                onClick={() => setTab(key)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    moveTab(event.key === "ArrowRight" ? 1 : -1);
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        {sections.map(([key, label]) => (
          <div
            key={key}
            id={`ideas-panel-${key}`}
            role="tabpanel"
            aria-labelledby={`ideas-tab-${key}`}
            hidden={tab !== key}
          >
            <h4 className="sr-only">{label}</h4>
            <IdeaList items={ideas[key]} />
          </div>
        ))}
      </div>
    </>
  );
}
