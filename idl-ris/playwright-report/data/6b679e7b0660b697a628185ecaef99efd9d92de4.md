# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Dashboard E2E Tests >> User can navigate to Documents page
- Location: e2e\auth.spec.ts:28:7

# Error details

```
Error: locator.click: Error: strict mode violation: getByRole('link', { name: /Documents/i }) resolved to 2 elements:
    1) <a href="/" class="mb-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm block hover:shadow-md transition">…</a> aka getByRole('link', { name: 'Interior Duct Ltd IDL-RIS' })
    2) <a href="/documents" class="flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition text-slate-700 hover:bg-slate-100">…</a> aka getByRole('link', { name: 'Documents', exact: true })

Call log:
  - waiting for getByRole('link', { name: /Documents/i })

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - complementary [ref=e5]:
    - link "Interior Duct Ltd IDL-RIS Portal Welcome, Demo Manage documents, customers, inventory, approvals and compliance from one secure system." [ref=e6] [cursor=pointer]:
      - /url: /
      - generic [ref=e7]:
        - img "Interior Duct Ltd" [ref=e8]
        - paragraph [ref=e9]: IDL-RIS Portal
      - heading "Welcome, Demo" [level=2] [ref=e10]
      - paragraph [ref=e11]: Manage documents, customers, inventory, approvals and compliance from one secure system.
    - navigation [ref=e12]:
      - link "Dashboard" [ref=e13] [cursor=pointer]:
        - /url: /
        - img [ref=e14]
        - text: Dashboard
      - link "Documents" [ref=e18] [cursor=pointer]:
        - /url: /documents
        - img [ref=e19]
        - text: Documents
      - link "Customers" [ref=e22] [cursor=pointer]:
        - /url: /customers
        - img [ref=e23]
        - text: Customers
      - link "Suppliers" [ref=e28] [cursor=pointer]:
        - /url: /suppliers
        - img [ref=e29]
        - text: Suppliers
      - link "Inventory" [ref=e32] [cursor=pointer]:
        - /url: /inventory
        - img [ref=e33]
        - text: Inventory
      - link "Loans" [ref=e37] [cursor=pointer]:
        - /url: /loans
        - img [ref=e38]
        - text: Loans
      - link "Approvals" [ref=e41] [cursor=pointer]:
        - /url: /approvals
        - img [ref=e42]
        - text: Approvals
      - link "Audit Logs" [ref=e45] [cursor=pointer]:
        - /url: /audit
        - img [ref=e46]
        - text: Audit Logs
      - link "General Ledger" [ref=e49] [cursor=pointer]:
        - /url: /general-ledger
        - img [ref=e50]
        - text: General Ledger
      - link "Profit & Loss" [ref=e54] [cursor=pointer]:
        - /url: /profit-loss
        - img [ref=e55]
        - text: Profit & Loss
      - link "Balance Sheet" [ref=e57] [cursor=pointer]:
        - /url: /balance-sheet
        - img [ref=e58]
        - text: Balance Sheet
  - main [ref=e61]:
    - generic [ref=e63]:
      - link "Interior Duct Ltd Interior Duct Ltd Receipts & Invoice Management Enterprise-grade document management built for Nigerian manufacturing and services." [ref=e64] [cursor=pointer]:
        - /url: /
        - img "Interior Duct Ltd" [ref=e65]
        - generic [ref=e66]:
          - paragraph [ref=e67]: Interior Duct Ltd
          - heading "Receipts & Invoice Management" [level=1] [ref=e68]
          - paragraph [ref=e69]: Enterprise-grade document management built for Nigerian manufacturing and services.
      - generic [ref=e70]:
        - img [ref=e71]
        - generic [ref=e75]:
          - paragraph [ref=e76]: Demo User
          - paragraph [ref=e77]: ADMIN
        - button "Logout" [ref=e78] [cursor=pointer]:
          - img [ref=e79]
          - text: Logout
    - generic [ref=e82]:
      - generic [ref=e83]:
        - generic [ref=e84]:
          - paragraph [ref=e85]: Customers
          - paragraph [ref=e86]: ––
        - generic [ref=e87]:
          - paragraph [ref=e88]: Suppliers
          - paragraph [ref=e89]: ––
        - generic [ref=e90]:
          - paragraph [ref=e91]: Inventory items
          - paragraph [ref=e92]: ––
      - generic [ref=e93]:
        - generic [ref=e94]:
          - paragraph [ref=e95]: Revenue (NGN)
          - paragraph [ref=e96]: ––
        - generic [ref=e97]:
          - paragraph [ref=e98]: Expenses (NGN)
          - paragraph [ref=e99]: ––
        - generic [ref=e100]:
          - paragraph [ref=e101]: Loan principal (NGN)
          - paragraph [ref=e102]: ––
      - generic [ref=e103]:
        - generic [ref=e105]:
          - generic [ref=e106]:
            - heading "Business Intelligence" [level=2] [ref=e107]
            - paragraph [ref=e108]: Review document status, audit readiness, and approval pipeline for Interior Duct Ltd.
          - button "Refresh" [ref=e109] [cursor=pointer]
        - generic [ref=e110]:
          - heading "Compliance Summary" [level=2] [ref=e111]
          - list [ref=e112]:
            - listitem [ref=e113]: • VAT-ready templates for Nigerian tax compliance
            - listitem [ref=e114]: • Audit trails captured on every document action
            - listitem [ref=e115]: • Role-based access for finance, sales, procurement and auditors
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
  19 |     await expect(page.getByRole('heading', { name: /CUSTOMERS/i })).toBeVisible();
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
> 30 |     await page.getByRole('link', { name: /Documents/i }).click();
     |                                                          ^ Error: locator.click: Error: strict mode violation: getByRole('link', { name: /Documents/i }) resolved to 2 elements:
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