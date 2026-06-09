# Setting Environment Variables on Render - Complete Guide

## Step 1: Log Into Render Dashboard

1. Go to https://render.com
2. Click "Dashboard" (top right)
3. You should see your deployed services

---

## Step 2: Select Your Backend Service

1. In the dashboard, find your backend service (e.g., `idl-document-manager-api`)
2. Click on it to open the service details

---

## Step 3: Navigate to Environment Variables

1. In the service page, look for the left sidebar menu
2. Click on **"Environment"** tab
3. You should see:
   - A section showing "Environment Variables"
   - An "Add Environment Variable" button (or existing variables)

---

## Step 4: Add Environment Variables One by One

### Method A: Using the UI

For each variable, click **"Add Environment Variable"** and fill in:

#### 1. Database URL
```
Key: DATABASE_URL
Value: postgres://user:password@host:port/database_name
```
**Where to get this:** From your PostgreSQL database details on Render

#### 2. JWT Secret (IMPORTANT - Security)
```
Key: JWT_SECRET
Value: <generated-secure-string>
```

**Generate a secure value:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste it as the value.

#### 3. JWT Expiration
```
Key: JWT_EXPIRES_IN
Value: 8h
```

#### 4. Environment Type
```
Key: NODE_ENV
Value: production
```

#### 5. Server Port
```
Key: PORT
Value: 10000
```

---

## Step 5: Complete Environment Variables List

Add all of these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | `postgres://...` | From PostgreSQL connection string |
| `JWT_SECRET` | `<generated-hex-string>` | Generate with node command above |
| `JWT_EXPIRES_IN` | `8h` | Token expiration time |
| `NODE_ENV` | `production` | Environment type |
| `PORT` | `10000` | Render may auto-set this |

---

## Step 6: Copy PostgreSQL Connection String

Before adding DATABASE_URL, you need the connection string:

1. Go back to Render dashboard
2. Find your **PostgreSQL database** service
3. Click on it
4. Look for **"Connections"** or **"Info"** section
5. Find the connection string (looks like):
   ```
   postgres://username:password@host:port/database_name
   ```
6. Copy the entire string

---

## Step 7: Add Database URL to Backend

1. Go back to your **Backend service** (idl-document-manager-api)
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. ```
   Key: DATABASE_URL
   Value: <paste the connection string you copied>
   ```
5. Click **"Save"** or **"Add"**

---

## Step 8: Verify All Variables Are Set

Your Environment tab should show:
```
DATABASE_URL = postgres://***:***@***:5432/idl_documents
JWT_SECRET = a1b2c3d4e5f6g7h8... (partially hidden)
JWT_EXPIRES_IN = 8h
NODE_ENV = production
PORT = 10000
```

---

## Step 9: Redeploy After Adding Variables

1. After setting all environment variables, your service will automatically redeploy
2. Watch the **"Logs"** section for deployment progress
3. Look for: `"Build successful"` and `"Service deployed"`
4. This takes 2-5 minutes

---

## Step 10: Verify Backend is Running

After deployment, test your backend:

```bash
# Get your backend URL from Render
# It looks like: https://idl-document-manager-api.onrender.com

# Test with curl
curl https://your-backend-url.onrender.com/api/auth/me

# Should get response (with no token):
# {"message":"Unauthorized: token required."}
```

---

## Visual Guide: Finding Environment Variables on Render

### Location 1: Dashboard
```
Render Dashboard
└── Your Services
    └── idl-document-manager-api (Click here)
        └── Environment (Tab on left sidebar)
```

### Location 2: Adding a Variable
```
Environment Tab
└── "Add Environment Variable" button
    └── Key field (e.g., "JWT_SECRET")
    └── Value field (e.g., "a1b2c3d4...")
    └── Save button
```

---

## Environment Variable Reference

### Required Variables
These MUST be set or your app won't start:

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `postgres://user:pass@host:5432/db` | Connect to PostgreSQL |
| `JWT_SECRET` | `a1b2c3d4e5f6...` | Secure token signing |
| `NODE_ENV` | `production` | Tell app it's in production |

### Optional Variables
These have defaults but can be customized:

| Variable | Default | Example |
|----------|---------|---------|
| `PORT` | `4000` | `10000` |
| `JWT_EXPIRES_IN` | `8h` | `24h` or `7d` |

---

## Troubleshooting

### Issue: Build fails after adding variables

**Solution:**
- Don't restart the build manually
- Render automatically rebuilds when you save variables
- Wait 2-5 minutes for rebuild to complete
- Check the "Logs" tab for error messages

### Issue: "Unauthorized: token required" error

**This is expected!** It means your backend is running correctly.
- Add a valid JWT token to test: `Authorization: Bearer <your-token>`

### Issue: Database connection error

**Check:**
1. `DATABASE_URL` format is correct (starts with `postgres://`)
2. Password doesn't have special characters (or is URL-encoded)
3. Host is accessible from Render region
4. Database name is correct

### Issue: Environment variables showing as empty

**Solution:**
- Save variables after adding them
- Wait for Render to process (shows "Deploying..." status)
- Refresh the page after 1 minute
- Check that value was actually saved

---

## Getting Your Backend URL

After deployment:

1. In Render dashboard, click your backend service
2. Look for the **"URL"** at the top of the page
3. It looks like: `https://idl-document-manager-api.onrender.com`
4. Use this URL in your frontend configuration

---

## Security Best Practices

### DO:
- ✅ Use a strong, random JWT_SECRET (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- ✅ Never share your JWT_SECRET
- ✅ Use different secrets for different environments
- ✅ Rotate secrets periodically

### DON'T:
- ❌ Use simple passwords like "password123" for JWT_SECRET
- ❌ Commit .env files to Git
- ❌ Reuse secrets across services
- ❌ Share your DATABASE_URL publicly

---

## Quick Copy-Paste Template

Use this as a checklist when setting variables:

```
☐ DATABASE_URL = postgres://...
☐ JWT_SECRET = [Generate new with node command]
☐ JWT_EXPIRES_IN = 8h
☐ NODE_ENV = production
☐ PORT = 10000
```

---

## Next Steps

Once environment variables are set and backend is deployed:

1. **Get your backend URL**: `https://your-service.onrender.com`
2. **Update frontend configuration**: 
   - Edit `idl-ris/vite.config.ts`
   - Update proxy target to your Render URL
3. **Rebuild frontend**: `npm run build:client`
4. **Push to GitHub**: `git push origin main`
5. **Test the full stack**: Visit GitHub Pages URL and login

See: `BACKEND_HOSTING_GUIDE.md` for complete integration instructions.
