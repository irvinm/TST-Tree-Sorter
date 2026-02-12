require('../test-setup.js');

/**
 * Integration test: Unloaded Tabs (Edge Case)
 *
 * Verifies that sorting discarded/unloaded tabs does NOT trigger a reload.
 * Sorting must operate purely on metadata (title, url, lastAccessed)
 * without loading the tab content in any way.
 *
 * Spec reference: Edge Case "Unloaded Tabs" in spec.md
 * Task: T020
 */
describe('Unloaded Tabs Integration', () => {
    let reloadCalled;
    let tabsReloaded;

    beforeEach(() => {
        reloadCalled = false;
        tabsReloaded = [];

        // Instrument browser.tabs.reload to detect any unwanted reloads
        browser.tabs.reload = async (tabId) => {
            reloadCalled = true;
            tabsReloaded.push(tabId);
        };

        // Instrument browser.tabs.get to return discarded tab info
        browser.tabs.get = async (tabId) => ({
            id: tabId,
            discarded: true,
            active: false
        });
    });

    afterEach(() => {
        // Clean up instrumented methods
        delete browser.tabs.reload;
        delete browser.tabs.get;
    });

    /**
     * Creates a set of mock unloaded/discarded tabs.
     */
    function createDiscardedTabs() {
        return [
            {
                id: 1,
                title: 'Zebra Article',
                url: 'https://example.com/zebra',
                lastAccessed: 1000,
                children: [],
                collapsed: false,
                pinned: false,
                discarded: true
            },
            {
                id: 2,
                title: 'Alpha Guide',
                url: 'https://alpha.org/guide',
                lastAccessed: 3000,
                children: [],
                collapsed: false,
                pinned: false,
                discarded: true
            },
            {
                id: 3,
                title: 'Beta Reference',
                url: 'https://beta.net/ref',
                lastAccessed: 2000,
                children: [],
                collapsed: false,
                pinned: false,
                discarded: true
            }
        ];
    }

    it('should sort discarded tabs by title without triggering reload', () => {
        const tabs = createDiscardedTabs();
        const sorted = SortLogic.sortTabsByTitle(tabs, true, false);

        expect(sorted[0].title).to.equal('Alpha Guide');
        expect(sorted[1].title).to.equal('Beta Reference');
        expect(sorted[2].title).to.equal('Zebra Article');
        expect(reloadCalled).to.be.false;
        expect(tabsReloaded).to.have.lengthOf(0);
    });

    it('should sort discarded tabs by URL without triggering reload', () => {
        const tabs = createDiscardedTabs();
        const sorted = SortLogic.sortTabsByURL(tabs, true, false);

        // alpha.org < beta.net < example.com (hostname-first ordering)
        expect(sorted[0].url).to.equal('https://alpha.org/guide');
        expect(sorted[1].url).to.equal('https://beta.net/ref');
        expect(sorted[2].url).to.equal('https://example.com/zebra');
        expect(reloadCalled).to.be.false;
        expect(tabsReloaded).to.have.lengthOf(0);
    });

    it('should sort discarded tabs by domain without triggering reload', () => {
        const tabs = createDiscardedTabs();
        const sorted = SortLogic.sortTabsByDomain(tabs, true, false, false, false);

        // base domains: alpha.org < beta.net < example.com
        expect(sorted[0].url).to.include('alpha.org');
        expect(sorted[1].url).to.include('beta.net');
        expect(sorted[2].url).to.include('example.com');
        expect(reloadCalled).to.be.false;
        expect(tabsReloaded).to.have.lengthOf(0);
    });

    it('should sort discarded tabs by last accessed without triggering reload', () => {
        const tabs = createDiscardedTabs();
        // ascending=true means "newest first" per spec convention (default sort order)
        const sorted = SortLogic.sortTabsByTime(tabs, true, false);

        expect(sorted[0].lastAccessed).to.equal(3000);
        expect(sorted[1].lastAccessed).to.equal(2000);
        expect(sorted[2].lastAccessed).to.equal(1000);
        expect(reloadCalled).to.be.false;
        expect(tabsReloaded).to.have.lengthOf(0);
    });

    it('should handle a mix of loaded and discarded tabs without reloading any', () => {
        const tabs = [
            {
                id: 10,
                title: 'Loaded Tab Delta',
                url: 'https://delta.io/',
                lastAccessed: 5000,
                children: [],
                collapsed: false,
                pinned: false,
                discarded: false
            },
            {
                id: 11,
                title: 'Discarded Tab Alpha',
                url: 'https://alpha.io/',
                lastAccessed: 1000,
                children: [],
                collapsed: false,
                pinned: false,
                discarded: true
            },
            {
                id: 12,
                title: 'Discarded Tab Charlie',
                url: 'https://charlie.io/',
                lastAccessed: 3000,
                children: [],
                collapsed: false,
                pinned: false,
                discarded: true
            }
        ];

        const sorted = SortLogic.sortTabsByTitle(tabs, true, false);

        expect(sorted[0].title).to.equal('Discarded Tab Alpha');
        expect(sorted[1].title).to.equal('Discarded Tab Charlie');
        expect(sorted[2].title).to.equal('Loaded Tab Delta');
        expect(reloadCalled).to.be.false;
        expect(tabsReloaded).to.have.lengthOf(0);
    });

    it('should sort discarded tabs recursively without triggering reload', () => {
        const tabs = [
            {
                id: 20,
                title: 'Parent Zebra',
                url: 'https://zebra.com/',
                lastAccessed: 1000,
                collapsed: false,
                pinned: false,
                discarded: true,
                children: [
                    {
                        id: 21,
                        title: 'Child Charlie',
                        url: 'https://charlie.com/',
                        lastAccessed: 500,
                        children: [],
                        collapsed: false,
                        pinned: false,
                        discarded: true
                    },
                    {
                        id: 22,
                        title: 'Child Alpha',
                        url: 'https://alpha.com/',
                        lastAccessed: 600,
                        children: [],
                        collapsed: false,
                        pinned: false,
                        discarded: true
                    }
                ]
            },
            {
                id: 23,
                title: 'Parent Alpha',
                url: 'https://alpha-parent.com/',
                lastAccessed: 2000,
                collapsed: false,
                pinned: false,
                discarded: true,
                children: []
            }
        ];

        const sorted = SortLogic.sortTabsByTitle(tabs, true, true);

        // Parents sorted: Alpha < Zebra
        expect(sorted[0].title).to.equal('Parent Alpha');
        expect(sorted[1].title).to.equal('Parent Zebra');
        // Children of Parent Zebra sorted recursively: Alpha < Charlie
        expect(sorted[1].children[0].title).to.equal('Child Alpha');
        expect(sorted[1].children[1].title).to.equal('Child Charlie');
        expect(reloadCalled).to.be.false;
        expect(tabsReloaded).to.have.lengthOf(0);
    });
});
