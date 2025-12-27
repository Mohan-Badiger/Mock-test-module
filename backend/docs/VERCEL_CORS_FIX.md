# Quick Fix: Vercel CORS Error

## Problem
Your Vercel frontend is getting CORS errors when trying to access the Render backend.

**Error**: `Access to XMLHttpRequest at 'https://ai-powered-skill-based-mock-tests-module.onrender.com/api/tests' from origin 'https://ai-powered-skill-based-mock-tests-module-frontend-1wkdi1ozy.vercel.app' has been blocked by CORS policy`

## Solution

### Option 1: Allow All Vercel Domains (Easiest) ✅

In your **Render Dashboard**:
1. Go to your Web Service
2. Click "Environment" tab
3. Add this environment variable:
   ```
   ALLOW_VERCEL=true
   ```
4. Save and redeploy

This will automatically allow **all** `*.vercel.app` domains, including:
- Production deployments
- Preview deployments
- Branch deployments

### Option 2: Add Specific Vercel URL

If you only want to allow specific Vercel URLs:

1. In Render Dashboard → Environment tab
2. Add or update:
   ```
   ALLOWED_ORIGINS=https://ai-powered-skill-based-mock-tests-module-frontend-1wkdi1ozy.vercel.app
   ```
3. Save and redeploy

**Note**: If you have multiple Vercel URLs (production + previews), use Option 1.

### Option 3: Use FRONTEND_URL

1. In Render Dashboard → Environment tab
2. Add:
   ```
   FRONTEND_URL=https://ai-powered-skill-based-mock-tests-module-frontend-1wkdi1ozy.vercel.app
   ```
3. Save and redeploy

## After Adding the Environment Variable

1. **Save** the environment variable in Render
2. **Redeploy** your service (Render will auto-redeploy when you save env vars)
3. **Wait** for deployment to complete (usually 1-2 minutes)
4. **Test** your frontend again

## Verify It's Working

Check Render logs for:
```
✅ Vercel domains (*.vercel.app) are allowed
```

Or test from your frontend - the CORS error should be gone!

## Why This Happens

Vercel uses different subdomains for each deployment:
- Production: `your-app.vercel.app`
- Preview: `your-app-xyz123.vercel.app`
- Branch: `your-app-git-branch.vercel.app`

The backend needs to explicitly allow these domains. Setting `ALLOW_VERCEL=true` automatically allows all of them.

## Still Having Issues?

1. Check Render logs for CORS warnings
2. Verify the environment variable is set correctly
3. Make sure you redeployed after adding the variable
4. Check that your frontend is using the correct backend URL

