import { type Plugin } from "@opencode-ai/plugin";
import { tool } from "@opencode-ai/plugin/tool";
import { authorizeGemini, exchangeCode, loadAuth, saveAuth, refreshAccessToken } from "./auth.js";

import { searchWithGemini } from "./client.js";
import { formatResponse } from "./formatter.js";

// Helper to handle authentication flow state
async function getPendingAuth() {
  const auth = await loadAuth();
  if (auth && auth.pending) {
    return auth;
  }
  return null;
}

// let auth = null;
export const GoogleSearchPlugin: Plugin = async () => {
  const z = tool.schema;

  return {
    // auth: {
    //   loader: async (getAuth) => {
    //     auth = await getAuth();
    //   }
    // },
    tool: {

      // 使用 google_search 搜索今天新闻
      google_search: tool({
        description: "Search Google. Use this for general knowledge, news, and current events.",
        args: {
          query: z.string().describe("The search query"),
        },
        execute: async ({ query }) => {
          let auth = await loadAuth();
            
          if (!auth || !auth.access) {
            throw new Error("Authentication required. Please run the 'google_login' tool to authenticate.");
          }
    
          // Check if token is expired
          if (auth.expires && auth.expires < Date.now()) {
            console.log("Access token expired, refreshing...");
            const newAccessToken = await refreshAccessToken(auth.refresh);
            if (newAccessToken) {
              auth.access = newAccessToken;
              auth.expires = Date.now() + 3600 * 1000; // Assuming 1 hour validity
              await saveAuth(auth);
            } else {
              throw new Error("Authentication expired and refresh failed. Please run the 'google_login' tool to re-authenticate.");
            }
          }
    
          try {
            const response = await searchWithGemini(query, auth.access, "cloud-run-proxy-449105");
            const formatted = formatResponse(response, query);
            return formatted;
          } catch (error: any) {
            if (error.message.includes("401")) {
                 throw new Error("Authentication failed (401). Please run the 'google_login' tool to re-authenticate.");
            }
            throw error;
          }
        },
      }),
      // google_login: tool({
      //   description: "Authenticate with Google to enable search capabilities. Run without arguments to get the auth URL, then run again with the code.",
      //   args: {
      //     code: z.string().optional().describe("The authorization code from the browser. If not provided, an auth URL will be generated."),
      //   },
      //   execute: async ({ code }) => {
      //     // Step 1: Generate Auth URL
      //     if (!code) {
      //       const auth = await authorizeGemini();
      //       // Save the verifier and state
      //       await saveAuth({ ...auth, pending: true } as any);
            
      //       return `Please open this URL in your browser to authorize:\n\n${auth.url}\n\nAfter authorization, you will be redirected to localhost (which might fail if no server is running). Copy the 'code' parameter from the URL in your browser address bar and run this tool again: \`google_login(code="YOUR_CODE")\``;
      //     }
    
      //     // Step 2: Exchange Code
      //     const pendingAuth = await getPendingAuth();
      //     if (!pendingAuth) {
      //         return "No pending authentication found. Please run `google_login()` without arguments first to generate an auth URL.";
      //     }
          
      //     const result = await exchangeCode(code, pendingAuth.verifier);
          
      //     if (result.type === "success") {
      //         await saveAuth({
      //             access: result.access,
      //             refresh: result.refresh,
      //             expires: result.expires,
      //             pending: false // Clear pending flag
      //         });
      //         return "Successfully authenticated! You can now use the `google_search` tool.";
      //     } else {
      //         return `Authentication failed: ${result.error}`;
      //     }
      //   },
      // }),
    }
  };
};

export default GoogleSearchPlugin;
