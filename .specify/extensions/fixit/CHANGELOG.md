# Changelog

All notable changes to this extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-30

### Added

- Initial release of the Fixit extension
- Command: `/speckit.fixit.run <bug description>` — spec-aware post-implementation bug fixing
- Spec-aware fixes: maps bugs to user stories, acceptance criteria, and functional requirements before fixing code
- Progressive disclosure: loads only the spec artifacts and source files relevant to the described bug
- Tiered file search: searches task-referenced files first, then broader project if needed
- Escalation guardrails: scope warning (4+ files), spec-conflict warning, constitution MUST hard-block
- Inline summary output with bug description, related spec, files changed, and explanation
- Stateless iterative debugging loop — each invocation is independent

### Requirements

- Spec Kit: >=0.1.0
