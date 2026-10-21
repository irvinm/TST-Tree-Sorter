require('../test-setup.js');

describe('Sort by Domain and Time', () => {
  it('should parse domains correctly (including TLDs)', () => {
    expect(SortUtils.getBaseDomain('docs.google.com')).to.equal('google.com');
    expect(SortUtils.getBaseDomain('google.com')).to.equal('google.com');
    expect(SortUtils.getBaseDomain('sub.example.co.uk')).to.equal('example.co.uk');
  });

  it('should sort tabs by domain (base domain grouping)', () => {
    const tabs = [
      { url: 'https://docs.google.com', id: 1 },
      { url: 'https://apple.com', id: 2 },
      { url: 'https://mail.google.com', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByDomain(tabs, true, false);
    expect(sorted[0].url).to.equal('https://apple.com');
    // google.com items together
    expect(SortUtils.getBaseDomain(new URL(sorted[1].url).hostname)).to.equal('google.com');
    expect(SortUtils.getBaseDomain(new URL(sorted[2].url).hostname)).to.equal('google.com');
  });

  it('should sort tabs by domain (strict)', () => {
    const tabs = [
      { url: 'https://docs.google.com', id: 1 },
      { url: 'https://apple.com', id: 2 },
      { url: 'https://mail.google.com', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByDomain(tabs, true, true);
    expect(sorted[0].url).to.equal('https://apple.com');
    expect(sorted[1].url).to.equal('https://docs.google.com');
    expect(sorted[2].url).to.equal('https://mail.google.com');
  });

  it('should place empty domains at the bottom by default', () => {
    const tabs = [
      { url: 'https://apple.com', id: 1 },
      { url: 'file:///local/path', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByDomain(tabs, true, false, false, false);
    expect(sorted[0].url).to.equal('https://apple.com');
    expect(sorted[1].url).to.equal('file:///local/path');
  });

  it('should place empty domains at the top if emptyDomainTop is true', () => {
    const tabs = [
      { url: 'https://apple.com', id: 1 },
      { url: 'file:///local/path', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByDomain(tabs, true, false, false, true);
    expect(sorted[0].url).to.equal('file:///local/path');
    expect(sorted[1].url).to.equal('https://apple.com');
  });

  it('should sort tabs by time (recency)', () => {
    const tabs = [
      { lastAccessed: 1000, title: 'Old', id: 1 },
      { lastAccessed: 3000, title: 'New', id: 2 },
      { lastAccessed: 2000, title: 'Mid', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByTime(tabs, true); // true = Newest First
    expect(sorted[0].title).to.equal('New');
    expect(sorted[1].title).to.equal('Mid');
    expect(sorted[2].title).to.equal('Old');
  });

  // Non-HTTP(S) URLs treated as no domain (Edge Case: Non-HTTP(S) URLs)
  it('should treat about: URLs as having no domain', () => {
    const tabs = [
      { url: 'https://example.com', id: 1 },
      { url: 'about:blank', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByDomain(tabs, true, false, false, false);
    expect(sorted[0].url).to.equal('https://example.com');
    expect(sorted[1].url).to.equal('about:blank');
  });

  it('should treat moz-extension: URLs as having no domain', () => {
    const tabs = [
      { url: 'https://example.com', id: 1 },
      { url: 'moz-extension://uuid/page.html', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByDomain(tabs, true, false, false, false);
    expect(sorted[0].url).to.equal('https://example.com');
    expect(sorted[1].url).to.equal('moz-extension://uuid/page.html');
  });

  // Never-Accessed Tabs (Edge Case)
  it('should place tabs with lastAccessed=0 at the bottom (newest first)', () => {
    const tabs = [
      { lastAccessed: 0, title: 'Never', id: 1 },
      { lastAccessed: 3000, title: 'Recent', id: 2 },
      { lastAccessed: 1000, title: 'Old', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByTime(tabs, true);
    expect(sorted[0].title).to.equal('Recent');
    expect(sorted[1].title).to.equal('Old');
    expect(sorted[2].title).to.equal('Never');
  });

  it('should place tabs with undefined lastAccessed at the bottom', () => {
    const tabs = [
      { title: 'NoAccess', id: 1 },
      { lastAccessed: 1000, title: 'Accessed', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByTime(tabs, true);
    expect(sorted[0].title).to.equal('Accessed');
    expect(sorted[1].title).to.equal('NoAccess');
  });

  // Stable sort for equal time values
  it('should preserve order for equal lastAccessed values (stable sort)', () => {
    const tabs = [
      { lastAccessed: 1000, title: 'A', id: 1 },
      { lastAccessed: 1000, title: 'A', id: 2 },
      { lastAccessed: 1000, title: 'A', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByTime(tabs, true);
    expect(sorted[0].id).to.equal(1);
    expect(sorted[1].id).to.equal(2);
    expect(sorted[2].id).to.equal(3);
  });

  // Title tie-breaking for time sort (FR-014)
  it('should use title as secondary key when lastAccessed values are equal', () => {
    const tabs = [
      { lastAccessed: 1000, title: 'Zebra', id: 1 },
      { lastAccessed: 1000, title: 'Apple', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByTime(tabs, true);
    expect(sorted[0].title).to.equal('Apple');
    expect(sorted[1].title).to.equal('Zebra');
  });

  // URL tie-breaking for domain sort (FR-013)
  it('should use URL as secondary key when domains are equal', () => {
    const tabs = [
      { url: 'https://example.com/z', id: 1 },
      { url: 'https://example.com/a', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByDomain(tabs, true, false, false, false);
    expect(sorted[0].url).to.equal('https://example.com/a');
    expect(sorted[1].url).to.equal('https://example.com/z');
  });

  describe('Natural vs Alphabetic Domain Sorting', () => {
    it('should sort numeric subdomains naturally when natural=true', () => {
      const subTabs = [
        { url: 'https://node10.example.com', id: 1 },
        { url: 'https://node2.example.com', id: 2 },
        { url: 'https://node1.example.com', id: 3 }
      ];

      // Alphabetic: 'node10...' < 'node1e...' (since '0' < 'e'), then 'node1...' < 'node2...'
      const alphabetic = SortLogic.sortTabsByDomain(subTabs, true, true, false, false, false);
      expect(alphabetic[0].url).to.equal('https://node10.example.com');
      expect(alphabetic[1].url).to.equal('https://node1.example.com');
      expect(alphabetic[2].url).to.equal('https://node2.example.com');

      // Natural: node1, node2, node10
      const natural = SortLogic.sortTabsByDomain(subTabs, true, true, false, false, true);
      expect(natural[0].url).to.equal('https://node1.example.com');
      expect(natural[1].url).to.equal('https://node2.example.com');
      expect(natural[2].url).to.equal('https://node10.example.com');
    });

    it('should sort domains descending when ascending=false', () => {
      const tabs = [
        { url: 'https://apple.com', id: 1 },
        { url: 'https://zebra.com', id: 2 },
        { url: 'https://banana.com', id: 3 }
      ];
      const sorted = SortLogic.sortTabsByDomain(tabs, false, false, false, false);
      expect(sorted[0].url).to.equal('https://zebra.com');
      expect(sorted[1].url).to.equal('https://banana.com');
      expect(sorted[2].url).to.equal('https://apple.com');
    });

    it('should sort nested subtrees recursively by domain', () => {
      const tree = [
        {
          url: 'https://zebra.com', id: 1, children: [
            { url: 'https://yahoo.com', id: 10 },
            { url: 'https://bing.com', id: 11 }
          ]
        },
        { url: 'https://apple.com', id: 2, children: [] }
      ];
      const sorted = SortLogic.sortTabsByDomain(tree, true, false, true, false);
      expect(sorted[0].url).to.equal('https://apple.com');
      expect(sorted[1].url).to.equal('https://zebra.com');
      expect(sorted[1].children[0].url).to.equal('https://bing.com');
      expect(sorted[1].children[1].url).to.equal('https://yahoo.com');
    });

    it('should sort nested subtrees recursively by time', () => {
      const tree = [
        {
          lastAccessed: 100, title: 'Old Parent', id: 1, children: [
            { lastAccessed: 50, title: 'Old Child', id: 10 },
            { lastAccessed: 300, title: 'New Child', id: 11 }
          ]
        },
        { lastAccessed: 500, title: 'New Parent', id: 2, children: [] }
      ];
      const sorted = SortLogic.sortTabsByTime(tree, true, true);
      expect(sorted[0].title).to.equal('New Parent');
      expect(sorted[1].title).to.equal('Old Parent');
      expect(sorted[1].children[0].title).to.equal('New Child');
      expect(sorted[1].children[1].title).to.equal('Old Child');
    });
  });
});