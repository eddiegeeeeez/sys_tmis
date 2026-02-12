# TradeMatrix Authentication & Testing Guide

## 🔐 Test Credentials

All test users have the password: **`Password123!`**

| Role | Email | Password | Access Level |
|------|--------|----------|--------------|
| **Super Admin** | superadmin@tmis.com | Password123! | Full system access + database admin |
| **System Admin** | admin@tmis.com | Password123! | User management, roles, security logs |
| **Manager** | manager@tmis.com | Password123! | Sales, inventory, reports |
| **Cashier** | cashier@tmis.com | Password123! | POS, transactions |
| **Inventory Clerk** | clerk@tmis.com | Password123! | Inventory only |

---

## 🧪 Testing Checklist

### Local Development (`npm run dev`)
- ✅ Frontend: http://localhost:3000 or http://localhost:3001
- ✅ Backend: http://localhost:5009
- ✅ API calls: Dev proxy to localhost:5009
- ✅ CORS: Allows localhost:3000, 3001

### Production Build Testing (`dist` folder)
- ✅ Frontend: http://localhost:8080 (via python server)
- ✅ Backend: http://localhost:5009
- ✅ API calls: Direct to localhost:5009 (via .env.production.local)
- ✅ CORS: Allows localhost:8080

### Deployed Production (MonsterASP.NET)
- ✅ Frontend: https://tradematrix.tryasp.net
- ✅ Backend: https://tradematrix.tryasp.net/api
- ✅ API calls: https://tradematrix.tryasp.net/api
- ✅ CORS: Allows tradematrix.tryasp.net

---

## 🐛 Common Authentication Errors & Fixes

### 1. **"Failed to fetch" Error**

**Causes:**
- ❌ Backend not running
- ❌ Wrong API URL in frontend
- ❌ CORS not configured for your origin
- ❌ Port mismatch

**How to Debug:**
```powershell
# Check if backend is running
Test-NetConnection -ComputerName localhost -Port 5009

# Test API directly
Invoke-WebRequest -Uri "http://localhost:5009/api/Database/info"

# Check what URL frontend is using (browser console)
# Should see: "Fetching: http://localhost:5009/api/Auth/login"
```

**Fixes:**
- ✅ Start backend: `cd backend\TradeMatrix.Server; dotnet run`
- ✅ Check CORS in Program.cs includes your port
- ✅ Verify .env.production.local has correct API URL for local testing
- ✅ Check browser console for exact URL being called

---

### 2. **"401 Unauthorized" Error**

**Causes:**
- ❌ Wrong credentials
- ❌ Token expired
- ❌ Invalid token format
- ❌ JWT configuration mismatch

**How to Debug:**
```powershell
# Test login directly
$body = '{"email":"superadmin@tmis.com","password":"Password123!"}'
Invoke-WebRequest -Uri "http://localhost:5009/api/Auth/login" -Method Post -Body $body -ContentType "application/json"
```

**Fixes:**
- ✅ Use correct credentials (see table above)
- ✅ Clear localStorage and login again
- ✅ Check JWT key matches in appsettings.json

---

### 3. **CORS Error in Browser Console**

**Error Message:**
```
Access to fetch at 'http://localhost:5009/api/Auth/login' from origin 
'http://localhost:8080' has been blocked by CORS policy
```

**Causes:**
- ❌ Origin not in CORS policy
- ❌ Backend not restarted after CORS changes

**Fixes:**
- ✅ Add origin to Program.cs CORS policy:
  ```csharp
  "http://localhost:8080"  // For production build testing
  ```
- ✅ Restart backend to apply CORS changes
- ✅ Check browser console shows correct origin

**Current CORS Configuration:**
```csharp
// backend/TradeMatrix.Server/Program.cs
var allowedOrigins = new List<string>
{
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8080",  // ← Added for production testing
    // Production origin from appsettings.Production.json
};
```

---

### 4. **"Cannot find module" or Build Errors**

**Causes:**
- ❌ node_modules out of sync
- ❌ Lock files corrupted
- ❌ Cached build artifacts

**Fixes:**
```powershell
# Clean and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules, .next, dist
npm install
npm run build
```

---

### 5. **Static Export Issues ("Client-side only" warnings)**

**Causes:**
- ❌ Using server-side only Next.js features with `output: 'export'`
- ❌ Server redirects instead of client redirects
- ❌ API routes (not compatible with static export)

**What Works:**
- ✅ Client components with `'use client'`
- ✅ `useEffect()` + `router.replace()` for redirects
- ✅ External API calls via `fetch()`
- ✅ Client-side routing

**What Doesn't Work:**
- ❌ Server-side `redirect()`
- ❌ API routes (`/api` folder in app directory)
- ❌ Server-side data fetching in static export
- ❌ Dynamic rewrites (only work in dev mode)

---

### 6. **Login Works but Shows Wrong Role Page**

**Causes:**
- ❌ UserContext defaults to MANAGER role before auth check
- ❌ No RoleGuard on protected pages
- ❌ Login redirect logic incorrect

**Fixes:**
- ✅ Root page checks auth and redirects based on role
- ✅ All protected pages wrapped in `<RoleGuard>`
- ✅ UserContext initializes from localStorage
- ✅ Login service correctly saves role to localStorage

**Check this:**
```typescript
// frontend/app/page.tsx
// Should check user role and redirect accordingly
const user = authService.getUser();
if (!user) router.replace('/login');
// else redirect based on user.role
```

---

### 7. **Environment Variables Not Working**

**Priority Order (highest to lowest):**
1. `.env.production.local` (local production testing, **gitignored**)
2. `.env.production` (production builds)
3. `.env.local` (local dev, **gitignored**)
4. `.env` (defaults)

**Current Setup:**
```
frontend/
├── .env.local            # Dev: ❌ Commented out (uses next.config rewrites)
├── .env.production       # Production: https://tradematrix.tryasp.net/api
└── .env.production.local # Local testing: http://localhost:5009 (gitignored)
```

**Testing Locally:**
- Create `.env.production.local` with `NEXT_PUBLIC_API_URL=http://localhost:5009`
- Build: `npm run build`
- Test: Production build uses localhost backend

**Deploying:**
- `.env.production.local` is **not** pushed to GitHub (in .gitignore)
- GitHub Actions uses `.env.production` → `https://tradematrix.tryasp.net/api`

---

## 🔄 Complete Testing Workflow

### Test Locally Before Deploying:

```powershell
# 1. Start Backend
cd backend\TradeMatrix.Server
dotnet run
# Wait for: "Application started. Press Ctrl+C to shut down."

# 2. Create local production test config (if not exists)
echo "NEXT_PUBLIC_API_URL=http://localhost:5009" > frontend\.env.production.local

# 3. Build Frontend
cd frontend
npm run build

# 4. Serve Production Build
cd dist
python -m http.server 8080

# 5. Test in Browser
# Open: http://localhost:8080
# Login: superadmin@tmis.com / Password123!
# Check browser console for errors
```

### Deploy to MonsterASP.NET:

```powershell
# 1. Remove local test config (optional, it's gitignored anyway)
Remove-Item frontend\.env.production.local -ErrorAction SilentlyContinue

# 2. Commit and push
git add .
git commit -m "Deploy with authentication fixes"
git push

# 3. Monitor GitHub Actions
# Go to: https://github.com/YOUR_USERNAME/tradematrix/actions

# 4. Test deployed site
# Open: https://tradematrix.tryasp.net
# Login: superadmin@tmis.com / Password123!
```

---

## 🚨 Pre-Deployment Checklist

Before pushing to production:

- [ ] Backend builds without errors (`dotnet build`)
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Login works locally (http://localhost:8080)
- [ ] Role-based navigation works
- [ ] API calls succeed (check browser console)
- [ ] No CORS errors in browser console
- [ ] All protected routes require authentication
- [ ] Logout redirects to login page
- [ ] Token persists across page refreshes

---

## 📊 Quick Reference

### Backend Endpoints

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/api/Auth/login` | POST | ❌ | Login |
| `/api/Database/info` | GET | ❌ | Backend health check |
| `/api/Users` | GET | ✅ | List users |
| Other `/api/*` | * | ✅ | Protected endpoints |

### Frontend Routes

| Route | Public | Role Required |
|-------|--------|---------------|
| `/` | ✅ | None (redirects) |
| `/login` | ✅ | None |
| `/dashboard` | ❌ | Any authenticated |
| `/super-admin/*` | ❌ | SuperAdmin only |
| `/admin` | ❌ | SystemAdmin only |
| `/manager` | ❌ | Manager only |
| `/cashier` | ❌ | Cashier only |
| `/inventory` | ❌ | InventoryClerk, Manager |

---

## 🛠️ Troubleshooting Commands

### Check Backend Status
```powershell
# Is backend running?
Test-NetConnection -ComputerName localhost -Port 5009

# Test API endpoint
Invoke-WebRequest -Uri "http://localhost:5009/api/Database/info"

# Test login
$body = '{"email":"superadmin@tmis.com","password":"Password123!"}'
Invoke-WebRequest -Uri "http://localhost:5009/api/Auth/login" -Method Post -Body $body -ContentType "application/json"
```

### Check Frontend Build
```powershell
# What API URL is compiled in?
cd frontend\dist\_next\static\chunks
Select-String -Path "*.js" -Pattern "localhost:5009|tradematrix.tryasp.net" | Select-Object -First 1

# Check environment
cd frontend
Get-Content .env.production.local
Get-Content .env.production
```

### Clear Everything
```powershell
# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules, .next, dist
npm install
npm run build

# Backend
cd backend\TradeMatrix.Server
dotnet clean
dotnet build
```

---

## 📞 Quick Help

**Backend won't start?**
1. Check port: `Test-NetConnection localhost -Port 5009`
2. Kill process: `Get-Process -Name "TradeMatrix.Server" | Stop-Process -Force`
3. Rebuild: `dotnet clean; dotnet build`

**Frontend "Failed to fetch"?**
1. Check backend is running
2. Check browser console for actual URL being called
3. Verify CORS includes your origin
4. Check `.env.production.local` has correct API URL

**Login doesn't work?**
1. Use credentials: `superadmin@tmis.com` / `Password123!`
2. Check browser console for 401 error details
3. Clear localStorage: `localStorage.clear()`
4. Try different browser (clear cache)

---

**All test users share the same password: `Password123!`**

**For local production testing, create: `frontend\.env.production.local` with `NEXT_PUBLIC_API_URL=http://localhost:5009`**
