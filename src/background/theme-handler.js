/**
 * Handles dynamic icon coloring based on the active Firefox theme.
 */
const ThemeHandler = {
  iconTemplate: '',

  async init() {
    // Load the SVG template
    try {
      const response = await fetch(browser.runtime.getURL('src/icons/icon.svg'));
      this.iconTemplate = await response.text();

      // Initial update
      this.updateIcon();
    } catch (e) {
      console.error('ThemeHandler: Failed to load icon template', e);
    }

    // Listen for theme changes
    if (browser.theme && browser.theme.onUpdated) {
      browser.theme.onUpdated.addListener(() => this.updateIcon());
    }
  },

  async updateIcon() {
    try {
      const theme = await browser.theme.getCurrent();
      console.log('ThemeHandler: Raw theme data:', JSON.stringify(theme, null, 2));
      const color = this.getThemeColor(theme);
      console.log('ThemeHandler: Resolved icon color:', color);

      if (!this.iconTemplate) return;

      // Replace context-stroke with the resolved theme color for the toolbar icon
      // Uses replaceAll since there are multiple <path> elements with context-stroke
      // Use style attribute to ensure it overrides any CSS in the SVG class
      const themedSvg = this.iconTemplate.replaceAll('stroke="context-stroke"', `style="stroke: ${color}"`);
      const encodedSvg = btoa(themedSvg);
      const iconUrl = `data:image/svg+xml;base64,${encodedSvg}`;

      // Update the toolbar icon only.
      browser.browserAction.setIcon({
        path: iconUrl
      });

      console.log(`ThemeHandler: Updated toolbar icon to ${color}`);
    } catch (e) {
      console.error('ThemeHandler: Failed to update icon', e);
    }
  },

  /**
   * Determines the icon color using a 3-tier preference:
   *
   * Tier 1 — Theme-specified color:
   *   Use the exact color the theme provides for icons/text.
   *   Candidates: icons, toolbar_text, tab_text, bookmark_text, toolbar_field_text.
   *
   * Tier 2 — Light/dark heuristic:
   *   a) Derive from toolbar background brightness, OR
   *   b) Use theme.properties.color_scheme if available.
   *
   * Tier 3 — Fallback to light mode (black icon).
   */
  getThemeColor(theme) {
    // Tier 1: Exact theme-specified color
    if (theme && theme.colors) {
      const candidates = [
        theme.colors.icons,
        theme.colors.toolbar_text,
        theme.colors.bookmark_text,
        theme.colors.tab_text,
        theme.colors.tab_background_text,
        theme.colors.toolbar_field_text
      ];

      for (const color of candidates) {
        if (color) return color;
      }

      // Tier 2a: Light/dark heuristic from toolbar background
      if (theme.colors.toolbar) {
        const brightness = this.getBrightness(theme.colors.toolbar);
        return brightness > 128 ? '#000000' : '#ffffff';
      }
    }

    // Tier 2b: Built-in themes set color_scheme but may leave colors null
    if (theme && theme.properties && theme.properties.color_scheme) {
      return theme.properties.color_scheme === 'dark' ? '#ffffff' : '#000000';
    }

    // Tier 3: No theme data — fallback to system preference (Auto/System theme)
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#000000';
  },

  /**
   * Calculate brightness from hex or rgb color string
   */
  getBrightness(color) {
    let r, g, b;
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else if (color.startsWith('rgb')) {
      const parts = color.match(/\d+/g);
      r = parseInt(parts[0]);
      g = parseInt(parts[1]);
      b = parseInt(parts[2]);
    } else {
      return 128; // Unknown
    }
    // Perceived brightness formula
    return (r * 299 + g * 587 + b * 114) / 1000;
  }
};

ThemeHandler.init();
