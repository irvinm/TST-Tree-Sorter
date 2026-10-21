require('../test-setup.js');

describe('Menus', () => {
  let originalGetSettings;
  let updatedMenuId = null;
  let updatedProperties = null;

  beforeEach(() => {
    originalGetSettings = StorageService.getSettings;
    updatedMenuId = null;
    updatedProperties = null;

    browser.menus.update = async (id, props) => {
      updatedMenuId = id;
      updatedProperties = props;
    };
  });

  afterEach(() => {
    StorageService.getSettings = originalGetSettings;
  });

  describe('getRootTitle()', () => {
    it('should return "Sort Tree (Natural)" when naturalNumericSort is true', async () => {
      StorageService.getSettings = async () => ({ naturalNumericSort: true });
      const title = await Menus.getRootTitle();
      expect(title).to.equal('Sort Tree (Natural)');
    });

    it('should return "Sort Tree (Alphabetic)" when naturalNumericSort is false', async () => {
      StorageService.getSettings = async () => ({ naturalNumericSort: false });
      const title = await Menus.getRootTitle();
      expect(title).to.equal('Sort Tree (Alphabetic)');
    });

    it('should default to "Sort Tree (Natural)" when settings throw an error', async () => {
      StorageService.getSettings = async () => {
        throw new Error('Storage failure');
      };
      const title = await Menus.getRootTitle();
      expect(title).to.equal('Sort Tree (Natural)');
    });
  });

  describe('updateRootTitle()', () => {
    it('should call browser.menus.update for sort-tree-root with resolved title', async () => {
      StorageService.getSettings = async () => ({ naturalNumericSort: false });
      await Menus.updateRootTitle();
      expect(updatedMenuId).to.equal('sort-tree-root');
      expect(updatedProperties).to.deep.equal({ title: 'Sort Tree (Alphabetic)' });
    });
  });
});
