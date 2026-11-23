import { test, expect } from '../../src/fixtures/auth';

test.describe('System', () => {
  test('[TC-001] Test route responds for GET', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/test');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.method).toBe('GET');
    expect(res.headers()['content-type']).toContain('application/json');
  });

  test('[TC-002] Test route echoes POST method', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.post('/test', { data: {} });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.method).toBe('POST');
  });

  test('[TC-003] Test route echoes PUT method', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.put('/test', { data: {} });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.method).toBe('PUT');
  });

  test('[TC-004] Returns client IP and user agent', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/ip');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(typeof body.ip).toBe('string');
    expect(body.ip.length).toBeGreaterThan(0);
    expect(typeof body.userAgent).toBe('string');
  });

  test('[TC-005] OpenAPI 3.0 document is downloadable and valid', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/openapi.json');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.openapi.startsWith('3.')).toBe(true);
    expect(Object.keys(body.paths).length).toBeGreaterThan(0);
    expect(Object.keys(body.paths)).toContain('/products');
    expect(Object.keys(body.paths)).toContain('/auth/login');
  });

  test('[TC-006] Unknown route returns 404', { tag: ['@negative', '@error-code'] }, async ({ request }) => {
    const res = await request.get('/this-route-does-not-exist');
    expect(res.status()).toBe(404);
    const contentType = res.headers()['content-type'] ?? '';
    expect(contentType).not.toContain('application/json');
  });

  test('[TC-007] delay param postpones response by >=1000ms', { tag: ['@happy', '@timing'] }, async ({ request }) => {
    const start = Date.now();
    const res = await request.get('/test?delay=1000');
    const elapsed = Date.now() - start;
    expect(res.status()).toBe(200);
    expect(elapsed).toBeGreaterThanOrEqual(950);
    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('[TC-008] delay=0 returns without artificial delay', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products/1?delay=0');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
  });
});
