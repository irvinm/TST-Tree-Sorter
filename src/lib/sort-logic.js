/**
 * Core sorting logic for tabs.
 */
const SortLogic = {
  /**
   * Sorts an array of tabs by title.
   * @param {Array} tabs - Array of tab objects.
   * @param {boolean} [ascending=true] - Sort direction.
   * @param {boolean} [recursive=false] - Whether to sort recursively.
   * @returns {Array} Sorted array of tabs.
   */
  sortTabsByTitle(tabs, ascending = true, recursive = false) {
    console.log('SortLogic: Sorting by Title', { count: tabs.length, ascending, recursive });
    const sorted = [...tabs].sort((a, b) => {
      const result = SortUtils.compare(a.title, b.title);
      return ascending ? result : -result;
    });

    if (recursive) {
      for (const tab of sorted) {
        if (tab.children && tab.children.length > 0) {
          tab.children = this.sortTabsByTitle(tab.children, ascending, true);
        }
      }
    }
    return sorted;
  },

  /**
   * Sorts an array of tabs by URL.
   * @param {Array} tabs - Array of tab objects.
   * @param {boolean} [ascending=true] - Sort direction.
   * @param {boolean} [recursive=false] - Whether to sort recursively.
   * @returns {Array} Sorted array of tabs.
   */
  sortTabsByURL(tabs, ascending = true, recursive = false) {
    console.log('SortLogic: Sorting by URL', { count: tabs.length, ascending, recursive });
    const sorted = [...tabs].sort((a, b) => {
      let result = SortUtils.compareURLs(a.url, b.url);
      
      // Tie-break with Title
      if (result === 0) {
        result = SortUtils.compare(a.title, b.title);
      }

      return ascending ? result : -result;
    });

    if (recursive) {
      for (const tab of sorted) {
        if (tab.children && tab.children.length > 0) {
          tab.children = this.sortTabsByURL(tab.children, ascending, true);
        }
      }
    }
    return sorted;
  },

  sortTabsByDomain(tabs, ascending = true, strict = false, recursive = false, emptyDomainTop = false) {
    console.log('SortLogic: Sorting by Domain', { count: tabs.length, ascending, recursive, emptyDomainTop });
    const sorted = [...tabs].sort((a, b) => {
      let d1, d2;
      try {
        const u1 = new URL(a.url);
        const u2 = new URL(b.url);
        d1 = strict ? u1.hostname : SortUtils.getBaseDomain(u1.hostname);
        d2 = strict ? u2.hostname : SortUtils.getBaseDomain(u2.hostname);
      } catch (e) {
        d1 = '';
        d2 = '';
      }

      // Handle empty domains (FR-013)
      if (d1 === '' && d2 !== '') return emptyDomainTop ? -1 : 1;
      if (d1 !== '' && d2 === '') return emptyDomainTop ? 1 : -1;

      let result = SortUtils.compare(d1, d2);
      
      // Tie-break with URL
      if (result === 0) {
        result = SortUtils.compareURLs(a.url, b.url);
      }

      return ascending ? result : -result;
    });

    if (recursive) {
      for (const tab of sorted) {
        if (tab.children && tab.children.length > 0) {
          tab.children = this.sortTabsByDomain(tab.children, ascending, strict, true, emptyDomainTop);
        }
      }
    }
    return sorted;
  },

  sortTabsByTime(tabs, ascending = true, recursive = false) {
    console.log('SortLogic: Sorting by Time', { count: tabs.length, ascending, recursive });
    // "Ascending" here means "Newest First" per specs/menus?
    // Spec says: "The default 'Ascending' sort MUST place the most recently accessed tabs at the top."
    // Timestamp: Larger = Newer.
    // So Descending numeric sort puts Newer first.
    // If "ascending" param is true (default), we want Newer First -> Descending Numeric.
    
    const sorted = [...tabs].sort((a, b) => {
      let result = (b.lastAccessed || 0) - (a.lastAccessed || 0); // Descending (Newest first)
      
      // Tie-break with Title
      if (result === 0) {
        result = SortUtils.compare(a.title, b.title);
      }

      return ascending ? result : -result; // If user chose "Descending", flip it to Oldest First.
    });

    if (recursive) {
      for (const tab of sorted) {
        if (tab.children && tab.children.length > 0) {
          tab.children = this.sortTabsByTime(tab.children, ascending, true);
        }
      }
    }
    return sorted;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SortLogic;
} else {
  window.SortLogic = SortLogic;
}
