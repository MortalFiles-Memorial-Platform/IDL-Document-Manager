# Deployment Checklist

## Before Deploying Backend

### 1. Generate Secure JWT Secret
```bash
# Run this in terminal to generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and use it for `JWT_SECRET` in your hosting platform.

### 2. Database Setup
- [ ] Choose hosting provider (Render, Railway, or Fly.io)
- [ ] Create PostgreSQL database
- [ ] Copy database connection URL
- [ ] Update `DATABASE_URL` in environment variables
- [ ] Verify database can accept connections from your region

### 3. Code Preparation
- [ ] Commit all changes: `git add -A && git commit -m "Ready for deployment"`
- [ ] Push to main: `git push origin main`
- [ ] Verify GitHub repo is public or hosting service has access

### 4. Environment Variables
Set these in your hosting platform dashboard:
- [ ] `DATABASE_URL` (PostgreSQL connection string)
- [ ] `JWT_SECRET` (generated above)
- [ ] `JWT_EXPIRES_IN` = `8h`
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` (may auto-detect, usually 10000 for Render)

### 5. Build Commands
- [ ] Build Command: `cd idl-ris && npm install && npx prisma generate && npx prisma migrate deploy`
- [ ] Start Command: `cd idl-ris && npm run start:server`

### 6. Verify Deployment
```bash
# After deployment, test your backend
curl https://your-backend-url.com/api/health

# Or test login endpoint
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@idl.ng","password":"password123"}'
```

### 7. Update Frontend
- [ ] Note your backend URL (e.g., https://idl-document-manager-api.onrender.com)
- [ ] Add to GitHub Pages build environment:
  - [ ] Set `VITE_BACKEND_URL` in GitHub Actions workflow (optional)
  - [ ] Or update `vite.config.ts` to use your URL
- [ ] Rebuild and push frontend: `npm run build:client && git push`

### 8. Configure CORS
In your backend (already included), verify CORS allows GitHub Pages:
```typescript
app.use(cors({
  origin: [
    'https://mortalfiles-memorial-platform.github.io',
    'http://localhost:5173'
  ]
}));
```

### 9. Test Full Stack
- [ ] Visit GitHub Pages URL
- [ ] Try logging in with admin@idl.ng / password123
- [ ] Create a test document
- [ ] Verify document appears in database
- [ ] Test password reset
- [ ] Test logout/login cycle

### 10. Monitor & Maintain
- [ ] Set up error notifications
- [ ] Monitor database usage
- [ ] Check free tier limits and renewal dates
- [ ] Enable automatic backups if available
- [ ] Set up log aggregation

---

## Quick Service Comparison

| Feature | Render | Railway | Fly.io |
|---------|--------|---------|--------|
| **Free Tier** | 750 hrs/month | $5 credits/month | 3 shared VMs free |
| **Auto-sleep** | Yes (15 days) | No time limit | No auto-sleep |
| **DB Included** | PostgreSQL free | PostgreSQL free | PostgreSQL free |
| **Cold Start** | ~30s after sleep | Minimal | Minimal |
| **Setup Time** | 5 minutes | 3 minutes | 10 minutes |
| **CLI Required** | No | No | Yes (Fly CLI) |
| **Best For** | Beginners | Production testing | High performance |

---

## Free Tier Warnings

### Render
- Auto-pauses web services after 15 days of inactivity
- Free PostgreSQL limited to 1GB storage
- Restarts automatically when accessed (takes 30-60 seconds)

### Railway
- Free $5 credit per month (roughly 0.5GB RAM hours)
- No auto-pause - runs 24/7
- Good for light projects

### Fly.io
- Free: 3 shared-cpu-1x 256MB VMs per month
- Auto-scales within free tier
- Best performance of the three

---

## Troubleshooting Deployment

### Build Fails: "prisma generate"
```bash
# Ensure prisma client is generated locally first
cd idl-ris
npx prisma generate
git add -A
git commit -m "Add generated prisma client"
git push
```

### Database Connection Failed
- [ ] Check DATABASE_URL format matches provider (postgres:// vs postgresql://)
- [ ] Verify IP whitelist/firewall rules allow connections
- [ ] Test connection locally before deploying

### API returns 401 Unauthorized
- [ ] Check JWT_SECRET matches in frontend and backend
- [ ] Verify token is being sent in Authorization header
- [ ] Check token expiration time

### Documents won't save
- [ ] Verify database migrations ran: `npx prisma migrate deploy`
- [ ] Check database write permissions
- [ ] Review application logs for specific errors

### Frontend can't reach backend
- [ ] Verify CORS headers are returned
- [ ] Check backend URL in browser network tab
- [ ] Ensure VITE_BACKEND_URL is set correctly
- [ ] Test API directly: `curl https://backend-url/api/auth/me`
