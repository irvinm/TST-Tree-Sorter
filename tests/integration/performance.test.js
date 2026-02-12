require('../test-setup.js');

describe('Performance', () => {
  it('should sort 1000 items in under 1 second', function () {
    this.timeout(5000);
    // Setup 1000 mock tabs
    const tabs = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      title: `Tab ${1000 - i}`, // Reverse order to force sort work
      url: `http://example${i % 100}.com/${i}`,
      lastAccessed: Date.now() - i * 1000,
      children: [],
      collapsed: false,
      pinned: false
    }));

    // Measure sort logic only (pure computation, no TST/browser API)
    const start = Date.now();
    SortLogic.sortTabsByTitle(tabs, true, false);
    const titleDuration = Date.now() - start;

    const start2 = Date.now();
    SortLogic.sortTabsByURL(tabs, true, false);
    const urlDuration = Date.now() - start2;

    const start3 = Date.now();
    SortLogic.sortTabsByDomain(tabs, true, false, false, false);
    const domainDuration = Date.now() - start3;

    const start4 = Date.now();
    SortLogic.sortTabsByTime(tabs, true, false);
    const timeDuration = Date.now() - start4;

    console.log(`  Title:  ${titleDuration}ms`);
    console.log(`  URL:    ${urlDuration}ms`);
    console.log(`  Domain: ${domainDuration}ms`);
    console.log(`  Time:   ${timeDuration}ms`);

    expect(titleDuration).to.be.lessThan(1000);
    expect(urlDuration).to.be.lessThan(1000);
    expect(domainDuration).to.be.lessThan(1000);
    expect(timeDuration).to.be.lessThan(1000);
  });
});
