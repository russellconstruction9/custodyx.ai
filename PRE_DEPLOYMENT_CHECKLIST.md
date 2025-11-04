# Pre-Deployment Checklist

## ✅ Code Preparation

- [ ] All code committed to GitHub repository
- [ ] No sensitive information in code (API keys, passwords, etc.)
- [ ] Environment variables properly configured using `import.meta.env.VITE_*` pattern
- [ ] Netlify functions tested locally
- [ ] Build command runs successfully: `npm run build`

## ✅ Environment Variables Setup

- [ ] VITE_SUPABASE_URL configured
- [ ] VITE_SUPABASE_ANON_KEY configured  
- [ ] VITE_APP_URL configured (will be your Netlify domain)
- [ ] GEMINI_API_KEY configured (server-side for functions)
- [ ] VITE_STRIPE_PUBLISHABLE_KEY configured (if using payments)
- [ ] STRIPE_SECRET_KEY configured (server-side for functions)
- [ ] STRIPE_WEBHOOK_SECRET configured (from Stripe webhook setup)
- [ ] SUPABASE_SERVICE_ROLE_KEY configured (for server operations)

## ✅ External Services Setup

### Supabase
- [ ] Database migrations applied
- [ ] RLS policies configured
- [ ] Domain added to allowed origins
- [ ] Service role key available

### Stripe (if using payments)
- [ ] Products and prices created
- [ ] Webhook endpoint configured
- [ ] Price IDs updated in code

### Google Gemini AI
- [ ] API key obtained from Google AI Studio

## ✅ Build Configuration

- [ ] `netlify.toml` file present with correct configuration
- [ ] `package.json` scripts working correctly
- [ ] Node version compatible (18+)
- [ ] All dependencies properly listed

## ✅ Security Checklist

- [ ] Content Security Policy configured
- [ ] Security headers set in netlify.toml
- [ ] Environment variables not committed to repository
- [ ] HTTPS enforced (automatic with Netlify)

## 🚀 Ready to Deploy!

Once all items are checked, you can:
1. Push to GitHub
2. Connect to Netlify
3. Configure environment variables
4. Deploy!