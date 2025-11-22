# Git Deployment Guide - Namecheap SSH

## 🔐 Prerequisites

- [x] SSH key generated in Namecheap cPanel
- [ ] SSH key added to GitHub/GitLab
- [ ] Repository created
- [ ] SSH access to Namecheap server

---

## 📋 Step 1: Prepare Git Repository

### 1.1 Create .gitignore

Make sure sensitive files are not committed:

```gitignore
# Environment files
.env
.env.local
.env.production
backend/.env
backend/.env.local
backend/.env.production

# Node modules
node_modules/
frontend/node_modules/

# Build files (we'll push dist for now)
# frontend/dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
backend/logs/

# Temporary files
tmp/
temp/
*.tmp

# Database exports (optional - keep for initial setup)
# database/exports/*.sql

# Documentation (optional)
LOGIN_RESOLUTION_FINAL.md
TEST_LOGIN_STEPS.md
```

### 1.2 Initialize Git (if not already done)

```bash
cd /Users/oluwaseyio/QA_testing
git init
git add .
git commit -m "Initial commit - QA Testing Management System"
```

---

## 🔑 Step 2: Set Up SSH Key with Git Provider

### Option A: GitHub

1. **Copy your SSH public key from Namecheap:**
   - In cPanel → **Security** → **SSH Access** → **Manage SSH Keys**
   - View your public key and copy it

2. **Add to GitHub:**
   - Go to GitHub → **Settings** → **SSH and GPG keys**
   - Click **New SSH key**
   - Title: `Namecheap Server`
   - Paste your public key
   - Click **Add SSH key**

3. **Create Repository:**
   - Go to GitHub → **New repository**
   - Name: `qa-testing-management`
   - Private repository (recommended)
   - Don't initialize with README (we already have files)
   - Click **Create repository**

4. **Add Remote:**
   ```bash
   cd /Users/oluwaseyio/QA_testing
   git remote add origin git@github.com:YOUR_USERNAME/qa-testing-management.git
   git branch -M main
   git push -u origin main
   ```

### Option B: GitLab

1. **Add SSH key to GitLab:**
   - Go to GitLab → **Preferences** → **SSH Keys**
   - Paste your public key
   - Click **Add key**

2. **Create Repository:**
   - New project → **Create blank project**
   - Name: `qa-testing-management`
   - Private
   - Create project

3. **Add Remote:**
   ```bash
   cd /Users/oluwaseyio/QA_testing
   git remote add origin git@gitlab.com:YOUR_USERNAME/qa-testing-management.git
   git branch -M main
   git push -u origin main
   ```

---

## 🚀 Step 3: Deploy to Namecheap via SSH

### 3.1 Connect to Your Server via SSH

```bash
ssh your_username@your_server_ip -p 21098
# or
ssh your_username@cmpmediapartner.com -p 21098
```

**Note:** Port 21098 is the default SSH port for Namecheap shared hosting.

### 3.2 Navigate to Subdomain Directory

```bash
cd ~/public_html/qatest
```

If the directory doesn't exist, create it:
```bash
mkdir -p ~/public_html/qatest
cd ~/public_html/qatest
```

### 3.3 Clone Repository

```bash
# GitHub
git clone git@github.com:YOUR_USERNAME/qa-testing-management.git .

# or GitLab
git clone git@gitlab.com:YOUR_USERNAME/qa-testing-management.git .
```

**Note:** The `.` at the end clones into the current directory.

### 3.4 Set Up Directory Structure

After cloning, reorganize files for web hosting:

```bash
# Move backend to api directory
mv backend api

# Move frontend build to root
mv frontend/dist/* .
rm -rf frontend

# Clean up documentation files (optional)
rm -f LOGIN_RESOLUTION_FINAL.md TEST_LOGIN_STEPS.md
```

Your structure should now be:
```
~/public_html/qatest/
├── api/
├── assets/
├── index.html
└── .htaccess
```

---

## ⚙️ Step 4: Configure Production Environment

### 4.1 Create .env File

```bash
cd ~/public_html/qatest/api
nano .env
```

Paste this configuration:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://qatest.cmpmediapartner.com

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your-secure-random-32-char-string
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

CORS_ORIGINS=https://qatest.cmpmediapartner.com
TZ=UTC
```

**Save:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.2 Set Permissions

```bash
cd ~/public_html/qatest
chmod 755 api
chmod 644 api/.env
chmod 755 api/public
chmod 644 .htaccess
chmod 644 index.html
```

---

## 🗄️ Step 5: Set Up Database

### 5.1 Import Database via SSH

```bash
cd ~/public_html/qatest/database/exports
mysql -u your_db_user -p your_db_name < production_export_2025-11-22.sql
```

### 5.2 Seed Demo Users

```bash
cd ~/public_html/qatest/api/database
php seed_users.php
```

---

## 🔄 Step 6: Future Updates (Git Pull)

When you make changes and want to update the server:

### 6.1 On Your Local Machine

```bash
cd /Users/oluwaseyio/QA_testing

# Make your changes, then:
git add .
git commit -m "Description of changes"
git push origin main
```

### 6.2 On Namecheap Server

```bash
ssh your_username@cmpmediapartner.com -p 21098
cd ~/public_html/qatest
git pull origin main

# If you changed backend code:
# (No restart needed for PHP)

# If you changed frontend:
# Rebuild locally and push the dist folder
```

---

## 🔧 Automated Deployment Script

Create a deployment script on the server:

### deploy.sh

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Navigate to project directory
cd ~/public_html/qatest

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Set permissions
echo "🔒 Setting permissions..."
chmod 755 api
chmod 644 api/.env
chmod 755 api/public

# Clear any cache (if applicable)
# php api/artisan cache:clear

echo "✅ Deployment complete!"
echo "🌐 Visit: https://qatest.cmpmediapartner.com"
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

---

## 📝 Git Workflow

### Development Workflow

1. **Make changes locally**
   ```bash
   cd /Users/oluwaseyio/QA_testing
   # Edit files...
   ```

2. **Test locally**
   ```bash
   # Frontend
   cd frontend && npm run dev
   
   # Backend
   cd backend && php -S localhost:8000 -t public
   ```

3. **Build frontend (if changed)**
   ```bash
   cd frontend
   npm run build
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

5. **Deploy to server**
   ```bash
   ssh your_username@cmpmediapartner.com -p 21098
   cd ~/public_html/qatest
   git pull origin main
   ```

---

## 🔐 Security Best Practices

### 1. Protect .env File

Add to `.htaccess` in `/api/` directory:

```apache
<Files ".env">
    Order allow,deny
    Deny from all
</Files>
```

### 2. Protect Git Directory

Add to root `.htaccess`:

```apache
<DirectoryMatch "^/.*/\.git/">
    Order deny,allow
    Deny from all
</DirectoryMatch>
```

### 3. Use Git Branches

```bash
# Create development branch
git checkout -b development

# Make changes, test, then merge to main
git checkout main
git merge development
git push origin main
```

---

## 🚨 Troubleshooting

### Issue: "Permission denied (publickey)"

**Solution:**
1. Verify SSH key is added to Git provider
2. Test SSH connection:
   ```bash
   ssh -T git@github.com
   # or
   ssh -T git@gitlab.com
   ```

### Issue: "fatal: not a git repository"

**Solution:**
```bash
cd ~/public_html/qatest
git init
git remote add origin YOUR_REPO_URL
git pull origin main
```

### Issue: "Git pull conflicts"

**Solution:**
```bash
# Stash local changes
git stash

# Pull latest
git pull origin main

# Reapply changes
git stash pop
```

### Issue: "Permission denied" when pulling

**Solution:**
```bash
# Check ownership
ls -la ~/public_html/qatest

# Fix ownership if needed
chown -R your_username:your_username ~/public_html/qatest
```

---

## 📊 Deployment Checklist

- [ ] Repository created on GitHub/GitLab
- [ ] SSH key added to Git provider
- [ ] Code pushed to repository
- [ ] SSH connection to Namecheap working
- [ ] Repository cloned to server
- [ ] Directory structure organized
- [ ] `.env` file created and configured
- [ ] Database imported
- [ ] Users seeded
- [ ] Permissions set correctly
- [ ] Application tested and working
- [ ] Deployment script created (optional)

---

## 🎯 Quick Commands Reference

### Local Development
```bash
# Commit changes
git add .
git commit -m "message"
git push origin main

# Build frontend
cd frontend && npm run build
```

### Server Deployment
```bash
# Connect
ssh username@server -p 21098

# Update
cd ~/public_html/qatest
git pull origin main

# Run deployment script
./deploy.sh
```

---

## 🎉 You're Ready!

Your Git-based deployment workflow is set up. Now you can:

1. **Develop locally** with hot-reload
2. **Commit changes** to Git
3. **Deploy instantly** with `git pull`
4. **Track versions** with Git history
5. **Rollback easily** if needed

**Happy deploying!** 🚀

---

**Last Updated:** November 22, 2025

