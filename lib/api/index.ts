import { supabase } from '../supabase'
import { Database } from '../types/database.types'
import { Report, UserProfile, IncidentTemplate, StoredDocument, CoParentMessage, TokenUsage, SubscriptionTier } from '../../types'

type Tables = Database['public']['Tables']
type ProfileRow = Tables['profiles']['Row']
type ReportRow = Tables['reports']['Row']
type DocumentRow = Tables['documents']['Row']
type TemplateRow = Tables['incident_templates']['Row']
type MessageRow = Tables['co_parent_messages']['Row']
type TokenUsageRow = Tables['token_usage']['Row']

// Helper function to handle Supabase errors
const handleError = (error: any, operation: string) => {
  console.error(`${operation} failed:`, error)
  throw new Error(`${operation} failed: ${error.message}`)
}

// User Profile API
export const profileApi = {
  async get(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // No profile found
      handleError(error, 'Get profile')
    }

    if (!data) return null

    return {
      name: data.name,
      role: data.role as 'Mother' | 'Father' | '',
      children: data.children || []
    }
  },

  async update(profile: UserProfile): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        role: profile.role,
        children: profile.children
      })
      .eq('id', user.id)

    if (error) handleError(error, 'Update profile')

    // Log the action
    await auditApi.log('update', 'profile', user.id, { profile })
  },

  async getSubscriptionTier(): Promise<SubscriptionTier> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'Free'

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single()

    if (error) {
      console.warn('Failed to get subscription tier:', error)
      return 'Free'
    }

    return (data?.subscription_tier as SubscriptionTier) || 'Free'
  },

  async updateSubscriptionTier(tier: SubscriptionTier): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ subscription_tier: tier })
      .eq('id', user.id)

    if (error) handleError(error, 'Update subscription tier')

    await auditApi.log('update', 'subscription_tier', user.id, { tier })
  }
}

// Reports API
export const reportsApi = {
  async getAll(): Promise<Report[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) handleError(error, 'Get reports')

    return (data || []).map(row => ({
      id: row.id,
      content: row.content,
      category: row.category as any,
      tags: row.tags || [],
      legalContext: row.legal_context || '',
      images: row.images || [],
      createdAt: row.created_at
    }))
  },

  async create(report: Omit<Report, 'id'>): Promise<Report> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        content: report.content,
        category: report.category,
        tags: report.tags,
        legal_context: report.legalContext || null,
        images: report.images,
        created_at: report.createdAt
      })
      .select()
      .single()

    if (error) handleError(error, 'Create report')

    const newReport: Report = {
      id: data.id,
      content: data.content,
      category: data.category as any,
      tags: data.tags || [],
      legalContext: data.legal_context || '',
      images: data.images || [],
      createdAt: data.created_at
    }

    await auditApi.log('create', 'report', data.id, { category: report.category })

    return newReport
  },

  async update(id: string, updates: Partial<Omit<Report, 'id' | 'createdAt'>>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const updateData: any = {}
    if (updates.content !== undefined) updateData.content = updates.content
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.tags !== undefined) updateData.tags = updates.tags
    if (updates.legalContext !== undefined) updateData.legal_context = updates.legalContext
    if (updates.images !== undefined) updateData.images = updates.images

    const { error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) handleError(error, 'Update report')

    await auditApi.log('update', 'report', id, updates)
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) handleError(error, 'Delete report')

    await auditApi.log('delete', 'report', id)
  }
}

// Documents API
export const documentsApi = {
  async getAll(): Promise<StoredDocument[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) handleError(error, 'Get documents')

    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      mimeType: row.mime_type,
      data: '', // Will be loaded separately for binary files
      createdAt: row.created_at,
      folder: row.folder as any,
      structuredData: row.structured_data as any
    }))
  },

  async create(document: Omit<StoredDocument, 'id'>): Promise<StoredDocument> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // For binary files, upload to Supabase Storage
    let filePath: string | null = null
    if (!document.mimeType.startsWith('text/')) {
      const fileName = `${user.id}/${Date.now()}_${document.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, document.data, {
          contentType: document.mimeType
        })

      if (uploadError) handleError(uploadError, 'Upload document file')
      filePath = uploadData.path
    }

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: document.name,
        mime_type: document.mimeType,
        folder: document.folder,
        file_path: filePath,
        structured_data: document.structuredData || null
      })
      .select()
      .single()

    if (error) handleError(error, 'Create document')

    const newDocument: StoredDocument = {
      id: data.id,
      name: data.name,
      mimeType: data.mime_type,
      data: document.mimeType.startsWith('text/') ? document.data : '',
      createdAt: data.created_at,
      folder: data.folder as any,
      structuredData: data.structured_data as any
    }

    await auditApi.log('create', 'document', data.id, { name: document.name, folder: document.folder })

    return newDocument
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get document info first to delete file from storage
    const { data: doc } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    // Delete from storage if it exists
    if (doc?.file_path) {
      await supabase.storage
        .from('documents')
        .remove([doc.file_path])
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) handleError(error, 'Delete document')

    await auditApi.log('delete', 'document', id)
  },

  async getFileData(id: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: doc, error } = await supabase
      .from('documents')
      .select('file_path, mime_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) handleError(error, 'Get document info')

    if (!doc.file_path) return ''

    const { data, error: downloadError } = await supabase.storage
      .from('documents')
      .download(doc.file_path)

    if (downloadError) handleError(downloadError, 'Download document')

    // Convert to base64
    const buffer = await data.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(byte => binary += String.fromCharCode(byte))
    return btoa(binary)
  }
}

// Templates API
export const templatesApi = {
  async getAll(): Promise<IncidentTemplate[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('incident_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) handleError(error, 'Get templates')

    return (data || []).map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category as any,
      tags: row.tags || [],
      legalContext: row.legal_context || undefined
    }))
  },

  async create(template: Omit<IncidentTemplate, 'id'>): Promise<IncidentTemplate> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('incident_templates')
      .insert({
        user_id: user.id,
        title: template.title,
        content: template.content,
        category: template.category,
        tags: template.tags,
        legal_context: template.legalContext || null
      })
      .select()
      .single()

    if (error) handleError(error, 'Create template')

    const newTemplate: IncidentTemplate = {
      id: data.id,
      title: data.title,
      content: data.content,
      category: data.category as any,
      tags: data.tags || [],
      legalContext: data.legal_context || undefined
    }

    await auditApi.log('create', 'template', data.id, { title: template.title })

    return newTemplate
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('incident_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) handleError(error, 'Delete template')

    await auditApi.log('delete', 'template', id)
  }
}

// Messages API (for co-parenting messaging)
export const messagesApi = {
  async getAll(): Promise<CoParentMessage[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
      .from('co_parent_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) handleError(error, 'Get messages')

    return (data || []).map(row => ({
      id: row.id,
      text: row.text,
      senderId: row.sender_id as 'user' | 'other_parent',
      timestamp: row.created_at
    }))
  },

  async create(message: Omit<CoParentMessage, 'id'>): Promise<CoParentMessage> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('co_parent_messages')
      .insert({
        user_id: user.id,
        text: message.text,
        sender_id: message.senderId,
        created_at: message.timestamp
      })
      .select()
      .single()

    if (error) handleError(error, 'Create message')

    const newMessage: CoParentMessage = {
      id: data.id,
      text: data.text,
      senderId: data.sender_id as 'user' | 'other_parent',
      timestamp: data.created_at
    }

    await auditApi.log('create', 'message', data.id)

    return newMessage
  }
}

// Token Usage API
export const tokenUsageApi = {
  async get(): Promise<TokenUsage> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const nextReset = new Date()
      nextReset.setMonth(nextReset.getMonth() + 1)
      return { used: 0, resetDate: nextReset.toISOString() }
    }

    const { data, error } = await supabase
      .from('token_usage')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.warn('Failed to get token usage:', error)
      const nextReset = new Date()
      nextReset.setMonth(nextReset.getMonth() + 1)
      return { used: 0, resetDate: nextReset.toISOString() }
    }

    return {
      used: data.used,
      resetDate: data.reset_date
    }
  },

  async update(tokenUsage: TokenUsage): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('token_usage')
      .update({
        used: tokenUsage.used,
        reset_date: tokenUsage.resetDate
      })
      .eq('user_id', user.id)

    if (error) handleError(error, 'Update token usage')
  },

  async incrementUsage(tokens: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.rpc('increment_token_usage', {
      user_id: user.id,
      tokens_used: tokens
    })

    if (error) {
      console.warn('Failed to increment token usage:', error)
      // Fallback to manual update
      const current = await this.get()
      await this.update({ ...current, used: current.used + tokens })
    }
  }
}

// Audit logging API
export const auditApi = {
  async log(
    action: string,
    resourceType: string,
    resourceId?: string,
    metadata?: any
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        metadata: metadata || null,
        ip_address: null, // Could be populated via server-side function
        user_agent: navigator.userAgent
      })

    if (error) {
      console.warn('Failed to log audit entry:', error)
      // Don't throw error for audit logging failures
    }
  }
}