# GitHub Label Naming Convention

Labels must be created in the GitHub repository before using the app.
Go to **Settings → Labels** in the GitHub repo to add them.

---

## Status Labels

These labels drive the Kanban column a Task appears in.
`Done` maps to a **closed** GitHub Issue — no label needed.

| Label | Description | Suggested Colour |
|---|---|---|
| `status:backlog` | Task is captured but not yet scheduled | `#0075ca` (blue) |
| `status:todo` | Task is scheduled for the current cycle | `#5b9bd5` (steel blue) |
| `status:in-progress` | Task is actively being worked on | `#1f78d1` (vivid blue) |

> **Note:** A closed Issue is treated as `Done` regardless of labels.

---

## Priority Labels

These labels drive the priority badge colour and Eisenhower auto-classification.

| Label | Description | Suggested Colour |
|---|---|---|
| `priority:low` | Low priority — nice to have | `#0e8a16` (green) |
| `priority:medium` | Medium priority — should be done soon | `#e4a109` (amber/yellow) |
| `priority:high` | High priority — must be done | `#d93f0b` (red) |

Colours follow the Ampel (traffic-light) convention: **green → yellow → red**.

---

## Quick Setup Script

You can use the [GitHub CLI](https://cli.github.com/) to create all labels at once:

```bash
gh label create "status:backlog"      --color "0075ca" --description "Not yet scheduled"
gh label create "status:todo"         --color "5b9bd5" --description "Scheduled for this cycle"
gh label create "status:in-progress"  --color "1f78d1" --description "Actively being worked on"
gh label create "priority:low"        --color "0e8a16" --description "Nice to have"
gh label create "priority:medium"     --color "e4a109" --description "Should be done soon"
gh label create "priority:high"       --color "d93f0b" --description "Must be done"
```
