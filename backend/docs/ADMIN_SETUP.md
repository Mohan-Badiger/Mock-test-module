# Admin Setup Guide

## Manual Admin Registration

Since there is no signup for admins, you need to manually register an admin in the database using SQL.

### Step 1: Hash the Password

First, you need to hash the password. You can use Node.js to generate a bcrypt hash:

```javascript
const bcrypt = require('bcryptjs');
const password = 'your_admin_password';
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

Or use an online bcrypt generator (not recommended for production).

### Step 2: Insert Admin into Database

Run this SQL query in your PostgreSQL database:

```sql
INSERT INTO admins (username, email, password_hash, full_name, is_active)
VALUES (
  'admin',                                    -- Username
  'admin@example.com',                        -- Email
  '$2a$10$YourHashedPasswordHere',           -- Bcrypt hashed password (replace with actual hash)
  'Admin User',                               -- Full name
  true                                        -- Is active
);
```

### Example with a Real Password Hash

For password `admin123`, the hash might look like:
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
```

So the SQL would be:

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

### Step 3: Verify Admin Creation

Check if the admin was created:

```sql
SELECT id, username, email, full_name, is_active, created_at 
FROM admins;
```

### Step 4: Login

Use the admin login page with:
- **Username**: `admin` (or the email)
- **Password**: `admin123` (or your chosen password)

## Security Notes

1. **Change Default Password**: Always change the default password after first login.
2. **Strong Passwords**: Use strong, unique passwords for admin accounts.
3. **Limit Admin Accounts**: Only create admin accounts for trusted personnel.
4. **Deactivate Unused Accounts**: Set `is_active = false` for admins who no longer need access.

## Deactivating an Admin

To deactivate an admin account:

```sql
UPDATE admins 
SET is_active = false 
WHERE username = 'admin';
```

## Reactivating an Admin

To reactivate an admin account:

```sql
UPDATE admins 
SET is_active = true 
WHERE username = 'admin';
```

## Multiple Admins

You can create multiple admin accounts:

```sql
INSERT INTO admins (username, email, password_hash, full_name, is_active)
VALUES 
  ('admin1', 'admin1@example.com', '$2a$10$...', 'Admin One', true),
  ('admin2', 'admin2@example.com', '$2a$10$...', 'Admin Two', true);
```

