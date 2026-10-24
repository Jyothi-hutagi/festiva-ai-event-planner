"use client";

import {
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./arrival.css";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

const petals = Array.from({ length: 12 }, (_, index) => ({
  left: `${4 + index * 8}%`,
  color: index % 2 === 0 ? "#FFB627" : "#D6336C",
  delay: `${index * 70}ms`,
  turn: index % 2 === 0 ? "-20deg" : "18deg",
}));

/** Unfolds the invitation and drops petals once for a newly generated plan. */
export function InvitationArrival({
  play,
  children,
}: {
  play: boolean;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const animate = play && !reduced;

  return (
    <div className="relative">
      <div className={animate ? "invite-unfold" : undefined}>{children}</div>
      {animate ? (
        <div className="petal-field print:hidden" aria-hidden="true">
          {petals.map((petal) => (
            <span
              key={petal.left}
              className="petal print:hidden"
              style={
                {
                  left: petal.left,
                  background: petal.color,
                  animationDelay: petal.delay,
                  "--petal-turn": petal.turn,
                } as CSSProperties
              }
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
