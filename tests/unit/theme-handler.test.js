require('../test-setup.js');

describe('ThemeHandler', () => {
  describe('getBrightness()', () => {
    it('should calculate brightness for 6-digit hex colors accurately', () => {
      expect(ThemeHandler.getBrightness('#000000')).to.equal(0);
      expect(ThemeHandler.getBrightness('#ffffff')).to.equal(255);
      const mid = ThemeHandler.getBrightness('#808080');
      expect(mid).to.be.closeTo(128, 1);
    });

    it('should calculate brightness for rgb strings accurately', () => {
      expect(ThemeHandler.getBrightness('rgb(0, 0, 0)')).to.equal(0);
      expect(ThemeHandler.getBrightness('rgb(255, 255, 255)')).to.equal(255);
    });

    it('should return 128 for unknown color formats', () => {
      expect(ThemeHandler.getBrightness('invalid-color')).to.equal(128);
    });
  });

  describe('getThemeColor()', () => {
    it('Tier 1: should return exact theme color if icons or toolbar_text is defined', () => {
      const themeWithIcons = {
        colors: {
          icons: '#ff00aa',
          toolbar_text: '#00ff00'
        }
      };
      expect(ThemeHandler.getThemeColor(themeWithIcons)).to.equal('#ff00aa');

      const themeWithTextOnly = {
        colors: {
          toolbar_text: '#123456'
        }
      };
      expect(ThemeHandler.getThemeColor(themeWithTextOnly)).to.equal('#123456');
    });

    it('Tier 2a: should derive black/white icon from toolbar background brightness', () => {
      const brightToolbar = {
        colors: {
          toolbar: '#ffffff'
        }
      };
      expect(ThemeHandler.getThemeColor(brightToolbar)).to.equal('#000000');

      const darkToolbar = {
        colors: {
          toolbar: '#1a1a1a'
        }
      };
      expect(ThemeHandler.getThemeColor(darkToolbar)).to.equal('#ffffff');
    });

    it('Tier 2b: should respect theme color_scheme property when colors are absent', () => {
      const darkTheme = {
        properties: {
          color_scheme: 'dark'
        }
      };
      expect(ThemeHandler.getThemeColor(darkTheme)).to.equal('#ffffff');

      const lightTheme = {
        properties: {
          color_scheme: 'light'
        }
      };
      expect(ThemeHandler.getThemeColor(lightTheme)).to.equal('#000000');
    });

    it('Tier 3: should fallback gracefully when theme object is empty or null', () => {
      expect(ThemeHandler.getThemeColor(null)).to.be.oneOf(['#000000', '#ffffff']);
      expect(ThemeHandler.getThemeColor({})).to.be.oneOf(['#000000', '#ffffff']);
    });
  });
});
