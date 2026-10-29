# Taskboard

A collaborative web-app that visualises GitHub Issues as structured tasks for a 3-person university seminar team.

## Language

**Task**:
A unit of work corresponding 1:1 to a GitHub Issue in the team's repository.
_Avoid_: Ticket, card, item, todo

**Status**:
The current stage of a Task in the workflow. One of: Backlog, Todo, InProgress, Done. Stored as a GitHub label (`status:*`).
_Avoid_: State, stage, column, phase

**Priority**:
The urgency-independent importance level of a Task. One of: low, medium, high. Stored as a GitHub label (`priority:*`).
_Avoid_: Severity, weight, rank

**Assignee**:
The single team member responsible for completing a Task. Maps directly to a GitHub Issue assignee.
_Avoid_: Owner, responsible, user

**Meta Comment**:
A hidden HTML comment (`<!-- meta: {...} -->`) appended to a GitHub Issue body that stores app-specific fields not natively supported by GitHub Issues (e.g. Eisenhower overrides, due date).
_Avoid_: Metadata, hidden data, JSON block

## Eisenhower Matrix

**Urgency**:
A binary classification (high/low) of how time-sensitive a Task is. Auto-computed from due date (within 3 days = high); overridable manually via the Meta Comment.
_Avoid_: Deadline pressure, time-critical flag

**Importance**:
A binary classification (high/low) of how strategically significant a Task is. Auto-computed from Priority (high/medium → high, low → low); overridable manually via the Meta Comment.
_Avoid_: Value, weight, impact

**Quadrant**:
One of the four cells of the Eisenhower Matrix, defined by the combination of Urgency and Importance: Do First (high/high), Schedule (low/high), Delegate (high/low), Eliminate (low/low).
_Avoid_: Cell, box, sector

**Auto-classify**:
The process of computing Urgency and Importance from a Task's Priority and due date, without consulting the Meta Comment override.
_Avoid_: Auto-position, calculate, derive

**Manual Override**:
Explicit Urgency and/or Importance values stored in the Meta Comment that supersede Auto-classify results.
_Avoid_: Custom position, forced placement
