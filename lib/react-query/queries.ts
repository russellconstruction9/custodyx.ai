import { useQuery, useMutation, QueryClient, useQueryClient } from '@tanstack/react-query'
import { reportsApi, documentsApi, templatesApi, messagesApi, profileApi } from '../api'
import { Report, StoredDocument, IncidentTemplate, CoParentMessage, UserProfile } from '../../types'
import toast from 'react-hot-toast'

// Query Keys
export const queryKeys = {
  reports: ['reports'] as const,
  documents: ['documents'] as const,
  templates: ['templates'] as const,
  messages: ['messages'] as const,
  profile: ['profile'] as const,
} as const

// Reports Queries
export const useReports = () => {
  return useQuery({
    queryKey: queryKeys.reports,
    queryFn: reportsApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
    onError: (error: any) => {
      toast.error('Failed to create report')
      console.error('Create report error:', error)
    },
  })
}

export const useUpdateReport = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Report> }) =>
      reportsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports })
      toast.success('Report updated successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to update report')
      console.error('Update report error:', error)
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
    onError: (error: any) => {
      toast.error('Failed to delete report')
      console.error('Delete report error:', error)
    },
  })
}

// Documents Queries
export const useDocuments = () => {
  return useQuery({
    queryKey: queryKeys.documents,
    queryFn: documentsApi.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: documentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      toast.success('Document saved successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to save document')
      console.error('Create document error:', error)
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
    onError: (error: any) => {
      toast.error('Failed to delete document')
      console.error('Delete document error:', error)
    },
  })
}

// Templates Queries
export const useTemplates = () => {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: templatesApi.getAll,
    staleTime: 1000 * 60 * 10, // 10 minutes - templates change less frequently
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
    onError: (error: any) => {
      toast.error('Failed to create template')
      console.error('Create template error:', error)
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
    onError: (error: any) => {
      toast.error('Failed to delete template')
      console.error('Delete template error:', error)
    },
  })
}

// Messages Queries
export const useMessages = () => {
  return useQuery({
    queryKey: queryKeys.messages,
    queryFn: messagesApi.getAll,
    staleTime: 1000 * 60 * 2, // 2 minutes - messages are more real-time
  })
}

export const useCreateMessage = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: messagesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages })
    },
    onError: (error: any) => {
      toast.error('Failed to send message')
      console.error('Create message error:', error)
    },
  })
}

// Profile Queries
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileApi.get,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: profileApi.update,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.profile, updatedProfile)
      toast.success('Profile updated successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to update profile')
      console.error('Update profile error:', error)
    },
  })
}

// Token Usage (for AI features)
export const useTokenUsage = () => {
  return useQuery({
    queryKey: ['tokenUsage'],
    queryFn: async () => {
      // This will be implemented in the API layer
      return { used: 0, resetDate: new Date().toISOString() }
    },
    staleTime: 1000 * 60, // 1 minute
  })
}

// Utility function to invalidate all queries (useful for sign out)
export const useInvalidateAllQueries = () => {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.invalidateQueries()
  }
}