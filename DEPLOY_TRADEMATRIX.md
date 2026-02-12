# TradeMatrix Deployment to TryASP.NET
## Your Specific Configuration

### 🌐 Domain Information
- **Website URL**: https://tradematrix.tryasp.net
- **Server**: site54731.siteasp.net
- **Database**: ✅ Already deployed (db32949.public.databaseasp.net)

### 🔐 FTP Credentials
- **FTP Server**: site54731.siteasp.net
- **Port**: 21 (FTP) or 22 (SFTP/SCP)
- **Username**: site54731
- **Password**: 4Ghl=3Jz8Te%
- **Root Directory**: \wwwroot

### 📁 Deployment Structure
```
\wwwroot\
  ├── index.html           (Frontend - root)
  ├── _next\               (Frontend assets)
  ├── web.config           (Frontend URL rewrite)
  └── api\                 (Backend folder)
      ├── TradeMatrix.Server.dll
      ├── web.config
      └── ... (other backend files)
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Build Backend (2 minutes)

Open PowerShell in your project root:

```powershell
cd backend\TradeMatrix.Server
dotnet publish -c Release -o .\publish
```

✅ Files will be in `backend\TradeMatrix.Server\publish\`

---

### Step 2: Build Frontend (3 minutes)

#### Enable Static Export
Edit `frontend\next.config.ts`:

Uncomment these lines:
```typescript
output: 'export',
images: {
  unoptimized: true
},
```

#### Build
```powershell
cd frontend
npm install
npm run build
```

✅ Files will be in `frontend\out\`

---

### Step 3: Upload via FTP (10 minutes)

#### Option A: Using FileZilla (Recommended)

1. **Download FileZilla**: https://filezilla-project.org/

2. **Connect to Server**:
   - Host: `site54731.siteasp.net`
   - Username: `site54731`
   - Password: `4Ghl=3Jz8Te%`
   - Port: `21`
   - Click "Quickconnect"

3. **Upload Backend**:
   - Navigate to `/wwwroot/api` on the server (create `api` folder if it doesn't exist)
   - Upload ALL files from `backend\TradeMatrix.Server\publish\` to `/wwwroot/api/`

4. **Upload Frontend**:
   - Navigate to `/wwwroot` on the server
   - Upload ALL files from `frontend\out\` to `/wwwroot/`
   - Also upload `frontend\web.config` to `/wwwroot/`

#### Option B: Using WebFTP (Browser)

1. Go to: https://webftp.monsterasp.net
2. Login with credentials above
3. Upload files as described in Option A

---

### Step 4: Configure IIS (5 minutes)

1. **Login to Control Panel**:
   - Go to your TryASP.NET control panel
   - Find "Application Pools" or "IIS Settings"

2. **Configure Application Pool**:
   - Find your site's application pool
   - Set **.NET CLR Version**: "No Managed Code" (for .NET Core)
   - Set **Pipeline Mode**: "Integrated"
   - Click **Save**

3. **Recycle Application Pool**:
   - Click "Recycle" or "Restart" button

---

### Step 5: Test Deployment (5 minutes)

#### Test Backend API
Visit: https://tradematrix.tryasp.net/api/Database/info

**Expected Response** (JSON):
```json
{
  "serverVersion": "Microsoft SQL Server...",
  "databaseName": "db32949",
  "databaseProvider": "Microsoft.EntityFrameworkCore.SqlServer",
  ...
}
```

#### Test Frontend
Visit: https://tradematrix.tryasp.net

**Expected**: Login page should appear

#### Test Login
1. Click login
2. Use credentials from database
3. Should redirect to dashboard
4. Dashboard should load data

---

## 🔍 Verification Checklist

- [ ] Backend responds: https://tradematrix.tryasp.net/api/Database/info
- [ ] Frontend loads: https://tradematrix.tryasp.net
- [ ] Login page accessible
- [ ] Can login successfully
- [ ] Dashboard loads with data
- [ ] No CORS errors (check browser console F12)
- [ ] User management page shows users
- [ ] Inventory page shows products
- [ ] All navigation works

---

## 🐛 Troubleshooting

### Backend Shows 500 Error
**Solutions**:
1. Verify Application Pool is set to "No Managed Code"
2. Recycle the application pool
3. Check that all files uploaded correctly (especially web.config)
4. Check IIS logs in control panel

### Frontend Shows Blank Page
**Solutions**:
1. Check browser console (F12) for errors
2. Verify `web.config` is in `/wwwroot/`
3. Verify `index.html` is in `/wwwroot/`
4. Clear browser cache

### CORS Error in Console
**Solutions**:
1. Verify `appsettings.Production.json` has correct `Frontend:ProductionUrl`
2. Recycle application pool
3. Clear browser cache

### API Calls Return 404
**Solutions**:
1. Verify backend is in `/wwwroot/api/` folder
2. Test backend URL directly: https://tradematrix.tryasp.net/api/Database/info
3. Check `NEXT_PUBLIC_API_URL` in `.env.production`

---

## 📝 FileZilla Quick Setup

**Quick Connect Settings**:
```
Host: site54731.siteasp.net
Username: site54731
Password: 4Ghl=3Jz8Te%
Port: 21
```

**Folder Structure After Upload**:
```
Remote site: /wwwroot
├── /api
│   ├── TradeMatrix.Server.dll
│   ├── web.config
│   ├── appsettings.Production.json
│   └── ... (other DLLs and files)
├── index.html
├── web.config
├── _next/
│   └── ... (Next.js assets)
└── ... (other frontend files)
```

---

## ⚡ Quick Commands Reference

```powershell
# Build Backend
cd backend\TradeMatrix.Server
dotnet publish -c Release -o .\publish

# Build Frontend
cd frontend
npm run build

# Test Locally First
# Backend
cd backend\TradeMatrix.Server
dotnet run
# Visit: http://localhost:5009/api/Database/info

# Frontend
cd frontend
npm run dev
# Visit: http://localhost:3000
```

---

## 🔄 Updating After Deployment

### Update Backend
1. Make changes
2. Run: `dotnet publish -c Release -o .\publish`
3. Upload to `/wwwroot/api/` (overwrite)
4. Recycle app pool

### Update Frontend
1. Make changes
2. Run: `npm run build`
3. Upload `out/*` to `/wwwroot/` (overwrite)
4. Clear browser cache

---

## 📞 Support

- **TryASP.NET Control Panel**: Check your hosting provider's portal
- **WebFTP Access**: https://webftp.monsterasp.net
- **General Guide**: See DEPLOYMENT_GUIDE.md in project root

---

**Your domain is configured and ready to deploy!** 🎉

Just follow the steps above and you'll have TradeMatrix running on https://tradematrix.tryasp.net
