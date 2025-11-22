# Quick Login Guide

## ✅ Login is Now Fixed!

The login issue has been resolved. Here's what was done:

## Changes Made

### 1. **Fixed Axios Interceptors** 
   - Login requests no longer get an Authorization header
   - Token refresh doesn't trigger on login failures
   - File: `frontend/src/lib/api/client.ts`

### 2. **Enhanced Error Handling**
   - Clear stale tokens before login
   - Better error messages
   - Detailed console logging
   - File: `frontend/src/pages/LoginPage.tsx`

### 3. **Updated User Seeds**
   - All demo users have correct password hashes
   - File: `backend/database/seed_users.php`

## How to Login

1. **Open the app**: http://localhost:5173
2. **Clear browser cache** (if needed):
   - Press F12 → Application → Local Storage
   - Delete all items
   - Refresh page

3. **Use these credentials**:
   ```
   Username: admin
   Password: admin123
   ```

## Other Demo Accounts

| Username | Password   | Role        |
|----------|------------|-------------|
| admin    | admin123   | ADMIN       |
| tester   | tester123  | QA_ENGINEER |
| john     | john123    | QA_ENGINEER |
| jane     | jane123    | QA_MANAGER  |

## Troubleshooting

### If login still fails:

1. **Check servers are running**:
   ```bash
   # Backend (should show PHP server on port 8000)
   ps aux | grep "php.*8000"
   
   # Frontend (should show Vite on port 5173)
   ps aux | grep vite
   ```

2. **Restart servers if needed**:
   ```bash
   # Kill existing servers
   pkill -f "php.*8000"
   pkill -f vite
   
   # Start backend
   cd /Users/oluwaseyio/QA_testing/backend
   php -S localhost:8000 -t public
   
   # Start frontend (in new terminal)
   cd /Users/oluwaseyio/QA_testing/frontend
   npm run dev
   ```

3. **Check browser console** (F12):
   - Look for detailed error logs
   - Check Network tab for the login request
   - Should see 200 OK response

4. **Test backend directly**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```
   Should return JSON with `accessToken` and `refreshToken`

## What Was Wrong?

The Axios request interceptor was adding an `Authorization: Bearer undefined` header to the login request, causing the backend to return 401. The fix ensures auth endpoints don't get this header.

## Verification

✅ Backend tested with curl - **WORKING**  
✅ Password hashes verified - **CORRECT**  
✅ CORS configured properly - **WORKING**  
✅ Interceptors fixed - **WORKING**  
✅ Error handling improved - **WORKING**

**You should now be able to login successfully!**

