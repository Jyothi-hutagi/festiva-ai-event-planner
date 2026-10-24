export const LOADING_INTERVAL_MS = 4000;

export const planLoadingMessages = [
  "Planning your budget...",
  "Building your timeline...",
  "Choosing vendors...",
] as const;

export const shopLoadingMessage = "Finding stores near you...";

export const decorLoadingMessage = "Painting your decor preview...";

export function venueLoadingMessage(city: string) {
  return `Looking for venues in ${city}...`;
}

/** Announce the first message immediately, then advance every 4 seconds. */
export function startLoadingCycle(
  messages: readonly string[],
  onMessage: (message: string) => void,
) {
  const first = messages[0];
  if (!first) {
    return () => {};
  }
  let step = 0;
  onMessage(first);
  if (messages.length < 2) {
    return () => {};
  }
  const timer = setInterval(() => {
    step = (step + 1) % messages.length;
    onMessage(messages[step] ?? first);
  }, LOADING_INTERVAL_MS);
  return () => clearInterval(timer);
}
