const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const fixTriggers = async () => {
  const client = await pool.connect();
  try {
    // Create the trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    console.log('✅ Created trigger function');
    
    // Create triggers for all tables
    const triggers = [
      'CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();'
    ];
    
    for (const trigger of triggers) {
      try {
        await client.query(trigger);
        console.log('✅ Created trigger:', trigger.split(' ')[2]);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠️  Trigger already exists:', trigger.split(' ')[2]);
        } else {
          console.warn('⚠️  Warning:', error.message);
        }
      }
    }
    
    console.log('🎉 Database triggers setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up triggers:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

fixTriggers();