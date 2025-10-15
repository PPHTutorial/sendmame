/* eslint-disable @typescript-eslint/no-empty-object-type */
// Amenade Platform - Core Type Definitions
import { 
  User, 
  UserProfile, 
  Package, 
  Trip, 
  Chat, 
  Message, 
  Review, 
  Wallet, 
  Transaction, 
  PaymentMethod,
  Notification,
  Dispute,
  TrackingEvent,
  UserRole,
  PackageStatus,
  TripStatus,
  PaymentStatus,
  TransactionType,
  NotificationType,
  DisputeStatus,
  VerificationStatus,
  ChatType
} from '@prisma/client'

// Extended types with relations
export interface ExtendedUser extends User {
  profile?: UserProfile
  wallet?: Wallet
  sentPackages?: Package[]
  receivedPackages?: Package[]
  trips?: Trip[]
  givenReviews?: Review[]
  receivedReviews?: Review[]
  notifications?: Notification[]
}

export interface ExtendedPackage extends Package {
  sender: User
  receiver?: User
  trip?: Trip & { traveler: User }
  chats?: Chat[]
  trackingEvents?: TrackingEvent[]
}

export interface ExtendedTrip extends Trip {
  traveler: User & { profile?: UserProfile }
  packages?: Package[]
  chats?: Chat[]
}

export interface ExtendedChat extends Chat {
  participants: Array<{
    user: User
    joinedAt: Date
    lastReadAt?: Date
  }>
  messages: Array<Message & { sender: User }>
  package?: Package
  trip?: Trip
}

export interface ExtendedTransaction extends Transaction {
  user: User
  paymentMethod?: PaymentMethod
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Authentication types
export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  isVerified: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
}

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
  type?: string // For refresh tokens
  iat: number
  exp: number
}

// Package creation/update types
export interface CreatePackageData {
  title: string
  description: string
  category: string
  dimensions: {
    length: number
    width: number
    height: number
    weight: number
  }
  value?: number
  isFragile: boolean
  requiresSignature: boolean
  pickupAddress: AddressData
  deliveryAddress: AddressData
  pickupDate: string
  deliveryDate: string
  offeredPrice: number
  finalPrice: number
  currency: string
  specialInstructions?: string
  images?: string[]
}

export interface UpdatePackageData extends Partial<CreatePackageData> {
  status?: PackageStatus
}

// Trip creation/update types
export interface CreateTripData {
  originAddress: AddressData
  destinationAddress: AddressData
  departureDate: string
  arrivalDate: string
  maxWeight: number
  maxDimensions: {
    length: number
    width: number
    height: number
  }
  transportMode: string
  pricePerKg?: number
  minimumPrice?: number
  maximumPrice?: number
  packageTypes?: string[]
  restrictions?: string[]
}

export interface UpdateTripData extends Partial<CreateTripData> {
  status?: TripStatus
}

// Address and location types
export interface AddressData {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  latitude: number
  longitude: number
  formattedAddress?: string
}

export interface LocationCoordinates {
  latitude: number
  longitude: number
}

// Chat and messaging types
export interface CreateChatData {
  type: ChatType
  packageId?: string
  tripId?: string
  participantIds: string[]
}

export interface AttachmentData {
  name: string;
  data: string; 
  type: string;
}

export interface SendMessageData {
  chatId: string
  content: string
  messageType?: string
  attachments?: string[]
}

// Payment types
export interface CreatePaymentData {
  amount: number
  currency: string
  packageId?: string
  tripId?: string
  paymentMethodId: string
  description?: string
}

export interface PaymentIntentData {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
}

// Search and filtering types
export interface PackageSearchFilters {
  origin?: LocationCoordinates & { radius?: number }
  destination?: LocationCoordinates & { radius?: number }
  dateFrom?: string
  dateTo?: string
  priceMin?: number
  priceMax?: number
  category?: string
  maxWeight?: number
  isFragile?: boolean
}

export interface TripSearchFilters {
  origin?: LocationCoordinates & { radius?: number }
  destination?: LocationCoordinates & { radius?: number }
  dateFrom?: string
  dateTo?: string
  transportMode?: string
  availableWeight?: number
  priceRange?: { min?: number; max?: number }
}

// Notification types
export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  packageId?: string
  tripId?: string
  chatId?: string
  metadata?: Record<string, any>
}

// Review types
export interface CreateReviewData {
  receiverId: string
  rating: number
  comment?: string
  category: string
  packageId?: string
  tripId?: string
}

// File upload types
export interface FileUploadData {
  file: File
  type: 'image' | 'document' | 'verification'
  category?: string
}

export interface UploadedFile {
  url: string
  filename: string
  size: number
  type: string
}

// Real-time events
export interface SocketEvent {
  event: string
  data: any
  timestamp: Date
  userId?: string
}

export interface MessageEvent extends SocketEvent {
  event: 'new_message'
  data: Message & { sender: User }
}

export interface PackageUpdateEvent extends SocketEvent {
  event: 'package_updated'
  data: {
    packageId: string
    status: PackageStatus
    updates: Partial<Package>
  }
}

export interface LocationUpdateEvent extends SocketEvent {
  event: 'location_updated'
  data: {
    userId: string
    location: LocationCoordinates
    timestamp: Date
  }
}

// Analytics and dashboard types
export interface DashboardStats {
  totalPackages: number
  activePackages: number
  completedDeliveries: number
  totalEarnings: number
  avgRating: number
  successRate: number
}

export interface AdminDashboardStats extends DashboardStats {
  totalUsers: number
  totalTrips: number
  totalRevenue: number
  platformFees: number
  activeDisputes: number
}

// Error types
export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ApiError {
  message: string
  code: string
  statusCode: number
  details?: ValidationError[]
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Form types for UI components
export interface PackageFormData extends CreatePackageData {}
export interface TripFormData extends CreateTripData {}
export interface ProfileFormData {
  firstName: string
  lastName: string
  bio?: string
  occupation?: string
  languages: string[]
  currentCity?: string
  currentCountry?: string
  timeZone?: string
  pushNotifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
}

// Map and geolocation types
export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface RouteData {
  distance: number // in meters
  duration: number // in seconds
  polyline: string
  steps: Array<{
    instruction: string
    distance: number
    duration: number
    startLocation: LocationCoordinates
    endLocation: LocationCoordinates
  }>
}

// Export all Prisma enums for use in components
export {
  UserRole,
  VerificationStatus,
  PackageStatus,
  TripStatus,
  PaymentStatus,
  TransactionType,
  NotificationType,
  DisputeStatus,
  ChatType
}


// Types
export type ActiveTab = 'packages' | 'trips'
export type PackageSortBy = 'title' | 'createdAt' | 'updatedAt' | 'offeredPrice' | 'finalPrice' | 'value' | 'pickupDate' | 'deliveryDate' | 'category' | 'priority'
export type TripSortBy = 'title' | 'createdAt' | 'updatedAt' | 'departureDate' | 'arrivalDate' | 'pricePerKg' | 'minimumPrice' | 'maximumPrice' | 'maxWeight' | 'availableSpace' | 'transportMode'
export type SortOrder = 'asc' | 'desc'

// Updated Package filter interface - matching Prisma schema
export interface PackageFiltersState {
    status?: string
    category?: string
    offeredPriceMin?: number
    offeredPriceMax?: number
    finalPriceMin?: number
    finalPriceMax?: number
    valueMin?: number
    valueMax?: number
    pickupDateFrom?: string
    pickupDateTo?: string
    deliveryDateFrom?: string
    deliveryDateTo?: string
    isFragile?: boolean
    requiresSignature?: boolean
    priority?: string
    pickupCity?: string
    pickupCountry?: string
    deliveryCity?: string
    deliveryCountry?: string
}

// Updated Trip filter interface - matching Prisma schema
export interface TripFiltersState {
    status?: string
    transportMode?: string
    pricePerKgMin?: number
    pricePerKgMax?: number
    minimumPriceMin?: number
    minimumPriceMax?: number
    maximumPriceMin?: number
    maximumPriceMax?: number
    departureDateFrom?: string
    departureDateTo?: string
    arrivalDateFrom?: string
    arrivalDateTo?: string
    maxWeightMin?: number
    maxWeightMax?: number
    availableSpaceMin?: number
    availableSpaceMax?: number
    flexibleDates?: boolean
    originCity?: string
    originCountry?: string
    destinationCity?: string
    destinationCountry?: string
}

export interface PackageQueryParams {
    page: number
    limit: number
    sortBy: PackageSortBy
    sortOrder: SortOrder
    search?: string
    [key: string]: any // Allow for dynamic filter keys
}

export interface TripQueryParams {
    page: number
    limit: number
    sortBy: TripSortBy
    sortOrder: SortOrder
    search?: string
    [key: string]: any // Allow for dynamic filter keys
}
