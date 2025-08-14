// Fakomame Platform - Validation Schemas
import { z } from 'zod'
import { UserRole, PackageStatus, TripStatus } from '@prisma/client'

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: z.string().optional(),
  role: z.nativeEnum(UserRole).default(UserRole.SENDER),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
})

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  formattedAddress: z.string().optional(),
})

// Package schemas
export const dimensionsSchema = z.object({
  length: z.number().positive('Length must be positive'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  weight: z.number().positive('Weight must be positive'),
})

export const createPackageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  dimensions: dimensionsSchema,
  value: z.number().positive('Value must be positive').optional(),
  isFragile: z.boolean().default(false),
  requiresSignature: z.boolean().default(false),
  pickupAddress: addressSchema,
  deliveryAddress: addressSchema,
  pickupDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Pickup date must be in the future',
  }),
  deliveryDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Delivery date must be in the future',
  }),
  offeredPrice: z.number().positive('Price must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  specialInstructions: z.string().max(500, 'Instructions too long').optional(),
  images: z.array(z.string().url()).default([]),  
})

export const updatePackageSchema = createPackageSchema.partial().extend({
  status: z.nativeEnum(PackageStatus).optional(),
})

// Trip schemas
export const createTripSchema = z.object({
  originAddress: addressSchema,
  destinationAddress: addressSchema,
  departureDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Departure date must be in the future',
  }),
  arrivalDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'Arrival date must be in the future',
  }),
  maxWeight: z.number().positive('Max weight must be positive'),
  maxDimensions: dimensionsSchema.omit({ weight: true }),
  transportMode: z.enum(['car', 'plane', 'train', 'bus', 'ship', 'other']),
  pricePerKg: z.number().positive('Price per kg must be positive').optional(),
  minimumPrice: z.number().positive('Minimum price must be positive').optional(),
  maximumPrice: z.number().positive('Maximum price must be positive').optional(),
  packageTypes: z.array(z.string()).default([]),
  restrictions: z.array(z.string()).default([]),
})

export const updateTripSchema = createTripSchema.partial().extend({
  status: z.nativeEnum(TripStatus).optional(),
})

// User profile schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
  occupation: z.string().max(100, 'Occupation too long').optional(),
  languages: z.array(z.string()).default([]),
  currentCity: z.string().max(100, 'City name too long').optional(),
  currentCountry: z.string().max(100, 'Country name too long').optional(),
  timeZone: z.string().optional(),
  pushNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(true),
})

// Chat and messaging schemas
export const createChatSchema = z.object({
  type: z.enum(['PACKAGE_NEGOTIATION', 'TRIP_COORDINATION', 'SUPPORT']),
  packageId: z.string().optional(),
  tripId: z.string().optional(),
  participantIds: z.array(z.string().min(1)),
})

export const sendMessageSchema = z.object({
  chatId: z.string().min(1, 'Chat ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  messageType: z.enum(['text', 'image', 'file', 'location', 'system']).default('text'),
  attachments: z.array(z.string().url()).default([]),
})

// Review schemas
export const createReviewSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500, 'Comment too long').optional(),
  category: z.enum(['delivery', 'communication', 'reliability']),
  packageId: z.string().optional(),
  tripId: z.string().optional(),
})

// Payment schemas
export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  packageId: z.string().optional(),
  tripId: z.string().optional(),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  description: z.string().max(200, 'Description too long').optional(),
})

export const createPaymentMethodSchema = z.object({
  type: z.enum(['card', 'bank_account', 'mobile_money']),
  provider: z.enum(['stripe', 'paystack', 'flutterwave']),
  gatewayId: z.string().min(1, 'Gateway ID is required'),
  isDefault: z.boolean().default(false),
})

// Search and filter schemas
export const locationFilterSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive('Radius must be positive').default(50), // km
})

export const packageSearchSchema = z.object({
  origin: locationFilterSchema.optional(),
  destination: locationFilterSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  category: z.string().optional(),
  maxWeight: z.number().positive().optional(),
  isFragile: z.boolean(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'price', 'deliveryDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const tripSearchSchema = z.object({
  origin: locationFilterSchema.optional(),
  destination: locationFilterSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  transportMode: z.enum(['car', 'plane', 'train', 'bus', 'ship', 'other']).optional(),
  availableWeight: z.number().positive().optional(),
  priceRange: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
  }).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'departureDate', 'price']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Notification schemas
export const createNotificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum([
    'PACKAGE_MATCH',
    'TRIP_REQUEST',
    'PAYMENT_RECEIVED',
    'DELIVERY_CONFIRMATION',
    'MESSAGE_RECEIVED',
    'SYSTEM_ALERT',
  ]),
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  packageId: z.string().optional(),
  tripId: z.string().optional(),
  chatId: z.string().optional(),
  metadata: z.record(z.any()).default({}),
})

// Dispute schemas
export const createDisputeSchema = z.object({
  involvedId: z.string().min(1, 'Involved user ID is required'),
  packageId: z.string().optional(),
  tripId: z.string().optional(),
  type: z.enum(['non_delivery', 'damaged_package', 'payment_issue', 'communication_issue', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description too long'),
  evidence: z.array(z.string().url()).default([]),
})

// File upload schemas
export const fileUploadSchema = z.object({
  type: z.enum(['image', 'document', 'verification']),
  category: z.string().optional(),
  maxSize: z.number().positive().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]),
})

// Admin schemas
export const adminUserUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  role: z.nativeEnum(UserRole).optional(),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Common ID validation
export const idSchema = z.string().min(1, 'ID is required')

// Bulk operation schemas
export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
})

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one ID is required'),
  data: z.record(z.any()),
})

// Export types for TypeScript
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreatePackageInput = z.infer<typeof createPackageSchema>
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>
export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreateChatInput = z.infer<typeof createChatSchema>
export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type PackageSearchInput = z.infer<typeof packageSearchSchema>
export type TripSearchInput = z.infer<typeof tripSearchSchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
export type CreateDisputeInput = z.infer<typeof createDisputeSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
