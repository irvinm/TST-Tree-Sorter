require('../test-setup.js');

describe('Sort by URL', () => {
  const tabs = [
    { url: 'https://example.com/z', title: 'Z', id: 1 },
    { url: 'https://abc.com/a', title: 'A', id: 2 },
    { url: 'https://example.com/b', title: 'B', id: 3 },
    { url: 'https://example.com/b#hash2', title: 'B2', id: 4 },
    { url: 'https://example.com/b#hash1', title: 'B1', id: 5 }
  ];

  it('should sort tabs by URL ascending (Hostname > Path > Hash)', () => {
    const sorted = SortLogic.sortTabsByURL(tabs, true);
    expect(sorted[0].url).to.equal('https://abc.com/a');
    expect(sorted[1].url).to.equal('https://example.com/b');
    expect(sorted[2].url).to.equal('https://example.com/b#hash1');
    expect(sorted[3].url).to.equal('https://example.com/b#hash2');
    expect(sorted[4].url).to.equal('https://example.com/z');
  });

  it('should break ties using Title', () => {
    const duplicateURLTabs = [
      { url: 'https://example.com', title: 'Zeta', id: 1 },
      { url: 'https://example.com', title: 'Alpha', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByURL(duplicateURLTabs, true);
    expect(sorted[0].title).to.equal('Alpha');
    expect(sorted[1].title).to.equal('Zeta');
  });

  // URL with query parameters (FR-004)
  it('should include query parameters in sort comparison', () => {
    const queryTabs = [
      { url: 'https://example.com/page?z=1', title: 'Z', id: 1 },
      { url: 'https://example.com/page?a=1', title: 'A', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByURL(queryTabs, true);
    expect(sorted[0].url).to.equal('https://example.com/page?a=1');
    expect(sorted[1].url).to.equal('https://example.com/page?z=1');
  });

  // URL with credentials (FR-004)
  it('should handle URLs with credentials', () => {
    const credTabs = [
      { url: 'https://user:pass@example.com', title: 'A', id: 1 },
      { url: 'https://example.com', title: 'B', id: 2 }
    ];
    // Should not throw
    const sorted = SortLogic.sortTabsByURL(credTabs, true);
    expect(sorted).to.have.length(2);
  });

  // Stable sort for equal URLs
  it('should preserve original order for identical URLs (stable sort)', () => {
    const sameTabs = [
      { url: 'https://example.com', title: 'Same', id: 1 },
      { url: 'https://example.com', title: 'Same', id: 2 },
      { url: 'https://example.com', title: 'Same', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByURL(sameTabs, true);
    expect(sorted[0].id).to.equal(1);
    expect(sorted[1].id).to.equal(2);
    expect(sorted[2].id).to.equal(3);
  });

  // Descending sort
  it('should sort URLs descending', () => {
    const sorted = SortLogic.sortTabsByURL(tabs, false);
    expect(sorted[0].url).to.equal('https://example.com/z');
  });

  // Invalid URLs
  it('should handle invalid URLs gracefully', () => {
    const invalidTabs = [
      { url: 'not-a-url', title: 'Invalid', id: 1 },
      { url: 'https://example.com', title: 'Valid', id: 2 }
    ];
    const sorted = SortLogic.sortTabsByURL(invalidTabs, true);
    expect(sorted).to.have.length(2);
  });
});