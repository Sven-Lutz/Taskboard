# Taskboard

A collaborative task-management web-app that visualises GitHub Issues as structured tasks for a 3-person university seminar team.

[![Deploy with Vercel](https://img.shields.io/badge/Vercel-deployed-brightgreen?logo=vercel)](https://taskboard.vercel.app)

---

## What it is

Taskboard is a visual layer on top of GitHub Issues. Every task is a real GitHub Issue in your repository; the app reads and writes via the GitHub REST API using OAuth. There is no separate database — GitHub Issues are the single source of truth, with app-specific metadata (Eisenhower overrides, due dates) stored in a hidden HTML comment at the end of each Issue body.

---

## Views

- **Board** (`/board`) — Kanban board with four columns (Backlog, To Do, In Progress, Done); drag cards between columns to change status.
- **Matrix** (`/matrix`) — Eisenhower priority matrix; tasks auto-place by urgency and importance, with manual drag-override support.
- **Table** (`/table`) — Sortable, filterable table of all tasks; useful for sprint planning and overview.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Server state | React Query (TanStack Query v5) |
| UI state | Zustand |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| GitHub API | Octokit REST |
| Hosting | Vercel |

---

## Local Development

### Prerequisites

- Node 18+
- A GitHub account with access to the target repository

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Sven-Lutz/Taskboard.git
cd Taskboard

# 2. Copy the example env file and fill in your values
cp .env.example .env.local
# Open .env.local and set:
#   VITE_GITHUB_CLIENT_ID=<your OAuth App client ID>
#   VITE_GITHUB_OWNER=<GitHub org or username owning the repo>
#   VITE_GITHUB_REPO=<repository name>

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## GitHub OAuth App Setup

The app uses a GitHub OAuth App to authenticate team members. Follow these steps once:

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fill in the form:
   - **Application name**: `Taskboard` (or any name)
   - **Homepage URL**: `https://taskboard.vercel.app`
   - **Authorization callback URL**:
     - Development: `http://localhost:5173/auth/callback`
     - Production: `https://taskboard.vercel.app/auth/callback`
     > If you use a custom Vercel domain, replace `taskboard.vercel.app` with your actual domain.
3. Click **Register application** and note the **Client ID**.
4. Generate a **Client Secret** — copy it immediately (it is shown only once).
5. Add the **Client ID** to `.env.local` as `VITE_GITHUB_CLIENT_ID`.
6. Add the **Client Secret** to the **Vercel project's environment variables** as `GITHUB_CLIENT_SECRET`. **Never put the client secret in `.env.local` or commit it to the repo.**

The client secret is used only inside the Vercel serverless function `api/auth/callback.ts`, which exchanges the OAuth `code` for a token server-side.

---

## GitHub Labels Setup

The app uses GitHub labels to represent Task status and priority. Before using the app, create the required labels in the repository.

See [`docs/labels.md`](./docs/labels.md) for the full naming convention, suggested colours, and a GitHub CLI quick-setup script.

> **Labels must exist before using the app.** Tasks without the expected labels may not display correctly.

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `VITE_GITHUB_CLIENT_ID` | `.env.local` + Vercel | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | **Vercel only** (never in `.env.local`) | GitHub OAuth App client secret |
| `VITE_GITHUB_OWNER` | `.env.local` + Vercel | GitHub org/user owning the target repo |
| `VITE_GITHUB_REPO` | `.env.local` + Vercel | Repository name (e.g. `Taskboard`) |

`VITE_*` variables are inlined into the client bundle at build time and are public by design. `GITHUB_CLIENT_SECRET` is only accessed inside the Vercel serverless function and must never be exposed to the browser.

---

## Architecture

Taskboard has **no dedicated backend**. All data operations go directly from the browser to the GitHub REST API via Octokit. The only server-side component is `api/auth/callback.ts` — a single Vercel serverless function whose sole job is to keep the OAuth `client_secret` off the client.

```
GitHub Issues (source of truth)
        ↕ GitHub REST API (Octokit)
React App (Vite + React 18 + TypeScript)
  ├── Auth: GitHub OAuth App  →  api/auth/callback.ts (Vercel function)
  ├── State: React Query (server state) + Zustand (UI state)
  ├── Views: /board  /matrix  /table
  ├── UI: shadcn/ui + Tailwind CSS + Lucide Icons
  └── Deploy: Vercel (auto-deploy on push to main)
```

The architectural decisions behind this approach are documented in [`docs/adr/`](./docs/adr/):

- [0001 — GitHub Issues as the database](./docs/adr/0001-github-issues-as-database.md)
- [0002 — App-specific metadata in Issue body HTML comment](./docs/adr/0002-metadata-in-issue-body-comment.md)
- [0003 — No dedicated backend server](./docs/adr/0003-no-backend.md)

---

## Team

Team members: @Sven-Lutz + 2 others
