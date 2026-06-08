import { test, expect } from '@playwright/test';

test('Home page loads and shows app shell', async ({ page }) => {
  // Navigate to the Vite dev path used by the app
  await page.goto('http://localhost:5173/IDL-Document-Manager/');
  await expect(page).toHaveURL(/IDL-Document-Manager/);
  const h1 = page.locator('h1, .app-title, header');
  await expect(h1.first()).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'playwright-home-screenshot.png', fullPage: true });
});
