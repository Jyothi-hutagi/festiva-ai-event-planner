"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");

  function toggle() {
    const next = getTheme() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("toran-theme", next);
    } catch {
      // Storage can be blocked. The attribute still switches this view.
    }
  }

  return (
    <Button type="button" variant="outline" onClick={toggle}>
      {theme === "dark" ? "Light room" : "Dark room"}
    </Button>
  );
}
