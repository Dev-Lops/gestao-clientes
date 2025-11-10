const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToString } = require('react-dom/server');

test('sanity', () => {
  const html = renderToString(React.createElement('span', null, 'sanity'));
  assert.ok(html.includes('sanity'));
});
