---
name: "eh-task-protocol"
description: "Inject the mandatory per-task execution protocol before /speckit-implement executes tasks (Constitution: Task Breakdown & Execution Rules — Logical Atomicity)."
---

## Purpose

This hook runs **before** `/speckit-implement` starts executing tasks. It
injects the project's mandatory per-task execution protocol so that task
progress in `tasks.md` is updated **immediately after each task**, never in a
batch at the end of the session, and no task is started before the previous
one is checked off (Constitution: *Sequencing Gate*).

This file is project-local: it is NOT listed in
`.specify/integrations/*.manifest.json`, so `speckit update` will not
overwrite or remove it.

## Task Execution Protocol (MANDATORY)

For **each** task in `tasks.md`, in this exact order:

1. **Implement** — follow TDD where applicable (failing test first, then
   implementation; Constitution Principle III).
2. **Verify** — the project MUST build and pass the full gate
   (`npm test && npm run typecheck && npm run lint && npm run build`).
   The project MUST be left in a verifiable state
   (Constitution: *Self-contained & compilable*).
3. **Check off IMMEDIATELY** — edit `tasks.md` and change that task's
   `[ ]` to `[x]`. Do not defer this to the end of the session
   (Constitution: *Immediate checkoff*).
4. **Report** — one line: `T0XX done — <summary> (tests: n/n)`.

### Hard gates

- Do **NOT** start task N+1 until task N is marked `[x]` in `tasks.md`
  (Constitution: *Sequencing Gate*).
- **Batch checkoff** of multiple tasks in a single edit is **FORBIDDEN**
  (Constitution: *Immediate checkoff*).
- Parallel tasks `[P]` may be implemented together, and each still gets its
  own checkoff as soon as it is verified (Constitution: *Parallel execution*).

### After an interruption or context compaction

1. Re-read `tasks.md` **first**.
2. Check off any completed-but-unmarked tasks (verify each before marking).
3. Only then continue with the next unmarked task.

## Verification

After this hook runs, the agent MUST acknowledge the protocol in its first
implementation message (one line is enough) and then execute tasks strictly
per the protocol above.
