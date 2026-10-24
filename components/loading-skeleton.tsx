function Bar({ className }: { className: string }) {
  return <span className={`block h-3 bg-foreground ${className}`} />;
}

export function LoadingSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-4">
      <div className="paper-sheet grid gap-3 p-4">
        <Bar className="w-2/3" />
        <Bar className="w-1/2" />
        <Bar className="w-1/3" />
      </div>
      <Bar className="w-full" />
      <Bar className="w-4/5" />
    </div>
  );
}
