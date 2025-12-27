# Fix 403 Forbidden Error After Admin Login

## Problem
After successfully logging in, you get `403 (Forbidden)` when trying to access admin routes like `/api/admin/difficulties`.

## Root Cause
The JWT token doesn't have the required `role: 'admin'` or `adminId` field, or the token verification is failing.

## Quick Fix

### Step 1: Check Your Token

Open browser console on your admin panel and run:
```javascript
const token = localStorage.getItem('adminToken');
console.log('Token:', token);
```

### Step 2: Verify Token Payload

The token should contain:
- `role: 'admin'` OR
- `adminId: <number>`

### Step 3: Check JWT_SECRET

Make sure `JWT_SECRET` is set correctly in your Render environment variables:
1. Go to Render dashboard
2. Click on your backend service
3. Go to "Environment" tab
4. Check if `JWT_SECRET` is set
5. If not, add it (use a strong random string)

### Step 4: Re-login

After fixing JWT_SECRET:
1. Clear localStorage:
   ```javascript
   localStorage.removeItem('adminToken');
   localStorage.removeItem('admin');
   ```
2. Log in again
3. The new token should work

## Common Issues

### Issue 1: JWT_SECRET Mismatch

**Symptom:** Token works locally but not on Render

**Fix:** 
- Make sure `JWT_SECRET` in Render matches what you're using
- Or use the same secret everywhere

### Issue 2: Token Missing Admin Fields

**Symptom:** Token exists but 403 error

**Check:** Decode your token at https://jwt.io and verify it has:
```json
{
  "adminId": 1,
  "username": "admin",
  "role": "admin"
}
```

**Fix:** If missing, the login endpoint needs to be fixed (it should already be correct)

### Issue 3: Token Not Being Sent

**Symptom:** 401 instead of 403

**Check:** Open browser DevTools → Network tab → Check request headers
- Should see: `Authorization: Bearer <token>`

**Fix:** Clear cache and reload, or check localStorage

## Debug Steps

1. **Check if token exists:**
   ```javascript
   console.log('Token:', localStorage.getItem('adminToken'));
   ```

2. **Check token payload:**
   - Go to https://jwt.io
   - Paste your token
   - Check the payload section

3. **Test token on backend:**
   ```bash
   cd backend
   node scripts/testAdminToken.js <your_token>
   ```

4. **Check Render logs:**
   - Look for "Admin auth failed" messages
   - Check for JWT verification errors

## Solution

Most likely, you need to:
1. Set `JWT_SECRET` in Render environment variables
2. Re-deploy the backend
3. Clear localStorage and login again

The token will then be generated with the correct secret and will pass verification.

