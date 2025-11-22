# Login Issue Resolution

## Problem
Login was returning 401 Unauthorized error from the frontend.

## Root Cause
The issue was caused by the Axios interceptor attempting to add an Authorization header to the login request itself, and potentially trying to refresh tokens on login failures.

## Fixes Applied

### 1. Updated User Seeding (`backend/database/seed_users.php`)
- Added environment variable loading to ensure database connection works
- Re-ran seed script to ensure all users have correct password hashes
- Verified users: admin, tester, john, jane (all with passwords ending in "123")

### 2. Fixed API Client Interceptors (`frontend/src/lib/api/client.ts`)
- **Request Interceptor**: Excluded auth endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`) from receiving Authorization headers
- **Response Interceptor**: Prevented token refresh attempts for auth endpoints to avoid infinite loops

### 3. Enhanced Login Error Handling (`frontend/src/pages/LoginPage.tsx`)
- Added localStorage cleanup before login to remove stale tokens
- Added comprehensive error logging for debugging
- Improved error message extraction from API responses

### 4. Improved Auth Controller Logging (`backend/src/Controllers/AuthController.php`)
- Added JSON decode error checking
- Split user lookup and password verification errors for better debugging

## Verification

### Backend Test (curl)
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"username":"admin","password":"admin123"}'
```

**Result**: ✅ Returns 200 OK with valid JWT tokens

### Database Verification
```bash
php -r "/* verify password hash */"
```

**Result**: ✅ Password verification works correctly

## Demo Credentials

| Username | Password   | Role        |
|----------|------------|-------------|
| admin    | admin123   | ADMIN       |
| tester   | tester123  | QA_ENGINEER |
| john     | john123    | QA_ENGINEER |
| jane     | jane123    | QA_MANAGER  |

## How to Test

1. **Clear Browser Cache and LocalStorage**
   - Open DevTools (F12)
   - Go to Application tab → Local Storage
   - Clear all items
   - Refresh the page

2. **Try Login**
   - Navigate to http://localhost:5173
   - Use credentials: `admin` / `admin123`
   - Check browser console for detailed logs

3. **Check Network Tab**
   - Open DevTools → Network tab
   - Look for the `/auth/login` request
   - Verify it returns 200 OK
   - Check response contains `accessToken` and `refreshToken`

## Technical Details

### CORS Configuration
- Backend allows origin: `http://localhost:5173`
- Credentials enabled: `true`
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, X-Requested-With

### JWT Configuration
- Access token expiry: 3600 seconds (1 hour)
- Refresh token expiry: 604800 seconds (7 days)
- Algorithm: HS256

### Password Hashing
- Algorithm: bcrypt (PASSWORD_BCRYPT)
- Cost: 10 (default)

## Next Steps

If login still fails after these fixes:

1. **Check Browser Console**
   - Look for CORS errors
   - Check for network errors
   - Verify the request payload

2. **Check Backend Logs**
   ```bash
   tail -f /tmp/backend.log
   ```

3. **Verify Servers Are Running**
   ```bash
   ps aux | grep -E "(php.*8000|vite)"
   ```

4. **Test with Simple HTML** (bypasses React)
   - Open `/tmp/login_test.html` in browser
   - Click "Test Login" button
   - Should see successful JSON response

## Files Modified

1. `backend/database/seed_users.php` - Added env loading
2. `frontend/src/lib/api/client.ts` - Fixed interceptors
3. `frontend/src/pages/LoginPage.tsx` - Enhanced error handling
4. `backend/src/Controllers/AuthController.php` - Improved logging

All changes are backward compatible and improve the overall authentication flow.

