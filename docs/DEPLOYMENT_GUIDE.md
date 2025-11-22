# QA Testing Management Tool - Deployment Guide

## 🎯 Namecheap Shared Hosting Deployment

This guide walks you through deploying the QA Testing Management Tool on Namecheap shared hosting.

---

## Prerequisites

✅ Namecheap shared hosting plan (Stellar or higher recommended)  
✅ Domain name  
✅ FTP client (FileZilla recommended)  
✅ Access to cPanel  
✅ Node.js installed locally (for building frontend)  
✅ Git (optional, for version control)

---

## Part 1: Preparation (Local)

### 1.1 Build Frontend

```bash
cd frontend
npm install
npm run build
# This creates a 'dist' folder with production files
```

### 1.2 Prepare Backend Files

No build needed for PHP! Just upload the files.

---

## Part 2: Database Setup (cPanel)

### 2.1 Create MySQL Database

1. Log in to Namecheap cPanel
2. Navigate to **MySQL® Databases**
3. Create a new database:
   - Database name: `youruser_qa_testing`
   - Click "Create Database"

### 2.2 Create Database User

1. Scroll down to **MySQL Users**
2. Create user:
   - Username: `youruser_qa_admin`
   - Password: Generate a strong password
   - Click "Create User"

### 2.3 Assign User to Database

1. Scroll to **Add User To Database**
2. Select user: `youruser_qa_admin`
3. Select database: `youruser_qa_testing`
4. Grant **ALL PRIVILEGES**
5. Click "Make Changes"

### 2.4 Import Database Schema

#### Option A: phpMyAdmin (Recommended)

1. Go to cPanel → **phpMyAdmin**
2. Select your database (`youruser_qa_testing`)
3. Click **Import** tab
4. Choose file: `backend/database/schema.sql`
5. Click **Go**

#### Option B: MySQL Command Line

```bash
mysql -u youruser_qa_admin -p youruser_qa_testing < backend/database/schema.sql
```

### 2.5 Verify Database

1. In phpMyAdmin, check that all tables are created:
   - users
   - test_cases
   - test_runs
   - bugs
   - etc.

2. Verify demo users exist:
   - admin / admin123
   - tester / tester123

---

## Part 3: File Upload (FTP)

### 3.1 Connect via FTP

**Using FileZilla:**

```
Host: ftp.yourdomain.com
Username: your_cpanel_username
Password: your_cpanel_password
Port: 21
```

### 3.2 Upload Backend Files

Upload the ENTIRE `backend` folder to:

```
/public_html/api/
```

**Directory structure after upload:**

```
/public_html/
└── api/
    ├── config/
    ├── src/
    │   ├── Controllers/
    │   ├── Models/
    │   ├── Middleware/
    │   └── Utils/
    ├── database/
    ├── public/
    │   └── index.php
    ├── .htaccess
    └── .env (create this manually)
```

### 3.3 Upload Frontend Files

Upload ONLY the **contents** of `frontend/dist/` to:

```
/public_html/app/
```

**Directory structure after upload:**

```
/public_html/
└── app/
    ├── assets/
    │   ├── index-[hash].js
    │   └── index-[hash].css
    ├── index.html
    └── .htaccess (create this)
```

---

## Part 4: Configuration

### 4.1 Create Backend .env File

Via cPanel File Manager or FTP:

1. Navigate to `/public_html/api/`
2. Create file: `.env`
3. Add content:

```env
# Application
APP_NAME="QA Testing Management"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database
DB_HOST=localhost
DB_DATABASE=youruser_qa_testing
DB_USERNAME=youruser_qa_admin
DB_PASSWORD=your_database_password

# JWT (Generate a random 32-character string)
JWT_SECRET=your-random-secret-key-change-this

# CORS
CORS_ORIGINS=https://yourdomain.com
```

**Generate JWT Secret:**

```bash
# On your local machine:
openssl rand -base64 32
# Or visit: https://generate-secret.vercel.app/32
```

### 4.2 Create Frontend .htaccess

Create `/public_html/app/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /app/
    
    # Handle React Router
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [L]
</IfModule>

# Enable Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 4.3 Create Root .htaccess (Optional)

Create `/public_html/.htaccess` for clean routing:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # API requests to backend
    RewriteCond %{REQUEST_URI} ^/api
    RewriteRule ^api/(.*)$ api/public/index.php [L]
    
    # Frontend requests to React app
    RewriteCond %{REQUEST_URI} !^/api
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ app/index.html [L]
</IfModule>
```

### 4.4 Update Frontend API URL

If not using root .htaccess, update frontend to use full API URL:

1. Edit `/public_html/app/assets/index-[hash].js`
2. Find: `http://localhost:8000/api/v1`
3. Replace with: `https://yourdomain.com/api/public/index.php`

**OR** rebuild frontend with correct API URL:

```bash
# In frontend/.env
VITE_API_URL=https://yourdomain.com/api/v1

# Rebuild
npm run build
# Re-upload dist/ contents
```

---

## Part 5: File Permissions

### 5.1 Set Correct Permissions (via cPanel File Manager)

```
/public_html/api/                     → 755
/public_html/api/public/              → 755
/public_html/api/public/index.php     → 644
/public_html/api/.env                 → 600 (important!)
/public_html/api/.htaccess            → 644
/public_html/app/                     → 755
/public_html/app/index.html           → 644
```

**Set via SSH (if available):**

```bash
cd /public_html/api
chmod 755 .
chmod 644 .htaccess
chmod 600 .env
chmod 755 public
chmod 644 public/index.php
```

---

## Part 6: Testing

### 6.1 Test API Endpoints

**Health Check:**

```bash
curl https://yourdomain.com/api/v1/health
```

Expected response:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-20T10:30:00Z",
    "version": "1.0.0"
  }
}
```

**Login Test:**

```bash
curl -X POST https://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 6.2 Test Frontend

1. Visit: `https://yourdomain.com/app/`
2. You should see the login page
3. Try logging in with demo credentials:
   - Username: `admin`
   - Password: `admin123`

### 6.3 Test Dashboard

After login:
- Check if dashboard loads
- Verify metrics display
- Check browser console for errors

---

## Part 7: SSL Certificate (HTTPS)

### 7.1 Enable Free SSL (Let's Encrypt)

1. Go to cPanel → **SSL/TLS Status**
2. Select your domain
3. Click **Run AutoSSL**
4. Wait for certificate installation (5-10 minutes)

### 7.2 Force HTTPS

Add to root `.htaccess`:

```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Part 8: Performance Optimization

### 8.1 Enable Gzip Compression

Already included in `.htaccess` files above.

### 8.2 Enable Browser Caching

Already included in `.htaccess` files above.

### 8.3 Optimize PHP Settings (Optional)

Via cPanel → **Select PHP Version** → **Options**:

```
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
memory_limit = 128M
```

### 8.4 Database Optimization

Run in phpMyAdmin:

```sql
OPTIMIZE TABLE users;
OPTIMIZE TABLE test_cases;
OPTIMIZE TABLE test_runs;
OPTIMIZE TABLE bugs;
```

---

## Part 9: Security Hardening

### 9.1 Secure .env File

```apache
# In /public_html/api/.htaccess
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

### 9.2 Change Default Passwords

Update demo users' passwords in database:

```sql
-- Generate new password hash
-- Use: https://bcrypt-generator.com/ with cost 10

UPDATE users 
SET password_hash = '$2y$10$your_new_hash_here'
WHERE username = 'admin';
```

### 9.3 Hide Sensitive Files

```apache
# In root .htaccess
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>

Options -Indexes
```

### 9.4 Update JWT Secret

Generate a strong JWT secret:

```bash
openssl rand -base64 32
```

Update in `/public_html/api/.env`

---

## Part 10: Maintenance

### 10.1 Database Backups

**Automatic (cPanel):**

1. cPanel → **Backup**
2. Enable automatic backups

**Manual (phpMyAdmin):**

1. Select database
2. Click **Export**
3. Choose **Quick** method
4. Download .sql file

### 10.2 Update Application

```bash
# Local: Build new frontend
cd frontend
npm run build

# Upload new files via FTP
# Upload dist/ contents to /public_html/app/

# For backend changes, upload modified files only
```

### 10.3 Monitor Logs

**PHP Error Logs:**

cPanel → **Errors** → View error_log

**Check via SSH:**

```bash
tail -f /home/username/public_html/api/error_log
```

---

## Troubleshooting

### Issue: "Database connection failed"

**Solution:**

1. Verify database credentials in `.env`
2. Check database user privileges
3. Confirm database name is correct
4. Test connection via phpMyAdmin

### Issue: "Route not found" errors

**Solution:**

1. Verify `.htaccess` files are uploaded
2. Check Apache `mod_rewrite` is enabled (ask hosting support)
3. Verify file paths in configuration

### Issue: "CORS errors" in browser

**Solution:**

1. Update `CORS_ORIGINS` in `/public_html/api/.env`
2. Add your domain: `CORS_ORIGINS=https://yourdomain.com`
3. Clear browser cache

### Issue: Frontend shows blank page

**Solution:**

1. Check browser console for errors
2. Verify API URL in frontend code
3. Check `.htaccess` in `/public_html/app/`
4. Verify all files uploaded correctly

### Issue: "500 Internal Server Error"

**Solution:**

1. Check PHP error logs
2. Verify file permissions (755 for directories, 644 for files)
3. Check `.htaccess` syntax
4. Verify PHP version (8.0+ required)

### Issue: "Invalid token" errors

**Solution:**

1. Clear browser localStorage
2. Verify JWT_SECRET is set in `.env`
3. Try logging in again

---

## URLs After Deployment

```
Frontend:  https://yourdomain.com/app/
API:       https://yourdomain.com/api/v1/
Health:    https://yourdomain.com/api/v1/health
Login:     https://yourdomain.com/app/ (default page)
```

**With root .htaccess:**

```
Frontend:  https://yourdomain.com/
API:       https://yourdomain.com/api/v1/
```

---

## Demo Credentials

After deployment, you can login with:

- **Admin:** `admin` / `admin123`
- **Tester:** `tester` / `tester123`
- **User:** `john` / `john123`

**⚠️ IMPORTANT:** Change these passwords immediately after deployment!

---

## Support & Resources

- **Namecheap Support:** https://www.namecheap.com/support/
- **PHP Documentation:** https://www.php.net/docs.php
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **React Documentation:** https://react.dev/

---

## Checklist

Before going live:

- [ ] Database created and schema imported
- [ ] Backend files uploaded to `/public_html/api/`
- [ ] Frontend files uploaded to `/public_html/app/`
- [ ] `.env` file created with correct credentials
- [ ] `.htaccess` files in place
- [ ] File permissions set correctly
- [ ] SSL certificate installed
- [ ] API health check passes
- [ ] Login functionality works
- [ ] Dashboard loads with data
- [ ] Default passwords changed
- [ ] JWT secret updated
- [ ] Backups configured

---

**Deployment Complete! 🎉**

Your QA Testing Management Tool is now live and ready to use.

**Version:** 1.0.0  
**Last Updated:** November 21, 2025

