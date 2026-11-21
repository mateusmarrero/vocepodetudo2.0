// Test script for admin.js and curriculo.js execution in mock DOM
const fs = require('fs');

function createMockElement(tag, id = '') {
  return {
    id: id,
    tagName: tag.toUpperCase(),
    classList: {
      _classes: new Set(),
      add: function(...cls) { cls.forEach(c => this._classes.add(c)); },
      remove: function(...cls) { cls.forEach(c => this._classes.delete(c)); },
      contains: function(c) { return this._classes.has(c); },
      toggle: function(c) { if (this.contains(c)) this.remove(c); else this.add(c); }
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    hasAttribute: () => false,
    removeAttribute: () => {},
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    closest: () => null,
    focus: () => {},
    click: () => {}
  };
}

const elementCache = {};

global.window = global;
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => {
    if (!elementCache[id]) {
      elementCache[id] = createMockElement('div', id);
    }
    return elementCache[id];
  },
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => createMockElement(tag),
  body: createMockElement('body'),
  documentElement: createMockElement('html')
};

global.navigator = { userAgent: 'test', serviceWorker: { register: () => Promise.resolve() } };
global.location = { href: 'https://vocepodetudo.com/admin.html', search: '', pathname: '/admin.html', protocol: 'https:' };
global.localStorage = {
  _store: {},
  getItem: (k) => global.localStorage._store[k] || null,
  setItem: (k, v) => { global.localStorage._store[k] = v; },
  removeItem: (k) => { delete global.localStorage._store[k]; }
};
global.sessionStorage = {
  _store: {},
  getItem: (k) => global.sessionStorage._store[k] || null,
  setItem: (k, v) => { global.sessionStorage._store[k] = v; },
  removeItem: (k) => { delete global.sessionStorage._store[k]; }
};
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, courses: [] }) });
global.lucide = { createIcons: () => {} };

// Test 1: Load courses.js
try {
  require('../src/data/courses.js');
  console.log('✅ courses.js loaded. courses length:', (window.PORTAL_DATA && window.PORTAL_DATA.courses || []).length);
} catch (e) {
  console.error('❌ courses.js error:', e);
}

// Test 2: Load admin.js
try {
  require('../src/admin.js');
  console.log('✅ admin.js loaded successfully!');
} catch (e) {
  console.error('❌ admin.js error:', e);
}

// Test 3: Load curriculo.js
try {
  require('../src/curriculo.js');
  console.log('✅ curriculo.js loaded successfully!');
} catch (e) {
  console.error('❌ curriculo.js error:', e);
}
