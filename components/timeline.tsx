import { nextPhaseIndex } from "@/lib/next-phase";
import type { Plan } from "@/lib/schema";

export function Timeline({
  timeline,
  eventDate,
}: {
  timeline: Plan["timeline"];
  eventDate: string;
}) {
  const next = nextPhaseIndex(timeline, eventDate);

  return (
    <ol className="relative grid gap-6">
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[11px] w-0.5 bg-border"
      />
      {timeline.map((phase, phaseIndex) => {
        const upcoming = phaseIndex === next;
        return (
          <li
            key={`${phase.phase}-${phaseIndex}`}
            className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 print:break-inside-avoid"
          >
            <span
              aria-hidden="true"
              className={
                upcoming
                  ? "relative z-10 mt-1 size-3 justify-self-center rounded-full bg-accent"
                  : "relative z-10 mt-1 size-3 justify-self-center rounded-full border-2 border-foreground bg-card"
              }
            />
            <div className="grid min-w-0 gap-1">
              <p className="font-medium break-words">
                {phase.phase}
                {upcoming ? <span className="ml-2">Next</span> : null}
              </p>
              <ul className="grid gap-1">
                {phase.tasks.map((task, taskIndex) => (
                  <li key={`${task}-${taskIndex}`} className="break-words">
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
