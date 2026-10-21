# AMO Listing Text

> **Note for AMO Developer Hub & Future AI Assistants**:
> - **Formatting Guidelines**: Refer to [Extension Workshop: Make use of Markdown](https://extensionworkshop.com/documentation/develop/create-an-appealing-listing/#make-use-of-markdown).
> - **Summary Field**: Plain text only (max 250 characters). Used for search results and add-on cards.
> - **Description Field**: Strictly limited Markdown only. AMO supports bold (`**`), italic (`*`), inline code (`` ` ``), blockquotes (`>`), ordered/unordered lists (`1.` / `*`), and links (`[text](url)`). AMO does **NOT** support Markdown headers (`#`, `##`), images (`![]()`), or raw HTML. Do not introduce headings or HTML into Section 2.

---

## 1. Summary (Plain Text)

*Length: 205 / 250 characters*

```text
Organize your Tree Style Tab sidebar with powerful, flexible sorting. Sort tab trees by Title (natural or alphabetic), URL, Domain, or Last Accessed time with keyboard shortcuts and multi-branch support.
```

---

## 2. Description (AMO-Compliant Markdown)

*(Copy and paste the section below into the AMO Description field)*

> **Requirement**: This extension is an add-on for [Tree Style Tab](https://addons.mozilla.org/firefox/addon/tree-style-tab) (TST). Tree Style Tab must be installed to use this sorter.

**TST Tree Sorter** integrates seamlessly with Tree Style Tab to help you tame chaotic tab trees. Whether you have 10 tabs or 1,000, keep them perfectly organized by **Title**, **URL**, **Domain**, or **Last Accessed Time**.

**Key Features**

* **Sort by Title**: Natural numeric sorting ("Tab 2" before "Tab 10", default) or locale-aware Alphabetic sorting.
* **Dual Sorting Modes**: Choose between **Natural** and **Alphabetic** modes directly from the toolbar popup or options page.
* **Dynamic Menu Indicator**: Context menus dynamically reflect your active mode (e.g., *Sort Tree (Natural)* vs. *Sort Tree (Alphabetic)*).
* **Sort by URL**: Group tabs cleanly by hostname, port, and path.
* **Sort by Domain**: Smartly groups tabs by base domain using the Public Suffix List (properly handles domains like `.co.uk` and `.github.io`).
* **Sort by Last Accessed**: Instantly find and organize your most recently used tabs.
* **Deep Sorting**: Recursively sort entire sub-trees or only immediate children.
* **Global Sort**: Organize your entire sidebar (top-level tabs) with one click.
* **Multi-Selection Support**: Sort multiple selected tab trees simultaneously.
* **Keyboard Shortcuts**: Customizable shortcuts for quick sorting actions.
* **Theme-Responsive**: Icons automatically adapt to Firefox light and dark themes.

**How to Use**

1. Right-click on any tab in your Tree Style Tab sidebar.
2. Navigate to the **Sort Tree (Natural)** or **Sort Tree (Alphabetic)** menu.
3. Choose your criterion (**Title**, **URL**, **Domain**, or **Time**) and sort direction.

Your tabs are reorganized instantly!

**Safety & Tab Preservation**

* **No Data Collection**: This extension does not collect, store, or transmit any user data.
* **Accidental Sort Protection**: Large sorts (>50 tabs) prompt for confirmation to prevent accidental reordering.
* **State Preservation**: Keeps tab hierarchies, collapsed/expanded states, and audio playback status intact.

**Permissions Explained**

* **Access browser tabs**: Required to read tab titles and URLs to determine sort order.
* **Store unlimited amount of client-side data**: Used to save your sorting preferences locally.
* **Display notifications**: Shows confirmation and status alerts for large sorting operations.
