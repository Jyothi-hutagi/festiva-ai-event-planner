type Phase = { daysBefore?: number | null };

function localDay(year: number, month: number, day: number) {
  return new Date(year, month - 1, day);
}

function parseDay(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  return localDay(Number(match[1]), Number(match[2]), Number(match[3]));
}

/** Index of the soonest phase that starts today or later, or null. */
export function nextPhaseIndex(
  timeline: Phase[],
  eventDate: string,
  now = new Date(),
) {
  const event = parseDay(eventDate);
  if (!event) return null;
  const today = localDay(now.getFullYear(), now.getMonth() + 1, now.getDate());
  if (event.getTime() < today.getTime()) return null;

  let bestIndex: number | null = null;
  let bestStart = Number.POSITIVE_INFINITY;
  for (let index = 0; index < timeline.length; index += 1) {
    const phase = timeline[index];
    if (!phase || phase.daysBefore == null) continue;
    const start = new Date(event);
    start.setDate(start.getDate() - phase.daysBefore);
    if (start.getTime() < today.getTime()) continue;
    if (start.getTime() < bestStart) {
      bestStart = start.getTime();
      bestIndex = index;
    }
  }
  return bestIndex;
}
