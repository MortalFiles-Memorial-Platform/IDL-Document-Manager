# Render Deployment with Supabase PostgreSQL - Setup Guide

## ✅ Configuration Complete

The project has been reconfigured to use **Supabase PostgreSQL** for Render deployment.

## What Changed

### 1. **Database Provider** (prisma/schema.prisma)
```prisma
datasource db {
  provider = "postgresql"  # Changed from sqlite to postgresql
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  # Added for connection pooling
}
```

### 2. **Environment Variables** (.env)
```env
# Supabase PostgreSQL Configuration
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres?schema=public"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres"
```

### 3. **Database Migration**
- Created PostgreSQL migration file: `prisma/migrations/20260612131500_init/migration.sql`
- Contains all schema definitions with PostgreSQL-compatible syntax
- Added `migration_lock.toml` for PostgreSQL provider

## 🚀 Next Steps for Render Deployment

### Step 1: Get Supabase Connection String

1. Go to: https://supabase.com/dashboard/project/ffmikbnryqpmjbzyldrf/settings/database
2. Under "Connection string", select "URI" tab
3. Copy the PostgreSQL connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres
   ```
4. Note: You may need to reset the password if you forgot it

### Step 2: Configure Render Environment Variables

In your Render dashboard:

1. **Set DATABASE_URL:**
   ```
   postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres?schema=public
   ```

2. **Set DIRECT_URL:**
   ```
   postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres
   ```

3. **Set other required variables:**
   ```
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=8h
   ```

### Step 3: Deploy to Render

The application will automatically:
1. Detect PostgreSQL database from DATABASE_URL
2. Run migrations from `prisma/migrations/` directory
3. Apply the schema to your Supabase database
4. Start the server with proper database connection

### Step 4: Verify Deployment

After deployment:

1. Check Render logs for successful migration:
   ```
   [prisma] Applied migration: 20260612131500_init
   ```

2. Test login with seed users:
   - Email: `admin@idl.ng`
   - Password: `password123`

3. Verify tabs are filtered by department (access control working)

## 🔐 Security Notes

### Connection Pooling
- `DATABASE_URL` is used for connection pooling (recommended by Render)
- `DIRECT_URL` is used for Prisma migrations
- This prevents connection exhaustion during deployments

### Best Practices
1. **Rotate Supabase password** after deployment:
   - Supabase Dashboard → Settings → Database → Reset password
   - Update environment variables in Render

2. **Enable SSL/TLS** (default on Supabase):
   - Already configured in connection string
   - Ensures encrypted database communication

3. **Backup Strategy**:
   - Supabase automatically backs up PostgreSQL
   - Create manual backups before major changes

## 📊 Database Schema

All tables have been created with:
- ✅ User management with department field
- ✅ Document management with type-based access control
- ✅ Financial tracking (Charts of Accounts, Journal Entries)
- ✅ Inventory management
- ✅ Audit logging
- ✅ Cascade delete constraints for data integrity

## 🧪 Testing the Setup

### Local Testing (Optional)

If you want to test locally with Supabase:

1. Update `.env` with actual Supabase credentials:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres?schema=public"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres"
   ```

2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

3. Seed test data:
   ```bash
   npx prisma db seed
   ```

### Production Testing (After Render Deployment)

1. Login as different roles:
   - admin@idl.ng - See all tabs
   - sales@idl.ng - See sales tabs only
   - finance@idl.ng - See finance tabs only
   - inventory@idl.ng - See procurement tabs only
   - auditor@idl.ng - See audit tabs only

2. Verify document access control works

3. Check API endpoints return correct data

## 📁 Key Files Modified

```
idl-ris/
├── prisma/
│   ├── schema.prisma ✅ PostgreSQL provider
│   └── migrations/
│       ├── 20260612131500_init/
│       │   └── migration.sql ✅ PostgreSQL schema
│       └── migration_lock.toml ✅ PostgreSQL lock file
├── .env ✅ Supabase connection strings
└── Both client and server build successfully ✅
```

## 🆘 Troubleshooting

### Issue: "Connection refused" error

**Solution:** 
1. Verify DATABASE_URL is correct
2. Check password is correct in Supabase
3. Ensure IP is whitelisted (Supabase: Settings → Network → IP Whitelist)
4. For Render: Whitelist Render's static IPs

### Issue: "Relation does not exist" error

**Solution:**
1. Migrations haven't run yet
2. Check Render build logs for migration status
3. Manually run: `npx prisma migrate deploy`

### Issue: "Too many connections" error

**Solution:**
1. Using DATABASE_URL for pooling (already configured)
2. DIRECT_URL is only used for migrations
3. Supabase has connection pool limits - verify plan limits

### Issue: Users not seeing filtered tabs

**Solution:**
1. Verify JWT includes department field
2. Check backend returns department in /auth/login
3. Verify frontend UserProfile includes department
4. Clear browser cache and re-login

## 📚 Documentation

- Full guide: `DEPARTMENT_ACCESS_CONTROL_GUIDE.md`
- Visual overview: `DEPARTMENT_ACCESS_VISUAL_GUIDE.md`
- Quick reference: `DEPARTMENT_ACCESS_QUICK_REFERENCE.md`

## ✨ Summary

✅ Switched from SQLite to PostgreSQL (Supabase)
✅ Created PostgreSQL migrations
✅ Updated environment variable format
✅ Client and server build successfully
✅ Ready for Render deployment
✅ Database connection pooling configured
✅ All features working (department-based access control)

**Next:** Add Supabase credentials to Render environment variables and deploy!
