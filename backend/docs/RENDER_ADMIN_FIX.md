# Fix 404 Error for Admin Login on Render

## Problem
Getting `404 (Not Found)` when trying to access `/api/admin/auth/login` on Render.

## Solution

### Step 1: Verify Render Auto-Deployment

1. Go to your Render dashboard: https://dashboard.render.com
2. Check if your backend service has auto-deployed the latest changes
3. If not, manually trigger a deployment:
   - Click on your backend service
   - Go to "Manual Deploy" → "Deploy latest commit"

### Step 2: Verify Route is Registered

The route should be registered in `backend/server.js`:

```javascript
app.use('/api/admin/auth', adminAuthRoutes); // Admin auth routes (no auth required)
```

### Step 3: Check Render Logs

1. Go to your Render dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for any errors during startup
5. Check if you see: `Server is running on port...`

### Step 4: Verify Files are Deployed

Make sure these files exist in your Render deployment:
- `backend/routes/adminAuthRoutes.js`
- `backend/controllers/adminAuthController.js`
- `backend/middleware/adminAuth.js`

### Step 5: Test the Endpoint

After deployment, test the endpoint:

```bash
curl -X POST https://ai-powered-skill-based-mock-tests-module.onrender.com/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'
```

You should get a `400` error (missing credentials), not a `404` error.

### Step 6: Restart the Service

If the route still doesn't work:
1. Go to Render dashboard
2. Click on your backend service
3. Click "Manual Deploy" → "Clear build cache & deploy"

## Quick Checklist

- [ ] Code is pushed to GitHub
- [ ] Render has auto-deployed (or manually deployed)
- [ ] No errors in Render logs
- [ ] Endpoint returns 400 (not 404) when testing with empty body
- [ ] Admins table exists in database (run migration)
- [ ] Admin account exists in database

## Common Issues

### Issue 1: Route Not Found (404)
**Cause:** Files not deployed or route not registered
**Fix:** 
1. Verify files are in GitHub
2. Trigger manual deployment on Render
3. Check server.js has the route

### Issue 2: Database Error
**Cause:** Admins table doesn't exist
**Fix:** Run the migration on your Neon database

### Issue 3: CORS Error
**Cause:** Vercel domain not allowed
**Fix:** Add `ALLOW_VERCEL=true` to Render environment variables

## Still Not Working?

1. Check Render build logs for any errors
2. Verify the route path matches exactly: `/api/admin/auth/login`
3. Test with curl to see the exact error
4. Check if the server is running (health endpoint: `/api/health`)

