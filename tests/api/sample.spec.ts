import { test, expect } from '../../src/fixtures/auth';

test.describe('Products', () => {
  test('[TC-016] Get single product by id', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(typeof body.title).toBe('string');
    expect(typeof body.price).toBe('number');
  });

  test('[TC-026] Non-existent product id -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/products/999999');
    expect(res.status()).toBe(404);
    expect((await res.json()).message).toContain('not found');
  });
});

test.describe('Auth', () => {
  test('[TC-051] Missing token -> 401', { tag: ['@auth', '@negative'] }, async ({ anon }) => {
    const res = await anon.get('/auth/me');
    expect(res.status()).toBe(401);
    expect((await res.json()).message).toBe('Access Token is required');
  });

  test('[TC-049] Valid token returns current user', { tag: ['@auth'] }, async ({ request, tokens }) => {
    const res = await request.get('/auth/me', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).username).toBe('emilys');
  });
});
