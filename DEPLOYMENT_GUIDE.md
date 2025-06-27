# Deployment Guide - HTTPS Frontend with HTTP Backend

## Problem
Your frontend is deployed on Vercel (HTTPS) but your backend runs on HTTP. Modern browsers block mixed content (HTTPS frontend calling HTTP backend) for security reasons.

## Solution: Vercel Proxy Configuration

### 1. Vercel Configuration (`vercel.json`)
The `vercel.json` file configures Vercel to proxy API calls from your HTTPS frontend to your HTTP backend:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "http://65.1.45.90/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, ngrok-skip-browser-warning"
        }
      ]
    }
  ]
}
```

### 2. API Configuration Updates
The production environment now uses relative URLs:

- **Development**: Direct HTTP calls to `http://65.1.45.90/`
- **Production**: Relative URLs (`/api/...`) that get proxied by Vercel

### 3. How It Works

1. **Frontend makes API call**: `fetch('/api/login')`
2. **Vercel proxy intercepts**: Rewrites to `http://65.1.45.90/api/login`
3. **Backend responds**: Through Vercel proxy back to frontend
4. **Browser sees HTTPS**: All communication appears to be HTTPS to the browser

## Deployment Steps

### 1. Deploy to Vercel
```bash
# Build the project
npm run build

# Deploy to Vercel (if using Vercel CLI)
vercel --prod

# Or push to your connected Git repository
git add .
git commit -m "Add Vercel proxy configuration for HTTPS/HTTP compatibility"
git push origin main
```

### 2. Verify Configuration
After deployment, check:

1. **Vercel Dashboard**: Ensure `vercel.json` is recognized
2. **Network Tab**: API calls should go to your domain, not the backend IP
3. **Console**: No mixed content warnings

### 3. Environment Variables (Optional)
You can also use environment variables for different deployments:

- `.env.production`: Production-specific settings
- `.env.development`: Development-specific settings

## Alternative Solutions

### Option 1: Enable HTTPS on Backend
If you can configure your backend server to support HTTPS:

1. Install SSL certificate on `65.1.45.90`
2. Update API configuration to use `https://65.1.45.90/`
3. Remove Vercel proxy configuration

### Option 2: Use Vercel Environment Variables
Set environment variables in Vercel dashboard:

- `VITE_API_BASE_URL`: Set to empty string for production
- `VITE_API_TIMEOUT`: Set timeout value

## Testing

### Local Development
```bash
npm run dev
# Uses vite.config.ts proxy for CORS handling
```

### Production Testing
1. Deploy to Vercel
2. Open browser developer tools
3. Check Network tab for API calls
4. Verify no mixed content errors in Console

## Troubleshooting

### Common Issues

1. **API calls fail**: Check Vercel function logs
2. **CORS errors**: Verify headers in `vercel.json`
3. **404 on API routes**: Ensure rewrite pattern matches your API structure

### Debug Steps

1. Check Vercel deployment logs
2. Test API endpoints directly: `https://your-app.vercel.app/api/health`
3. Verify backend is accessible: `curl http://65.1.45.90/api/health`

## Security Considerations

1. **CORS Headers**: Currently set to `*` for development - restrict in production
2. **API Authentication**: Ensure your backend validates tokens properly
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse

## Next Steps

1. Deploy the updated configuration
2. Test all API endpoints
3. Monitor for any issues
4. Consider migrating backend to HTTPS for better security
