# Render Deployment Fixes

## Issues Fixed

### 1. CORS Error ✅

**Problem**: `Error: Not allowed by CORS` on Render

**Solution**: 
- Updated CORS to allow requests without origin (Postman, curl, etc.)
- Added automatic detection of Render environment
- Made CORS more permissive when no origins are configured
- Added better error logging

**What to do on Render**:
1. Set `FRONTEND_URL` environment variable (optional but recommended)
2. Set `ADMIN_URL` environment variable (optional but recommended)
3. Or set `ALLOWED_ORIGINS` for multiple domains

**Note**: If no CORS origins are set, the backend will allow all origins (with a warning). This is for easier deployment.

### 2. Database Connection Error ✅

**Problem**: `Database connection refused` when testing with Postman

**Solution**:
- Added database connection test on startup
- Improved error messages for database connection issues
- Added connection verification before server starts
- Better handling of connection failures

**What to do on Render**:
1. **CRITICAL**: Set `NEON_DATABASE_URL` environment variable in Render dashboard
2. Make sure the connection string includes `?sslmode=require`
3. Verify the database is accessible from Render

## Required Environment Variables on Render

### Minimum Required

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

### Recommended

```env
PORT=10000
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_URL=https://your-admin-domain.com
ALLOW_VERCEL=true
```

**For Vercel Frontend**: If your frontend is on Vercel, add:
```env
ALLOW_VERCEL=true
```
This will allow all `*.vercel.app` domains automatically.

Or add your specific Vercel URL:
```env
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-xyz123.vercel.app
```

## Quick Setup Steps

1. **In Render Dashboard**:
   - Go to your Web Service
   - Click "Environment" tab
   - Add all required environment variables
   - Save and redeploy

2. **Verify Database Connection**:
   - Check Render logs for: `✅ Connected to Neon/Cloud PostgreSQL database`
   - If you see errors, check `NEON_DATABASE_URL` is correct

3. **Test CORS**:
   - Try accessing `/api/health` from your frontend
   - Check Render logs for CORS warnings
   - If CORS errors persist, add your frontend URL to `FRONTEND_URL`

## Testing

### Test Database Connection

```bash
curl https://your-service.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "database": "connected"
}
```

### Test CORS

From your frontend, make a request to:
```
https://your-service.onrender.com/api/health
```

If CORS is working, you'll get a response. If not, check Render logs.

## Common Issues

### Still getting CORS errors?

1. Check Render logs for the exact origin being rejected
2. Make sure `FRONTEND_URL` matches exactly (including `https://`)
3. Restart the service after updating environment variables

### Still getting database errors?

1. Verify `NEON_DATABASE_URL` is set correctly
2. Check that connection string includes `?sslmode=require`
3. Verify database is running in Neon dashboard
4. Check Render logs for specific error messages

## Need Help?

Check the detailed guide: `docs/RENDER_DEPLOYMENT.md`

