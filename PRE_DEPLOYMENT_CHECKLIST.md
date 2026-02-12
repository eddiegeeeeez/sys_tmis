# Pre-Deployment Checklist
## TradeMatrix - tradematrix.tryasp.net

Run through this checklist BEFORE starting deployment to avoid issues.

---

## ✅ Configuration Files Updated

### Backend Configuration
- [ ] `backend/TradeMatrix.Server/appsettings.Production.json`:
  ```json
  "Frontend": {
    "ProductionUrl": "https://tradematrix.tryasp.net"  ✓ CONFIGURED
  }
  ```

- [ ] `backend/TradeMatrix.Server/appsettings.Production.json`:
  ```json
  "Jwt": {
    "Key": "YourVerySecureProductionKeyHere_ChangeThis_AtLeast32Characters!!!"
  }
  ```
  ⚠️ **ACTION REQUIRED**: Change this to a secure random key!

### Frontend Configuration
- [ ] `frontend/.env.production`:
  ```env
  NEXT_PUBLIC_API_URL=https://tradematrix.tryasp.net/api  ✓ CONFIGURED
  ```

- [ ] `frontend/next.config.ts`:
  - [ ] Uncomment `output: 'export',`
  - [ ] Uncomment `images: { unoptimized: true }`

---

## ✅ Build Environment Ready

### Backend Prerequisites
- [ ] .NET 9.0 SDK installed
  - Check: `dotnet --version`
  - Should show: 9.x.x

- [ ] Project builds locally without errors
  ```powershell
  cd backend/TradeMatrix.Server
  dotnet build
  ```

### Frontend Prerequisites
- [ ] Node.js installed (v18 or higher)
  - Check: `node --version`
  - Should show: v18.x.x or higher

- [ ] Dependencies installed
  ```powershell
  cd frontend
  npm install
  ```

- [ ] Project builds locally without errors
  ```powershell
  npm run build
  ```

---

## ✅ FTP Client Ready

- [ ] FileZilla installed (or another FTP client)
  - Download: https://filezilla-project.org/

- [ ] FTP credentials saved:
  - Host: site54731.siteasp.net
  - Username: site54731
  - Password: 4Ghl=3Jz8Te%
  - Port: 21

- [ ] Test FTP connection successful

---

## ✅ Database Verified

- [ ] Database is accessible:
  - Server: db32949.public.databaseasp.net
  - Database: db32949

- [ ] Connection string in `appsettings.json` matches production:
  ```
  Server=db32949.public.databaseasp.net;
  Database=db32949;
  User Id=db32949;
  Password=A!a76L_gs-4D;
  ```

- [ ] Migrations are up to date:
  ```powershell
  cd backend/TradeMatrix.Server
  dotnet ef migrations list
  ```

---

## ✅ Local Testing Complete

### Backend Tests
- [ ] Backend runs locally:
  ```powershell
  cd backend/TradeMatrix.Server
  dotnet run
  ```

- [ ] API endpoints respond:
  - [ ] http://localhost:5009/api/Database/info returns JSON
  - [ ] http://localhost:5009/api/Database/health shows connected

- [ ] Login works locally via API

### Frontend Tests
- [ ] Frontend runs locally:
  ```powershell
  cd frontend
  npm run dev
  ```

- [ ] All pages load:
  - [ ] Login page: http://localhost:3000/login
  - [ ] Dashboard accessible after login
  - [ ] User management loads
  - [ ] Inventory loads

- [ ] API calls work from frontend to backend

---

## ✅ Security Checklist

- [ ] **IMPORTANT**: JWT Key in `appsettings.Production.json` is changed from default
  - Current: YourVerySecureProductionKeyHere_ChangeThis_AtLeast32Characters!!!
  - ⚠️ **Generate new key**: Use random 32+ character string

- [ ] Database password is secure (already set by host)

- [ ] CORS is configured for production domain only

- [ ] HTTPS will be enforced (web.config has redirect rule)

---

## ✅ Backup & Safety

- [ ] Current code committed to Git (if using version control)

- [ ] Database backup created (optional but recommended):
  ```powershell
  # Via API after deployment:
  POST https://tradematrix.tryasp.net/api/Database/backup/export-users
  ```

- [ ] Have rollback plan if deployment fails

---

## ✅ Files to Upload List

### Backend Files (to /wwwroot/api/)
From `backend/TradeMatrix.Server/publish/`:
- [ ] TradeMatrix.Server.dll
- [ ] appsettings.Production.json
- [ ] web.config
- [ ] All other DLL files
- [ ] All dependency files

### Frontend Files (to /wwwroot/)
From `frontend/out/`:
- [ ] index.html
- [ ] All HTML files
- [ ] _next/ folder
- [ ] All asset files

Plus:
- [ ] web.config (from frontend/ root)

---

## 🎯 Ready to Deploy?

If ALL checkboxes above are checked ✅, you're ready to proceed!

**Next Steps**:
1. Open `DEPLOY_TRADEMATRIX.md`
2. Follow the 5-step deployment process
3. Use `DEPLOYMENT_QUICK_REFERENCE.txt` as quick reference

**Time Required**: ~20-30 minutes

---

## ⚠️ If Any Checkbox is Unchecked

**DO NOT PROCEED** with deployment until all items are checked.

Common issues to resolve:
- Missing dependencies → Run `npm install` or `dotnet restore`
- Build errors → Fix errors before deploying
- FTP not connecting → Verify credentials and network
- Local tests failing → Debug locally first

---

## 📞 Need Help?

- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- Check `DEPLOYMENT_CHECKLIST.md` for step-by-step process
- Review error messages carefully
- Test locally before deploying

---

**Generated**: 2026-02-12
**Domain**: tradematrix.tryasp.net
**Status**: Ready for deployment ✅
