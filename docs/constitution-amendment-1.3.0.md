# Constitution Amendment 1.2.0 → 1.3.0

**Date:** 2026-11-18 · **Bump:** MINOR · **Status:** ratified via `/speckit.constitution`

This document is the Governance record for the 1.3.0 amendment of the project
constitution (`.specify/memory/constitution.md`). Per the Governance section, a
constitution change requires (1) justification, (2) discussion in the project
documentation, and (3) a migration plan if the change affects existing users.
This document satisfies (1) and (2); (3) is **N/A** — the amendment contains
internal process rules and documentation only, with no user-facing impact.

## 1. Rationale

The amendment was triggered by a deliberate comparative analysis against the
constitution of a sibling project (`obsidian-usm-plugin`, v1.8.0, an Obsidian
plugin also governed by SpecKit). That analysis surfaced provisions that are
clearly worthwhile for Energy Horizon, particularly **AI-agent guardrails**:
rules that constrain how an LLM agent may structure and extend the codebase,
which is the dominant development mode of this project.

A secondary trigger was the **Language Policy** decision: all SpecKit
documentation, code, changelog, README, wiki, and agent reasoning are to be
maintained in English (speeding LLM processing and serving the international
HA community), with agent-to-user communication in the user's language. The
constitution — the last Polish-language governance artifact in the
repository — was therefore translated in full as part of this amendment.

Every adopted provision was critically evaluated against the Energy Horizon
codebase and the 2026-11-15 architecture audit; provisions that would cause
churn or conflict with established structure were deliberately **not** adopted
(see §4).

## 2. Amendment list

### 2.1 New core principle — VII. Pragmatic Architecture & Anti-Over-Engineering (AI Guardrails)

- **Pure functions over class hierarchies:** domain logic as exported pure
  functions, not class hierarchies/factories/DI; classes only as thin Lit
  element shells.
- **Unidirectional dependency direction:** pure core → HA boundary → UI;
  import cycles forbidden.
- **No abstractions without a concrete, identified use** (cross-reference
  principle V, "simplicity over magic").
- **Three-tier state allocation:** (1) card configuration in the dashboard is
  the only persistent user data (declarative, portable); (2) HA entity states
  are the read-only source of truth; (3) transient state lives only in memory
  of the element instance — the card must not create its own persistence
  (localStorage/sessionStorage/IndexedDB).
- **Styling discipline:** visual styling only via CSS classes in a single
  module (`energy-horizon-card-styles.ts`); inline `style` only for functional
  geometry; chart appearance defined in one place (the ECharts option builder).

### 2.2 Principle III (Code quality, tests, and maintenance)

- **Clause 3 replaced — Test-Driven Development for domain logic:** all
  domain logic (data processing/aggregation, energy calculation, time windows,
  forecast, unit scaling, narrative/labels, config normalize/merge) is
  developed test-first (Red-Green-Refactor); writing production domain code
  without a previously written failing unit test is forbidden.
  *Grandfathering (baseline 2026-11-16: 62 test files / 678 tests):* the
  existing codebase is a documented one-time exception; refactoring existing
  logic must be preceded by characterization tests.
- **New clause — Domain isolation from the Home Assistant API
  (Testability by Design):** domain modules must not import Lit/DOM or use the
  `hass` object directly; access goes through a single boundary
  (`ha-api.ts` + the `HomeAssistant` contract in `ha-types.ts`).
- **New clause — Strict lifecycle management:** removal from the DOM releases
  all resources (chart `dispose`, timers, listeners); in-flight requests are
  protected by the load-generation mechanism.
- **New clause — Language Policy:** spec artifacts, constitution, code,
  changelog, and product documentation in English; agent reasoning in English;
  agent-to-user responses in the user's language.

### 2.3 Other principle additions

- **I (Compliance):** custom element name persistence —
  `energy-horizon-card` / `energy-horizon-card-editor` are public API and
  immutable after first publication. (The Polish typo in the old built-in
  reuse clause was absorbed by the translation.)
- **II (Security):** prohibition of dynamic code execution — `eval()`,
  `new Function()`, and fetching/running external JavaScript are forbidden;
  all executable code resides in the built bundle.
- **V (Performance):** the card reacts to Lovelace-delivered state updates and
  opens no own subscriptions or polling beyond LTS requests triggered by
  configuration/state changes.

### 2.4 Development workflow and quality

- **New clause:** every PR modifying business logic must include corresponding
  tests; all tests must pass automatically before release artifacts are built.
- **New subsection — Task Breakdown & Execution Rules (Logical Atomicity):**
  single behavioral increment per task; after every task the project must
  build and pass the full gate; immediate checkoff in `tasks.md`; re-read
  `tasks.md` after any session interruption/context compaction; parallel
  execution only for tasks marked `[P]`; per-spec rules may strengthen, never
  weaken, this protocol.

### 2.5 Additional requirements and constraints

- **Dependency license compatibility:** every external dependency must have a
  license compatible with the project's GPL v3 license.

### 2.6 Governance

- **Versioning policy:** MAJOR (backward-incompatible removal/redefinition),
  MINOR (new principle/section or materially expanded guidance), PATCH
  (clarifications, wording, typos).
- **Compliance review:** a constitution compliance review is a mandatory
  checkpoint before every production release.

## 3. Translation fidelity note

The existing Polish constitution was translated to English **1:1 in
semantics**: no provision was dropped, weakened, or shortened. Heading
structure was preserved (Core Principles I–VI → VII, "Additional requirements
and constraints", "Development workflow and quality", Governance, version
footer). Normative keywords were mapped faithfully (`musi` → MUST,
`powinna` → SHOULD) and the result was re-normalized for native English
quality without semantic drift. The old Polish typo in clause I.5
("wykorzystywac" etc.) was corrected in the process.

## 4. Deliberately not adopted (from the sibling analysis)

| Provision | Reason for rejection |
|---|---|
| Strict 3-layer directory structure | High refactoring churn; conflicts with the audit's §5 "do not touch" list and the existing, working module layout |
| Per-phase commits | Conflicts with this project's 1 task = 1 PR convention |
| `ownerDocument` popout rule | Obsidian-specific API; no analogue in the HA card runtime |
| Literal `metadataCache` rule | Obsidian-specific API; the general "no hidden global state" principle already covers the intent |
| Board-file portability | Not applicable — the card persists no files of its own (see three-tier state allocation) |
| Constitution SemVer as a standalone clause | Already enforced by the SpecKit `/speckit.constitution` command mechanics and captured in the Governance versioning policy instead |

## 5. Governance record

- **Justification:** §1 above (cross-project analysis + Language Policy).
- **Discussion:** this document, committed alongside the amended constitution
  and the changelog entry (see `changelog.md`, [Unreleased] → Maintenance).
- **Migration plan:** N/A — internal process rules and documentation only; no
  user-facing, code, or build-artifact impact.

**Version:** 1.3.0 · **Ratified:** 2026-03-05 (unchanged) · **Last Amended:** 2026-11-18
