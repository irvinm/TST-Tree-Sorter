require('../test-setup.js');

describe('StorageService', () => {
  let originalGet;
  let originalSet;

  beforeEach(() => {
    originalGet = browser.storage.sync.get;
    originalSet = browser.storage.sync.set;
  });

  afterEach(() => {
    browser.storage.sync.get = originalGet;
    browser.storage.sync.set = originalSet;
  });

  describe('Default Settings Structure', () => {
    it('should define all expected default settings and types', () => {
      const defaults = StorageService.defaults;
      expect(defaults).to.be.an('object');
      expect(defaults.confirmThreshold).to.equal(50);
      expect(defaults.disableConfirmation).to.be.false;
      expect(defaults.disableGlobalConfirmation).to.be.false;
      expect(defaults.disableNotifications).to.be.false;
      expect(defaults.toastDuration).to.equal(3000);
      expect(defaults.strictDomainSort).to.be.false;
      expect(defaults.emptyDomainTop).to.be.false;
      expect(defaults.naturalNumericSort).to.be.true;
    });
  });

  describe('getSettings()', () => {
    it('should return complete defaults when storage is empty', async () => {
      browser.storage.sync.get = async () => ({});
      const settings = await StorageService.getSettings();
      expect(settings).to.deep.equal(StorageService.defaults);
    });

    it('should overlay stored partial settings without dropping unconfigured defaults', async () => {
      browser.storage.sync.get = async () => ({
        confirmThreshold: 100,
        naturalNumericSort: false
      });
      const settings = await StorageService.getSettings();
      expect(settings.confirmThreshold).to.equal(100);
      expect(settings.naturalNumericSort).to.be.false;
      // Other defaults remain intact
      expect(settings.disableConfirmation).to.be.false;
      expect(defaults => settings.toastDuration).to.not.be.undefined;
      expect(settings.toastDuration).to.equal(3000);
    });

    it('should return defaults gracefully if storage throws an error', async () => {
      browser.storage.sync.get = async () => {
        throw new Error('Sync storage unavailable');
      };
      const settings = await StorageService.getSettings();
      expect(settings).to.deep.equal(StorageService.defaults);
    });
  });

  describe('updateSettings()', () => {
    it('should call browser.storage.sync.set with provided updates', async () => {
      let savedData = null;
      browser.storage.sync.set = async (data) => {
        savedData = data;
      };

      await StorageService.updateSettings({ naturalNumericSort: false, toastDuration: 5000 });
      expect(savedData).to.deep.equal({ naturalNumericSort: false, toastDuration: 5000 });
    });

    it('should rethrow error if browser.storage.sync.set fails', async () => {
      browser.storage.sync.set = async () => {
        throw new Error('Quota exceeded');
      };

      let threw = false;
      try {
        await StorageService.updateSettings({ confirmThreshold: 50 });
      } catch (e) {
        threw = true;
        expect(e.message).to.equal('Quota exceeded');
      }
      expect(threw).to.be.true;
    });
  });
});
