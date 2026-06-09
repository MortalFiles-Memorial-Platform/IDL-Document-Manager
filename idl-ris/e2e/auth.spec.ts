import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Dashboard loads with authenticated user', async ({ page }) => {
    // Verify dashboard is loaded
    await expect(page.locator('text=Receipts & Invoice Management')).toBeVisible();
    await expect(page.locator('text=Welcome, Demo')).toBeVisible();

    // Check logout button is present
    await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  });

  test('User can view dashboard metrics', async ({ page }) => {
    // Check main metrics are displayed using role-based locators
    await expect(page.getByRole('heading', { name: /CUSTOMERS/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /SUPPLIERS/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /INVENTORY ITEMS/i })).toBeVisible();

    // Verify metrics section contains numbers
    const customersSection = page.locator('text=CUSTOMERS').first();
    await expect(customersSection.locator('xpath=following-sibling::*[contains(text(), "3")]')).toBeVisible();
  });

  test('User can navigate to Documents page', async ({ page }) => {
    // Click Documents in sidebar using a more specific selector
    await page.getByRole('link', { name: /Documents/i }).click();

    // Verify navigation by checking page title/heading
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toContain('/documents');
  });

  test('User can navigate to Customers page', async ({ page }) => {
    // Click Customers in sidebar
    const customerLink = page.locator('a:has-text("Customers")').first();
    await customerLink.click();

    // Verify navigation
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toContain('/customers');
  });

  test('User can navigate to Suppliers page', async ({ page }) => {
    // Click Suppliers in sidebar
    const supplierLink = page.locator('a:has-text("Suppliers")').first();
    await supplierLink.click();

    // Verify navigation
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toContain('/suppliers');
  });

  test('User can navigate to Inventory', async ({ page }) => {
    // Click Inventory in sidebar
    const inventoryLink = page.locator('a:has-text("Inventory")').first();
    await inventoryLink.click();

    // Verify navigation
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    expect(currentUrl).toContain('/inventory');
  });

  test('Logout button is accessible', async ({ page }) => {
    // Find and verify logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();

    // Verify it's clickable
    await expect(logoutButton).toBeEnabled();
  });

  test('Business Intelligence section is displayed', async ({ page }) => {
    // Check BI section is visible
    await expect(page.locator('text=Business Intelligence')).toBeVisible();
    await expect(page.locator('text=Review document status')).toBeVisible();

    // Check Refresh button exists
    await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
  });

  test('Compliance Summary is displayed', async ({ page }) => {
    // Check compliance section
    await expect(page.locator('text=Compliance Summary')).toBeVisible();
    await expect(page.locator('text=VAT-ready templates')).toBeVisible();
    await expect(page.locator('text=Audit trails captured')).toBeVisible();
  });
});
