# Netlify Environment Variables

Copy these environment variables to your Netlify dashboard (Site Settings → Environment Variables):

## Client-Side Variables (Public - will be embedded in build)
```
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_actual_stripe_publishable_key
VITE_APP_URL=https://your-app-name.netlify.app
```

## Server-Side Variables (Private - only for Netlify functions)
```
GEMINI_API_KEY=your_actual_gemini_api_key
STRIPE_SECRET_KEY=your_actual_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_actual_stripe_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_actual_supabase_service_role_key
```

## Where to Get These Keys:

### Supabase Keys:
1. Go to your Supabase project dashboard
2. Go to Settings → API
3. Copy the Project URL and anon/public key
4. For service role key, copy the service_role key (keep this secret!)

### Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key

### Stripe Keys:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your publishable key and secret key
3. For webhook secret, create a webhook endpoint first, then copy the signing secret

## Important Security Notes:
- **VITE_** prefixed variables are PUBLIC and embedded in your build - only use them for non-sensitive data
- **Supabase anon key** and **Stripe publishable key** are SAFE to be public (they're designed for client-side use)
- **Never use VITE_** prefix for sensitive keys like secret keys or private API keys
- Replace "your-app-name" in VITE_APP_URL with your actual Netlify site name
- Keep all non-VITE keys secure and never commit them to your repository
- Use test keys for development, live keys for production