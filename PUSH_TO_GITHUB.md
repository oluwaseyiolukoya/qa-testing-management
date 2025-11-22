# Push to GitHub - Instructions

## ⚠️ Important: SSH Key Setup

Your Namecheap SSH key is configured as a **deploy key** (read-only for pulling on the server).

To **push** from your local machine, you need to use your **personal SSH key**.

---

## 🔑 Option 1: Use Your Personal SSH Key (Recommended)

### Check if you have an SSH key:

```bash
ls -la ~/.ssh
```

Look for files like:
- `id_rsa` and `id_rsa.pub`
- `id_ed25519` and `id_ed25519.pub`

### If you don't have an SSH key, create one:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location
# Enter a passphrase (or leave empty)
```

### Add your SSH key to GitHub:

1. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # or
   cat ~/.ssh/id_rsa.pub
   ```

2. Go to GitHub:
   - **Settings** → **SSH and GPG keys** → **New SSH key**
   - Title: `My Mac`
   - Paste your public key
   - Click **Add SSH key**

3. Test the connection:
   ```bash
   ssh -T git@github.com
   ```
   
   You should see:
   ```
   Hi YOUR_USERNAME! You've successfully authenticated...
   ```

### Now push:

```bash
cd /Users/oluwaseyio/QA_testing
git push origin main
```

---

## 🔑 Option 2: Use HTTPS (Simpler, but requires token)

### Change remote to HTTPS:

```bash
cd /Users/oluwaseyio/QA_testing
git remote set-url origin https://github.com/oluwaseyiolukoya/qa-testing-management.git
```

### Create a Personal Access Token:

1. Go to GitHub:
   - **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
   - Click **Generate new token (classic)**
   - Note: `QA Testing Management`
   - Expiration: 90 days (or your choice)
   - Scopes: Check **repo** (all sub-options)
   - Click **Generate token**
   - **Copy the token** (you won't see it again!)

### Push with token:

```bash
cd /Users/oluwaseyio/QA_testing
git push origin main
```

When prompted:
- Username: `oluwaseyiolukoya`
- Password: `paste_your_token_here`

### Save credentials (optional):

```bash
git config --global credential.helper osxkeychain
```

Now Git will remember your token.

---

## 🚀 After Successful Push

Once you've pushed to GitHub, you can deploy to Namecheap:

### 1. SSH into Namecheap:

```bash
ssh your_username@cmpmediapartner.com -p 21098
```

### 2. Clone the repository:

```bash
cd ~/public_html
mkdir -p qatest && cd qatest
git clone git@github.com:oluwaseyiolukoya/qa-testing-management.git .
```

**Note:** The Namecheap SSH key (deploy key) works for **pulling** (read-only), which is perfect for deployment!

### 3. Set up the application:

```bash
# Reorganize files
mv backend api
cp -r frontend/dist/* .

# Configure environment
cd api
nano .env
# (Paste your database credentials)

# Import database
cd ~/public_html/qatest/database/exports
mysql -u user -p database < production_export_2025-11-22.sql

# Seed users
cd ~/public_html/qatest/api/database
php seed_users.php
```

### 4. Test:

Visit: https://qatest.cmpmediapartner.com

---

## 🔄 Update Workflow

### Local (Your Mac):
```bash
# Make changes
cd /Users/oluwaseyio/QA_testing
# ... edit files ...

# Commit and push
git add .
git commit -m "Your changes"
git push origin main
```

### Server (Namecheap):
```bash
# SSH in
ssh your_username@cmpmediapartner.com -p 21098

# Pull updates
cd ~/public_html/qatest
git pull origin main

# Update frontend if changed
cp -r frontend/dist/* .
```

---

## 🎯 Quick Commands

### Check current remote:
```bash
git remote -v
```

### Switch to SSH:
```bash
git remote set-url origin git@github.com:oluwaseyiolukoya/qa-testing-management.git
```

### Switch to HTTPS:
```bash
git remote set-url origin https://github.com/oluwaseyiolukoya/qa-testing-management.git
```

### Push:
```bash
git push origin main
```

---

## 📝 Summary

**Two SSH Keys, Two Purposes:**

1. **Your Personal SSH Key** (on Mac)
   - Purpose: Push code from your Mac to GitHub
   - Location: `~/.ssh/id_ed25519` or `~/.ssh/id_rsa`
   - Added to: Your GitHub account (Settings → SSH keys)

2. **Namecheap SSH Key** (on server)
   - Purpose: Pull code from GitHub to Namecheap server
   - Location: Namecheap cPanel → SSH Access
   - Added to: GitHub repository as Deploy Key (read-only)

---

## ✅ Next Steps

1. Choose Option 1 (SSH) or Option 2 (HTTPS)
2. Push your code to GitHub
3. SSH into Namecheap
4. Clone and deploy

**You're almost there!** 🚀

