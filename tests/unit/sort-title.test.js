require('../test-setup.js');

describe('Sort by Title', () => {
  const tabs = [
    { title: 'Beta', id: 1 },
    { title: 'Alpha', id: 2 },
    { title: 'Gamma', id: 3 }
  ];

  it('should compare strings correctly using SortUtils', () => {
    expect(SortUtils.compare('a', 'b')).to.be.lessThan(0);
    expect(SortUtils.compare('b', 'a')).to.be.greaterThan(0);
    expect(SortUtils.compare('a', 'a')).to.equal(0);
  });

  it('should sort tabs by title ascending', () => {
    const sorted = SortLogic.sortTabsByTitle(tabs, true);
    expect(sorted[0].title).to.equal('Alpha');
    expect(sorted[1].title).to.equal('Beta');
    expect(sorted[2].title).to.equal('Gamma');
  });

  it('should sort tabs by title descending', () => {
    const sorted = SortLogic.sortTabsByTitle(tabs, false);
    expect(sorted[0].title).to.equal('Gamma');
    expect(sorted[1].title).to.equal('Beta');
    expect(sorted[2].title).to.equal('Alpha');
  });

  it('should sort tabs recursively if the flag is set', () => {
    const tree = [
      {
        title: 'B',
        id: 1,
        children: [
          { title: 'Z', id: 2 },
          { title: 'X', id: 3 }
        ]
      },
      {
        title: 'A',
        id: 4,
        children: [
          { title: 'M', id: 5 },
          { title: 'L', id: 6 }
        ]
      }
    ];

    const sorted = SortLogic.sortTabsByTitle(tree, true, true);
    expect(sorted[0].title).to.equal('A');
    expect(sorted[0].children[0].title).to.equal('L');
    expect(sorted[0].children[1].title).to.equal('M');
    expect(sorted[1].title).to.equal('B');
    expect(sorted[1].children[0].title).to.equal('X');
    expect(sorted[1].children[1].title).to.equal('Z');
  });

  // Case-insensitive sorting (FR-003)
  it('should sort case-insensitively', () => {
    const mixed = [
      { title: 'banana', id: 1 },
      { title: 'Apple', id: 2 },
      { title: 'cherry', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByTitle(mixed, true);
    expect(sorted[0].title).to.equal('Apple');
    expect(sorted[1].title).to.equal('banana');
    expect(sorted[2].title).to.equal('cherry');
  });

  // Stable sort (FR-003)
  it('should preserve relative order for equal titles (stable sort)', () => {
    const duplicates = [
      { title: 'Same', id: 1 },
      { title: 'Same', id: 2 },
      { title: 'Same', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByTitle(duplicates, true);
    expect(sorted[0].id).to.equal(1);
    expect(sorted[1].id).to.equal(2);
    expect(sorted[2].id).to.equal(3);
  });

  // Group Tab handling (Edge Case: Group Tabs)
  it('should treat TST Group Tabs as regular tabs sorted by title', () => {
    const groupTabs = [
      { title: 'Group: Research', id: 1 },
      { title: 'ABC News', id: 2 },
      { title: 'Group: Work', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByTitle(groupTabs, true);
    expect(sorted[0].title).to.equal('ABC News');
    expect(sorted[1].title).to.equal('Group: Research');
    expect(sorted[2].title).to.equal('Group: Work');
  });

  // Locale-aware sorting (FR-003 with Intl.Collator)
  it('should handle numeric strings naturally', () => {
    const numericTabs = [
      { title: 'Tab 10', id: 1 },
      { title: 'Tab 2', id: 2 },
      { title: 'Tab 1', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByTitle(numericTabs, true);
    expect(sorted[0].title).to.equal('Tab 1');
    expect(sorted[1].title).to.equal('Tab 2');
    expect(sorted[2].title).to.equal('Tab 10');
  });

  it('should handle empty or null titles', () => {
    const withEmpty = [
      { title: 'Beta', id: 1 },
      { title: '', id: 2 },
      { title: 'Alpha', id: 3 }
    ];
    const sorted = SortLogic.sortTabsByTitle(withEmpty, true);
    // Empty string should sort before alphabetical
    expect(sorted[0].title).to.equal('');
    expect(sorted[1].title).to.equal('Alpha');
    expect(sorted[2].title).to.equal('Beta');
  });
});