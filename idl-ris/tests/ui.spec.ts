import { test, expect } from '@playwright/test';

test('Home page loads and shows app shell', async ({ page }) => {
  await page.goto('http://localhost:5173/IDL-Document-Manager/');
  await page.waitForLoadState('networkidle');
  const h1 = page.locator('h1, .app-title, header');
  await expect(h1.first()).toBeVisible({ timeout: 10000 });
  await page.screenshot({ path: 'playwright-home-screenshot.png', fullPage: true });
});

test('Login and logout flow works correctly', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:5173/IDL-Document-Manager/');
  await page.waitForLoadState('networkidle');

  // Login with admin/admin
  const emailInput = page.locator('input[type="text"], input[placeholder*="admin"]').first();
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button[type="submit"]');

  await emailInput.fill('admin');
  await passwordInput.fill('admin');
  await submitButton.click();

  // Wait for dashboard to load
  await page.waitForURL(/.*IDL-Document-Manager.*/, { timeout: 10000 });

  // Verify dashboard is visible
  const dashboard = page.locator('text=Dashboard').first();
  await expect(dashboard).toBeVisible({ timeout: 5000 });

  // Take screenshot of dashboard
  await page.screenshot({ path: 'playwright-dashboard-screenshot.png', fullPage: true });

  // Find and click logout button
  const logoutButton = page.locator('button', { hasText: /Logout/ });
  await logoutButton.click();

  // Wait for redirect to login page
  await page.waitForURL(/.*IDL-Document-Manager.*/, { timeout: 5000 });

  // Verify we're back at login page (check for login form)
  const loginHeading = page.locator('text=Interior Duct Ltd Login');
  await expect(loginHeading).toBeVisible({ timeout: 5000 });

  // Verify localStorage token is cleared
  const token = await page.evaluate(() => window.localStorage.getItem('idl_ris_token'));
  expect(token).toBeNull();

  await page.screenshot({ path: 'playwright-login-after-logout.png', fullPage: true });
});

