# Energy Horizon Lovelace Card Constitution

This constitution governs the development, maintenance, and evolution of universal Lovelace cards for Home Assistant, distributed through the built-in Marketplace (HA 2026.11+) or HACS (older HA versions). It is general in nature and applies independently of the specific card type or the visualized data.

## Core Principles

### I. Compliance with the Home Assistant ecosystem and Marketplace (HACS)

- The card MUST comply with the official Home Assistant guidelines for Lovelace cards (API, YAML/Storage UI configuration, events, theming).
- The project assumes, by default, installation and updates through the built-in Marketplace (HA 2026.11+) or HACS (HA < 2026.11), with a properly maintained `hacs.json` manifest (required by both channels), semantic versioning, and a readable changelog.
- The repository and the release artifact MUST meet the Marketplace requirements: a public GitHub repository, a `hacs.json` manifest, a correct file structure; the deployment target is `www/community/` (the path under which the Marketplace installs and serves dashboard assets).
- User documentation (README, wiki, changelog) describes both installation channels — Marketplace (HA 2026.11+) and HACS (older HA versions) — together with the dashboard asset paths: `/local/community/…` (Marketplace), `/hacsfiles/…` (HACS, still works), and `/local/…` (manual installation).
- Card configuration MUST NOT violate existing HA patterns (e.g., entity naming, the use of `state`, `attributes`, `unit_of_measurement`).
- The card SHOULD behave predictably in the dashboard's `edit`/`view` modes and MUST NOT negatively affect other cards.
- Wherever possible, built-in Home Assistant solutions, standards, visual styles, behaviors, and libraries MUST be reused.
- **Custom element name persistence:** `energy-horizon-card` and `energy-horizon-card-editor` are part of the public API (user YAML) and MUST NOT change after first publication.

### II. Security and fault tolerance

- All logic runs exclusively in the user's browser and communicates with Home Assistant exclusively through the native Lovelace card API and the official HA mechanisms — with no custom communication channels of its own.
- Input from YAML, Storage UI, and entity values is treated as untrusted data: it undergoes rigorous sanitization and validation (including protection against XSS, HTML filtering, direct script injection, and dangerous attributes).
- Configuration data and states MUST NOT contain sensitive information exposed in the UI, logs, or error messages.
- The card MUST be resilient to missing entities, inconsistent data, unusual units, and misconfigurations — instead of crashing: a clear, non-intrusive message for the user.
- All data operations MUST be defensive: checking types, ranges, and attribute presence, with sensible default values and "graceful degradation" variants that do not block the operation of the whole dashboard.
- Errors SHOULD be logged in a way that aids diagnosis, without exposing private data.
- **Prohibition of dynamic code execution:** `eval()`, `Function()`/`new Function()`, and fetching and running external JavaScript code during the card's operation are forbidden. All executable code MUST reside in the built card bundle.

### III. Code quality, tests, and maintenance

- All application code is written in TypeScript with strict compiler settings (`strict`, strict typing, avoidance of `any`) and with careful type models for entities and YAML configuration.
- Frontend code is built on the technologies recommended for HA cards (e.g., Web Components/Lit) and is modular, readable, and consistently formatted.
- **Test-Driven Development for domain logic:** all domain logic (data processing/aggregation, energy calculation, time windows, forecast, unit scaling, narrative/labels, config normalize/merge) MUST be developed test-first (Red-Green-Refactor); writing production domain code without a previously written failing unit test is forbidden. *Grandfathering (baseline 2026-11-16: 62 test files / 678 tests):* the existing codebase is a documented one-time exception — its regression tests establish the baseline. Refactoring existing logic MUST be preceded by characterization tests freezing the current behavior.
- Functional changes require updates to the documentation, configuration examples, and — where applicable — screenshots.
- The card configuration API is treated as a public contract: compatibility-breaking changes are clearly marked in versioning and documentation, together with a description of the migration path.
- **Domain isolation from the Home Assistant API (Testability by Design):** domain modules MUST NOT import Lit/DOM or use the `hass` object directly; access to entity states, WebSocket LTS, and HA services MUST go through a single boundary (`ha-api.ts` + the `HomeAssistant` contract in `ha-types.ts`) so that every domain module is fully testable without Home Assistant (mocks).
- **Strict lifecycle management:** removal of the card from the DOM (dashboard change, edit mode, reload) MUST release all resources — the chart instance (`dispose`), timers, and listeners; in-flight requests are protected by the load-generation mechanism (stale-load discard).
- **Language Policy:** SpecKit documentation (`specs/`, `.specify/`), this constitution, source code and comments, the changelog, and product documentation (README, wiki) are maintained in English — to speed up LLM processing and ensure readability for the international HA community. The AI agent's reasoning process (chain-of-thought) is conducted in English. Agent responses to the user in the IDE are in the language used by the user.

### IV. UX/UI, accessibility, and data visualization

- The card interface is designed in the spirit of the "Home Assistant look & feel": consistent typography, spacing, colors, and components, with full respect for light and dark themes.
- Information is presented concisely and hierarchically: key data (e.g., current usage, trend, comparisons) is the most exposed; details are available on demand (hover, click, expansion).
- The choice of chart types, colors, and scale MUST support the comprehension of the data, not only aesthetics (e.g., consistent use of color for "consumption", "production", "limit", "forecast").
- The card SHOULD be responsive and readable across different tile and screen sizes (from a phone to a large monitor).
- Accessibility is a requirement, not an option: sufficient contrast, keyboard support, ARIA labels, thoughtful screen-reader messages.

### V. Performance, simplicity, and observability

- Data processing MUST be efficient — minimize the number of refreshes, avoid unnecessary re-renders, and do not block the main thread with heavy computation.
- Simple, understandable solutions are preferred over "magic" — every additional complexity MUST bring clear value to the user.
- The card SHOULD react in a transparent way to typical problems (missing permissions, missing data, misconfiguration) and provide signals that ease debugging (console logs, in-UI messages, a "troubleshooting" section in the documentation).
- All caching, aggregation, or data-optimization mechanisms MUST be clearly implemented and easy to disable or redesign in the future.
- The card reacts to state updates delivered by Lovelace and MUST NOT open its own subscriptions or polling beyond LTS requests triggered by configuration or state changes.

### VI. Language care and UX writing

- Every piece of user-facing text — documentation, README, wiki, form labels, error messages, in-UI messages — MUST be edited from the standpoint of a specialist in the language in which the text is written: a linguist, an editor, and a UX-writing specialist.
- The agent treats every received draft as text requiring editing: overly long and complex sentences, incorrectly used conjunctions, inflection errors, and unclear messages and labels MUST be corrected, not carried over into the target text.
- The target text MUST be understandable on first reading, written in simple language, in a friendly but professional tone, in accordance with UX-writing standards.
- Error messages and labels MUST be short and concrete; technical jargon is used only where it is necessary for understanding.

### VII. Pragmatic Architecture & Anti-Over-Engineering (AI Guardrails)

- **Pure functions over class hierarchies:** domain logic MUST be implemented using simple, exported pure functions rather than complex class hierarchies, factories, or dependency-injection frameworks; classes are permitted only as thin Lit element shells.
- **Unidirectional dependency direction:** dependencies MUST flow one way — pure core → Home Assistant boundary → UI; import cycles are forbidden.
- **No abstractions without a concrete, identified use** (cross-reference V: simple, understandable solutions over "magic").
- **Three-tier state allocation:** (1) the only persistent user data is the card configuration in the dashboard (YAML/Storage UI) — fully declarative and portable; (2) HA entity states are the source of truth for data (read-only); (3) transient state (loading, preview, editor state) lives only in memory of the element instance. The card MUST NOT create its own persistence (localStorage/sessionStorage/IndexedDB).
- **Styling discipline:** visual styling is done exclusively through CSS classes in a single module (`energy-horizon-card-styles.ts`); inline `style` is permitted only for functional geometry (e.g., chart container sizing), never for visual styling; chart appearance is defined in one place (the ECharts option builder), with colors derived from configuration/theme.

## Additional requirements and constraints

- The project maintains a consistent open-source workflow: a transparent `README`, a maintained `changelog`, a GitHub wiki, clear rules for reporting issues and contributing, and respect for users and co-creators.
- External libraries are chosen deliberately: prefer light, well-maintained, widely used packages; avoid excessive dependencies and "vendor lock-in"; every new NPM dependency MUST be justified and MUST NOT duplicate functionality available natively, in Home Assistant, or in the existing code.
- **License compatibility of dependencies:** the project is licensed under GPL v3; every external dependency MUST have a license compatible with GPL v3. Including a dependency with a conflicting license is forbidden without an explicit, documented decision.
- All operations on energy data SHOULD respect local conditions (time zone, units, date/number formats) and make fullest use of Home Assistant's native capabilities.
- Experimental or "advanced" features MUST be clearly marked and, by default, MUST NOT complicate the basic user experience.

## Development workflow and quality

- All changes are introduced through pull requests, with at least one independent review for significant modifications to logic or UI.
- Every new feature or significant change to an existing one MUST be supported by a description of its use case and of its impact on UX, performance, and compatibility with existing configurations.
- Before releasing a production version of the card, testing is conducted in a realistic Home Assistant environment (different entities, different dashboard configurations, at least several themes).
- The release pipeline (manual or automated) ensures: building the artifacts, basic validation, updating the version and changelog, and verifying the correctness of the Marketplace/HACS metadata (`hacs.json`).
- Every PR modifying business logic MUST include corresponding tests; all tests MUST pass automatically before release artifacts are built.

### Task Breakdown & Execution Rules (Logical Atomicity)

- **Single behavioral increment:** every task in `tasks.md` represents a single, coherent behavioral change or architectural step.
- **No feature bundling:** a task covering several separate concerns (for example business logic, user interface, and localization text) MUST be split into separate tasks — one concern per task.
- **Self-contained & compilable:** after completing a single task, the project MUST build and pass the full gate (test/typecheck/lint/build); splitting tasks in a way that leaves the project in a broken state is forbidden.
- **Immediate checkoff:** immediately after successfully completing and verifying a task, the task MUST be marked `[x]` in `tasks.md`; batch checkoff of tasks at the end of a session is forbidden.
- **Sequencing gate:** task N+1 MUST NOT be started until task N is marked `[x]` in `tasks.md`.
- **Session interruption & context compaction:** after any session interruption or context compaction, `tasks.md` MUST be re-read and completed-but-unmarked tasks checked off before starting new work.
- **Parallel execution:** only for tasks explicitly marked `[P]`; per-spec rules (e.g., a spec's program rules) may strengthen, never weaken, this protocol.

## Governance

- This constitution takes precedence over local implementation preferences; in case of conflict, the practice MUST be brought in line with the constitution's principles, or the constitution MUST be formally amended.
- Constitution changes require: (1) justification (e.g., new HA/Marketplace/HACS guidelines, new user needs, security issues), (2) discussion in the project documentation, (3) a migration plan if the change affects existing users.
- Every major project decision (a new visualization type, a significant configuration extension, a change of default behaviors) SHOULD be verified for compliance with this constitution.
- Periodic project reviews (e.g., at major releases) SHOULD include a "constitution compliance" item and identify places requiring refactoring.
- **Versioning policy:** the constitution version follows semantic versioning (MAJOR.MINOR.PATCH). MAJOR: backward-incompatible removal or redefinition of a principle. MINOR: a new principle/section added or materially expanded guidance. PATCH: clarifications, wording, or typo fixes.
- **Compliance review:** a constitution compliance review is a mandatory checkpoint before every production release.

**Version**: 1.4.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-11-18
