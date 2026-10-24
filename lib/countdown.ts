export function daysUntil(dateString: string, now = new Date()) {
  const [yearText, monthText, dayText] = dateString.split("-");
  const event = new Date(
    Number(yearText),
    Number(monthText) - 1,
    Number(dayText),
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((event.getTime() - today.getTime()) / 86_400_000);
  return days > 0 ? days : 0;
}
