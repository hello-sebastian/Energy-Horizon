---
description: Fix a bug with spec awareness — maps bug to spec, proposes a fix plan for approval, then applies minimal fix.
scripts:
  sh: ../../scripts/bash/check-prerequisites.sh --json --include-tasks
  ps: ../../scripts/powershell/check-prerequisites.ps1 -Json -IncludeTasks
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Fix a bug described by the user in natural language. Load the feature specification artifacts FIRST to understand intent, map the bug to the relevant user story / acceptance criteria / requirement, locate the affected source files, and apply a minimal code fix — all in one step. Output an inline summary of what changed and why.

## Operating Constraints

**STATELESS**: Each invocation of this command is fully independent. Do NOT persist any state between invocations. Do NOT create report files, task files, config files, or any file artifacts. All output is inline only.

**PLAN-THEN-ACT**: Always present a proposed fix plan and wait for user approval before modifying any code. No other ceremony — no setup questions, no multi-step wizards.

**SPEC-AWARE**: Always understand WHAT the code should do (from spec.md) before touching it. The spec is the source of truth for intended behavior.

**MINIMAL FIX**: Apply the smallest change that resolves the described bug. Respect spec intent, constitution principles, and existing code patterns.

**DO NOT MODIFY SPEC ARTIFACTS**: Never modify spec.md, plan.md, tasks.md, or constitution.md.

## Execution Steps

### 1. Initialize Context

Run `{SCRIPT}` from repo root.
For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\''m Groot' (or double-quote if possible: "I'm Groot").

1. **Script succeeds** (on a feature branch): Parse JSON for `FEATURE_DIR` and `AVAILABLE_DOCS`. Proceed to next step.
2. **Script fails** (not on a feature branch): Scan `specs/NNN-*/` to find available features. Prompt the user to select one. **Do NOT guess or auto-select.** If no features exist, abort.

**Validate input**: If `$ARGUMENTS` is empty, output:

> ❌ **No Bug Description Provided**: Please provide a bug description.
> Usage: `/speckit.fixit.run <description of the bug>`

Then stop.

**Validate required artifacts**: Derive paths from `FEATURE_DIR`:

- `SPEC` = `FEATURE_DIR/spec.md` — **REQUIRED**
- `TASKS` = `FEATURE_DIR/tasks.md` — **REQUIRED**
- `PLAN` = `FEATURE_DIR/plan.md` — **OPTIONAL** (load if present)
- `CONSTITUTION` = `.specify/memory/constitution.md` — **OPTIONAL** (load if present)

If `spec.md` is missing, output:

> ❌ **Missing Required Artifact**: spec.md not found in `FEATURE_DIR`.
> Run `/speckit.specify` first.

If `tasks.md` is missing, output:

> ❌ **Missing Required Artifact**: tasks.md not found in `FEATURE_DIR`.
> Run `/speckit.tasks` first.

Then stop.

### 2. Load Spec Context (Progressive Disclosure)

Load context incrementally — do NOT dump all artifact content at once.

**Always load (lightweight — headers and structure only):**

- **From spec.md**: Section headers, user story titles with priorities, acceptance scenario summaries, functional requirement IDs and MUST statements, edge case list
- **From tasks.md**: All tasks with completion status (`[x]`/`[X]` vs `[ ]`), task IDs, and file paths referenced in task descriptions
- **From constitution.md** (if present): Principle names and MUST/SHOULD normative statements

**Validate completed tasks**: If tasks.md contains zero completed tasks (all `[ ]`), output:

> ❌ **No Completed Tasks**: tasks.md exists but contains no completed tasks — there is no implementation to debug.
> Run `/speckit.implement` first.

Then stop.

**Load on demand (only when mapped to the bug):**

- Full content of matched user story sections from spec.md
- Full content of matched functional requirements from spec.md
- Architecture and file structure from plan.md (if present and relevant)
- Full source code of affected files (loaded in Step 4)

### 3. Map Bug to Spec

Analyze the user's bug description against the loaded spec context:

1. **Scan user stories**: Compare the bug description against each user story's title, description, and acceptance scenarios. Identify the best-matching story.
2. **Scan functional requirements**: Compare against FR-NNN MUST statements. Identify requirements the bug may violate.
3. **Scan acceptance criteria**: Identify specific Given/When/Then scenarios that describe the expected behavior the bug contradicts.
4. **Scan edge cases**: Check if the bug matches any documented edge case.

**Produce a spec mapping:**

- **Matched story**: The user story that best relates to the bug (or "none")
- **Matched requirements**: Functional requirements the bug touches (or "none")
- **Matched acceptance criteria**: Specific scenarios the bug violates (or "none")
- **Confidence**: high / low / none

If no mapping is found (confidence = none), note this and proceed — the agent should still attempt to fix the bug, but will note in the summary that no specific spec mapping was found.

### 4. Locate Affected Files

Use a tiered search strategy:

**Tier 1 — Task-referenced files** (preferred):

- Extract file paths from completed tasks in tasks.md
- Filter to files that relate to the matched user story, requirements, or acceptance criteria from Step 3
- Read the source code of these files to identify the bug

**Tier 2 — Broader project search** (fallback):

- If no relevant code is found in Tier 1, expand the search to the broader project file tree
- Use the bug description, matched spec elements, and plan.md file structure (if available) to guide the search
- Note in the summary that the fix was found outside the documented task scope

### 5. Proposed Fix (Plan Before Acting)

Before modifying any code, present a complete fix plan for user approval. Include any escalation warnings inline.

Output:

```markdown
## Proposed Fix

**Bug**: <echo of the user's bug description>
**Mapped to**: <User Story N — Title> / <FR-NNN: MUST statement> / <AC M: Given/When/Then summary>
**Confidence**: <high / low / none>

**Root Cause**: <brief diagnosis of what is wrong and where — file, function, line if known>

**Planned Changes**:
1. **<file path>** (<location>) — <what will change and why>
2. **<file path>** (<location>) — <what will change and why>

**Approach**: <why this is the minimal fix; any alternatives considered and rejected>
```

**If escalation issues are detected**, append them to the plan:

> ⚠️ **Scope Warning**: This fix would modify N files (threshold: 4): `<file list>`.

> ⚠️ **Spec Conflict**: This fix would contradict `<FR-NNN: description>` / `<User Story N, AC M>`.

> 🛑 **Constitution Violation**: This fix would violate principle "`<principle name>`": `<MUST statement>`.
> Cannot proceed. Either update the constitution separately or find an alternative fix approach.

**Constitution violations are hard blocks** — output the plan for transparency but do NOT ask to proceed. Stop here.

For all other cases, ask:

> Proceed with this fix? (y/n)

Wait for user response:
- **User confirms**: Proceed to Step 6. If scope or spec-conflict warnings were present, note them as caveats in the final summary.
- **User declines**: Stop. The user may provide a revised bug description or additional context.

### 6. Apply Fix

Apply the minimal code fix:

- Modify only the files necessary to resolve the bug
- Respect existing code patterns, naming conventions, and style
- Preserve spec intent — the fix should make the code match what the spec says it should do
- Respect constitution principles
- If plan.md is available, follow the documented architecture and tech stack choices

### 7. Output Inline Summary

After applying the fix, output:

## Bug Fix Summary

**Bug**: `<echo of the user's bug description>`
**Related Spec**: `<matched user story / FR / acceptance criterion — or "No spec mapping found">`
**Files Changed**: `<list of modified file paths>`
**Explanation**: `<brief description of what was changed and why>`

**If escalation was overridden**, append the relevant caveats:

> ⚠️ **Scope Override**: This fix touched N files (threshold: 4). Applied at user's request.

> ⚠️ **Spec Conflict**: This fix conflicts with `<FR-NNN / AC reference>`. Applied at user's request.

**If no spec mapping was found**, use:

**Related Spec**: No spec mapping found — fix applied outside documented scope

> ℹ️ **Outside Task Scope**: The affected files are not referenced in any task.

**If plan.md was missing**, note:

> ℹ️ **Reduced Context**: plan.md was not available. Fix applied without architecture context.

**If no code issue was found**, output:

> ℹ️ **No Code Issue Found**: Could not identify a code problem matching "`<bug description>`".
> Please provide more details about the expected vs actual behavior.
