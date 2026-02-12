require('../test-setup.js');

describe('Root-Level (Global) Sorting', () => {
    it('should sort top-level tabs without altering subtrees', () => {
        const tree = [
            {
                title: 'Zebra', id: 1, children: [
                    { title: 'Child A', id: 10, children: [] },
                    { title: 'Child B', id: 11, children: [] }
                ]
            },
            {
                title: 'Apple', id: 2, children: [
                    { title: 'Child X', id: 20, children: [] }
                ]
            },
            {
                title: 'Mango', id: 3, children: []
            }
        ];

        const sorted = SortLogic.sortTabsByTitle(tree, true, false);

        // Root level sorted
        expect(sorted[0].title).to.equal('Apple');
        expect(sorted[1].title).to.equal('Mango');
        expect(sorted[2].title).to.equal('Zebra');

        // Subtrees preserved (not sorted since recursive=false)
        expect(sorted[2].children[0].title).to.equal('Child A');
        expect(sorted[2].children[1].title).to.equal('Child B');
    });

    it('should sort root-level tabs by URL', () => {
        const tree = [
            { title: 'Z', url: 'https://z.com', id: 1, children: [] },
            { title: 'A', url: 'https://a.com', id: 2, children: [] }
        ];

        const sorted = SortLogic.sortTabsByURL(tree, true, false);
        expect(sorted[0].url).to.equal('https://a.com');
        expect(sorted[1].url).to.equal('https://z.com');
    });

    it('should sort root-level tabs by domain', () => {
        const tree = [
            { url: 'https://zoo.example.com', id: 1, children: [] },
            { url: 'https://abc.com', id: 2, children: [] }
        ];

        const sorted = SortLogic.sortTabsByDomain(tree, true, false, false, false);
        expect(sorted[0].url).to.equal('https://abc.com');
    });

    it('should sort root-level tabs by time', () => {
        const tree = [
            { title: 'Old', lastAccessed: 100, id: 1, children: [] },
            { title: 'New', lastAccessed: 300, id: 2, children: [] },
            { title: 'Mid', lastAccessed: 200, id: 3, children: [] }
        ];

        const sorted = SortLogic.sortTabsByTime(tree, true, false);
        expect(sorted[0].title).to.equal('New');
        expect(sorted[1].title).to.equal('Mid');
        expect(sorted[2].title).to.equal('Old');
    });

    it('should handle empty tree (no children)', () => {
        const tree = [];
        const sorted = SortLogic.sortTabsByTitle(tree, true, false);
        expect(sorted).to.have.length(0);
    });

    it('should handle single tab (nothing to sort)', () => {
        const tree = [{ title: 'Only Tab', id: 1, children: [] }];
        const sorted = SortLogic.sortTabsByTitle(tree, true, false);
        expect(sorted).to.have.length(1);
        expect(sorted[0].title).to.equal('Only Tab');
    });
});
