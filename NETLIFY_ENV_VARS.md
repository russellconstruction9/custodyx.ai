# Netlify Environment Variables

Copy these environment variables to your Netlify dashboard (Site Settings → Environment Variables):

## Essential Variables (Required)
```
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
VITE_APP_URL=https://your-app-name.netlify.app
```

## AI Features (Required for Gemini)
```
GEMINI_API_KEY=your_actual_gemini_api_key
```

## Payment Features (Required for Stripe)
```
VITE_STRIPE_PUBLISHABLE_KEY=your_actual_stripe_publishable_key
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

## Important Notes:
- Replace "your-app-name" in VITE_APP_URL with your actual Netlify site name
- Keep all keys secure and never commit them to your repository
- Use test keys for development, live keys for production