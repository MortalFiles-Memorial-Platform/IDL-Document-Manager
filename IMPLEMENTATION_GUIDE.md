# IDL-RIS Implementation & Deployment Guide

**Interior Duct Ltd - Receipts & Invoice System**  
**Version**: 1.0  
**Last Updated**: June 8, 2026

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [GitHub Pages Deployment](#github-pages-deployment)
3. [Authentication & User Management](#authentication--user-management)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [Feature Access Matrix](#feature-access-matrix)
6. [Login Credentials](#login-credentials)
7. [Database Setup](#database-setup)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- SQLite (included with setup)

### Local Development

```bash
# Clone the repository
git clone https://github.com/MortalFiles-Memorial-Platform/IDL-Document-Manager.git
cd IDL-Document-Manager/idl-ris

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your JWT_SECRET

# Initialize database
npm run prisma:generate
npm run prisma:migrate

# Seed database with predefined users
npm run prisma:seed

# Start development server (client + server)
npm run dev
```

**Access locally**:
- 🌐 Frontend: http://localhost:5177
- 🔌 Backend API: http://localhost:4000/api

---

## 🌐 GitHub Pages Deployment

### Step 1: Enable GitHub Pages

1. Go to your GitHub repository: [IDL-Document-Manager](https://github.com/MortalFiles-Memorial-Platform/IDL-Document-Manager)
2. Navigate to **Settings → Pages**
3. Under "Build and deployment":
   - Source: **GitHub Actions**
4. The workflow will automatically deploy on every push to `main`

### Step 2: Configure GitHub Pages URL

The app is automatically deployed to:
```
🔗 https://MortalFiles-Memorial-Platform.github.io/IDL-Document-Manager/
```

### Step 3: Monitor Deployment

1. Go to **Actions** tab in the repository
2. Watch the `Deploy to GitHub Pages` workflow
3. Once complete, your app is live!

### Step 4: Custom Domain (Optional)

To use a custom domain:
1. Settings → Pages → Custom domain
2. Enter your domain (e.g., `idl-ris.ng`)
3. Update DNS records as instructed

---

## 🔐 Authentication & User Management

### How Authentication Works

1. **Login Page**: User enters email and password
2. **Verification**: Backend validates credentials against database
3. **Token Generation**: JWT token issued on successful login
4. **Session Storage**: Token stored in browser localStorage
5. **Protected Routes**: All API requests include token in Authorization header
6. **Session Persistence**: User session restored on page reload

### Enabling/Disabling Auth Bypass

**For Development** (bypass login):
```typescript
// In src/client/App.tsx & src/client/context/AuthContext.tsx
const BYPASS_AUTH = true;  // Set to true to skip login
```

**For Production** (require login):
```typescript
const BYPASS_AUTH = false;  // Users must login
```

### Environment Variables

Create `.env.local` in `idl-ris/` directory:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=8h
DATABASE_URL=file:./dev.db

# Optional: API URL for production
VITE_API_URL=https://api.yourdomain.com
```

---

## 👥 Role-Based Access Control (RBAC)

### Available Roles

| Role | Department | Permissions | Use Case |
|------|------------|-------------|----------|
| **ADMIN** | Management | Full system access, user management | System administrator |
| **FINANCE** | Accounts/Finance | GL, P&L, Balance Sheet, reports, approvals | Accountant, Finance Manager |
| **SALES** | Sales | Create invoices, view customer docs | Sales Representative |
| **PROCUREMENT** | Inventory/Maintenance | Manage inventory, suppliers, purchases | Inventory/Maintenance Manager |
| **AUDITOR** | Compliance | View-only access to all financial data | Internal/External Auditor |

### Implementing RBAC

All routes are protected via `authorizeRoles()` middleware in backend:

```typescript
// In src/server/routes/documents.ts
router.get('/',
  authenticateToken,
  authorizeRoles('ADMIN', 'SALES', 'FINANCE', 'PROCUREMENT', 'AUDITOR'),
  async (req, res) => {
    // Only users with these roles can access
  }
);
```

To add new roles, update:
1. Prisma schema (if needed)
2. Route middleware calls
3. Frontend permission checks (optional, for UX)

---

## 📊 Feature Access Matrix

| Feature | Admin | Finance | Sales | Procurement | Auditor |
|---------|-------|---------|-------|-------------|---------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Documents | ✓ | ✓ | ✓ | ✓ | ✗ |
| Approve Documents | ✓ | ✓ | ✗ | ✗ | ✗ |
| View GL | ✓ | ✓ | ✗ | ✗ | ✓ |
| View P&L Reports | ✓ | ✓ | ✗ | ✗ | ✓ |
| View Balance Sheet | ✓ | ✓ | ✗ | ✗ | ✓ |
| Manage Customers | ✓ | ✗ | ✓ | ✗ | ✗ |
| Manage Suppliers | ✓ | ✗ | ✗ | ✓ | ✗ |
| Manage Inventory | ✓ | ✗ | ✗ | ✓ | ✗ |
| View Audit Logs | ✓ | ✓ | ✗ | ✗ | ✓ |

---

## 🔑 Login Credentials

### Default Test Accounts

After running `npm run prisma:seed`, the following accounts are created:

| Role | Email | Password | Department |
|------|-------|----------|-----------|
| **Admin** | admin@idl.ng | password123 | Management |
| **Finance Manager** | finance@idl.ng | password123 | Finance |
| **Accounts Officer** | accounts@idl.ng | password123 | Accounts |
| **Sales Representative** | sales@idl.ng | password123 | Sales |
| **Inventory Manager** | inventory@idl.ng | password123 | Inventory |
| **Maintenance Manager** | maintenance@idl.ng | password123 | Maintenance |
| **Auditor** | auditor@idl.ng | password123 | Compliance |

### Creating New Users

#### Via Database

```bash
npm run prisma:studio  # Open Prisma Studio GUI
# Manually add users through the UI
```

#### Via Code

Add to `prisma/seed.ts`:
```typescript
const newUser = await prisma.user.create({
  data: {
    email: 'newuser@idl.ng',
    password: bcrypt.hashSync('temporary-password', 10),
    firstName: 'John',
    lastName: 'Doe',
    role: 'SALES',
    isActive: true
  }
});
```

Then run: `npm run prisma:seed`

#### Via API (Production)

```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "newuser@idl.ng",
    "password": "secure-password",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SALES"
  }'
```

---

## 💾 Database Setup

### Initial Setup

```bash
cd idl-ris

# 1. Generate Prisma Client
npm run prisma:generate

# 2. Create database and run migrations
npm run prisma:migrate

# 3. Seed with test data
npm run prisma:seed

# 4. (Optional) View database GUI
npm run prisma:studio
```

### Database Schema Overview

```
User
├── id (PK)
├── email (unique)
├── password (bcrypt hashed)
├── firstName, lastName
├── role (ADMIN, FINANCE, SALES, PROCUREMENT, AUDITOR)
├── isActive
└── relationships: documents, expenses, auditLogs, journalEntries

Document
├── id (PK)
├── reference (unique)
├── docType (SALES_INVOICE, CASH_RECEIPT, etc.)
├── customer/supplier relationships
├── lineItems[]
├── journalEntries[]
└── approval/audit trail

ChartOfAccounts
├── code (unique GL account code)
├── name
├── type (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
└── debitEntries[], creditEntries[]

JournalEntry
├── reference
├── debitAccount, creditAccount
├── amount
├── createdBy (User relationship)
└── document reference (optional)
```

### Resetting Database

⚠️ **WARNING**: This deletes all data!

```bash
npm run prisma:migrate reset
```

Then reseed:
```bash
npm run prisma:seed
```

---

## 🔒 Security Considerations

### JWT Token Management

- **Secret Key**: Change `JWT_SECRET` in production
- **Expiration**: Default 8 hours (configurable via `JWT_EXPIRES_IN`)
- **Storage**: Tokens stored in browser `localStorage`
- **Transmission**: Sent via `Authorization: Bearer <token>` header

### Password Security

- All passwords hashed with bcrypt (10 rounds)
- Never stored in plain text
- Minimum 8 characters recommended

### API Security

- All endpoints except `/auth/login` require valid JWT token
- Endpoints protected by role-based middleware
- Request validation via Zod schemas
- CORS enabled for frontend domain only

### Audit Trail

Every document action logged in `AuditLog` table:
- Who performed action
- What action was taken
- When it occurred
- Document affected

View audit logs: Dashboard → Audit Logs → View all

---

## 🚀 Deployment Checklist

- [ ] Update `JWT_SECRET` in production environment
- [ ] Set `BYPASS_AUTH = false` in App.tsx and AuthContext.tsx
- [ ] Configure GitHub Pages in repository settings
- [ ] Run `npm run prisma:seed` to create test users
- [ ] Test login with each role account
- [ ] Verify role-based access works (try accessing restricted features)
- [ ] Update implementation docs with production URL
- [ ] Enable HTTPS (automatic with GitHub Pages)
- [ ] Test on mobile device
- [ ] Backup production database regularly

---

## 📱 Mobile & Responsive Design

✅ **Mobile Features**:
- Hamburger menu on screens < 1024px
- Touch-friendly button sizing
- Responsive forms that stack on small screens
- Optimized for tablets and phones

**Test responsiveness**:
```bash
# In browser DevTools:
1. Press F12
2. Click "Toggle device toolbar" (Ctrl+Shift+M on Windows/Linux)
3. Select device or custom dimensions
```

---

## 🐛 Troubleshooting

### "Cannot login - Invalid credentials"

**Solution**:
1. Verify credentials in table above
2. Check `BYPASS_AUTH` setting
3. Ensure database is seeded: `npm run prisma:seed`
4. Check server logs for errors

### "Unauthorized: No token provided"

**Solution**:
1. Verify JWT_SECRET is set
2. Check Authorization header is being sent
3. Clear browser cache and login again
4. Check token expiration (8 hours)

### "Role not authorized for this action"

**Solution**:
1. Check feature access matrix above
2. Verify user's role is correct in database
3. Contact admin to update permissions if needed

### Database errors

**Solution**:
```bash
# Reset and reseed
npm run prisma:migrate reset
npm run prisma:seed
```

### GitHub Pages shows 404

**Solution**:
1. Check vite.config.ts has correct `base: '/IDL-Document-Manager/'`
2. Verify GitHub Actions workflow ran successfully
3. Wait 2-3 minutes for deployment to complete
4. Check browser cache (Ctrl+Shift+Del)

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly**:
- Monitor error logs
- Backup database
- Check user access logs

**Monthly**:
- Review audit trail
- Update user passwords
- Test disaster recovery

**Quarterly**:
- Security assessment
- Performance optimization
- Dependency updates

### Updating Application

```bash
# Get latest code
git pull origin main

# Install new dependencies
npm install

# Rebuild if needed
npm run build

# Redeploy (automatic on GitHub Pages)
git push origin main
```

---

## 📚 Additional Resources

- **Database GUI**: `npm run prisma:studio`
- **API Documentation**: Check individual route files in `src/server/routes/`
- **GitHub Repository**: https://github.com/MortalFiles-Memorial-Platform/IDL-Document-Manager
- **GitHub Pages**: https://MortalFiles-Memorial-Platform.github.io/IDL-Document-Manager/

---

## 📄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 8, 2026 | Initial release with auth, RBAC, financial reporting, and mobile support |

---

**Created by**: Claude Code  
**License**: Proprietary - Interior Duct Ltd  
**Last Updated**: June 8, 2026
