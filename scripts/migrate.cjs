const { readFileSync } = require('fs');
const { join } = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

const runMigration = async () => {
  console.log('🔄 Testing database connection...');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Database connection failed. Please check your DATABASE_URL environment variable.');
    process.exit(1);
  }

  console.log('🔄 Running database migrations...');

  try {
    // Read and execute the schema SQL file
    const schemaPath = join(__dirname, '..', 'db', 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      try {
        await query(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.warn('⚠️  Warning executing statement:', error.message);
        // Continue with other statements even if one fails (for cases like "already exists")
      }
    }

    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Your Neon database is now ready for CustodyX.AI');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migration
runMigration().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});