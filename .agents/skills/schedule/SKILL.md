---
name: schedule
description: Schedule actionable local backlog items into Noodle work orders.
schedule: "When orders are empty, after backlog changes, or when session history suggests re-evaluation"
---

# Schedule

Read `.noodle/mise.json` and use `noodle schema orders` as the source of truth. Write valid JSON to `.noodle/orders-next.json`; never write `.noodle/orders.json`, which Noodle promotes itself.

## Scheduling

- Use the backlog and task types in mise as the source of work. Do not invent tasks or infer work from unrelated repository changes.
- Schedule only actionable, open backlog items that are not already represented by an active ticket or order. The default `todos.md` adapter reports unchecked items as `open` and checked items as `done`.
- Use the backlog item ID as the order ID. Include a concise title and a rationale that states why the item is ready.
- Use `execute` as the primary stage for implementation work. Set `runtime` to `process` and omit provider/model overrides so `.noodle.toml` routing defaults apply.
- Put enough task context in the stage prompt for an agent to act using the backlog title and any available adapter fields. Do not include a task's details in this reusable skill.
- Respect existing active work and recent failures; do not duplicate work or immediately retry repeatedly failing items.
- If there is no actionable backlog work, write `{"orders":[]}`.

Only use `action_needed` when a backlog item cannot be scheduled without a human decision. Do not modify the backlog while scheduling.
