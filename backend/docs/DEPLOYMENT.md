# Backend Deployment Guide

## Prerequisites

- Node.js 16+ installed
- PostgreSQL database (Neon or local)
- Environment variables configured

## Environment Variables

For complete environment variable documentation, see [ENVIRONMENT.md](./ENVIRONMENT.md).

**Quick Setup:**
1. Copy `.env.example` to `.env`
2. Configure required variables (JWT_SECRET and Database connection)
3. Set optional variables as needed

**Required:**
- `JWT_SECRET` - Minimum 32 characters
- Database connection (either `NEON_DATABASE_URL`/`DATABASE_URL` OR local DB settings)

**Recommended for Production:**
- `NODE_ENV=production`
- `FRONTEND_URL` and `ADMIN_URL` for CORS
- `OPENAI_API_KEY` if using AI question generation

## Deployment Steps

### 1. Install Dependencies

```bash
cd backend
npm install --production
```

### 2. Run Database Migrations

```bash
npm run migrate
```

### 3. Set Environment Variables

Ensure all required environment variables are set in your deployment platform.

### 4. Start the Server

**Production:**
```bash
npm start
```

**Development:**
```bash
npm run dev
```

## Platform-Specific Deployment

### Heroku

1. Create `Procfile`:
```
web: node server.js
```

2. Set environment variables in Heroku dashboard or CLI:
```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set NEON_DATABASE_URL=your-connection-string
```

3. Deploy:
```bash
git push heroku main
```

### Railway

1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Railway will auto-detect and deploy

### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in dashboard

### Vercel / Netlify Functions

For serverless deployment, you may need to adapt the code structure.

## Health Check

After deployment, verify the server is running:

```bash
curl https://your-api-domain.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "connected",
  "timestamp": "2025-11-08T...",
  "environment": "production"
}
```

## Security Checklist

- [ ] JWT_SECRET is set and is at least 32 characters long
- [ ] Database connection string is secure (not exposed in logs)
- [ ] CORS is configured with specific allowed origins
- [ ] NODE_ENV is set to "production"
- [ ] All sensitive data is in environment variables
- [ ] HTTPS is enabled (if using custom domain)
- [ ] Rate limiting is considered (add if needed)
- [ ] Database credentials are secure

## Monitoring

### Health Check Endpoint

Monitor: `GET /api/health`

This endpoint checks:
- Server status
- Database connectivity
- Returns 503 if database is unavailable

### Logs

In production, monitor:
- Application logs
- Database connection errors
- Unhandled exceptions
- Request/response times

## Troubleshooting

### Database Connection Issues

1. Verify connection string is correct
2. Check if database is accessible from deployment platform
3. Verify SSL settings for cloud databases
4. Check firewall/network settings

### CORS Issues

1. Verify FRONTEND_URL and ADMIN_URL are set correctly
2. Check ALLOWED_ORIGINS if using multiple domains
3. Ensure credentials: true is set in frontend requests

### Environment Variables Not Loading

1. Verify .env file exists (for local)
2. Check deployment platform's environment variable settings
3. Restart the server after changing environment variables

## Performance Optimization

1. **Database Connection Pooling**: Already configured (max: 20 connections)
2. **Request Size Limits**: Set to 10mb
3. **Connection Timeouts**: Configured for cloud databases
4. **Graceful Shutdown**: Implemented for zero-downtime deployments

## Scaling Considerations

- Database connection pool size (currently 20)
- Consider read replicas for high traffic
- Implement caching for frequently accessed data
- Add rate limiting for API endpoints
- Monitor database query performance

