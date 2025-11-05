# CustodyX.AI Multi-User SaaS Setup Guide

This guide will help you transform the single-user CustodyX.AI application into a full multi-user SaaS platform.

## Prerequisites

- Node.js (v18 or higher)
- A Supabase account
- A Stripe account
- Netlify account (for deployment)
- Google Cloud account (for Gemini AI API)

## 1. Backend Setup (Supabase)

### Create Supabase Project
1. Go to [Supabase](https://supabase.com) and create a new project
2. Note down your Project URL and API Keys

### Run Database Migrations
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Run migrations: `supabase db push`

### Set up Authentication
1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Email provider
3. Enable Google OAuth (optional but recommended):
   - Get Google OAuth credentials from Google Cloud Console
   - Add them to Supabase Auth settings

### Configure Row Level Security
The migration script automatically sets up RLS policies, but verify they're active:
- Go to Authentication > Policies in Supabase Dashboard
- Ensure all tables have appropriate policies enabled

## 2. Stripe Setup

### Create Products and Prices
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products for "Plus" and "Pro" tiers
3. Create monthly/yearly prices for each product
4. Update `lib/stripe/config.ts` with your actual price IDs

### Set up Webhooks
1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-app.netlify.app/.netlify/functions/stripe-webhook`
3. Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret

## 3. Environment Variables

Create a `.env` file in your project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# App
VITE_APP_URL=http://localhost:3000
```

## 4. Install Dependencies

```bash
npm install
```

This will install all the new dependencies including:
- Supabase client
- Stripe
- Auth UI components
- State management
- Toast notifications

## 5. Replace the App Component

1. Backup your current `App.tsx`: `mv App.tsx App-old.tsx`
2. Rename the new app: `mv App-new.tsx App.tsx`
3. Update your `index.tsx` if needed

## 6. Update Existing Components (if needed)

Some components may need minor updates to work with the new data flow:
- Remove any direct localStorage usage
- Use the Zustand store instead of props for data
- Ensure components handle loading states

## 7. Deploy to Netlify

1. Build your app: `npm run build`
2. Deploy to Netlify (connect your Git repo)
3. Add all environment variables in Netlify's site settings
4. Enable Netlify Functions (should be automatic)

## 8. Configure Supabase Storage (for file uploads)

1. In Supabase Dashboard, go to Storage
2. Create a bucket named "documents"
3. Set up RLS policies for the bucket:

```sql
-- Allow users to upload files
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view own files
CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete own files
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 9. Testing

### Test Authentication
1. Register a new account
2. Verify email confirmation works
3. Test Google OAuth (if enabled)
4. Test sign out and sign in

### Test Subscriptions
1. Use Stripe test mode
2. Test subscription creation with test cards
3. Test webhook delivery
4. Verify subscription updates in Supabase

### Test Data Isolation
1. Create multiple test accounts
2. Verify users can only see their own data
3. Test all CRUD operations

## 10. Production Considerations

### Security
- Enable 2FA on all service accounts
- Use strong, unique passwords
- Regular security audits
- Monitor error logs

### Performance
- Enable Supabase connection pooling
- Optimize database queries
- Implement caching where appropriate
- Monitor Stripe webhook performance

### Compliance
- Implement GDPR data export/deletion
- Add privacy policy and terms of service
- Set up audit logging
- Regular backups

### Monitoring
- Set up error tracking (Sentry)
- Monitor Stripe webhooks
- Track user engagement
- Monitor API usage

## Migration from Single-User Version

If you have existing users with localStorage data:

1. Create a migration tool to export localStorage data
2. Provide an import feature for new authenticated users
3. Consider a transition period where both systems work
4. Communicate changes to existing users

## Support Features to Add

1. **Customer Support**
   - Help desk integration
   - In-app messaging
   - Knowledge base

2. **Analytics**
   - User engagement tracking
   - Feature usage analytics
   - Revenue analytics

3. **Advanced Features**
   - Team/family plans
   - White-label options
   - API for third-party integrations

## Troubleshooting

### Common Issues

1. **RLS Policies Not Working**
   - Check that RLS is enabled on all tables
   - Verify auth context in policies
   - Test with different user accounts

2. **Stripe Webhooks Failing**
   - Verify webhook URL is correct
   - Check webhook signing secret
   - Monitor Netlify function logs

3. **Auth Issues**
   - Verify Supabase auth settings
   - Check redirect URLs
   - Ensure environment variables are set

4. **File Upload Issues**
   - Check Supabase storage policies
   - Verify bucket configuration
   - Monitor file size limits

## Next Steps

After successful deployment:

1. Set up monitoring and alerting
2. Create user documentation
3. Plan feature roadmap
4. Set up customer support
5. Implement analytics
6. Consider mobile app development

This transformation gives you a complete multi-user SaaS platform with:
- User authentication and authorization
- Subscription management
- Data isolation and security
- Scalable architecture
- Payment processing
- Audit logging
- Cloud file storage

The application is now ready for production use with multiple paying customers.