export type RefineMessage = {
  role: "user" | "status" | "error";
  text: string;
};

export function queueRefine(
  messages: RefineMessage[],
  instruction: string,
  retry: boolean,
) {
  const kept = messages.filter((message) => message.role !== "error");
  if (retry) return kept;
  return [...kept, { role: "user" as const, text: instruction }];
}
