import { daysUntil } from "@/lib/countdown";
import { formatINR } from "@/lib/budget";
import "./invitation.module.css";

const TYPE_LABELS: Record<string, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  community: "Community event",
  workshop: "Workshop",
  corporate: "Corporate event",
  other: "Event",
};

interface InvitationProps {
  name?: string;
  eventType?: string;
  city?: string;
  /** YYYY-MM-DD, read as a local calendar date */
  date?: string;
  guests?: number;
  budget?: number;
  language?: "en" | "hi";
  /** Show the "fills in as you type" caption (intro only) */
  showCaption?: boolean;
}

function parseLocalDate(value?: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function Value({ text, placeholder }: { text?: string; placeholder: string }) {
  return text ? (
    <span key={text} className="invite-fade">
      {text}
    </span>
  ) : (
    <span className="invite-placeholder">{placeholder}</span>
  );
}

export function Invitation(props: InvitationProps) {
  const { name, eventType, city, date, guests, budget, language, showCaption } =
    props;

  const typeLabel = eventType ? TYPE_LABELS[eventType] : undefined;
  const cleanName = name?.trim();
  const cleanCity = city?.trim();
  const title =
    cleanName ||
    (typeLabel && cleanCity ? `${typeLabel} in ${cleanCity}` : typeLabel) ||
    undefined;

  const parsed = parseLocalDate(date);
  const dateText = parsed
    ? parsed.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : undefined;

  let countdown: string | undefined;
  if (parsed && date) {
    const days = daysUntil(date);
    countdown =
      days === 0
        ? "Today is the day"
        : `${days} ${days === 1 ? "day" : "days"} to go`;
  }

  const guestText =
    guests && guests > 0
      ? `${guests} ${guests === 1 ? "guest" : "guests"}`
      : undefined;
  const budgetText = budget && budget > 0 ? formatINR(budget) : undefined;

  return (
    <section className="invite-sheet" aria-label="Invitation preview">
      <h2 className="invite-name">
        <Value text={title} placeholder="Your event name" />
      </h2>
      <hr className="invite-rule" />
      <p className="invite-line">
        <Value text={dateText} placeholder="Pick a date" />
      </p>
      <p className="invite-line">
        <Value text={cleanCity} placeholder="Your city" />
      </p>
      <p className="invite-line">
        <Value text={guestText} placeholder="Number of guests" />
      </p>
      <div className="invite-figures">
        <span className="invite-figure">
          <Value text={countdown} placeholder="Days to go" />
        </span>
        <span className="invite-figure">
          <Value text={budgetText} placeholder="Budget" />
        </span>
      </div>
      {language && (
        <p className="invite-caption">
          {language === "hi" ? "हिन्दी" : "English"}
        </p>
      )}
      {showCaption && (
        <p className="invite-caption">Your invitation fills in as you type.</p>
      )}
    </section>
  );
}
