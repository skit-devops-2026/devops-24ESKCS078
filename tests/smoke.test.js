const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');

test('index.html exists', () => {
  assert.ok(fs.existsSync('frontend/index.html'));
});

test('Makefile exists', () => {
  assert.ok(fs.existsSync('Makefile'));
});