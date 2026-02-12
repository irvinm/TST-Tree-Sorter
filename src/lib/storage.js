/**
 * Wrapper for browser.storage.sync to manage user settings.
 */
const StorageService = {
  /**
   * Default settings.
   */
  defaults: {
    confirmThreshold: 50,
    disableConfirmation: false,
    disableGlobalConfirmation: false,
    disableNotifications: false,
    toastDuration: 3000,
    strictDomainSort: false,
    emptyDomainTop: false
  },

  /**
   * Loads settings from storage, merging with defaults.
   * @returns {Promise<Object>} The current settings object.
   */
  async getSettings() {
    try {
      const stored = await browser.storage.sync.get(null);
      return { ...this.defaults, ...stored };
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.defaults;
    }
  },

  /**
   * Updates specific settings.
   * @param {Object} newSettings - Key-value pairs to update.
   * @returns {Promise<void>}
   */
  async updateSettings(newSettings) {
    try {
      await browser.storage.sync.set(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }
};

// Export for use in other modules (if using modules, otherwise global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageService;
} else {
  window.StorageService = StorageService;
}
