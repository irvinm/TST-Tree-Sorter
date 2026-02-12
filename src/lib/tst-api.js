/**
 * Wrapper for communicating with the Tree Style Tab extension.
 */
const TST_ID = 'treestyletab@piro.sakura.ne.jp';

const TSTApi = {
  /**
   * Sends a message to TST.
   * @param {Object} message - The message object to send.
   * @returns {Promise<any>} Response from TST.
   */
  async sendMessage(message) {
    try {
      console.log('TSTApi: Sending message:', message);
      const response = await browser.runtime.sendMessage(TST_ID, message);
      console.log('TSTApi: Received response:', response);
      return response;
    } catch (error) {
      console.warn('TSTApi: Communication failed:', error);
      return null;
    }
  },

  /**
   * Registers this extension with TST.
   */
  async register() {
    console.log('TSTApi: Attempting registration...');
    // Per TST Wiki: permissions is an array including 'tabs'
    const result = await this.sendMessage({
      type: 'register-self',
      name: 'TST Tree Sorter',
      icons: { 48: 'src/icons/icon.svg' },
      listeningTypes: ['wait-for-shutdown', 'ready'],
      permissions: ['tabs']
    });
    console.log('TSTApi: Registration result:', result);
    return result;
  },

  /**
   * Sets up listener for TST messages (like 'ready').
   */
  init() {
    // TST messages are sent via runtime.onMessageExternal
    browser.runtime.onMessageExternal.addListener((message, sender) => {
      if (sender.id !== TST_ID) return;
      console.log('TSTApi: Received external message:', message.type);
      if (message.type === 'ready') {
        console.log('TSTApi: TST is ready, re-registering...');
        this.register();
      }
    });
  },

  /**
   * Gets the complete tree structure for a window.
   * @param {number} windowId - The window ID.
   * @returns {Promise<Array>} Array of tab objects with TST metadata.
   */
  async getTree(windowId) {
    return await this.sendMessage({
      type: 'get-tree',
      window: windowId
    });
  },

  /**
   * Attaches a tab to a new parent at a specific position.
   * @param {number} tabId - ID of the tab to move.
   * @param {number} parentId - ID of the new parent tab (or null for root).
   * @param {number} windowId - ID of the window containing the tab.
   * @param {number} [insertBefore] - ID of the sibling to insert before (optional).
   */
  async attach(tabId, parentId, windowId, insertBefore) {
    // CRITICAL: TST API uses 'child', not 'tab' for the attach command!
    const message = {
      type: 'attach',
      child: tabId,
      parent: parentId,
      window: windowId
    };

    // TST expects insertBefore to be a tab ID or null (to append)
    if (arguments.length > 3) {
      message.insertBefore = insertBefore;
    }

    return await this.sendMessage(message);
  },

  /**
   * Moves a tab before another reference tab.
   * @param {number} tabId
   * @param {number} referenceTabId
   * @param {boolean} [followChildren=true]
   */
  async moveBefore(tabId, referenceTabId, followChildren = true) {
    return await this.sendMessage({
      type: 'move-before',
      tab: tabId,
      referenceTabId: referenceTabId,
      followChildren: followChildren
    });
  },

  /**
   * Moves a tab after another reference tab.
   * @param {number} tabId
   * @param {number} referenceTabId
   * @param {boolean} [followChildren=true]
   */
  async moveAfter(tabId, referenceTabId, followChildren = true) {
    return await this.sendMessage({
      type: 'move-after',
      tab: tabId,
      referenceTabId: referenceTabId,
      followChildren: followChildren
    });
  },

  /**
   * Checks if the extension has been granted 'tabs' permission by TST.
   * @returns {Promise<boolean>}
   */
  async checkPermissions() {
    // Direct check: If we can get the tree, we have 'tabs' permission.
    try {
      const tabs = await this.getTree('current');
      console.log('TSTApi: Permission check (get-tree) success');
      return Array.isArray(tabs);
    } catch (e) {
      console.error('TSTApi: Permission check failed:', e);
      return false;
    }
  },

  /**
   * Scrolls the TST sidebar to make a specific tab visible (FR-010).
   * @param {number} tabId - The tab ID to scroll to.
   * @returns {Promise<any>} Response from TST, or null on failure.
   */
  async scroll(tabId) {
    return await this.sendMessage({
      type: 'scroll',
      tab: tabId
    });
  }
};

// Initialize listeners
TSTApi.init();

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TSTApi;
} else {
  window.TSTApi = TSTApi;
}
