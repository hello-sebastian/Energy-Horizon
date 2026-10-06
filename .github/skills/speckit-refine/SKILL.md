---
name: "speckit-refine"
description: "Universal SpecKit: diagnose and plan post-implementation fixes to code and documentation after a feature is built. Planning-only: produces a detailed Modification Plan and waits for user approval; never edits files."
compatibility: "Requires a spec-kit project structure (specs/ or .specify/ directory)"
metadata:
  author: "hello-sebastian"
  source: "custom"
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The input is a
description of a problem, discrepancy, or refinement to address after the feature was
implemented.

## Pre-Execution Checks

**Check for extension hooks (before refinement)**:

- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_refine` key
- If the YAML cannot be parsed or is invalid, do not skip silently: tell the user that `.specify/extensions.yml` could not be read (include the parser error) and that no hooks were checked, including any mandatory (`optional: false`) hooks registered there, then continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):

    ```text
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

  - **Mandatory hook** (`optional: false`):

    ```text
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Goal.
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before continuing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.

- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Role

You act as a **Senior Engineer** and **Technical Writer** on the current project. Your job
is to handle small post-implementation discrepancies, oversights, and refinements (for
example: swapping a UI control type, fixing a small bug, correcting documentation) that
surfaced after a SpecKit feature was implemented.

This skill is **project-agnostic**: it works with any project built with SpecKit. It does
**not** assume a specific language, framework, or directory layout — it detects the actual
project structure at runtime (see Step 1).

## Operating Constraints (Guardrails)

**1. PLANNING-ONLY — NEVER EDIT FILES**

This command is **strictly read-only**. You MUST NOT create, modify, or delete any file —
not source code, not tests, not `spec.md` / `plan.md` / `tasks.md`, not any user-facing
documentation. You may read files and run read-only inspection commands (e.g. `grep`,
`ls`, `git status`). Your **only** output is a detailed **Modification Plan**. You MUST
wait for the user to verify and approve the plan before any implementation begins.
Implementation is a separate, explicit step performed after approval — it is **not** part
of this command.

**2. ARCHITECTURAL SAFETY CHECK**

Analyze the reported problem. If the change requires **any** of the following, you MUST
**STOP** and NOT produce a Modification Plan:

- rebuilding or restructuring a **key module** of the project (a module the plan or
  constitution identifies as core, or one whose change would ripple across many other
  modules);
- changing **core domain / business logic** (the project's central computation, data
  pipeline, or algorithm);
- breaking **backward compatibility** of the project's public interface or configuration
  (renaming/removing a public API, config key, or CLI flag; changing a key's type or
  accepted values; changing default behavior);
- changing the **data model, public contracts, or external API**.

To decide what counts as "key" / "core", consult `plan.md` (architecture and named
touch-points) and the project constitution (`.specify/memory/constitution.md`, if present).
If the change is clearly a leaf-level refinement (a UI control, a label, a small bug, a
doc fix) that does not touch the items above, it is in scope.

In the out-of-scope case, inform the user that the problem **exceeds the scope of a minor
fix** and requires the **full SpecKit cycle** (a new specification). Recommend the
appropriate commands: `/speckit-specify` (new feature) or, if it belongs to an existing
feature, `/speckit-clarify` + `/speckit-plan` + `/speckit-tasks` + `/speckit-implement`.
Do not proceed to a plan.

**3. DOCUMENTATION AS THE SINGLE SOURCE OF TRUTH**

When the plan calls for updating SpecKit documentation, the updates MUST be written in the
**present tense**, as if the solution had been part of the specification from the start.
You MUST NOT create "change history" / "patch notes" / "changelog" sections inside
`spec.md` (or `plan.md` / `tasks.md`). The artifacts describe the intended state, not the
history of how it got there.

## Project Structure (Detected at Runtime)

Do **not** assume a fixed layout. Discover the actual paths in Step 1 and use them
consistently throughout the plan. Typical SpecKit projects have:

- **Source code**: the project's source directory (e.g. `src/`, `lib/`, `app/`, `pkg/`).
- **Tests**: the project's test directory or test-file convention (e.g. `tests/`,
  `test/`, `__tests__/`, `*.test.*`, `*.spec.*`).
- **SpecKit feature documentation**: the feature's folder under `specs/` (or
  `.specify/specs/`), containing `spec.md`, `plan.md`, `tasks.md`, and optionally
  `data-model.md`, `research.md`, `quickstart.md`, `contracts/`, `checklists/`.
- **User documentation**: the project's user-facing docs (e.g. `README.md`, a docs
  directory, a wiki source directory).
- **Internal architecture reference**: any project-level architecture doc or feature index
  (e.g. a `speckit.md`, `specs/README.md`, or `ARCHITECTURE.md`), if present.

## Scope Check

Classify the requested change before planning:

**Minor post-implementation fix (in scope)** — proceed to the plan:
- swapping or restyling a UI control or component;
- adjusting labels, i18n strings, or option lists;
- fixing a small bug, edge case, or visual detail;
- correcting or clarifying documentation (SpecKit or user-facing).

**Major change (out of scope)** — STOP per the Architectural Safety Check:
- rebuilding a key module, changing core domain logic, breaking backward compatibility,
  or changing the data model / contracts / public API.

## Execution Steps

### 1. Detect the Project Layout and Locate the Feature

- Read `.specify/feature.json` for `feature_directory` (the active feature).
- If the reported problem does not clearly map to the active feature, consult the feature
  index (e.g. `specs/README.md`) and the problem description to identify the correct
  feature folder. If it is ambiguous, ask the user which feature the change belongs to
  before continuing.
- Discover the actual source, test, and user-doc locations (see Project Structure above)
  by listing the repository root and the feature folder. Record these paths and use them
  in the plan.

### 2. Load the Relevant Artifacts (read-only)

- `spec.md` — functional requirements, interface/option tables, acceptance criteria.
- `plan.md` — architecture, component structure, technical decisions, named touch-points.
- `tasks.md` — existing task IDs, phases, and checkbox state.
- `data-model.md` / `contracts/` / `research.md` — only if the problem touches them.
- The project constitution (`.specify/memory/constitution.md`) — only if present and not
  an unfilled template; use it to identify core modules and MUST principles.

### 3. Diagnose the Problem (read-only)

- Inspect the relevant source files (components, types, core logic) in the detected source
  directory.
- Inspect the relevant tests in the detected test location.
- Inspect the relevant user documentation.
- Identify precisely which files and which sections need adjustment, and why.

### 4. Run the Scope Check

- Apply the Scope Check above.
- **If the change is a major change**: STOP. Explain that it exceeds the scope of a minor
  fix and requires the full SpecKit cycle, and recommend the appropriate commands. Do not
  produce a Modification Plan.
- **If the change is a minor fix**: continue to Step 5.

### 5. Produce the Modification Plan

Output the plan using **exactly** this structure (use the project's working language for
the prose, but keep these section titles):

1. **Scope Check** — a short confirmation that the change is a minor post-implementation
   fix and does not require the full SpecKit cycle.
2. **Diagnosis and Context** — a short description of the places in the code and in the
   documentation that need adjustment, and why.
3. **Code Modification Plan** — the specific source files and a precise description of the
   structural and behavioral changes.
4. **Test Modification Plan** — the list of existing tests to update, and the list of new
   test cases to add.
5. **SpecKit Documentation Update Plan (Single Source of Truth)** —
   - `spec.md`: changes to functional requirements and interface/option tables.
   - `plan.md`: any corrections to the component schema or architecture.
   - `tasks.md`: adding / checking off the tasks related to the refinement.
   - All written in the present tense, as if the solution had always been in the spec.
   - No "change history" / "patch notes" sections.
6. **User Documentation Update Plan** — the specific user-facing documentation files to
   update and what changes in each.

The plan MUST be concrete: name exact file paths, exact components/controls, and exact
sections. Do not use vague placeholders.

### 6. Request Approval

At the end of the plan, ask the user whether they **approve the plan** or want to make
**corrections** before implementation begins. Do not implement anything until the user
explicitly approves. After approval, note that implementation is a separate step (the user
may run it directly or via `/speckit-implement` once the tasks are in place).

### 7. Check for extension hooks

After producing the result, check if `.specify/extensions.yml` exists in the project root.

- If it exists, read it and look for entries under the `hooks.after_refine` key
- If the YAML cannot be parsed or is invalid, do not skip silently: tell the user that `.specify/extensions.yml` could not be read (include the parser error) and that no hooks were checked, including any mandatory (`optional: false`) hooks registered there, then continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing command invocations from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):

    ```text
    ## Extension Hooks

    **Optional Post-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

  - **Mandatory hook** (`optional: false`):

    ```text
    ## Extension Hooks

    **Automatic Post-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before finishing.
    ```
    After emitting the block above you MUST actually invoke the hook and wait for it to finish before finishing. Run it the same way you would run the command yourself in this agent/session (the invocation may differ from the literal `{command}` id shown above, e.g. a skills-mode agent runs it as `/skill:speckit-...` or `$speckit-...`). Emitting the block alone does not run the hook.

- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently
