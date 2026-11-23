import { test, expect } from '../../src/fixtures/auth';

test.describe('Todos', () => {
  test('[TC-086] Get single todo', { tag: ['@happy', '@smoke'] }, async ({ request }) => {
    const res = await request.get('/todos/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(typeof body.todo).toBe('string');
    expect(typeof body.completed).toBe('boolean');
    expect(typeof body.userId).toBe('number');
  });

  test('[TC-087] Random todo', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/todos/random');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('todo');
    expect(body).toHaveProperty('completed');
    expect(body).toHaveProperty('userId');
  });

  test('[TC-088] Todos by user', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/todos/user/5?limit=3');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const t of body.todos) {
      expect(t.userId).toBe(5);
    }
    expect(body.todos.length).toBeLessThanOrEqual(3);
  });

  test('[TC-089] Add todo (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.post('/todos/add', {
      data: { todo: 'Use DummyJSON in the project', completed: false, userId: 5 },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.todo).toBe('Use DummyJSON in the project');
    expect(body.completed).toBe(false);
    expect(body.userId).toBe(5);
  });

  test('[TC-090] Add todo without userId -> 400', { tag: ['@negative', '@error-code'] }, async ({ request }) => {
    const res = await request.post('/todos/add', { data: {} });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('User id is required');
  });

  test('[TC-091] Update todo completed flag (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.put('/todos/1', { data: { completed: false } });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(1);
    expect(body.completed).toBe(false);
  });

  test('[TC-092] Delete todo (simulated)', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.delete('/todos/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.isDeleted).toBe(true);
  });

  test('[TC-093] Non-existent todo -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/todos/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });
});
