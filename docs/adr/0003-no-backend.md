# No Dedicated Backend Server

The app has no custom backend (no Node.js/Express, no FastAPI, no serverless API beyond the single OAuth token-exchange function). All data operations go directly from the browser to the GitHub REST API via Octokit. The only server-side component is a single Vercel serverless function (`api/auth/callback.ts`) whose sole job is to keep the GitHub OAuth `client_secret` off the client. This was a deliberate choice to minimise infrastructure overhead for a 3-person seminar project. A future maintainer should not add backend routes without a concrete reason — the GitHub API is the backend.

## Considered Options

- **Node.js/Express backend**: full flexibility — rejected because it adds a deployment target, a separate dev server, and CORS configuration with no benefit for the current feature set.
- **Supabase Edge Functions**: serverless but still requires an external account and adds complexity — rejected for the same reason.
