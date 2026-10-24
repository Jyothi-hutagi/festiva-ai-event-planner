import type { Plan } from "@/lib/schema";

export function Timeline({ timeline }: { timeline: Plan["timeline"] }) {
  return (
    <ol className="grid list-decimal gap-4 pl-5">
      {timeline.map((phase, phaseIndex) => (
        <li
          key={`${phase.phase}-${phaseIndex}`}
          className="print-card grid gap-1 print:break-inside-avoid"
        >
          <p className="font-medium">{phase.phase}</p>
          <ol className="list-decimal pl-5 text-sm">
            {phase.tasks.map((task, taskIndex) => (
              <li key={`${task}-${taskIndex}`}>{task}</li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}
