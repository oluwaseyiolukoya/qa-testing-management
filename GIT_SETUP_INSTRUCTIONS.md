# Git Setup & Push Instructions

## ✅ Status: Repository Initialized

Your local Git repository is ready with all files committed!

```
✓ Git initialized
✓ All files staged
✓ Initial commit made
✓ 132 files committed (27,111 lines)
```

---

## 🚀 Next Steps

### Step 1: Create Remote Repository

Choose either **GitHub** or **GitLab**:

#### Option A: GitHub

1. Go to: https://github.com/new
2. Repository name: `qa-testing-management`
3. Description: `QA Testing Management System - React + PHP`
4. **Private** repository (recommended)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

#### Option B: GitLab

1. Go to: https://gitlab.com/projects/new
2. Project name: `qa-testing-management`
3. Visibility: **Private**
4. **DO NOT** initialize with README
5. Click **Create project**

---

### Step 2: Add Your Namecheap SSH Key to Git Provider

#### For GitHub:

1. In Namecheap cPanel:
   - Go to **Security** → **SSH Access** → **Manage SSH Keys**
   - Click **View** on your public key
   - Copy the entire key (starts with `ssh-rsa` or `ssh-ed25519`)

2. In GitHub:
   - Go to **Settings** → **SSH and GPG keys**
   - Click **New SSH key**
   - Title: `Namecheap Server - qatest.cmpmediapartner.com`
   - Paste your public key
   - Click **Add SSH key**

#### For GitLab:

1. Copy your public key from Namecheap (same as above)

2. In GitLab:
   - Go to **Preferences** → **SSH Keys**
   - Paste your public key
   - Title: `Namecheap Server`
   - Click **Add key**

---

### Step 3: Add Remote and Push

Run these commands in your terminal:

#### For GitHub:

```bash
cd /Users/oluwaseyio/QA_testing

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin git@github.com:YOUR_USERNAME/qa-testing-management.git

# Push to GitHub
git push -u origin main
```

#### For GitLab:

```bash
cd /Users/oluwaseyio/QA_testing

# Add remote (replace YOUR_USERNAME with your GitLab username)
git remote add origin git@gitlab.com:YOUR_USERNAME/qa-testing-management.git

# Push to GitLab
git push -u origin main
```

---

### Step 4: Verify Push

After pushing, you should see:

```
Enumerating objects: 168, done.
Counting objects: 100% (168/168), done.
Delta compression using up to 8 threads
Compressing objects: 100% (132/132), done.
Writing objects: 100% (168/168), 1.2 MiB | 2.4 MiB/s, done.
Total 168 (delta 20), reused 0 (delta 0)
To github.com:YOUR_USERNAME/qa-testing-management.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

Visit your repository URL to confirm all files are there!

---

## 🖥️ Deploy to Namecheap Server

### Step 1: Connect via SSH

```bash
ssh your_cpanel_username@cmpmediapartner.com -p 21098
```

Or use the IP address:
```bash
ssh your_cpanel_username@your_server_ip -p 21098
```

### Step 2: Navigate to Subdomain Directory

```bash
cd ~/public_html
mkdir -p qatest
cd qatest
```

### Step 3: Clone Repository

#### For GitHub:
```bash
git clone git@github.com:YOUR_USERNAME/qa-testing-management.git .
```

#### For GitLab:
```bash
git clone git@gitlab.com:YOUR_USERNAME/qa-testing-management.git .
```

**Note:** The `.` at the end clones into the current directory.

### Step 4: Reorganize for Web Hosting

```bash
# Move backend to api directory
mv backend api

# Move frontend build files to root
cp -r frontend/dist/* .

# Clean up (optional)
rm -rf frontend/src frontend/node_modules
```

Your structure should be:
```
~/public_html/qatest/
├── api/              # Backend
├── assets/           # Frontend assets
├── index.html        # Frontend entry
├── .htaccess         # Root routing
└── .git/             # Git repository
```

### Step 5: Configure Environment

```bash
cd ~/public_html/qatest/api
nano .env
```

Paste your production configuration:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://qatest.cmpmediapartner.com

DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your-secure-32-char-random-string
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

CORS_ORIGINS=https://qatest.cmpmediapartner.com
TZ=UTC
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 6: Import Database

```bash
cd ~/public_html/qatest/database/exports
mysql -u your_db_user -p your_db_name < production_export_2025-11-22.sql
```

### Step 7: Seed Users

```bash
cd ~/public_html/qatest/api/database
php seed_users.php
```

### Step 8: Set Permissions

```bash
cd ~/public_html/qatest
chmod 755 api
chmod 644 api/.env
chmod 755 api/public
chmod 644 .htaccess
chmod 644 index.html
```

---

## 🧪 Test Your Deployment

1. Visit: https://qatest.cmpmediapartner.com
2. You should see the login page
3. Login with:
   - Username: `admin`
   - Password: `admin123`
4. Change the password immediately!

---

## 🔄 Future Updates

### On Your Local Machine:

```bash
cd /Users/oluwaseyio/QA_testing

# Make changes...

# Commit and push
git add .
git commit -m "Description of changes"
git push origin main
```

### On Namecheap Server:

```bash
ssh your_username@cmpmediapartner.com -p 21098
cd ~/public_html/qatest
git pull origin main

# If frontend changed, update files
cp -r frontend/dist/* .
```

---

## 📝 Quick Commands Reference

### Local Development:
```bash
# Status
git status

# Add files
git add .

# Commit
git commit -m "message"

# Push
git push origin main

# View log
git log --oneline
```

### Server Deployment:
```bash
# Connect
ssh user@server -p 21098

# Pull updates
cd ~/public_html/qatest && git pull

# Check status
git status

# View log
git log --oneline -5
```

---

## 🎯 Deployment Checklist

- [ ] Repository created on GitHub/GitLab
- [ ] SSH key added to Git provider
- [ ] Remote added to local repository
- [ ] Code pushed to remote
- [ ] SSH connection to Namecheap tested
- [ ] Repository cloned to server
- [ ] Files reorganized for web hosting
- [ ] `.env` file created and configured
- [ ] Database imported
- [ ] Users seeded
- [ ] Permissions set
- [ ] Application tested and working

---

## 🆘 Troubleshooting

### "Permission denied (publickey)"

**Solution:**
```bash
# Test SSH connection to Git provider
ssh -T git@github.com
# or
ssh -T git@gitlab.com

# If fails, verify SSH key is added correctly
```

### "fatal: remote origin already exists"

**Solution:**
```bash
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin YOUR_REPO_URL
```

### "Git pull conflicts"

**Solution:**
```bash
# On server
cd ~/public_html/qatest
git stash
git pull origin main
git stash pop
```

---

## 🎉 You're Ready!

Your repository is initialized and ready to push. Follow the steps above to:

1. Create your remote repository
2. Add your SSH key
3. Push your code
4. Deploy to Namecheap

**Good luck with your deployment!** 🚀

---

**Repository:** qa-testing-management  
**Branch:** main  
**Commit:** b1c8d15 (Initial commit)  
**Files:** 132 files, 27,111 lines  
**Date:** November 22, 2025

