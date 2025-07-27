# 🔧 CORS Fix Guide

## Current Issue
```
Access to XMLHttpRequest at 'https://trendy-games-api.up.railway.app/socket.io/?EIO=4&transport=polling&t=ru3h62uq' 
from origin 'https://trendy-games-io.vercel.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Quick Fix Steps

### 1. Update Railway Environment Variables

1. Go to [Railway Dashboard](https://railway.app)
2. Select your backend project (`trendy-games-api`)
3. Click on **Variables** tab
4. Add/Update these variables:

```bash
CLIENT_URL=https://trendy-games-io.vercel.app
NODE_ENV=production
PORT=3001
```

**Important**: Make sure there are NO trailing slashes in CLIENT_URL

### 2. Update Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your frontend project (`trendy-games-io`)
3. Go to **Settings** → **Environment Variables**
4. Add/Update:

```bash
VITE_BACKEND_URL=https://trendy-games-api.up.railway.app
```

### 3. Redeploy Both Services

**Railway (Backend):**
- After updating environment variables, Railway should auto-redeploy
- Check the deployment logs for: `🚀 Server starting with environment:`

**Vercel (Frontend):**
1. Go to **Deployments** tab
2. Click the 3-dot menu on latest deployment
3. Click **Redeploy**

### 4. Verify the Fix

After redeployment, check:

1. **Backend Logs** (Railway Dashboard → Logs):
   ```
   🚀 Server starting with environment:
      NODE_ENV: production
      CLIENT_URL: https://trendy-games-io.vercel.app
      PORT: 3001
   🌐 Production CORS origins: ["https://trendy-games-io.vercel.app", "https://trendy-games-io.vercel.app/"]
   ```

2. **Frontend Console** (Browser Dev Tools):
   ```
   🔌 Attempting to connect to: https://trendy-games-api.up.railway.app
   🌐 VITE_BACKEND_URL: https://trendy-games-api.up.railway.app
   Socket connected: abc123
   ```

3. **No CORS Errors**: Check that the CORS error is gone

## Alternative: Manual Environment Variable Commands

If using Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and set variables
railway login
railway variables set CLIENT_URL=https://trendy-games-io.vercel.app
railway variables set NODE_ENV=production
railway variables set PORT=3001
```

## Test CORS Manually

Test your backend CORS with curl:

```bash
curl -H "Origin: https://trendy-games-io.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://trendy-games-api.up.railway.app/health
```

Should return headers including:
```
Access-Control-Allow-Origin: https://trendy-games-io.vercel.app
```

## Common Issues

### Issue: Still getting CORS errors
**Solution**: 
- Double-check environment variables (no typos)
- Ensure both services redeployed after env var changes
- Check Railway logs for correct CLIENT_URL

### Issue: Environment variables not updating
**Solution**:
- Clear browser cache
- Hard refresh (Ctrl+F5)
- Check Vercel deployment logs

### Issue: Socket.IO still failing
**Solution**:
- Verify both HTTP and WebSocket requests are allowed
- Check that transports are properly configured

## Expected Timeline
- Environment variable updates: 1-2 minutes
- Railway redeploy: 2-3 minutes  
- Vercel redeploy: 1-2 minutes
- Total fix time: 5-10 minutes

Your CORS issue should be resolved after following these steps! 🚀