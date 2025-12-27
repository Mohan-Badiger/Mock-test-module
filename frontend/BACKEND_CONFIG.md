# Backend Configuration

The frontend is configured to automatically use the local backend if the remote backend is not available.

## How It Works

1. **Development Mode:**
   - First tries to connect to remote backend: `https://ai-powered-skill-based-mock-tests-module.onrender.com/api`
   - If remote backend is not available (connection timeout/refused), automatically switches to local backend
   - Local backend: `http://localhost:5000/api`

2. **Production Build:**
   - Automatically uses remote/production backend URL

3. **Manual Override:**
   - You can force local backend by running in browser console:
     ```javascript
     localStorage.setItem('useLocalAPI', 'true');
     location.reload();
     ```
   - To switch back to remote:
     ```javascript
     localStorage.setItem('useLocalAPI', 'false');
     location.reload();
     ```

## Environment Variables

You can also set `VITE_API_URL` in a `.env` file to explicitly set the backend URL:

```env
VITE_API_URL=https://ai-powered-skill-based-mock-tests-module.onrender.com/api
```

## Automatic Fallback

The API client includes:
- **Health check on startup** - Tests remote backend availability
- **Error interceptor** - If a request fails with network error, automatically retries with local backend
- **Console logging** - Shows which backend is being used

## Console Messages

- `✅ Using remote backend: https://ai-powered-skill-based-mock-tests-module.onrender.com/api` - Using remote backend
- `⚠️ Remote backend not available, switching to local backend` - Switching to local
- `✅ Using local backend: http://localhost:5000/api` - Using local backend

