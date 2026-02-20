export interface PkcePair {
  challenge: string;
  verifier: string;
}
export interface OAuthAuthDetails {
  type: "oauth";
  refresh: string;
  access?: string;
  expires?: number;
}

export interface GeminiAuthorization {
  url: string;
  verifier: string;
  state: string;
}

export interface GeminiTokenExchangeSuccess {
  type: "success";
  refresh: string;
  access: string;
  expires: number;
  email?: string;
}

export interface GeminiTokenExchangeFailure {
  type: "failed";
  error: string;
}

export type GeminiTokenExchangeResult =
  | GeminiTokenExchangeSuccess
  | GeminiTokenExchangeFailure;

export interface AuthContext {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// Gemini API Types for Grounding
export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingSupport {
  segment: {
    startIndex?: number;
    endIndex?: number;
    text?: string;
  };
  groundingChunkIndices: number[];
  confidenceScores?: number[];
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  groundingSupports?: GroundingSupport[];
  webSearchQueries?: string[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
}

export interface Candidate {
  content?: {
    parts?: Array<{ text?: string }>;
    role?: string;
  };
  finishReason?: string;
  groundingMetadata?: GroundingMetadata;
  index?: number;
}

export interface GeminiResponse {
  candidates?: Candidate[];
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}
