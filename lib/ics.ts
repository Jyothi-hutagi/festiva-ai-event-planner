import type { EventInput, Plan } from "@/lib/schema";

type Unit = "day" | "week" | "month";

function localDate(dateString: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}${month}${day}`;
}

function formatStamp(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function shiftBefore(event: Date, amount: number, unit: Unit) {
  const next = new Date(event.getFullYear(), event.getMonth(), event.getDate());
  if (unit === "day") {
    next.setDate(next.getDate() - amount);
  } else if (unit === "week") {
    next.setDate(next.getDate() - amount * 7);
  } else {
    next.setMonth(next.getMonth() - amount);
  }
  return next;
}

function phaseStart(event: Date, phase: Plan["timeline"][number]) {
  if (phase.daysBefore !== undefined) {
    return shiftBefore(event, phase.daysBefore, "day");
  }
  const offset = parsePhase(phase.phase);
  if (!offset) {
    return null;
  }
  return shiftBefore(event, offset.amount, offset.unit);
}

function parsePhase(phase: string) {
  const match = /(\d+)\s*(day|days|week|weeks|month|months)\s+before/i.exec(
    phase,
  );
  if (!match) {
    return null;
  }
  const word = match[2].toLowerCase();
  const unit: Unit = word.startsWith("day")
    ? "day"
    : word.startsWith("week")
      ? "week"
      : "month";
  return { amount: Number(match[1]), unit };
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string) {
  const encoder = new TextEncoder();
  const chars = Array.from(line);
  const parts: string[] = [];
  let current = "";
  let size = 0;
  let limit = 75;
  for (const char of chars) {
    const charSize = encoder.encode(char).length;
    if (current.length > 0 && size + charSize > limit) {
      parts.push(current);
      current = char;
      size = charSize;
      limit = 74;
    } else {
      current += char;
      size += charSize;
    }
  }
  if (current.length > 0) {
    parts.push(current);
  }
  return parts.join("\r\n ");
}

function eventBlock(options: {
  uid: string;
  stamp: string;
  start: Date;
  summary: string;
  description: string;
}) {
  const end = new Date(
    options.start.getFullYear(),
    options.start.getMonth(),
    options.start.getDate() + 1,
  );
  return [
    "BEGIN:VEVENT",
    `UID:${options.uid}`,
    `DTSTAMP:${options.stamp}`,
    `DTSTART;VALUE=DATE:${formatDate(options.start)}`,
    `DTEND;VALUE=DATE:${formatDate(end)}`,
    `SUMMARY:${escapeText(options.summary)}`,
    `DESCRIPTION:${escapeText(options.description)}`,
    "END:VEVENT",
  ]
    .map(foldLine)
    .join("\r\n");
}

export function buildIcs(input: EventInput, plan: Plan, now = new Date()) {
  const event = localDate(input.date);
  const stamp = formatStamp(now);
  const blocks: string[] = [];
  if (event) {
    plan.timeline.forEach((phase, index) => {
      const start = phaseStart(event, phase);
      if (!start) {
        return;
      }
      blocks.push(
        eventBlock({
          uid: `${formatDate(event)}-phase-${index}@toran`,
          stamp,
          start,
          summary: phase.phase,
          description: phase.tasks.join("\n"),
        }),
      );
    });
    const title =
      input.eventName.trim() || `${input.eventType} in ${input.city}`;
    blocks.push(
      eventBlock({
        uid: `${formatDate(event)}-event@toran`,
        stamp,
        start: event,
        summary: title,
        description: plan.summary,
      }),
    );
  }
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Toran//Event plan//EN",
    "CALSCALE:GREGORIAN",
    ...blocks,
    "END:VCALENDAR",
  ];
  return `${lines.join("\r\n")}\r\n`;
}
