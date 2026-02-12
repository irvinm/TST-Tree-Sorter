# Research: TST Tree Sorter Implementation

## Decision: Context Menu Integration
- **Choice**: Use standard `browser.contextMenus` API with `contexts: ["tab"]`.
- **Rationale**: Tree Style Tab (TST) automatically imports items from the native Firefox tab context menu into its sidebar menu. Hierarchical sub-menus are supported via the `parentId` property in `browser.contextMenus.create`.
- **Alternatives Considered**: Using TST's internal `register-self` message API to add menu items. Rejected because the standard `contextMenus` API is more stable, simpler, and provides native hierarchical support that TST respects.
- **Clarification**: "Sort All Top-Level" must always be visible in the context menu regardless of which tab is right-clicked (Session 2026-02-10).

## Decision: Sorting Logic & Performance
- **Choice**: Use a persistent `Intl.Collator` instance for all string comparisons (Title, URL, Domain). All sort operations MUST use a stable sort algorithm.
- **Rationale**: `Intl.Collator` is locale-aware and significantly more performant than `String.prototype.localeCompare` when sorting large datasets (up to 1000 tabs). Reusing a single instance avoids the overhead of object creation during sort loops. JavaScript's `Array.prototype.sort()` is stable in all modern engines (spec-guaranteed since ES2019).
- **Alternatives Considered**: Raw string comparison (`a < b`). Rejected because it is not locale-aware and fails to correctly handle accents or non-Latin scripts as required by the specification.

## Decision: Data Retrieval & Tab Hierarchy
- **Choice**: Combine standard `browser.tabs` API with TST's internal messaging.
- **Rationale**: `browser.tabs.Tab` provides `title`, `url`, and `lastAccessed`. TST's internal API (accessible via `browser.runtime.sendMessage` to TST's ID) is necessary to retrieve the hierarchy (`parentId` and `indent` depth) and to perform the actual tab movement/re-parenting.
- **Alternatives Considered**: Relying solely on `browser.tabs.move`. Rejected because `tabs.move` does not preserve TST's tree structure (parent-child relationships) without specific TST-aware logic.
- **Clarification**: Tabs with `lastAccessed` of 0 or undefined are treated as epoch (oldest), placed at bottom. Snapshot-based sorting captures tab state at initiation to handle concurrent moves and new tabs (Session 2026-02-10).

## Decision: Settings & Persistence
- **Choice**: Use `browser.storage.sync` with last-write-wins conflict resolution.
- **Rationale**: `storage.sync` allows user preferences (confirmation suppression, toast duration, sorting defaults) to persist across multiple Firefox instances. The 100KB limit is more than sufficient for the required settings. Conflict resolution uses native last-write-wins behavior — no custom merge logic needed.
- **Alternatives Considered**: `browser.storage.local`. Rejected because it lacks synchronization features that improve user experience for multi-device users.

## Decision: Toast Notification UI
- **Choice**: `browser.notifications` API for all toast messages.
- **Rationale**: The spec originally required "styled to match TST/Firefox aesthetic" via custom CSS. However, since extensions cannot inject CSS into other extensions' sidebar pages, `browser.notifications` is the pragmatic choice. It provides reliable, cross-context notifications without complex workarounds.
- **Durations**: Success toast: 3 seconds (user-configurable). Error toast: 7 seconds (hard-coded). Both are manually dismissable by clicking the notification.
- **Alternatives Considered**: Custom HTML/CSS toast. Rejected because injecting into TST's sidebar is impossible from a separate extension, and a floating popup window for toast messages would be intrusive.

## Decision: Confirmation Dialogs
- **Choice**: Custom popup window (`confirm.html`/`confirm.js`) with themed styling and "Don't show again" checkbox.
- **Rationale**: Provides better UX than `window.confirm()` — themed dark/light styling, "Don't show again" checkbox built into the dialog, and forward-compatible with MV3 service workers (where `window.confirm()` is unavailable).
- **Threshold**: Triggers when immediate children count exceeds 50 (or root-level tabs for Global Sort). Both have independent suppression toggles (`disableConfirmation`, `disableGlobalConfirmation`).
- **Alternatives Considered**: `window.confirm()` from MV2 background page. Rejected because it lacks theming, has no "Don't show again" option, and won't work in MV3.

## Decision: Domain Extraction
- **Choice**: Use `tldts` library for PSL-based base domain extraction.
- **Rationale**: Correctly handles multi-part TLDs (e.g., `.co.uk`, `.com.au`). `google.com` and `google.co.uk` are treated as different domains. Non-HTTP(S) URL schemes (`about:`, `moz-extension://`, `data:`, `blob:`, `file:///`) are treated as domainless and grouped according to the `emptyDomainTop` setting.
- **Alternatives Considered**: Manual regex-based TLD parsing. Rejected because it's error-prone for edge cases and requires maintaining a TLD list.

## Decision: Concurrent Sort Handling
- **Choice**: Mutex/guard pattern to block re-entrant sort calls.
- **Rationale**: The spec requires the system to block a second sort until the first completes. A simple boolean flag (`isSorting`) in `controller.js` is sufficient given the single-threaded nature of JavaScript. The flag is set before the sort starts and cleared after completion (even on error).
- **Alternatives Considered**: Queueing subsequent sorts. Rejected because it adds complexity and the use case for rapid successive sorts is minimal.
