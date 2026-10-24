import type { Plan } from "@/lib/schema";
import { tickKey, type TickMap } from "@/lib/ticks";

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
    <div className="grid gap-3">
      {vendors.map((vendor, vendorIndex) => (
        <article
          key={`${vendor.type}-${vendorIndex}`}
          className="print-card grid gap-3 rounded-lg border border-border p-3 print:break-inside-avoid"
        >
          <h4 className="font-medium">{vendor.type}</h4>
          <ul className="grid gap-2">
            {vendor.checklist.map((item, itemIndex) => {
              const key = tickKey(vendor.type, item);
              return (
                <li key={`${key}-${itemIndex}`}>
                  <label className="flex items-start gap-2 text-sm">
                    <span
                      className="mt-1 hidden print:inline"
                      aria-hidden="true"
                    >
                      {ticks[key] ? "[x]" : "[ ]"}
                    </span>
                    <input
                      type="checkbox"
                      className="mt-1 print:hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      checked={Boolean(ticks[key])}
                      onChange={() => onToggle(key)}
                    />
                    <span>{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="grid gap-1">
            <h5 className="text-sm font-medium">Questions to ask</h5>
            <ul className="list-disc pl-5 text-sm">
              {vendor.questionsToAsk.map((question, questionIndex) => (
                <li key={`${question}-${questionIndex}`}>{question}</li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
