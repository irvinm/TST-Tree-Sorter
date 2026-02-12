# Implementation Plan: TST Tree Sorter

**Branch**: `001-tree-tab-sorter` | **Date**: Saturday, February 7, 2026 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-tree-tab-sorter/spec.md`  
**Last Updated**: Monday, February 10, 2026 (post-clarification Round 2)

## Summary

Create a Firefox WebExtension that integrates with the Tree Style Tab (TST) API to provide advanced sorting capabilities (Title, URL, Domain, Last Accessed) via the TST sidebar context menu. The addon supports recursive and immediate-only sorting, ascending/descending directions, multi-selection with top-down deduplication, and global top-level sorting. It prioritizes performance (1000 tabs < 1s), locale-aware stable sorting, hierarchy preservation, and robust error handling with 7-second auto-dismissing error toasts.

## Technical Context

**Language/Version**: JavaScript (ES2022+) / WebExtensions API (Manifest V2)  
**Primary Dependencies**: Tree Style Tab (TST) External API, `tldts` (PSL domain extraction)  
**Storage**: `browser.storage.sync` (last-write-wins conflict resolution)  
**Testing**: `web-ext` for integration, Mocha/Chai for unit logic  
**Target Platform**: Firefox (latest stable)  
**Project Type**: single  
**Performance Goals**: Sort 1,000 tabs in under 1 second  
**Constraints**: Hierarchical menu support, TST integration dependency, cross-window isolation, MV2 background page  
**Scale/Scope**: < 5 UI screens (settings popup, options page), high tab volume support

### Key Technical Decisions (from clarifications)

| Decision | Detail | Source |
|----------|--------|--------|
| Stable sort | All criteria use stable sort (JS `Array.sort` is stable) | Session 2026-02-10 |
| Sort locking | Mutex/guard blocks concurrent sorts | Session 2026-02-10 |
| Keyboard shortcuts | 4 commands, ascending-only, immediate children | Session 2026-02-10 |
| Confirmation dialog | Custom popup window (`confirm.html`) with theming + checkbox | Session 2026-02-10 |
| Confirmation threshold | Count immediate children (root-level for Global Sort) | Session 2026-02-10 |
| Error toast duration | All errors: 7 seconds, auto-dismiss | Session 2026-02-10 |
| Scroll-to-active | TST `scroll` API primary, `browser.tabs.update` fallback | Session 2026-02-10 |
| Domain sorting | PSL-based (`google.com` ≠ `google.co.uk`); non-HTTP = domainless | Session 2026-02-10 |
| lastAccessed = 0 | Treated as epoch (oldest), placed at bottom | Session 2026-02-10 |
| Empty tree | Toast "Nothing to sort", no action | Session 2026-02-10 |
| Leaf tab shortcut | Toast "No children to sort" | Session 2026-02-10 |
| Settings sync | Last-write-wins (native `storage.sync` behavior) | Session 2026-02-10 |
| UI theming | Standalone dark/light via `prefers-color-scheme` + 3-tier icon adaptation | Session 2026-02-10 |
| Global Sort trigger | "Sort All Top-Level" always visible in context menu | Session 2026-02-10 |
| TST version mismatch | Show "please update TST" error toast | Session 2026-02-10 |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] I. Integration-First: TST API integration via `lib/tst-api.js`; all tree ops respect TST hierarchy. `scroll` API for active tab visibility. `attach` for tab movement.
- [x] II. Performance-Critical: `Intl.Collator` in `lib/sort-utils.js`; stable sort; targeting <1s for 1,000 tabs (T045). Snapshot-based sorting (T016).
- [x] III. Safety & Integrity: Confirmation popup window for >50 tabs / Global Sort (T040); pinned tab exclusion (T014); 7s error toasts (T015); sort locking (T017); empty-tree guard (T018); snapshot sorting (T016); partial failure handling preserves successful work (T019).
- [x] IV. Test-Driven Development: Unit tests MUST FAIL FIRST for each user story (T021, T026, T030, T034).
- [x] V. Synchronized Preferences: All settings via `browser.storage.sync` with last-write-wins in `lib/storage.js`.
- [x] VI. Adaptive Presentation: 3-tier icon coloring in `theme-handler.js` (T044); CSS fallback in `icon.svg`; dark/light mode for popup, options, confirm dialog via `prefers-color-scheme`.

## Project Structure

### Documentation (this feature)

```text
specs/001-tree-tab-sorter/
├── plan.md              # This file
├── spec.md              # Feature specification (22 FRs, 14 edge cases)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (3 entities)
├── quickstart.md        # Phase 1 output
├── analysis.md          # Consistency analysis report
├── contracts/           # Phase 1 output
│   └── messages.md      # TST + internal message contracts
├── checklists/          # Quality checklists
│   └── requirements.md
└── tasks.md             # Phase 2 output (9 phases, ~40 tasks)
```

### Source Code (repository root)

```text
src/
├── background/          # Background script (main logic, context menus, shortcuts)
│   ├── controller.js    # Sort orchestration, guards, scroll, selection clearing
│   ├── menus.js         # Hierarchical context menu registration
│   ├── shortcuts.js     # WebExtension command handlers (4 commands)
│   └── theme-handler.js # Dynamic icon adaptation (3-tier color preference)
├── popup/               # Settings popup UI
│   ├── popup.html
│   └── popup.js
├── options/             # Add-on Options page
│   ├── options.html
│   └── options.js
├── lib/                 # Core sorting and TST API wrapper
│   ├── tst-api.js       # TST messaging wrapper (get-tree, attach, scroll)
│   ├── sort-utils.js    # Intl.Collator, URL parsing, PSL domain extraction
│   ├── sort-logic.js    # Sort implementations (Title, URL, Domain, Time)
│   ├── storage.js       # browser.storage.sync wrapper
│   └── ui-utils.js      # Toast notifications (success 3s, error 7s)
└── icons/               # Extension icon (SVG with CSS dark/light fallback)

tests/
├── unit/                # Sorting logic tests (MUST FAIL FIRST)
│   ├── sort-title.test.js
│   ├── sort-url.test.js
│   ├── sort-root.test.js
│   ├── sort-advanced.test.js
│   └── sort-pinned.test.js
├── integration/         # web-ext integration scenarios
│   ├── unloaded-tabs.test.js
│   └── performance.test.js
└── test-setup.js        # Mocha/Chai + WebExtensions API mocks
```

**Structure Decision**: Single project structure optimized for Firefox WebExtensions. All source in `src/`, all tests in `tests/`, supporting docs in `specs/001-tree-tab-sorter/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Custom Toast | `browser.notifications` API — pragmatic choice, cross-context reliable | Can't inject CSS into TST sidebar from separate extension |
| TST API Integration | Preserves tree hierarchy during sort | `browser.tabs.move` flattens trees |
| Permissions | Strictly limited to necessary APIs: `tabs`, `storage`, `menus`, `notifications` (FR-020) | Over-requesting permissions is a security risk and bad practice |
| `tldts` dependency | Correct PSL-based domain extraction | Manual TLD parsing is error-prone for edge cases like `.co.uk` |
| Sort mutex | Spec requires blocking concurrent sorts | Without it, concurrent sorts corrupt tab order |
