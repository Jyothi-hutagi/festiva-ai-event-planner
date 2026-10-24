import "./toran.module.css";

const COLORS = ["#D6336C", "#FFB627", "#0B7A75", "#2A1B3D"];
const FLAG_COUNT = 12;
const WIDTH = 1200;

const flags = Array.from({ length: FLAG_COUNT }, (_, i) => {
  const x = (i + 0.5) * (WIDTH / FLAG_COUNT);
  const t = x / WIDTH;
  // y of the sagging string (quadratic curve from (0,12) via (600,34) to (1200,12))
  const y = 12 + 44 * t * (1 - t);
  return { x, y, color: COLORS[i % COLORS.length], delay: i * 60 };
});

/** Decorative door bunting. Purely visual, hidden from assistive tech. */
export function Toran() {
  return (
    <svg
      className="toran"
      viewBox="0 0 1200 96"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0 12 Q600 34 1200 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      {flags.map((f) => (
        <polygon
          key={f.x}
          className="toran-flag"
          style={{ animationDelay: `${f.delay}ms` }}
          fill={f.color}
          points={`${f.x - 30},${f.y} ${f.x + 30},${f.y} ${f.x},${f.y + 58}`}
        />
      ))}
    </svg>
  );
}
