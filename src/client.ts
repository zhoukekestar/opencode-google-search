import type { GeminiResponse } from "./types.js";
import proxyFetch from './fetch.js'


// const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const GEMINI_CODE_ASSIST_ENDPOINT = "https://cloudcode-pa.googleapis.com";
const rawAction = 'generateContent';
const GEMINI_API_URL = `${GEMINI_CODE_ASSIST_ENDPOINT}/v1internal:${rawAction}`

export async function searchWithGemini(query: string, accessToken: string, projectId?: string, model?: string): Promise<GeminiResponse> {
  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: query,
          },
        ],
      },
    ],
    tools: [
      {
        google_search: {

        },
      },
    ],
  };

  const CODE_ASSIST_HEADERS = {
    "User-Agent": "google-api-nodejs-client/9.15.1",
    "X-Goog-Api-Client": "gl-node/22.17.0",
    "Client-Metadata": "ideType=IDE_UNSPECIFIED,platform=PLATFORM_UNSPECIFIED,pluginType=GEMINI",
  } as const;

  const effectiveProjectId = projectId || process.env.OPENCODE_GEMINI_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "";
  const effectiveModel = model || "gemini-2.5-flash";

  const wrappedPayload = {
    project: effectiveProjectId,
    model: effectiveModel,
    request: payload,
  };

  const response = await proxyFetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": CODE_ASSIST_HEADERS["User-Agent"],
      "X-Goog-Api-Client": CODE_ASSIST_HEADERS["X-Goog-Api-Client"],
      "Client-Metadata": CODE_ASSIST_HEADERS["Client-Metadata"],
      // 'x-goog-api-key': `xxx 注意没有 bearer`,
    },
    body: JSON.stringify(wrappedPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return (await response.json()).response as GeminiResponse;
}
