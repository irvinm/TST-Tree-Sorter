require('../test-setup.js');

describe('UIUtils', () => {
  let originalGetSettings;
  let originalCreateNotification;
  let notificationOptions = null;

  beforeEach(() => {
    originalGetSettings = StorageService.getSettings;
    originalCreateNotification = browser.notifications.create;
    notificationOptions = null;

    browser.notifications.create = async (options) => {
      notificationOptions = options;
      return 'notification-123';
    };
  });

  afterEach(() => {
    StorageService.getSettings = originalGetSettings;
    browser.notifications.create = originalCreateNotification;
  });

  describe('showToast()', () => {
    it('should create notification with standard styling for normal toast', async () => {
      StorageService.getSettings = async () => ({
        disableNotifications: false,
        toastDuration: 3000
      });

      await UIUtils.showToast('Sorted 5 tabs');
      expect(notificationOptions).to.not.be.null;
      expect(notificationOptions.title).to.equal('TST Tree Sorter');
      expect(notificationOptions.message).to.equal('Sorted 5 tabs');
      expect(notificationOptions.priority).to.equal(0);
    });

    it('should suppress normal notification when disableNotifications is true', async () => {
      StorageService.getSettings = async () => ({
        disableNotifications: true,
        toastDuration: 3000
      });

      await UIUtils.showToast('Sorted 5 tabs');
      expect(notificationOptions).to.be.null;
    });

    it('should NOT suppress error notifications even if disableNotifications is true', async () => {
      StorageService.getSettings = async () => ({
        disableNotifications: true,
        toastDuration: 3000
      });

      await UIUtils.showToast('Something failed', 3000, true);
      expect(notificationOptions).to.not.be.null;
      expect(notificationOptions.title).to.equal('Sorting Error');
      expect(notificationOptions.priority).to.equal(2);
    });

    it('should NOT suppress forceShow notifications even if disableNotifications is true', async () => {
      StorageService.getSettings = async () => ({
        disableNotifications: true,
        toastDuration: 3000
      });

      await UIUtils.showToast('Pinned tab cannot be sorted', 3000, false, true);
      expect(notificationOptions).to.not.be.null;
      expect(notificationOptions.message).to.equal('Pinned tab cannot be sorted');
    });

    it('should expose ERROR_TOAST_DURATION constant as 7000ms', () => {
      expect(UIUtils.ERROR_TOAST_DURATION).to.equal(7000);
    });
  });
});
