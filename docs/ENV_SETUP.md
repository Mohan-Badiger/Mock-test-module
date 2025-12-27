# Environment Setup Guide

## Quick Fix for Database Connection Errors

If you're seeing the error:
```
Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

### Solution:

1. **Update the password in `backend/.env` file:**

   Open `backend/.env` and change the `DB_PASSWORD` to match your PostgreSQL password:

   ```env
   DB_PASSWORD=your_actual_postgresql_password
   ```

   **Common PostgreSQL passwords:**
   - Default: `postgres`
   - If you set a custom password during installation, use that
   - If you forgot, you can reset it or check your PostgreSQL configuration

2. **Verify PostgreSQL is running:**
   ```bash
   # On Windows PowerShell
   Get-Service postgresql*
   
   # Or test connection
   psql -U postgres -d mock_test_db
   ```

3. **Restart the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

## Default .env Values

The `.env` file has been created with default values:
- `DB_PASSWORD=postgres` (change this to your actual password)
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=mock_test_db`
- `DB_USER=postgres`

## If PostgreSQL Password is Empty

If your PostgreSQL installation doesn't use a password (not recommended for production):

1. Edit `backend/.env`:
   ```env
   DB_PASSWORD=
   ```

2. Update `backend/config/database.js` to handle empty password:
   ```javascript
   password: dbPassword || undefined,
   ```

## Troubleshooting

### Error: Database doesn't exist
```bash
# Create the database
psql -U postgres
CREATE DATABASE mock_test_db;
\q
```

### Error: Connection refused
- Check if PostgreSQL is running
- Verify the port (default is 5432)
- Check firewall settings

### Error: Authentication failed
- Verify username and password in `.env`
- Check PostgreSQL's `pg_hba.conf` file for authentication settings

## React Router Warnings (Fixed)

The React Router future flag warnings have been fixed by adding:
```jsx
<Router
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
```

These warnings are now resolved and won't appear in the console.

