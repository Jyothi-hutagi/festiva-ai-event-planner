import type { Plan } from "@/lib/schema";
import { tickKey, type TickMap } from "@/lib/ticks";

function Ring({ done, total }: { done: number; total: number }) {
  const progress = total === 0 ? 0 : (done / total) * 100;
  return (
    <svg viewBox="0 0 36 36" className="size-11 shrink-0" aria-hidden="true">
      <circle
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <circle
        cx="18"
        cy="18"
        r="14"
        fill="none"
        stroke="var(--chart-2)"
        strokeWidth="3"
        pathLength={100}
        strokeDasharray={`${progress} ${100 - progress}`}
        transform="rotate(-90 18 18)"
      />
    </svg>
  );
}

export function VendorList({
  vendors,
  ticks,
  onToggle,
}: {
  vendors: Plan["vendors"];
  ticks: TickMap;
  onToggle: (key: string) => void;
}) {
  return (
    <div>
      {vendors.map((vendor, vendorIndex) => {
        const done = vendor.checklist.filter(
          (item) => ticks[tickKey(vendor.type, item)],
        ).length;
        return (
          <article
            key={`${vendor.type}-${vendorIndex}`}
            className="grid gap-3 border-t border-border py-4 print:break-inside-avoid"
          >
            <div className="flex items-center gap-3">
              <Ring done={done} total={vendor.checklist.length} />
              <div className="min-w-0">
                <h3 className="font-heading text-2xl font-semibold break-words">
                  {vendor.type}
                </h3>
                <p>
                  {done} of {vendor.checklist.length} done
                </p>
              </div>
            </div>
            <ul className="grid gap-1">
              {vendor.checklist.map((item, itemIndex) => {
                const key = tickKey(vendor.type, item);
                return (
                  <li key={`${key}-${itemIndex}`}>
                    <label className="flex min-h-11 items-center gap-3">
                      <span className="hidden print:inline" aria-hidden="true">
                        {ticks[key] ? "[x]" : "[ ]"}
                      </span>
                      <input
                        type="checkbox"
                        className="size-11 shrink-0 print:hidden"
                        checked={Boolean(ticks[key])}
                        onChange={() => onToggle(key)}
                      />
                      <span className="break-words">{item}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="grid gap-1">
              <h4 className="font-medium">Questions to ask</h4>
              <ul className="grid gap-1">
                {vendor.questionsToAsk.map((question, questionIndex) => (
                  <li
                    key={`${question}-${questionIndex}`}
                    className="break-words"
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        );
      })}
    </div>
  );
}
