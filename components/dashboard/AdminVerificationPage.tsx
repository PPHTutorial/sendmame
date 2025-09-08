'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Search,
  Eye,
  Check,
  X,
  Clock,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Maximize,
  Minimize
} from 'lucide-react'
import { MetricCard, DataTable, SkeletonLoader } from '@/components/ui/dashboard-components'

interface VerificationDocument {
  id: string
  userId: string
  type: string
  documentUrl: string
  backDocumentUrl?: string | null
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  rejectionReason: string | null
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
}

interface UserGroup {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar: string | null
    verificationStatus: string
    createdAt: string
  }
  documents: VerificationDocument[]
  latestSubmission: string
  hasRejected: boolean
  hasVerified: boolean
  hasPending: boolean
}

interface VerificationMetrics {
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
}

interface DocumentViewerProps {
  userGroup: UserGroup
  onClose: () => void
  onApprove: (docId: string, docType: string) => void
  onReject: (docId: string, reason: string, docType: string) => void
}

function DocumentViewer({ userGroup, onClose, onApprove, onReject }: DocumentViewerProps) {
  const [currentDocIndex, setCurrentDocIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // 0 for front, 1 for back
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentFileType, setCurrentFileType] = useState<'image' | 'pdf'>('image')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  const currentDoc = userGroup.documents[currentDocIndex]
  const currentImages = [
    currentDoc.documentUrl,
    ...(currentDoc.backDocumentUrl ? [currentDoc.backDocumentUrl] : [])
  ].filter(Boolean)

  // Helper function to detect file type
  const getFileType = (url: string): 'image' | 'pdf' => {
    const lowercaseUrl = url.toLowerCase()
    if (lowercaseUrl.includes('data:application/pdf')) {
      return 'pdf'
    }
    return 'image'
  }

  // Update file type when image changes
  useEffect(() => {
    if (currentImages[currentImageIndex]) {
      const fileType = getFileType(currentImages[currentImageIndex])
      setCurrentFileType(fileType)

    }
  }, [currentImages, currentImageIndex, currentDoc, currentDocIndex])

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isFullscreen])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1 && currentFileType === 'image') {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1 && currentFileType === 'image') {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const resetTransform = () => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
    if (zoom <= 1) {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(currentDoc.id, rejectionReason, currentDoc.type)
      setShowRejectForm(false)
      setRejectionReason('')
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'passport': return 'Passport'
      case 'driver_license': return 'Driver License'
      case 'national_id': return 'National ID'
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'
      case 'VERIFIED': return 'text-green-600 bg-green-100'
      case 'REJECTED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getGroupStatus = () => {
    if (userGroup.hasVerified && !userGroup.hasPending) return 'VERIFIED'
    if (userGroup.hasPending) return 'PENDING'
    if (userGroup.hasRejected) return 'REJECTED'
    return 'PENDING'
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 md:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Verification Documents Review
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {userGroup.user.firstName} {userGroup.user.lastName} - {userGroup.documents.length} document{userGroup.documents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Document Navigation */}
          {userGroup.documents.length > 1 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {userGroup.documents.map((doc, index) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setCurrentDocIndex(index)
                    setCurrentImageIndex(0)
                    resetTransform()
                    // Reset file type when switching documents
                    if (userGroup.documents[index].documentUrl) {
                      setCurrentFileType(getFileType(userGroup.documents[index].documentUrl))
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${index === currentDocIndex
                    ? 'bg-teal-100 border-teal-300 text-teal-800'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {getDocumentTypeLabel(doc.type)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-y-scroll">
          {/* Document Display */}
          <div className="flex-1 p-4 md:p-6 bg-gray-50 flex flex-col min-h-0 lg:min-h-0" style={{ minHeight: '60vh' }}>
            {/* Image Navigation for front/back */}
            {currentImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <button
                  onClick={() => {
                    setCurrentImageIndex(0)
                    resetTransform()
                    // Update file type for front image
                    if (currentImages[0]) {
                      setCurrentFileType(getFileType(currentImages[0]))
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded ${currentImageIndex === 0
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  Front
                </button>
                <button
                  onClick={() => {
                    setCurrentImageIndex(1)
                    resetTransform()
                    // Update file type for back image
                    if (currentImages[1]) {
                      setCurrentFileType(getFileType(currentImages[1]))
                    }
                  }}
                  className={`px-3 py-1 text-xs rounded ${currentImageIndex === 1
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                >
                  Back
                </button>
              </div>
            )}

            {/* Image Controls */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {currentFileType === 'image' && (
                <>
                  <button
                    onClick={handleZoomOut}
                    className="p-2 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50"
                    disabled={zoom <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600 min-w-16 text-center">
                    {`${Math.round(zoom * 100)}%`}
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 bg-white rounded-lg shadow hover:bg-gray-50 disabled:opacity-50"
                    disabled={zoom >= 5}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={resetTransform}
                    className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                    disabled={currentFileType !== 'image' || (zoom === 1 && position.x === 0 && position.y === 0)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
              {zoom > 1 && currentFileType === 'image' && !isFullscreen && (
                <div className="text-xs text-gray-500 ml-2 flex items-center gap-1">
                  <Move className="h-3 w-3" />
                  Drag to pan
                </div>
              )}
            </div>

            {/* Image Display */}
            <div
              ref={imageRef}
              className={`bg-white rounded-lg border-2 border-dashed border-gray-300 flex-1 flex items-center justify-center relative overflow-hidden ${currentFileType === 'pdf' ? 'cursor-default' : 'cursor-move'}`}
              style={{ minHeight: '40vh' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {currentImages[currentImageIndex] ? (
                <>
                  {currentFileType === 'pdf' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center min-h-[40vh]">
                      <embed
                        src={currentImages[currentImageIndex]}
                        type="application/pdf"
                        className="w-full h-full min-h-[40vh] rounded"
                        style={{ minHeight: '40vh' }}
                      />
                      <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                        PDF
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={currentImages[currentImageIndex]}
                        alt={`${getDocumentTypeLabel(currentDoc.type)} document`}
                        className="max-w-full max-h-full transition-transform select-none"
                        style={{
                          transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                        }}
                        onClick={(e) => {
                          if (zoom <= 1) {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const centerX = rect.width / 2
                            const centerY = rect.height / 2
                            const clickX = e.clientX - rect.left
                            const clickY = e.clientY - rect.top

                            setZoom(2)
                            setPosition({
                              x: (centerX - clickX) * 2,
                              y: (centerY - clickY) * 2
                            })
                          }
                        }}
                        draggable={false}
                      />
                    </>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No document available</p>
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white flex-shrink-0 max-h-[40vh] lg:max-h-none overflow-scroll">
            <div className="h-full overflow-y-auto p-4 md:p-6">
              {/* User Info */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">User Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      {userGroup.user.avatar ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={userGroup.user.avatar}
                            alt="User avatar"
                            className="h-10 w-10 rounded-full"
                          />
                        </>
                      ) : (
                        <User className="h-5 w-5 text-gray-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {userGroup.user.firstName} {userGroup.user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">{userGroup.user.email}</div>
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">Overall Status: </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getGroupStatus())}`}>
                      {getGroupStatus()}
                    </span>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">Member since: </span>
                    <span className="text-gray-900">
                      {new Date(userGroup.user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Document Info */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Current Document</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Type: </span>
                    <span className="text-gray-900">{getDocumentTypeLabel(currentDoc.type)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status: </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(currentDoc.status)}`}>
                      {currentDoc.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted: </span>
                    <span className="text-gray-900">
                      {new Date(currentDoc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {currentDoc.verifiedAt && (
                    <div>
                      <span className="text-gray-500">Verified: </span>
                      <span className="text-gray-900">
                        {new Date(currentDoc.verifiedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {currentDoc.rejectionReason && (
                    <div>
                      <span className="text-gray-500">Rejection Reason: </span>
                      <span className="text-red-600 text-xs">{currentDoc.rejectionReason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* All Documents Summary */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">All Documents ({userGroup.documents.length})</h4>
                <div className="space-y-2">
                  {userGroup.documents.map((doc, index) => (
                    <div
                      key={doc.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${index === currentDocIndex
                        ? 'border-teal-300 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => {
                        setCurrentDocIndex(index)
                        setCurrentImageIndex(0)
                        resetTransform()
                        // Reset file type when switching documents
                        if (userGroup.documents[index].documentUrl) {
                          setCurrentFileType(getFileType(userGroup.documents[index].documentUrl))
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{getDocumentTypeLabel(doc.type)}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}

              <div className="space-y-3">
                <button
                  onClick={() => onApprove(currentDoc.id, currentDoc.type)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Check className="h-4 w-4" />
                  Approve This Document
                </button>

                {!showRejectForm ? (
                  <button
                    onClick={() => setShowRejectForm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <X className="h-4 w-4" />
                    Reject This Document
                  </button>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleReject}
                        disabled={!rejectionReason.trim()}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setShowRejectForm(false)
                          setRejectionReason('')
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => window.open(currentImages[currentImageIndex], '_blank')}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download Image
                </button>
              </div>
              {/* End Actions */}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-[60]">
          <div className="relative w-full h-full flex flex-col">
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-sm text-white">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold">
                  {getDocumentTypeLabel(currentDoc.type)} - {userGroup.user.firstName} {userGroup.user.lastName}
                </h3>
                {currentImages.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCurrentImageIndex(0)
                        resetTransform()
                        if (currentImages[0]) {
                          setCurrentFileType(getFileType(currentImages[0]))
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded ${currentImageIndex === 0
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Front
                    </button>
                    <button
                      onClick={() => {
                        setCurrentImageIndex(1)
                        resetTransform()
                        if (currentImages[1]) {
                          setCurrentFileType(getFileType(currentImages[1]))
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded ${currentImageIndex === 1
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Fullscreen Image Controls */}
                {currentFileType === 'image' && (
                  <>
                    <button
                      onClick={handleZoomOut}
                      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      disabled={zoom <= 0.5}
                    >
                      <ZoomOut className="h-4 w-4 text-white" />
                    </button>
                    <span className="text-sm text-gray-300 min-w-16 text-center">
                      {`${Math.round(zoom * 100)}%`}
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      disabled={zoom >= 5}
                    >
                      <ZoomIn className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={resetTransform}
                      className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                    >
                      <RotateCw className="h-4 w-4 text-white" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                  <Minimize className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            {/* Fullscreen Content */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div 
                className="relative w-full h-full flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {currentImages[currentImageIndex] ? (
                  currentFileType === 'pdf' ? (
                    <embed
                      src={currentImages[currentImageIndex]}
                      type="application/pdf"
                      className="w-full h-full"
                    />
                  ) : (
                    <img
                      src={currentImages[currentImageIndex]}
                      alt={`${getDocumentTypeLabel(currentDoc.type)} document`}
                      className="max-w-full max-h-full object-contain transition-transform select-none"
                      style={{
                        transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                        cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
                      }}
                      onClick={(e) => {
                        if (zoom <= 1) {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const centerX = rect.width / 2
                          const centerY = rect.height / 2
                          const clickX = e.clientX - rect.left
                          const clickY = e.clientY - rect.top
                          
                          setZoom(2)
                          setPosition({
                            x: (centerX - clickX) * 2,
                            y: (centerY - clickY) * 2
                          })
                        }
                      }}
                      draggable={false}
                    />
                  )
                ) : (
                  <div className="text-center text-white">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No document available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fullscreen Footer with drag instructions */}
            {zoom > 1 && currentFileType === 'image' && (
              <div className="text-center p-2 bg-black/40 backdrop-blur-sm text-gray-300 text-sm">
                <div className="flex items-center justify-center gap-1">
                  <Move className="h-3 w-3" />
                  Drag to pan • Press ESC or click minimize to exit fullscreen
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminVerificationPage() {
  const [userGroups, setUserGroups] = useState<UserGroup[]>([])
  const [_metrics, setMetrics] = useState<VerificationMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    pageSize: 20
  })
  const [selectedUserGroup, setSelectedUserGroup] = useState<UserGroup | null>(null)

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedStatus) params.append('status', selectedStatus)
      if (selectedType) params.append('type', selectedType)

      const response = await fetch(`/api/dashboard/verification/list?${params}`)
      if (!response.ok) throw new Error('Failed to fetch verification documents')

      const data = await response.json()
      setUserGroups(data.userGroups)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [page, searchTerm, selectedStatus, selectedType, pagination.pageSize])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/verification')
      if (!response.ok) throw new Error('Failed to fetch verification metrics')

      const data = await response.json()
      setMetrics({
        totalRequests: data.totalDocuments,
        pendingRequests: data.statusBreakdown.find((s: any) => s.status === 'PENDING')?.count || 0,
        approvedRequests: data.statusBreakdown.find((s: any) => s.status === 'VERIFIED')?.count || 0,
        rejectedRequests: data.statusBreakdown.find((s: any) => s.status === 'REJECTED')?.count || 0
      })
    } catch (err) {
      console.error('Error fetching verification metrics:', err)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleApprove = async (docId: string, docType: string) => {
    try {
      const response = await fetch(`/api/dashboard/verification/${docId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ docType })
      })

      if (!response.ok) throw new Error('Failed to approve document')

      // Refresh data
      await fetchDocuments()
      await fetchMetrics()
      setSelectedUserGroup(null)
    } catch (err) {
      console.error('Error approving document:', err)
    }
  }

  const handleReject = async (docId: string, reason: string, docType: string) => {
    try {
      const response = await fetch(`/api/dashboard/verification/${docId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason, docType })
      })

      if (!response.ok) throw new Error('Failed to reject document')

      // Refresh data
      await fetchDocuments()
      await fetchMetrics()
      setSelectedUserGroup(null)
    } catch (err) {
      console.error('Error rejecting document:', err)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleFilterChange = (type: string, value: string) => {
    setPage(1)
    switch (type) {
      case 'status':
        setSelectedStatus(value)
        break
      case 'type':
        setSelectedType(value)
        break
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'VERIFIED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-3 w-3" />
      case 'VERIFIED': return <ShieldCheck className="h-3 w-3" />
      case 'REJECTED': return <ShieldX className="h-3 w-3" />
      default: return <Shield className="h-3 w-3" />
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'passport': return 'Passport'
      case 'driver_license': return 'Driver License'
      case 'national_id': return 'National ID'
      default: return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  }

  const getGroupStatus = (group: UserGroup) => {
    if (group.hasVerified && !group.hasPending) return 'VERIFIED'
    if (group.hasPending) return 'PENDING'
    if (group.hasRejected) return 'REJECTED'
    return 'PENDING'
  }

  const getGroupStatusCount = (group: UserGroup) => {
    const pending = group.documents.filter(d => d.status === 'PENDING').length
    const verified = group.documents.filter(d => d.status === 'VERIFIED').length
    const rejected = group.documents.filter(d => d.status === 'REJECTED').length

    return { pending, verified, rejected }
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_: any, group: UserGroup) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            {group.user.avatar ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={group.user.avatar}
                  alt="User avatar"
                  className="h-10 w-10 rounded-full"
                />
              </>
            ) : (
              <User className="h-5 w-5 text-gray-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {group.user.firstName} {group.user.lastName}
            </div>
            <div className="text-sm text-gray-500 truncate">{group.user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'documents',
      label: 'Documents',
      render: (_: any, group: UserGroup) => (
        <div className="space-y-1">
          <div className="text-sm font-medium">
            {group.documents.length} document{group.documents.length !== 1 ? 's' : ''}
          </div>
          <div className="flex flex-wrap gap-1">
            {group.documents.map((doc) => (
              <span
                key={doc.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                <FileText className="h-3 w-3" />
                {getDocumentTypeLabel(doc.type)}
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, group: UserGroup) => {
        const status = getGroupStatus(group)
        const counts = getGroupStatusCount(group)

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {getStatusIcon(status)}
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {counts.verified > 0 && <span className="text-green-600">{counts.verified}✓ </span>}
              {counts.pending > 0 && <span className="text-yellow-600">{counts.pending}⏳ </span>}
              {counts.rejected > 0 && <span className="text-red-600">{counts.rejected}✗</span>}
            </div>
          </div>
        )
      }
    },
    {
      key: 'latestSubmission',
      label: 'Latest Submission',
      render: (value: string) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Calendar className="h-3 w-3" />
          {formatDate(value)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, group: UserGroup) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedUserGroup(group)}
            className="p-1 text-gray-400 hover:text-teal-600"
            title="Review Documents"
          >
            <Eye className="h-4 w-4" />
          </button>
          {group.hasPending && (
            <div className="flex items-center gap-1">
              <button
                onClick={async () => {
                  const pendingDocs = group.documents.filter((d) => d.status === 'PENDING')
                  for (const doc of pendingDocs) {
                    await handleApprove(doc.id, doc.type)
                  }
                }}
                className="p-1 text-gray-400 hover:text-green-600"
                title="Quick Approve First Pending"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )
    }
  ]

  if (loading && userGroups.length === 0) {
    return <SkeletonLoader type="dashboard" />  
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Verification Requests</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Verification Management</h1>
          <p className="text-gray-600 mt-2">Review and manage user verification documents</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => fetchDocuments()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Metrics */}
      {/*{metrics && (
         <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <MetricCard
            title="Total Requests"
            value={metrics.totalRequests}
            icon={<FileText className="h-5 w-5" />}
          />
          <MetricCard
            title="Pending Review"
            value={metrics.pendingRequests}
            subtitle={`${((metrics.pendingRequests / metrics.totalRequests) * 100).toFixed(1)}% of total`}
            icon={<Clock className="h-5 w-5" />}
          />
          <MetricCard
            title="Approved"
            value={metrics.approvedRequests}
            subtitle={`${((metrics.approvedRequests / metrics.totalRequests) * 100).toFixed(1)}% success rate`}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <MetricCard
            title="Rejected"
            value={metrics.rejectedRequests}
            subtitle={`${((metrics.rejectedRequests / metrics.totalRequests) * 100).toFixed(1)}% rejection rate`}
            icon={<ShieldX className="h-5 w-5" />}
          />
        </div> 
      )}*/}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Document Types</option>
            <option value="passport">Passport</option>
            <option value="driver_license">Driver License</option>
            <option value="national_id">National ID</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedStatus('')
              setSelectedType('')
              setPage(1)
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* User Groups Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <DataTable
            data={userGroups}
            columns={columns}
            pagination={{
              page,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onPageChange: setPage
            }}
          />
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedUserGroup && (
        <DocumentViewer
          userGroup={selectedUserGroup}
          onClose={() => setSelectedUserGroup(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
