# 🔧 Supabase MCP Setup Instructions

## Step 1: Get Your Personal Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Create new token"**
3. Give it a name like "Cursor MCP Server"
4. Copy the token (you'll only see it once!)

## Step 2: Update MCP Configuration

Open `.cursor/mcp.json` and replace `YOUR_PERSONAL_ACCESS_TOKEN_HERE` with your actual token.

## Step 3: Restart Cursor

Restart Cursor completely for the MCP server to connect.

## Step 4: Verify Connection

After restart:
- Go to **Cursor Settings → MCP**
- You should see "supabase" with a green active status
- Then I can use MCP tools to apply migrations automatically!

## Current Configuration

```json
{
  "mcpServers": {
    "supabase": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=xidaoszvrdgttvgrntfe"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
      }
    }
  }
}
```

**Note**: Remove `--read-only` flag if you want to apply migrations (write access).

## After Setup

Once MCP is properly connected, I can:
- ✅ Apply database migrations automatically
- ✅ Check database tables
- ✅ Run SQL queries
- ✅ View migrations
- ✅ Get security advisors

Tell me when you've added your token and restarted Cursor!

