# Department-Based Access Control - Quick Reference

## 🚀 Quick Start - Testing Access Control

### Test Users (Password: `password123`)

| Email | Department | Access |
|-------|-----------|--------|
| admin@idl.ng | ADMIN | ✅ All tabs |
| sales@idl.ng | SALES | Dashboard, Documents, Customers, Approvals |
| finance@idl.ng | FINANCE | Dashboard, Documents, Customers, Suppliers, Loans, Approvals, GL, P&L, Balance Sheet |
| inventory@idl.ng | PROCUREMENT | Dashboard, Documents, Suppliers, Inventory, Approvals |
| auditor@idl.ng | AUDITOR | Dashboard, Documents, Audit Logs |

## 📱 What Changed

### Database
```sql
ALTER TABLE "User" ADD COLUMN "department" TEXT;
```

### Frontend Components
- `Sidebar.tsx` - Filters tabs by department
- `MobileNav.tsx` - Filters tabs by department
- `types.ts` - Added department to UserProfile

### Backend Routes
- `auth.ts` - Returns department in JWT
- Middleware validates access on all requests

## 🔍 How It Works

1. **User logs in** → Backend creates JWT with department
2. **JWT returned** → Frontend stores department in UserProfile
3. **Sidebar renders** → Filters navigation items by department
4. **Tab clicked** → Frontend navigates to route
5. **API called** → Backend validates role/department again
6. **Documents returned** → Filtered by user's role

## ✅ Access Control Rules

### Tab Visibility
```
ADMIN: All tabs visible
SALES: Documents, Customers, Approvals (no Finance/Audit)
FINANCE: Documents, Customers, Suppliers, Finance tabs (no Inventory/Audit)
PROCUREMENT: Documents, Suppliers, Inventory, Approvals (no Finance/Customers)
AUDITOR: Documents, Audit Logs only
```

### Document Type Access
```
Sales Documents: SALES, FINANCE, ADMIN, AUDITOR
Finance Documents: FINANCE, ADMIN, AUDITOR
Purchase Documents: PROCUREMENT, FINANCE, ADMIN, AUDITOR
Loan Documents: FINANCE, ADMIN, AUDITOR
```

## 🧪 Testing Checklist

- [ ] Login as SALES user → Verify 4 tabs visible
- [ ] Login as FINANCE user → Verify 9 tabs visible
- [ ] Login as PROCUREMENT user → Verify 5 tabs visible
- [ ] Login as AUDITOR user → Verify 3 tabs visible
- [ ] Try manual URL navigation to restricted tab → Should fail
- [ ] Check mobile nav same as desktop
- [ ] Try API call as restricted user → Should return 403
- [ ] Check Documents tab shows only relevant types

## 📂 Key Files

| File | Purpose |
|------|---------|
| prisma/schema.prisma | Database department field |
| src/client/components/Sidebar.tsx | Desktop tab filtering |
| src/client/components/MobileNav.tsx | Mobile tab filtering |
| src/server/middleware/documentRbac.ts | Document access control |
| src/server/routes/auth.ts | Authentication endpoints |

## 🛡️ Security Notes

- **Frontend filtering** = UX improvement (hidden tabs)
- **Backend validation** = Security boundary (enforced)
- Both work together for defense-in-depth

## 🔧 Adding New Department

1. Update navigation items `departments` array in Sidebar.tsx
2. Update navigation items `departments` array in MobileNav.tsx
3. Update `documentTypeRoleMap` in documentRbac.ts
4. Add test user to seed.ts
5. Run: `npx prisma db seed`

## 📊 Tab Access Matrix

```
              Admin  Sales  Finance  Procurement  Auditor
Dashboard      ✅     ✅      ✅        ✅         ✅
Documents      ✅     ✅      ✅        ✅         ✅
Customers      ✅     ✅      ✅        ❌         ❌
Suppliers      ✅     ❌      ✅        ✅         ❌
Inventory      ✅     ❌      ❌        ✅         ❌
Loans          ✅     ❌      ✅        ❌         ❌
Approvals      ✅     ✅      ✅        ✅         ❌
Audit Logs     ✅     ❌      ❌        ❌         ✅
Gen Ledger     ✅     ❌      ✅        ❌         ❌
Profit/Loss    ✅     ❌      ✅        ❌         ❌
Balance Sheet  ✅     ❌      ✅        ❌         ❌
```

## 🚨 Troubleshooting

### Issue: All tabs visible for all users
- **Solution:** Check that user.department is being set and passed correctly
- Verify JWT includes department
- Check Sidebar.tsx filtering logic

### Issue: Can access tab by direct URL
- **Solution:** This is expected for frontend - backend enforces security
- Backend will return 403 if API is called without permission
- Frontend route guards can be added for better UX

### Issue: Documents not filtered
- **Solution:** Check that backend is validating role
- Verify documentTypeRoleMap has correct mappings
- Check user's role is in allowedRoles for document type

## 📚 Documentation Files

- `DEPARTMENT_ACCESS_CONTROL_GUIDE.md` - Comprehensive guide
- `DEPARTMENT_ACCESS_IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `DEPARTMENT_ACCESS_VISUAL_GUIDE.md` - Architecture & visuals
- `DEPARTMENT_ACCESS_QUICK_REFERENCE.md` - This file

## ✨ Summary

✅ Department-based tab hiding implemented
✅ Users only see relevant tabs and documents
✅ Backend enforces access control
✅ Frontend provides better UX
✅ Mobile and desktop consistent
✅ Test users configured
✅ Ready for production use

---

**Effective immediately:** Users now see only the sidebar tabs and documents relevant to their department!
