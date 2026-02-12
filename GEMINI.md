# TST Tree Sorter Development Guidelines

Auto-generated from all feature plans. Last updated: Saturday, February 7, 2026

## Active Technologies
- JavaScript (ES2022+) / WebExtensions API (Manifest V2) + Tree Style Tab (TST) External API, `tldts` (PSL domain extraction) (001-tree-tab-sorter)
- `browser.storage.sync` (last-write-wins conflict resolution) (001-tree-tab-sorter)

- **Language**: JavaScript (ES2022+) / WebExtensions API
- **Framework**: Tree Style Tab (TST) External API
- **Storage**: `browser.storage.sync`
- **Testing**: web-ext, Mocha/Chai

## Project Structure

```text
src/
├── background/          # Background script (main logic, context menus)
├── popup/               # Settings popup UI
├── options/             # Add-on Options page
├── lib/                 # Core sorting and TST API wrapper
└── icons/               # Extension icons

tests/
├── unit/                # Sorting logic tests
└── integration/         # web-ext integration scenarios
```

## Commands

- `npx web-ext run`: Launch Firefox with the extension loaded.
- `npm test`: Run unit tests.

## Code Style

- **JavaScript**: Use modern ES2022 syntax. Prefer `async/await` for asynchronous operations (Storage, Tabs, TST API).
- **Naming**: Use camelCase for variables and functions.
- **Documentation**: Use JSDoc for complex sorting logic and TST integration wrappers.

## Recent Changes
- 001-tree-tab-sorter: Added JavaScript (ES2022+) / WebExtensions API (Manifest V2) + Tree Style Tab (TST) External API, `tldts` (PSL domain extraction)

- **001-tree-tab-sorter**: Initial feature implementation for advanced tab sorting integrated with Tree Style Tab.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
/spe
