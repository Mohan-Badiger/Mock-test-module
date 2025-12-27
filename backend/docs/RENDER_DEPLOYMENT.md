# Render Deployment Guide

Complete guide for deploying the backend to Render.com.

## Prerequisites

1. GitHub repository with your code
2. Neon PostgreSQL database (or any PostgreSQL database)
3. Render account

## Step-by-Step Deployment

### 1. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your backend

### 2. Configure Build Settings

- **Name**: `mock-test-backend` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Root Directory**: Leave empty (or set to `backend` if your repo structure requires it)

### 3. Set Environment Variables

In the Render dashboard, go to "Environment" tab and add:

#### Required Variables

```env
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEON_DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

#### Optional Variables (Recommended)

```env
PORT=10000
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_URL=https://your-admin-domain.com
ALLOWED_ORIGINS=https://domain1.com,https://domain2.com
ALLOW_VERCEL=true
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
JWT_EXPIRE=7d
LOG_REQUESTS=true
```

**For Vercel Frontend**: If your frontend is deployed on Vercel, add:
```env
ALLOW_VERCEL=true
```
This automatically allows all `*.vercel.app` domains (including preview deployments).

### 4. Database Setup

#### Using Neon PostgreSQL (Recommended)

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to Render as `NEON_DATABASE_URL`

**Important**: Make sure the connection string includes `?sslmode=require`

#### Connection String Format

```
postgresql://username:password@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 5. Run Database Migrations

After deployment, you need to run migrations. You have two options:

#### Option A: SSH into Render instance (if available)

```bash
cd backend
npm run migrate
```

#### Option B: Create a one-time migration script

Create a script that runs migrations on first deploy, or run them manually via Render's shell.

### 6. CORS Configuration

The backend automatically handles CORS. For production:

1. Set `FRONTEND_URL` to your frontend domain
2. Set `ADMIN_URL` to your admin panel domain
3. Or set `ALLOWED_ORIGINS` for multiple domains

**Important**: If no CORS origins are configured, the backend will allow all origins (with a warning). This is for easier deployment but should be restricted in production.

### 7. Verify Deployment

1. Check the health endpoint:
   ```bash
   curl https://your-service.onrender.com/api/health
   ```

2. Expected response:
   ```json
   {
     "status": "OK",
     "message": "Server is running",
     "database": "connected",
     "timestamp": "...",
     "environment": "production"
   }
   ```

## Troubleshooting

### CORS Errors

**Error**: `Not allowed by CORS` or `No 'Access-Control-Allow-Origin' header`

**Solution**:
1. **For Vercel frontends**: Add `ALLOW_VERCEL=true` to automatically allow all `*.vercel.app` domains
2. **For specific domains**: Add `FRONTEND_URL` or add to `ALLOWED_ORIGINS`
3. Make sure the origin matches exactly (including `https://` and no trailing slash)
4. Check Render logs for the exact origin being rejected

**Quick Fixes**:
- **Vercel**: Set `ALLOW_VERCEL=true` to allow all Vercel domains
- **Any domain**: Temporarily allow all origins by not setting any CORS environment variables (the backend will allow all with a warning)
- **Specific URL**: Add to `ALLOWED_ORIGINS` like: `ALLOWED_ORIGINS=https://your-app.vercel.app`

### Database Connection Errors

**Error**: `Database connection refused` or `password authentication failed`

**Solution**:
1. Verify `NEON_DATABASE_URL` is set correctly in Render
2. Check that the connection string includes `?sslmode=require`
3. Ensure the database is accessible from Render's IP addresses
4. Check Neon dashboard to verify the database is running

**Test Connection**:
```bash
# In Render shell or locally
cd backend
npm run test-remote
```

### Port Configuration

Render automatically sets the `PORT` environment variable. Your code should use:
```javascript
const PORT = process.env.PORT || 5000;
```

The backend already handles this correctly.

### Build Failures

**Error**: Build command fails

**Solution**:
1. Check that `package.json` exists in the `backend/` directory
2. Verify all dependencies are listed in `package.json`
3. Check Render logs for specific error messages
4. Ensure Node.js version is compatible (16+)

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` (32+ characters)
- [ ] `NEON_DATABASE_URL` or `DATABASE_URL`
- [ ] `FRONTEND_URL` (for CORS)
- [ ] `ADMIN_URL` (for CORS, if using admin panel)
- [ ] `OPENAI_API_KEY` (if using AI features)

## Post-Deployment

1. **Test the API**: Use Postman or curl to test endpoints
2. **Check Logs**: Monitor Render logs for errors
3. **Database Migrations**: Run migrations if not done automatically
4. **Health Check**: Set up monitoring for `/api/health` endpoint

## Monitoring

### Health Check Endpoint

Monitor: `GET /api/health`

This endpoint returns:
- Server status
- Database connection status
- Environment information

### Logs

Access logs in Render dashboard:
1. Go to your service
2. Click "Logs" tab
3. Monitor for errors and warnings

## Security Recommendations

1. **CORS**: Restrict to specific domains in production
2. **JWT Secret**: Use a strong, random secret (32+ characters)
3. **Database**: Use SSL connections (included in Neon connection strings)
4. **Environment Variables**: Never commit secrets to Git
5. **HTTPS**: Render provides HTTPS automatically

## Common Issues

### Issue: Server starts but database queries fail

**Cause**: Database connection string incorrect or database not accessible

**Solution**: 
1. Verify `NEON_DATABASE_URL` in Render dashboard
2. Test connection with `npm run test-remote`
3. Check Neon dashboard for database status

### Issue: CORS errors from frontend

**Cause**: Frontend origin not in allowed list

**Solution**:
1. Add frontend URL to `FRONTEND_URL` or `ALLOWED_ORIGINS`
2. Restart the service after updating environment variables
3. Check that origin matches exactly (protocol, domain, port)

### Issue: 503 errors on health check

**Cause**: Database connection failed

**Solution**:
1. Check database connection string
2. Verify database is running
3. Check network connectivity from Render to database

## Support

For Render-specific issues, check:
- [Render Documentation](https://render.com/docs)
- [Render Status Page](https://status.render.com)

For application issues, check:
- Application logs in Render dashboard
- Database connection logs
- CORS configuration

