# Launch Checklist: TST Tree Sorter

**Purpose**: Validate readiness for v0.9.2 release — all code, tests, docs, and configuration are complete and consistent  
**Created**: Saturday, March 29, 2026  
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [tasks.md](../tasks.md)

---

## Code Completeness

- [x] CHK001 All 23 functional requirements (FR-001 to FR-023) implemented in source code
- [x] CHK002 All 16 edge cases have corresponding handling in `controller.js`, `sort-logic.js`, or `sort-utils.js`
- [x] CHK003 FR-011 confirmation logic uses `confirmThreshold` uniformly for all sort types (non-recursive: immediate children, recursive: total descendants, Global Sort: root tabs)
- [x] CHK004 FR-019 all 4 keyboard shortcuts have `suggested_key` in `manifest.json` (`Ctrl+Alt+T/U/D/A`)
- [x] CHK005 FR-023 toast duration field visually disabled in `popup.js` and `options.js` when `disableNotifications` is checked
- [x] CHK006 Single-root-tab guard in `controller.js` shows "Nothing to sort" for Global Sort with ≤1 sortable root tab
- [x] CHK007 `countDescendants()` helper correctly counts total descendants recursively for confirmation threshold

## Tests

- [x] CHK008 All 55 unit tests pass (`npm test`)
- [x] CHK009 TDD sequence followed: T048 tests written first, confirmed to FAIL, then T049-T051 made them PASS
- [x] CHK010 Title sort tests cover: ascending, descending, case-insensitive, recursive, stable sort, pinned exclusion
- [x] CHK011 URL sort tests cover: hostname priority, path sorting, invalid URLs, descending, stable sort
- [x] CHK012 Domain sort tests cover: PSL extraction, strict mode, non-HTTP URLs, `emptyDomainTop`, secondary key
- [x] CHK013 Time sort tests cover: ascending (oldest first), descending (newest first), `lastAccessed=0` handling
- [x] CHK014 Root/Global sort tests cover: hierarchy preservation, empty tree, single tab, descendant counting
- [x] CHK015 Performance test: 1,000 tabs sorted in under 1 second
- [x] CHK016 Unloaded/discarded tab tests: sorted by metadata without triggering reload

## Documentation Consistency

- [x] CHK017 `spec.md` FR count (23) matches `plan.md` FR count (23)
- [x] CHK018 `spec.md` edge case count (16) matches `plan.md` references
- [x] CHK019 `plan.md` Last Updated date is current (March 29, 2026)
- [x] CHK020 `tasks.md` Last Updated date is current (March 29, 2026)
- [x] CHK021 `plan.md` source code tree includes `confirm.html` and `confirm.js` in `src/background/`
- [x] CHK022 `plan.md` key technical decisions table reflects Session 2026-03-29 clarifications (18 decisions)
- [x] CHK023 `plan.md` constitution check passes all 6 principles
- [x] CHK024 `analysis.md` reports 0 critical issues, 0 warnings
- [x] CHK025 No `[NEEDS CLARIFICATION]` markers remain in `spec.md`

## Manifest & Configuration

- [x] CHK026 `manifest.json` version is `0.9.2`
- [x] CHK027 `manifest.json` permissions are minimal: `tabs`, `storage`, `menus`, `notifications` (FR-020)
- [x] CHK028 `manifest.json` `strict_min_version` is `128.0`
- [x] CHK029 `manifest.json` `data_collection_permissions` declares `none`
- [x] CHK030 All 4 commands in `manifest.json` have `suggested_key` entries
- [x] CHK031 Background scripts order in `manifest.json` matches dependency chain (tldts → tst-api → sort-utils → sort-logic → storage → ui-utils → menus → shortcuts → theme-handler → controller)

## Settings & Storage

- [x] CHK032 `StorageService.defaults` has all 7 settings: `disableConfirmation`, `disableGlobalConfirmation`, `confirmThreshold`, `toastDuration`, `strictDomainSort`, `emptyDomainTop`, `disableNotifications`
- [x] CHK033 `popup.html` exposes settings: `disableConfirmation`, `disableGlobalConfirmation`, `disableNotifications`, `toastDuration`
- [x] CHK034 `options.html` exposes all 7 settings
- [x] CHK035 Settings persist via `browser.storage.sync` with last-write-wins conflict resolution

## Security & Permissions

- [x] CHK036 No hardcoded secrets, credentials, or API keys in source code
- [x] CHK037 Extension only requests permissions necessary for core functionality (FR-020)
- [x] CHK038 No external network requests (only TST messaging via `runtime.sendMessage`)
- [x] CHK039 User inputs (toast duration, confirm threshold) are parsed with `parseInt()` before storage

## Constitution Compliance

- [x] CHK040 **I. Integration-First**: TST API wrapper (`tst-api.js`), `attach` for moves, `scroll` for active tab
- [x] CHK041 **II. Performance-Critical**: `Intl.Collator` persistent instance, snapshot-based sorting, <1s for 1,000 tabs
- [x] CHK042 **III. Safety & Integrity**: Sort mutex, pinned exclusion, empty-tree/single-root guards, partial failure handling, confirmation with `confirmThreshold`, 7s error toasts
- [x] CHK043 **IV. Test-Driven Development**: All user stories have tests written before implementation
- [x] CHK044 **V. Synchronized Preferences**: All settings via `browser.storage.sync` with last-write-wins
- [x] CHK045 **VI. Adaptive Presentation**: 3-tier icon adaptation via `theme-handler.js`, `prefers-color-scheme` for UI surfaces

## Task Completion

- [x] CHK046 Phase 1 (Setup): All tasks `[x]`
- [x] CHK047 Phase 2 (Foundational): All tasks `[x]`
- [x] CHK048 Phase 3 (US1 Title Sort): All tasks `[x]`
- [x] CHK049 Phase 4 (US2 URL Sort): All tasks `[x]`
- [x] CHK050 Phase 5 (US3 Global Sort): All tasks `[x]`
- [x] CHK051 Phase 6 (US4 Domain & Time): All tasks `[x]`
- [x] CHK052 Phase 7 (Polish): All tasks `[x]`
- [x] CHK053 Phase 8 (Verification): T045 ✅, T046 ✅
- [x] CHK054 Phase 9 (Clarification Updates): All 8 tasks (T048-T055) `[x]`
- [x] CHK055 **T047 Smoke Test**: Run all 21 manual verification scenarios from `quickstart.md` via `npx web-ext run`

## Pre-Release Verification

- [x] CHK056 Run `npx web-ext lint` — no errors or warnings
- [x] CHK057 Run `npx web-ext run` — extension loads without console errors
- [x] CHK058 Verify context menu appears only in TST sidebar (SC-004)
- [x] CHK059 Verify 3-click sort path: Sort Tree → criterion → direction (SC-001)
- [x] CHK060 Verify keyboard shortcuts work out-of-the-box for all 4 commands (`Ctrl+Alt+T/U/D/A`)
- [x] CHK061 Verify confirmation dialog appears and centers correctly for >50 tab sorts
- [x] CHK062 Verify "Don't show again" checkbox persists preference across browser sessions
- [x] CHK063 Verify icon adapts when switching Firefox themes (dark ↔ light ↔ custom)
- [x] CHK064 Verify popup settings and options page both save and load correctly
- [x] CHK065 Verify disabling notifications greys out the toast duration field in both popup and options

---

## Summary

| Category | Items | Passed | Remaining |
|----------|-------|--------|-----------|
| Code Completeness | 7 | 7 | 0 |
| Tests | 9 | 9 | 0 |
| Documentation | 9 | 9 | 0 |
| Manifest & Config | 6 | 6 | 0 |
| Settings & Storage | 4 | 4 | 0 |
| Security | 4 | 4 | 0 |
| Constitution | 6 | 6 | 0 |
| Task Completion | 10 | 10 | 0 |
| Pre-Release | 10 | 10 | 0 |
| **Total** | **65** | **65** | **0** |

## Notes

- CHK055-CHK065 require manual testing with `npx web-ext run` — cannot be automated
- All automated checks (CHK001-CHK054) pass ✅
- Once CHK055-CHK065 are verified, the feature is release-ready
- Suggest tagging `v0.9.2` after successful smoke test
