import { 
  createUser, 
  getUserByEmail, 
  getUserById, 
  updateUser,
  createReport,
  getReportsByUserId,
  createDocument,
  getDocumentsByUserId,
  createMessage,
  getMessagesByUserId,
  createTemplate,
  getTemplatesByUserId,
  DbUser,
  DbReport,
  DbDocument,
  DbMessage,
  DbTemplate
} from './databaseService';
import { getCurrentUser, AuthUser } from './authService';
import { Report, StoredDocument, CoParentMessage, IncidentTemplate, UserProfile } from '../types';

// User management
export const ensureUserExists = async (authUser: AuthUser): Promise<DbUser> => {
  let user = await getUserByEmail(authUser.email);
  
  if (!user) {
    // Create new user in database
    user = await createUser({
      email: authUser.email,
      name: authUser.displayName || authUser.email.split('@')[0],
      role: '',
      children: []
    });
  }
  
  return user;
};

export const getCurrentDbUser = async (): Promise<DbUser | null> => {
  const authUser = getCurrentUser();
  if (!authUser) return null;
  
  return await ensureUserExists(authUser);
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<DbUser | null> => {
  const user = await getCurrentDbUser();
  if (!user) return null;
  
  return await updateUser(user.id, updates);
};

// Reports management
export const createUserReport = async (reportData: Omit<Report, 'id'>): Promise<DbReport | null> => {
  const user = await getCurrentDbUser();
  if (!user) return null;
  
  return await createReport(user.id, reportData);
};

export const getUserReports = async (): Promise<DbReport[]> => {
  const user = await getCurrentDbUser();
  if (!user) return [];
  
  return await getReportsByUserId(user.id);
};

// Documents management
export const createUserDocument = async (documentData: Omit<StoredDocument, 'id'>): Promise<DbDocument | null> => {
  const user = await getCurrentDbUser();
  if (!user) return null;
  
  return await createDocument(user.id, documentData);
};

export const getUserDocuments = async (): Promise<DbDocument[]> => {
  const user = await getCurrentDbUser();
  if (!user) return [];
  
  return await getDocumentsByUserId(user.id);
};

// Messages management
export const createUserMessage = async (messageData: Omit<CoParentMessage, 'id'>): Promise<DbMessage | null> => {
  const user = await getCurrentDbUser();
  if (!user) return null;
  
  return await createMessage(user.id, messageData);
};

export const getUserMessages = async (): Promise<DbMessage[]> => {
  const user = await getCurrentDbUser();
  if (!user) return [];
  
  return await getMessagesByUserId(user.id);
};

// Templates management
export const createUserTemplate = async (templateData: Omit<IncidentTemplate, 'id'>): Promise<DbTemplate | null> => {
  const user = await getCurrentDbUser();
  if (!user) return null;
  
  return await createTemplate(user.id, templateData);
};

export const getUserTemplates = async (): Promise<DbTemplate[]> => {
  const user = await getCurrentDbUser();
  if (!user) return [];
  
  return await getTemplatesByUserId(user.id);
};

// Utility functions to convert between database and app types
export const dbUserToUserProfile = (dbUser: DbUser): UserProfile => ({
  name: dbUser.name,
  role: dbUser.role as 'Mother' | 'Father' | '',
  children: dbUser.children
});

export const dbReportToReport = (dbReport: DbReport): Report => ({
  id: dbReport.id,
  content: dbReport.content,
  category: dbReport.category,
  tags: dbReport.tags,
  legalContext: dbReport.legalContext,
  images: dbReport.images,
  createdAt: dbReport.createdAt
});

export const dbDocumentToStoredDocument = (dbDocument: DbDocument): StoredDocument => ({
  id: dbDocument.id,
  name: dbDocument.name,
  mimeType: dbDocument.mimeType,
  data: dbDocument.data,
  folder: dbDocument.folder,
  structuredData: dbDocument.structuredData,
  createdAt: dbDocument.createdAt
});

export const dbMessageToCoParentMessage = (dbMessage: DbMessage): CoParentMessage => ({
  id: dbMessage.id,
  text: dbMessage.text,
  senderId: dbMessage.senderId,
  timestamp: dbMessage.timestamp
});

export const dbTemplateToIncidentTemplate = (dbTemplate: DbTemplate): IncidentTemplate => ({
  id: dbTemplate.id,
  title: dbTemplate.title,
  content: dbTemplate.content,
  category: dbTemplate.category,
  tags: dbTemplate.tags,
  legalContext: dbTemplate.legalContext
});