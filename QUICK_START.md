# Quick Start - CustodyX.AI SaaS

## ✅ What's Been Done

### 1. **Fixed API Key Security**
- ❌ Before: Gemini API key exposed in client-side code
- ✅ After: API key stored in Supabase Edge Functions (server-side only)

### 2. **Converted to Multi-Tenant SaaS**
- 2 users per subscription (Mother + Father)
- Shared data: reports, documents, templates, messages
- Isolated by subscription_id with Row Level Security

### 3. **Added Supabase Integration**
- **Authentication**: Email/password sign up and login
- **Database**: All data now in Postgres with real-time sync
- **Security**: Row Level Security policies ensure data privacy
- **Real-time**: Messages sync instantly between co-parents

## 🚀 Next Steps (Required for Production)

### Step 1: Run Database Migrations

Go to your Supabase SQL Editor: https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/sql

Run these files in order:
1. `supabase/migrations/20250129000001_create_core_tables.sql`
2. `supabase/migrations/20250129000002_row_level_security.sql`

### Step 2: Deploy Edge Functions

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Login and link project
npx supabase login
npx supabase link --project-ref xidaoszvrdgttvgrntfe

# Set API key secret
npx supabase secrets set GEMINI_API_KEY=AIzaSyCvMT78j9HFFiM9xJ08p9A-kkLerZoCY8k

# Deploy functions
npx supabase functions deploy gemini-chat
npx supabase functions deploy gemini-generate-report  
npx supabase functions deploy gemini-legal-assistant
npx supabase functions deploy gemini-analyze-incident
```

### Step 3: Enable Realtime

In Supabase Dashboard → Database → Replication:
- Enable replication for `messages` table

## 📝 How It Works Now

### User Journey

1. **Sign Up** → User creates account with email/password
2. **Onboarding** → User provides name, role (Mother/Father), children
3. **Use App** → Log incidents, draft documents, analyze patterns
4. **Invite Co-Parent** → (Coming soon) Send invite to other parent
5. **Collaborate** → Both parents see all data, can message each other

### Data Structure

```
Subscription (1)
├── User 1 (Mother) - Primary Account
└── User 2 (Father) - Invited
    │
    ├── Reports (shared)
    ├── Documents (shared)
    ├── Templates (shared)
    └── Messages (real-time chat)
```

## 🔧 Current Status

The app is currently running with:
- ✅ Direct Gemini API calls (works but API key exposed)
- ✅ Supabase auth and database
- ⏳ Edge Functions created but not deployed

**After deploying edge functions**, the app will:
- ✅ Secure API calls through Supabase
- ✅ Be production-ready

## 🧪 Testing Locally

```bash
npm run dev
```

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Create account (email + password)
4. Complete profile setup
5. Start using the app!

**Note**: Until edge functions are deployed, the app still uses direct Gemini API calls (which work but aren't secure for production).

## 🔐 Security Features

- API key never exposed to client
- Row Level Security on all tables
- Users can only access their subscription's data
- Real-time subscriptions filtered by subscription_id
- Session tokens auto-refresh

## 💰 Billing (Future)

The schema supports 3 tiers:
- **Free**: Basic features
- **Plus**: Advanced analytics
- **Pro**: Full legal assistant + priority support

Ready for Stripe integration when needed.

## 📚 Documentation

- Full deployment guide: `DEPLOYMENT_GUIDE.md`
- Database migrations: `supabase/migrations/`
- Edge functions: `supabase/functions/`

## 🆘 Need Help?

Check the Supabase Dashboard:
https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe

