import {
  invitationBudget,
  invitationCity,
  invitationCountdown,
  invitationDate,
  invitationGuests,
  invitationLanguage,
  invitationName,
  type InvitationLine,
  type InvitationValues,
} from "@/lib/invitation-copy";

function FadeValue({
  text,
  muted,
  className,
}: {
  text: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`invite-fade ${muted ? "text-muted-foreground" : ""} ${className ?? ""}`}
    >
      {text}
    </span>
  );
}

function Detail({ line, empty }: { line: InvitationLine; empty: boolean }) {
  if (line.placeholder && !empty) {
    return null;
  }
  return (
    <FadeValue key={line.text} text={line.text} muted={line.placeholder} />
  );
}

export function Invitation({
  empty,
  ...values
}: InvitationValues & { empty: boolean }) {
  const name = invitationName(values);
  const date = invitationDate(values.date);
  const city = invitationCity(values.city);
  const guests = invitationGuests(values.guests);
  const countdown = invitationCountdown(values.date);
  const budget = invitationBudget(values.budget);
  const language =
    empty && values.language !== "hi"
      ? null
      : invitationLanguage(values.language);

  return (
    <article className="paper-sheet grid gap-3 p-4 md:p-6">
      <h2 className="max-w-[18ch] text-[28px] leading-[1.15] font-bold md:text-[40px]">
        <FadeValue key={name.text} text={name.text} muted={name.placeholder} />
      </h2>
      <div aria-hidden="true" className="-mx-2 h-0.5 bg-accent md:-mx-4" />
      <p className="flex flex-wrap gap-x-3 gap-y-1 text-[17px]">
        <Detail line={date} empty={empty} />
        <Detail line={city} empty={empty} />
        {guests ? <FadeValue key={guests} text={guests} /> : null}
        {language ? <FadeValue key={language} text={language} /> : null}
      </p>
      {countdown ? (
        <p className="text-[32px] leading-[1.1] font-bold">
          <FadeValue key={countdown} text={countdown} />
        </p>
      ) : null}
      {budget ? (
        <p className="text-[32px] leading-[1.1] font-bold">
          <FadeValue key={budget} text={budget} />
        </p>
      ) : null}
    </article>
  );
}
