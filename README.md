# Opencode Google Search Plugin

This plugin adds Google Search capabilities to Opencode using Gemini's Grounding feature.

## Features

- **Google Search**: Perform searches using Gemini 1.5 Pro with grounding.
- **Authentication**: Uses Gemini CLI OAuth scheme (PKCE) for secure authentication.
- **Result Formatting**: Provides summarized answers with citations and source links.

## Installation

Since this is a local plugin for now, you need to link it in your Opencode configuration.

1.  Clone this repository or navigate to the directory.
2.  Install dependencies and build:
    ```bash
    npm install
    npm run build
    ```
3.  Add to your `~/.config/opencode/config.json`:
    ```json
    {
      "plugins": [
        "file:///absolute/path/to/opencode-google-search"
      ]
    }
    ```

## Usage

### Authentication
Before searching, you must authenticate with your Google account. Ensure your Google Cloud project has the **Generative Language API** enabled if you are using your own project, though the default client ID should work for personal accounts.

Run the `google_login` tool:
```
/google_login
```
This will generate an authentication URL. Open it in your browser, approve the access, and copy the `code` parameter from the redirected URL (even if the page fails to load).

Then run the tool again with the code:
```
/google_login code="YOUR_AUTH_CODE"
```

### Search
Once authenticated, you can use the `google_search` tool:
```
/google_search query="latest news on AI"
```

Or just ask Opencode naturally:
"Search Google for the latest news on AI."
