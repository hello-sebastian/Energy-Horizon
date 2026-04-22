# Quickstart — `900-time-model-windows` (offset work)

## Prerequisites

- Node.js matching project engines  
- Repo root: `/Users/admin/Projekty Local/Energy-Horizon` (or your clone)

## Commands

```bash
cd "/Users/admin/Projekty Local/Energy-Horizon"
npm test
npm run lint
```

Focus tests while iterating:

```bash
npx vitest run tests/unit/time-windows-resolve.test.ts tests/unit/time-windows-merge-validate.test.ts
```

After adding offset ISO tests:

```bash
npx vitest run tests/unit/time-windows-offset-iso.test.ts
```

## Where to edit

- **Parser + rules (FR-900-Q)**: `src/card/time-windows/` — new or extended module called from `validate.ts` and `resolve-windows.ts` only.  
- **Types**: `src/card/types.ts` — only if a shared type alias helps (avoid changing external contracts).  
- **Golden expectations**: `tests/unit/time-windows-*.test.ts` — mirror Edge Cases 11–20 and US-900-6–8 from [spec.md](./spec.md).

## Manual sanity (optional)

Configure a dev HA dashboard card with:

- `offset: P4M4D` + `anchor: start_of_year` + `duration: P1Y` and confirm window boundaries in the card debug or browser console logs (no PII).

## Speckit branch reminder

`/speckit.plan`’s `setup-plan.sh` requires a feature branch name like `900-time-model-offset`. On other branches, paths still resolve via `.specify/feature.json` → `feature_directory`.
