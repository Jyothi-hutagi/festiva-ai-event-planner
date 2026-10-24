import { runModel } from "@/lib/gemini";
import { sanitizeUrl, urlKey } from "@/lib/sanitize-url";

export type GroundedSource = {
  title: string;
  uri: string;
};

export async function groundedSearch(
  contents: string,
): Promise<{ text: string; sources: GroundedSource[] }> {
  const response = await runModel({ contents, search: true });
  const chunks =
    response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: GroundedSource[] = [];
  for (const chunk of chunks) {
    const uri = chunk.web?.uri?.trim() ?? "";
    const key = urlKey(uri);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    const title = chunk.web?.title?.trim() ?? "";
    sources.push({
      title: title.length > 0 ? title : (sanitizeUrl(uri) ?? uri),
      uri,
    });
  }
  return { text: response.text ?? "", sources };
}
