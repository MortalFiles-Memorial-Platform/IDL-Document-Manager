# Complete Render Deployment Guide - Supabase PostgreSQL

## 🎯 Overview

This guide covers the complete deployment of the IDL-RIS application to Render using Supabase PostgreSQL.

## ✅ What's Configured

- **Database:** Supabase PostgreSQL
- **Build Process:** TypeScript compilation only (no DB access)
- **Migration:** Run at application startup (after environment variables loaded)
- **Environment:** Configured via render.yaml and Render dashboard

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Your Code

Ensure these files are in your repository:

```
✅ render.yaml              (Build and start commands)
✅ prisma/schema.prisma     (PostgreSQL provider)
✅ prisma/migrations/       (PostgreSQL migrations)
✅ package.json             (Updated scripts)
✅ .env.example             (Configuration reference)
```

Verify locally:
```bash
npm run build              # Should succeed without DB
```

### Step 2: Get Supabase Credentials

1. Visit: https://supabase.com/dashboard/project/ffmikbnryqpmjbzyldrf/settings/database
2. Under "Connection string", find PostgreSQL URI
3. It looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres
   ```

**Important:** Save your password in a secure location!

### Step 3: Configure Render Environment Variables

In your Render dashboard (Services → Your App → Environment):

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres?schema=public
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres
NODE_ENV=production
JWT_SECRET=[generate random: openssl rand -base64 32]
JWT_EXPIRES_IN=8h
```

**⚠️ Important:** 
- Replace `[PASSWORD]` with actual Supabase password
- Use strong random value for JWT_SECRET
- Check "Auto-deploy" is enabled

### Step 4: Deploy

```bash
git add .
git commit -m "Fix: Configure for Render with Supabase PostgreSQL"
git push origin main
```

Render will automatically:
1. Detect new push
2. Build code (no DB access)
3. Start application
4. Run migrations
5. Start server

### Step 5: Monitor Deployment

Watch Render logs for:

```
Build Phase:
✅ "Compiling code..."
✅ "Running npm run build"
✅ "Build completed"

Start Phase:
✅ "Starting service..."
✅ "Running npm run db:migrate:deploy"
✅ "Applying migration: 20260612131500_init"
✅ "Successfully applied 1 migration"
✅ "Running npm run start:server"
✅ "Server running on port 3000"
```

### Step 6: Test Deployment

1. **Check health:**
   ```
   curl https://your-render-url.onrender.com/
   ```

2. **Login test:**
   - Email: admin@idl.ng
   - Password: password123

3. **Verify tabs are filtered by department**

4. **Test API endpoints**

## 📊 How It Works

### Build Phase (No Database Access)
```
1. Render downloads code
2. Installs dependencies: npm install
3. Runs: npm run build
   - npm run build:client (TypeScript + Vite)
   - npm run build:server (TypeScript only)
4. Creates dist/ directory
5. Upload to Render container
```

### Start Phase (With Database Access)
```
1. Render starts container
2. Loads environment variables
3. Runs: npm run db:migrate:deploy
   - Connects to Supabase
   - Applies pending migrations
   - Creates tables if needed
4. Runs: npm run start:server
   - Starts Node.js server
   - Server uses migrated database
5. Application ready to serve
```

## 🔍 Verification Checklist

After deployment:

- [ ] Application loads at https://your-render-url.onrender.com
- [ ] Can login with admin@idl.ng / password123
- [ ] Admin user sees all navigation tabs
- [ ] Can switch to sales@idl.ng and see only sales tabs
- [ ] Documents tab loads
- [ ] Department-based access control working
- [ ] No database errors in logs
- [ ] API endpoints respond correctly

## 🐛 Troubleshooting

### Build Failed: "npm ERR!"

**Solution:**
- Check dependencies in package.json
- Run locally: `npm install && npm run build`
- Fix any compilation errors

### Build Succeeded, Start Failed: "P1001 Can't reach database"

**Solution:**
- [ ] Check DATABASE_URL is set in Render
- [ ] Verify password is correct
- [ ] Ensure DIRECT_URL is set
- [ ] Check Supabase status: https://status.supabase.com

### Start Failed: "relation does not exist"

**Solution:**
- Migrations didn't apply
- Check Render logs for migration errors
- Manually run: `npx prisma migrate deploy` in Render shell

### Application runs but no data

**Solution:**
- Database is empty
- Seed data: `npx prisma db seed` in Render shell
- Or populate through application

## 🔐 Security Best Practices

1. **Environment Variables:**
   - Never commit .env with real credentials
   - Use Render secrets/environment variables
   - Rotate credentials regularly

2. **Database Password:**
   - Change from default if possible
   - Store securely (1Password, LastPass, etc.)
   - Only share with authorized team members

3. **JWT Secret:**
   - Generate strong random value
   - Use: `openssl rand -base64 32`
   - Never share or commit

4. **Backups:**
   - Supabase auto-backs up PostgreSQL
   - Create manual backups before major updates
   - Test restore procedures

## 📝 Scripts Reference

```bash
# Local Development
npm run dev                    # Run dev server (both client & server)

# Build Commands
npm run build                  # Build both client and server
npm run build:client           # Build React frontend only
npm run build:server           # Build Node.js backend only

# Database Commands
npm run db:migrate:dev         # Create/run migrations (local dev)
npm run db:migrate:deploy      # Apply migrations (production)
npm run db:seed                # Seed test data
npm run db:generate            # Generate Prisma client

# Runtime
npm run start                  # Start server (must build first)
npm run start:server           # Start just the server

# Render Build Phase
npm run build                  # This is what Render runs

# Render Start Phase
npm run db:migrate:deploy && npm run start  # This is what Render runs
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `render.yaml` | Render build/start configuration |
| `prisma/schema.prisma` | Database schema (PostgreSQL) |
| `prisma/migrations/` | Database migration files |
| `.env.example` | Environment variable template |
| `package.json` | Scripts for build/start |

## 🎯 Summary

✅ **Build Phase:**
- Runs: `npm run build`
- No database connection
- Compiles TypeScript
- Creates dist/

✅ **Start Phase:**
- Runs: `npm run db:migrate:deploy && npm run start`
- Connects to database
- Applies migrations
- Starts server

✅ **Deployment:**
- Code is built separately from running
- Migrations happen at startup
- Database is ready when app starts
- All features working

## 📞 Support

If issues occur:
1. Check Render logs (Services → Your App → Logs)
2. Review this guide
3. Check Supabase status
4. Verify all environment variables set
5. Manual test: `npx prisma db execute --stdin`

---

**You're ready to deploy to Render!** 🚀
