# 907-docs-product-knowledge
> **Domain Reference** (layers 1 & 2 — source of truth for contracts and implementation)

**Domain**: Documentation & Product Knowledge  
**Replaces**: `001-github-wiki`, `001-energy-horizon-card`  
**Primary artifacts**: `wiki-publish/`, `README.md`, `README-advanced.md`, `CHANGELOG.md`  
**Last updated**: 2026-04-21  

---

<!-- NORMATIVE -->

## Current Behavior (normative)

Documentation for the Energy Horizon Card follows the **Diátaxis framework** (four documentation intents: Tutorial, How-to, Reference, Explanation). The canonical editable source lives in the repository under `wiki-publish/`; GitHub Wiki is the publication channel for end users.

### Documentation surfaces

| Artifact | Purpose | Audience |
|---|---|---|
| `wiki-publish/` | Canonical editable source for all wiki pages | Maintainers / contributors |
| GitHub Wiki | Published documentation for card users | Advanced HA users |
| `README.md` | Quick-start, installation, feature list | All users |
| `README-advanced.md` | Advanced configuration reference | Power users |
| `CHANGELOG.md` | User-visible change history per release | All users |

### Diátaxis intents

- **Tutorial**: Step-by-step path from prerequisites to first working configuration, with checkpoints.
- **How-to**: Task-oriented guides for specific advanced scenarios (YAML config, time windows, diagnostics, etc.).
- **Reference**: Complete public configuration option index with names, defaults, valid values, and behavioral constraints.
- **Explanation**: Conceptual background — LTS data model, comparison window semantics, forecast assumptions, known limitations — in user-facing terms without exposing implementation.

### `wiki-publish/` → GitHub Wiki publish flow

1. Feature/fix work is done on feature branches.
2. `wiki-publish/` source files are updated alongside code changes.
3. On each release, `wiki-publish/` content is uploaded to GitHub Wiki and tagged with the release version number (`X.Y.Z`).
4. The GitHub Wiki home page (and/or a prominent "About this documentation" section) shows which card version the content corresponds to.

### Terminology alignment rule

README and wiki must use identical nomenclature for the same user-facing concepts (option names, presets, modes, etc.). When a conflict is discovered: (1) resolve by reading the actual card source code; (2) if code is ambiguous, obtain a binding decision from the project maintainer; (3) harmonize README and `wiki-publish/` to the agreed term. Publishing divergent terminology is not permitted.

### CHANGELOG governance

`CHANGELOG.md` follows a structured format (Unreleased → versioned sections). Every user-visible behavioral change MUST be recorded before a release. Documentation-only changes (wiki updates) are also recorded.

---

## Public Contract

```
wiki-publish/          Canonical wiki source directory
  *.md                 One file per wiki page
  Home.md              Wiki home page with Diátaxis navigation + version tag

README.md              Project README (quick-start)
README-advanced.md     Advanced configuration reference
CHANGELOG.md           Versioned change log
```

Version tagging requirement:
- `wiki-publish/Home.md` (and the published GitHub Wiki home page) MUST display the card version (`X.Y.Z`) the content corresponds to.
- `CHANGELOG.md` MUST have an `[Unreleased]` section at the top and versioned sections below.

---

## Cross-domain Contracts

**Receives documentation obligations from all other domains**:
- `900-time-model-windows`: window model rules, preset merge semantics, LTS limits.
- `901-data-pipeline-forecasting`: forecast activation thresholds, confidence levels, anomaly detection.
- `902-chart-rendering-interaction`: axis options (`x_axis_format`, `tooltip_format`, `aggregation`), fill/color/forecast YAML keys.
- `903-card-ui-composition`: `title`, `show_title`, `icon`, `show_icon`, `show_forecast`, `language`, `interpretation` (`consumption` \| `production`; omit → consumption) options; card section CSS classes; interpretation semantics for narrative and chart delta (cross-ref other domains).
- `904-configuration-surface`: editor field descriptions, `getStubConfig()` defaults, YAML-only vs editor-exposed fields.
- `905-localization-formatting`: `language`, `number_format`, `debug` YAML keys; translation file conventions.
- `906-units-numeric-scaling`: `force_prefix`, `precision` options; SI prefix behavior; excluded units.

**Publishes to**:
- All end users and contributors via GitHub Wiki, README files, and CHANGELOG.

---

## Non-Goals

- General Home Assistant tutorials ("HA from scratch"); wiki links to official HA docs instead.
- Translating wiki content (wiki is English-only; card UI strings are in domain 905).
- Code documentation / JSDoc (separate from user-facing docs).
- Per-feature detailed implementation notes (those live in domain `spec.md` files).

---

<!-- EXECUTION -->

## User Stories

### US-907-1 — Conceptual understanding via Explanation section (P1)

As an advanced HA user new to this card, I need a single coherent explanation of why the card works the way it does — LTS data model, comparison windows, forecast assumptions, known limitations — so I can configure it without repeatedly guessing at defaults or misinterpreting the chart.

**Independent test**: An independent reviewer (knows HA, doesn't know this card) reads the Explanation section and confirms they understand: what makes a valid entity, what "current vs reference" means, and what assumptions the forecast makes — without consulting source code.

**Acceptance Scenarios**:

1. **Given** a reader familiar with HA but new to this card, **When** they read the Explanation section, **Then** they understand the LTS data model, what a comparison window is, why the forecast activates when it does, and what known data gaps look like — without any code references.
2. **Given** the Explanation section and the README, **When** compared for the same key terms (preset names, window semantics, comparison modes), **Then** no conflicting definitions exist.

---

### US-907-2 — Task completion via How-to guides (P1)

As a power user who already understands the card, I need clear how-to guides for specific advanced tasks (YAML time window config, aggregation override, troubleshooting missing entity statistics, YAML vs editor distinction), so I can accomplish each task without forum support.

**Independent test**: A tester with no prior knowledge of the card follows a how-to guide and achieves the described end state, or reaches a documented checkpoint with a clear "what to do if this fails" path.

**Acceptance Scenarios**:

1. **Given** a user with a working HA instance and a statistics entity, **When** they follow a selected how-to guide, **Then** they achieve the documented end state or encounter a documented checkpoint explaining the next diagnostic step.
2. **Given** a feature requiring settings not available in the visual editor, **When** the user searches the how-to section, **Then** they find a clear distinction between what the editor supports and what requires YAML.

---

### US-907-3 — Configuration lookup via Reference (P2)

As a user who knows the option name, I need a complete configuration reference with option names, types, valid values, defaults, and behavioral notes, so I can verify my YAML without reading through narrative explanations.

**Independent test**: For every public configuration option listed in domains 900–906, a corresponding reference entry exists with name, type, valid values, default, and at least one behavioral note.

**Acceptance Scenarios**:

1. **Given** the user knows a YAML key name, **When** they open the Reference section, **Then** they find a complete entry with meaning, default, valid values, and any relevant "requires / excludes / interacts with" notes.
2. **Given** a new card version is released with changed options, **When** the maintainer compares the Reference against the release notes, **Then** they can identify missing or outdated entries using a checklist.

---

### US-907-4 — Wiki version is always traceable (P2)

As a user reading the GitHub Wiki, I need to know which card version the documentation applies to without consulting the repository history, so I can tell if the docs match my installed version.

**Independent test**: From the GitHub Wiki home page, the card version is visible within one step (displayed on the home page or one click to an "About" page).

**Acceptance Scenarios**:

1. **Given** the GitHub Wiki is open, **When** a user reads the home page, **Then** the card version (`X.Y.Z` or a documented range) the content applies to is visible within one navigation step.
2. **Given** a new release is published, **When** `wiki-publish/` content is uploaded to GitHub Wiki, **Then** the version reference is updated to match the new release before the upload completes.

---

## Edge Cases

1. **Older HA or card version**: documentation must call out minimum supported HA version and any known behavioral differences for older card versions when they affect user-visible configuration.
2. **Experimental or frequently-changing feature**: documentation must label it as experimental or include a "last verified: X.Y.Z" note; no presenting experimental behavior as stable.
3. **Terminology conflict between README and wiki**: follow the resolution rule (code → maintainer decision → harmonization of README and `wiki-publish/`); publishing divergent terminology is not permitted.
4. **GitHub Wiki unavailable**: README documents that `wiki-publish/` on the default branch is the editable source and can be read directly; publication to wiki follows the release flow.
5. **Missing how-to for a user-visible feature**: tracked as a documentation gap in `CHANGELOG.md` Unreleased section; not silently omitted.
6. **User expects general HA tutorial**: wiki does not provide HA basics; relevant official HA documentation links are provided instead.

---

## Functional Requirements

- **FR-907-A (Diátaxis structure)**: Documentation in `wiki-publish/` and on GitHub Wiki MUST be organized into the four Diátaxis intents: Tutorial, How-to, Reference, and Explanation. Each intent MUST be reachable from the wiki home page within two navigation steps.

- **FR-907-B (Explanation coverage)**: The Explanation section MUST cover (in user-facing terms, not implementation terms): the role of LTS statistics, entity requirements, comparison window semantics, forecast assumptions and activation conditions, and known data limitations.

- **FR-907-C (How-to coverage)**: The How-to section MUST cover at minimum: configuring the card via YAML for features not available in the visual editor; configuring time windows and aggregation; troubleshooting missing or mismatched statistics; the YAML vs visual editor boundary.

- **FR-907-D (Reference completeness)**: The Reference section MUST document every public configuration option from domains 900–906 that is user-visible: name, type, valid values, default value, and behavioral notes including `requires / suggests / excludes` relationships where relevant. Coverage target: ≥ 90% of user-facing options have a reference entry.

- **FR-907-E (Version tagging)**: `wiki-publish/Home.md` and the published GitHub Wiki home page MUST display the card version (`X.Y.Z` or agreed range) the content corresponds to. This MUST be updated at every upload to GitHub Wiki.

- **FR-907-F (Terminology alignment)**: README and wiki MUST use identical nomenclature for the same user-facing concepts. A discovered conflict MUST be resolved by: (1) reading the card source code; (2) if ambiguous, obtaining a binding maintainer decision; (3) harmonizing README and `wiki-publish/`. Publishing divergent terminology is forbidden.

- **FR-907-G (Maintenance process)**: A documented maintenance process MUST exist covering: event-driven triggers (card release, user-visible behavioral change), a minimum review scope per release, a periodic review rhythm, and a documented procedure when documentation is found to be out of date.

- **FR-907-H (CHANGELOG governance)**: `CHANGELOG.md` MUST follow a structured format with an `[Unreleased]` section at the top and versioned sections below. Every user-visible behavioral change MUST be recorded before the associated release. Documentation-only changes are also recorded.

- **FR-907-I (English-only wiki)**: All wiki content (pages, navigation, glossary) MUST be in English. Card UI translation strings (domain 905) are not part of the wiki content scope.

- **FR-907-J (Scope boundary)**: Wiki content MUST NOT include general HA tutorials. Where broader HA knowledge is needed, the wiki MUST link to official HA documentation instead of reproducing it.

---

## Key Entities

- **`wiki-publish/`**: Canonical editable source for all GitHub Wiki pages. One file per wiki page. `Home.md` is the wiki home page with Diátaxis navigation links and version tag.
- **GitHub Wiki**: Publication channel for end users. Content is uploaded from `wiki-publish/` on each release.
- **Diátaxis intents**: Tutorial (guided first-time path), How-to (task-oriented), Reference (option index), Explanation (conceptual background).
- **Terminology alignment rule**: Conflict resolution process: code analysis → maintainer decision → harmonization of README and `wiki-publish/`.
- **Maintenance process**: Documented event-driven and periodic procedure for keeping docs synchronized with the card's behavior.
- **`CHANGELOG.md`**: Structured release-note file. `[Unreleased]` section collects pending changes; versioned sections are finalized at release.

---

## Success Criteria

- **SC-907-1**: ≥ 90% of user-facing configuration options across domains 900–906 have a Reference entry; verified by a coverage checklist at each release review.
- **SC-907-2**: A first-time reviewer (knows HA, doesn't know the card) confirms no conflicting definitions for at least 5 key terms when comparing the Explanation section and README.
- **SC-907-3**: The card version is visible on the GitHub Wiki home page within one navigation step in 100% of post-release checks.
- **SC-907-4**: A maintenance process document is accessible to contributors (in `wiki-publish/` or a linked file) and covers at minimum: one event-driven trigger, one periodic rhythm, and a procedure for out-of-date documentation.

---

## Assumptions

- GitHub Wiki is the target publication channel; repository `wiki-publish/` is the editable source; this flow is defined in the maintenance process.
- The product audience for wiki content is advanced HA users comfortable with Lovelace, YAML, and developer tools; the wiki does not explain HA basics.
- "User-visible behavioral changes" include any change in YAML option semantics, default values, chart appearance, or data interpretation visible without reading source code.
- All feature domains (900–906) are responsible for flagging documentation-worthy changes to this domain's maintainer at release time.
