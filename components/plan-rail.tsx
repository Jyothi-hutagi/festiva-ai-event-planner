"use client";

type Tab = readonly [string, string];

export function PlanRail({
  tabs,
  tab,
  onTab,
}: {
  tabs: readonly Tab[];
  tab: string;
  onTab: (key: string) => void;
}) {
  function move(direction: 1 | -1) {
    const index = tabs.findIndex(([key]) => key === tab);
    const next = tabs[(index + direction + tabs.length) % tabs.length]?.[0];
    if (!next) return;
    onTab(next);
    document.getElementById(`plan-tab-${next}`)?.focus({
      focusVisible: true,
    } as FocusOptions);
  }

  return (
    <div
      role="tablist"
      aria-label="Plan sections"
      className="flex w-full min-w-0 gap-1 overflow-x-auto print:hidden md:sticky md:top-4 md:flex-col md:gap-0 md:self-start md:overflow-visible"
    >
      {tabs.map(([key, label]) => {
        const selected = tab === key;
        return (
          <button
            key={key}
            id={`plan-tab-${key}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`plan-panel-${key}`}
            tabIndex={selected ? 0 : -1}
            className="flex min-h-11 shrink-0 items-center gap-2 border-b-[3px] border-transparent bg-transparent px-3 text-base font-medium whitespace-nowrap text-foreground aria-selected:border-primary md:w-full md:justify-start"
            onClick={() => onTab(key)}
            onKeyDown={(event) => {
              const forward =
                event.key === "ArrowRight" || event.key === "ArrowDown";
              const back = event.key === "ArrowLeft" || event.key === "ArrowUp";
              if (forward || back) {
                event.preventDefault();
                move(forward ? 1 : -1);
              }
            }}
          >
            <span
              aria-hidden="true"
              className={
                selected
                  ? "size-2 shrink-0 rounded-full bg-foreground"
                  : "size-2 shrink-0"
              }
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
