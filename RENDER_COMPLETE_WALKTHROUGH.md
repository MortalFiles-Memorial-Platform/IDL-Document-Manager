# Complete Render Deployment Walkthrough

This guide walks through the entire process of deploying your backend to Render and configuring environment variables.

## Prerequisites

✅ Render account (free tier)  
✅ Your GitHub repository connected to Render  
✅ PostgreSQL database created on Render

---

## Part 1: Create PostgreSQL Database on Render

### Step 1A: Start New Service
1. Log into https://render.com
2. Click **"New+"** button (top right of dashboard)
3. Select **"PostgreSQL"**

### Step 1B: Configure Database
Fill in these fields:
- **Name**: `idl-document-manager-db`
- **Database**: `idl_documents` (optional, auto-created)
- **User**: `postgres` (default)
- **Plan**: Select **"Free"** tier
- **Region**: Choose closest to your location
- **Datadog**: Skip (optional)

### Step 1C: Create Database
- Click **"Create Database"**
- Wait 1-2 minutes for creation
- You'll see a status page

### Step 1D: Copy Connection String
- Look for **"Connections"** or **"Info"** section
- Find the line that starts with `postgres://`
- It looks like:
  ```
  postgres://username:password@host.render.com:5432/database_name
  ```
- **Click the copy icon** to copy the full string
- Save it somewhere temporary (you'll need it in next section)

---

## Part 2: Deploy Backend Service to Render

### Step 2A: Create Web Service
1. From Render dashboard, click **"New+"**
2. Select **"Web Service"**

### Step 2B: Connect GitHub Repository
1. Look for your repository `IDL-Document-Manager`
2. Click **"Connect"** next to it
3. If you don't see it, you may need to authorize Render first:
   - Click **"+ New"** → scroll down → **"Connect external repository"**
   - Select your GitHub repo

### Step 2C: Configure Build Settings

Fill in these fields exactly:

```
Name: idl-document-manager-api

Environment: Node

Build Command:
cd idl-ris && npm install && npx prisma generate && npx prisma migrate deploy

Start Command:
cd idl-ris && npm run start:server

Plan: Free
```

### Step 2D: Create Web Service
- Click **"Create Web Service"**
- Wait for initial deployment (2-5 minutes)
- You'll see "Deploy in progress..." message
- Check "Logs" tab to monitor

---

## Part 3: Set Environment Variables

### Step 3A: Navigate to Environment Tab
1. Your web service is now created
2. In the left sidebar, click **"Environment"**
3. You should see a section for "Environment Variables"

### Step 3B: Generate JWT Secret

Before adding variables, generate a secure JWT secret. Open terminal and run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

You'll see output like:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
```

**Copy this entire string** - you'll use it for JWT_SECRET.

### Step 3C: Add Environment Variables

For each variable below, click **"Add Environment Variable"** and enter:

#### Variable 1: DATABASE_URL

```
Key: DATABASE_URL
Value: <paste your PostgreSQL connection string>
```

Example of what to paste:
```
postgres://username:password@host.render.com:5432/idl_documents
```

Then click **"Add"** or **"Save"**

#### Variable 2: JWT_SECRET

```
Key: JWT_SECRET
Value: <paste your generated secret from above>
```

Example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1
```

Then click **"Add"** or **"Save"**

#### Variable 3: JWT_EXPIRES_IN

```
Key: JWT_EXPIRES_IN
Value: 8h
```

Then click **"Add"** or **"Save"**

#### Variable 4: NODE_ENV

```
Key: NODE_ENV
Value: production
```

Then click **"Add"** or **"Save"**

#### Variable 5: PORT

```
Key: PORT
Value: 10000
```

Then click **"Add"** or **"Save"**

### Step 3D: Verify All Variables

Your Environment section should now show all 5 variables:

```
DATABASE_URL = postgres://***:***@***:5432/idl_documents
JWT_SECRET = a1b2c3d4e5f6... (partially hidden for security)
JWT_EXPIRES_IN = 8h
NODE_ENV = production
PORT = 10000
```

---

## Part 4: Wait for Automatic Redeploy

### Step 4A: Monitor Deployment

After you add/save the last environment variable:

1. Click **"Deployments"** tab (left sidebar)
2. You should see a new deployment starting
3. Status will show:
   - 🔵 "In Progress" (building)
   - 🟢 "Live" (successfully deployed)
   - 🔴 "Failed" (check logs)

### Step 4B: Check Logs

If deployment takes longer than expected:

1. Click **"Logs"** tab
2. Look for messages like:
   - `npm install started`
   - `prisma migrate` messages
   - `Server listening on port 10000`
   - ✅ `Build successful` (final message)

### Step 4C: Wait for Completion

Typical timeline:
- 0-1 min: Dependencies install
- 1-2 min: Prisma setup
- 2-3 min: Database migrations
- 3-5 min: Server startup
- 5-10 min: Full deployment complete

When you see status: **"Live"** ✅ and logs show **"Server listening"** ✅

Your backend is ready!

---

## Part 5: Get Your Backend URL

### Step 5A: Find Service URL

1. In your web service page
2. Look at the top - you should see a URL like:
   ```
   https://idl-document-manager-api.onrender.com
   ```
3. This is your **Backend URL**
4. Click the copy icon next to it
5. Save this URL - you need it for the frontend

---

## Part 6: Test Your Backend

### Step 6A: Test Connection

Open terminal and run:

```bash
# Replace with your actual backend URL
curl https://idl-document-manager-api.onrender.com/api/auth/me
```

You should get this response:
```json
{"message":"Unauthorized: token required."}
```

This means your backend is running! ✅

### Step 6B: Test Login Endpoint

```bash
curl -X POST https://idl-document-manager-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@idl.ng","password":"password123"}'
```

You should get:
```json
{"token":"...","user":{"id":1,"email":"admin@idl.ng","firstName":"Admin","lastName":"User","role":"ADMIN"}}
```

This confirms your backend is fully operational! ✅✅

---

## Part 7: Update Frontend Configuration

### Step 7A: Update vite.config.ts

Edit `idl-ris/vite.config.ts`:

Find this line:
```typescript
proxy: {
  '/api': 'http://localhost:4000'
}
```

Replace with your Render backend URL:
```typescript
proxy: {
  '/api': 'https://idl-document-manager-api.onrender.com'
}
```

### Step 7B: Rebuild Frontend

```bash
cd idl-ris
npm run build:client
```

### Step 7C: Commit and Push

```bash
git add -A
git commit -m "Connect frontend to Render backend"
git push origin main
```

This triggers GitHub Actions to redeploy your frontend to GitHub Pages.

---

## Part 8: Test Full Stack

### Step 8A: Wait for GitHub Pages Redeploy

After pushing, wait 1-2 minutes for GitHub Actions to complete.

### Step 8B: Visit Your App

Go to: https://mortalfiles-memorial-platform.github.io/IDL-Document-Manager/

### Step 8C: Test Login Flow

1. You should see the login page
2. Try logging in:
   - Email: `admin@idl.ng`
   - Password: `password123`
3. Click "Sign in"
4. You should see the Dashboard with "Admin User" in the header

### Step 8D: Test Full Features

- ✅ Create a document
- ✅ Download as PDF
- ✅ Download as PNG/JPG
- ✅ Logout
- ✅ Login with different role (e.g., `finance@idl.ng`)
- ✅ Test forgot password

**Congratulations!** Your full stack is deployed! 🎉

---

## Troubleshooting

### Issue: Backend deployment fails

**Check logs for errors:**
1. Click "Logs" tab on Render
2. Look for error messages
3. Common issues:
   - Wrong DATABASE_URL format
   - Missing build command
   - npm install failed

**Solution:**
- Verify DATABASE_URL matches exactly
- Check all 5 environment variables are set
- Try manual redeploy: Click "Deploy" button

### Issue: "Database connection refused"

**Reasons:**
- DATABASE_URL is incorrect
- Password has special characters (needs URL encoding)
- PostgreSQL service not fully started

**Solution:**
- Copy DATABASE_URL directly from Render
- If special chars in password, use URL encoding: `%40` for `@`
- Wait 2 minutes after creating PostgreSQL database

### Issue: Frontend can't reach backend

**Check:**
1. Backend URL in vite.config.ts is correct
2. CORS is enabled on backend (already configured)
3. Frontend was rebuilt and redeployed

**Solution:**
```bash
# Rebuild frontend
npm run build:client
# Commit and push
git add -A && git commit -m "Fix backend URL"
git push origin main
```

### Issue: Render free tier service keeps pausing

**This is normal!** Free tier on Render:
- Auto-pauses after 15 days of inactivity
- Automatically wakes up when you visit
- Takes 30-60 seconds to restart

**Solution:** Keep using the service, or upgrade to paid tier

---

## Environment Variables Summary

### Required (app won't start without these)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Security token signing key
- `NODE_ENV` - Set to `production`

### Optional (have sensible defaults)
- `JWT_EXPIRES_IN` - Default: `8h`
- `PORT` - Default: `10000`

---

## Quick Reference

| Step | Action | Time |
|------|--------|------|
| 1 | Create PostgreSQL database | 2 min |
| 2 | Deploy web service | 2 min |
| 3 | Add environment variables | 3 min |
| 4 | Wait for redeploy | 5 min |
| 5 | Test backend | 2 min |
| 6 | Update frontend config | 2 min |
| 7 | Redeploy GitHub Pages | 2 min |
| **Total** | **End-to-end deployment** | **~20 minutes** |

---

## You're Done! 🚀

Your app is now:
- ✅ Running on GitHub Pages (frontend)
- ✅ Running on Render (backend)
- ✅ Using PostgreSQL (database)
- ✅ With role-based access control
- ✅ With secure authentication

### Next Steps
- Create more test users in the database
- Customize business logic as needed
- Set up monitoring and backups
- Plan upgrade path for production scale
