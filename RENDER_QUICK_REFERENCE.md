# Render Environment Variables - Quick Reference

## 🚀 5-Minute Setup

### Step 1: Get Your Database URL
```
Render Dashboard → PostgreSQL Service → Connections
Copy: postgres://user:password@host:port/database_name
```

### Step 2: Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste output as JWT_SECRET value
```

### Step 3: Set Variables on Render

Go to: **Your Backend Service → Environment Tab**

Add these 5 variables:

```
┌─────────────────────────────────────────────────────┐
│ KEY: DATABASE_URL                                   │
│ VALUE: postgres://user:pass@host:5432/db_name      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ KEY: JWT_SECRET                                     │
│ VALUE: a1b2c3d4e5f6... (generated above)           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ KEY: JWT_EXPIRES_IN                                 │
│ VALUE: 8h                                           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ KEY: NODE_ENV                                       │
│ VALUE: production                                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ KEY: PORT                                           │
│ VALUE: 10000                                        │
└─────────────────────────────────────────────────────┘
```

### Step 4: Wait for Redeploy
- Render automatically rebuilds when you save
- Check "Logs" tab for "Build successful"
- Takes 2-5 minutes

### Step 5: Test Backend
```bash
curl https://your-service.onrender.com/api/auth/me
# Response: {"message":"Unauthorized: token required."}
```

✅ **Success! Backend is running.**

---

## 🔍 Where to Find Things on Render

```
Dashboard (top page)
│
├─ PostgreSQL Service
│  ├─ Connections → Copy DATABASE_URL
│  └─ Info → See connection details
│
└─ Backend Service (idl-document-manager-api)
   ├─ Environment (left sidebar)
   │  ├─ Add Environment Variable
   │  └─ Save when done
   ├─ Logs (check deployment status)
   └─ URL (your backend address)
```

---

## ✅ Checklist

```
□ PostgreSQL database created on Render
□ Database URL copied (postgres://...)
□ Backend service deployed on Render
□ JWT_SECRET generated with node command
□ All 5 environment variables added:
  □ DATABASE_URL
  □ JWT_SECRET
  □ JWT_EXPIRES_IN
  □ NODE_ENV
  □ PORT
□ Service redeploy completed (check Logs)
□ Backend URL noted (https://...)
□ Backend tested with curl
```

---

## Common Values

**Don't customize these unless you know what you're doing:**

```
JWT_EXPIRES_IN = 8h        (8 hours, standard)
NODE_ENV = production      (required for prod)
PORT = 10000              (Render may override)
```

---

## Copy-Paste Values

### Database URL Format
```
postgres://username:password@host.render.com:5432/database_name
```

### JWT Secret (generate fresh)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Environment
```
production
```

---

## 🆘 If Something Goes Wrong

### Redeploy failed?
- Check "Logs" tab for error
- Most common: Wrong DATABASE_URL format
- Solution: Copy the exact connection string from Render

### Can't find Environment tab?
- Click your backend service name
- Look for "Environment" in left sidebar
- Should be near "Deployments" and "Logs"

### Variables not saving?
- Click "Save" or "Add" button after entering each one
- Wait for confirmation
- Refresh page after 1 minute

### Backend still not working?
- Check all 5 variables are present
- Verify DATABASE_URL starts with `postgres://`
- Wait 5 minutes for full redeploy
- Check service status shows "Live"

---

## Next: Connect Frontend

Once backend is deployed and variables are set:

1. Get your backend URL from Render
2. Update `idl-ris/vite.config.ts`:
   ```typescript
   proxy: {
     '/api': 'https://your-backend.onrender.com'
   }
   ```
3. Rebuild: `npm run build:client`
4. Push to GitHub: `git push origin main`
5. Test at: https://mortalfiles-memorial-platform.github.io/IDL-Document-Manager/
