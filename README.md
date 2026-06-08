# IDL-RIS: Interior Duct Ltd Receipts & Invoice System

**Enterprise-grade document management system for Nigerian SMEs and manufacturers**

![Version](https://img.shields.io/badge/version-1.0-blue)
![Status](https://img.shields.io/badge/status-Production%20Ready-green)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 🚀 Live Application

**📱 Web App**: https://MortalFiles-Memorial-Platform.github.io/IDL-Document-Manager/

**Access Now** ➜ Try the application with demo credentials below

---

## ✨ Features

### 📋 Document Management
- Create and manage receipts, invoices, quotations, delivery notes, vouchers, and more
- Document type-specific forms with contextual fields
- Auto-generated unique references and QR codes
- Multi-format export (PDF, POS thermal printer format, email)

### 💰 Financial Reporting
- **General Ledger** - Complete transaction history with filtering
- **Profit & Loss Statement** - Revenue vs. expenses analysis
- **Balance Sheet** - Assets, liabilities, equity overview
- **Trial Balance** - Double-entry bookkeeping verification
- Date range filtering and comprehensive reconciliation

### 👥 Role-Based Access Control (RBAC)
Five predefined roles with least-privilege access:
- **ADMIN** - Complete system control
- **FINANCE** - Accounting, approvals, financial reports
- **SALES** - Invoice creation, customer management
- **PROCUREMENT** - Inventory, supplier management
- **AUDITOR** - Compliance and read-only access

### 🔐 Security Features
- JWT-based authentication with 8-hour sessions
- Bcrypt password hashing
- Complete audit trail logging
- Role-based API authorization
- Session persistence and recovery

### 📱 Mobile-Friendly
- Responsive design for all devices
- Hamburger navigation menu on mobile
- Touch-optimized interfaces
- Full feature access on tablets/phones

### 🇳🇬 Nigeria-Ready
- VAT compliance for Nigerian tax system
- NGN currency formatting
- Support for local business document types
- KNIM data export compatibility (planned)

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@idl.ng | password123 |
| **Finance** | finance@idl.ng | password123 |
| **Sales** | sales@idl.ng | password123 |
| **Procurement** | inventory@idl.ng | password123 |
| **Auditor** | auditor@idl.ng | password123 |

**Note**: For local development, you can enable auth bypass in `src/client/App.tsx` by setting `BYPASS_AUTH = true`

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for responsive styling
- **Vite** for fast builds
- **React Router** for navigation
- **Lucide Icons** for UI icons
- **Axios** for API calls

### Backend
- **Node.js + Express** for REST API
- **Prisma ORM** for database management
- **SQLite** for data persistence
- **JWT** for authentication
- **bcryptjs** for password hashing
- **PDFKit** for PDF generation
- **QRcode** for QR code generation

### Deployment
- **GitHub Pages** for frontend hosting
- **GitHub Actions** for CI/CD
- **AWS S3** (optional) for document storage

---

## 📖 Documentation

### 📚 Implementation Guide
Complete setup, deployment, and authentication walkthrough:
👉 **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)**

Covers:
- Local development setup
- GitHub Pages deployment
- Authentication & RBAC configuration
- Database management
- Troubleshooting guide
- Security best practices

### Quick Start

```bash
# Clone repository
git clone https://github.com/MortalFiles-Memorial-Platform/IDL-Document-Manager.git
cd IDL-Document-Manager/idl-ris

# Install dependencies
npm install

# Setup database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start development server
npm run dev
```

Access at:
- Frontend: http://localhost:5177
- Backend API: http://localhost:4000/api

---

## 📊 Feature Access Matrix

| Feature | Admin | Finance | Sales | Procurement | Auditor |
|---------|:-----:|:-------:|:-----:|:-----------:|:-------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Documents | ✓ | ✓ | ✓ | ✓ | ✗ |
| Approve Documents | ✓ | ✓ | ✗ | ✗ | ✗ |
| General Ledger | ✓ | ✓ | ✗ | ✗ | ✓ |
| Profit & Loss | ✓ | ✓ | ✗ | ✗ | ✓ |
| Balance Sheet | ✓ | ✓ | ✗ | ✗ | ✓ |
| Manage Customers | ✓ | ✗ | ✓ | ✗ | ✗ |
| Manage Suppliers | ✓ | ✗ | ✗ | ✓ | ✗ |
| Manage Inventory | ✓ | ✗ | ✗ | ✓ | ✗ |
| Audit Logs | ✓ | ✓ | ✗ | ✗ | ✓ |

---

## 🚢 Deployment

### GitHub Pages (Recommended)

The application is automatically deployed to GitHub Pages on every push to `main`:

```
🔗 https://MortalFiles-Memorial-Platform.github.io/IDL-Document-Manager/
```

**Deployment Status**: Watch the Actions tab for deployment progress

### Local Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🔒 Authentication Walkthrough

### How It Works

1. User enters email & password on login page
2. Backend validates against database
3. JWT token issued on success
4. Token stored in browser localStorage
5. All API requests include token in Authorization header
6. Backend validates token and checks user role
7. Endpoint executes if user has required role
8. Session persists across page reloads

### Managing Users

#### View/Add Users
```bash
# Open database GUI
npm run prisma:studio
```

#### Seed Test Data
```bash
npm run prisma:seed
```

#### Add New User (in seed file)
Edit `prisma/seed.ts`:
```typescript
{
  email: 'newuser@idl.ng',
  password: bcrypt.hashSync('password123', 10),
  firstName: 'John',
  lastName: 'Doe',
  role: 'SALES',
}
```

---

## 📱 Screenshots & Features

### Dashboard
- Real-time KPIs: Customer count, revenue, expenses, loans
- Quick access to all modules
- Compliance summary

### Document Management
- Create documents with type-specific forms
- Line-item based entry with calculations
- Automatic VAT, discount, and total calculation
- Support for 14 document types

### Financial Reporting
- **GL**: Full transaction journal with date filtering
- **P&L**: Revenue and expense breakdown
- **Balance Sheet**: Complete financial position
- **Trial Balance**: Accounting validation

### Mobile Features
- ☰ Hamburger menu on mobile/tablet
- Touch-optimized buttons and forms
- Responsive grid layouts
- Full feature parity with desktop

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` in `idl-ris/`:

```env
# Authentication
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=8h

# Database
DATABASE_URL=file:./dev.db

# API (for production)
VITE_API_URL=https://api.yourdomain.com
```

### Vite Configuration

Key settings in `vite.config.ts`:
- **Base Path**: `/IDL-Document-Manager/` (for GitHub Pages)
- **API Proxy**: Proxies `/api` to `http://localhost:4000`

---

## 🐛 Troubleshooting

### Login Issues
- Verify credentials in demo table above
- Check if `BYPASS_AUTH` is set to `false`
- Ensure database is seeded: `npm run prisma:seed`

### Deployment Issues
- Check GitHub Actions workflow status
- Verify vite.config.ts has correct base path
- Clear browser cache (Ctrl+Shift+Del)
- Wait 2-3 minutes for GitHub Pages to update

### Database Errors
```bash
# Reset and reseed
npm run prisma:migrate reset
npm run prisma:seed
```

See **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md#-troubleshooting)** for detailed troubleshooting.

---

## 📞 Support

- 📖 **Documentation**: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- 💻 **GitHub Repository**: https://github.com/MortalFiles-Memorial-Platform/IDL-Document-Manager
- 🌐 **Live Application**: https://MortalFiles-Memorial-Platform.github.io/IDL-Document-Manager/

---

## 📋 Development Roadmap

- [x] Core document management
- [x] Financial reporting (GL, P&L, Balance Sheet)
- [x] Authentication & RBAC
- [x] Mobile responsiveness
- [x] GitHub Pages deployment
- [ ] KNIM data export
- [ ] Multi-currency support
- [ ] Advanced reconciliation tools
- [ ] Mobile app (iOS/Android)
- [ ] Real-time collaboration

---

## 📄 License

**Proprietary** - Interior Duct Ltd  
All rights reserved. Unauthorized reproduction or distribution is prohibited.

---

## 🙏 Credits

**Built with**:
- React, TypeScript, Tailwind CSS
- Express, Prisma, SQLite
- GitHub Actions & Pages

**Last Updated**: June 8, 2026  
**Version**: 1.0 - Production Ready
