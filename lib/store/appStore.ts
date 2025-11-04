import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Report, StoredDocument, IncidentTemplate, CoParentMessage, SubscriptionTier, TokenUsage } from '../../types'
import { 
  reportsApi, 
  documentsApi, 
  templatesApi, 
  messagesApi, 
  tokenUsageApi, 
  profileApi 
} from '../api'

interface AppState {
  // Data
  reports: Report[]
  documents: StoredDocument[]
  templates: IncidentTemplate[]
  messages: CoParentMessage[]
  tokenUsage: TokenUsage
  subscriptionTier: SubscriptionTier
  
  // Loading states
  isLoading: {
    reports: boolean
    documents: boolean
    templates: boolean
    messages: boolean
    tokenUsage: boolean
  }
  
  // Actions
  loadReports: () => Promise<void>
  addReport: (report: Omit<Report, 'id'>) => Promise<void>
  updateReport: (id: string, updates: Partial<Omit<Report, 'id' | 'createdAt'>>) => Promise<void>
  deleteReport: (id: string) => Promise<void>
  
  loadDocuments: () => Promise<void>
  addDocument: (document: Omit<StoredDocument, 'id'>) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  
  loadTemplates: () => Promise<void>
  addTemplate: (template: Omit<IncidentTemplate, 'id'>) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>
  
  loadMessages: () => Promise<void>
  addMessage: (message: Omit<CoParentMessage, 'id'>) => Promise<void>
  
  loadTokenUsage: () => Promise<void>
  updateTokenUsage: (usage: TokenUsage) => Promise<void>
  incrementTokenUsage: (tokens: number) => Promise<void>
  
  loadSubscriptionTier: () => Promise<void>
  updateSubscriptionTier: (tier: SubscriptionTier) => Promise<void>
  
  // Utility actions
  loadAllData: () => Promise<void>
  clearAllData: () => void
  hasSufficientTokens: () => boolean
}

const DEFAULT_TOKEN_USAGE: TokenUsage = {
  used: 0,
  resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
}

const TOKEN_LIMITS: Record<SubscriptionTier, number> = {
  Free: 50000,
  Plus: 500000,
  Pro: 5000000,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      reports: [],
      documents: [],
      templates: [],
      messages: [],
      tokenUsage: DEFAULT_TOKEN_USAGE,
      subscriptionTier: 'Free',
      
      isLoading: {
        reports: false,
        documents: false,
        templates: false,
        messages: false,
        tokenUsage: false
      },
      
      // Reports actions
      loadReports: async () => {
        set(state => ({ isLoading: { ...state.isLoading, reports: true } }))
        try {
          const reports = await reportsApi.getAll()
          set({ reports })
        } catch (error) {
          console.error('Failed to load reports:', error)
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, reports: false } }))
        }
      },
      
      addReport: async (reportData) => {
        try {
          const newReport = await reportsApi.create(reportData)
          set(state => ({ reports: [newReport, ...state.reports] }))
        } catch (error) {
          console.error('Failed to add report:', error)
          throw error
        }
      },
      
      updateReport: async (id, updates) => {
        try {
          await reportsApi.update(id, updates)
          set(state => ({
            reports: state.reports.map(report =>
              report.id === id ? { ...report, ...updates } : report
            )
          }))
        } catch (error) {
          console.error('Failed to update report:', error)
          throw error
        }
      },
      
      deleteReport: async (id) => {
        try {
          await reportsApi.delete(id)
          set(state => ({
            reports: state.reports.filter(report => report.id !== id)
          }))
        } catch (error) {
          console.error('Failed to delete report:', error)
          throw error
        }
      },
      
      // Documents actions
      loadDocuments: async () => {
        set(state => ({ isLoading: { ...state.isLoading, documents: true } }))
        try {
          const documents = await documentsApi.getAll()
          set({ documents })
        } catch (error) {
          console.error('Failed to load documents:', error)
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, documents: false } }))
        }
      },
      
      addDocument: async (documentData) => {
        try {
          const newDocument = await documentsApi.create(documentData)
          set(state => ({ documents: [newDocument, ...state.documents] }))
        } catch (error) {
          console.error('Failed to add document:', error)
          throw error
        }
      },
      
      deleteDocument: async (id) => {
        try {
          await documentsApi.delete(id)
          set(state => ({
            documents: state.documents.filter(doc => doc.id !== id)
          }))
        } catch (error) {
          console.error('Failed to delete document:', error)
          throw error
        }
      },
      
      // Templates actions
      loadTemplates: async () => {
        set(state => ({ isLoading: { ...state.isLoading, templates: true } }))
        try {
          const templates = await templatesApi.getAll()
          set({ templates })
        } catch (error) {
          console.error('Failed to load templates:', error)
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, templates: false } }))
        }
      },
      
      addTemplate: async (templateData) => {
        try {
          const newTemplate = await templatesApi.create(templateData)
          set(state => ({ templates: [newTemplate, ...state.templates] }))
        } catch (error) {
          console.error('Failed to add template:', error)
          throw error
        }
      },
      
      deleteTemplate: async (id) => {
        try {
          await templatesApi.delete(id)
          set(state => ({
            templates: state.templates.filter(template => template.id !== id)
          }))
        } catch (error) {
          console.error('Failed to delete template:', error)
          throw error
        }
      },
      
      // Messages actions
      loadMessages: async () => {
        set(state => ({ isLoading: { ...state.isLoading, messages: true } }))
        try {
          const messages = await messagesApi.getAll()
          set({ messages })
        } catch (error) {
          console.error('Failed to load messages:', error)
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, messages: false } }))
        }
      },
      
      addMessage: async (messageData) => {
        try {
          const newMessage = await messagesApi.create(messageData)
          set(state => ({ messages: [...state.messages, newMessage] }))
        } catch (error) {
          console.error('Failed to add message:', error)
          throw error
        }
      },
      
      // Token usage actions
      loadTokenUsage: async () => {
        set(state => ({ isLoading: { ...state.isLoading, tokenUsage: true } }))
        try {
          const tokenUsage = await tokenUsageApi.get()
          
          // Check if we need to reset tokens
          const now = new Date()
          const resetDate = new Date(tokenUsage.resetDate)
          if (now >= resetDate) {
            const nextReset = new Date()
            nextReset.setMonth(nextReset.getMonth() + 1)
            const resetUsage = { used: 0, resetDate: nextReset.toISOString() }
            await tokenUsageApi.update(resetUsage)
            set({ tokenUsage: resetUsage })
          } else {
            set({ tokenUsage })
          }
        } catch (error) {
          console.error('Failed to load token usage:', error)
        } finally {
          set(state => ({ isLoading: { ...state.isLoading, tokenUsage: false } }))
        }
      },
      
      updateTokenUsage: async (usage) => {
        try {
          await tokenUsageApi.update(usage)
          set({ tokenUsage: usage })
        } catch (error) {
          console.error('Failed to update token usage:', error)
          throw error
        }
      },
      
      incrementTokenUsage: async (tokens) => {
        try {
          await tokenUsageApi.incrementUsage(tokens)
          set(state => ({
            tokenUsage: { ...state.tokenUsage, used: state.tokenUsage.used + tokens }
          }))
        } catch (error) {
          console.error('Failed to increment token usage:', error)
        }
      },
      
      // Subscription actions
      loadSubscriptionTier: async () => {
        try {
          const tier = await profileApi.getSubscriptionTier()
          set({ subscriptionTier: tier })
        } catch (error) {
          console.error('Failed to load subscription tier:', error)
        }
      },
      
      updateSubscriptionTier: async (tier) => {
        try {
          await profileApi.updateSubscriptionTier(tier)
          set({ subscriptionTier: tier })
        } catch (error) {
          console.error('Failed to update subscription tier:', error)
          throw error
        }
      },
      
      // Utility actions
      loadAllData: async () => {
        const { loadReports, loadDocuments, loadTemplates, loadMessages, loadTokenUsage, loadSubscriptionTier } = get()
        
        await Promise.all([
          loadReports(),
          loadDocuments(),
          loadTemplates(),
          loadMessages(),
          loadTokenUsage(),
          loadSubscriptionTier()
        ])
      },
      
      clearAllData: () => {
        set({
          reports: [],
          documents: [],
          templates: [],
          messages: [],
          tokenUsage: DEFAULT_TOKEN_USAGE,
          subscriptionTier: 'Free'
        })
      },
      
      hasSufficientTokens: () => {
        const { tokenUsage, subscriptionTier } = get()
        return tokenUsage.used < TOKEN_LIMITS[subscriptionTier]
      }
    }),
    {
      name: 'custodyx-app-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain parts of the state
      partialize: (state) => ({
        tokenUsage: state.tokenUsage,
        subscriptionTier: state.subscriptionTier
      })
    }
  )
)