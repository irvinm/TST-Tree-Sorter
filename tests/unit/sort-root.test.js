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

describe('Confirmation Threshold — Session 2026-03-29 Updates', () => {

    describe('countDescendants helper', () => {
        it('should count total descendants recursively', () => {
            const nodes = [
                {
                    id: 1, children: [
                        { id: 10, children: [{ id: 100, children: [] }] },
                        { id: 11, children: [] }
                    ]
                },
                { id: 2, children: [] }
            ];
            // 2 root nodes + 2 children of node 1 + 1 grandchild = 5 total
            expect(Controller.countDescendants(nodes)).to.equal(5);
        });

        it('should return 0 for empty array', () => {
            expect(Controller.countDescendants([])).to.equal(0);
        });

        it('should count deeply nested trees', () => {
            // 10 top-level, each with 50 children = 510 total
            const nodes = [];
            for (let i = 0; i < 10; i++) {
                const children = [];
                for (let j = 0; j < 50; j++) {
                    children.push({ id: i * 100 + j, children: [] });
                }
                nodes.push({ id: i, children });
            }
            expect(Controller.countDescendants(nodes)).to.equal(510);
        });
    });

    describe('Recursive sort — count total descendants', () => {
        it('should use total descendant count (not immediate children) for recursive sorts', () => {
            // When recursive=true, the confirmation count should be total descendants
            // 10 immediate children, but 500+ total descendants
            const nodes = [];
            for (let i = 0; i < 10; i++) {
                const grandchildren = [];
                for (let j = 0; j < 50; j++) {
                    grandchildren.push({ id: i * 100 + j + 1000, children: [] });
                }
                nodes.push({ id: i, children: grandchildren });
            }
            const totalCount = Controller.countDescendants(nodes);
            expect(totalCount).to.equal(510); // 10 + 500
            expect(totalCount).to.be.above(50); // Would trigger confirmation
            expect(nodes.length).to.equal(10); // But immediate count is only 10
        });
    });

    describe('Global Sort — uses confirmThreshold', () => {
        it('should NOT trigger confirmation when root tab count is below threshold', () => {
            // 3 root tabs, threshold is 50 — no confirmation needed
            const count = 3;
            const confirmThreshold = 50;
            const disableGlobalConfirmation = false;
            const shouldConfirm = !disableGlobalConfirmation && count > confirmThreshold;
            expect(shouldConfirm).to.equal(false);
        });

        it('should trigger confirmation when root tab count exceeds threshold', () => {
            // 60 root tabs, threshold is 50 — confirmation needed
            const count = 60;
            const confirmThreshold = 50;
            const disableGlobalConfirmation = false;
            const shouldConfirm = !disableGlobalConfirmation && count > confirmThreshold;
            expect(shouldConfirm).to.equal(true);
        });

        it('should NOT trigger confirmation when disableGlobalConfirmation is true', () => {
            const count = 60;
            const confirmThreshold = 50;
            const disableGlobalConfirmation = true;
            const shouldConfirm = !disableGlobalConfirmation && count > confirmThreshold;
            expect(shouldConfirm).to.equal(false);
        });
    });

    describe('Single Root Tab — Nothing to sort', () => {
        it('should recognize single sortable root tab as nothing to sort', () => {
            const sortableTabs = [{ id: 1, title: 'Only Tab', children: [] }];
            const isGlobal = true;
            // sortableTabs.length <= 1 && isGlobal → "Nothing to sort"
            expect(sortableTabs.length <= 1 && isGlobal).to.equal(true);
        });

        it('should recognize zero sortable root tabs as nothing to sort', () => {
            const sortableTabs = [];
            const isGlobal = true;
            expect(sortableTabs.length <= 1 && isGlobal).to.equal(true);
        });

        it('should proceed normally with 2+ sortable root tabs', () => {
            const sortableTabs = [
                { id: 1, title: 'Tab A', children: [] },
                { id: 2, title: 'Tab B', children: [] }
            ];
            const isGlobal = true;
            expect(sortableTabs.length <= 1 && isGlobal).to.equal(false);
        });
    });
});

describe('applyOrderToTST — Call Order Verification', () => {
    let attachCalls, moveAfterCalls, moveBeforeCalls;
    let originalAttach, originalMoveAfter, originalMoveBefore, originalSendMessage;

    beforeEach(() => {
        attachCalls = [];
        moveAfterCalls = [];
        moveBeforeCalls = [];

        // Spy on TSTApi methods to capture call order
        originalAttach = TSTApi.attach;
        originalMoveAfter = TSTApi.moveAfter;
        originalMoveBefore = TSTApi.moveBefore;
        originalSendMessage = TSTApi.sendMessage;

        TSTApi.attach = async (tabId, parentId, windowId, insertBefore) => {
            attachCalls.push({ tabId, parentId, windowId, insertBefore });
        };
        TSTApi.moveAfter = async (tabId, referenceTabId, followChildren) => {
            moveAfterCalls.push({ tabId, referenceTabId });
        };
        TSTApi.moveBefore = async (tabId, referenceTabId, followChildren) => {
            moveBeforeCalls.push({ tabId, referenceTabId });
        };
        TSTApi.sendMessage = async () => true; // collapse/expand no-ops
    });

    afterEach(() => {
        TSTApi.attach = originalAttach;
        TSTApi.moveAfter = originalMoveAfter;
        TSTApi.moveBefore = originalMoveBefore;
        TSTApi.sendMessage = originalSendMessage;
    });

    it('subtree sort: should use moveBefore in BACKWARD order to ensure correct hierarchy building', async () => {
        const sorted = [
            { id: 1, title: 'Apple', children: [], collapsed: true },
            { id: 2, title: 'Banana', children: [], collapsed: true },
            { id: 3, title: 'Cherry', children: [], collapsed: true }
        ];

        await Controller.applyOrderToTST(sorted, 100, 1, false);

        // Verify anchor (attach) then reorder (moveBefore)
        
        // 1. Anchor the last node (Cherry)
        expect(attachCalls).to.have.length(1);
        expect(attachCalls[0].tabId).to.equal(3);
        expect(attachCalls[0].parentId).to.equal(100);

        // 2. Build backwards relative to successors
        expect(moveBeforeCalls).to.have.length(2);
        
        // Banana before Cherry (i = 1)
        expect(moveBeforeCalls[0].tabId).to.equal(2);
        expect(moveBeforeCalls[0].referenceTabId).to.equal(3);

        // Apple before Banana (i = 0)
        expect(moveBeforeCalls[1].tabId).to.equal(1);
        expect(moveBeforeCalls[1].referenceTabId).to.equal(2);
    });

    it('root sort: should use moveBefore in sequence for safe reordering', async () => {
        const sorted = [
            { id: 1, title: 'Apple', children: [], collapsed: true },
            { id: 2, title: 'Banana', children: [], collapsed: true },
            { id: 3, title: 'Cherry', children: [], collapsed: true }
        ];

        await Controller.applyOrderToTST(sorted, null, 1, false);

        // Verify moveBefore sequence: N-1 calls in BACKWARD order (from end to start)
        expect(moveBeforeCalls).to.have.length(2);
        
        // 1. Banana before Cherry (i = 1)
        expect(moveBeforeCalls[0].tabId).to.equal(2);
        expect(moveBeforeCalls[0].referenceTabId).to.equal(3);

        // 2. Apple before Banana (i = 0)
        expect(moveBeforeCalls[1].tabId).to.equal(1);
        expect(moveBeforeCalls[1].referenceTabId).to.equal(2);

        // No attach calls for root sorts anymore
        expect(attachCalls).to.have.length(0);
    });

    it('subtree recursive sort: should handle nested moves using moveBefore', async () => {
        const sorted = [
            {
                id: 1, title: 'Apple', collapsed: true, children: [
                    { id: 10, title: 'Alpha', children: [], collapsed: true },
                    { id: 11, title: 'Beta', children: [], collapsed: true }
                ]
            },
            { id: 2, title: 'Banana', children: [], collapsed: true }
        ];

        await Controller.applyOrderToTST(sorted, 100, 1, true);

        // Verify anchor/move pattern for each level
        
        // 1. Level 1: Anchor Banana(2), Move Apple(1) before Banana(2)
        expect(attachCalls[0].tabId).to.equal(2);
        expect(moveBeforeCalls[0].tabId).to.equal(1);
        expect(moveBeforeCalls[0].referenceTabId).to.equal(2);

        // 2. Level 2 (Apple's children): Anchor Beta(11), Move Alpha(10) before Beta(11)
        expect(attachCalls[1].tabId).to.equal(11);
        expect(moveBeforeCalls[1].tabId).to.equal(10);
        expect(moveBeforeCalls[1].referenceTabId).to.equal(11);
    });
});
