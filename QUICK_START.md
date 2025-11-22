# 🚀 Quick Start Guide

## ✅ Everything is Set Up and Running!

### Current Status

| Component | Status | URL |
|-----------|--------|-----|
| **Frontend** | ✅ Running | http://localhost:5173 |
| **Backend API** | ✅ Running | http://localhost:8000/api/v1 |
| **MySQL Database** | ✅ Running | localhost:3306 |
| **PHP** | ✅ Installed | PHP 8.4.15 |
| **Sample Data** | ✅ Loaded | 4 users, 3 test cases |

---

## 🎯 Access Your Application

### Frontend (React App)
```
http://localhost:5173
```

### Backend API
```
http://localhost:8000/api/v1
```

### Demo Login Credentials

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Admin |
| `tester` | `tester123` | QA Engineer |
| `john` | `john123` | QA Engineer |
| `jane` | `jane123` | QA Manager |

---

## 🧪 Test the Application

### 1. Open Frontend
```bash
# Already running! Just visit:
open http://localhost:5173
```

### 2. Login
- Username: `admin`
- Password: `admin123`
- You should see the dashboard with metrics!

### 3. Test API Directly
```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get Dashboard (with token)
curl http://localhost:8000/api/v1/reports/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📊 What's Included

### Sample Data
- ✅ **4 Users** (admin, tester, john, jane)
- ✅ **3 Test Cases** (Login tests, Dashboard test)
- ✅ **3 Test Runs** (Sample executions)
- ✅ **1 Bug** (Dashboard performance issue)

### Database Tables
- `users` - User accounts
- `test_cases` - Test case definitions
- `test_steps` - Test case steps
- `test_runs` - Test executions
- `test_step_results` - Step-level results
- `bugs` - Bug tracking
- `bug_comments` - Bug discussions
- `notifications` - User notifications
- `audit_logs` - Activity logs
- `refresh_tokens` - Auth tokens

---

## 🔧 Managing Servers

### Start Servers

**Option 1: Use the script**
```bash
./START_SERVERS.sh
```

**Option 2: Manual start**

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
php -S localhost:8000 -t public
```

**MySQL:**
```bash
brew services start mysql
```

### Stop Servers

```bash
# Stop Frontend
pkill -f vite

# Stop Backend
pkill -f "php.*8000"

# Stop MySQL
brew services stop mysql
```

---

## 🗄️ Database Management

### Access MySQL
```bash
mysql -u root qa_testing
```

### View Tables
```sql
SHOW TABLES;
```

### View Users
```sql
SELECT username, email, role FROM users;
```

### Reset Database
```bash
mysql -u root qa_testing < backend/database/schema.sql
```

---

## 📝 Common Tasks

### Add New User
```sql
INSERT INTO users (id, username, email, password_hash, role) 
VALUES (
  UUID(),
  'newuser',
  'newuser@example.com',
  '$2y$10$...', -- Generate with PHP password_hash()
  'QA_ENGINEER'
);
```

### View Test Cases
```sql
SELECT id, title, priority, status, module FROM test_cases;
```

### View Test Runs
```sql
SELECT tr.id, tc.title, tr.result, tr.executed_at 
FROM test_runs tr 
JOIN test_cases tc ON tr.test_case_id = tc.id;
```

---

## 🐛 Troubleshooting

### Frontend not loading?
```bash
cd frontend
npm run dev
# Check http://localhost:5173
```

### Backend errors?
```bash
# Check PHP is running
php --version

# Check MySQL is running
brew services list | grep mysql

# Check database connection
mysql -u root qa_testing -e "SELECT 1;"
```

### Can't login?
- Verify password: `admin123`
- Check database: `SELECT username FROM users;`
- Reset password if needed (see above)

---

## 📚 Next Steps

1. **Explore the UI** - Login and check out the dashboard
2. **Create Test Cases** - Add your own test cases
3. **Run Tests** - Execute tests and record results
4. **Track Bugs** - Create bugs from failed tests
5. **View Reports** - Check analytics and metrics

---

## 🎉 You're All Set!

Everything is configured and running. Start using your QA Testing Management Tool!

**Frontend:** http://localhost:5173  
**Backend:** http://localhost:8000/api/v1  
**Database:** MySQL (qa_testing)

Happy Testing! 🚀

