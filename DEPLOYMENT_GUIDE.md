# Production deployment checklist for Netlify

## 🚀 Pre-deployment Steps

### 1. Build and Test Locally
```bash
npm install
npm run build
npm run preview
```

### 2. Commit and Push to GitHub
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

## 🔧 Netlify Configuration

### Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`
- **Node version**: 18

### Environment Variables (Add in Netlify Dashboard)

#### Required for Basic Functionality
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `VITE_APP_URL` - Your Netlify app URL (e.g., https://yourapp.netlify.app)

#### Required for AI Features
- `GEMINI_API_KEY` - Server-side Gemini API key (for Netlify functions)

#### Required for Payment Features
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (client-side)
- `STRIPE_SECRET_KEY` - Stripe secret key (server-side)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for server operations)

## 📝 Deployment Steps

### 1. Connect to Netlify
1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Select the repository `custodyx.ai`

### 2. Configure Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions` (auto-detected from netlify.toml)

### 3. Add Environment Variables
In Netlify Dashboard → Site Settings → Environment Variables, add all the variables listed above.

### 4. Configure Domain (Optional)
- Add custom domain if you have one
- Enable HTTPS (automatic with Netlify)

## 🔐 Security Checklist

- [ ] All environment variables added to Netlify (not committed to repo)
- [ ] Stripe webhook endpoint configured to point to your Netlify functions
- [ ] Supabase RLS policies configured
- [ ] CORS settings configured in Supabase for your domain

## 🚨 Post-Deployment Tasks

### 1. Configure Stripe Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourapp.netlify.app/.netlify/functions/stripe-webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, etc.
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` env var

### 2. Update Supabase Settings
1. Add your Netlify domain to allowed origins in Supabase
2. Update authentication redirect URLs if using OAuth

### 3. Test Critical Paths
- [ ] User registration/login
- [ ] AI chat functionality
- [ ] Subscription flow
- [ ] Document upload/analysis

## 🔍 Troubleshooting

### Common Issues:
1. **Build fails**: Check Node version (should be 18+)
2. **Functions not working**: Verify environment variables are set
3. **CORS errors**: Check Supabase allowed origins
4. **Stripe webhooks fail**: Verify webhook URL and signing secret
5. **AI not working**: Check Gemini API key is set correctly

### Debug Commands:
```bash
# Check build locally
npm run build

# Test functions locally (if you have Netlify CLI)
netlify dev

# Check environment variables are loading
console.log(import.meta.env.VITE_SUPABASE_URL)
```