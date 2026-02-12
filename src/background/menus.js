// Menus configuration
const Menus = {
  create() {
    // Parent menu
    browser.menus.create({
      id: 'sort-tree-root',
      title: 'Sort Tree',
      contexts: ['tab'],
      icons: {
        "16": "src/icons/icon.svg",
        "32": "src/icons/icon.svg",
        "48": "src/icons/icon.svg"
      }
    });

    // By Title
    browser.menus.create({
      id: 'sort-title-root',
      parentId: 'sort-tree-root',
      title: 'By Title',
      contexts: ['tab']
    });

    // Title Ascending
    browser.menus.create({
      id: 'sort-title-asc-root',
      parentId: 'sort-title-root',
      title: 'Ascending (A-Z)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-title-asc-imm',
      parentId: 'sort-title-asc-root',
      title: 'Immediate Children Only',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-title-asc-rec',
      parentId: 'sort-title-asc-root',
      title: 'Entire Subtree (Recursive)',
      contexts: ['tab']
    });

    // Title Descending
    browser.menus.create({
      id: 'sort-title-desc-root',
      parentId: 'sort-title-root',
      title: 'Descending (Z-A)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-title-desc-imm',
      parentId: 'sort-title-desc-root',
      title: 'Immediate Children Only',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-title-desc-rec',
      parentId: 'sort-title-desc-root',
      title: 'Entire Subtree (Recursive)',
      contexts: ['tab']
    });

    // By URL
    browser.menus.create({
      id: 'sort-url-root',
      parentId: 'sort-tree-root',
      title: 'By URL',
      contexts: ['tab']
    });

    // URL Ascending
    browser.menus.create({
      id: 'sort-url-asc-root',
      parentId: 'sort-url-root',
      title: 'Ascending (A-Z)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-url-asc-imm',
      parentId: 'sort-url-asc-root',
      title: 'Immediate Children Only',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-url-asc-rec',
      parentId: 'sort-url-asc-root',
      title: 'Entire Subtree (Recursive)',
      contexts: ['tab']
    });

    // URL Descending
    browser.menus.create({
      id: 'sort-url-desc-root',
      parentId: 'sort-url-root',
      title: 'Descending (Z-A)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-url-desc-imm',
      parentId: 'sort-url-desc-root',
      title: 'Immediate Children Only',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-url-desc-rec',
      parentId: 'sort-url-desc-root',
      title: 'Entire Subtree (Recursive)',
      contexts: ['tab']
    });

    // By Domain
    browser.menus.create({
      id: 'sort-domain-root',
      parentId: 'sort-tree-root',
      title: 'By Domain',
      contexts: ['tab']
    });
    // Domain Ascending
    browser.menus.create({
      id: 'sort-domain-asc-root',
      parentId: 'sort-domain-root',
      title: 'Ascending (A-Z)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-domain-asc-imm',
      parentId: 'sort-domain-asc-root',
      title: 'Immediate Children Only',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-domain-asc-rec',
      parentId: 'sort-domain-asc-root',
      title: 'Entire Subtree (Recursive)',
      contexts: ['tab']
    });
    // Domain Descending
    browser.menus.create({
      id: 'sort-domain-desc-root',
      parentId: 'sort-domain-root',
      title: 'Descending (Z-A)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-domain-desc-imm',
      parentId: 'sort-domain-desc-root',
      title: 'Immediate Children Only',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-domain-desc-rec',
      parentId: 'sort-domain-desc-root',
      title: 'Entire Subtree (Recursive)',
      contexts: ['tab']
    });

    // By Time
    browser.menus.create({
      id: 'sort-time-root',
      parentId: 'sort-tree-root',
      title: 'By Last Accessed',
      contexts: ['tab']
    });
    // Time Ascending (Newest First)
    browser.menus.create({
      id: 'sort-time-asc-root',
      parentId: 'sort-time-root',
      title: 'Newest First (Default)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-time-asc-imm',
      parentId: 'sort-time-asc-root',
      title: 'Immediate Children Only',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-time-asc-rec',
      parentId: 'sort-time-asc-root',
      title: 'Entire Subtree (Recursive)',
      contexts: ['tab']
    });
    // Time Descending (Oldest First)
    browser.menus.create({
      id: 'sort-time-desc-root',
      parentId: 'sort-time-root',
      title: 'Oldest First',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-time-desc-imm',
      parentId: 'sort-time-desc-root',
      title: 'Immediate Children Only',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-time-desc-rec',
      parentId: 'sort-time-desc-root',
      title: 'Entire Subtree (Recursive)',
      contexts: ['tab']
    });

    browser.menus.create({
      id: 'sort-separator-1',
      type: 'separator',
      parentId: 'sort-tree-root',
      contexts: ['tab']
    });

    // Sort All (Global) — FR-001: always visible in every tab's context menu
    browser.menus.create({
      id: 'sort-all-root',
      parentId: 'sort-tree-root',
      title: 'Sort All Tabs (Root Level)',
      contexts: ['tab']
    });

    // Global Sort: By Title
    browser.menus.create({
      id: 'sort-all-title-asc',
      parentId: 'sort-all-root',
      title: 'By Title (A-Z)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-all-title-desc',
      parentId: 'sort-all-root',
      title: 'By Title (Z-A)',
      contexts: ['tab']
    });

    // Global Sort: By URL
    browser.menus.create({
      id: 'sort-all-url-asc',
      parentId: 'sort-all-root',
      title: 'By URL (A-Z)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-all-url-desc',
      parentId: 'sort-all-root',
      title: 'By URL (Z-A)',
      contexts: ['tab']
    });

    // Global Sort: By Domain
    browser.menus.create({
      id: 'sort-all-domain-asc',
      parentId: 'sort-all-root',
      title: 'By Domain (A-Z)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-all-domain-desc',
      parentId: 'sort-all-root',
      title: 'By Domain (Z-A)',
      contexts: ['tab']
    });

    // Global Sort: By Last Accessed
    browser.menus.create({
      id: 'sort-all-time-asc',
      parentId: 'sort-all-root',
      title: 'By Last Accessed (Newest)',
      contexts: ['tab']
    });
    browser.menus.create({
      id: 'sort-all-time-desc',
      parentId: 'sort-all-root',
      title: 'By Last Accessed (Oldest)',
      contexts: ['tab']
    });
  }
};

browser.menus.onClicked.addListener((info, tab) => {
  console.log('Menu clicked:', info.menuItemId, 'for tab:', tab.id);
  if (typeof Controller !== 'undefined') {
    Controller.handleMenuClick(info, tab);
  } else {
    console.error('Controller not found!');
  }
});

// Initialize
Menus.create();
