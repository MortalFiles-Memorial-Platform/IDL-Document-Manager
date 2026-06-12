# Department-Based Access Control Implementation Guide

## Overview

The IDL-RIS system now implements comprehensive department-based access control that restricts users to viewing only the tabs and documents relevant to their department. This ensures unauthorized users cannot access departments or assets they don't belong to.

## Architecture

### 1. **Database Layer (Prisma Schema)**
- Added optional `department` field to `User` model
- Departments map to roles: `ADMIN`, `SALES`, `FINANCE`, `PROCUREMENT`, `AUDITOR`
- Department field is stored alongside role for future extensibility

```prisma
model User {
  id            Int              @id @default(autoincrement())
  email         String           @unique
  password      String
  firstName     String
  lastName      String
  role          String           @default("SALES")
  department    String?          // Maps to role for access control
  isActive      Boolean          @default(true)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  // ... relations
}
```

### 2. **Backend Authentication**
Updated JWT token generation and user profile endpoints to include department information.

**Authentication Routes (`src/server/routes/auth.ts`):**
- `POST /auth/login` - Returns department in user response
- `GET /auth/me` - Includes department in authenticated user profile

**JWT Payload Structure:**
```typescript
{
  userId: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  department?: string;
}
```

### 3. **Frontend Type System**
Updated `UserProfile` interface to include department:

```typescript
export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
}
```

### 4. **Navigation Access Control**

#### Department-to-Tab Mapping

| Department | Accessible Tabs |
|-----------|-----------------|
| **ADMIN** | Dashboard, Documents, Customers, Suppliers, Inventory, Loans, Approvals, Audit Logs, General Ledger, Profit & Loss, Balance Sheet |
| **SALES** | Dashboard, Documents, Customers, Approvals |
| **FINANCE** | Dashboard, Documents, Customers, Suppliers, Loans, Approvals, General Ledger, Profit & Loss, Balance Sheet |
| **PROCUREMENT** | Dashboard, Documents, Suppliers, Inventory, Approvals |
| **AUDITOR** | Dashboard, Documents, Audit Logs |

#### Document Type Access Control

Document types are filtered based on user role/department:

```typescript
{
  'SALES_RECEIPT': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'SALES_INVOICE': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'PROFORMA_INVOICE': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'QUOTATION': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'DELIVERY_NOTE': ['ADMIN', 'SALES', 'PROCUREMENT', 'AUDITOR'],
  'CASH_RECEIPT': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'PAYMENT_VOUCHER': ['ADMIN', 'FINANCE', 'AUDITOR'],
  'IMPREST_VOUCHER': ['ADMIN', 'FINANCE', 'AUDITOR'],
  'EXPENSE_VOUCHER': ['ADMIN', 'FINANCE', 'AUDITOR'],
  'PURCHASE_RECEIPT': ['ADMIN', 'PROCUREMENT', 'FINANCE', 'AUDITOR'],
  'PURCHASE_INVOICE': ['ADMIN', 'PROCUREMENT', 'FINANCE', 'AUDITOR'],
  'LOAN_RECEIPT': ['ADMIN', 'FINANCE', 'AUDITOR'],
  'LOAN_REPAYMENT_RECEIPT': ['ADMIN', 'FINANCE', 'AUDITOR'],
  'SERVICE_COMPLETION_CERTIFICATE': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR']
}
```

### 5. **Frontend Components**

#### Sidebar Component (`src/client/components/Sidebar.tsx`)
- Filters navigation items based on user's department
- Shows department name in welcome message
- Only renders accessible tabs

```typescript
const filteredNavItems = navItems.filter(item => {
  const userDept = user.department || user.role;
  return item.departments.includes(userDept);
});
```

#### Mobile Navigation (`src/client/components/MobileNav.tsx`)
- Same filtering logic as desktop sidebar
- Ensures consistent access control across devices

## Implementation Details

### Navigation Items Configuration

Each navigation item includes a `departments` array specifying which departments can access it:

```typescript
const navItems = [
  { 
    path: '/', 
    label: 'Dashboard', 
    icon: Database, 
    departments: ['ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT', 'AUDITOR'] 
  },
  { 
    path: '/customers', 
    label: 'Customers', 
    icon: Users, 
    departments: ['ADMIN', 'SALES', 'FINANCE'] 
  },
  { 
    path: '/inventory', 
    label: 'Inventory', 
    icon: Layers, 
    departments: ['ADMIN', 'PROCUREMENT'] 
  },
  // ... more items
];
```

### Department Resolution

The system uses a helper function to determine user's access department:

```typescript
function getUserAccessDepartment(user: UserProfile): string {
  return user.department || user.role;
}
```

This ensures backward compatibility: if `department` is not set, it falls back to `role`.

## Testing Access Control

### Test Users (Default Credentials: `password123`)

| Role | Email | Department | Accessible Tabs |
|------|-------|-----------|-----------------|
| ADMIN | admin@idl.ng | ADMIN | All tabs |
| Finance | finance@idl.ng | FINANCE | Financial & Document tabs |
| Accounts | accounts@idl.ng | FINANCE | Financial & Document tabs |
| Sales | sales@idl.ng | SALES | Sales & Document tabs |
| Procurement | inventory@idl.ng | PROCUREMENT | Procurement & Inventory tabs |
| Procurement | maintenance@idl.ng | PROCUREMENT | Procurement & Inventory tabs |
| Auditor | auditor@idl.ng | AUDITOR | Dashboard, Documents, Audit Logs |

### Manual Testing Steps

1. **Test SALES user login:**
   ```
   Login with: sales@idl.ng / password123
   Expected: Only see Dashboard, Documents, Customers, Approvals tabs
   Verify: Cannot access Inventory, Audit Logs, General Ledger tabs
   ```

2. **Test FINANCE user login:**
   ```
   Login with: finance@idl.ng / password123
   Expected: See Dashboard, Documents, Customers, Suppliers, Loans, Approvals, General Ledger, P&L, Balance Sheet
   Verify: Cannot access Inventory tab
   ```

3. **Test PROCUREMENT user login:**
   ```
   Login with: inventory@idl.ng / password123
   Expected: See Dashboard, Documents, Suppliers, Inventory, Approvals
   Verify: Cannot access Customers, General Ledger tabs
   ```

4. **Test AUDITOR user login:**
   ```
   Login with: auditor@idl.ng / password123
   Expected: Only see Dashboard, Documents, Audit Logs
   Verify: Cannot access other tabs
   ```

5. **Verify document filtering:**
   - Login as SALES user
   - Navigate to Documents tab
   - Verify only SALES document types are visible (Receipts, Invoices, Quotations)
   - Verify cannot access Finance documents (Payment Vouchers, Loan Receipts)

## Backend Access Control

### Role-Based Authorization Middleware

The backend enforces access control through middleware:

**`src/server/middleware/documentRbac.ts`:**
```typescript
export function canAccessDocumentType(userRole: string, docType: string): boolean {
  if (userRole === 'ADMIN') return true;
  const allowedRoles = documentTypeRoleMap[docType] || ['ADMIN'];
  return allowedRoles.includes(userRole);
}
```

### Document Filtering

All document queries filter results based on user's role:

```typescript
router.get('/', authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT', 'AUDITOR'), 
  async (req: AuthRequest, res) => {
    const userRole = req.user?.role;
    const docs = await prisma.document.findMany({ /* ... */ });
    
    // Filter documents based on user's role and document type access
    const filteredDocs = docs.filter(doc => 
      canAccessDocumentType(userRole || '', doc.docType)
    );
    res.json(filteredDocs);
  }
);
```

## Security Considerations

### 1. **Frontend Filtering**
- Navigation items are filtered client-side based on department
- This improves UX by hiding inaccessible features
- **Not a security boundary** - rely on backend validation

### 2. **Backend Enforcement**
- All API endpoints validate user's role/department
- Document queries filter results server-side
- Database relationships enforce data isolation

### 3. **JWT Token Validation**
- Department is included in signed JWT token
- Tokens are verified on every request
- Invalid/expired tokens result in 401 Unauthorized

### 4. **Prevention of Access**
- Accessing unauthorized routes returns 403 Forbidden
- Documents inaccessible to user's role are filtered from results
- Tab navigation UI does not expose restricted pages

## Maintenance & Future Enhancements

### Adding New Departments

1. Add new department value to `User.department` field
2. Update navigation item `departments` array in Sidebar.tsx and MobileNav.tsx
3. Update `documentTypeRoleMap` in middleware/documentRbac.ts
4. Add test user with new department in seed.ts
5. Document new department in this guide

### Example: Adding "SUPPORT" Department

```typescript
// 1. Add to navItems
{ 
  path: '/customers', 
  label: 'Customers', 
  icon: Users, 
  departments: ['ADMIN', 'SALES', 'FINANCE', 'SUPPORT']  // Added SUPPORT
}

// 2. Update documentTypeRoleMap
'SALES_RECEIPT': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR', 'SUPPORT'],

// 3. Add seed user
{
  email: 'support@idl.ng',
  password: hashedPassword,
  firstName: 'User',
  lastName: 'Support',
  role: 'SUPPORT',
  department: 'SUPPORT',
}
```

### Audit Logging

All document access is logged through the audit system:

```typescript
await logAudit('VIEW_DOCUMENT', 'Document', doc.id, req.user?.id, 
  `User from ${req.user?.department} department viewed document`);
```

## Troubleshooting

### Issue: All tabs visible despite being in restricted department

**Cause:** User's JWT token may not include department field
**Solution:** 
1. Re-login to get new token with department
2. Clear browser cache/cookies
3. Check that backend is returning department in auth response

### Issue: Cannot access documents for my department

**Cause:** Document type not mapped to user's role in documentTypeRoleMap
**Solution:**
1. Check documentRbac.ts mapping
2. Verify document docType matches mapping key
3. Add role to allowedRoles for that docType

### Issue: Sidebar shows extra tabs on mobile but not desktop

**Cause:** MobileNav and Sidebar filtering logic out of sync
**Solution:**
1. Ensure both components use same `departments` arrays in navItems
2. Verify `getUserAccessDepartment()` function is identical
3. Test on same user login

## Summary

The department-based access control system provides:

✅ **Frontend filtering** - Hide inaccessible tabs based on department
✅ **Backend enforcement** - Validate department on all API requests
✅ **Document filtering** - Show only documents relevant to user's department
✅ **Role-based access** - Fine-grained control over document types
✅ **Security** - Prevent unauthorized access to sensitive data
✅ **Audit trail** - Log all document access by department
✅ **Scalability** - Easy to add new departments or roles

This ensures that users from different departments (Sales, Finance, Procurement, etc.) only see and can access the documents and features relevant to their work.
