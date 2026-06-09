# GitHub Pages Login Testing Guide

## ✅ Quick Test - GitHub Pages Default Credentials

The application now supports mock authentication on GitHub Pages. Test with these credentials:

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@idl.ng | password123 |
| **Finance** | finance@idl.ng | password123 |
| **Sales** | sales@idl.ng | password123 |
| **Procurement** | inventory@idl.ng | password123 |
| **Auditor** | auditor@idl.ng | password123 |

### Testing Steps

1. **Visit GitHub Pages URL**
   - Go to: https://mortalfiles-memorial-platform.github.io/IDL-Document-Manager/

2. **You should see Login Page**
   - Logo for Interior Duct Ltd
   - Email input field
   - Password input field
   - "Forgot password?" link

3. **Test Login with Admin Account**
   - Email: `admin@idl.ng`
   - Password: `password123`
   - Click "Sign in"
   - Expected: Dashboard loads with "Admin User" in header

4. **Test Another Role**
   - Click "Logout"
   - Email: `finance@idl.ng`
   - Password: `password123`
   - Click "Sign in"
   - Expected: Dashboard loads with "Finance Officer" in header

5. **Test Password Reset (No Email Required)**
   - Click "Forgot password?"
   - Email: `sales@idl.ng`
   - Click "Continue"
   - Enter new password: `newpass123`
   - Confirm password: `newpass123`
   - Click "Reset Password"
   - Success message appears
   - Click "Logout"
   - Try logging in with: `sales@idl.ng` / `newpass123`
   - Expected: Login succeeds with new password

6. **Test Invalid Credentials**
   - Email: `admin@idl.ng`
   - Password: `wrongpassword`
   - Click "Sign in"
   - Expected: Error message "Invalid credentials."

---

## 🔍 How It Works

### GitHub Pages Authentication
Since GitHub Pages only hosts static files:
- **Frontend**: React app detects GitHub Pages hostname
- **Mock Auth**: Intercepts API calls and provides authentication client-side
- **No Backend**: All auth happens in the browser using demo credentials
- **Data**: Not persisted (resets on page refresh)

### Localhost Development
- **Full Backend**: Express.js server handles authentication
- **Real Database**: SQLite stores user data and documents
- **Real API Calls**: Standard HTTP requests to backend

---

## 🚀 Full Functionality

For **full functionality** with database persistence:
1. Deploy backend to Render/Railway/Fly.io
2. Update `VITE_BACKEND_URL` in frontend configuration
3. Redeploy frontend to GitHub Pages
4. Use real credentials from deployed database

See: `BACKEND_HOSTING_GUIDE.md` for deployment instructions

---

## 📝 Notes

- **GitHub Pages Version**: Demo/testing only, data not persisted
- **Localhost Version**: Full functionality with real backend
- **Password Changes**: On GitHub Pages, passwords reset when you refresh the page
- **Switching Roles**: Log out and log in with different email to test role access
