# TST Tree Sorter

<!-- Badges will activate once published to AMO. Update the slug if needed. -->
![CI/CD](https://github.com/irvinm/TST-Tree-Sorter/workflows/CI/CD/badge.svg)
![Mozilla Add-on](https://img.shields.io/amo/users/TST-Tree-Sorter.svg?style=flat-square)
![Mozilla Add-on Rating](https://img.shields.io/amo/stars/TST-Tree-Sorter?style=flat-square)
![](https://img.shields.io/amo/v/TST-Tree-Sorter.svg?style=flat-square)

A Firefox extension that integrates with [Tree Style Tab](https://addons.mozilla.org/en-US/firefox/addon/tree-style-tab/) to provide advanced sorting capabilities for your tab trees.

## Features

- **Sort by Title**: Alphabetical sorting (A-Z, Z-A).
- **Sort by URL**: Hostname > Path > Fragment ordering.
- **Accurate Domain Sorting**: Groups tabs by base domain using the **Public Suffix List (PSL)**. Correctly handles complex TLDs (e.g., `.co.uk`, `.github.io`) so that subdomains are always grouped under their true root.
- **Sort by Last Accessed**: Sort by recency (newest used at top).
- **Deep Sorting**: Recursively sort nested sub-trees.
- **Root Level Sort**: Organize your entire sidebar (top-level tabs only).
- **Multi-Selection**: Sort multiple selected branches at once.
- **Keyboard Shortcuts**: 4 configurable commands for quick sorts (Title, URL, Domain, Time).
- **Theme-Responsive UI**: Extension icon and UI elements automatically adapt to your Firefox theme's colors and light/dark modes.
- **Safety**: Confirmation dialogs for large tree sorts (>50 tabs) and global sorts.

## Usage

1. Open the Tree Style Tab sidebar.
2. Right-click on any tab to see the **Sort Tree** menu.
3. Select your desired sorting criteria (Title, URL, Domain, or Last Accessed).
4. Choose ascending or descending direction.

### Keyboard Shortcuts

Configure via **Firefox** → **Add-ons** → **Manage Extension Shortcuts**:

| Command | Action |
|---------|--------|
| `sort-tree-title` | Sort active tab's children by Title (ascending) |
| `sort-tree-url` | Sort active tab's children by URL (ascending) |
| `sort-tree-domain` | Sort active tab's children by Domain (ascending) |
| `sort-tree-time` | Sort active tab's children by Last Accessed (newest first) |

### Settings

Access settings via the toolbar icon popup or **Firefox** → **Add-ons** → **TST Tree Sorter** → **Options**.

| Setting | Default | Description |
|---------|---------|-------------|
| Confirmation threshold | 50 | Tab count before showing confirmation dialog |
| Toast duration | 3 seconds | How long success notifications display |
| Strict domain sorting | Off | Sort by full sub-domain instead of base domain |
| Empty domain position | Bottom | Where tabs without domains appear |

<details>
<summary><strong>Theme Handling</strong> (click to expand)</summary>

The extension icon automatically adapts to your Firefox theme using a **3-tier color preference**:

| Tier | Source | When Used |
|------|--------|-----------|
| **1. Exact Theme Color** | `icons` → `toolbar_text` → `bookmark_text` → `tab_text` → `tab_background_text` → `toolbar_field_text` | Custom themes that specify icon/text colors |
| **2. Light/Dark Heuristic** | Toolbar background brightness or `color_scheme` property | Built-in themes (Dark, Light) |
| **3. System Preference** | `prefers-color-scheme` media query | Auto / System theme (no theme data) |

The first non-null value in Tier 1 wins. Tier 2 calculates perceived brightness of the toolbar background (bright → black icon, dark → white icon). Tier 3 follows your OS dark/light mode setting.

**Toolbar icon**: Dynamically recolored by `theme-handler.js` on every theme change using inline `style` injection to override CSS.

**Context menu icon**: Uses the on-disk SVG with CSS fallback (`stroke: black` + `@media (prefers-color-scheme: dark)` → white) for automatic light/dark adaptation.

</details>

## Limitations

- **Requires Tree Style Tab** — This extension is entirely dependent on TST and will not function without it.
- **No undo** — Sort operations cannot be reversed. A confirmation dialog is shown for large sorts (>50 tabs) as a safety net.
- **Pinned tabs excluded** — Pinned tabs are excluded from all sort operations to prevent accidental disruption.
- **No cross-window sorting** — Sorting is scoped to the current window only; tabs cannot be moved between windows.
- **Built-in pages** — Browser internal pages (`about:`, `moz-extension://`) have no domain and are grouped separately during domain sorts.

## Roadmap

- Undo / revert last sort operation.
- Auto-sort: automatically sort new tabs into their correct position as they are opened.
- Sort by tab creation time (in addition to last accessed time).
- Sort by Firefox Container / Contextual Identity.
- Custom sort profiles — save and quickly apply favorite sort configurations.
- Localization (i18n) — support for languages beyond English.
- Option to group tabs by domain after sorting (create TST sub-trees per domain).
- Badge on toolbar icon showing sort-in-progress or last sort result count.

## Requirements

- **Firefox** 128+ (latest stable recommended)
- **Tree Style Tab** extension installed and enabled

### Permissions

This extension requests only the minimum permissions needed:

- `tabs` — Read tab titles, URLs, and metadata for sorting
- `storage` — Save user preferences across Firefox instances
- `menus` — Add sorting options to the TST sidebar context menu
- `notifications` — Display toast notifications for sort results and errors

## Development

### Setup

```bash
npm install
```

### Running

```bash
npx web-ext run
```

### Testing

```bash
npm test          # Run all unit + integration tests
```

See [quickstart.md](specs/001-tree-tab-sorter/quickstart.md) for detailed setup and manual verification scenarios.

## Changelog

### Version 0.9.0 (Feb 11, 2026)
- Sort Tree Style Tab trees by Title, URL, Domain, and Last Accessed.
- Ascending and descending sort directions.
- Recursive (entire subtree) and immediate-children-only sorting.
- Sort all top-level (root) tabs via "Sort All Top-Level" menu option.
- Multi-selection support with top-down deduplication.
- 4 keyboard shortcut commands for quick ascending sorts.
- PSL-based domain sorting using `tldts` with strict/base domain toggle.
- Confirmation dialogs for large sorts (>50 tabs) and global sorts with "Don't show again" option.
- Toast notifications for sort results and errors.
- Theme-responsive icon using 3-tier color preference (exact theme color → brightness heuristic → system preference).
- Settings popup and full options page with configurable thresholds and preferences.
- Snapshot-based sorting for safety during concurrent tab operations.
- Sort mutex to prevent re-entrant sort calls.
- Preserves collapsed/expanded state, audio/mute state, and tab hierarchy.

## License

MIT
