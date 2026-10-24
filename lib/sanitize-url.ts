export function urlKey(value: string): string | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return null;
  }
  if (!url.hostname) {
    return null;
  }
  url.username = "";
  url.password = "";
  url.hash = "";
  return url.href;
}

export function sanitizeUrl(value: string): string | null {
  const href = urlKey(value);
  if (!href) {
    return null;
  }
  return new URL(href).hostname;
}

export function filterToSources<T extends { url: string }>(
  items: T[],
  sources: { uri: string }[],
): T[] {
  const allowed = new Set(
    sources.flatMap((source) => {
      const key = urlKey(source.uri);
      return key ? [key] : [];
    }),
  );
  return items.filter((item) => {
    const key = urlKey(item.url);
    return key !== null && allowed.has(key);
  });
}
