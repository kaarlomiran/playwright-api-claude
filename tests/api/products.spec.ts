import { test, expect } from '../../src/fixtures/auth';

test.describe('Products', () => {
  test('[TC-009] List products with default pagination', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeLessThanOrEqual(30);
    expect(body.skip).toBe(0);
    expect(body.limit).toBe(30);
    expect(body.total).toBeGreaterThanOrEqual(body.products.length);
  });

  test('[TC-010] Pagination with limit and skip', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products?limit=5&skip=10');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBe(5);
    expect(body.skip).toBe(10);
    expect(body.limit).toBe(5);
    expect(body.products[0].id).toBe(11);
  });

  test('[TC-011] limit=0 returns all items', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products?limit=0');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBe(body.total);
  });

  test('[TC-012] select returns only requested keys (plus id)', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/products?limit=3&select=title,price');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBe(3);
    for (const p of body.products) {
      expect(typeof p.title).toBe('string');
      expect(typeof p.price).toBe('number');
      expect(p.description).toBeUndefined();
      expect(p.category).toBeUndefined();
    }
  });

  test('[TC-013] Multiple select params are merged', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/products?limit=2&select=title&select=price');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const p of body.products) {
      expect(typeof p.title).toBe('string');
      expect(typeof p.price).toBe('number');
      expect(p.description).toBeUndefined();
    }
  });

  test('[TC-014] Sort ascending by price', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products?sortBy=price&order=asc&limit=10');
    expect(res.status()).toBe(200);
    const body = await res.json();
    const prices = body.products.map((p: any) => p.price);
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test('[TC-015] Sort descending by price', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products?sortBy=price&order=desc&limit=10');
    expect(res.status()).toBe(200);
    const body = await res.json();
    const prices = body.products.map((p: any) => p.price);
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test('[TC-016] Get single product by id', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(typeof body.title).toBe('string');
    expect(typeof body.price).toBe('number');
  });

  test('[TC-017] Product schema: required keys and types', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/products/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    const requiredKeys = ['id', 'title', 'description', 'category', 'price', 'discountPercentage',
      'rating', 'stock', 'tags', 'sku', 'weight', 'dimensions', 'reviews', 'images', 'thumbnail'];
    for (const key of requiredKeys) {
      expect.soft(body, `missing key ${key}`).toHaveProperty(key);
    }
    expect(Array.isArray(body.tags)).toBe(true);
    expect(Array.isArray(body.images)).toBe(true);
    expect(Array.isArray(body.reviews)).toBe(true);
    expect(body.rating).toBeGreaterThanOrEqual(0);
    expect(body.rating).toBeLessThanOrEqual(5);
    expect(Number.isInteger(body.stock)).toBe(true);
    expect(body.stock).toBeGreaterThanOrEqual(0);
    expect(body.thumbnail).toMatch(/^https?:\/\//);
  });

  test('[TC-018] Nested dimensions object shape', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/products/1');
    const body = await res.json();
    expect(body.dimensions.width).toBeGreaterThan(0);
    expect(body.dimensions.height).toBeGreaterThan(0);
    expect(body.dimensions.depth).toBeGreaterThan(0);
  });

  test('[TC-019] Review items shape', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/products/1');
    const body = await res.json();
    expect(body.reviews.length).toBeGreaterThan(0);
    for (const review of body.reviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(Number.isNaN(Date.parse(review.date))).toBe(false);
      expect(review.reviewerEmail).toMatch(/^\S+@\S+$/);
    }
  });

  test('[TC-020] Search products by keyword', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products/search?q=phone');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    for (const p of body.products) {
      const haystack = `${p.title} ${p.description} ${(p.tags ?? []).join(' ')} ${p.brand ?? ''}`.toLowerCase();
      expect.soft(haystack).toContain('phone');
    }
  });

  test('[TC-021] Search with no matches returns empty list, not error', { tag: ['@negative'] }, async ({ request }) => {
    const res = await request.get('/products/search?q=zzzzqqqq9999');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBe(0);
    expect(body.total).toBe(0);
  });

  test('[TC-022] List categories as objects', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products/categories');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    for (const item of body) {
      expect(item).toHaveProperty('slug');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('url');
      expect(item.url.endsWith(`/products/category/${item.slug}`)).toBe(true);
    }
  });

  test('[TC-023] List category slugs as strings', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products/category-list');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const item of body) {
      expect(typeof item).toBe('string');
    }
    expect(body).toContain('smartphones');
    expect(new Set(body).size).toBe(body.length);
  });

  test('[TC-024] Products filtered by category', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/products/category/smartphones');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const p of body.products) {
      expect(p.category).toBe('smartphones');
    }
    expect(body.total).toBeGreaterThan(0);
  });

  test('[TC-025] Unknown category returns empty list (200)', { tag: ['@negative'] }, async ({ request }) => {
    const res = await request.get('/products/category/invalidcat');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.products.length).toBe(0);
    expect(body.total).toBe(0);
  });

  test('[TC-026] Non-existent product id -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/products/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
    expect(body.message).toContain('999999');
  });

  test('[TC-027] Non-numeric product id -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/products/abc');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('abc');
  });

  test('[TC-028] Invalid limit type -> 400', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/products?limit=abc');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('limit');
  });

  test('[TC-029] Negative limit -> 400', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/products?limit=-1');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('limit');
  });

  test('[TC-030] Negative skip -> 400', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/products?skip=-5');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('skip');
  });

  test('[TC-031] Add product (simulated, not persisted)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.post('/products/add', { data: { title: 'BMW Pencil', price: 9.99 } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(typeof body.id).toBe('number');
    expect(body.title).toBe('BMW Pencil');
    expect(body.price).toBe(9.99);
  });

  test('[TC-032] Add product with empty body still creates stub', { tag: ['@negative'] }, async ({ request }) => {
    const res = await request.post('/products/add', { data: {} });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(typeof body.id).toBe('number');
  });

  test('[TC-033] Update product title (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.put('/products/1', { data: { title: 'iPhone Galaxy +1' } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.title).toBe('iPhone Galaxy +1');
    expect(typeof body.price).toBe('number');
  });

  test('[TC-034] Partial update product price (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.patch('/products/1', { data: { price: 1.23 } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.price).toBe(1.23);
  });

  test('[TC-035] Update non-existent product -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.put('/products/999999', { data: { title: 'X' } });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });

  test('[TC-036] Delete product (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.delete('/products/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.isDeleted).toBe(true);
    expect(Number.isNaN(Date.parse(body.deletedOn))).toBe(false);
  });

  test('[TC-037] Delete non-existent product -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.delete('/products/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });

  test('[TC-038] Delete is simulated: product still exists afterwards', { tag: ['@body-validation', '@idempotency'] }, async ({ request }) => {
    const res = await request.get('/products/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
  });
});
