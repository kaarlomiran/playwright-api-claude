import { test, expect } from '../../src/fixtures/auth';

test.describe('Cross-cutting', () => {
  test('[TC-110] Response content-type is JSON', { tag: ['@status-code'] }, async ({ request }) => {
    const res = await request.get('/products/1');
    expect(res.headers()['content-type']).toMatch(/application\/json/);
  });

  test('[TC-111] Repeated read is idempotent', { tag: ['@status-code', '@idempotency'] }, async ({ request }) => {
    const res1 = await request.get('/products/1');
    const res2 = await request.get('/products/1');
    expect(res1.status()).toBe(200);
    expect(res2.status()).toBe(200);
    const body1 = await res1.json();
    const body2 = await res2.json();
    expect(JSON.stringify(body1)).toBe(JSON.stringify(body2));
  });

  test('[TC-112] Response time under SLA', { tag: ['@status-code', '@performance', '@flaky-watch'] }, async ({ request }) => {
    const start = Date.now();
    const res = await request.get('/products?limit=30');
    const elapsed = Date.now() - start;
    expect(res.status()).toBe(200);
    expect(elapsed).toBeLessThan(3000);
  });

  test('[TC-113] Last page: skip+limit beyond total clamps correctly', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/products?limit=5&skip=190');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBe(Math.max(0, body.total - 190));
    expect(body.skip).toBe(190);
  });

  test('[TC-114] skip beyond total returns empty array, not error', { tag: ['@status-code'] }, async ({ request }) => {
    const res = await request.get('/products?limit=1&skip=100000');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBe(0);
  });
});
