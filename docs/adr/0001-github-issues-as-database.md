# GitHub Issues as the Database

The team chose GitHub Issues as the sole persistence layer for Tasks instead of a dedicated database (Supabase, Firebase, or a custom backend). The team already uses GitHub for version control and collaboration; GitHub Issues provide assignees, labels, state (open/closed), and a REST API out of the box. This eliminates a separate backend service, a second login, and any hosting cost, while keeping all project data in one place. The trade-off is a less flexible query model and GitHub API rate limits (5000 req/h authenticated), which are acceptable for a 3-person seminar team.

## Considered Options

- **Supabase**: real-time sync, flexible schema — rejected because it requires a second login and external infrastructure for a team that already lives in GitHub.
- **Firebase**: similar to Supabase — same rejection reason.
- **JSON file in repo**: simpler than Issues API, but concurrent edits cause Git merge conflicts and there is no built-in concept of assignees or labels.
