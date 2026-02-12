<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- List of modified principles:
  - III. Safety & Integrity → expanded to include graceful degradation and partial failure handling
  - [NEW] VI. Adaptive Presentation → icon and UI theme adaptation requirements
- Modified sections:
  - Technical Standards → added API naming convention and SVG icon strategy
  - Development Workflow → added cross-document consistency and README sync requirements
- Removed sections: None
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ⚠ pending: .specify/templates/commands/*.md (Directory not found)
- Follow-up TODOs: None
-->

# TST Tree Sorter Constitution

## Core Principles

### I. Integration-First
The addon MUST integrate seamlessly with Tree Style Tab (TST) via its external API. All tree manipulations MUST respect TST's hierarchy and state. This ensures that the user's primary tab organization tool remains the source of truth for hierarchy.

### II. Performance-Critical
Sorting operations MUST be performant, targeting sub-second execution for up to 1,000 tabs. Locale-aware sorting using `Intl.Collator` MUST be used for accurate and fast string comparison across different user languages.

### III. Safety & Integrity
High-impact operations (e.g., sorting > 50 tabs or global sorts) MUST require user confirmation. Sorting MUST NEVER result in data loss or broken tree structures. Subtrees MUST be moved intact using `followChildren: true` and appropriate state preservation. Partial failures MUST preserve successfully completed work and display informative warning toasts. Error conditions (TST unavailable, version mismatch, permission denied) MUST produce descriptive error toasts with 7-second auto-dismiss.

### IV. Test-Driven Development (NON-NEGOTIABLE)
Every feature MUST start with unit tests that fail before implementation. The Red-Green-Refactor cycle is strictly enforced to ensure logic correctness before integration with the browser environment.

### V. Synchronized Preferences
All user settings MUST be stored using `browser.storage.sync` to ensure a consistent experience across all Firefox instances where the user is logged in.

### VI. Adaptive Presentation
The extension MUST adapt its visual presentation to the user's active Firefox theme and OS preferences. Toolbar icon coloring MUST follow a 3-tier preference: (1) exact theme color, (2) toolbar brightness heuristic, (3) system `prefers-color-scheme`. Static icons (context menus) MUST include CSS fallback colors for light/dark modes. All UI surfaces (popup, options, confirmation dialogs) MUST support both light and dark modes.

## Technical Standards

Use ES2022+ JavaScript. All asynchronous operations MUST use `async/await` for readability and error handling. Permissions MUST be minimal, requesting only `tabs`, `storage`, `menus`, and `notifications` to maintain user trust and security.

Use canonical Firefox API names (e.g., `menus` not the `contextMenus` alias) across all code and documentation to prevent cross-document inconsistencies.

SVG icons MUST include CSS fallback stroke colors with `@media (prefers-color-scheme)` support. JS-injected theming MUST use inline `style` attributes to override CSS class specificity.

## Development Workflow

All changes MUST be documented in specifications before implementation begins. Implementation follows a strict task-based execution from `/tasks.md`, where each task is atomic and independently testable.

Cross-document consistency analysis (`/speckit.analyze`) MUST pass with zero issues before release. `README.md` MUST reflect the current feature set and remain consistent with spec, plan, and task documents.

## Governance

Amendments to this constitution require a MINOR or MAJOR version bump. Pull Requests must pass linting and unit tests before they can be merged. Complexity in implementation MUST be justified against these principles.

**Version**: 1.1.0 | **Ratified**: 2026-02-07 | **Last Amended**: 2026-02-11