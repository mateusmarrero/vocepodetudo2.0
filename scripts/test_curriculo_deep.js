// Deep test of curriculo.js logic and templates
const fs = require('fs');

// Mock browser environment
global.window = global;
global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => ({
    id,
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    addEventListener: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    innerHTML: '',
    textContent: '',
    value: '',
    style: {},
    appendChild: () => {},
    querySelectorAll: () => [],
    querySelector: () => null
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: (tag) => ({
    tagName: tag.toUpperCase(),
    classList: { add: () => {}, remove: () => {} },
    setAttribute: () => {},
    appendChild: () => {},
    style: {}
  }),
  body: { classList: { add: () => {}, remove: () => {} } },
  documentElement: { classList: { add: () => {}, remove: () => {} } }
};
global.navigator = { userAgent: 'test' };
global.location = { href: 'https://vocepodetudo.com/curriculo.html', search: '' };
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
global.lucide = { createIcons: () => {} };
global.fetch = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, courses: [] }) });

try {
  require('../src/data/courses.js');
  require('../src/curriculo.js');
  console.log('✅ curriculo.js loaded.');

  if (window.cvApp) {
    console.log('✅ window.cvApp exists!');
    console.log('Current step:', window.cvApp.state ? window.cvApp.state.currentStep : 'undefined');
    console.log('Total templates:', window.cvApp.templates ? window.cvApp.templates.length : (window.cvApp.state && window.cvApp.state.templates ? window.cvApp.state.templates.length : 'unknown'));
    
    // Test rendering all 12 templates
    for (let i = 1; i <= 12; i++) {
      if (typeof window.cvApp.setTemplate === 'function') {
        window.cvApp.setTemplate(i);
        console.log(`✅ Template ${i} rendered without crash`);
      }
    }
  } else {
    console.error('❌ window.cvApp not found on window!');
  }
} catch (err) {
  console.error('❌ Error during curriculo deep test:', err);
}
