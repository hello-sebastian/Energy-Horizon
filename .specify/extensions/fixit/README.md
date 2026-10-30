# Spec-Kit Fixit Extension

Spec-aware bug fixing — maps bugs to spec artifacts, proposes a plan, applies minimal changes.

## Features

- **Spec-aware fixes**: Reads feature specs FIRST to understand intent, then maps the bug to the relevant user story / acceptance criteria / requirement before touching code
- **Single command**: `/speckit.fixit.run <bug description>` — describe the bug, get a fix
- **Plan-then-act**: Proposes a fix plan (root cause, planned changes, approach) and waits for your approval before modifying any code
- **Inline output only**: No report files, no task creation, no config files — all output is inline
- **Escalation guardrails**: Warns before large changes (4+ files), spec conflicts, or constitution violations
- **Iterative debugging**: Run the command repeatedly — each invocation is independent, no setup between runs

## Installation

```bash
specify extension add fixit
```

Or install from repository directly:

```bash
specify extension add fixit --from https://github.com/speckit-community/spec-kit-fixit/archive/refs/tags/v1.0.0.zip
```

For local development:

```bash
specify extension add --dev /path/to/spec-kit-fixit
```

## Usage

After completing `/speckit.implement` (and optionally `/speckit.verify`), manually test your feature. When you find a bug:

```text
/speckit.fixit.run the registration form accepts empty email addresses
```

The command will:

1. Load your spec artifacts (spec.md, tasks.md, optionally plan.md and constitution.md)
2. Map the bug to the relevant user story / requirement
3. Locate the affected source files
4. Present a **Proposed Fix** plan (root cause, planned changes, escalation warnings) and ask for approval
5. Apply the minimal fix after you confirm
6. Output an inline summary

**Prerequisites:**

- Spec Kit >= 0.1.0
- Completed `/speckit.implement` run
- `spec.md` and `tasks.md` present in the feature directory
- At least one completed task in `tasks.md`

### Iterative Debugging

Fix one bug, test manually, fix the next:

```text
/speckit.fixit.run the submit button stays disabled after form validation passes
```

```text
/speckit.fixit.run the error message shows "undefined" instead of the field name
```

Each invocation is independent — no state, no setup between runs.

### Escalation Behavior

The command warns you before making large or spec-conflicting changes:

| Trigger | Behavior |
|---------|----------|
| Fix touches 4+ files | ⚠️ Scope warning — asks to proceed or stop |
| Fix contradicts a spec requirement | ⚠️ Spec conflict — identifies the requirement, asks to proceed |
| Fix violates a constitution MUST principle | 🛑 Hard block — cannot override, must find alternative |

If you override a scope or spec-conflict warning, the inline summary includes a caveat noting the override.

## What It Does

The fixit command fixes bugs with spec awareness:

1. **Initialize**: Runs `check-prerequisites.sh` to locate the feature directory
2. **Load context**: Progressively loads spec.md, tasks.md, and optionally plan.md and constitution.md
3. **Map bug to spec**: Identifies which user story, requirement, or acceptance criterion the bug relates to
4. **Locate files**: Searches task-referenced files first, then broader project if needed
5. **Proposed fix**: Presents a plan with root cause, planned changes, approach, and any escalation warnings — waits for approval
6. **Apply fix**: Minimal code change respecting spec intent and existing patterns (after user confirms)
7. **Inline summary**: Outputs bug description, related spec, files changed, and explanation

## What It Does NOT Do

- No configuration files (nothing to configure)
- No report files (output is always inline)
- No task creation (bugs are reactive, not planned work)
- No hooks (user invokes manually)
- No batch mode (one bug at a time)

## Workflow Integration

```
/speckit.specify → /speckit.plan → /speckit.tasks → /speckit.implement → /speckit.fixit.run <bug>
```

## Troubleshooting

### Issue: Command not available

**Solutions:**

1. Check extension is installed: `specify extension list`
2. Restart AI agent
3. Reinstall extension: `specify extension add fixit`

### Issue: "No completed tasks" error

**Solution:** Run `/speckit.implement` first. The fixit command requires at least one completed task (`[x]`) in `tasks.md`.

### Issue: "Missing spec.md" error

**Solution:** Run `/speckit.specify` to create the specification. Both `spec.md` and `tasks.md` must exist in the feature directory.

## License

MIT License - see [LICENSE](LICENSE) file

## Support

- Issues: [https://github.com/speckit-community/spec-kit-fixit/issues](https://github.com/speckit-community/spec-kit-fixit/issues)
- Spec Kit Docs: [https://github.com/github/spec-kit](https://github.com/github/spec-kit)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

Extension Version: 1.0.0 · Spec Kit: >=0.1.0
