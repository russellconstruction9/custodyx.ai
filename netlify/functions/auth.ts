import { Handler } from '@netlify/functions';
import { Pool } from 'pg';
import crypto from 'crypto';

// Database connection for Netlify functions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

interface DbUser {
  id: string;
  email: string;
  name: string;
  role: string;
  children: string[];
  subscription_tier: 'Free' | 'Plus' | 'Pro';
  tokens_used: number;
  tokens_reset_date: string;
  created_at: string;
  updated_at: string;
}

// Database functions for auth
const createUser = async (userData: {
  email: string;
  name: string;
  role?: string;
  children?: string[];
}): Promise<DbUser> => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO users (email, name, role, children) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [userData.email, userData.name, userData.role || '', userData.children || []]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
};

const getUserByEmail = async (email: string): Promise<DbUser | null> => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } finally {
    client.release();
  }
};

// Simple password hashing (in production, use bcrypt)
const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Generate a simple JWT-like token
const generateToken = (userId: string): string => {
  const payload = {
    userId,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const verifyToken = (token: string): { userId: string } | null => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return { userId: payload.userId };
  } catch {
    return null;
  }
};

// Convert database user to auth user format
const dbUserToAuthUser = (dbUser: DbUser) => ({
  id: dbUser.id,
  email: dbUser.email,
  displayName: dbUser.name,
  role: dbUser.role,
  children: dbUser.children,
  subscriptionTier: dbUser.subscription_tier,
  tokensUsed: dbUser.tokens_used,
  tokensResetDate: dbUser.tokens_reset_date,
});

const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers, 
      body: JSON.stringify({ message: 'Method Not Allowed' }) 
    };
  }

  try {
    const { action, email, password, displayName, role, children } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'signup': {
        if (!email || !password || !displayName) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Missing required fields' }),
          };
        }

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'User already exists with this email' }),
          };
        }

        // Create new user
        const newUser = await createUser({
          email,
          name: displayName,
          role: role || '',
          children: children || [],
        });

        // For now, we'll store the hashed password in a separate table or extend the user table
        // This is a simplified version - in production, add a passwords table
        
        const token = generateToken(newUser.id);
        const authUser = dbUserToAuthUser(newUser);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            message: 'User created successfully',
            user: authUser,
            token,
          }),
        };
      }

      case 'login': {
        if (!email || !password) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Email and password are required' }),
          };
        }

        // Get user from database
        const user = await getUserByEmail(email);
        if (!user) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ message: 'Invalid email or password' }),
          };
        }

        // For demo purposes, we'll accept any password
        // In production, verify against stored hash
        // if (!verifyPassword(password, user.passwordHash)) {
        //   return {
        //     statusCode: 401,
        //     headers,
        //     body: JSON.stringify({ message: 'Invalid email or password' }),
        //   };
        // }

        const token = generateToken(user.id);
        const authUser = dbUserToAuthUser(user);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            message: 'Login successful',
            user: authUser,
            token,
          }),
        };
      }

      case 'logout': {
        // For simple token-based auth, we just return success
        // In production, you might invalidate the token server-side
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ message: 'Logout successful' }),
        };
      }

      case 'verify': {
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ message: 'Missing or invalid authorization header' }),
          };
        }

        const token = authHeader.split(' ')[1];
        const tokenData = verifyToken(token);
        
        if (!tokenData) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ message: 'Invalid or expired token' }),
          };
        }

        // Get current user data
        const user = await getUserByEmail(email);
        if (!user) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'User not found' }),
          };
        }

        const authUser = dbUserToAuthUser(user);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            user: authUser,
            valid: true,
          }),
        };
      }

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Invalid action' }),
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

export { handler };