# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Dashboard E2E Tests >> User can view dashboard metrics
- Location: e2e\auth.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /CUSTOMERS/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /CUSTOMERS/i })

```

```yaml
- complementary:
  - link "Interior Duct Ltd IDL-RIS Portal Welcome, Demo Manage documents, customers, inventory, approvals and compliance from one secure system.":
    - /url: /
    - img "Interior Duct Ltd"
    - paragraph: IDL-RIS Portal
    - heading "Welcome, Demo" [level=2]
    - paragraph: Manage documents, customers, inventory, approvals and compliance from one secure system.
  - navigation:
    - link "Dashboard":
      - /url: /
    - link "Documents":
      - /url: /documents
    - link "Customers":
      - /url: /customers
    - link "Suppliers":
      - /url: /suppliers
    - link "Inventory":
      - /url: /inventory
    - link "Loans":
      - /url: /loans
    - link "Approvals":
      - /url: /approvals
    - link "Audit Logs":
      - /url: /audit
    - link "General Ledger":
      - /url: /general-ledger
    - link "Profit & Loss":
      - /url: /profit-loss
    - link "Balance Sheet":
      - /url: /balance-sheet
- main:
  - link "Interior Duct Ltd Interior Duct Ltd Receipts & Invoice Management Enterprise-grade document management built for Nigerian manufacturing and services.":
    - /url: /
    - img "Interior Duct Ltd"
    - paragraph: Interior Duct Ltd
    - heading "Receipts & Invoice Management" [level=1]
    - paragraph: Enterprise-grade document management built for Nigerian manufacturing and services.
  - paragraph: Demo User
  - paragraph: ADMIN
  - button "Logout"
  - paragraph: Customers
  - paragraph: ––
  - paragraph: Suppliers
  - paragraph: ––
  - paragraph: Inventory items
  - paragraph: ––
  - paragraph: Revenue (NGN)
  - paragraph: ––
  - paragraph: Expenses (NGN)
  - paragraph: ––
  - paragraph: Loan principal (NGN)
  - paragraph: ––
  - heading "Business Intelligence" [level=2]
  - paragraph: Review document status, audit readiness, and approval pipeline for Interior Duct Ltd.
  - button "Refresh"
  - heading "Compliance Summary" [level=2]
  - list:
    - listitem: • VAT-ready templates for Nigerian tax compliance
    - listitem: • Audit trails captured on every document action
    - listitem: • Role-based access for finance, sales, procurement and auditors
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Dashboard E2E Tests', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('http://localhost:5173');
  6  |   });
  7  | 
  8  |   test('Dashboard loads with authenticated user', async ({ page }) => {
  9  |     // Verify dashboard is loaded
  10 |     await expect(page.locator('text=Receipts & Invoice Management')).toBeVisible();
  11 |     await expect(page.locator('text=Welcome, Demo')).toBeVisible();
  12 | 
  13 |     // Check logout button is present
  14 |     await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  15 |   });
  16 | 
  17 |   test('User can view dashboard metrics', async ({ page }) => {
  18 |     // Check main metrics are displayed using role-based locators
> 19 |     await expect(page.getByRole('heading', { name: /CUSTOMERS/i })).toBeVisible();
     |                                                                     ^ Error: expect(locator).toBeVisible() failed
  20 |     await expect(page.getByRole('heading', { name: /SUPPLIERS/i })).toBeVisible();
  21 |     await expect(page.getByRole('heading', { name: /INVENTORY ITEMS/i })).toBeVisible();
  22 | 
  23 |     // Verify metrics section contains numbers
  24 |     const customersSection = page.locator('text=CUSTOMERS').first();
  25 |     await expect(customersSection.locator('xpath=following-sibling::*[contains(text(), "3")]')).toBeVisible();
  26 |   });
  27 | 
  28 |   test('User can navigate to Documents page', async ({ page }) => {
  29 |     // Click Documents in sidebar using a more specific selector
  30 |     await page.getByRole('link', { name: /Documents/i }).click();
  31 | 
  32 |     // Verify navigation by checking page title/heading
  33 |     await page.waitForLoadState('networkidle');
  34 |     const currentUrl = page.url();
  35 |     expect(currentUrl).toContain('/documents');
  36 |   });
  37 | 
  38 |   test('User can navigate to Customers page', async ({ page }) => {
  39 |     // Click Customers in sidebar
  40 |     const customerLink = page.locator('a:has-text("Customers")').first();
  41 |     await customerLink.click();
  42 | 
  43 |     // Verify navigation
  44 |     await page.waitForLoadState('networkidle');
  45 |     const currentUrl = page.url();
  46 |     expect(currentUrl).toContain('/customers');
  47 |   });
  48 | 
  49 |   test('User can navigate to Suppliers page', async ({ page }) => {
  50 |     // Click Suppliers in sidebar
  51 |     const supplierLink = page.locator('a:has-text("Suppliers")').first();
  52 |     await supplierLink.click();
  53 | 
  54 |     // Verify navigation
  55 |     await page.waitForLoadState('networkidle');
  56 |     const currentUrl = page.url();
  57 |     expect(currentUrl).toContain('/suppliers');
  58 |   });
  59 | 
  60 |   test('User can navigate to Inventory', async ({ page }) => {
  61 |     // Click Inventory in sidebar
  62 |     const inventoryLink = page.locator('a:has-text("Inventory")').first();
  63 |     await inventoryLink.click();
  64 | 
  65 |     // Verify navigation
  66 |     await page.waitForLoadState('networkidle');
  67 |     const currentUrl = page.url();
  68 |     expect(currentUrl).toContain('/inventory');
  69 |   });
  70 | 
  71 |   test('Logout button is accessible', async ({ page }) => {
  72 |     // Find and verify logout button
  73 |     const logoutButton = page.locator('button:has-text("Logout")');
  74 |     await expect(logoutButton).toBeVisible();
  75 | 
  76 |     // Verify it's clickable
  77 |     await expect(logoutButton).toBeEnabled();
  78 |   });
  79 | 
  80 |   test('Business Intelligence section is displayed', async ({ page }) => {
  81 |     // Check BI section is visible
  82 |     await expect(page.locator('text=Business Intelligence')).toBeVisible();
  83 |     await expect(page.locator('text=Review document status')).toBeVisible();
  84 | 
  85 |     // Check Refresh button exists
  86 |     await expect(page.locator('button:has-text("Refresh")')).toBeVisible();
  87 |   });
  88 | 
  89 |   test('Compliance Summary is displayed', async ({ page }) => {
  90 |     // Check compliance section
  91 |     await expect(page.locator('text=Compliance Summary')).toBeVisible();
  92 |     await expect(page.locator('text=VAT-ready templates')).toBeVisible();
  93 |     await expect(page.locator('text=Audit trails captured')).toBeVisible();
  94 |   });
  95 | });
  96 | 
```