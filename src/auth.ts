import { generatePKCE } from "@openauthjs/openauth/pkce";
import { randomBytes } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import proxyFetch from './fetch.js'
import {
  GEMINI_CLIENT_ID,
  GEMINI_CLIENT_SECRET,
  GEMINI_REDIRECT_URI,
  GEMINI_SCOPES,
} from "./constants.js";

import type {
  GeminiAuthorization,
  GeminiTokenExchangeResult,
  PkcePair,
} from "./types.js";

const CONFIG_DIR = join(homedir(), ".local/share/opencode");
const AUTH_FILE = join(CONFIG_DIR, "auth.json");

export async function authorizeGemini(): Promise<GeminiAuthorization> {
  const pkce = (await generatePKCE()) as PkcePair;
  const state = randomBytes(32).toString("hex");

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", GEMINI_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", GEMINI_REDIRECT_URI);
  url.searchParams.set("scope", GEMINI_SCOPES.join(" "));
  url.searchParams.set("code_challenge", pkce.challenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");

  return {
    url: url.toString(),
    verifier: pkce.verifier,
    state,
  };
}

export async function exchangeCode(
  code: string,
  verifier: string
): Promise<GeminiTokenExchangeResult> {
  const response = await proxyFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: GEMINI_CLIENT_ID,
      client_secret: GEMINI_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: GEMINI_REDIRECT_URI,
      code_verifier: verifier,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { type: "failed", error: errorText };
  }

  const data = (await response.json()) as any;
  
  return {
    type: "success",
    access: data.access_token,
    refresh: data.refresh_token,
    expires: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const response = await proxyFetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: GEMINI_CLIENT_ID,
        client_secret: GEMINI_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
        console.error("Failed to refresh token", await response.text());
        return null;
    }

    const data = (await response.json()) as any;
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

export async function saveAuth(auth: any) {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(AUTH_FILE, JSON.stringify(auth, null, 2));
}

export async function loadAuth(): Promise<any> {
  try {
    const data = await readFile(AUTH_FILE, "utf-8");
    return JSON.parse(data).google;
  } catch {
    return null;
  }
}
