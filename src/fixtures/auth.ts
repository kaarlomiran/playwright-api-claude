import { test as base, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.BASE_URL ?? 'https://dummyjson.com';
type Tokens = { accessToken: string; refreshToken: string };

export const test = base.extend<{ anon: APIRequestContext }, { tokens: Tokens }>({
  // One login per worker; public demo credentials from the DummyJSON docs.
  tokens: [async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL });
    const res = await ctx.post('/auth/login', {
      data: {
        username: process.env.API_USER ?? 'emilys',
        password: process.env.API_PASS ?? 'emilyspass',
        expiresInMins: 30,
      },
    });
    expect(res.status(), 'login fixture').toBe(200);
    const body = await res.json();
    await use({ accessToken: body.accessToken, refreshToken: body.refreshToken });
    await ctx.dispose();
  }, { scope: 'worker' }],

  // Fresh context with no cookies/headers: use for "no token" negative tests.
  anon: async ({ playwright }, use) => {
    const ctx = await playwright.request.newContext({ baseURL: BASE_URL });
    await use(ctx);
    await ctx.dispose();
  },
});
export { expect };
