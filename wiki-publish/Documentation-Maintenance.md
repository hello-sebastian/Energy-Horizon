# Documentation Maintenance

**For maintainers:** how canonical wiki Markdown in the repository stays aligned with the card and how GitHub Wiki is updated.

## Canonical source

- **Repository path:** `wiki-publish/` on the **default branch** — edit via PR like code.  
- **Published copy:** [GitHub Wiki](https://github.com/hello-sebastian/energy-horizon/wiki) — upload **after** tagging a release so the **Documentation version** line on [Home](Home) matches the released card semver (FR-013, FR-014).

## Release-triggered workflow

1. Ship the card release (semver tag, HACS artifact, GitHub Release notes).  
2. Update `wiki-publish/Home.md` **Documentation version** to the same semver as the release.  
3. Refresh any pages affected by `changelog.md`.  
4. Merge PR with wiki changes.  
5. **Upload** `wiki-publish/` contents to GitHub Wiki (manual copy/paste or your preferred sync — see repo `specs/001-github-wiki/quickstart.md`).  
6. Confirm SC-006: from the wiki home, a reader sees the card version in **one step** (banner on Home).

## Release checklist (practical, copy/paste)

Use this checklist for every release that changes user-visible behavior.

### 1) Version banner and navigation

- [ ] Update **Documentation version** on [Home](Home) to the release semver.
- [ ] Confirm `_Sidebar.md` links resolve to existing pages (no typos).

### 2) Drift checks (docs vs code)

- [ ] Scan `src/card/types.ts` for new/removed config keys and update [Configuration and Customization](Configuration-and-Customization).
- [ ] Scan `src/translations/en.json` for new status keys (errors/warnings) and ensure troubleshooting/reference pages mention them.
- [ ] For `text_summary.*` keys: keep **one complete phrase per key** with `{{deltaUnit}}` / `{{deltaPercent}}` (or other placeholders) — do not reintroduce split `*_before` / `*_after` pairs.
- [ ] If time windows changed: verify [Time Window Reference](Time-Window-Reference) and [How-To: Time Windows](How-To-Time-Windows) still match `src/card/time-windows/*`.
- [ ] If forecast changed: verify [Forecast and Data Internals](Forecast-and-Data-Internals) matches `computeForecast` in `src/card/ha-api.ts`.
- [ ] If axis/format validation changed: verify [Luxon Formats Reference](Luxon-Formats-Reference) and [Aggregation and Axis Labels](Aggregation-and-Axis-Labels).

### 3) Changelog-driven updates

- [ ] For every user-visible change in `changelog.md`, either:
  - update a wiki page, or
  - explicitly confirm “no documentation impact”.

### 4) Publish step

- [ ] Copy/sync updated `wiki-publish/*.md` into GitHub Wiki.
- [ ] Re-check the Home page map and Sidebar ordering in the published wiki.

## Periodic review (suggested: quarterly)

- Skim [Configuration and Customization](Configuration-and-Customization) against `src/card/types.ts` for new/removed YAML keys.  
- Re-read **Troubleshooting** for still-accurate symptoms.  
- Log the review in changelog, a GitHub issue, or the release notes — leave an audit trail (SC-003).

## Drift detection (doc vs behavior)

Before closing a documentation-heavy release:

- [ ] Every **user-visible** change in `changelog.md` is reflected in wiki or explicitly “unchanged UX”.  
- [ ] Reference tables mention new options and defaults.  
- [ ] Run through **three how-to** paths in [Troubleshooting and FAQ](Troubleshooting-and-FAQ) mentally or in a test HA instance.

If the card behavior and wiki disagree, **treat the implementation as primary**: inspect `src/card/` (FR-009). If the code is ambiguous, **maintainer decision**, then harmonize README and `wiki-publish/` (FR-007).

## Spec anchors (where to look when something feels “magical”)

- Time windows engine: `specs/001-time-windows-engine/`
- Forecast math and gating: `specs/001-compute-forecast/`
- Unit scaling: `specs/004-smart-unit-scaling/`

## Nomenclature conflicts (README vs wiki)

1. Compare term usage with **`src/card/types.ts`** (YAML keys) and the visual editor field labels in `energy-horizon-card-editor.ts` if needed.  
2. If still ambiguous, maintainer decides.  
3. Update **README**, **`wiki-publish/`**, and then the **published** wiki — no lasting split (FR-007).

---

## Terminology alignment record (SC-004)

Use this table as a **smoke test** before publishing wiki: five key terms must read the same in README and wiki (allowing wiki to expand, not contradict).

| Term | Canonical meaning (must match README + wiki) | Verified |
|------|-----------------------------------------------|----------|
| `comparison_preset` | YAML key for comparison mode: `year_over_year`, `month_over_year`, `month_over_month` (legacy `comparison_mode` deprecated) | ☐ |
| `month_over_month` | Current **full calendar month** vs **previous full calendar month** | ☐ |
| `show_forecast` | Toggles forecast overlay; default on; alias `forecast` | ☐ |
| `time_window` | Advanced optional YAML for multi-window / custom ranges (merged with preset) | ☐ |
| `aggregation` | LTS step: `hour`, `day`, `week`, `month` — or omitted for auto-selection after merge | ☐ |

**Reviewer:** check README sections *Advanced documentation*, *Time windows*, and *Aggregation* against this table and [Configuration and Customization](Configuration-and-Customization).

---

## When documentation is wrong or outdated

1. Open an issue or PR; label documentation.  
2. For urgent mismatches after a release, add a short **note** on [Home](Home) pointing to the fix PR or issue until wiki is republished.  
3. Never leave contradictory option names between README and wiki after a patch (FR-007).
