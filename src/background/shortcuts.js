/**
 * Handler for keyboard shortcuts (FR-019).
 * All 4 commands trigger ascending, immediate-children-only sort.
 * Shows "No children to sort" toast for leaf tabs (Edge Case: Leaf Tab via Keyboard Shortcut).
 */
browser.commands.onCommand.addListener(async (command) => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length === 0) return;
  const activeTab = tabs[0];

  // Map command name to menu item ID pattern
  const commandMap = {
    'sort-tree-title': 'sort-title-asc',
    'sort-tree-url': 'sort-url-asc',
    'sort-tree-domain': 'sort-domain-asc',
    'sort-tree-time': 'sort-time-asc'
  };

  const menuItemId = commandMap[command];
  if (!menuItemId) return;

  // Construct a fake info object to reuse handleMenuClick
  const info = { menuItemId };
  await Controller.handleMenuClick(info, activeTab);
});
