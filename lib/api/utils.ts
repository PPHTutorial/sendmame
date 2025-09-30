// Fakomame Platform - API Utilities
import { NextRequest, NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'
import type { ApiResponse, ValidationError } from '@/lib/types'

// Custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationApiError extends ApiError {
  constructor(
    message: string,
    public details: ValidationError[],
    statusCode: number = 400
  ) {
    super(message, statusCode, 'VALIDATION_ERROR')
    this.name = 'ValidationApiError'
  }
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse['pagination']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    pagination,
  })
}

// Error response helper
export function createErrorResponse(
  error: string | ApiError,
  statusCode?: number
): NextResponse<ApiResponse> {
  if (typeof error === 'string') {
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: statusCode || 500 }
    )
  }

  const response: ApiResponse = {
    success: false,
    error: error.message,
  }

  if (error instanceof ValidationApiError) {
    return NextResponse.json(response, {
      status: error.statusCode,
      headers: {
        'X-Error-Code': error.code || 'VALIDATION_ERROR'
      }
    })
  }

  return NextResponse.json(response, {
    status: error.statusCode,
    headers: {
      'X-Error-Code': error.code || 'API_ERROR'
    }
  })
}

// Validation helper
export function validateRequestBody<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation error:', error.errors)
      const validationErrors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        // details: err.fatal,
      }))

      throw new ValidationApiError(
        validationErrors[0].message,
        validationErrors,
        validationErrors[0].code === 'invalid_type' ? 422 : 400
      )
    }
    throw error
  }
}

// Request parsing helpers
export async function parseRequestBody<T>(
  request: NextRequest,
  schema?: ZodSchema<T>): Promise<T> {
  try {
    const body = await request.json()


    if (schema) {
      return validateRequestBody(schema, body)
    }

    return body
  } catch (error) {
    if (error instanceof ValidationApiError) {
      throw error
    }
    throw new ApiError('Invalid JSON in request body', 400)
  }
}

export function parseSearchParams(
  request: NextRequest,
  schema?: ZodSchema<any>
): any {
  const searchParams = request.nextUrl.searchParams
  const params: Record<string, any> = {}

  for (const [key, value] of searchParams.entries()) {
    // Handle array parameters (e.g., ?tags=a&tags=b)
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value)
      } else {
        params[key] = [params[key], value]
      }
    } else {
      // Try to parse as number or boolean
      if (value === 'true') {
        params[key] = true
      } else if (value === 'false') {
        params[key] = false
      } else if (!isNaN(Number(value)) && value !== '') {
        params[key] = Number(value)
      } else {
        params[key] = value
      }
    }
  }

  if (schema) {
    return validateRequestBody(schema, params)
  }

  return params
}

// Route handler wrapper with error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof ApiError) {
        return createErrorResponse(error)
      }

      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }))

        return createErrorResponse(
          new ValidationApiError('Validation failed', validationErrors)
        )
      }

      // Generic server error
      return createErrorResponse(
        'Internal server error',
        500
      )
    }
  }
}

// Authentication middleware for API routes
export async function withAuth<T extends [NextRequest, ...any[]]>(
  handler: (...args: T) => Promise<NextResponse>,
  options: {
    allowedRoles?: string[]
    requireVerification?: boolean
  } = {}
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const [request] = args
      const { requireAuth, requireRole } = await import('@/lib/auth')

      // Get user from JWT token
      const userPayload = await requireAuth(request)

      // Check role if specified
      if (options.allowedRoles) {
        requireRole(userPayload.role, options.allowedRoles)
      }

      // Check verification if required
      if (options.requireVerification) {
        // Note: This would require database lookup in a real implementation
        // For now, we'll assume the token contains verification status
      }

      // Add user to request context
      (request as any).user = userPayload

      return await handler(...args)
    } catch (error) {
      if (error instanceof Error) {
        return createErrorResponse(error.message, 401)
      }
      return createErrorResponse('Authentication failed', 401)
    }
  }
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit<T extends [NextRequest, ...any[]]>(
  handler: (...args: T) => Promise<NextResponse>,
  options: {
    maxRequests: number
    windowMs: number
    keyGenerator?: (request: NextRequest) => string
  }
) {
  return async (...args: T): Promise<NextResponse> => {
    const [request] = args
    const key = options.keyGenerator
      ? options.keyGenerator(request)
      : request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous'

    const now = Date.now()
    const userLimit = rateLimitMap.get(key)

    if (!userLimit || now > userLimit.resetTime) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      })
    } else if (userLimit.count >= options.maxRequests) {
      return createErrorResponse(
        'Too many requests. Please try again later.',
        429
      )
    } else {
      userLimit.count++
    }

    return await handler(...args)
  }
}

// CORS helper
export function withCors<T extends [NextRequest, ...any[]]>(
  handler: (...args: T) => Promise<NextResponse>,
  options: {
    origin?: string | string[]
    methods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
  } = {}
) {
  return async (...args: T): Promise<NextResponse> => {
    const [request] = args
    const origin = request.headers.get('origin')

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 })

      if (options.origin) {
        if (Array.isArray(options.origin)) {
          if (origin && options.origin.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin)
          }
        } else if (options.origin === '*' || options.origin === origin) {
          response.headers.set('Access-Control-Allow-Origin', options.origin)
        }
      }

      if (options.methods) {
        response.headers.set('Access-Control-Allow-Methods', options.methods.join(', '))
      }

      if (options.allowedHeaders) {
        response.headers.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '))
      }

      if (options.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }

      return response
    }

    // Handle actual request
    const response = await handler(...args)

    if (options.origin) {
      if (Array.isArray(options.origin)) {
        if (origin && options.origin.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin)
        }
      } else if (options.origin === '*' || options.origin === origin) {
        response.headers.set('Access-Control-Allow-Origin', options.origin)
      }
    }

    if (options.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    return response
  }
}

// Pagination helper
export function calculatePagination(
  page: number = 1,
  limit: number = 20,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  const skip = (page - 1) * limit

  return {
    page,
    limit,
    total,
    totalPages,
    skip,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

// Database query helpers
export function buildWhereClause(filters: Record<string, any>, modelType?: 'package' | 'trip') {
  const where: Record<string, any> = {}

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'search' && typeof value === 'string') {
        if (modelType === 'package') {
          where.OR = [
            { title: { contains: value, mode: 'insensitive' } },
            { description: { contains: value, mode: 'insensitive' } },
            { category: { contains: value, mode: 'insensitive' } },
            { pickupLocationAddress: { contains: value, mode: 'insensitive' } },
            { dropoffLocationAddress: { contains: value, mode: 'insensitive' } },
          ]
        } else if (modelType === 'trip') {
          where.OR = [
            { title: { contains: value, mode: 'insensitive' } },
            { description: { contains: value, mode: 'insensitive' } },
            { transportMode: { contains: value, mode: 'insensitive' } },
            { departureCity: { contains: value, mode: 'insensitive' } },
            { arrivalCity: { contains: value, mode: 'insensitive' } },
          ]
        }
      } else if (key.endsWith('Min')) {
        const field = key.replace('Min', '')
        where[field] = { ...where[field], gte: Number(value) }
      } else if (key.endsWith('Max')) {
        const field = key.replace('Max', '')
        where[field] = { ...where[field], lte: Number(value) }
      } else if (key.endsWith('From')) {
        const field = key.replace('From', '')
        where[field] = { ...where[field], gte: new Date(value as string) }
      } else if (key.endsWith('To')) {
        const field = key.replace('To', '')
        where[field] = { ...where[field], lte: new Date(value as string) }
      } else if (typeof value === 'boolean') {
        where[key] = value
      }
      else {
        where[key] = value
      }
    }
  }

  return where
}

// Location/distance query helper
export function buildLocationFilter(
  latitude: number,
  longitude: number,
  radiusKm: number = 50
) {
  // Convert radius from km to degrees (rough approximation)
  const radiusDegrees = radiusKm / 111.32

  return {
    latitude: {
      gte: latitude - radiusDegrees,
      lte: latitude + radiusDegrees,
    },
    longitude: {
      gte: longitude - radiusDegrees,
      lte: longitude + radiusDegrees,
    },
  }
}

// File upload helper
export async function handleFileUpload(
  request: NextRequest,
  options: {
    maxSize?: number
    allowedTypes?: string[]
    field?: string
  } = {}
): Promise<File[]> {
  try {
    const formData = await request.formData()
    const files: File[] = []

    for (const [key, value] of formData.entries()) {
      if (options.field && key !== options.field) continue

      if (value instanceof File) {
        // Validate file size
        if (options.maxSize && value.size > options.maxSize) {
          throw new ApiError(`File ${value.name} is too large`, 400)
        }

        // Validate file type
        if (options.allowedTypes && !options.allowedTypes.includes(value.type)) {
          throw new ApiError(`File type ${value.type} is not allowed`, 400)
        }

        files.push(value)
      }
    }

    return files
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Failed to parse file upload', 400)
  }
}
