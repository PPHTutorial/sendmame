'use client'

import React, { useState } from 'react'
import { 
  Star, 
  MessageSquare,
  User,
  Package,
  RefreshCw,
  Search,
  Download,
  Eye,
  MoreVertical,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Flag
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Review {
  id: string
  fromUserId: string
  toUserId: string
  packageId?: string
  tripId?: string
  rating: number
  comment?: string
  isPublic: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
  fromUser: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  toUser: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  package?: {
    id: string
    title: string
  }
  trip?: {
    id: string
  }
}

export default function ReviewsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('')
  const [page, setPage] = useState(1)
  const [openActionDropdown, setOpenActionDropdown] = useState<string | null>(null)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showModerationModal, setShowModerationModal] = useState(false)

  const queryClient = useQueryClient()

  // Fetch reviews
  const { data: reviewsData, isLoading, error } = useQuery({
    queryKey: ['dashboard-reviews', page, searchTerm, ratingFilter, verificationFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(ratingFilter && { rating: ratingFilter }),
        ...(verificationFilter && { verification: verificationFilter })
      })
      
      const response = await fetch(`/api/dashboard/reviews?${params}`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      return response.json()
    }
  })

  // Fetch review metrics
  const { data: metrics } = useQuery({
    queryKey: ['review-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/reviews/metrics')
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return response.json()
    }
  })

  // Moderate review mutation
  const moderateMutation = useMutation({
    mutationFn: async ({ reviewId, action, reason }: { reviewId: string, action: 'verify' | 'hide' | 'flag', reason?: string }) => {
      const response = await fetch(`/api/dashboard/reviews/${reviewId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })
      if (!response.ok) throw new Error('Failed to moderate review')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['review-metrics'] })
      setShowModerationModal(false)
    }
  })

  // Handle actions
  const handleViewReview = (review: Review) => {
    setSelectedReview(review)
    setShowDetailsModal(true)
    setOpenActionDropdown(null)
  }

  const handleModerateReview = (review: Review) => {
    setSelectedReview(review)
    setShowModerationModal(true)
    setOpenActionDropdown(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <ThumbsUp className="h-3 w-3 mr-1" />
        Verified
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Pending
      </span>
    )
  }

  const columns = [
    {
      key: 'rating',
      label: 'Rating',
      render: (_: any, review: Review) => (
        <div className="flex flex-col gap-1">
          {renderStars(review.rating)}
          {getVerificationBadge(review.isVerified)}
        </div>
      )
    },
    {
      key: 'users',
      label: 'Reviewer → Reviewee',
      render: (_: any, review: Review) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {review.fromUser.firstName} {review.fromUser.lastName}
          </div>
          <div className="text-gray-500 flex items-center gap-1">
            → {review.toUser.firstName} {review.toUser.lastName}
          </div>
        </div>
      )
    },
    {
      key: 'comment',
      label: 'Review',
      render: (_: any, review: Review) => (
        <div className="max-w-xs">
          {review.comment ? (
            <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
          ) : (
            <span className="text-gray-400 text-sm italic">No comment</span>
          )}
        </div>
      )
    },
    {
      key: 'context',
      label: 'Context',
      render: (_: any, review: Review) => (
        <div className="text-sm">
          {review.package && (
            <div className="flex items-center gap-1 text-blue-600">
              <Package className="h-3 w-3" />
              <span className="truncate max-w-24">{review.package.title}</span>
            </div>
          )}
          {review.trip && (
            <div className="flex items-center gap-1 text-purple-600">
              <MessageSquare className="h-3 w-3" />
              <span>Trip {review.trip.id.slice(0, 8)}...</span>
            </div>
          )}
          {!review.package && !review.trip && (
            <span className="text-gray-400">General</span>
          )}
        </div>
      )
    },
    {
      key: 'visibility',
      label: 'Visibility',
      render: (_: any, review: Review) => (
        <div className="text-sm">
          {review.isPublic ? (
            <span className="text-green-600 font-medium">Public</span>
          ) : (
            <span className="text-gray-500">Private</span>
          )}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, review: Review) => (
        <div className="relative" data-dropdown>
          <button
            onClick={() => setOpenActionDropdown(openActionDropdown === review.id ? null : review.id)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {openActionDropdown === review.id && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="py-1">
                <button
                  onClick={() => handleViewReview(review)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => handleModerateReview(review)}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                >
                  <Flag className="h-4 w-4" />
                  Moderate
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  if (isLoading) {
    return <SkeletonLoader type="dashboard" />  
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Reviews</h3>
            <p className="text-red-600">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  // Modal Components
  const ReviewDetailsModal = () => (
    showDetailsModal && selectedReview && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Review Details</h3>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {renderStars(selectedReview.rating, 'md')}
              {getVerificationBadge(selectedReview.isVerified)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Reviewer</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedReview.fromUser.firstName} {selectedReview.fromUser.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedReview.fromUser.email}</div>
                  <div><span className="font-medium">User ID:</span> {selectedReview.fromUser.id}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Reviewee</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedReview.toUser.firstName} {selectedReview.toUser.lastName}</div>
                  <div><span className="font-medium">Email:</span> {selectedReview.toUser.email}</div>
                  <div><span className="font-medium">User ID:</span> {selectedReview.toUser.id}</div>
                </div>
              </div>
            </div>

            {selectedReview.comment && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Review Comment</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  {selectedReview.comment}
                </div>
              </div>
            )}

            {(selectedReview.package || selectedReview.trip) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Context</h4>
                <div className="text-sm space-y-1">
                  {selectedReview.package && (
                    <div><span className="font-medium">Package:</span> {selectedReview.package.title} ({selectedReview.package.id})</div>
                  )}
                  {selectedReview.trip && (
                    <div><span className="font-medium">Trip ID:</span> {selectedReview.trip.id}</div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Review Settings</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Visibility:</span> {selectedReview.isPublic ? 'Public' : 'Private'}</div>
                <div><span className="font-medium">Verified:</span> {selectedReview.isVerified ? 'Yes' : 'No'}</div>
                <div><span className="font-medium">Created:</span> {formatDate(selectedReview.createdAt)}</div>
                <div><span className="font-medium">Updated:</span> {formatDate(selectedReview.updatedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )

  const ModerationModal = () => (
    showModerationModal && selectedReview && (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Moderate Review</h3>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              {renderStars(selectedReview.rating)}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              From: <span className="font-medium">{selectedReview.fromUser.firstName} {selectedReview.fromUser.lastName}</span>
            </p>
            <p className="text-sm text-gray-600">
              To: <span className="font-medium">{selectedReview.toUser.firstName} {selectedReview.toUser.lastName}</span>
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => moderateMutation.mutate({ reviewId: selectedReview.id, action: 'verify' })}
              disabled={moderateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <ThumbsUp className="h-4 w-4" />
              Verify Review
            </button>
            
            <button
              onClick={() => moderateMutation.mutate({ reviewId: selectedReview.id, action: 'hide' })}
              disabled={moderateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              <ThumbsDown className="h-4 w-4" />
              Hide Review
            </button>
            
            <button
              onClick={() => moderateMutation.mutate({ reviewId: selectedReview.id, action: 'flag' })}
              disabled={moderateMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Flag className="h-4 w-4" />
              Flag as Inappropriate
            </button>
            
            <button
              onClick={() => setShowModerationModal(false)}
              className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  )

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">Manage user reviews and ratings</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Reviews"
            value={metrics.totalReviews}
            icon={<MessageSquare className="h-5 w-5" />}
          />
          <MetricCard
            title="Average Rating"
            value={metrics.averageRating}
            subtitle="Overall rating"
            icon={<Star className="h-5 w-5" />}
          />
          <MetricCard
            title="Verified Reviews"
            value={metrics.verifiedReviews}
            subtitle={`${((metrics.verifiedReviews / metrics.totalReviews) * 100).toFixed(1)}% verified`}
            icon={<ThumbsUp className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Review"
            value={metrics.pendingReviews}
            icon={<Flag className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users or comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
            />
          </div>
          
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none focus:border-transparent"
          >
            <option value="">All Reviews</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Verification</option>
            <option value="public">Public Only</option>
            <option value="private">Private Only</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setRatingFilter('')
              setVerificationFilter('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <DataTable
        data={reviewsData?.reviews || []}
        columns={columns}
        pagination={{
          page,
          pageSize: 20,
          total: reviewsData?.pagination?.total || 0,
          onPageChange: setPage
        }}
      />

      {/* Modals */}
      <ReviewDetailsModal />
      <ModerationModal />
    </div>
  )
}

