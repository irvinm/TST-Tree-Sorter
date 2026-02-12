# Feature Specification: TST Tree Sorter

**Feature Branch**: `001-tree-tab-sorter`  
**Created**: Saturday, February 7, 2026  
**Status**: Draft  
**Input**: User description: "Create a firefox addon that integrates with 'Tree Style Tab' so that it adds a right-click menu option to the TST sidebar to 'Sort tree by title', 'Sort tree by URL'. The name of the addon will be 'TST Tree Sorter'"

## Clarifications

### Session 2026-02-07
- Q: Should sorting be recursive or only immediate children? → A: Provide both options as separate menu items.
- Q: Should sort always be ascending, or provide options for descending? → A: Provide both ascending and descending as separate options.
- Q: How should pinned tabs be handled during sorting? → A: Pinned tabs always remain at the top and are not rearranged.
- Q: What specific logic should be used for URL sorting? → A: Sort by Hostname first, then by Path.
- Q: What is the performance target for large tab trees? → A: 1000 tabs should be sorted in under 1 second.
- Q: How should the sort options be organized in the context menu? → A: Use hierarchical sub-menus under a "Sort Tree" parent menu.
- Q: Should there be visual feedback after sorting? → A: Show a toast notification after any sort is completed.
- Q: How should the sidebar behave if the active tab moves during sorting? → A: Automatically scroll to ensure the active tab remains visible.
- Q: Should unloaded/discarded tabs be included in the sort? → A: Yes, sort both loaded and unloaded tabs using their metadata.
- Q: How to handle manual tab moves during a sort operation? → A: The sort operation takes precedence and overwrites manual moves.
- Q: Should there be a confirmation for sorting large numbers of tabs? → A: Show a confirmation dialog for trees >50 tabs, with an option to disable the warning.
- Q: How should recursive sorting handle mixed nesting depths? → A: Recursively sort every sub-level of children under the target tab.
- Q: How should the global "Global Sort" option behave? → A: Rearrange only the top-level (root) tabs; sub-trees stay intact relative to their parents.
- Q: How should duplicate URLs be handled? → A: Use the tab Title as a secondary sort key to break ties.
- Q: How should TST "Group Tabs" be handled? → A: Treat group tabs as regular tabs for sorting by Title.
- Q: How should titles in different languages or with special characters be sorted? → A: Use locale-aware sorting (Intl.Collator) based on the browser's language.
- Q: How should the system handle and notify users of sorting errors? → A: Show a distinct, persistent error toast explaining the failure.
- Q: How should the system handle multiple selected tabs? → A: Run the sort operation on the children of every currently selected tab.
- Q: Should any other sort criteria be added beyond Title and URL? → A: Yes, add "Sort by Domain" and "Sort by Last Accessed" (Time).
- Q: How to handle ties when sorting by "Last Accessed"? → A: Use the tab Title as a secondary sort key to break ties.
- Q: How to handle ties when sorting by "Domain"? → A: Use the tab URL as a secondary sort key to break ties.
- Q: Where should "Last Accessed" data come from? → A: Use internal Firefox Tab API data.
- Q: How should sub-domains be handled in "Sort by Domain"? → A: Default to Base Domain grouping, but provide an option for Strict sub-domain sorting.
- Q: What should be the duration of the toast notification? → A: Default to 3 seconds, but provide an option for the user to customize this duration.
- Q: What is the default order for "Last Accessed" sorting? → A: Most recently used tabs at the top (Descending by time).
- Q: Should the collapsed/expanded state of trees be maintained after sorting? → A: Yes, maintain the current state for all tabs.
- Q: How should TLDs (e.g., .com, .net) be handled in "Sort by Domain"? → A: Include the TLD as part of the domain for sorting.
- Q: How to handle new tabs opened during a sort operation? → A: The sort applies only to the tabs existing at initiation.
- Q: Where should user settings and preferences be stored? → A: Use browser.storage.sync for synchronization across Firefox instances.
- Q: How should the toast notification be styled? → A: Match the native Tree Style Tab and Firefox sidebar styling.
- Q: How should tab audio and mute states be handled during sorting? → A: Explicitly preserve all audio and mute states during reordering.
- Q: Should URL fragments (#section) be included in "Sort by URL"? → A: Yes, include the full URL including the fragment.
- Q: Should the addon have a toolbar icon? → A: Yes, provide a toolbar icon that opens a settings popup.
- Q: Will the addon support multiple languages in the initial version? → A: No, the UI will be English-only.
- Q: Can the toast notification be manually dismissed? → A: Yes, users can click to dismiss it immediately.
- Q: Where can settings be accessed? → A: Through both a toolbar popup and the standard Firefox Add-on Options page.
- Q: Where should tabs without domains be placed? → A: Default to bottom, with an option to place at the top.
- Q: Should sorting affect tabs in other windows? → A: No, sorting only affects tabs in the current window.
- Q: Should there be keyboard shortcuts for sorting? → A: Define commands that users can manually map to shortcuts in Firefox settings.
- Q: How to handle overlapping tab selections (e.g., parent and child both selected)? → A: Use top-down deduplication; only sort children of the highest-level selected tab in the branch.
- Q: What is the default order for "Sort by Last Accessed"? → A: Recency-based (Newest first).
- Q: What permissions should the extension request? → A: Minimal permissions (tabs, storage, menus).
- Q: Should the tab selection be maintained after a sort? → A: Clear all selections and focus the active tab.
- Q: Should URL sorting include query parameters? → A: Yes, use the full path including parameters.
- Q: How should root-level sorting behave? → A: Only rearrange the immediate top-level tabs in the sidebar.
- Q: How should the large tree confirmation dialog be implemented? → A: Use a custom popup window with themed styling and a "Don't show again" checkbox.
- Q: How long should error notifications stay visible? → A: Auto-dismiss after 5-10 seconds.
- Q: How should sort direction be selected in the menu? → A: Use individual menu items for Ascending/Descending.
- Q: Should authentication credentials be included in URL sorting? → A: Yes, use the full URL including any credentials.
- Q: Should the "Global Sort" operation require a confirmation? → A: Yes, always confirm for "Global Sort", with an option to disable this dialog.

### Session 2026-02-10
- Q: What should happen if the user triggers a second sort while the first is in progress? → A: Block the second sort until the first completes.
- Q: Which specific keyboard shortcut commands should be registered (FR-019)? → A: 4 commands — one per criterion (Title, URL, Domain, Last Accessed), ascending only.
- Q: Does the >50 tab confirmation threshold count immediate children or recursive descendants? → A: Count immediate children only. For Global Sort, count root-level tabs.
- Q: How should scroll-to-active (FR-010) be implemented? → A: Use TST's `scroll` API as the primary method, with fallback to `browser.tabs.update({active: true})`.
- Q: Should the error toast duration (5–10s range) be a fixed value or configurable? → A: Hard-coded to 7 seconds.
- Q: How should `about:`, `moz-extension://`, `data:`, and other non-HTTP(S) URLs be handled for domain sorting? → A: All non-HTTP(S) schemes are treated as "no domain" and grouped with `file:///` URLs.
- Q: Should `google.co.uk` and `google.com` be treated as the same or different base domains? → A: Different domains. Use PSL (Public Suffix List) for correct base domain extraction.
- Q: How should TST version incompatibility be handled? → A: Show a "please update Tree Style Tab" error toast.
- Q: If a sort partially fails (e.g., tabs closed mid-sort), should it keep partial results or rollback? → A: Keep successfully sorted tabs and show a partial-success warning.
- Q: What contrast standard should FR-022's "contrast-aware fallbacks" meet? → A: Simple light/dark heuristic — light icon on dark themes, dark icon on light themes.
- Q: Should FR-009 toast styling use TST's internal CSS variables or a standalone approach? → A: Standalone dark/light mode using `prefers-color-scheme` and Firefox theme color detection.
- Q: What should keyboard shortcuts do when the active tab has no children (leaf tab)? → A: Show a brief toast "No children to sort."
- Q: Should keyboard shortcuts trigger recursive or immediate-only sorts? → A: Immediate children only.
- Q: How should Global Sort be triggered in the context menu? → A: Always include "Sort All Top-Level" as a visible option in every tab's context menu.
- Q: What should happen when Sort tree is used on a tab with zero children? → A: Show a "Nothing to sort" toast.
- Q: Should all sort criteria guarantee stable ordering for equal items? → A: Yes, all criteria must use a stable sort algorithm.
- Q: Where should tabs with lastAccessed of 0 or undefined be placed? → A: At the bottom, treated as the oldest (epoch time).
- Q: Is window.confirm from the MV2 background page acceptable for confirmation dialogs? → A: Use a custom popup window instead. This provides better UX (themed styling, "Don't show again" checkbox) and is forward-compatible with MV3 service workers.
- Q: How should browser.storage.sync conflicts be resolved across Firefox instances? → A: Last-write-wins (native browser behavior).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sort Subtree by Title (Priority: P1)

As a user with many tabs organized in a tree, I want to sort the children of a specific tab alphabetically by their titles so I can quickly locate specific pages.

**Why this priority**: Core functionality that solves the primary user pain point of disorganized tab trees.

**Independent Test**: Can be tested by creating a parent tab with several unsorted child tabs, right-clicking the parent, selecting "Sort tree by title", and verifying the children are rearranged A-Z.

**Acceptance Scenarios**:

1. **Given** a parent tab has child tabs "Beta", "Alpha", and "Gamma" in that order, **When** the user selects "Sort tree by title" from the context menu of the parent tab, **Then** the child tabs should be rearranged to "Alpha", "Beta", "Gamma".
2. **Given** the child tabs have identical titles, **When** the user selects "Sort tree by title", **Then** their relative order should remain stable.

---

### User Story 2 - Sort Subtree by URL (Priority: P1)

As a user researching a topic across multiple sites, I want to sort child tabs by their URLs to group tabs from the same domain or path together.

**Why this priority**: Critical for organizing tabs when titles are not descriptive or when grouping by source is preferred.

**Independent Test**: Can be tested by right-clicking a parent tab with children from different domains and selecting "Sort tree by URL", verifying the tabs are ordered by their URL strings.

**Acceptance Scenarios**:

1. **Given** a parent tab has child tabs with URLs `example.com/z`, `abc.com/a`, and `example.com/b`, **When** the user selects "Sort tree by URL", **Then** the tabs should be rearranged to `abc.com/a`, `example.com/b`, `example.com/z`.

---

### User Story 3 - Sort Top-Level Tabs (Priority: P2)

As a user with many top-level trees, I want to sort all top-level tabs by title or URL to organize my entire sidebar.

**Why this priority**: High value for overall sidebar organization, though slightly less common than sorting specific subtrees.

**Independent Test**: Can be tested by right-clicking in the empty area of the TST sidebar (if supported) or selecting a "Sort all" option, and verifying all root-level tabs are rearranged.

**Acceptance Scenarios**:

1. **Given** multiple top-level tab trees, **When** the user selects a global sort option, **Then** all top-level tabs are rearranged while maintaining their respective subtrees.

---

### User Story 4 - Sort by Domain & Last Accessed (Priority: P2)

As a power user with many tabs across different sites, I want to sort tabs by their domain to group related sites together, and by last-accessed time to find recently or rarely used tabs.

**Why this priority**: Extends core sorting with advanced criteria for power users who need fine-grained organization beyond title and URL.

**Independent Test**: Can be tested by right-clicking a parent tab, selecting "Sort Tree > By Domain > Ascending", and verifying tabs are grouped by base domain. For Last Accessed, selecting "Sort Tree > By Last Accessed > Descending" and verifying most recently accessed tabs appear first.

**Acceptance Scenarios**:

1. **Given** a parent tab has children at `news.google.com`, `maps.google.com`, and `github.com`, **When** the user selects "Sort by Domain (Base)" ascending, **Then** tabs should be grouped as `github.com`, then `google.com` tabs together.
2. **Given** a parent tab has children at `news.google.com` and `maps.google.com`, **When** strict sub-domain sorting is enabled and the user selects "Sort by Domain" ascending, **Then** `maps.google.com` should appear before `news.google.com`.
3. **Given** a parent tab has child tabs accessed at 10:00, 10:05, and 9:50, **When** the user selects "Sort by Last Accessed" descending, **Then** the tabs should appear in order: 10:05, 10:00, 9:50.
4. **Given** two child tabs have the same domain, **When** the user sorts by Domain, **Then** their relative order should be determined by their full URL as a secondary key.
5. **Given** a child tab has no domain (e.g., `file:///local/path`), **When** the user sorts by Domain, **Then** the domainless tab should appear at the bottom by default.

---

### Edge Cases

- **Mixed Nesting**: When recursive sorting is selected, the system MUST sort all tabs at every depth level of the subtree within their respective parents. Non-recursive sorting MUST only affect immediate children.
- **Pinned Tabs**: Pinned tabs MUST always remain at the top of their respective group and MUST be excluded from any sort operations.
- **TST Integration Failure**: If the TST API is unavailable or an error occurs during sorting, the system MUST display a distinct, persistent error toast notification to the user. This notification MUST auto-dismiss after exactly 7 seconds and MUST be manually dismissable.
- **TST Version Incompatibility**: If TST is installed but returns unexpected responses (e.g., API format changes), the system MUST display an error toast advising the user to update Tree Style Tab.
- **Partial Sort Failure**: If a sort operation fails partway through (e.g., tabs closed mid-sort), the system MUST keep the successfully sorted tabs in place and display a partial-success warning (e.g., "Sorted 40 of 50 tabs. 10 tabs were unavailable.").
- **Concurrent Sort Operations**: If the user triggers a sort while another sort is in progress, the system MUST block the second sort until the first completes.
- **Unloaded Tabs**: Discarded (unloaded) tabs MUST be sorted identically to loaded tabs using their metadata (Title/URL) without triggering a reload.
- **Concurrent Moves**: Manual tab movements during a sort operation MUST be overwritten by the final sort result to maintain the integrity of the calculated order.
- **New Tab Creation**: Tabs opened while a sort operation is in progress MUST be ignored by that operation; the sort only applies to the snapshot of tabs present at the moment of initiation.
- **Group Tabs**: Tree Style Tab "Group Tabs" MUST be treated as regular tabs and sorted alphabetically by their title.
- **Non-HTTP(S) URLs**: All non-HTTP(S) URL schemes (`about:`, `moz-extension://`, `data:`, `blob:`, `file:///`, etc.) MUST be treated as having no domain for "Sort by Domain" and grouped according to the `emptyDomainTop` setting.
- **Empty Tree (No Children)**: If Sort tree is initiated on a tab with zero children, the system MUST show a toast "Nothing to sort" and take no further action.
- **Leaf Tab via Keyboard Shortcut**: If a keyboard shortcut triggers a sort on the active tab and that tab has no children, the system MUST show a toast "No children to sort."
- **Never-Accessed Tabs**: Tabs with a `lastAccessed` value of 0 or undefined MUST be treated as the oldest tabs (epoch time) and placed at the bottom when sorting by Last Accessed in descending order.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST register a hierarchical "Sort Tree" context menu with sub-menus for sorting options within the Tree Style Tab sidebar. A "Sort All Top-Level" option MUST always be visible in the context menu regardless of which tab is right-clicked.
- **FR-002**: System MUST be able to identify the children of all currently selected tabs in the TST sidebar and apply the sort operation to each group. In cases of overlapping selections (e.g., both a parent and its child are selected), the system MUST perform top-down deduplication and only initiate the sort from the highest-level selected tab in that branch.
- **FR-003**: System MUST implement a case-insensitive, locale-aware alphabetical sort for tab titles using Intl.Collator. All sort operations (Title, URL, Domain, Last Accessed) MUST use a stable sort algorithm to preserve the relative order of items with equal sort keys.
- **FR-004**: System MUST implement a URL-based sort that prioritizes Hostname followed by the full Path (including credentials, query parameters, and fragments), using the tab Title as a secondary sort key to resolve ties.
- **FR-005**: System MUST maintain the parent-child relationships for all tabs; only the order of the children within their parent should change.
- **FR-006**: System MUST support sorting of the top-level (root) tabs in the current window's sidebar; in this mode, only immediate top-level tabs MUST be rearranged. Sub-trees MUST remain attached to their parents and their internal order MUST be preserved unless recursive sorting is explicitly selected. Sorting MUST NOT move tabs between different Firefox windows.
- **FR-007**: System MUST provide separate menu options for sorting only immediate children and for sorting the entire subtree recursively.
- **FR-008**: System MUST provide separate menu options for both ascending and descending sort directions within the hierarchical sub-menus.
- **FR-009**: System MUST display a non-intrusive toast notification via `browser.notifications` API to the user upon successful completion of any sort operation. This notification MUST have a default duration of 3 seconds, MUST be user-configurable, and MUST be manually dismissable. The `browser.notifications` API is chosen as the pragmatic approach since injecting custom CSS into TST's sidebar is not possible from a separate extension.
- **FR-010**: System MUST ensure the currently active tab remains visible in the sidebar by using TST's `scroll` API to scroll to the active tab's new position after sorting. If the TST scroll API is unavailable, the system MUST fall back to `browser.tabs.update({active: true})` as a best-effort alternative.
- **FR-011**: System MUST display a confirmation dialog via a custom popup window (with themed styling and "Don't show again" checkbox) before sorting when the count of immediate children to be sorted exceeds 50 tabs, OR when performing a "Global Sort" operation (counted by root-level tabs). This approach provides better UX than `window.confirm()` and is forward-compatible with MV3 service workers.
- **FR-012**: System MUST provide a mechanism (e.g., a "Don't show this again" checkbox or settings entry) to disable the large tree sorting confirmation. All user preferences MUST be persisted using `browser.storage.sync` with last-write-wins conflict resolution.
- **FR-013**: System MUST implement a "Sort by Domain" option that defaults to grouping by PSL-based base domain including the TLD (e.g., `google.com` and `google.co.uk` are treated as different domains), while providing a toggle to switch to strict sub-domain sorting. All non-HTTP(S) URL schemes (`about:`, `data:`, `file:///`, etc.) MUST be treated as having no domain and default to being grouped at the bottom, with a user option to place them at the top. This sort MUST use the tab URL as a secondary sort key to resolve ties.
- **FR-014**: System MUST implement a "Sort by Last Accessed" option based on the tab's internal Firefox `lastAccessed` timestamp. The default sort MUST be recency-based (Newest first), placing the most recently accessed tabs at the top. Tabs with a `lastAccessed` value of 0 or undefined MUST be treated as the oldest and placed at the bottom. This sort MUST use the tab Title as a secondary sort key to resolve ties.
- **FR-015**: System MUST maintain the current collapsed/expanded state of all tab trees after any sorting operation.
- **FR-016**: System MUST ensure that the audio playing and mute states of all tabs are preserved exactly as they were prior to the sorting operation.
- **FR-017**: System MUST provide a toolbar icon that, when clicked, opens a popup for managing addon settings (e.g., confirmation thresholds, toast duration). Settings MUST also be accessible via a standard Firefox Add-on Options page.
- **FR-018**: System UI MUST be hardcoded in English for the initial version.
- **FR-019**: System MUST define exactly 4 WebExtension commands — `sort-tree-title`, `sort-tree-url`, `sort-tree-domain`, `sort-tree-time` — each triggering an ascending, immediate-children-only sort on the active tab's children. If the active tab has no children, a "No children to sort" toast MUST be displayed. Users can map these to custom keyboard shortcuts via Firefox's addon management interface.
- **FR-020**: System MUST only request the minimal set of permissions necessary for core functionality: `tabs`, `storage`, `menus`, `notifications`, and integration with Tree Style Tab.
- **FR-021**: System MUST clear all multi-selections after a sort operation and ensure the currently active tab remains the primary focus.
- **FR-022**: System MUST dynamically adapt the extension icon using a 3-tier color preference: **(1)** If the active Firefox theme specifies an icon or text color (`icons`, `toolbar_text`, `bookmark_text`, `tab_text`, `tab_background_text`, `toolbar_field_text`), use that exact color; **(2)** If no explicit color is set, derive light/dark from toolbar background brightness; **(3)** If no theme data is available, fallback to system preference (Auto/System theme) — checks `prefers-color-scheme`. TST context menu icons MUST use SVG `context-stroke` for native theme matching. UI components (popup, options page) MUST use a standalone dark/light mode based on `prefers-color-scheme` and Firefox theme color detection.

### Key Entities *(include if feature involves data)*

- **Tab**: Represents a Firefox tab within the TST sidebar. Key attributes include Title, URL, Domain, Last Accessed Time, and Tree Hierarchy (Parent/Children).
- **Sort Action**: Represents the user's intent to rearrange tabs based on a specific property (Title/URL/Domain/Time) and target (Subtree/Root).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can initiate a sort operation with exactly 3 clicks from the TST context menu (Sort Tree → criterion → direction). Keyboard shortcuts provide a 1-step alternative for ascending immediate-children sorts.
- **SC-002**: Sorting a tree of 1,000 tabs is completed in under 1 second.
- **SC-003**: 100% of tabs remain present and correctly parented after a sort operation (zero data loss).
- **SC-004**: Sort options are visible only when right-clicking within the Tree Style Tab sidebar.