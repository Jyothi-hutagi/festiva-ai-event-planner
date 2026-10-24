import { sanitizeUrl, urlKey } from "@/lib/sanitize-url";

export function ExternalLink({
  href,
  children,
  className,
  nowrap = false,
  showDomain = true,
}: {
  href: string;
  children: string;
  className?: string;
  nowrap?: boolean;
  showDomain?: boolean;
}) {
  const safe = urlKey(href);
  const domain = sanitizeUrl(href);
  if (!safe || !domain) {
    return null;
  }
  return (
    <span
      className={
        nowrap
          ? "inline-flex items-baseline gap-x-2 whitespace-nowrap"
          : "inline-flex flex-wrap items-baseline gap-x-2"
      }
    >
      <a
        href={safe}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
      {showDomain ? (
        <span className="text-sm break-words text-muted-foreground">
          {domain}
        </span>
      ) : null}
    </span>
  );
}
