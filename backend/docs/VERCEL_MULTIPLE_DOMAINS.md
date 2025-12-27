# Fixing CORS for Multiple Vercel Domains

## Problem

You have multiple Vercel domains and one works but the other doesn't:

- ✅ `ai-powered-skill-based-mock-tests-module-frontend-65q21hzts.vercel.app` - Works
- ❌ `ai-powered-skill-based-mock-tests-m.vercel.app` - CORS Error

## Solution

### Option 1: Allow All Vercel Domains (Recommended) ✅

This is the easiest solution and will work for all your Vercel domains (production, preview, custom domains).

**In Render Dashboard:**
1. Go to your Web Service
2. Click "Environment" tab
3. Add or update:
   ```
   ALLOW_VERCEL=true
   ```
4. Save and redeploy

This will automatically allow **all** `*.vercel.app` domains.

### Option 2: Add All Domains to ALLOWED_ORIGINS

If you want to be more specific:

**In Render Dashboard:**
1. Go to Environment tab
2. Add or update:
   ```
   ALLOWED_ORIGINS=https://ai-powered-skill-based-mock-tests-module-frontend-65q21hzts.vercel.app,https://ai-powered-skill-based-mock-tests-m.vercel.app
   ```
3. Save and redeploy

**Note**: You'll need to add each new preview deployment URL manually with this approach.

### Option 3: Use FRONTEND_URL for Primary Domain

If you have a primary domain:

**In Render Dashboard:**
1. Go to Environment tab
2. Add:
   ```
   FRONTEND_URL=https://ai-powered-skill-based-mock-tests-m.vercel.app
   ALLOW_VERCEL=true
   ```
3. Save and redeploy

This sets your primary domain and allows all other Vercel domains.

## Why This Happens

Vercel creates different domains for:
- **Production**: Your main domain (e.g., `ai-powered-skill-based-mock-tests-m.vercel.app`)
- **Preview Deployments**: Unique URLs for each deployment (e.g., `ai-powered-skill-based-mock-tests-module-frontend-65q21hzts.vercel.app`)

If only one domain is in the allowed list, the other will be blocked by CORS.

## Verify It's Working

After setting `ALLOW_VERCEL=true` and redeploying:

1. Check Render logs for:
   ```
   ✅ Vercel domains (*.vercel.app) are allowed
   ```

2. Test both domains - they should both work without CORS errors.

3. Check Render logs when accessing from the second domain - you should see:
   ```
   ✅ Allowing Vercel domain: https://ai-powered-skill-based-mock-tests-m.vercel.app
   ```

## Troubleshooting

### Still Getting CORS Errors?

1. **Verify the environment variable is set**:
   - Check Render dashboard → Environment tab
   - Make sure `ALLOW_VERCEL=true` (not `ALLOW_VERCEL=true ` with spaces)

2. **Redeploy after adding the variable**:
   - Render should auto-redeploy, but you can manually trigger a redeploy

3. **Check Render logs**:
   - Look for the CORS warning message
   - It will show which origin was rejected and why

4. **Clear browser cache**:
   - Sometimes browsers cache CORS responses
   - Try incognito/private mode

### Domain Not Recognized as Vercel?

If a domain ends with `.vercel.app` but still gets blocked:

1. Check Render logs for: `Is Vercel domain: true/false`
2. If it shows `false`, there might be a typo in the domain
3. Make sure the domain includes `https://` in the origin header

## Best Practice

**For production**, use:
```env
ALLOW_VERCEL=true
FRONTEND_URL=https://your-primary-domain.vercel.app
```

This allows all Vercel domains while also explicitly setting your primary domain.

