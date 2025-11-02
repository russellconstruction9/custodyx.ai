import { query, transaction } from '../lib/database';
import { 
  Report, 
  StoredDocument, 
  UserProfile, 
  CoParentMessage, 
  IncidentTemplate,
  ChatMessage,
  SubscriptionTier,
  TokenUsage
} from '../types';

// Database interfaces that extend the existing types with database-specific fields
export interface DbUser extends UserProfile {
  id: string;
  email: string;
  subscriptionTier: SubscriptionTier;
  tokensUsed: number;
  tokensResetDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbReport extends Report {
  userId: string;
  updatedAt: string;
}

export interface DbDocument extends StoredDocument {
  userId: string;
  updatedAt: string;
}

export interface DbMessage extends CoParentMessage {
  userId: string;
}

export interface DbTemplate extends IncidentTemplate {
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbChatSession {
  id: string;
  userId: string;
  sessionType: 'incident_documentation' | 'legal_assistant' | 'agent_chat';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// User operations
export const createUser = async (userData: {
  email: string;
  name: string;
  role?: string;
  children?: string[];
}): Promise<DbUser> => {
  const result = await query(
    `INSERT INTO users (email, name, role, children) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [userData.email, userData.name, userData.role || '', userData.children || []]
  );
  return mapDbUserFromRow(result.rows[0]);
};

export const getUserById = async (userId: string): Promise<DbUser | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows.length > 0 ? mapDbUserFromRow(result.rows[0]) : null;
};

export const getUserByEmail = async (email: string): Promise<DbUser | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows.length > 0 ? mapDbUserFromRow(result.rows[0]) : null;
};

export const updateUser = async (userId: string, updates: Partial<DbUser>): Promise<DbUser> => {
  const setClause = Object.keys(updates)
    .map((key, index) => `${camelToSnake(key)} = $${index + 2}`)
    .join(', ');
  
  const values = [userId, ...Object.values(updates)];
  
  const result = await query(
    `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );
  return mapDbUserFromRow(result.rows[0]);
};

// Report operations
export const createReport = async (userId: string, reportData: Omit<Report, 'id'>): Promise<DbReport> => {
  const result = await query(
    `INSERT INTO reports (user_id, content, category, tags, legal_context, images, created_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [
      userId,
      reportData.content,
      reportData.category,
      reportData.tags,
      reportData.legalContext,
      reportData.images,
      reportData.createdAt
    ]
  );
  return mapDbReportFromRow(result.rows[0]);
};

export const getReportsByUserId = async (userId: string): Promise<DbReport[]> => {
  const result = await query(
    'SELECT * FROM reports WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows.map(mapDbReportFromRow);
};

export const getReportById = async (reportId: string): Promise<DbReport | null> => {
  const result = await query('SELECT * FROM reports WHERE id = $1', [reportId]);
  return result.rows.length > 0 ? mapDbReportFromRow(result.rows[0]) : null;
};

export const updateReport = async (reportId: string, updates: Partial<DbReport>): Promise<DbReport> => {
  const setClause = Object.keys(updates)
    .filter(key => key !== 'id' && key !== 'userId')
    .map((key, index) => `${camelToSnake(key)} = $${index + 2}`)
    .join(', ');
  
  const values = [reportId, ...Object.values(updates).filter((_, index) => 
    !['id', 'userId'].includes(Object.keys(updates)[index])
  )];
  
  const result = await query(
    `UPDATE reports SET ${setClause} WHERE id = $1 RETURNING *`,
    values
  );
  return mapDbReportFromRow(result.rows[0]);
};

export const deleteReport = async (reportId: string): Promise<boolean> => {
  const result = await query('DELETE FROM reports WHERE id = $1', [reportId]);
  return result.rowCount > 0;
};

// Document operations
export const createDocument = async (userId: string, documentData: Omit<StoredDocument, 'id'>): Promise<DbDocument> => {
  const result = await query(
    `INSERT INTO documents (user_id, name, mime_type, data, folder, structured_data, created_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING *`,
    [
      userId,
      documentData.name,
      documentData.mimeType,
      documentData.data,
      documentData.folder,
      documentData.structuredData ? JSON.stringify(documentData.structuredData) : null,
      documentData.createdAt
    ]
  );
  return mapDbDocumentFromRow(result.rows[0]);
};

export const getDocumentsByUserId = async (userId: string): Promise<DbDocument[]> => {
  const result = await query(
    'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows.map(mapDbDocumentFromRow);
};

export const getDocumentById = async (documentId: string): Promise<DbDocument | null> => {
  const result = await query('SELECT * FROM documents WHERE id = $1', [documentId]);
  return result.rows.length > 0 ? mapDbDocumentFromRow(result.rows[0]) : null;
};

export const deleteDocument = async (documentId: string): Promise<boolean> => {
  const result = await query('DELETE FROM documents WHERE id = $1', [documentId]);
  return result.rowCount > 0;
};

// Message operations
export const createMessage = async (userId: string, messageData: Omit<CoParentMessage, 'id'>): Promise<DbMessage> => {
  const result = await query(
    `INSERT INTO messages (user_id, text, sender_id, created_at) 
     VALUES ($1, $2, $3, $4) 
     RETURNING *`,
    [userId, messageData.text, messageData.senderId, messageData.timestamp]
  );
  return mapDbMessageFromRow(result.rows[0]);
};

export const getMessagesByUserId = async (userId: string): Promise<DbMessage[]> => {
  const result = await query(
    'SELECT * FROM messages WHERE user_id = $1 ORDER BY created_at ASC',
    [userId]
  );
  return result.rows.map(mapDbMessageFromRow);
};

// Template operations
export const createTemplate = async (userId: string, templateData: Omit<IncidentTemplate, 'id'>): Promise<DbTemplate> => {
  const result = await query(
    `INSERT INTO templates (user_id, title, content, category, tags, legal_context) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [
      userId,
      templateData.title,
      templateData.content,
      templateData.category,
      templateData.tags,
      templateData.legalContext
    ]
  );
  return mapDbTemplateFromRow(result.rows[0]);
};

export const getTemplatesByUserId = async (userId: string): Promise<DbTemplate[]> => {
  const result = await query(
    'SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows.map(mapDbTemplateFromRow);
};

export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  const result = await query('DELETE FROM templates WHERE id = $1', [templateId]);
  return result.rowCount > 0;
};

// Chat session operations
export const createChatSession = async (
  userId: string, 
  sessionType: 'incident_documentation' | 'legal_assistant' | 'agent_chat',
  messages: ChatMessage[] = []
): Promise<DbChatSession> => {
  const result = await query(
    `INSERT INTO chat_sessions (user_id, session_type, messages) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [userId, sessionType, JSON.stringify(messages)]
  );
  return mapDbChatSessionFromRow(result.rows[0]);
};

export const updateChatSession = async (sessionId: string, messages: ChatMessage[]): Promise<DbChatSession> => {
  const result = await query(
    `UPDATE chat_sessions SET messages = $2 WHERE id = $1 RETURNING *`,
    [sessionId, JSON.stringify(messages)]
  );
  return mapDbChatSessionFromRow(result.rows[0]);
};

export const getChatSessionsByUserId = async (userId: string): Promise<DbChatSession[]> => {
  const result = await query(
    'SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
    [userId]
  );
  return result.rows.map(mapDbChatSessionFromRow);
};

// Utility functions for mapping database rows to TypeScript interfaces
const mapDbUserFromRow = (row: any): DbUser => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  children: row.children || [],
  subscriptionTier: row.subscription_tier,
  tokensUsed: row.tokens_used,
  tokensResetDate: row.tokens_reset_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapDbReportFromRow = (row: any): DbReport => ({
  id: row.id,
  userId: row.user_id,
  content: row.content,
  category: row.category,
  tags: row.tags || [],
  legalContext: row.legal_context,
  images: row.images || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapDbDocumentFromRow = (row: any): DbDocument => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  mimeType: row.mime_type,
  data: row.data,
  folder: row.folder,
  structuredData: row.structured_data ? JSON.parse(row.structured_data) : undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapDbMessageFromRow = (row: any): DbMessage => ({
  id: row.id,
  userId: row.user_id,
  text: row.text,
  senderId: row.sender_id,
  timestamp: row.created_at
});

const mapDbTemplateFromRow = (row: any): DbTemplate => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  content: row.content,
  category: row.category,
  tags: row.tags || [],
  legalContext: row.legal_context,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapDbChatSessionFromRow = (row: any): DbChatSession => ({
  id: row.id,
  userId: row.user_id,
  sessionType: row.session_type,
  messages: JSON.parse(row.messages),
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

// Utility function to convert camelCase to snake_case
const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};