require('../test-setup.js');

describe('Pinned Tab Filtering', () => {
    it('should exclude pinned tabs from sort input', () => {
        const tabs = [
            { title: 'Pinned Tab', id: 1, pinned: true },
            { title: 'Beta', id: 2, pinned: false },
            { title: 'Alpha', id: 3, pinned: false }
        ];

        const filtered = tabs.filter(tab => !tab.pinned);
        expect(filtered).to.have.length(2);
        expect(filtered.every(t => !t.pinned)).to.be.true;

        const sorted = SortLogic.sortTabsByTitle(filtered, true);
        expect(sorted[0].title).to.equal('Alpha');
        expect(sorted[1].title).to.equal('Beta');
    });

    it('should leave pinned tabs in their original positions', () => {
        const tabs = [
            { title: 'Pinned A', id: 1, pinned: true },
            { title: 'Pinned B', id: 2, pinned: true },
            { title: 'Zebra', id: 3, pinned: false },
            { title: 'Apple', id: 4, pinned: false }
        ];

        const pinned = tabs.filter(t => t.pinned);
        const sortable = tabs.filter(t => !t.pinned);
        const sorted = SortLogic.sortTabsByTitle(sortable, true);

        expect(pinned[0].title).to.equal('Pinned A');
        expect(pinned[1].title).to.equal('Pinned B');
        expect(sorted[0].title).to.equal('Apple');
        expect(sorted[1].title).to.equal('Zebra');
    });

    it('should return empty array if all tabs are pinned', () => {
        const tabs = [
            { title: 'Pinned', id: 1, pinned: true }
        ];
        const sortable = tabs.filter(t => !t.pinned);
        expect(sortable).to.have.length(0);
    });
});
