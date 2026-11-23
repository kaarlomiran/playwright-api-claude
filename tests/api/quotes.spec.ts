import { test, expect } from '../../src/fixtures/auth';

test.describe('Quotes', () => {
  test('[TC-102] Get single quote', { tag: ['@happy', '@smoke'] }, async ({ request }) => {
    const res = await request.get('/quotes/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(typeof body.quote).toBe('string');
    expect(typeof body.author).toBe('string');
  });

  test('[TC-103] Random quote', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/quotes/random');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('quote');
    expect(body).toHaveProperty('author');
  });

  test('[TC-104] Non-existent quote -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/quotes/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });
});
