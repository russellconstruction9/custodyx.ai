import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://xidaoszvrdgttvgrntfe.supabase.co';
// For running migrations, you need the service_role key (not anon key)
// Get it from: https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/settings/api
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.log('\n❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable\n');
  console.log('📋 To run migrations, you need your service_role key:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/settings/api');
  console.log('   2. Copy the "service_role" key (NOT the anon key)');
  console.log('   3. Set it as: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  console.log('\n   OR run migrations manually in the Supabase Dashboard:');
  console.log('   👉 https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/sql/new\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration(name, filepath) {
  console.log(`\n📝 Running migration: ${name}...`);
  
  try {
    const sql = readFileSync(filepath, 'utf-8');
    
    // Split SQL into individual statements (basic approach)
    // Note: This is a simple approach - for production, use proper SQL parser
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--') && s.length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { query: statement });
          if (error) {
            // Try direct query if RPC doesn't work
            const { error: directError } = await supabase.from('_').select('*').limit(0);
            throw new Error(`SQL execution failed: ${error.message}`);
          }
        } catch (err) {
          // If RPC doesn't exist, we need to use Management API or manual approach
          console.log('⚠️  Cannot execute SQL directly. Please run migrations manually.');
          console.log('   See: https://supabase.com/dashboard/project/xidaoszvrdgttvgrntfe/sql/new');
          return false;
        }
      }
    }
    
    console.log(`✅ Migration ${name} completed successfully!`);
    return true;
  } catch (error) {
    console.error(`❌ Error running migration ${name}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('\n🚀 Starting Supabase migrations...\n');
  
  const migration1 = join(__dirname, 'supabase', 'migrations', '20250129000001_create_core_tables.sql');
  const migration2 = join(__dirname, 'supabase', 'migrations', '20250129000002_row_level_security.sql');

  const result1 = await runMigration('create_core_tables', migration1);
  const result2 = await runMigration('row_level_security', migration2);

  if (result1 && result2) {
    console.log('\n✅ All migrations completed successfully!');
    console.log('\n🎉 Your database is ready!');
    console.log('   Test your app at: http://localhost:3001\n');
  } else {
    console.log('\n⚠️  Some migrations failed. Please run them manually in Supabase Dashboard.');
  }
}

main();

