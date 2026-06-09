# Backend Hosting Guide for IDL Document Manager

This guide covers hosting the Node.js/Express backend on free services while keeping the frontend on GitHub Pages.

## Option 1: Render (Recommended - Most Beginner Friendly)

### Step 1: Prepare Your Repository
```bash
# Make sure all changes are committed
git add -A
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account (easier for deployment)
3. Authorize Render to access your GitHub repositories

### Step 3: Create PostgreSQL Database
1. In Render dashboard, click "New+" button
2. Select "PostgreSQL"
3. Name: `idl-document-manager-db`
4. Plan: Free (note: free tier auto-pauses after 15 days of inactivity)
5. Click "Create Database"
6. Copy the connection string (you'll need this later)

### Step 4: Deploy Backend Service
1. Click "New+" → "Web Service"
2. Connect your GitHub repository (MortalFiles-Memorial-Platform/IDL-Document-Manager)
3. Configure:
   - **Name**: `idl-document-manager-api`
   - **Environment**: Node
   - **Build Command**: `cd idl-ris && npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `cd idl-ris && npm run start:server`
   - **Plan**: Free
4. Click "Create Web Service"

### Step 5: Set Environment Variables
In the Render dashboard for your service:
1. Go to "Environment" tab
2. Add the following variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<paste your PostgreSQL connection string>
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=8h
   PORT=10000
   ```
3. Click "Save"

### Step 6: Update Frontend API Endpoint
After deployment, you'll get a URL like `https://idl-document-manager-api.onrender.com`

Update `idl-ris/vite.config.ts`:
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'https://idl-document-manager-api.onrender.com',
      changeOrigin: true,
      rewrite: (path) => path
    }
  }
}
```

Also update `idl-ris/src/client/lib/api.ts` to use the backend in production:
```typescript
export const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://idl-document-manager-api.onrender.com/api'
    : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Step 7: Rebuild and Deploy
```bash
cd idl-ris
npm run build:client
git add -A
git commit -m "Update frontend to use Render backend"
git push origin main
```

GitHub Actions will deploy the updated frontend to GitHub Pages.

---

## Option 2: Railway

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your IDL-Document-Manager repository
4. Click "Deploy"

### Step 3: Add PostgreSQL Service
1. In the Railway dashboard, click "Add Service"
2. Select "PostgreSQL"
3. Railway will create the database automatically
4. Click on the PostgreSQL plugin to get connection details

### Step 4: Configure Environment Variables
Click on your service and go to "Variables":
```
NODE_ENV=production
DATABASE_URL=<PostgreSQL connection URL from Railway>
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=8h
```

### Step 5: Set Startup Command
In the "Settings" tab:
- **Build Command**: `cd idl-ris && npm install && npx prisma migrate deploy`
- **Start Command**: `cd idl-ris && npm run start:server`
- **Port**: Leave blank (Railway auto-detects)

### Step 6: Get Your Backend URL
Railway gives you a domain automatically. Find it in the "Deployments" tab or check the logs.

---

## Option 3: Fly.io

### Step 1: Install Fly CLI
```bash
# Windows: Use choco or download from https://fly.io/docs/getting-started/installing-flyctl/
choco install flyctl
# Or download directly from https://github.com/superfly/flyctl/releases

# Verify installation
flyctl version
```

### Step 2: Create Fly Account
```bash
flyctl auth signup
# Follow the prompts to create account
```

### Step 3: Create app.json
In your project root, create `app.json`:
```json
{
  "app": "idl-document-manager",
  "kill_signal": "SIGINT",
  "processes": {},
  "env": {
    "NODE_ENV": {
      "description": "Node environment",
      "value": "production"
    },
    "JWT_SECRET": {
      "description": "JWT secret key",
      "value": "change-this-to-a-secure-random-string"
    }
  },
  "services": [
    {
      "internal_port": 4000,
      "processes": ["app"],
      "protocol": "tcp",
      "script_checks": []
    }
  ]
}
```

### Step 4: Create Dockerfile
In your project root, create `Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY idl-ris/package*.json ./idl-ris/

RUN npm install && cd idl-ris && npm install

COPY . .

WORKDIR /app/idl-ris

RUN npm run build:client && npx prisma generate

EXPOSE 4000

CMD ["npm", "run", "start:server"]
```

### Step 5: Deploy
```bash
flyctl launch
# Answer prompts:
# - App name: idl-document-manager
# - Would you like to set up a Postgres database? Yes
# - Development or production? Production
# - Region: Choose closest to you

flyctl deploy
```

### Step 6: Get Your Backend URL
```bash
flyctl open
# This will show your app URL (something like https://idl-document-manager.fly.dev)
```

---

## Configuration for GitHub Pages + External Backend

### Update Frontend API Client

Edit `idl-ris/src/client/lib/api.ts`:
```typescript
import axios from 'axios';
import { getToken } from './auth';
import { mockAuthService } from './mockAuth';

const isGitHubPages = (): boolean => {
  return window.location.hostname === 'mortalfiles-memorial-platform.github.io';
};

const getBackendUrl = (): string => {
  if (isGitHubPages()) {
    // Use your deployed backend URL here
    return 'https://your-backend-url.com';
  }
  return '';
};

export const api = axios.create({
  baseURL: isGitHubPages() ? `${getBackendUrl()}/api` : '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ... rest of the interceptor code remains the same
```

### Update AuthContext for Production

Edit `idl-ris/src/client/context/AuthContext.tsx` - disable mock auth when backend is available:
```typescript
const isGitHubPages = (): boolean => {
  return window.location.hostname === 'mortalfiles-memorial-platform.github.io';
};

const hasBackendUrl = !!process.env.VITE_BACKEND_URL;

// Use mock auth only if on GitHub Pages AND no backend URL configured
const USE_MOCK_AUTH = isGitHubPages() && !hasBackendUrl;
```

---

## Testing Different User Roles

Once backend is deployed, create users with different roles:

```bash
# SSH into your database (instructions vary by service)
# Then run:

INSERT INTO "User" (email, password, "firstName", "lastName", role, "isActive", "createdAt", "updatedAt")
VALUES 
  ('admin@idl.ng', '$2a$10$...hashed_password...', 'Admin', 'User', 'ADMIN', true, NOW(), NOW()),
  ('finance@idl.ng', '$2a$10$...hashed_password...', 'Finance', 'Officer', 'FINANCE', true, NOW(), NOW()),
  ('sales@idl.ng', '$2a$10$...hashed_password...', 'Sales', 'Manager', 'SALES', true, NOW(), NOW()),
  ('auditor@idl.ng', '$2a$10$...hashed_password...', 'Audit', 'Officer', 'AUDITOR', true, NOW(), NOW()),
  ('inventory@idl.ng', '$2a$10$...hashed_password...', 'Inventory', 'Manager', 'PROCUREMENT', true, NOW(), NOW());
```

Or use the backend API:
```bash
curl -X POST https://your-backend-url.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "finance@idl.ng",
    "password": "password123",
    "firstName": "Finance",
    "lastName": "Officer",
    "role": "FINANCE"
  }'
```

---

## Troubleshooting

### Backend Service Won't Start
```bash
# Check logs (Render/Railway/Fly)
# Look for database connection errors
# Ensure DATABASE_URL is correctly set
# Try running migrations manually
```

### CORS Errors
Add CORS middleware to backend (`idl-ris/src/server/index.ts`):
```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'https://mortalfiles-memorial-platform.github.io',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

### Database Connection Issues
- Verify DATABASE_URL format matches your database service
- Check firewall/network rules allow connections
- Ensure Prisma migrations are running at startup
- Test connection: `npx prisma db execute --stdin < test.sql`

### Free Tier Limitations
- **Render**: Auto-pauses after 15 days of inactivity (redeploys on request)
- **Railway**: Limited monthly credits, may require paid plan for extended use
- **Fly.io**: 3 shared-cpu-1x 256MB VMs free per month

---

## Production Recommendations

1. **Database Backups**: Set up automatic backups through your hosting provider
2. **SSL/TLS**: All services provide HTTPS by default
3. **Environment Variables**: Never commit secrets to Git
4. **Monitoring**: Enable error logging and uptime monitoring
5. **Database Pooling**: Use connection pooling for production databases
6. **JWT Secret**: Generate a strong random string:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
