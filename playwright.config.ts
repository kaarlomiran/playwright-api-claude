import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // retries expose flaky tests as "flaky"
  workers: process.env.CI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://dummyjson.com',
    extraHTTPHeaders: { Accept: 'application/json' },
    trace: 'retain-on-failure', // saved to test-results/ for every failed attempt, incl. first try of a flaky test
  },
  projects: [{ name: 'api', testMatch: /.*\.spec\.ts/ }],
});
