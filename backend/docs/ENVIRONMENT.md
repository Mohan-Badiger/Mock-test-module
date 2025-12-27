# Environment Variables Configuration

Complete guide for setting up environment variables for the Mock Test Backend API.

## Quick Setup

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your configuration

## Required Variables

### JWT Secret (REQUIRED)
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```
**Important:** Use a strong, random string. Never commit this to version control.

### Database Connection (Choose ONE)

#### Option 1: Neon/Cloud PostgreSQL (Recommended)
```env
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require
```

**OR** use `DATABASE_URL`:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

#### Option 2: Local PostgreSQL (Fallback)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mock_test_db
DB_USER=postgres
DB_PASSWORD=your_password
```

**Priority:** `NEON_DATABASE_URL` > `DATABASE_URL` > Local DB settings

## Optional Variables

### Server Configuration
```env
PORT=5000
NODE_ENV=production
```

### Frontend URLs (for CORS)
```env
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_URL=https://your-admin-domain.com
ALLOWED_ORIGINS=https://domain1.com,https://domain2.com
```

### OpenAI API (for AI question generation)
```env
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

### JWT Configuration
```env
JWT_EXPIRE=7d
```

### Logging
```env
LOG_REQUESTS=true
```

## Example .env File

```env
# ============================================
# REQUIRED - JWT Secret
# ============================================
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# ============================================
# Database - Choose ONE
# ============================================
# Option 1: Neon/Cloud PostgreSQL
NEON_DATABASE_URL=postgresql://neondb_owner:password@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Option 2: Local PostgreSQL (only used if NEON_DATABASE_URL is not set)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=mock_test_db
# DB_USER=postgres
# DB_PASSWORD=your_password

# ============================================
# Server Configuration
# ============================================
PORT=5000
NODE_ENV=production

# ============================================
# Frontend URLs (for CORS)
# ============================================
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_URL=https://your-admin-domain.com

# ============================================
# Optional - OpenAI API
# ============================================
# OPENAI_API_KEY=sk-your-openai-api-key
# OPENAI_MODEL=gpt-4o-mini

# ============================================
# Optional - JWT Expiration
# ============================================
JWT_EXPIRE=7d

# ============================================
# Optional - Logging
# ============================================
# LOG_REQUESTS=true
```

## URL Encoding for Connection Strings

If your password contains special characters, URL-encode them:

- `#` → `%23`
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `&` → `%26`
- `=` → `%3D`
- `%` → `%25`
- ` ` (space) → `%20`

**Example:**
```
Password: Peterase2586#
Encoded:  Peterase2586%23
```

## Verification

Check your environment configuration:

```bash
npm run check-env
```

## Security Notes

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Keep database credentials secure**
4. **Use environment variables** in deployment platforms
5. **Rotate secrets** periodically in production

## Troubleshooting

### Connection String Not Working

1. Verify the connection string format
2. Check for URL-encoded special characters
3. Ensure `?sslmode=require` is included for Neon
4. Test with: `npm run test-remote`

### Environment Variables Not Loading

1. Verify `.env` file is in `backend/` directory
2. Check for typos in variable names
3. Ensure no spaces around `=` sign
4. Remove quotes unless necessary
5. Restart the server after changes

