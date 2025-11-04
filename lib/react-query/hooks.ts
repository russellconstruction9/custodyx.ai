import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi, documentsApi, templatesApi, messagesApi, tokenUsageApi, profileApi } from '../api'
import { Report, StoredDocument, IncidentTemplate, CoParentMessage, TokenUsage, SubscriptionTier, UserProfile } from '../../types'
import toast from 'react-hot-toast'

// Query Keys
export const queryKeys = {
  reports: ['reports'] as const,
  documents: ['documents'] as const,
  templates: ['templates'] as const,
  messages: ['messages'] as const,
  tokenUsage: ['tokenUsage'] as const,
  subscriptionTier: ['subscriptionTier'] as const,
  profile: ['profile'] as const,
}

// Reports Hooks
export const useReports = () => {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: reportsApi.getAll,
  })
}

export const useCreateReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: reportsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports })
      toast.success('Report created successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create report: ${error.message}`)
    },
  })
}

export const useUpdateReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Report, 'id' | 'createdAt'>> }) => 
      reportsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports })
      toast.success('Report updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update report: ${error.message}`)
    },
  })
}

export const useDeleteReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: reportsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports })
      toast.success('Report deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete report: ${error.message}`)
    },
  })
}

// Documents Hooks
export const useDocuments = () => {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: documentsApi.getAll,
  })
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      toast.success('Document uploaded successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to upload document: ${error.message}`)
    },
  })
}

export const useDeleteDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      toast.success('Document deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete document: ${error.message}`)
    },
  })
}

// Templates Hooks
export const useTemplates = () => {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: templatesApi.getAll,
  })
}

export const useCreateTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: templatesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      toast.success('Template created successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to create template: ${error.message}`)
    },
  })
}

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: templatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates })
      toast.success('Template deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete template: ${error.message}`)
    },
  })
}

// Messages Hooks
export const useMessages = () => {
  return useQuery({
    queryKey: queryKeys.messages,
    queryFn: messagesApi.getAll,
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: messagesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages })
    },
    onError: (error: Error) => {
      toast.error(`Failed to send message: ${error.message}`)
    },
  })
}

// Token Usage Hooks
export const useTokenUsage = () => {
  return useQuery({
    queryKey: queryKeys.tokenUsage,
    queryFn: tokenUsageApi.get,
  })
}

export const useUpdateTokenUsage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tokenUsageApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tokenUsage })
    },
    onError: (error: Error) => {
      console.error('Failed to update token usage:', error)
    },
  })
}

export const useIncrementTokenUsage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tokenUsageApi.incrementUsage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tokenUsage })
    },
    onError: (error: Error) => {
      console.error('Failed to increment token usage:', error)
    },
  })
}

// Profile Hooks
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileApi.get,
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile })
      toast.success('Profile updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`)
    },
  })
}

export const useSubscriptionTier = () => {
  return useQuery({
    queryKey: queryKeys.subscriptionTier,
    queryFn: profileApi.getSubscriptionTier,
  })
}

export const useUpdateSubscriptionTier = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileApi.updateSubscriptionTier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptionTier })
      toast.success('Subscription updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(`Failed to update subscription: ${error.message}`)
    },
  })
}