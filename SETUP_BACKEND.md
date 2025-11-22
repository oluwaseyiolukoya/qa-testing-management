# Backend Server Setup Guide

## PHP Installation Options

### Option 1: Install PHP via Homebrew (Recommended for macOS)

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PHP
brew install php

# Verify installation
php --version
```

### Option 2: Use XAMPP (Easiest)

1. Download XAMPP: https://www.apachefriends.org/
2. Install XAMPP
3. Start Apache from XAMPP Control Panel
4. PHP will be available at: `/Applications/XAMPP/xamppfiles/bin/php`

### Option 3: Use MAMP (macOS)

1. Download MAMP: https://www.mamp.info/
2. Install MAMP
3. Start MAMP servers
4. PHP will be available at: `/Applications/MAMP/bin/php/php8.x.x/bin/php`

---

## After Installing PHP

### 1. Start the Backend Server

```bash
cd backend
php -S localhost:8000 -t public
```

### 2. Test the Backend

Open a new terminal and test:

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Or open in browser
open http://localhost:8000/api/v1/health
```

---

## Quick Start Script

Once PHP is installed, you can use:

```bash
./START_SERVERS.sh
```

This will start both frontend and backend automatically.

---

## Database Setup (Required)

Before the backend works fully, you need to set up the database:

```bash
# 1. Start MySQL (if using XAMPP/MAMP, start MySQL from control panel)
# 2. Create database
mysql -u root -p
CREATE DATABASE qa_testing;
exit;

# 3. Import schema
mysql -u root -p qa_testing < backend/database/schema.sql

# 4. Update backend/.env with your database credentials
```

---

## Current Status

- ✅ Frontend: Running at http://localhost:5173
- ⏳ Backend: Needs PHP installation
- ⏳ Database: Needs MySQL setup

---

## Alternative: Test Frontend Only

The frontend can run independently! You can:

1. Visit http://localhost:5173
2. See the login page
3. Test the UI (backend calls will fail until backend is running)

---

## Need Help?

- Check PHP installation: `php --version`
- Check MySQL: `mysql --version`
- View backend logs: Check terminal where PHP server is running

