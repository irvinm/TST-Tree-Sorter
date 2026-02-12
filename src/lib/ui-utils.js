/**
 * Utility for displaying toast notifications via browser.notifications API.
 * Uses browser.notifications for pragmatic cross-context reliability (FR-009).
 */
const UIUtils = {
  /** Error toast duration: 7 seconds, hard-coded per spec */
  ERROR_TOAST_DURATION: 7000,

  /**
   * Shows a toast notification via browser.notifications API.
   *
   * @param {string} message - The message to display.
   * @param {number} [duration=3000] - Duration in ms before auto-dismiss.
   * @param {boolean} [isError=false] - If true, uses error styling and 7s hard-coded duration.
   * @param {boolean} [forceShow=false] - If true, shows even when disableNotifications is on (for guard messages).
   */
  async showToast(message, duration = 3000, isError = false, forceShow = false) {
    const settings = await StorageService.getSettings();

    // Skip success notifications if user disabled them (but never skip errors or forced guard messages)
    if (settings.disableNotifications && !isError && !forceShow) return;

    // Error toasts always use 7s hard-coded duration
    const effectiveDuration = isError ? this.ERROR_TOAST_DURATION : (duration || settings.toastDuration);

    if (typeof browser !== 'undefined' && browser.notifications) {
      try {
        const id = await browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('src/icons/icon.svg'),
          title: isError ? 'Sorting Error' : 'TST Tree Sorter',
          message: message,
          priority: isError ? 2 : 0
        });

        if (effectiveDuration > 0) {
          setTimeout(() => {
            browser.notifications.clear(id);
          }, effectiveDuration);
        }
      } catch (e) {
        console.error('UIUtils: Failed to create notification:', e);
        console.log(`[Toast ${isError ? 'Error' : 'Info'}]: ${message}`);
      }
    } else {
      console.log(`[Toast ${isError ? 'Error' : 'Info'}]: ${message}`);
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIUtils;
} else {
  window.UIUtils = UIUtils;
}
