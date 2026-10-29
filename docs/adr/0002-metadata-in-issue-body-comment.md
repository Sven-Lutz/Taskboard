# App-Specific Metadata Stored in Issue Body HTML Comment

GitHub Issues do not natively support fields like Eisenhower urgency/importance overrides or a structured due date separate from Milestones. Rather than creating a parallel data store, the app appends a hidden HTML comment (`<!-- meta: {...} -->`) to the end of each Issue body. GitHub renders this as invisible in the UI; the app strips and re-writes it on every update. This keeps all Task data inside the Issue itself with no external state, at the cost of a parsing step on every read. A future reader might wonder why the Issue body is being manipulated programmatically — this ADR explains the deliberate choice.

## Consequences

- `taskParser.ts` must always round-trip the meta comment correctly; a bug there corrupts task metadata silently.
- The meta comment must be the last element in the Issue body to make parsing reliable.
- Team members editing Issues directly in GitHub should not remove the comment block manually.
