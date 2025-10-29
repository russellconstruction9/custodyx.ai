# CustodyX.AI - Supabase SaaS Deployment Guide

## Overview

The app has been converted from a local-only app to a multi-tenant SaaS with:
- **Supabase Auth** for user authentication
- **Supabase Database** with Row Level Security for data isolation
- **Supabase Edge Functions** to securely proxy Gemini API calls
- **Real-time messaging** between co-parents

## Prerequisites

1. Supabase account: https://supabase.com
2. Supabase Project URL: `https://xidaoszvrdgttvgrntfe.supabase.co`
3. Gemini API Key: `AIzaSyCvMT78j9HFFiM9xJ08p9A-kkLerZoCY8k`

## Step 1: Run Database Migrations

In your Supabase Dashboard (https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe):

1. Go to **SQL Editor**
2. Run the migration files in order:
   - First: `supabase/migrations/20250129000001_create_core_tables.sql`
   - Second: `supabase/migrations/20250129000002_row_level_security.sql`

## Step 2: Deploy Edge Functions

### Install Supabase CLI

```bash
npm install supabase --save-dev
npx supabase login
```

### Link to your project

```bash
npx supabase link --project-ref xidaoszvrdgttvgrntfe
```

### Set Gemini API Key as a secret

```bash
npx supabase secrets set GEMINI_API_KEY=AIzaSyCvMT78j9HFFiM9xJ08p9A-kkLerZoCY8k
```

### Deploy all edge functions

```bash
npx supabase functions deploy gemini-chat
npx supabase functions deploy gemini-generate-report
npx supabase functions deploy gemini-legal-assistant
npx supabase functions deploy gemini-analyze-incident
```

## Step 3: Enable Realtime

In Supabase Dashboard:

1. Go to **Database** → **Replication**
2. Enable replication for the `messages` table

## Step 4: Configure Authentication

In Supabase Dashboard → **Authentication** → **Settings**:

1. Enable Email provider
2. Set Site URL to your production URL (or `http://localhost:3000` for dev)
3. Add redirect URLs if needed

## Step 5: Update the App to Use Edge Functions

Once edge functions are deployed, update `src/services/geminiService.ts` to use the functions instead of direct API calls. The template is in `src/services/geminiEdgeFunctions.ts`.

## Current State

✅ Database schema created  
✅ Row Level Security policies configured  
✅ Edge Functions created (need to be deployed)  
✅ App updated to use Supabase for auth and data  
✅ Real-time messaging configured  
⏳ Edge Functions need to be deployed to Supabase  
⏳ Stripe billing integration (optional)  

## Testing Locally

```bash
npm run dev
```

1. Sign up with email/password
2. Complete your profile
3. Start logging incidents
4. Invite co-parent (future feature)

## Data Model

### Subscriptions
- Each subscription represents one co-parenting relationship
- Can have 2 users (Mother & Father)
- Supports Free, Plus, and Pro plans

### User Profiles
- Linked to Supabase Auth
- Belongs to one subscription
- Has role (Mother/Father)
- Can invite co-parent

### Reports, Documents, Templates, Messages
- All scoped to subscription_id
- Both co-parents can view
- Creator can edit/delete their own

## Security

- API key secured in Supabase Edge Functions (not exposed to client)
- Row Level Security enforces data isolation
- Users can only access data within their subscription
- Real-time subscriptions filtered by subscription_id

## Next Steps

1. Deploy Edge Functions (see Step 2)
2. Add co-parent invitation flow
3. Add Stripe billing integration
4. Add email notifications
5. Add data export feature
6. Add admin dashboard

## Troubleshooting

### "Invalid API key" error
Make sure the GEMINI_API_KEY secret is set in Supabase

### Can't see other parent's data
Check that both users have the same `subscription_id`

### Real-time messages not working
Ensure replication is enabled for the `messages` table

## Support

For issues or questions, check the Supabase documentation:
- Auth: https://supabase.com/docs/guides/auth
- Database: https://supabase.com/docs/guides/database
- Edge Functions: https://supabase.com/docs/guides/functions

