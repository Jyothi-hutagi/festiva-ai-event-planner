import { daysUntil } from "@/lib/countdown";

export function Countdown({ date }: { date: string }) {
  const days = daysUntil(date);
  const label =
    days === 0
      ? "Today is the day!"
      : days === 1
        ? "1 day to go"
        : `${days} days to go`;

  return <p className="text-lg font-medium">{label}</p>;
}
