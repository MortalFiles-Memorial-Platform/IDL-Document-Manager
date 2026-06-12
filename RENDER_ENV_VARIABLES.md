# Render Environment Variables Configuration

## Required for Deployment

Copy these into your Render dashboard environment variables:

### Database Configuration (Supabase PostgreSQL)

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres?schema=public
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.ffmikbnryqpmjbzyldrf.supabase.co:5432/postgres
```

**Where to get these:**
1. Visit: https://supabase.com/dashboard/project/ffmikbnryqpmjbzyldrf/settings/database
2. Select "URI" tab
3. Replace `[PASSWORD]` with your actual database password
4. Add `?schema=public` to DATABASE_URL for connection pooling

### Authentication

```
JWT_SECRET=your-super-secret-jwt-key-here-change-me
JWT_EXPIRES_IN=8h
```

### AWS S3 (for document uploads)

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET=your-s3-bucket-name
```

### Email Configuration (for notifications)

```
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-password
```

## Quick Setup Checklist

- [ ] Get Supabase password from: https://supabase.com/dashboard/project/ffmikbnryqpmjbzyldrf/settings/database
- [ ] Copy PostgreSQL URI and add to DATABASE_URL
- [ ] Set DIRECT_URL (same as DATABASE_URL without ?schema=public)
- [ ] Generate random JWT_SECRET (use: `openssl rand -base64 32`)
- [ ] Configure AWS S3 credentials (optional but recommended)
- [ ] Configure SMTP for email (optional)
- [ ] Deploy to Render
- [ ] Verify login works
- [ ] Test department-based tab access

## Testing After Deployment

Login credentials (password: `password123`):

| Email | Department | Expected Tabs |
|-------|-----------|--------------|
| admin@idl.ng | ADMIN | All |
| sales@idl.ng | SALES | Sales only |
| finance@idl.ng | FINANCE | Finance only |
| inventory@idl.ng | PROCUREMENT | Procurement only |
| auditor@idl.ng | AUDITOR | Audit only |

## Important Notes

1. **Never commit .env file** - only use in Render environment variables
2. **DATABASE_URL vs DIRECT_URL:**
   - DATABASE_URL: For app connection pooling
   - DIRECT_URL: For Prisma migrations
3. **Supabase Password:** Keep safe and rotate regularly
4. **AWS Credentials:** Use IAM user with S3 permissions only
5. **JWT_SECRET:** Use strong random value, never share

## Supabase Settings to Check

1. Network → IP Whitelist: Add Render's IP addresses
2. Database → Connection Info: Get your credentials
3. Backups: Verify automatic backups are enabled
4. Performance: Monitor connection usage

---

**Ready to deploy!** Configure these variables in Render and push your code.
