# Create Admin Account for peterphone

## Problem
The account "peterphone" exists in the `users` table but not in the `admins` table. This is why you're getting a token with `userId` instead of `adminId`.

## Solution: Create Admin Account

### Option 1: Using SQL (Recommended)

Run this SQL in your Neon database console:

```sql
-- First, get the password hash from the users table (if you want to use the same password)
-- Or create a new password hash

-- Create admin account for peterphone
-- Replace 'YOUR_PASSWORD_HASH' with a bcrypt hash of your desired password
-- For password 'admin123', use: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

INSERT INTO admins (username, email, password_hash, full_name, is_active)
VALUES (
  'peterphone',
  'p@gmail.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- Password: admin123
  'Petros Asegid Phone',
  true
)
ON CONFLICT (username) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_active = true,
  updated_at = CURRENT_TIMESTAMP;

-- Verify it was created
SELECT id, username, email, full_name, is_active FROM admins WHERE username = 'peterphone';
```

### Option 2: Using the createAdmin Script

```bash
cd backend
node scripts/createAdmin.js peterphone p@gmail.com admin123 "Petros Asegid Phone"
```

### Option 3: Copy from Users Table

If you want to use the same password as the user account, you'll need to:
1. Get the password hash from the users table
2. Insert it into the admins table

**Note:** Regular user passwords are hashed, but you'll need to know the original password to create a new hash, or you can use a new password for the admin account.

## After Creating Admin Account

1. **Clear localStorage** in your browser:
   ```javascript
   localStorage.removeItem('adminToken');
   localStorage.removeItem('admin');
   ```

2. **Log in again** using the admin login page with:
   - Username: `peterphone`
   - Password: `admin123` (or whatever password you set)

3. **Verify the token** has `adminId` and `role: 'admin'`:
   - Open browser console
   - Run: `JSON.parse(atob(localStorage.getItem('adminToken').split('.')[1]))`
   - Should see: `{ adminId: 6, username: 'peterphone', role: 'admin', ... }`

## Important Notes

- **Admin accounts are separate from user accounts**
- The `admins` table is for admin panel access only
- The `users` table is for regular user access
- You can have the same username in both tables, but they're different accounts
- Admin login uses: `/api/admin/auth/login`
- User login uses: `/api/auth/login`

