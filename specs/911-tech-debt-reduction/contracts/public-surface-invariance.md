# Contract: Public Surface Invariance

**Feature**: `911-tech-debt-reduction` | **Spec refs**: FR-019 (the prime invariant), Out of Scope §1–§9

The program's defining requirement is **zero user-visible change**. This contract enumerates the surfaces that must remain identical throughout the 14 tasks, and the verification instrument for each. A PR that breaks any row is a program failure — not a "planned change".

## Invariant surfaces

| Surface | Contract (must stay identical) | Verification instrument |
|---|---|---|
| **Configuration schema** | `CardConfig`: every field, type, default, validation rule, and the `normalizeForLoad`/`normalizeForSave` round-trip contract | existing config tests green; editor coverage tests green (FR-016: no domain spec change for schema) |
| **i18n** | same keys, same 5 languages, same fallback (`en`), same key→text semantics | guard tests green: `localize-static-text-guard`, `narrative-mandatory-keys`, `localize-has-translation-key` |
| **Rendering** | same DOM output, classes, theme tokens, colors, ARIA attributes for the same (state, config, hass) input | integration tests green with **unchanged expected values**: tooltip/panel consistency, picker preview, load coalescing (the golden standard) |
| **Custom element** | same element tag, same public properties (`hass`, `config`), same `getEntitySuggestion` contract (synchronous, total, non-throwing — R1) | existing lifecycle tests green |
| **Editor UX** | same fields, same control behaviors, same YAML-mode semantics (parse/emit/self-echo/debounce), same focus/caret/scroll restoration behavior | editor lifecycle + coverage tests green; `yaml-mode` (TD-12) adds DOM-free unit tests without changing observed behavior |
| **Picker (910) semantics** | spec 910 FR-010/013/014 — demo-first, real-data upgrade, preview flags — preserved 1:1 | picker tests green (edge case 7) |
| **Preview (909) semantics** | transient shift behavior, gray-tone series, control visibility incl. no-data | picker-preview integration tests green |
| **Shipped artifact API** | the `dist/` bundle exposes the same entry points/behavior; `ChartRenderer` leaves no trace (it never did — regression guard) | CI `verify-dist` green; `dist/` rebuilt in every code-touching PR |
| **Do-not-touch mechanisms** | Registry pattern (908), load generations, `time-windows/` core, `ha-types.ts` (audit §5) | code review; their tests stay green |

## Permitted diffs (exhaustive list)

1. **`dist/energy-horizon-card.js.map` removed from the production artifact** (TD-13) — a source-disclosure fix (Article II); users lose nothing observable. Dev/preview sourcemaps unchanged.
2. **Bundle content** — dead code (`ChartRenderer`, `date-fns` never bundled) removed; sizes may change, behavior does not.
3. **Documentation** — domain specs 900–907 updated where domain truth changed (FR-016 mapping), changelog entries per PR (FR-015), one "Known simplifications" note in the wiki Troubleshooting (TD-13).
4. **Internal code layout** — the entire point of the program: new modules (`pipeline/`, `timeline/`, `picker/`, `view-model.ts`, `yaml-mode.ts`, `period-label.ts`), reshaped internal types (`CardState` union, `LtsMessageResponse`), tightened tooling flags. **Internal** — no user-visible effect.

## Enforcement

- Every PR: the full gate `npm test && npm run typecheck && npm run lint && npm run build` + committed `dist/` (CI `verify-dist`) — FR-018.
- Every wave: `speckit.converge` drift check — code vs. spec/plan/tasks, including this contract — FR-018.
- The final `speckit.converge` (end of W4 or W3 if TD-14 is skipped) is the program's exit gate: SC-008 = 0 remaining audit violations and all rows above verified.
