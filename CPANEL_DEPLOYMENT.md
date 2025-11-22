# cPanel Deployment Guide (No SSH Required)

## ✅ Deployment Package Ready!

**File:** `qatest-deploy.zip` (319 KB)  
**Location:** `/Users/oluwaseyio/QA_testing/qatest-deploy.zip`

Since SSH is not available, we'll deploy using cPanel File Manager.

---

## 🚀 Step-by-Step Deployment

### Step 1: Create Database in cPanel

1. **Log into cPanel:**
   - URL: Your Namecheap cPanel URL
   - Username: `cmpmnyin`
   - Password: Your cPanel password

2. **Create Database:**
   - Go to **Databases** → **MySQL Databases**
   - **Create New Database:**
     - Database name: `qatest_db`
     - Click **Create Database**
   - **Note the full database name** (usually `cmpmnyin_qatest_db`)

3. **Create Database User:**
   - Scroll to **MySQL Users** section
   - Username: `qatest_user`
   - Password: Generate a strong password (click **Password Generator**)
   - **Copy and save this password!**
   - Click **Create User**
   - **Note the full username** (usually `cmpmnyin_qatest_user`)

4. **Add User to Database:**
   - Scroll to **Add User To Database**
   - User: Select `cmpmnyin_qatest_user`
   - Database: Select `cmpmnyin_qatest_db`
   - Click **Add**
   - Check **ALL PRIVILEGES**
   - Click **Make Changes**

---

### Step 2: Upload Files via File Manager

1. **Open File Manager:**
   - In cPanel, go to **Files** → **File Manager**
   - Navigate to `public_html/`

2. **Create Subdomain Directory:**
   - Click **+ Folder** button
   - Folder name: `qatest`
   - Click **Create New Folder**
   - Double-click to enter the `qatest` folder

3. **Upload Deployment Package:**
   - Click **Upload** button (top menu)
   - Click **Select File**
   - Navigate to: `/Users/oluwaseyio/QA_testing/qatest-deploy.zip`
   - Select and upload (wait for 100% completion)
   - Close the upload window

4. **Extract Files:**
   - Back in File Manager, you should see `qatest-deploy.zip`
   - Right-click on `qatest-deploy.zip`
   - Select **Extract**
   - Click **Extract Files**
   - After extraction, **delete** `qatest-deploy.zip` (right-click → Delete)

5. **Verify Structure:**
   You should now see:
   ```
   public_html/qatest/
   ├── api/
   ├── assets/
   ├── database/
   ├── index.html
   ├── vite.svg
   └── .htaccess
   ```

---

### Step 3: Configure Environment (.env)

1. **Navigate to API folder:**
   - In File Manager, go to `public_html/qatest/api/`

2. **Create .env file:**
   - Click **+ File** button
   - File name: `.env`
   - Click **Create New File**

3. **Edit .env file:**
   - Right-click on `.env` → **Edit**
   - Click **Edit** again in the popup
   - Paste this configuration:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://qatest.cmpmediapartner.com

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=cmpmnyin_qatest_db
DB_USERNAME=cmpmnyin_qatest_user
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE

JWT_SECRET=GENERATE_A_SECURE_32_CHAR_RANDOM_STRING_HERE
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

CORS_ORIGINS=https://qatest.cmpmediapartner.com
TZ=UTC
```

4. **Update the values:**
   - Replace `YOUR_DATABASE_PASSWORD_HERE` with the password you saved in Step 1
   - Replace `JWT_SECRET` with a random string (at least 32 characters)
     - You can use: `https://randomkeygen.com/` (use "CodeIgniter Encryption Keys")
   - Click **Save Changes** (top right)
   - Close the editor

---

### Step 4: Import Database

1. **Open phpMyAdmin:**
   - In cPanel, go to **Databases** → **phpMyAdmin**

2. **Select Database:**
   - In left sidebar, click on `cmpmnyin_qatest_db`

3. **Import Schema:**
   - Click **Import** tab (top menu)
   - Click **Choose File**
   - Navigate to: `public_html/qatest/database/exports/production_export_2025-11-22.sql`
   - Or download from File Manager first, then upload here
   - Click **Go** (bottom of page)
   - Wait for "Import has been successfully finished"

4. **Verify Tables:**
   - You should see 13 tables in the left sidebar:
     - audit_logs
     - bug_comments
     - bugs
     - modules
     - notifications
     - projects
     - refresh_tokens
     - test_cases
     - test_runs
     - test_step_results
     - test_steps
     - users
     - versions

---

### Step 5: Seed Demo Users

**Option A: Via Browser (Easiest)**

1. Open your browser
2. Visit: `https://qatest.cmpmediapartner.com/api/database/seed_users.php`
3. You should see: "Demo users seeded successfully!"

**Option B: Via File Manager (if Option A doesn't work)**

1. In File Manager, navigate to `public_html/qatest/api/database/`
2. Right-click on `seed_users.php` → **Edit**
3. Add this line at the very top (after `<?php`):
   ```php
   <?php
   chdir(__DIR__ . '/../');
   ```
4. Save and close
5. Visit the URL in Option A

---

### Step 6: Set Up Subdomain (if not already done)

1. **In cPanel:**
   - Go to **Domains** → **Subdomains**

2. **Create Subdomain:**
   - Subdomain: `qatest`
   - Domain: `cmpmediapartner.com`
   - Document Root: `public_html/qatest`
   - Click **Create**

3. **Wait for DNS propagation** (5-30 minutes)

---

### Step 7: Test Your Application

1. **Visit:** `https://qatest.cmpmediapartner.com`
   - You should see the login page

2. **Login:**
   - Username: `admin`
   - Password: `admin123`

3. **If it works:**
   - ✅ You're in! Welcome to the dashboard
   - **Immediately change the admin password:**
     - Go to **Team** (in sidebar)
     - Click the 3-dot menu on admin user
     - Click **Edit**
     - Change password
     - Save

4. **If you see errors:**
   - See troubleshooting section below

---

## 🔧 Troubleshooting

### Issue: "500 Internal Server Error"

**Check:**
1. File Manager → `public_html/qatest/.htaccess` exists
2. File Manager → `public_html/qatest/api/public/.htaccess` exists
3. cPanel → **Errors** (under Metrics) - check error logs

**Fix:**
- Verify `.htaccess` files are present
- Check PHP version (must be 8.0+):
  - cPanel → **MultiPHP Manager**
  - Select `qatest` domain
  - Set PHP version to 8.0 or higher

### Issue: "Database connection failed"

**Check:**
1. `.env` file has correct credentials
2. Database name includes prefix: `cmpmnyin_qatest_db`
3. Username includes prefix: `cmpmnyin_qatest_user`
4. Database user has ALL PRIVILEGES

**Fix:**
- Re-verify credentials in cPanel → MySQL Databases
- Update `.env` file with correct values

### Issue: "CORS errors" in browser console

**Fix:**
1. Edit `api/.env`
2. Ensure `CORS_ORIGINS=https://qatest.cmpmediapartner.com`
3. No trailing slash
4. Must use `https://` (not `http://`)

### Issue: Can't access seed_users.php

**Fix:**
1. File Manager → `public_html/qatest/api/database/seed_users.php`
2. Right-click → **Edit**
3. Add at the top (after `<?php`):
   ```php
   chdir(__DIR__ . '/../');
   require_once 'src/Utils/Database.php';
   ```
4. Save and try again

### Issue: "Subdomain not found"

**Wait:**
- DNS propagation can take 5-30 minutes
- Clear browser cache
- Try incognito/private browsing mode

**Alternative:**
- Use direct path: `https://cmpmediapartner.com/qatest/`

---

## 📁 Final Directory Structure

```
public_html/qatest/
├── api/
│   ├── config/
│   ├── database/
│   │   ├── exports/
│   │   │   └── production_export_2025-11-22.sql
│   │   ├── migrations/
│   │   └── seed_users.php
│   ├── public/
│   │   ├── .htaccess
│   │   └── index.php
│   ├── src/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   ├── Models/
│   │   └── Utils/
│   └── .env ← YOU CREATED THIS
├── assets/
│   ├── index-DZmahGmE.js
│   ├── index-Dh0CQqUV.css
│   ├── ui-FgbME1bS.js
│   └── vendor-Bwa9reBq.js
├── database/
│   └── exports/
│       └── production_export_2025-11-22.sql
├── index.html
├── vite.svg
└── .htaccess
```

---

## 🔐 Default Login Credentials

**⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN!**

| Username | Password   | Role    |
|----------|------------|---------|
| admin    | admin123   | ADMIN   |
| tester   | tester123  | TESTER  |
| john     | john123    | TESTER  |
| jane     | jane123    | TESTER  |

---

## 🎉 Deployment Complete!

Your QA Testing Management application is now live at:

**https://qatest.cmpmediapartner.com**

### Next Steps:

1. ✅ Login and change admin password
2. ✅ Go to Team Management → Edit users → Change all default passwords
3. ✅ Create your first project
4. ✅ Add your team members
5. ✅ Start testing!

---

## 📝 Notes

- **No SSH required** - Everything done via cPanel
- **Deployment package** is in: `/Users/oluwaseyio/QA_testing/qatest-deploy.zip`
- **Code is also on GitHub** at: `oluwaseyiolukoya/qa-testing-management`
- **Future updates:** Re-create zip and upload via File Manager

---

**Good luck with your QA Testing Management!** 🚀

