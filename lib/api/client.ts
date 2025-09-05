// Fakomame Platform - API Client
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@/lib/types'

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshResponse = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true
        })

        if (refreshResponse.data.success && refreshResponse.data.data?.accessToken) {
          const newToken = refreshResponse.data.data.accessToken
          localStorage.setItem('accessToken', newToken)

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }

          return apiClient(originalRequest)
        }
      } catch (_refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          //window.location.href = '/login'
        }
      }
    }

    return Promise.reject(error)
  }
)

// Generic API request function
export async function apiRequest<T = any>(
  config: AxiosRequestConfig
): Promise<T> {
  try {
    const response = await apiClient(config)
    return response.data.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.error || error.message)
    }
    throw error
  }
}

// Auth API calls
export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiRequest({
      method: 'POST',
      url: '/auth/login',
      data,
    }),

  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
    role?: string
  }) =>
    apiRequest({
      method: 'POST',
      url: '/auth/register',
      data,
    }),

  logout: () =>
    apiRequest({
      method: 'POST',
      url: '/auth/logout',
    }),

  getCurrentUser: () =>
    apiRequest({
      method: 'GET',
      url: '/auth/me',
    }),

  refreshToken: () =>
    apiRequest({
      method: 'POST',
      url: '/auth/refresh',
    }),

  // Verification APIs
  sendEmailVerification: (email: string) =>
    apiRequest({
      method: 'POST',
      url: '/auth/verify-email?action=send',
      data: { email },
    }),

  verifyEmail: (email: string, code: string) =>
    apiRequest({
      method: 'POST',
      url: '/auth/verify-email?action=verify',
      data: { email, code },
    }),

  sendPhoneVerification: (phone: string) =>
    apiRequest({
      method: 'POST',
      url: '/auth/verify-phone?action=send',
      data: { phone },
    }),

  verifyPhone: (phone: string, code: string) =>
    apiRequest({
      method: 'POST',
      url: '/auth/verify-phone?action=verify',
      data: { phone, code },
    }),

  uploadIDDocument: (file1: File, file2: File | null, type: string) => {
    const formData = new FormData()
    formData.append('frontDocument', file1)
    if (file2) {
      formData.append('backDocument', file2)
    }
    formData.append('type', type)

    return apiRequest({
      method: 'POST',
      url: '/auth/verify-id',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  getIDVerificationStatus: () =>
    apiRequest({
      method: 'GET',
      url: '/auth/verify-id',
    }),

  uploadFacialPhoto: (file: File) => {
    const formData = new FormData()
    formData.append('facialPhoto', file)

    return apiRequest({
      method: 'POST',
      url: '/auth/verify-facial',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  getFacialVerificationStatus: () =>
    apiRequest({
      method: 'GET',
      url: '/auth/verify-facial',
    }),

  uploadAddressDocument: (file: File, type: string, address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }) => {
    const formData = new FormData()
    formData.append('addressDocument', file)
    formData.append('documentType', type)
    formData.append('street', address.street)
    formData.append('city', address.city)
    formData.append('state', address.state)
    formData.append('postalCode', address.postalCode)
    formData.append('country', address.country)

    return apiRequest({
      method: 'POST',
      url: '/auth/verify-address?action=upload',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  getAddressVerificationStatus: () =>
    apiRequest({
      method: 'GET',
      url: '/auth/verify-address',
    }),

}



// User API calls
export const userApi = {
  getProfile: (userId: string) =>
    apiRequest({
      method: 'GET',
      url: `/users/${userId}`,
    }),

  updateProfile: (data: any) =>
    apiRequest({
      method: 'PUT',
      url: '/users/profile',
      data,
    }),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)

    return apiRequest({
      method: 'POST',
      url: '/users/avatar',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// Package API calls
export const packageApi = {
  getPackages: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/packages',
      params,
    }),

  getPackage: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/packages/${id}`,
    }),

  createPackage: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/packages',
      data,
    }),

  updatePackage: (id: string, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/packages/${id}`,
      data,
    }),

  deletePackage: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/packages/${id}`,
    }),

  searchPackages: (filters: any) =>
    apiRequest({
      method: 'GET',
      url: '/packages/search',
      params: filters,
    }),
}

// Trip API calls
export const tripApi = {
  getTrips: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/trips',
      params,
    }),

  getTrip: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/trips/${id}`,
    }),

  createTrip: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/trips',
      data,
    }),

  updateTrip: (id: string, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/trips/${id}`,
      data,
    }),

  deleteTrip: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/trips/${id}`,
    }),

  searchTrips: (filters: any) =>
    apiRequest({
      method: 'GET',
      url: '/trips/search',
      params: filters,
    }),
}

// Chat API calls
export const chatApi = {
  getChats: () =>
    apiRequest({
      method: 'GET',
      url: '/chats',
    }),

  getChat: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/chats/${id}`,
    }),

  createChat: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/chats',
      data,
    }),

  sendMessage: (chatId: string, data: any) =>
    apiRequest({
      method: 'POST',
      url: `/chats/${chatId}/messages`,
      data,
    }),

  getMessages: (chatId: string, params?: any) =>
    apiRequest({
      method: 'GET',
      url: `/chats/${chatId}/messages`,
      params,
    }),
}

// Assignment API calls
export const assignmentApi = {
  getAssignments: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/assignments',
      params,
    }),

  getAssignment: (id: string) =>
    apiRequest({
      method: 'GET',
      url: `/assignments/${id}`,
    }),

  createAssignment: (data: {
    packageId: string
    tripId: string
    confirmations: Record<string, any>
    confirmationType: string,
    notification?: string,
    userId: string
  }) =>
    apiRequest({
      method: 'POST',
      url: '/assignments',
      data,
    }),

  updateAssignment: (id: string, data: any) =>
    apiRequest({
      method: 'PUT',
      url: `/assignments/${id}`,
      data,
    }),

  deleteAssignment: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/assignments/${id}`,
    }),

  confirmAssignment: (id: string) =>
    apiRequest({
      method: 'PUT',
      url: `/assignments/${id}/confirm`,
    }),

  cancelAssignment: (id: string, reason?: string) =>
    apiRequest({
      method: 'PUT',
      url: `/assignments/${id}/cancel`,
      data: { reason },
    }),
}

// Payment API calls
export const paymentApi = {
  createPaymentIntent: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/payments/create-intent',
      data,
    }),

  confirmPayment: (paymentIntentId: string) =>
    apiRequest({
      method: 'POST',
      url: '/payments/confirm',
      data: { paymentIntentId },
    }),

  getPaymentMethods: () =>
    apiRequest({
      method: 'GET',
      url: '/payments/methods',
    }),

  addPaymentMethod: (data: any) =>
    apiRequest({
      method: 'POST',
      url: '/payments/methods',
      data,
    }),

  getTransactions: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/payments/transactions',
      params,
    }),
}

// Notification API calls
export const notificationApi = {
  getNotifications: (params?: any) =>
    apiRequest({
      method: 'GET',
      url: '/notifications',
      params,
    }),

  markAsRead: (id: string) =>
    apiRequest({
      method: 'PUT',
      url: `/notifications/${id}/read`,
    }),

  markAllAsRead: () =>
    apiRequest({
      method: 'PUT',
      url: '/notifications/read-all',
    }),

  deleteNotification: (id: string) =>
    apiRequest({
      method: 'DELETE',
      url: `/notifications/${id}`,
    }),
}

// Export the axios instance for direct use if needed
export default apiClient
