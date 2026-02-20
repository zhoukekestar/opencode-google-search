import type { GeminiResponse, GroundingMetadata } from "./types.js";

export function formatResponse(response: GeminiResponse, query: string): string {
  if (!response.candidates || response.candidates.length === 0) {
    return "No results found.";
  }

  const candidate = response.candidates[0];
  const content = candidate.content?.parts?.[0]?.text || "";
  const metadata = candidate.groundingMetadata;

  if (!metadata) {
    return content;
  }

  let formattedAnswer = content;
  const sourcesList: string[] = [];

  if (metadata.groundingChunks) {
    metadata.groundingChunks.forEach((chunk, index) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sourcesList.push(`${index + 1}. [${chunk.web.title}](${chunk.web.uri})`);
      }
    });
  }

  // Add inline citations if groundingSupports are present (optional, but nice)
  // For simplicity, we'll just append the sources list for now as the inline citations
  // are already handled by the model in some cases, or we rely on the user reading the sources.
  // Actually, Gemini API doesn't insert [1] markers automatically in the text property usually.
  // But parsing groundingSupports to insert [1] is complex.
  // Opencode-Google-AI-Search-Plugin does manual insertion.
  // For this MVP, I'll just append the sources.

  let output = `# ${query}\n\n`;
  output += formattedAnswer + "\n\n";

  if (sourcesList.length > 0) {
    output += "### Sources\n";
    output += sourcesList.join("\n");
  }

  if (metadata.searchEntryPoint?.renderedContent) {
    // This is usually HTML, might want to strip or render if possible
    // For CLI, maybe just ignore or mention it.
  }

  return output;
}
