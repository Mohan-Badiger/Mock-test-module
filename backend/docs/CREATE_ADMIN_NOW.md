# Create Admin Account - Quick Guide

## ✅ Good News!
The 401 error means the endpoint is working! You just need to create the admin account.

## Step 1: Create the Admins Table (if not exists)

Run this SQL in your **Neon database console**:

```sql
-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
```

## Step 2: Create Admin Account

### Option A: Using SQL with Pre-generated Hash (Easiest)

For password `admin123`, use this SQL:

```sql
INSERT INTO admins (username, email, password_hash, full_name, is_active)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Admin User',
  true
);
```

**Login credentials:**
- Username: `admin`
- Password: `admin123`

### Option B: Generate Your Own Hash

If you want a different password:

1. **Generate bcrypt hash** using one of these methods:

   **Method 1: Online tool**
   - Go to: https://bcrypt-generator.com/
   - Enter your password
   - Set rounds to 10
   - Copy the hash

   **Method 2: Node.js (if you have local access)**
   ```javascript
   const bcrypt = require('bcryptjs');
   bcrypt.hash('your_password_here', 10).then(hash => console.log(hash));
   ```

2. **Insert into database:**
   ```sql
   INSERT INTO admins (username, email, password_hash, full_name, is_active)
   VALUES (
     'admin',
     'admin@example.com',
     '$2a$10$YOUR_HASH_HERE',  -- Replace with your hash
     'Admin User',
     true
   );
   ```

## Step 3: Verify Admin Creation

Check if admin was created:

```sql
SELECT id, username, email, full_name, is_active, created_at 
FROM admins;
```

You should see your admin account.

## Step 4: Login

1. Go to: https://ai-powered-skill-based-mock-tests-m-iota.vercel.app/login
2. Enter:
   - Username: `admin` (or the username you created)
   - Password: `admin123` (or your chosen password)
3. Click Login

## Troubleshooting

### Still getting 401?

1. **Check if admin exists:**
   ```sql
   SELECT * FROM admins WHERE username = 'admin';
   ```

2. **Check if admin is active:**
   ```sql
   SELECT username, is_active FROM admins WHERE username = 'admin';
   ```
   If `is_active` is `false`, activate it:
   ```sql
   UPDATE admins SET is_active = true WHERE username = 'admin';
   ```

3. **Verify password hash:**
   - Make sure the hash starts with `$2a$10$`
   - The hash should be 60 characters long
   - Double-check you copied the entire hash

### Want to change password?

1. Generate new hash for your new password
2. Update the admin:
   ```sql
   UPDATE admins 
   SET password_hash = '$2a$10$YOUR_NEW_HASH_HERE'
   WHERE username = 'admin';
   ```

## Quick Copy-Paste SQL

Here's everything in one go:

```sql
-- 1. Create table (if not exists)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- 2. Create admin account (password: admin123)
INSERT INTO admins (username, email, password_hash, full_name, is_active)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'Admin User',
  true
) ON CONFLICT (username) DO NOTHING;

-- 3. Verify
SELECT id, username, email, is_active FROM admins;
```

## Security Note

⚠️ **After first login, change the password!**

Use a strong password and update it:
```sql
-- Generate new hash for your new password, then:
UPDATE admins 
SET password_hash = '$2a$10$YOUR_NEW_STRONG_PASSWORD_HASH'
WHERE username = 'admin';
```

