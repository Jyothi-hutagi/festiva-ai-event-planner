import type { Plan } from "@/lib/schema";

function Heading({ children }: { children: string }) {
  return <h3 className="font-heading text-2xl font-semibold">{children}</h3>;
}

export function IdeasPanel({
  ideas,
  onOpenDecor,
}: {
  ideas: Plan["ideas"];
  onOpenDecor: () => void;
}) {
  const [firstTheme, ...otherThemes] = ideas.themes;
  const empty =
    ideas.themes.length === 0 &&
    ideas.menu.length === 0 &&
    ideas.activities.length === 0 &&
    ideas.decor.length === 0;

  if (empty) {
    return <p>No ideas yet. Create the plan again to fill this in.</p>;
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-3">
        <Heading>Themes</Heading>
        {firstTheme ? (
          <p className="border-b-2 border-accent pb-2 font-heading text-2xl font-semibold break-words">
            {firstTheme}
          </p>
        ) : null}
        {otherThemes.length > 0 ? (
          <ul className="grid gap-2">
            {otherThemes.map((theme, index) => (
              <li key={`${theme}-${index}`} className="break-words">
                {theme}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
      <section className="grid gap-3">
        <Heading>Menu</Heading>
        <ul className="grid gap-2">
          {ideas.menu.map((item, index) => (
            <li key={`${item}-${index}`} className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-2 size-2.5 shrink-0 bg-[var(--chart-2)]"
              />
              <span className="break-words">{item}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="grid gap-3">
        <Heading>Activities</Heading>
        <ol className="relative grid gap-3">
          <span
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-[7px] w-0.5 bg-border"
          />
          {ideas.activities.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="grid grid-cols-[16px_minmax(0,1fr)] items-start gap-3"
            >
              <span
                aria-hidden="true"
                className="relative z-10 mt-1.5 size-2 justify-self-center rounded-full border-2 border-foreground bg-card"
              />
              <span className="break-words">
                {index + 1}. {item}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section className="grid gap-3">
        <Heading>Decor</Heading>
        <ul className="grid gap-2">
          {ideas.decor.map((item, index) => (
            <li key={`${item}-${index}`} className="break-words">
              {item}
            </li>
          ))}
        </ul>
        <a
          href="#plan-panel-decor"
          className="inline-flex min-h-11 items-center text-base font-semibold underline underline-offset-4"
          onClick={(event) => {
            event.preventDefault();
            onOpenDecor();
          }}
        >
          Open decor preview
        </a>
      </section>
    </div>
  );
}
