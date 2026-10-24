"use client";

import { Button } from "@/components/ui/button";

export function PrintButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => window.print()}
    >
      Print plan
    </Button>
  );
}
