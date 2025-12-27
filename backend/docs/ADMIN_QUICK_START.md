# Admin Quick Start Guide

## Step 1: Run Database Migration

First, make sure the `admins` table exists in your database:

```bash
cd backend
node migrations/runMigrations.js
```

This will create the `admins` table if it doesn't exist.

## Step 2: Create Your First Admin Account

You have two options:

### Option A: Using the Helper Script (Recommended)

```bash
cd backend
node scripts/createAdmin.js admin admin@example.com admin123 "Admin User"
```

Replace:
- `admin` - Your desired username
- `admin@example.com` - Your email
- `admin123` - Your password
- `Admin User` - Your full name (optional)

### Option B: Using SQL Directly

1. First, generate a bcrypt hash for your password. You can use Node.js:

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

2. Then run this SQL in your database:

```sql
INSERT INTO admins (username, email, password_hash, full_name, is_active)
VALUES (
  'admin',
  'admin@example.com',
  '$2a$10$YourHashedPasswordHere',  -- Replace with the hash from step 1
  'Admin User',
  true
);
```

## Step 3: Verify Admin Creation

Check if the admin was created:

```sql
SELECT id, username, email, full_name, is_active, created_at 
FROM admins;
```

## Step 4: Login to Admin Panel

1. Go to your admin panel: `https://ai-powered-skill-based-mock-tests-m-iota.vercel.app/login`
2. Enter your username and password
3. You should be redirected to the dashboard

## Troubleshooting

### "Not Found" Error

If you get a "not found" error when trying to login:

1. **Check if the admins table exists:**
   ```sql
   SELECT * FROM admins;
   ```
   If this gives an error, run the migration: `node migrations/runMigrations.js`

2. **Check if the admin account exists:**
   ```sql
   SELECT * FROM admins WHERE username = 'admin';
   ```
   If no results, create the admin using Option A or B above.

3. **Check backend logs:**
   - Look at your Render backend logs to see if there are any errors
   - Check if the endpoint `/api/admin/auth/login` is accessible

4. **Test the endpoint directly:**
   ```bash
   # Using curl
   curl -X POST https://ai-powered-skill-based-mock-tests-module.onrender.com/api/admin/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   
   # Or using the test script
   npm run test-admin-endpoint
   ```

### "Invalid username or password" Error

- Make sure the admin account exists in the database
- Verify the password is correct
- Check if the admin account is active (`is_active = true`)

### "Cannot connect to backend server" Error

- Verify your backend is running on Render
- Check the backend URL in the admin panel API configuration
- Ensure CORS is properly configured on the backend

## Quick Admin Creation Script

For convenience, here's a ready-to-use script:

```bash
# Make sure you're in the backend directory
cd backend

# Create admin with username 'admin', password 'admin123'
node scripts/createAdmin.js admin admin@example.com admin123 "Admin User"
```

## Security Notes

⚠️ **Important:** After creating your admin account:
1. Change the default password immediately
2. Use a strong, unique password
3. Don't share admin credentials
4. Only create admin accounts for trusted personnel

