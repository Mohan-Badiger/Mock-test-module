# Debug Admin Login 401 Error

## Problem
Admin exists in database, but login returns 401 (Unauthorized).

## Common Causes

### 1. Password Hash Mismatch (Most Common)

The password hash in the database doesn't match the password you're trying to use.

**Check:**
```sql
SELECT username, password_hash, is_active FROM admins WHERE username = 'admin';
```

**Fix:**
1. Generate a new hash for your password:
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('admin123', 10).then(hash => console.log(hash));
   ```

2. Update the admin:
   ```sql
   UPDATE admins 
   SET password_hash = '$2a$10$YOUR_NEW_HASH_HERE'
   WHERE username = 'admin';
   ```

### 2. Admin is Inactive

**Check:**
```sql
SELECT username, is_active FROM admins WHERE username = 'admin';
```

**Fix:**
```sql
UPDATE admins SET is_active = true WHERE username = 'admin';
```

### 3. Wrong Username/Email

Make sure you're using the exact username or email from the database.

**Check:**
```sql
SELECT username, email FROM admins;
```

### 4. Password Hash Format Issue

The hash might be corrupted or in wrong format. It should:
- Start with `$2a$10$`
- Be 60 characters long

**Check:**
```sql
SELECT 
  username, 
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 7) as hash_prefix
FROM admins 
WHERE username = 'admin';
```

Should show:
- `hash_length`: 60
- `hash_prefix`: `$2a$10$`

## Debug Script

Run this to test your admin login locally:

```bash
cd backend
npm run debug-admin-login admin admin123
```

This will check:
- ✅ If admin exists
- ✅ If admin is active
- ✅ If password matches
- ✅ If JWT can be generated

## Quick Fix: Reset Admin Password

If nothing else works, reset the admin password:

```sql
-- Generate hash for 'admin123' first, then:
UPDATE admins 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    is_active = true
WHERE username = 'admin';
```

Then login with:
- Username: `admin`
- Password: `admin123`

## Check Backend Logs

On Render, check the logs when you try to login. You should see:
- `Admin login failed: Password mismatch` (if password is wrong)
- Or other error messages

## Test with curl

Test the endpoint directly:

```bash
curl -X POST https://ai-powered-skill-based-mock-tests-module.onrender.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

This will show the exact error message.

## Most Likely Solution

If the admin exists but login fails, it's almost always the password hash. Run this SQL to fix it:

```sql
-- This sets password to 'admin123'
UPDATE admins 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    is_active = true
WHERE username = 'admin';
```

Then login with `admin` / `admin123`.

