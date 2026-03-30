/**
 * Controller for handling sort actions.
 * Orchestrates sorting, TST interaction, confirmation, and error handling.
 */
const Controller = {
  /**
   * Sort mutex — blocks re-entrant sort calls (Edge Case: Concurrent Sort Operations).
   */
  _isSorting: false,

  /**
   * Initializes the controller.
   */
  async init() {
    console.log('Initializing Controller...');
    await TSTApi.register();
  },

  /**
   * Handles context menu clicks.
   * @param {Object} info - Menu click info.
   * @param {Object} tab - The target tab.
   */
  async handleMenuClick(info, tab) {
    console.log('Controller handling click:', info.menuItemId);
    const { menuItemId } = info;
    if (!menuItemId.startsWith('sort-')) return;

    let ascending = true;
    let criteria = 'TITLE';
    let isSortAll = false;
    let recursive = false;

    // Parse ID: sort-<criteria>-<dir>-<scope>
    const parts = menuItemId.split('-');

    if (parts[1] === 'all') {
      isSortAll = true;
      // sort-all-<criteria>-<dir>
      criteria = (parts[2] || 'title').toUpperCase();
      ascending = parts[3] !== 'desc';
      recursive = false; // Sort all is root-level only
    } else {
      criteria = parts[1].toUpperCase();
      ascending = parts[2] === 'asc';
      recursive = parts[3] === 'rec';
    }

    if (isSortAll) {
      await this.sortTree(null, tab.windowId, criteria, ascending, false, tab.id);
      return;
    }

    // Handle Multi-Selection
    const selectedTabs = await browser.tabs.query({ highlighted: true, windowId: tab.windowId });
    const selectedIds = new Set(selectedTabs.map(t => t.id));

    if (selectedTabs.length <= 1 || !selectedIds.has(tab.id)) {
      await this.sortTree(tab.id, tab.windowId, criteria, ascending, recursive, tab.id);
      await this.clearSelection(tab.windowId);
      return;
    }

    // Top-down deduplication (FR-002)
    const tree = await TSTApi.getTree(tab.windowId);
    const parentMap = new Map();
    const traverse = (nodes, parent) => {
      for (const node of nodes) {
        parentMap.set(node.id, parent);
        if (node.children) traverse(node.children, node.id);
      }
    };
    traverse(tree, null);

    const hasAncestorInSet = (childId) => {
      let curr = parentMap.get(childId);
      while (curr) {
        if (selectedIds.has(curr)) return true;
        curr = parentMap.get(curr);
      }
      return false;
    };

    const uniqueRoots = [];
    for (const t of selectedTabs) {
      if (!hasAncestorInSet(t.id)) {
        uniqueRoots.push(t.id);
      }
    }

    for (const rootId of uniqueRoots) {
      await this.sortTree(rootId, tab.windowId, criteria, ascending, recursive, tab.id);
    }

    await this.clearSelection(tab.windowId);
  },

  /**
   * Clears multi-selection and focuses the active tab (FR-021).
   */
  async clearSelection(windowId) {
    try {
      const activeTabs = await browser.tabs.query({ active: true, windowId });
      if (activeTabs.length > 0) {
        await browser.tabs.update(activeTabs[0].id, { highlighted: true });
      }
    } catch (e) {
      console.error('Failed to clear selection:', e);
    }
  },

  /**
   * Deep-clones a tree for snapshot-based sorting (Edge Case: New Tab Creation, Concurrent Moves).
   * @param {Array} tree - The tree nodes to clone.
   * @returns {Array} Deep clone of the tree.
   */
  snapshotTree(tree) {
    return JSON.parse(JSON.stringify(tree));
  },

  /**
   * Filters out pinned tabs from a list (Edge Case: Pinned Tabs).
   * @param {Array} tabs - Array of tab objects.
   * @returns {Array} Tabs with pinned tabs excluded.
   */
  filterPinnedTabs(tabs) {
    return tabs.filter(tab => !tab.pinned);
  },

  /**
   * Counts total descendants recursively in a tab tree (Session 2026-03-29).
   * Used for recursive sort confirmation threshold.
   * @param {Array} nodes - Array of tab tree nodes.
   * @returns {number} Total count of all nodes including nested children.
   */
  countDescendants(nodes) {
    let count = 0;
    for (const node of nodes) {
      count++;
      if (node.children && node.children.length > 0) {
        count += this.countDescendants(node.children);
      }
    }
    return count;
  },

  /**
   * Orchestrates the sorting of a tree.
   * @param {number|null} rootTabId - The root tab ID, or null for Global Sort.
   * @param {number} windowId - The window ID.
   * @param {string} criteria - Sort criteria (TITLE, URL, DOMAIN, TIME).
   * @param {boolean} ascending - Sort direction.
   * @param {boolean} recursive - Whether to sort recursively.
   * @param {number} contextTabId - The tab that was right-clicked.
   */
  async sortTree(rootTabId, windowId, criteria, ascending, recursive, contextTabId) {
    // Sort mutex (Edge Case: Concurrent Sort Operations)
    if (this._isSorting) {
      console.log('Controller: Sort already in progress, blocking re-entrant call.');
      UIUtils.showToast('A sort is already in progress. Please wait.', 3000, false, true);
      return;
    }

    this._isSorting = true;
    try {
      await this._executeSortTree(rootTabId, windowId, criteria, ascending, recursive, contextTabId);
    } finally {
      this._isSorting = false;
    }
  },

  /**
   * Internal sort implementation (called within mutex).
   */
  async _executeSortTree(rootTabId, windowId, criteria, ascending, recursive, contextTabId) {
    console.log(`Starting sortTree: root=${rootTabId}, window=${windowId}, criteria=${criteria}, asc=${ascending}, recursive=${recursive}`);

    const settings = await StorageService.getSettings();
    const hasPermission = await TSTApi.checkPermissions();
    if (!hasPermission) {
      UIUtils.showToast('Permissions required! Enable "tabs" in TST Settings -> External API.', 7000, true);
      return;
    }

    const tree = await TSTApi.getTree(windowId);
    if (!tree) {
      UIUtils.showToast('Failed to connect to Tree Style Tab', 7000, true);
      return;
    }

    let targetChildren = [];
    let parentIdForAttach = null;

    if (rootTabId === null) {
      targetChildren = tree;
      parentIdForAttach = null;
    } else {
      const targetTab = this.findTab(tree, rootTabId);
      if (!targetTab || !targetTab.children || targetTab.children.length === 0) {
        // Empty tree guard (Edge Case: Empty Tree, Leaf Tab via Keyboard Shortcut)
        console.log('No children found for target tab');
        UIUtils.showToast('Nothing to sort.', settings.toastDuration, false, true);
        return;
      }
      targetChildren = targetTab.children;
      parentIdForAttach = rootTabId;
    }

    // Filter out pinned tabs (Edge Case: Pinned Tabs)
    const pinnedTabs = targetChildren.filter(tab => tab.pinned);
    const sortableTabs = this.filterPinnedTabs(targetChildren);

    if (sortableTabs.length === 0) {
      UIUtils.showToast('Nothing to sort.', settings.toastDuration, false, true);
      return;
    }

    // Single root tab guard — Global Sort with ≤1 sortable tab (Edge Case: Single Root Tab)
    const isGlobal = rootTabId === null;
    if (isGlobal && sortableTabs.length <= 1) {
      UIUtils.showToast('Nothing to sort.', settings.toastDuration, false, true);
      return;
    }

    // Determine confirmation count:
    // - Non-recursive: count immediate children (sortableTabs.length)
    // - Recursive: count total descendants
    // - Global Sort: count root-level tabs (sortableTabs.length)
    let count;
    if (recursive) {
      count = this.countDescendants(sortableTabs);
    } else {
      count = sortableTabs.length;
    }

    // Confirmation logic (FR-011, FR-012, Session 2026-03-29)
    // All sort types (subtree, recursive, Global) use confirmThreshold uniformly
    const shouldConfirm = isGlobal
      ? !settings.disableGlobalConfirmation && count > settings.confirmThreshold
      : !settings.disableConfirmation && count > settings.confirmThreshold;

    if (shouldConfirm) {
      const confirmed = await this.requestConfirmation(count, isGlobal, windowId);
      if (!confirmed) {
        console.log('Sort cancelled by user.');
        return;
      }
    }

    // Snapshot-based sorting (Edge Case: Concurrent Moves, New Tab Creation)
    const snapshot = this.snapshotTree(sortableTabs);

    // Sort the snapshot
    let sortedChildren = [];
    if (criteria === 'TITLE') {
      sortedChildren = SortLogic.sortTabsByTitle(snapshot, ascending, recursive);
    } else if (criteria === 'URL') {
      sortedChildren = SortLogic.sortTabsByURL(snapshot, ascending, recursive);
    } else if (criteria === 'DOMAIN') {
      sortedChildren = SortLogic.sortTabsByDomain(snapshot, ascending, settings.strictDomainSort, recursive, settings.emptyDomainTop);
    } else if (criteria === 'TIME') {
      sortedChildren = SortLogic.sortTabsByTime(snapshot, ascending, recursive);
    }

    // Move tabs via TST
    try {
      console.log(`Controller: Starting reordering for ${sortedChildren.length} tabs...`);
      const result = await this.applyOrderToTST(sortedChildren, parentIdForAttach, windowId, recursive);

      // Scroll to active tab (FR-010)
      await this.scrollToActiveTab(windowId);

      // Build success message
      const criteriaLabel = criteria.charAt(0) + criteria.slice(1).toLowerCase();
      const scopeLabel = isGlobal ? 'All Tabs' : 'Tree';
      const recursiveLabel = recursive ? ' (Recursive)' : '';

      if (result.failed > 0) {
        // Partial failure (Edge Case: Partial Sort Failure)
        UIUtils.showToast(
          `Sorted ${result.succeeded} of ${result.total} tabs by ${criteriaLabel}. ${result.failed} tabs were unavailable.`,
          7000,
          true
        );
      } else {
        UIUtils.showToast(
          `Sorted ${scopeLabel} by ${criteriaLabel}${recursiveLabel}`,
          settings.toastDuration
        );
      }
    } catch (error) {
      console.error('Sort operation failed during move:', error);
      UIUtils.showToast('Sorting failed: ' + (error.message || 'Unknown error'), 7000, true);
    }
  },

  /**
   * Applies the sorted order to TST via the attach API.
   * Handles collapse state preservation (FR-015) and partial failure (Edge Case: Partial Sort Failure).
   * @returns {Object} { succeeded, failed, total }
   */
  async applyOrderToTST(sortedNodes, parentId, windowId, recursive) {
    let succeeded = 0;
    let failed = 0;
    // Total count for progress reporting (descendants for subtrees/recursive, root count for global)
    const total = (parentId === null && !recursive) ? sortedNodes.length : this.countDescendants(sortedNodes);

    // Collect expanded tabs to collapse/restore for visual stability
    const expandedTabIds = [];
    const collectExpanded = (nodes) => {
      for (const node of nodes) {
        if (node.children && node.children.length > 0 && node.collapsed === false) {
          expandedTabIds.push(node.id);
        }
        if (recursive && node.children) collectExpanded(node.children);
      }
    };
    collectExpanded(sortedNodes);

    // Collapse expanded tabs for smoother visual transition
    for (const id of expandedTabIds) {
      await TSTApi.sendMessage({ type: 'collapse-tree', tab: id, collapsed: true });
    }
    if (expandedTabIds.length > 0) await new Promise(r => setTimeout(r, 100));

    // Move nodes
    if (parentId === null) {
      // Global Sort: Build backwards relative to the last tab.
      // We move item i before item i+1, from N-2 down to 0.
      for (let i = sortedNodes.length - 2; i >= 0; i--) {
        const node = sortedNodes[i];
        const nextNode = sortedNodes[i + 1];
        try {
          console.log(`Global Sort: moving "${node.title}" before "${nextNode.title}"`);
          await TSTApi.moveBefore(node.id, nextNode.id, true);
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {
          console.warn(`Failed to reorder root tab ${node.id}:`, e);
          failed++;
        }
      }
    } else {
      // Subtree Sort: Explicitly anchor the last tab, then build backwards.
      const moveNodes = async (nodes, pId) => {
        if (nodes.length === 0) return;

        // 1. Anchor the last node to the correct parent (moves the block if parent changed)
        const lastNode = nodes[nodes.length - 1];
        try {
          console.log(`Subtree Sort: anchoring "${lastNode.title}" to parent ${pId}`);
          await TSTApi.attach(lastNode.id, pId, windowId);
          await new Promise(r => setTimeout(r, 100));
        } catch (e) {
          console.warn(`Failed to anchor tab ${lastNode.id}:`, e);
          failed++;
        }

        // 2. Build backwards relative to successors
        for (let i = nodes.length - 2; i >= 0; i--) {
          const node = nodes[i];
          const nextNode = nodes[i + 1];
          try {
            console.log(`Subtree Sort: moving "${node.title}" before "${nextNode.title}"`);
            await TSTApi.moveBefore(node.id, nextNode.id, true);
            await new Promise(r => setTimeout(r, 100));
          } catch (e) {
            console.warn(`Failed to move tab ${node.id}:`, e);
            failed++;
          }
        }

        // 3. Recurse into children after the parent level is stable
        if (recursive) {
          for (const node of nodes) {
            if (node.children && node.children.length > 0) {
              await moveNodes(node.children, node.id);
            }
          }
        }
      };
      await moveNodes(sortedNodes, parentId);
    }
    succeeded = total - failed;

    // Restore expanded state (FR-015)
    for (const id of expandedTabIds) {
      await TSTApi.sendMessage({ type: 'collapse-tree', tab: id, collapsed: false });
    }

    return { succeeded, failed, total };
  },

  /**
   * Scrolls to the active tab after sorting (FR-010).
   * Uses TST's scroll API with fallback.
   */
  async scrollToActiveTab(windowId) {
    try {
      const activeTabs = await browser.tabs.query({ active: true, windowId });
      if (activeTabs.length > 0) {
        // Try TST scroll API first
        const scrollResult = await TSTApi.scroll(activeTabs[0].id);
        if (!scrollResult) {
          // Fallback: browser.tabs.update
          await browser.tabs.update(activeTabs[0].id, { active: true });
        }
      }
    } catch (e) {
      console.warn('Failed to scroll to active tab:', e);
    }
  },

  /**
   * Opens a confirmation popup window and waits for user response (FR-011).
   */
  async requestConfirmation(count, isGlobal, windowId) {
    return new Promise(async (resolve) => {
      const width = 495;
      const height = 210;

      try {
        // Get the position of the target window to center the popup
        let targetWin;
        try {
          targetWin = await browser.windows.get(windowId);
        } catch (e) {
          targetWin = await browser.windows.getLastFocused();
        }

        const left = Math.round(targetWin.left + (targetWin.width - width) / 2);
        const top = Math.round(targetWin.top + (targetWin.height - height) / 2);

        const confirmWin = await browser.windows.create({
          url: browser.runtime.getURL(`src/background/confirm.html?count=${count}&isGlobal=${isGlobal}`),
          type: 'popup',
          width: width,
          height: height,
          left: left,
          top: top,
          focused: true
        });

        // Some browsers/OS combinations ignore positioning during create.
        await browser.windows.update(confirmWin.id, {
          left: left,
          top: top,
          focused: true
        });

        const listener = (message) => {
          if (message.action === 'confirm-sort') {
            browser.runtime.onMessage.removeListener(listener);
            if (message.disableConfirmation) {
              if (isGlobal) {
                StorageService.updateSettings({ disableGlobalConfirmation: true });
              } else {
                StorageService.updateSettings({ disableConfirmation: true });
              }
            }
            resolve(message.result);
          }
        };

        browser.runtime.onMessage.addListener(listener);

        // Resolve false if the window is closed without clicking a button
        const closeListener = (removedWinId) => {
          if (removedWinId === confirmWin.id) {
            browser.windows.onRemoved.removeListener(closeListener);
            browser.runtime.onMessage.removeListener(listener);
            resolve(false);
          }
        };
        browser.windows.onRemoved.addListener(closeListener);
      } catch (e) {
        console.error('Failed to create confirmation window:', e);
        resolve(true); // Fallback: allow sort if window fails
      }
    });
  },

  /**
   * Finds a tab by ID in a tree structure.
   */
  findTab(tree, id) {
    for (const tab of tree) {
      if (tab.id === id) return tab;
      if (tab.children) {
        const found = this.findTab(tab.children, id);
        if (found) return found;
      }
    }
    return null;
  }
};

Controller.init();
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Controller;
} else {
  window.Controller = Controller;
}