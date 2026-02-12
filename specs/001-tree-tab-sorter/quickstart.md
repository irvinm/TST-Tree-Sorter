# Quickstart: TST Tree Sorter Development

## Prerequisites
1. **Firefox Browser**: Latest stable version.
2. **Tree Style Tab**: Installed and active in Firefox.
3. **Node.js & NPM**: For running `web-ext` and test tooling.

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```

## Running for Development
1. Use `web-ext` to launch a Firefox instance with the addon loaded:
   ```bash
   npx web-ext run
   ```
2. Open the Tree Style Tab sidebar.
3. Right-click any tab to see the "Sort Tree" hierarchical menu.
4. "Sort All Top-Level" option should always be visible in the context menu.

## Testing

### Unit Tests
```bash
npm test
```

### Manual Verification Scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| Sort by Title (ascending) | Right-click parent tab → Sort Tree → By Title → Ascending | Children ordered A-Z |
| Sort by URL | Right-click → Sort Tree → By URL → Ascending | Children ordered by hostname → path |
| Sort by Domain (base) | Right-click → Sort Tree → By Domain → Ascending | Grouped by PSL domain |
| Sort by Last Accessed | Right-click → Sort Tree → By Last Accessed → Descending | Most recent first |
| Global Sort | Right-click any tab → Sort All Top-Level → By Title | All root tabs sorted |
| Recursive Sort | Right-click → Sort Subtree (Recursive) → By Title | All nested levels sorted |
| Confirmation dialog | Create tree with > 50 tabs → Sort | Custom popup confirmation dialog appears |
| Pinned tabs | Pin a tab → Sort | Pinned tab stays at top |
| Multi-selection | Select 3 parent tabs → Sort | Children of all 3 sorted |
| Empty tree | Right-click leaf tab → Sort Tree | Toast: "Nothing to sort" |
| Keyboard shortcut | Map `sort-tree-title` in Firefox settings → Press shortcut | Active tab's children sorted ascending |
| Leaf tab shortcut | Focus a leaf tab → Press keyboard shortcut | Toast: "No children to sort" |
| Concurrent sort | Trigger sort while one is running | Second sort blocked until first completes |
| Error toast | Disable TST → Trigger sort | Error toast, auto-dismiss after 7s |
| Theme adaptation | Switch Firefox theme (dark ↔ light) | Icon and UI adapt automatically |

### Smoke Test (Happy Path)
1. Open Firefox with TST sidebar visible
2. Create 5+ tabs as children of one parent tab
3. Right-click the parent tab → "Sort Tree" → "By Title" → "Ascending"
4. Verify: children re-ordered A-Z, success toast appears (3s), parent-child structure intact
