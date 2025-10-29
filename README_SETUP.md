# 🚀 Quick Setup - 2 Minutes

## Option 1: Supabase Dashboard (Easiest - Recommended)

**Just 2 copy-paste steps:**

1. **[Open SQL Editor](https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/sql/new)**

2. **Copy & paste Migration 1:**
   - Open: `supabase/migrations/20250129000001_create_core_tables.sql`
   - Copy all SQL
   - Paste in Supabase SQL Editor
   - Click **"Run"** ✅

3. **Copy & paste Migration 2:**
   - Open: `supabase/migrations/20250129000002_row_level_security.sql`
   - Copy all SQL
   - Paste in Supabase SQL Editor (clear first)
   - Click **"Run"** ✅

4. **Enable Realtime:**
   - Go to: [Database Replication](https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/database/publications)
   - Check the `messages` table
   - Click **Save** ✅

**Done!** Your app is ready at http://localhost:3001

---

## Option 2: Supabase CLI (For Developers)

```bash
# Install CLI
npm install supabase --save-dev

# Login
npx supabase login

# Link project
npx supabase link --project-ref xidaoszvrdgttvgrntfe

# Push migrations
npx supabase db push
```

---

## Option 3: MCP Connection

If you have Supabase MCP configured in your Cursor settings, I can help apply migrations programmatically. The MCP connection should be:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=xidaoszvrdgttvgrntfe"
    }
  }
}
```

Then I can use MCP tools to apply migrations automatically.

---

## Current Status

✅ App code ready  
✅ Database schema created  
⏳ **Need to run migrations** (choose option above)  
⏳ Edge functions (optional for now)

After migrations, your app will:
- ✅ Have authentication working
- ✅ Save all data to Supabase
- ✅ Support 2 users per subscription (Mother + Father)
- ✅ Real-time message syncing

## Test It

1. Go to http://localhost:3001
2. Click "Sign Up"
3. Create account
4. Start using the app!

Everything is configured - just need to run those 2 SQL scripts! 🎉

