import { readFileSync } from 'fs';
import { join } from 'path';
import { query, testConnection } from '../lib/database';

const runMigration = async () => {
  console.log('🔄 Testing database connection...');
  
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Database connection failed. Please check your DATABASE_URL environment variable.');
    process.exit(1);
  }

  console.log('✅ Database connected successfully!');
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
        console.warn('⚠️  Warning:', error);
        // Continue with other statements even if one fails (for cases like "already exists")
      }
    }

    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Your Neon database is now ready for CustodyX.AI');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export default runMigration;