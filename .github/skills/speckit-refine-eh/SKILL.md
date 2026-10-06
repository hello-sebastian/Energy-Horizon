---
name: "speckit-refine-eh"
description: "Energy-Horizon-specific: diagnose and plan post-implementation fixes to code and documentation after a SpecKit feature is built. Planning-only: produces a detailed Modification Plan and waits for user approval; never edits files."
compatibility: "Requires spec-kit project structure with specs/ directory"
metadata:
  author: "hello-sebastian"
  source: "custom"
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). The input is a
description of a problem, discrepancy, or interface refinement to address after the
feature was implemented.

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

You act as a **Senior Frontend Engineer** and **Technical Writer** on the **Energy-Horizon**
project — a Home Assistant Lovelace card written in TypeScript/Lit. Your job is to handle
small post-implementation discrepancies, oversights, and interface refinements (for example:
switching a visual-editor control from radio buttons to a dropdown) that surfaced after the
specification was implemented.

## Operating Constraints (Guardrails)

**1. PLANNING-ONLY — NEVER EDIT FILES**

This command is **strictly read-only**. You MUST NOT create, modify, or delete any file —
not source code, not tests, not `spec.md` / `plan.md` / `tasks.md`, not `README.md` /
`README.advanced.md`, not `wiki-publish/`. You may read files and run read-only inspection
commands (e.g. `grep`, `ls`, `git status`). Your **only** output is a detailed
**Modification Plan** (Plan Modyfikacji). You MUST wait for the user to verify and approve
the plan before any implementation begins. Implementation is a separate, explicit step
performed after approval — it is **not** part of this command.

**2. ARCHITECTURAL SAFETY CHECK (Bezpiecznik Architektoniczny)**

Analyze the reported problem. If the change requires **any** of the following, you MUST
**STOP** and NOT produce a Modification Plan:

- rebuilding or restructuring a key module (e.g. the Time Windows engine in
  `src/card/time-windows/`, the data layer in `src/card/ha-api.ts`, the chart renderer in
  `src/card/echarts-renderer.ts`);
- changing the LTS / Luxon calculation logic (window resolution, aggregation, forecast
  computation, axis/period math);
- breaking backward compatibility of the YAML card configuration (renaming/removing a
  config key, changing a key's type or accepted values, changing default behavior);
- changing the data model, public contracts, or the card's external API.

In that case, inform the user that the problem **exceeds the scope of a minor fix** and
requires the **full SpecKit cycle** (a new specification). Recommend the appropriate
commands: `/speckit-specify` (new feature) or, if it belongs to an existing feature,
`/speckit-clarify` + `/speckit-plan` + `/speckit-tasks` + `/speckit-implement`. Do not
proceed to a plan.

**3. DOCUMENTATION AS THE SINGLE SOURCE OF TRUTH**

When the plan calls for updating SpecKit documentation, the updates MUST be written in the
**present tense**, as if the solution had been part of the specification from the start.
You MUST NOT create "change history" / "patch notes" / "changelog" sections inside
`spec.md` (or `plan.md` / `tasks.md`). The artifacts describe the intended state, not the
history of how it got there.

## Project Structure (Energy-Horizon)

Use these actual paths when analyzing and when writing the plan:

- **Source code**: `src/`
  - Visual editor (GUI) controls, types, Lit components: `src/card/`
    (e.g. `src/card/energy-horizon-card-editor.ts`, `src/card/types.ts`,
    `src/card/cumulative-comparison-chart.ts`, `src/card/ha-api.ts`,
    `src/card/echarts-renderer.ts`)
  - Time Windows engine: `src/card/time-windows/`
  - Axis / labels / formatting: `src/card/axis/`, `src/card/labels/`
  - i18n: `src/card/localize.ts`, `src/translations/`
  - Utilities: `src/utils/`
- **Tests**: `tests/` — `tests/unit/` (unit, `*.test.ts`), `tests/integration/`
  (integration, `*.test.ts`), `tests/helpers/`. Run with `npm test` (sets `TZ=UTC`).
- **SpecKit feature documentation**: the feature's folder under `specs/`
  (e.g. `specs/005-gui-editor/`, `specs/007-gui-editor-full-coverage/`). Note: this project
  stores feature docs in `specs/`, **not** `.speckit/`. Each folder contains:
  - `spec.md` (functional requirements and specification)
  - `plan.md` (technical details and component structure)
  - `tasks.md` (implementation task list)
  - optionally `data-model.md`, `research.md`, `quickstart.md`, `contracts/`, `checklists/`
- **User documentation**:
  - `README.md` (basic configuration and interface)
  - `README.advanced.md` (advanced YAML / Luxon options)
  - `wiki-publish/` (GitHub wiki source pages, e.g. `Configuration-and-Customization.md`,
    `How-To-Time-Windows.md`, `Luxon-Formats-Reference.md`). Note: the wiki source lives in
    `wiki-publish/`, **not** `wiki/`.
- **Internal architecture reference**: `speckit.md` (repo root) and `specs/README.md`
  (feature index with status and code mapping).

## Scope Check (Ocena Zakresu)

Classify the requested change before planning:

**Minor post-implementation fix (in scope)** — proceed to the plan:
- swapping or restyling a UI control in the visual editor (e.g. radio → dropdown /
  `ha-select` / `ha-combo-box`);
- adjusting labels, i18n strings, or option lists;
- fixing a small bug, edge case, or visual detail;
- correcting or clarifying documentation (SpecKit or user-facing).

**Major change (out of scope)** — STOP per the Architectural Safety Check:
- rebuilding a key module, changing LTS/Luxon calculation logic, breaking YAML backward
  compatibility, or changing the data model / contracts / public API.

## Execution Steps

### 1. Locate the Feature

- Read `.specify/feature.json` for `feature_directory` (the active feature).
- If the reported problem does not clearly map to the active feature, consult
  `specs/README.md` (feature index) and the problem description to identify the correct
  `specs/NNN-<name>/` folder. If it is ambiguous, ask the user which feature the change
  belongs to before continuing.

### 2. Load the Relevant Artifacts (read-only)

- `spec.md` — functional requirements, interface/option tables, acceptance criteria.
- `plan.md` — component structure, technical decisions, named touch-points.
- `tasks.md` — existing task IDs, phases, and checkbox state.
- `data-model.md` / `contracts/` / `research.md` — only if the problem touches them.

### 3. Diagnose the Problem (read-only)

- Inspect the relevant source in `src/` (editor controls, types, Lit components, i18n).
- Inspect the relevant tests in `tests/`.
- Inspect the relevant documentation (`README.md`, `README.advanced.md`, `wiki-publish/`).
- Identify precisely which files and which sections need adjustment, and why.

### 4. Run the Scope Check

- Apply the Scope Check above.
- **If the change is a major change**: STOP. Explain that it exceeds the scope of a minor
  fix and requires the full SpecKit cycle, and recommend the appropriate commands. Do not
  produce a Modification Plan.
- **If the change is a minor fix**: continue to Step 5.

### 5. Produce the Modification Plan (Plan Modyfikacji)

Output the plan in Polish, using **exactly** this structure:

1. **Ocena Zakresu (Scope Check)** — a short confirmation that the change is a minor
   post-implementation fix and does not require the full SpecKit cycle.
2. **Diagnoza i Kontekst** — a short description of the places in the code and in the
   documentation that need adjustment, and why.
3. **Plan Modyfikacji Kodu** — the specific files in `src/` (e.g. editor UI controls, type
   definitions) and a precise description of the structural and visual changes (e.g.
   replacing radio controls with dropdown / `ha-select` / `ha-combo-box` components).
4. **Plan Modyfikacji Testów** — the list of existing unit/integration tests to update,
   and the list of new test cases to add.
5. **Plan Aktualizacji Dokumentacji SpecKit (Single Source of Truth)** —
   - `spec.md`: changes to functional requirements and interface/option tables.
   - `plan.md`: any corrections to the editor component schema.
   - `tasks.md`: adding / checking off the tasks related to the refinement.
   - All written in the present tense, as if the solution had always been in the spec.
   - No "change history" / "patch notes" sections.
6. **Plan Aktualizacji Dokumentacji Użytkownika** —
   - `README.md`: changes to the visual-form option descriptions.
   - `README.advanced.md`: changes to advanced parameters (if applicable).
   - `wiki-publish/`: the specific files in `wiki-publish/` to update.

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
