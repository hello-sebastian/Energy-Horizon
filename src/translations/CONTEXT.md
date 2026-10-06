# Translation context: `text_summary.period.*`

Keys `text_summary.period.day`, `.week`, `.month`, `.year`, and `.reference` are **short phrases** (often prepositional) inserted into the full-sentence templates `text_summary.{consumption|production|generic}.{higher|lower|similar|neutral_band}` via the `{{referencePeriod}}` placeholder.

In each host language, the **period fragment must read correctly immediately after the comparative** in that sentence — for example, after English “higher than …”, Polish “wyższe niż …”, or German “höher als …”. Translators should adjust word order, case, and prepositions so the **composed** sentence is natural; do not assume English clause order when localizing other languages.

See `specs/903-card-ui-composition/contracts/narrative-i18n.md` and **FR-903-NI** / **FR-905-M** in the domain specs.
