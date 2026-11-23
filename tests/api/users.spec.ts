import { test, expect } from '../../src/fixtures/auth';

test.describe('Users', () => {
  test('[TC-064] List users default pagination', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/users');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.users.length).toBeLessThanOrEqual(30);
    expect(body.skip).toBe(0);
    expect(body.total).toBeGreaterThanOrEqual(body.users.length);
  });

  test('[TC-065] Get single user', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/users/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(typeof body.firstName).toBe('string');
    expect(typeof body.lastName).toBe('string');
  });

  test('[TC-066] User schema and nested objects', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/users/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.hair).toHaveProperty('color');
    expect(body.hair).toHaveProperty('type');
    expect(body.address).toHaveProperty('address');
    expect(body.address).toHaveProperty('city');
    expect(body.address).toHaveProperty('state');
    expect(body.address).toHaveProperty('postalCode');
    expect(body.address.coordinates).toHaveProperty('lat');
    expect(body.address.coordinates).toHaveProperty('lng');
    expect(body.bank).toHaveProperty('cardNumber');
    expect(body.bank).toHaveProperty('cardType');
    expect(body.bank).toHaveProperty('currency');
    expect(['admin', 'moderator', 'user']).toContain(body.role);
  });

  test('[TC-067] Search users by name', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/users/search?q=John&limit=5');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.users.length).toBeGreaterThan(0);
    for (const u of body.users) {
      const haystack = `${u.firstName} ${u.lastName} ${u.username}`.toLowerCase();
      expect.soft(haystack).toContain('john');
    }
  });

  test('[TC-068] Filter users by nested key', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/users/filter?key=hair.color&value=Brown&limit=5');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const u of body.users) {
      expect(u.hair.color).toBe('Brown');
    }
    expect(body.total).toBeGreaterThan(0);
  });

  test('[TC-069] Sort users by age ascending', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/users?sortBy=age&order=asc&limit=5');
    expect(res.status()).toBe(200);
    const body = await res.json();
    const ages = body.users.map((u: any) => u.age);
    expect(ages).toEqual([...ages].sort((a, b) => a - b));
  });

  test('[TC-070] Users select projection', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/users?limit=3&select=firstName');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const u of body.users) {
      expect(typeof u.firstName).toBe('string');
      expect(u.lastName).toBeUndefined();
      expect(u.email).toBeUndefined();
    }
  });

  test('[TC-071] Non-existent user -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/users/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });

  test('[TC-072] Non-numeric user id -> 400', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/users/abc');
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('Invalid user id');
  });

  test('[TC-073] Add user (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.post('/users/add', { data: { firstName: 'Muhammad', lastName: 'Ovi', age: 250 } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(typeof body.id).toBe('number');
    expect(body.firstName).toBe('Muhammad');
    expect(body.lastName).toBe('Ovi');
    expect(body.age).toBe(250);
  });

  test('[TC-074] Update user last name (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.put('/users/1', { data: { lastName: 'Owais' } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.lastName).toBe('Owais');
  });

  test('[TC-075] Delete user (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.delete('/users/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.isDeleted).toBe(true);
    expect(Number.isNaN(Date.parse(body.deletedOn))).toBe(false);
  });
});
