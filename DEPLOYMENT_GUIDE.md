# QA Testing Management - Deployment Guide

## Deployment to Namecheap Shared Hosting (qatest.cmpmediapartner.com)

This guide will help you deploy the QA Testing Management application to your Namecheap shared hosting subdomain.

---

## 📋 Prerequisites

1. **Namecheap cPanel Access**
   - URL: Your cPanel URL
   - Username: Your cPanel username
   - Password: Your cPanel password

2. **Subdomain Setup**
   - Subdomain: `qatest.cmpmediapartner.com`
   - Document Root: `/public_html/qatest` (or similar)

3. **PHP Requirements**
   - PHP 8.0 or higher
   - MySQL 5.7 or higher
   - Extensions: PDO, PDO_MySQL, JSON, OpenSSL

---

## 🚀 Deployment Steps

### Step 1: Prepare Files for Upload

The project has already been built. You need to upload these directories:

```
QA_testing/
├── backend/          # PHP API backend
├── frontend/dist/    # Built React frontend
├── .htaccess        # Root routing configuration
└── database/exports/ # Database schema
```

### Step 2: Create Subdomain in cPanel

1. Log in to your Namecheap cPanel
2. Go to **Domains** → **Subdomains**
3. Create subdomain: `qatest`
4. Document Root: `/public_html/qatest` (note this path)
5. Click **Create**

### Step 3: Create MySQL Database

1. In cPanel, go to **Databases** → **MySQL Databases**
2. Create a new database:
   - Database name: `qatest_db` (or your choice)
   - Note the full database name (usually `username_qatest_db`)
3. Create a database user:
   - Username: `qatest_user` (or your choice)
   - Password: Generate a strong password
   - Note the full username (usually `username_qatest_user`)
4. Add user to database with **ALL PRIVILEGES**
5. **Save these credentials** - you'll need them!

### Step 4: Upload Files via FTP/File Manager

#### Option A: Using cPanel File Manager

1. Go to **Files** → **File Manager**
2. Navigate to `/public_html/qatest/`
3. Upload the following structure:

```
/public_html/qatest/
├── api/
│   ├── config/
│   ├── database/
│   ├── public/
│   │   ├── .htaccess
│   │   └── index.php
│   └── src/
├── assets/           # Frontend assets from dist/assets/
├── index.html        # Frontend index.html from dist/
└── .htaccess         # Root .htaccess
```

#### Option B: Using FTP Client (FileZilla)

1. Connect to your FTP:
   - Host: `ftp.cmpmediapartner.com`
   - Username: Your cPanel username
   - Password: Your cPanel password
   - Port: 21

2. Navigate to `/public_html/qatest/`
3. Upload files as described above

### Step 5: Configure Backend

1. In File Manager, navigate to `/public_html/qatest/api/`
2. Create a `.env` file with these contents:

```env
# Production Environment Configuration
APP_ENV=production
APP_DEBUG=false
APP_URL=https://qatest.cmpmediapartner.com

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=username_qatest_db
DB_USERNAME=username_qatest_user
DB_PASSWORD=your_database_password

# JWT Configuration (CHANGE THIS!)
JWT_SECRET=your-very-secure-random-string-min-32-chars
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# CORS Configuration
CORS_ORIGINS=https://qatest.cmpmediapartner.com

# Timezone
TZ=UTC
```

**Important:** Replace:
- `username_qatest_db` with your actual database name
- `username_qatest_user` with your actual database username
- `your_database_password` with your actual database password
- `JWT_SECRET` with a secure random string (at least 32 characters)

### Step 6: Import Database

1. In cPanel, go to **Databases** → **phpMyAdmin**
2. Select your database (`username_qatest_db`)
3. Click **Import** tab
4. Upload the file: `database/exports/production_export_2025-11-22.sql`
5. Click **Go** to import

### Step 7: Seed Demo Users

1. In File Manager, navigate to `/public_html/qatest/api/database/`
2. Find `seed_users.php`
3. Run it via browser: `https://qatest.cmpmediapartner.com/api/database/seed_users.php`
4. Or run via SSH/Terminal if available

This will create demo users:
- **Admin**: username: `admin`, password: `admin123`
- **Tester**: username: `tester`, password: `tester123`
- **John**: username: `john`, password: `john123`
- **Jane**: username: `jane`, password: `jane123`

### Step 8: Configure .htaccess Files

#### Root .htaccess (`/public_html/qatest/.htaccess`)

```apache
RewriteEngine On

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# API requests go to backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ api/public/index.php [QSA,L]

# Frontend assets
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^(.*)$ $1 [L]

# All other requests go to frontend
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

#### Backend .htaccess (`/public_html/qatest/api/public/.htaccess`)

Already created - no changes needed.

### Step 9: Set File Permissions

Set correct permissions via File Manager or FTP:

```
Directories: 755
Files: 644
.env file: 600 (if possible)
```

### Step 10: Test the Deployment

1. **Test Frontend:**
   - Visit: `https://qatest.cmpmediapartner.com`
   - You should see the login page

2. **Test API:**
   - Visit: `https://qatest.cmpmediapartner.com/api/v1/auth/login`
   - You should see a JSON error (expected - needs POST request)

3. **Login:**
   - Username: `admin`
   - Password: `admin123`
   - You should be redirected to the dashboard

---

## 🔧 Troubleshooting

### Issue: "500 Internal Server Error"

**Solution:**
1. Check `.htaccess` syntax
2. Verify PHP version (must be 8.0+)
3. Check error logs in cPanel → **Metrics** → **Errors**

### Issue: "Database connection failed"

**Solution:**
1. Verify database credentials in `.env`
2. Ensure database user has all privileges
3. Check if database name includes username prefix

### Issue: "CORS errors"

**Solution:**
1. Update `CORS_ORIGINS` in `.env` to match your domain
2. Verify `.htaccess` CORS headers are present
3. Clear browser cache

### Issue: "404 Not Found for API requests"

**Solution:**
1. Verify root `.htaccess` is present
2. Check RewriteEngine is enabled in cPanel
3. Ensure API files are in `/api/public/` directory

### Issue: "Login fails with 401"

**Solution:**
1. Run the seed_users.php script again
2. Verify JWT_SECRET is set in `.env`
3. Check database has users table with data

---

## 📁 Directory Structure on Server

```
/public_html/qatest/
├── api/                          # Backend API
│   ├── config/
│   │   └── app.php
│   ├── database/
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
│   └── .env                      # IMPORTANT: Configure this!
├── assets/                       # Frontend assets
│   ├── index-[hash].css
│   └── index-[hash].js
├── index.html                    # Frontend entry point
└── .htaccess                     # Root routing
```

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET to a secure random string
- [ ] Set APP_DEBUG=false in production
- [ ] Change default user passwords after first login
- [ ] Enable HTTPS (Force SSL in cPanel)
- [ ] Set restrictive file permissions
- [ ] Regularly backup database
- [ ] Keep PHP and dependencies updated

---

## 📊 Default Login Credentials

**⚠️ CHANGE THESE AFTER FIRST LOGIN!**

| Username | Password   | Role    |
|----------|------------|---------|
| admin    | admin123   | ADMIN   |
| tester   | tester123  | TESTER  |
| john     | john123    | TESTER  |
| jane     | jane123    | TESTER  |

---

## 🆘 Support

If you encounter issues:

1. Check cPanel error logs
2. Verify all configuration files
3. Test API endpoints directly
4. Check browser console for errors
5. Verify database connection

---

## 📝 Post-Deployment Tasks

1. **Change Default Passwords**
   - Log in as admin
   - Go to Team Management
   - Edit each user and change their password

2. **Create Your Team**
   - Add real team members
   - Assign appropriate roles
   - Remove or disable demo users

3. **Create Your First Project**
   - Go to Dashboard
   - Click "Create Project"
   - Add project details

4. **Configure Modules**
   - Navigate to your project
   - Go to Modules tab
   - Define your testing modules

5. **Start Testing!**
   - Create test cases
   - Execute test runs
   - Generate reports

---

## 🎉 Deployment Complete!

Your QA Testing Management application is now live at:
**https://qatest.cmpmediapartner.com**

Enjoy managing your QA testing process!

