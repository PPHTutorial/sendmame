// Fakomame Platform - API Hooks
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi, userApi, packageApi, tripApi, chatApi, paymentApi, notificationApi } from '@/lib/api/client'
import { toast } from 'react-hot-toast'

// Auth hooks
export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)
      toast.success('Login successful!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed')
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)
      toast.success('Account created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed')
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
      toast.success('Logged out successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed')
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
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Profile updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: userApi.uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Avatar uploaded successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload avatar')
    },
  })
}

// Package hooks
export function usePackages(params?: any) {
  return useQuery({
    queryKey: ['packages', params],
    queryFn: () => packageApi.getPackages(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
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
      toast.success('Package created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create package')
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
      toast.success('Package updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update package')
    },
  })
}

export function useDeletePackage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: packageApi.deletePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      toast.success('Package deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete package')
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
    queryFn: () => tripApi.getTrips(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

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
      toast.success('Trip created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create trip')
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
      toast.success('Trip updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update trip')
    },
  })
}

export function useDeleteTrip() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: tripApi.deleteTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      toast.success('Trip deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete trip')
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
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  })
}

export function useCreateChat() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: chatApi.createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      toast.success('Chat created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create chat')
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: any }) => 
      chatApi.sendMessage(chatId, data),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat', chatId] })
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message')
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
      toast.error(error.message || 'Failed to create payment intent')
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
      toast.success('Payment confirmed successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Payment confirmation failed')
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
      toast.success('Payment method added successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add payment method')
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
      toast.error(error.message || 'Failed to mark notification as read')
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark notifications as read')
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification deleted!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete notification')
    },
  })
}
