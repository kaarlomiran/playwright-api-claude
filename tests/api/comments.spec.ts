import { test, expect } from '../../src/fixtures/auth';

test.describe('Comments', () => {
  test('[TC-099] Get single comment', { tag: ['@happy', '@smoke'] }, async ({ request }) => {
    const res = await request.get('/comments/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.user).toHaveProperty('id');
    expect(body.user).toHaveProperty('username');
    expect(body.user).toHaveProperty('fullName');
  });

  test('[TC-100] Add comment (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.post('/comments/add', {
      data: { body: 'This makes all sense to me!', postId: 3, userId: 5 },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.body).toBe('This makes all sense to me!');
    expect(body.postId).toBe(3);
  });

  test('[TC-101] Non-existent comment -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/comments/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });
});
