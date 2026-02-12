// Global test setup for Mocha
const chai = require('chai');
global.expect = chai.expect;

// Mock browser API
global.browser = {
  storage: {
    sync: {
      get: async () => ({}),
      set: async () => { }
    }
  },
  runtime: {
    sendMessage: async () => ({ grantedPermissions: ['tabs'] }),
    onMessageExternal: {
      addListener: () => { }
    },
    onMessage: {
      addListener: () => { },
      removeListener: () => { }
    },
    getURL: (path) => path
  },
  contextMenus: {
    create: () => { },
    onClicked: {
      addListener: () => { }
    }
  },
  menus: {
    create: () => { },
    onClicked: {
      addListener: () => { }
    }
  },
  tabs: {
    query: async () => [],
    update: async () => ({})
  },
  windows: {
    getCurrent: async () => ({ id: 1 }),
    get: async () => ({ id: 1, left: 0, top: 0, width: 800, height: 600 }),
    getLastFocused: async () => ({ id: 1, left: 0, top: 0, width: 800, height: 600 }),
    create: async () => ({ id: 99 }),
    update: async () => ({}),
    onRemoved: {
      addListener: () => { },
      removeListener: () => { }
    }
  },
  notifications: {
    create: async () => 'mock-notification-id',
    clear: async () => { }
  },
  commands: {
    onCommand: {
      addListener: () => { }
    }
  },
  theme: {
    getCurrent: async () => ({}),
    onUpdated: {
      addListener: () => { }
    }
  },
  browserAction: {
    setIcon: () => { }
  }
};

// Add libraries to globals for Node environment consistency
global.tldts = require('tldts');
global.SortUtils = require('../src/lib/sort-utils.js');
global.TSTApi = require('../src/lib/tst-api.js');
global.SortLogic = require('../src/lib/sort-logic.js');
global.StorageService = require('../src/lib/storage.js');
global.UIUtils = require('../src/lib/ui-utils.js');
global.Controller = require('../src/background/controller.js');
