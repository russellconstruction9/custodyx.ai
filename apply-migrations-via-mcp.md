# Applying Migrations via Supabase MCP

## MCP Configuration

The Supabase MCP is configured at:
```
https://mcp.supabase.com/mcp?project_ref=xidaoszvrdgttvgrntfe
```

## Using MCP Tools

Once MCP is properly connected in Cursor, I can use these commands to apply migrations:

1. **Apply Core Tables Migration**
   - Tool: `mcp_supabase_apply_migration`
   - Migration file: `supabase/migrations/20250129000001_create_core_tables.sql`

2. **Apply RLS Policies Migration**
   - Tool: `mcp_supabase_apply_migration`
   - Migration file: `supabase/migrations/20250129000002_row_level_security.sql`

## Manual Steps If MCP Not Available

If MCP tools aren't accessible, use the Supabase Dashboard:

1. **[Open SQL Editor](https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/sql/new)**
2. Copy contents from `supabase/migrations/20250129000001_create_core_tables.sql`
3. Paste and click "Run"
4. Clear editor, copy from `supabase/migrations/20250129000002_row_level_security.sql`
5. Paste and click "Run"

## Verifying MCP Connection

To verify MCP is working, check:
- Cursor Settings → MCP Servers
- Look for Supabase MCP in available tools
- Test with a simple query

Once connected, the migrations can be applied programmatically! 🚀


