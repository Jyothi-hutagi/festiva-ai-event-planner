import type { CSSProperties } from "react";

const heading: CSSProperties = {
  fontFamily: "var(--font-baloo), system-ui, sans-serif",
  fontWeight: 700,
  fontSize: "clamp(34px, 5.2vw, 56px)",
  lineHeight: 1.1,
  maxWidth: "14ch",
  margin: 0,
  color: "var(--ink, #2A1B3D)",
};

const sentence: CSSProperties = {
  fontSize: 17,
  lineHeight: 1.6,
  maxWidth: "60ch",
  margin: "16px 0 0",
  color: "var(--ink-soft, #5C4D73)",
};

export function Hero() {
  return (
    <header>
      <h1 style={heading}>Plan the celebration, not the spreadsheet.</h1>
      <p style={sentence}>
        Budget, timeline, vendors, decor ideas and where to buy, built for your
        date and city.
      </p>
    </header>
  );
}
