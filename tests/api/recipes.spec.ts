import { test, expect } from '../../src/fixtures/auth';

test.describe('Recipes', () => {
  test('[TC-105] Recipe schema', { tag: ['@body-validation'] }, async ({ request }) => {
    const res = await request.get('/recipes/1');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.ingredients)).toBe(true);
    expect(body.ingredients.length).toBeGreaterThan(0);
    for (const i of body.ingredients) expect(typeof i).toBe('string');
    expect(Array.isArray(body.instructions)).toBe(true);
    expect(body.instructions.length).toBeGreaterThan(0);
    for (const i of body.instructions) expect(typeof i).toBe('string');
    expect(typeof body.prepTimeMinutes).toBe('number');
    expect(typeof body.cookTimeMinutes).toBe('number');
    expect(typeof body.servings).toBe('number');
    expect(['Easy', 'Medium', 'Hard']).toContain(body.difficulty);
  });

  test('[TC-106] Search recipes', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/recipes/search?q=pizza&limit=3');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.recipes)).toBe(true);
  });

  test('[TC-107] List recipe tags', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/recipes/tags');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    for (const t of body) expect(typeof t).toBe('string');
    expect(body.length).toBeGreaterThan(0);
  });

  test('[TC-108] Recipes by meal type', { tag: ['@happy'] }, async ({ request }) => {
    const res = await request.get('/recipes/meal-type/snack?limit=3');
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const r of body.recipes) {
      expect(r.mealType).toContain('Snack');
    }
  });

  test('[TC-109] Non-existent recipe -> 404', { tag: ['@error-code'] }, async ({ request }) => {
    const res = await request.get('/recipes/999999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });
});
