# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.ts >> Login and logout flow works correctly
- Location: tests\ui.spec.ts:11:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Dashboard').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Dashboard').first()

```

```yaml
- img "Interior Duct Ltd"
- heading "Interior Duct Ltd Login" [level=1]
- paragraph: Access the IDL-RIS business document manager and stay compliant with Nigerian financial workflows.
- text: Email
- textbox "admin or interiorductltd@gmail.com": admin
- text: Password
- textbox "••••••••": admin
- paragraph: Login failed. Verify email and password.
- button "Sign in"
- paragraph: "Demo: Use email \"admin\" and password \"admin\""
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Home page loads and shows app shell', async ({ page }) => {
  4  |   await page.goto('http://localhost:5173/IDL-Document-Manager/');
  5  |   await page.waitForLoadState('networkidle');
  6  |   const h1 = page.locator('h1, .app-title, header');
  7  |   await expect(h1.first()).toBeVisible({ timeout: 10000 });
  8  |   await page.screenshot({ path: 'playwright-home-screenshot.png', fullPage: true });
  9  | });
  10 | 
  11 | test('Login and logout flow works correctly', async ({ page }) => {
  12 |   // Navigate to login page
  13 |   await page.goto('http://localhost:5173/IDL-Document-Manager/');
  14 |   await page.waitForLoadState('networkidle');
  15 | 
  16 |   // Login with admin/admin
  17 |   const emailInput = page.locator('input[type="text"], input[placeholder*="admin"]').first();
  18 |   const passwordInput = page.locator('input[type="password"]');
  19 |   const submitButton = page.locator('button[type="submit"]');
  20 | 
  21 |   await emailInput.fill('admin');
  22 |   await passwordInput.fill('admin');
  23 |   await submitButton.click();
  24 | 
  25 |   // Wait for dashboard to load
  26 |   await page.waitForURL(/.*IDL-Document-Manager.*/, { timeout: 10000 });
  27 | 
  28 |   // Verify dashboard is visible
  29 |   const dashboard = page.locator('text=Dashboard').first();
> 30 |   await expect(dashboard).toBeVisible({ timeout: 5000 });
     |                           ^ Error: expect(locator).toBeVisible() failed
  31 | 
  32 |   // Take screenshot of dashboard
  33 |   await page.screenshot({ path: 'playwright-dashboard-screenshot.png', fullPage: true });
  34 | 
  35 |   // Find and click logout button
  36 |   const logoutButton = page.locator('button', { hasText: /Logout/ });
  37 |   await logoutButton.click();
  38 | 
  39 |   // Wait for redirect to login page
  40 |   await page.waitForURL(/.*IDL-Document-Manager.*/, { timeout: 5000 });
  41 | 
  42 |   // Verify we're back at login page (check for login form)
  43 |   const loginHeading = page.locator('text=Interior Duct Ltd Login');
  44 |   await expect(loginHeading).toBeVisible({ timeout: 5000 });
  45 | 
  46 |   // Verify localStorage token is cleared
  47 |   const token = await page.evaluate(() => window.localStorage.getItem('idl_ris_token'));
  48 |   expect(token).toBeNull();
  49 | 
  50 |   await page.screenshot({ path: 'playwright-login-after-logout.png', fullPage: true });
  51 | });
  52 | 
  53 | 
```