# 🚀 Quick Start: cPanel Git Deployment

## ✅ What's Ready

- ✅ Code on GitHub: `oluwaseyiolukoya/qa-testing-management`
- ✅ `.cpanel.yml` deployment config created
- ✅ Automatic deployment configured

---

## 📋 5-Minute Setup

### 1️⃣ Create Database (2 min)

**cPanel → Databases → MySQL Databases**

```
Database: qatest_db
User: qatest_user
Password: [Generate & Save!]
Privileges: ALL
```

**Note:** Full names will be `cmpmnyin_qatest_db` and `cmpmnyin_qatest_user`

---

### 2️⃣ Clone Repository (1 min)

**cPanel → Files → Git™ Version Control → Create**

```
Clone URL: https://github.com/oluwaseyiolukoya/qa-testing-management.git
Repository Path: /home/cmpmnyin/repositories/qa-testing-management
Repository Name: qa-testing-management
```

Click **Create** and wait for clone to finish.

---

### 3️⃣ Deploy (30 sec)

**Git Version Control → Manage → Pull or Deploy tab**

Click **"Deploy HEAD Commit"**

✅ Files will deploy to `public_html/qatest/`

---

### 4️⃣ Configure .env (1 min)

**File Manager → public_html/qatest/api/ → Create `.env` file**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://qatest.cmpmediapartner.com

DB_HOST=localhost
DB_DATABASE=cmpmnyin_qatest_db
DB_USERNAME=cmpmnyin_qatest_user
DB_PASSWORD=your_password_from_step_1

JWT_SECRET=your_random_32_char_string
CORS_ORIGINS=https://qatest.cmpmediapartner.com
```

Generate JWT secret: https://randomkeygen.com/

---

### 5️⃣ Import Database (1 min)

**cPanel → phpMyAdmin → Select `cmpmnyin_qatest_db` → Import**

File location in File Manager:
```
public_html/qatest/database/exports/production_export_2025-11-22.sql
```

Download it, then import to phpMyAdmin.

---

### 6️⃣ Seed Users (10 sec)

**Visit in browser:**
```
https://qatest.cmpmediapartner.com/api/database/seed_users.php
```

---

### 7️⃣ Test! (10 sec)

**Visit:** https://qatest.cmpmediapartner.com

**Login:**
- Username: `admin`
- Password: `admin123`

🎉 **Success!**

---

## 🔄 Update Workflow

### On Your Mac:
```bash
cd /Users/oluwaseyio/QA_testing
# Make changes...
git add .
git commit -m "Your changes"
git push origin main
```

### In cPanel:
1. Git Version Control → Manage
2. Click "Update from Remote"
3. Click "Deploy HEAD Commit"
4. Done! ✅

---

## 📚 Full Documentation

- **Complete Guide:** `CPANEL_GIT_DEPLOYMENT.md`
- **Troubleshooting:** See full guide
- **cPanel Docs:** https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/

---

## 🎯 Key Benefits

✅ No SSH required  
✅ One-click deployment  
✅ Automatic updates  
✅ Version control  
✅ Easy rollback  

**Your app will be live at:** https://qatest.cmpmediapartner.com 🚀

