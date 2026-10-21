/**
 * Utility for locale-aware string comparison.
 */
const SortUtils = {
  alphabeticCollator: new Intl.Collator(undefined, {
    sensitivity: 'base',
    numeric: false,
    ignorePunctuation: true
  }),

  get standardCollator() {
    return this.alphabeticCollator;
  },

  naturalCollator: new Intl.Collator(undefined, {
    sensitivity: 'base',
    numeric: true,
    ignorePunctuation: true
  }),

  /**
   * Compares two strings using the browser's locale.
   * @param {string} a - First string.
   * @param {string} b - Second string.
   * @param {boolean} [natural=false] - Whether to use natural numeric sorting (otherwise alphabetic).
   * @returns {number} -1, 0, or 1.
   */
  compare(a, b, natural = false) {
    const collator = natural ? this.naturalCollator : this.alphabeticCollator;
    return collator.compare(a || '', b || '');
  },

  /**
   * Compares two URLs by Hostname > Path > Fragment.
   * @param {string} urlA
   * @param {string} urlB
   * @param {boolean} [natural=false] - Whether to use natural numeric sorting.
   * @returns {number}
   */
  compareURLs(urlA, urlB, natural = false) {
    let u1, u2;
    try {
      u1 = new URL(urlA);
      u2 = new URL(urlB);
    } catch (e) {
      // Fallback for invalid URLs
      return this.compare(urlA, urlB, natural);
    }

    // Compare Hostnames
    const hostResult = this.compare(u1.hostname, u2.hostname, natural);
    if (hostResult !== 0) return hostResult;

    // Compare Ports
    const portResult = this.compare(u1.port, u2.port, natural);
    if (portResult !== 0) return portResult;

    // Compare Paths
    const pathResult = this.compare(u1.pathname, u2.pathname, natural);
    if (pathResult !== 0) return pathResult;

    // Compare Search Params
    const searchResult = this.compare(u1.search, u2.search, natural);
    if (searchResult !== 0) return searchResult;

    // Compare Fragments
    return this.compare(u1.hash, u2.hash, natural);
  },

  /**
   * Extracts the base domain from a hostname.
   * Uses tldts for accurate Public Suffix List (PSL) parsing.
   * @param {string} hostname
   * @returns {string}
   */
  getBaseDomain(hostname) {
    if (!hostname) return '';
    
    // In browser context, tldts is global. In Node (tests), it's also global.
    if (typeof tldts !== 'undefined') {
      return tldts.getDomain(hostname) || hostname;
    }
    
    // Fallback if library fails to load
    const parts = hostname.split('.');
    return parts.slice(-2).join('.');
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SortUtils;
} else {
  window.SortUtils = SortUtils;
}
