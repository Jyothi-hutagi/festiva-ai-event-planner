const flagColors = ["#D6336C", "#FFB627", "#0B7A75", "#2A1B3D"] as const;

export function Toran() {
  return (
    <svg aria-hidden="true" className="block h-12 w-full text-foreground">
      <line
        x1="0"
        y1="3"
        x2="100%"
        y2="3"
        stroke="currentColor"
        strokeWidth="1"
      />
      {Array.from({ length: 9 }, (_, index) => (
        <svg
          key={index}
          x={`calc(${((index + 0.5) / 9) * 100}% - 9px)`}
          y="6"
          width="18"
          height="28"
          overflow="visible"
        >
          <polygon
            points="0,0 18,0 9,22"
            fill={flagColors[index % flagColors.length]}
            className="toran-flag"
            style={{ animationDelay: `${index * 0.06}s` }}
          />
        </svg>
      ))}
    </svg>
  );
}
