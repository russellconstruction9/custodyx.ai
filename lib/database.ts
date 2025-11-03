import { Pool, PoolClient } from 'pg';

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close clients after 30 seconds of inactivity
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Database connection helper
export const getDbClient = async (): Promise<PoolClient> => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
};

// Execute a query with error handling
export const query = async (text: string, params?: any[]): Promise<any> => {
  const client = await getDbClient();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Execute multiple queries in a transaction
export const transaction = async (queries: Array<{ text: string; params?: any[] }>): Promise<any[]> => {
  const client = await getDbClient();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

export default pool;