# cPanel Git Deployment Guide

## ✅ Better Approach: Use cPanel's Built-in Git Feature

Instead of SSH, we'll use **cPanel's Git Version Control** feature which provides automatic deployment without SSH access!

**Reference:** [cPanel Git Deployment Documentation](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/)

---

## 🎯 What We've Prepared

✅ **`.cpanel.yml` file created** - Deployment configuration  
✅ **Pushed to GitHub** - Ready for cPanel to pull  
✅ **Automatic deployment** - Changes deploy on push  

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Database in cPanel

1. **Log into cPanel**
2. **Go to:** Databases → MySQL Databases
3. **Create Database:**
   - Database name: `qatest_db`
   - Note full name: `cmpmnyin_qatest_db`
4. **Create User:**
   - Username: `qatest_user`
   - Password: Generate strong password (save it!)
   - Note full username: `cmpmnyin_qatest_user`
5. **Add User to Database:**
   - Select user and database
   - Grant **ALL PRIVILEGES**

---

### Step 2: Set Up Git Repository in cPanel

1. **In cPanel, go to:** Files → **Git™ Version Control**

2. **Click:** "Create" button

3. **Fill in the form:**
   - **Clone URL:** `https://github.com/oluwaseyiolukoya/qa-testing-management.git`
   - **Repository Path:** `/home/cmpmnyin/repositories/qa-testing-management`
   - **Repository Name:** `qa-testing-management`
   - Click **Create**

4. **Wait for clone to complete** (may take 1-2 minutes)

---

### Step 3: Configure Repository

1. **In Git Version Control interface, click "Manage"** on your repository

2. **Go to "Pull or Deploy" tab**

3. **You should see:**
   - ✅ `.cpanel.yml` file detected
   - ✅ Deployment information displayed
   - ✅ "Deploy HEAD Commit" button available

---

### Step 4: Initial Deployment

1. **Click "Deploy HEAD Commit"** button

2. **Wait for deployment** (you'll see progress)

3. **Verify deployment:**
   - Go to File Manager
   - Navigate to `public_html/qatest/`
   - You should see:
     ```
     qatest/
     ├── api/
     ├── assets/
     ├── database/
     ├── index.html
     ├── vite.svg
     └── .htaccess
     ```

---

### Step 5: Configure Environment (.env)

1. **In File Manager, navigate to:** `public_html/qatest/api/`

2. **Create new file:** `.env`

3. **Edit and paste:**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://qatest.cmpmediapartner.com

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=cmpmnyin_qatest_db
DB_USERNAME=cmpmnyin_qatest_user
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE

JWT_SECRET=GENERATE_A_SECURE_32_CHAR_RANDOM_STRING
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

CORS_ORIGINS=https://qatest.cmpmediapartner.com
TZ=UTC
```

4. **Update:**
   - Replace `YOUR_DATABASE_PASSWORD_HERE` with your actual password
   - Replace `JWT_SECRET` with a random 32+ character string
   - Generate JWT secret at: https://randomkeygen.com/

5. **Save and close**

---

### Step 6: Import Database

1. **In cPanel, go to:** Databases → phpMyAdmin

2. **Select database:** `cmpmnyin_qatest_db`

3. **Click Import tab**

4. **Choose file:**
   - Navigate via File Manager to: `public_html/qatest/database/exports/production_export_2025-11-22.sql`
   - Or download it first, then upload to phpMyAdmin

5. **Click "Go"** and wait for import to complete

6. **Verify:** You should see 13 tables created

---

### Step 7: Seed Demo Users

**Visit in browser:**
```
https://qatest.cmpmediapartner.com/api/database/seed_users.php
```

You should see: "Demo users seeded successfully!"

---

### Step 8: Set Up Subdomain (if needed)

1. **In cPanel, go to:** Domains → Subdomains

2. **Create subdomain:**
   - Subdomain: `qatest`
   - Domain: `cmpmediapartner.com`
   - Document Root: `public_html/qatest`
   - Click **Create**

3. **Wait for DNS propagation** (5-30 minutes)

---

### Step 9: Test Your Application

1. **Visit:** https://qatest.cmpmediapartner.com

2. **Login:**
   - Username: `admin`
   - Password: `admin123`

3. **Success!** 🎉

4. **Important:** Immediately change the admin password:
   - Go to Team → Edit admin user → Change password

---

## 🔄 Future Updates (Automatic Deployment)

### How It Works:

1. **Make changes locally** on your Mac
2. **Commit and push** to GitHub
3. **In cPanel Git interface:** Click "Update from Remote"
4. **Click "Deploy HEAD Commit"**
5. **Done!** Changes are live

### Example Workflow:

```bash
# On your Mac
cd /Users/oluwaseyio/QA_testing

# Make changes to files...
# Edit frontend/src/pages/DashboardPage.tsx

# Rebuild frontend if changed
cd frontend
npm run build
cd ..

# Commit and push
git add .
git commit -m "Update dashboard design"
git push origin main
```

**Then in cPanel:**
1. Git Version Control → Manage → Pull or Deploy
2. Click "Update from Remote"
3. Click "Deploy HEAD Commit"

---

## 🔧 Troubleshooting

### Issue: "No .cpanel.yml file found"

**Solution:**
- The `.cpanel.yml` file is already in your repository
- Make sure you pulled the latest changes
- In Git interface, click "Update from Remote"

### Issue: "Deployment failed"

**Check:**
1. File Manager → Check if files deployed to `public_html/qatest/`
2. Git interface → View deployment logs
3. Error logs in cPanel → Metrics → Errors

**Common fixes:**
- Verify repository path is correct
- Ensure `.cpanel.yml` is in repository root
- Check file permissions

### Issue: "500 Internal Server Error"

**Solution:**
1. Check `.htaccess` files are present
2. Verify PHP version is 8.0+ (cPanel → MultiPHP Manager)
3. Check error logs

### Issue: "Database connection failed"

**Solution:**
1. Verify `.env` credentials match database
2. Ensure database user has ALL PRIVILEGES
3. Check database name includes prefix: `cmpmnyin_`

---

## 📁 Deployment Structure

After deployment, your structure will be:

```
/home/cmpmnyin/
├── public_html/
│   └── qatest/              ← Deployed here
│       ├── api/
│       ├── assets/
│       ├── database/
│       ├── index.html
│       └── .htaccess
└── repositories/
    └── qa-testing-management/  ← Git repository
        ├── .cpanel.yml      ← Deployment config
        ├── backend/
        ├── frontend/
        └── ...
```

---

## 🎨 What Gets Deployed

The `.cpanel.yml` file automatically deploys:

✅ **Backend** → `api/` directory  
✅ **Frontend build** → Root directory (`assets/`, `index.html`)  
✅ **Database schema** → `database/exports/`  
✅ **Configuration** → `.htaccess`  
✅ **Permissions** → Automatically set  

---

## 🔐 Security Notes

1. **`.env` file is NOT in Git** (protected by `.gitignore`)
   - You must create it manually in cPanel
   - Never commit it to Git

2. **Change default passwords** immediately after first login

3. **JWT_SECRET** must be unique and secure (32+ characters)

4. **Database credentials** should be strong

---

## 📊 Advantages of This Method

✅ **No SSH required** - Works on all shared hosting  
✅ **Automatic deployment** - One-click updates  
✅ **Version control** - Track all changes  
✅ **Rollback capability** - Revert to previous commits  
✅ **Built into cPanel** - No additional tools needed  
✅ **Secure** - Uses HTTPS for Git operations  

---

## 🎯 Quick Reference

### Deploy New Changes:

1. Push to GitHub (from Mac)
2. cPanel → Git Version Control → Manage
3. Click "Update from Remote"
4. Click "Deploy HEAD Commit"

### View Deployment Logs:

1. cPanel → Git Version Control → Manage
2. Pull or Deploy tab
3. View deployment history

### Rollback to Previous Version:

1. cPanel → Git Version Control → Manage
2. Basic Information tab
3. Select previous commit
4. Click "Deploy HEAD Commit"

---

## 🎉 You're All Set!

Your QA Testing Management application will be deployed using cPanel's Git Version Control feature.

**Benefits:**
- ✅ Professional deployment workflow
- ✅ Easy updates
- ✅ Version control
- ✅ No SSH needed

**Live at:** https://qatest.cmpmediapartner.com

---

## 📝 Next Steps

1. ✅ Follow Step 1-9 above
2. ✅ Test the application
3. ✅ Change default passwords
4. ✅ Add your team members
5. ✅ Create your first project
6. ✅ Start testing!

**Good luck with your deployment!** 🚀

---

**Documentation Reference:** [cPanel Git Deployment Guide](https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-deployment/)

