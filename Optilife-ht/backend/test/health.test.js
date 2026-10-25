const { test, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');

const app = require('../server');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app).listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('GET /health returns ok and the commit SHA from GIT_SHA', async () => {
  process.env.GIT_SHA = 'abc123';
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.status, 'ok');
  assert.strictEqual(body.commit, 'abc123');
  delete process.env.GIT_SHA;
});

test('GET /health reports "unknown" when GIT_SHA is not set', async () => {
  delete process.env.GIT_SHA;
  const res = await fetch(`${baseUrl}/health`);
  const body = await res.json();
  assert.strictEqual(body.commit, 'unknown');
});

test('GET /api/health returns ok', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('unknown route returns 404 JSON', async () => {
  const res = await fetch(`${baseUrl}/api/does-not-exist`);
  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(await res.json(), { message: 'Route not found' });
});

test('GET /metrics exposes Prometheus metrics', async () => {
  const res = await fetch(`${baseUrl}/metrics`);
  assert.strictEqual(res.status, 200);
  const text = await res.text();
  assert.match(text, /process_cpu/);
});
