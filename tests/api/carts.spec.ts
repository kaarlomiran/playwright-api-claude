import { test, expect } from '../../src/fixtures/auth';

test.describe('Carts', () => {
  test('[TC-076] List carts', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/carts');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.carts)).toBe(true);
    expect(body.carts.length).toBeLessThanOrEqual(30);
  });

  test('[TC-077] Get single cart', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/carts/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(Array.isArray(body.products)).toBe(true);
  });

  test('[TC-078] Cart schema and totals consistency', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/carts/1');
    const body = await res.json();
    expect(body.totalProducts).toBe(body.products.length);
    const sumQuantity = body.products.reduce((acc: number, p: any) => acc + p.quantity, 0);
    expect(body.totalQuantity).toBe(sumQuantity);
    for (const p of body.products) {
      expect(Math.abs(p.total - p.price * p.quantity)).toBeLessThanOrEqual(0.01);
    }
    expect(body.discountedTotal).toBeLessThanOrEqual(body.total);
  });

  test('[TC-079] Carts for user id', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/carts/user/6');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const cart of body.carts) {
      expect(cart.userId).toBe(6);
    }
  });

  test('[TC-080] Add cart (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.post('/carts/add', {
      data: { userId: 1, products: [{ id: 144, quantity: 4 }, { id: 98, quantity: 1 }] },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.userId).toBe(1);
    expect(body.totalProducts).toBe(2);
    expect(body.totalQuantity).toBe(5);
  });

  test('[TC-081] Merge products into cart (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.put('/carts/1', { data: { merge: true, products: [{ id: 1, quantity: 1 }] } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.products.some((p: any) => p.id === 1)).toBe(true);
  });

  test('[TC-082] Delete cart (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.delete('/carts/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.isDeleted).toBe(true);
  });

  test('[TC-083] Non-existent cart -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/carts/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });

  test('[TC-084] Carts of non-existent user -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/carts/user/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('User with id');
  });

  test('[TC-085] Add cart without userId -> 400', { tag: ['@negative', '@error-code'] }, async ({ request }) => {
    const res = await request.post('/carts/add', { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('User id is required');
  });
});
