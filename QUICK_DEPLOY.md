# Quick Deployment Checklist

## ✅ Pre-Deployment (Already Done)

- [x] Frontend built (`frontend/dist/`)
- [x] Database schema exported (`database/exports/production_export_2025-11-22.sql`)
- [x] `.htaccess` files created
- [x] `.env.production` template created

## 📦 Files to Upload

### 1. Backend Files
Upload `backend/` folder contents to `/public_html/qatest/api/`:
- `config/`
- `database/`
- `public/` (with `.htaccess` and `index.php`)
- `src/`

### 2. Frontend Files
Upload `frontend/dist/` contents to `/public_html/qatest/`:
- `assets/` folder
- `index.html`

### 3. Root Files
Upload to `/public_html/qatest/`:
- `.htaccess` (from project root)

## 🔧 Configuration Steps

### 1. Create `.env` file in `/public_html/qatest/api/`

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://qatest.cmpmediapartner.com

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=generate-a-secure-32-char-random-string-here
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

CORS_ORIGINS=https://qatest.cmpmediapartner.com
TZ=UTC
```

### 2. Import Database

1. Go to phpMyAdmin
2. Select your database
3. Import: `database/exports/production_export_2025-11-22.sql`

### 3. Seed Users

Run: `https://qatest.cmpmediapartner.com/api/database/seed_users.php`

## 🧪 Test

1. Visit: `https://qatest.cmpmediapartner.com`
2. Login with: `admin` / `admin123`
3. Change passwords immediately!

## 🎯 Quick FTP Upload Structure

```
/public_html/qatest/
├── api/
│   ├── config/
│   ├── database/
│   ├── public/
│   ├── src/
│   └── .env (CREATE THIS!)
├── assets/
├── index.html
└── .htaccess
```

## ⚡ One-Command Database Setup

If you have SSH access:

```bash
cd /public_html/qatest/api
mysql -u your_db_user -p your_db_name < ../database/exports/production_export_2025-11-22.sql
php database/seed_users.php
```

## 🔐 Security Reminder

- Change JWT_SECRET
- Change all default passwords
- Set APP_DEBUG=false
- Enable HTTPS

