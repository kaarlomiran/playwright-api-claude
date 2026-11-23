import { test, expect } from '../../src/fixtures/auth';

test.describe('Posts', () => {
  test('[TC-094] Get single post', { tag: ['@happy', '@smoke'] }, async ({ request }) => {
    const res = await request.get('/posts/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(Array.isArray(body.tags)).toBe(true);
    expect(typeof body.reactions.likes).toBe('number');
    expect(typeof body.reactions.dislikes).toBe('number');
  });

  test('[TC-095] Search posts', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/posts/search?q=love&limit=5');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.posts)).toBe(true);
    expect(body.total).toBeGreaterThanOrEqual(body.posts.length);
  });

  test('[TC-096] Comments of a post', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/posts/1/comments');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const c of body.comments) {
      expect(c.postId).toBe(1);
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('body');
      expect(c).toHaveProperty('likes');
      expect(c.user).toHaveProperty('id');
      expect(c.user).toHaveProperty('username');
      expect(c.user).toHaveProperty('fullName');
    }
  });

  test('[TC-097] Add post (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.post('/posts/add', { data: { title: 'I am in love with someone.', userId: 5 } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.title).toBe('I am in love with someone.');
    expect(body.userId).toBe(5);
  });

  test('[TC-098] Non-existent post -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/posts/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });
});
