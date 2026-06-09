import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 5000,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  reporter: [['list'], ['html', { open: 'never' }]]
});
