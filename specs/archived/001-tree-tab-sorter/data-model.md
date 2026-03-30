# Data Model: TST Tree Sorter

## Entities

### Tab
Represents a Firefox tab with associated Tree Style Tab metadata.

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique Firefox tab identifier. |
| `windowId` | number | Window identifier. |
| `title` | string | Tab title (locale-aware). |
| `url` | string | Full URL (includes credentials, params, fragments). |
| `hostname` | string | Parsed base domain + TLD (e.g., "google.com") for domain sorting. |
| `lastAccessed` | number | Timestamp of last user activity. |
| `parentId` | number | TST parent tab ID (or -1 for root). |
| `indent` | number | TST nesting level. |
| `isPinned` | boolean | Whether the tab is pinned (fixed at top). |
| `isGroup` | boolean | Whether the tab is a TST "Group Tab". |
| `isDiscarded` | boolean | Whether the tab is unloaded from memory. |
| `audible` | boolean | Whether the tab is currently playing audio. |
| `mutedInfo` | object | Mute state and reason (`{muted: boolean, reason: string}`). |

### Settings
User preferences persisted via `browser.storage.sync`.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `confirmThreshold` | number | 50 | Tab count threshold for confirmation dialog. |
| `disableConfirmation` | boolean | false | Suppression toggle for warnings. |
| `disableNotifications` | boolean | false | Suppression toggle for success toast notifications. |
| `toastDuration` | number | 3000 | Milliseconds toast remains visible. |
| `strictDomainSort` | boolean | false | Toggle for strict sub-domain grouping. |
| `emptyDomainTop` | boolean | false | Whether tabs without domains appear at top. |
| `disableGlobalConfirmation` | boolean | false | Suppression toggle for "Global Sort" confirmation dialog (FR-011). |

### SortRequest
Parameters for a single sort operation.

| Field | Type | Description |
|-------|------|-------------|
| `criterion` | enum | `TITLE`, `URL`, `DOMAIN`, `TIME`. |
| `direction` | enum | `ASC`, `DESC`. |
| `recursive` | boolean | Whether to sort entire subtree. |
| `targetTabId` | number \| null | ID of the tab whose children are being sorted. `null` for global/root sorts. |
| `windowId` | number | Current window context. |
| `isGlobal` | boolean | Whether this is a root-level "Global Sort" (all top-level tabs). |

## Relationships
- **Tab 1:N Tab**: Recursive parent-child hierarchy maintained by TST.
- **SortAction 1:N Tab**: A single sort action affects multiple tab entities within a window.
- **Settings 1:1 User**: One set of synchronized settings per Firefox user account.
