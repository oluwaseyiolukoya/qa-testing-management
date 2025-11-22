# 🚀 Git-Based Deployment - Quick Guide

## ✅ Current Status

Your QA Testing Management application is:
- ✅ **Built** - Frontend production build complete
- ✅ **Committed** - All files in Git (132 files, 27K+ lines)
- ✅ **Ready** - Documentation and configs prepared
- ⏳ **Waiting** - For you to push to GitHub/GitLab

---

## 🎯 3-Step Deployment

### 1️⃣ Push to Git (5 minutes)

```bash
# Create repository on GitHub/GitLab (private recommended)
# Repository name: qa-testing-management

# Add your Namecheap SSH key to GitHub/GitLab
# (Copy from cPanel → Security → SSH Access)

# Add remote and push
cd /Users/oluwaseyio/QA_testing
git remote add origin git@github.com:YOUR_USERNAME/qa-testing-management.git
git push -u origin main
```

### 2️⃣ Clone to Server (5 minutes)

```bash
# SSH into Namecheap
ssh your_username@cmpmediapartner.com -p 21098

# Clone repository
cd ~/public_html
mkdir -p qatest && cd qatest
git clone git@github.com:YOUR_USERNAME/qa-testing-management.git .

# Reorganize for web
mv backend api
cp -r frontend/dist/* .
```

### 3️⃣ Configure & Test (10 minutes)

```bash
# Create .env file
cd ~/public_html/qatest/api
nano .env
# (Paste your database credentials)

# Import database
cd ~/public_html/qatest/database/exports
mysql -u user -p database < production_export_2025-11-22.sql

# Seed users
cd ~/public_html/qatest/api/database
php seed_users.php

# Test
# Visit: https://qatest.cmpmediapartner.com
# Login: admin / admin123
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **GIT_SETUP_INSTRUCTIONS.md** | Complete Git setup guide |
| **GIT_DEPLOYMENT_GUIDE.md** | Detailed deployment steps |
| **DEPLOYMENT_GUIDE.md** | Traditional FTP deployment |
| **QUICK_DEPLOY.md** | Quick reference checklist |
| **README.md** | Project overview |

---

## 🔐 What You Need

1. **Git Provider Account:**
   - GitHub: https://github.com
   - GitLab: https://gitlab.com

2. **Namecheap SSH Key:**
   - Location: cPanel → Security → SSH Access
   - Copy the **public key** (starts with `ssh-rsa`)

3. **Database Credentials:**
   - Database name
   - Database user
   - Database password
   - (Create in cPanel → MySQL Databases)

4. **JWT Secret:**
   - Generate a random 32+ character string
   - Use: https://randomkeygen.com/

---

## 🎨 What's Included

### Features:
- ✅ Dashboard with real-time metrics
- ✅ Project management
- ✅ Test case creation with steps
- ✅ Test execution & tracking
- ✅ Module organization
- ✅ Reports & analytics (charts)
- ✅ Team management (Admin only)
- ✅ Role-based access control

### Tech Stack:
- **Frontend:** React 18 + TypeScript (built: 845 KB)
- **Backend:** PHP 8.4 + MySQL
- **Auth:** Custom JWT
- **UI:** Tailwind CSS + shadcn/ui

---

## 🔄 Update Workflow

### Local → Git → Server

```bash
# 1. Make changes locally
cd /Users/oluwaseyio/QA_testing
# ... edit files ...

# 2. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 3. Pull on server
ssh user@server -p 21098
cd ~/public_html/qatest
git pull origin main
```

---

## 📞 Need Help?

1. **Git Setup:** Read `GIT_SETUP_INSTRUCTIONS.md`
2. **Deployment:** Read `GIT_DEPLOYMENT_GUIDE.md`
3. **Troubleshooting:** Check the guides for common issues

---

## ⚡ Quick Start Command

Copy this entire block and run it (after creating your repository):

```bash
# Replace YOUR_USERNAME with your GitHub/GitLab username
cd /Users/oluwaseyio/QA_testing
git remote add origin git@github.com:YOUR_USERNAME/qa-testing-management.git
git push -u origin main
echo "✅ Code pushed! Now SSH into Namecheap and clone the repository."
```

---

## 🎉 Ready to Deploy!

**Next:** Open `GIT_SETUP_INSTRUCTIONS.md` and follow Step 1.

Your application will be live at: **https://qatest.cmpmediapartner.com**

Good luck! 🚀

