# Netlify Deployment Checklist

## Environment Variables Set in Netlify Dashboard:
- [ ] VITE_SUPABASE_URL
- [ ] VITE_SUPABASE_ANON_KEY  
- [ ] VITE_APP_URL (set to your Netlify domain)
- [ ] VITE_GEMINI_API_KEY (when you get the key)
- [ ] VITE_STRIPE_PUBLISHABLE_KEY (when you get the key)

## Build Settings:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18 or higher

## Common Issues:
1. **Environment variables not set** → Add them in Netlify dashboard
2. **Wrong publish directory** → Should be `dist` for Vite
3. **Node version too old** → Set to Node 18+ in Netlify
4. **Missing dependencies** → Check package.json

## Debugging Steps:
1. Check Netlify build logs for errors
2. Open browser dev tools on deployed site
3. Look for console errors
4. Verify environment variables are loaded

## To Get API Keys:
- **Gemini**: https://makersuite.google.com/app/apikey
- **Stripe**: https://dashboard.stripe.com/apikeys