// Amenade Platform - API Hooks
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient, { authApi, userApi, packageApi, tripApi, chatApi, paymentApi, notificationApi } from '@/lib/api/client'
import { toast } from 'react-hot-toast'
import { AttachmentData } from '../types'

// Auth hooks
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)

    },
    onError: (error: Error) => {

    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)

    },
    onError: (error: Error) => {

    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear()
      localStorage.removeItem('accessToken')

    },
    onError: (error: Error) => {

    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Combined auth hook for convenience
export function useAuth() {
  const login = useLogin()
  const register = useRegister()
  const logout = useLogout()
  const getCurrentUser = useCurrentUser()

  return {
    login,
    register,
    logout,
    getCurrentUser,
    isLoggingIn: login.isPending,
    isRegistering: register.isPending,
    isLoggingOut: logout.isPending,
  }
}

// Verification hooks
export function useSendEmailVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => authApi.sendEmailVerification(email),
    onSuccess: () => {
      toast.success('Verification code sent to your email!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send verification code')
    },
  })
}

export function useVerifyEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyEmail(email, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Email verified successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify email')
    },
  })
}

export function useSendPhoneVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (phone: string) => authApi.sendPhoneVerification(phone),
    onSuccess: () => {
      toast.success('Verification code sent to your phone!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send verification code')
    },
  })
}

export function useVerifyPhone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authApi.verifyPhone(phone, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Phone verified successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify phone')
    },
  })
}

export function useUploadIDDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file1, file2, type }: { file1: File; file2: File | null; type: string }) =>
      authApi.uploadIDDocument(file1, file2, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('ID document uploaded successfully!', {
        style: {
          background: '#d1fae5',
          color: '#065f46',
          fontSize: '14px',
        }
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload ID document')
    },
  })
}

export function useUploadFacialPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => authApi.uploadFacialPhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Facial photo uploaded successfully!', {
        style: {
          background: '#d1fae5',
          color: '#065f46',
          fontSize: '14px',
        }
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload facial photo', {
        style: {
          background: '#fee2e2',
          color: '#b91c1c',
          fontSize: '14px',
        }
      })
    },
  })
}

export function useIDVerificationStatus() {
  return useQuery({
    queryKey: ['idVerificationStatus'],
    queryFn: async () => {
      try {
        const result = await authApi.getIDVerificationStatus()
        return result
      } catch (error) {
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryOnMount: true,
    refetchOnMount: true,
  })
}


export function useFacialVerificationStatus() {
  return useQuery({
    queryKey: ['facialVerificationStatus'],
    queryFn: async () => {
      try {
        const result = await authApi.getFacialVerificationStatus()
        return result
      } catch (error) {
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryOnMount: true,
    refetchOnMount: true,
  })
}

export function useUploadAddressDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, documentType, address }: {
      file: File;
      address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
      documentType: string;
    }) => authApi.uploadAddressDocument(file, documentType, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['addressVerificationStatus'] })
      toast.success('Address document uploaded successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload address document')
    },
  })
}

export function useAddressVerificationStatus() {
  return useQuery({
    queryKey: ['addressVerificationStatus'],
    queryFn: async () => {
      try {
        const result = await authApi.getAddressVerificationStatus()
        console.log('Address verification status fetched successfully:', result)
        return result
      } catch (error) {
        console.error('Failed to fetch address verification status:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryOnMount: true,
    refetchOnMount: true,
  })
}

// User hooks
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getProfile(userId),
    enabled: !!userId,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.updateProfile,
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: userApi.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })

    },
    onError: (error: Error) => {

    },
  })
}

// Package hooks
export function usePackages(params?: any) {
  return useQuery({
    queryKey: ['packages', params],
    queryFn: async () => {
      const response = await apiClient({
        method: 'GET',
        url: '/packages',
        params
      })
      return response.data // Return full response with data and pagination
    },
    enabled: params !== null && params !== undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  })
}

export function usePackage(id: string) {
  return useQuery({
    queryKey: ['package', id],
    queryFn: () => packageApi.getPackage(id),
    enabled: !!id,
  })
}

export function useCreatePackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packageApi.createPackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })

    },
    onError: (error: Error) => {

    },
  })
}

export function useUpdatePackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => packageApi.updatePackage(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['package', id] })
      queryClient.invalidateQueries({ queryKey: ['packages'] })

    },
    onError: (_error: Error) => {

    },
  })
}

export function useDeletePackage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packageApi.deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })

    },
    onError: (_error: Error) => {

    },
  })
}

export function useSearchPackages(filters: any) {
  return useQuery({
    queryKey: ['packages', 'search', filters],
    queryFn: () => packageApi.searchPackages(filters),
    enabled: Object.keys(filters).length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Trip hooks
export function useTrips(params?: any) {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: async () => {
      const response = await apiClient({
        method: 'GET',
        url: '/trips',
        params
      })
      return response.data // Return full response with data and pagination
    },
    enabled: params !== null && params !== undefined,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  })
}
/* export function usePackage(id: string) {
  return useQuery({
    queryKey: ['package', id],
    queryFn: () => packageApi.getPackage(id),
    enabled: !!id,
  })
} */
export function useTrip(id: string) {
  return useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripApi.getTrip(id),
    enabled: !!id,
  })
}

export function useCreateTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tripApi.createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })

    },
    onError: (error: Error) => {

    },
  })
}

export function useUpdateTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tripApi.updateTrip(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['trip', id] })
      queryClient.invalidateQueries({ queryKey: ['trips'] })

    },
    onError: (error: Error) => {

    },
  })
}

export function useDeleteTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tripApi.deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })

    },
    onError: (error: Error) => {

    },
  })
}

export function useSearchTrips(filters: any) {
  return useQuery({
    queryKey: ['trips', 'search', filters],
    queryFn: () => tripApi.searchTrips(filters),
    enabled: Object.keys(filters).length > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Chat hooks
export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: chatApi.getChats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export function useChat(id: string) {
  return useQuery({
    queryKey: ['chat', id],
    queryFn: () => chatApi.getChat(id),
    enabled: !!id,
    refetchInterval: 5000,
  })
}

export function useFindOrCreateChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { participantId: string; itemType: 'package' | 'trip'; itemId: string, chatType: string }) =>
      chatApi.createChat(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      queryClient.setQueryData(['chat', data.id], data)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not open chat. Please try again.')
    },
  })
}

export function useCreateChat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: chatApi.createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })

    },
    onError: (error: Error) => {

    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: { content: string; type?: string, chatId: string, attachments?: AttachmentData[] } }) =>
      chatApi.sendMessage(chatId, data),

    onMutate: async ({ chatId, data }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['chat', chatId] })

      // Snapshot the previous value
      const previousChat = queryClient.getQueryData(['chat', chatId])

      // Optimistically update to the new value
      queryClient.setQueryData(['chat', chatId], (old: any) => {
        if (!old) return old
        const currentUser = queryClient.getQueryData(['user']) as any;

        console.log('Optimistically adding message with attachments:', data);

        const newMessage = {
          id: `temp-${Date.now()}`, // Temporary ID
          content: data.content,
          senderId: currentUser?.id || 'optimistic-user-id',
          createdAt: new Date().toISOString(),
          messageType: data.type || 'text',
          attachments: data.attachments || [],
          isEdited: false,
        };

        return {
          ...old,
          messages: [...old.messages, newMessage],
        }
      })

      // Return a context object with the snapshotted value
      return { previousChat }
    },

    onError: (err, { chatId }, context) => {
      // Rollback to the previous value on error
      if (context?.previousChat) {
        queryClient.setQueryData(['chat', chatId], context.previousChat)
      }
      toast.error('Failed to send message. Please try again.')
    },

    onSettled: (data, error, { chatId }) => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })
}

export function useMessages(chatId: string, params?: any) {
  return useQuery({
    queryKey: ['messages', chatId, params],
    queryFn: () => chatApi.getMessages(chatId, params),
    enabled: !!chatId,
    refetchInterval: 3000, // Refetch every 3 seconds
  })
}

// Payment hooks
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: paymentApi.createPaymentIntent,
    onError: (error: Error) => {

    },
  })
}

export function useConfirmPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: paymentApi.confirmPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })

    },
    onError: (error: Error) => {

    },
  })
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['paymentMethods'],
    queryFn: paymentApi.getPaymentMethods,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: paymentApi.addPaymentMethod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] })

    },
    onError: (error: Error) => {

    },
  })
}

export function useTransactions(params?: any) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => paymentApi.getTransactions(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Notification hooks
export function useNotifications(params?: any) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationApi.getNotifications(params),
    refetchInterval: 60000, // Refetch every minute
  })
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error: Error) => {

    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

    },
    onError: (error: Error) => {

    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

    },
    onError: (error: Error) => {

    },
  })
}
