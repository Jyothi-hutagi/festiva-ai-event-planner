const stepTitles = ["What", "Who and where", "Vibe"] as const;

export function StepThread({ step }: { step: 0 | 1 | 2 }) {
  const fill = step === 0 ? "w-0" : step === 1 ? "w-[33.333%]" : "w-[66.666%]";

  return (
    <div aria-hidden="true" className="grid gap-2">
      <div className="relative">
        <span className="absolute top-[11px] right-[16.666%] left-[16.666%] h-0.5 bg-border" />
        <span
          className={`absolute top-[11px] left-[16.666%] h-0.5 bg-accent ${fill}`}
        />
        <div className="relative grid grid-cols-3">
          {stepTitles.map((title, index) => (
            <span key={title} className="flex justify-center">
              <span
                className={
                  index === step
                    ? "size-6 rounded-full bg-foreground"
                    : "size-6 rounded-full border-2 border-foreground bg-card"
                }
              />
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stepTitles.map((title) => (
          <span key={title} className="text-center text-base leading-[1.4]">
            {title}
          </span>
        ))}
      </div>
    </div>
  );
}
