# GitHub Deployment Setup for TradeMatrix

Automatic deployment to MonsterASP.NET using GitHub Actions.

## ✅ What's Already Configured

GitHub Actions workflows are created:
- `.github/workflows/deploy-backend.yml` - Deploys ASP.NET backend to `/api`
- `.github/workflows/deploy-frontend.yml` - Deploys Next.js frontend to root

## 🚀 Setup Steps (15 minutes)

### Step 1: Enable WebDeploy in MonsterASP.NET Control Panel

1. Login to: https://admin.monsterasp.net/
2. Select your site: **site54731**
3. Go to **Deploy (FTP/WebDeploy/Git)** section
4. Click **Activate** button in **WebDeploy** section
5. Note down your WebDeploy credentials:
   ```
   WEBSITE_NAME: site54731
   SERVER_COMPUTER_NAME: https://site54731.siteasp.net:8172
   SERVER_USERNAME: site54731
   SERVER_PASSWORD: [shown in control panel]
   ```

### Step 2: Create GitHub Repository

If you haven't already:

```powershell
cd "c:\Users\mendo\OneDrive\Documents\PAM IT13\sys_tmis"
git init
git add .
git commit -m "Initial commit"
```

Create repository on GitHub, then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/tradematrix.git
git branch -M main
git push -u origin main
```

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/tradematrix`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these 4 secrets:

| Name | Value |
|------|-------|
| `WEBSITE_NAME` | `site54731` |
| `SERVER_COMPUTER_NAME` | `https://site54731.siteasp.net:8172` |
| `SERVER_USERNAME` | `site54731` |
| `SERVER_PASSWORD` | `[from WebDeploy activation in control panel]` |

### Step 4: Test Deployment

Push a change to trigger automatic deployment:

```powershell
git add .
git commit -m "Test GitHub deployment"
git push
```

**Monitor deployment:**
1. Go to GitHub repository → **Actions** tab
2. Watch the workflow run in real-time
3. Check logs if any errors occur

### Step 5: Verify Live Site

After successful deployment:

- **Backend API**: https://tradematrix.tryasp.net/api/Database/info
- **Frontend**: https://tradematrix.tryasp.net
- **Login**: Test authentication and dashboard

---

## 🔄 How It Works

### Automatic Triggers

**Backend deployment runs when:**
- You push changes to `backend/` folder
- You manually trigger it from Actions tab

**Frontend deployment runs when:**
- You push changes to `frontend/` folder
- You manually trigger it from Actions tab

### Deployment Process

**Backend:**
1. GitHub Actions builds .NET 9 project
2. Publishes Release build
3. Deploys to `/wwwroot/api` via WebDeploy
4. IIS automatically restarts

**Frontend:**
1. GitHub Actions installs npm dependencies
2. Builds Next.js static export
3. Copies web.config to output
4. Deploys to `/wwwroot` via WebDeploy

---

## 🎯 Manual Deployment Trigger

You can manually trigger deployment without pushing code:

1. Go to GitHub repository → **Actions**
2. Select workflow (Backend or Frontend)
3. Click **Run workflow** → **Run workflow**

---

## 🐛 Troubleshooting

### Deployment Fails with "Cannot connect to server"

**Solution:**
- Verify WebDeploy is activated in control panel
- Check `SERVER_COMPUTER_NAME` includes `https://` and `:8172`
- Verify secrets are correct (no extra spaces)

### Backend Deploys but Shows 500 Error

**Solution:**
1. Login to MonsterASP.NET control panel
2. Check Application Pool settings:
   - .NET CLR Version: **No Managed Code**
   - Pipeline Mode: **Integrated**
3. Recycle the application pool

### Frontend Deploys but Shows Blank Page

**Solution:**
- Verify `web.config` was deployed to `/wwwroot`
- Check browser console (F12) for errors
- Verify `NEXT_PUBLIC_API_URL` in workflow matches your domain

### Workflow Doesn't Trigger

**Solution:**
- Check if paths filter matches your changes
- Verify branch name is `main` or `master` (update workflow if different)
- Try manual workflow dispatch

---

## 📊 Deployment Comparison

| Method | Setup Time | Manual Steps | Auto-Deploy | Best For |
|--------|-----------|--------------|-------------|----------|
| **FTP Upload** | 2 min | Every time | ❌ | Initial deployment |
| **GitHub Actions** | 15 min | One-time | ✅ | Ongoing development |
| **Control Panel Git** | 10 min | Click "Pull" | ❌ | Simple projects |

---

## 🔐 Security Notes

- **Never commit secrets** to your repository
- All credentials stored in GitHub Secrets (encrypted)
- WebDeploy uses HTTPS encryption
- Secrets only accessible to repository admins

---

## ⚡ Quick Reference

### Workflow Files Location
```
.github/workflows/
├── deploy-backend.yml   (Backend deployment)
└── deploy-frontend.yml  (Frontend deployment)
```

### Push Commands
```powershell
# Deploy both backend and frontend
git add .
git commit -m "Update message"
git push

# Deploy only backend
git add backend/
git commit -m "Update backend"
git push

# Deploy only frontend
git add frontend/
git commit -m "Update frontend"
git push
```

### Check Deployment Status
```
GitHub Repository → Actions tab → Latest workflow run
```

---

## 🎉 Benefits of GitHub Deployment

✅ **Automatic** - Push code, deployment happens automatically  
✅ **Version Control** - Every deployment tracked in Git history  
✅ **Rollback** - Easy to revert to previous version  
✅ **Build Logs** - See exactly what happened during deployment  
✅ **No FTP** - Never manually upload files again  
✅ **Team Friendly** - Multiple developers can deploy safely  

---

## 📞 Next Steps

1. ✅ Enable WebDeploy in MonsterASP.NET control panel
2. ✅ Create GitHub repository and push code
3. ✅ Add GitHub Secrets
4. ✅ Test first deployment
5. ✅ Verify site works
6. 🚀 Keep coding and pushing - deployments happen automatically!

---

**Your TradeMatrix project is now configured for automatic GitHub deployment!** 🎊
