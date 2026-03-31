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
