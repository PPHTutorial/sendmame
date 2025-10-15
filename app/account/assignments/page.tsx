'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useAuth, usePackages, useTrips, useConfirmAssignment, useCancelAssignment, useFindOrCreateChat, useSendMessage } from '@/lib/hooks/api'
import { Button, Modal } from '@/components/ui'
import { PackageCard } from '@/components/packages/PackageCard'
import { TripCard } from '@/components/trips/TripCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Badge } from '@/components/ui'
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    MessageCircle,
    DollarSign,
    Calendar,
    MapPin,
    User,
    AlertCircle
} from 'lucide-react'
import { NavHeader } from '@/components/shared'
import { Footer } from '@/components/navigation'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import { useSearchParams, useRouter } from 'next/navigation'

import { MessagingInterface } from '@/components/shared/MessagingInterface'
import { AttachmentData } from '@/lib/types'
import { toastErrorStyle, toastSuccessStyle } from '@/lib/utils'
import { ContactDialog } from '@/components/shared/ContactDialog'
import { NegotiateDialog } from '@/components/shared/NegotiateDialog'
import { set } from 'date-fns'

const AuthGuard = dynamic(
    () => import('@/components/auth').then(mod => ({ default: mod.AuthGuard })),
    { ssr: false }
)

type AssignmentType = 'sent-packages' | 'received-packages' | 'my-trips'

interface AssignmentItem {
    id: string
    type: 'package' | 'trip'
    status: string
    createdAt: string
    updatedAt: string
    // Package specific
    title?: string
    description?: string
    offeredPrice?: number
    finalPrice?: number
    pickupAddress?: any
    deliveryAddress?: any
    pickupDate?: string
    deliveryDate?: string
    sender?: any
    receiver?: any
    trip?: any
    // Trip specific
    traveler?: any
    originAddress?: any
    destinationAddress?: any
    departureDate?: string
    arrivalDate?: string
    maxWeight?: number
    pricePerKg?: number
    availableSpace?: number
    transportMode?: string
    packages?: any[]
}

function AssignmentsPageContent() {
    const { getCurrentUser } = useAuth()
    const { data: user } = getCurrentUser
    const [selectedItem, setSelectedItem] = useState<any>(null)
    const [showContactInfo, setShowContactInfo] = useState<boolean>(false)
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState<boolean>(false)
    const [selectedChatItem, setSelectedChatItem] = useState<any>(null)
    const [isMessagingOpen, setIsMessagingOpen] = useState<boolean>(false)
    const [selectedNegotiationItem, setSelectedNegotiationItem] = useState<any>(null)
    const [isNegotiationOpen, setIsNegotiationOpen] = useState<boolean>(false)
    const findOrCreateChat = useFindOrCreateChat()
    const sendMessage = useSendMessage()

    const searchParams = useSearchParams()
    const router = useRouter()
    const [activeTab, setActiveTabState] = useState<AssignmentType>('sent-packages')

    // Sync activeTab with searchParams
    useEffect(() => {
        const tab = searchParams.get('tab') as AssignmentType
        if (tab && ['sent-packages', 'received-packages', 'my-trips'].includes(tab)) {
            setActiveTabState(tab)
        }
    }, [searchParams])

    const setActiveTab = (tab: AssignmentType) => {
        setActiveTabState(tab)
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', tab)
        router.replace(`?${params.toString()}`, { scroll: false })
    }

    const [assignments, setAssignments] = useState<AssignmentItem[]>([])
    const [loading, setLoading] = useState(true)



    // API hooks
    const packagesQuery = usePackages({
        page: 1,
        limit: 100, // Get all for assignments
    })

    const tripsQuery = useTrips({
        page: 1,
        limit: 100, // Get all for assignments
    })

    const confirmAssignment = useConfirmAssignment()
    const cancelAssignment = useCancelAssignment()

    // Load assignments based on active tab
    useEffect(() => {
        if (!user?.id) return

        setLoading(true)

        try {
            if (activeTab === 'sent-packages') {
                // Packages sent by user that are assigned to trips
                const sentPackages = packagesQuery.data?.data?.filter((pkg: any) =>
                    pkg.senderId === user.id && pkg.tripId
                ) || []
                console.log('Sent Packages:', sentPackages)
                setAssignments(sentPackages.map((pkg: any) => ({ ...pkg, type: 'package' })))
            } else if (activeTab === 'received-packages') {
                // Packages assigned to user's trips
                const receivedPackages = packagesQuery.data?.data?.filter((pkg: any) =>
                    pkg.trip?.travelerId === user.id
                ) || []
                setAssignments(receivedPackages.map((pkg: any) => ({ ...pkg, type: 'package' })))
            } else if (activeTab === 'my-trips') {
                // User's trips that have assigned packages
                const myTrips = tripsQuery.data?.data?.filter((trip: any) =>
                    trip.travelerId === user.id && trip.packages && trip.packages.length > 0
                ) || []
                setAssignments(myTrips.map((trip: any) => ({ ...trip, type: 'trip' })))
            }
        } catch (error) {
            console.error('Error loading assignments:', error)
            toast.error('Failed to load assignments')
        } finally {
            setLoading(false)
        }
    }, [activeTab, user?.id, packagesQuery.data, tripsQuery.data])


    const handleConfirmAssignment = async (itemId: string, itemType: 'package' | 'trip') => {
        try {
           setSelectedItem ({ id: itemId })
            await confirmAssignment.mutateAsync(itemId)
            toast.success('Assignment confirmed successfully!', toastSuccessStyle)
        } catch (error: any) {
            toast.error(error.message || 'Failed to confirm assignment', toastErrorStyle)
        }
    }
    
    const handleCancelAssignment = async (itemId: string, itemType: 'package' | 'trip', reason?: string) => {
        try {
            setSelectedItem({ id: itemId })
            await cancelAssignment.mutateAsync({ id: itemId, reason })
            toast.success('Assignment cancelled successfully!', toastSuccessStyle)
        } catch (error: any) {
            toast.error(error.message || 'Failed to cancel assignment', toastErrorStyle)
        }
    }

    const handleNegotiatePrice = (item: AssignmentItem) => {
        setSelectedNegotiationItem(item)
        setIsNegotiationOpen(true)
    }

    const handleContactParty = (item: AssignmentItem) => {
        let contactUser = null
        if (activeTab === 'sent-packages') {
            contactUser = item.trip?.traveler
        } else if (activeTab === 'received-packages') {
            contactUser = item.sender
        } else if (activeTab === 'my-trips') {
            contactUser = item.packages?.[0]?.sender
        }
        if (!contactUser) {
            toast.error('No contact details available', toastErrorStyle)
            return
        }

        setSelectedItem(contactUser)
        setShowContactInfo(true)

    }

    const handleSendMessage = async (content: string, type?: string, attachments?: AttachmentData[]) => {
        if (!selectedChatItem) return;
        sendMessage.mutate({
            chatId: selectedChatItem.id,
            data: {
                content,
                type: type || 'CHAT',
                chatId: selectedChatItem.id,
                attachments
            }
        }, {
            onSuccess: (data) => {
                console.log('Message sent successfully:', data);
                selectedChatItem.messages.push(data);
                setSelectedChatItem({ ...selectedChatItem });
            },
            onError: (error) => {
                console.error('Failed to send message:', error);
            }
        });
    }

    const handleMessage = async (itemData: any) => {
        if (!user?.id) {
            toast.error('Please log in to send messages', toastErrorStyle)
            return
        }

        const participantId = itemData.senderId
        if (!participantId) {
            toast.error('Could not determine the other participant.', toastErrorStyle);
            return;
        }

        findOrCreateChat.mutate({
            participantId: participantId,
            itemType: 'package',
            itemId: itemData.id,
            chatType: 'CHAT'
        }, {
            onSuccess: (chatData) => {
                setSelectedChatItem(chatData);
                setIsMessagingOpen(true);

            }
        });
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            MATCHED: { color: 'bg-blue-100 text-blue-800', icon: Clock },
            IN_TRANSIT: { color: 'bg-yellow-100 text-yellow-800', icon: Truck },
            DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle },
            DISPUTED: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.MATCHED
        const Icon = config.icon

        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {status.replace('_', ' ')}
            </Badge>
        )
    }

    const renderAssignmentCard = (item: AssignmentItem, index: number) => {
        if (item.type === 'package') {
            return (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"                
                onClick={() => router.push(`/packages/${item.id}`)}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 min-w-4 min-h-4 text-teal-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                        </div>
                        {getStatusBadge(item.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 min-w-4 min-h-4" />
                            <span>{item.pickupAddress?.city} → {item.deliveryAddress?.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 min-w-4 min-h-4" />
                            <span>{new Date(item.pickupDate!).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 min-w-4 min-h-4" />
                            <span>${item.offeredPrice} {item.finalPrice && `(Final: $${item.finalPrice})`}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4 min-w-4 min-h-4" />
                            <span>
                                {activeTab === 'sent-packages'
                                    ? `Traveler: ${item.trip?.traveler?.firstName} ${item.trip?.traveler?.lastName}`
                                    : `Sender: ${item.sender?.firstName} ${item.sender?.lastName}`
                                }
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 items-center">
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleContactParty(item)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4 min-w-4 min-h-4" />
                                Contact
                            </Button>
                            <Button
                                onClick={() => handleMessage(item)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <MessageCircle className="w-4 h-4 min-w-4 min-h-4" />
                                Message
                            </Button>
                            <Button
                                onClick={() => handleNegotiatePrice(item)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <DollarSign className="w-4 h-4 min-w-4 min-h-4" />
                                Negotiate
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            {item.status === 'MATCHED' && (
                                <>
                                    <Button
                                        onClick={() => handleConfirmAssignment(item.id, 'package')}
                                        size="sm"
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                        disabled={confirmAssignment.isPending && item.id === selectedItem.id}
                                    >
                                        <CheckCircle className="w-4 h-4 min-w-4 min-h-4" />
                                        Accept
                                    </Button>

                                    <Button
                                        onClick={() => handleCancelAssignment(item.id, 'package')}
                                        variant="danger"
                                        size="sm"
                                        className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
                                        disabled={cancelAssignment.isPending && item.id === selectedItem.id}
                                    >
                                        <XCircle className="w-4 h-4 min-w-4 min-h-4" />
                                        {activeTab === 'sent-packages' ? 'Cancel' : 'Reject Package'}
                                    </Button>


                                </>
                            )}
                        </div>
                    </div>
                </div>
            )
        } else {
            // Trip card
            return (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                onClick={() => router.push(`/trips/${item.id}`)}
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Truck className="w-5 h-5 min-w-5 min-h-5 text-teal-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                <p className="text-sm text-gray-600">{item.packages?.length || 0} packages assigned</p>
                            </div>
                        </div>
                        {getStatusBadge(item.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-5 h-5 min-w-5 min-h-5" />
                            <span>{item.originAddress?.city} → {item.destinationAddress?.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-5 h-5 min-w-5 min-h-5" />
                            <span>{new Date(item.departureDate!).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign className="w-5 h-5 min-w-5 min-h-5" />
                            <span>${item.pricePerKg?.toFixed(2)}/kg</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Package className="w-5 h-5 min-w-5 min-h-5" />
                            <span>{item.availableSpace?.toFixed(2)}kg available</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => handleContactParty(item)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4 min-w-4 min-h-4" />
                            Contact Senders
                        </Button>

                        {item.status === 'MATCHED' && (
                            <Button
                                onClick={() => handleConfirmAssignment(item.id, 'trip')}
                                size="sm"
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                disabled={confirmAssignment.isPending && item.id === selectedItem.id}
                            >
                                <CheckCircle className="w-4 h-4 min-w-4 min-h-4" />
                                Confirm Pickup
                            </Button>
                        )}
                    </div>
                </div>
            )
        }
    }

    if (loading || packagesQuery.isLoading || tripsQuery.isLoading) {
        return (
            <AuthGuard>
                <div className="min-h-screen bg-gray-50">
                    <NavHeader title='AMENADE' showMenuItems email={user?.email} name={`${user?.firstName} ${user?.lastName}`} />
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner size="lg" />
                    </div>
                    <Footer />
                </div>
            </AuthGuard>
        )
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gray-50">
                <NavHeader title='AMENADE' showMenuItems email={user?.email} name={`${user?.firstName} ${user?.lastName}`} />

                <div className="max-w-7xl mx-auto py-8 px-4 lg:px-0">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
                        <p className="text-gray-600">Manage your package assignments and trip requests</p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg border border-gray-200">
                        {[
                            { id: 'sent-packages', label: 'Sent Packages', icon: Package },
                            { id: 'received-packages', label: 'Received Packages', icon: Truck },
                            { id: 'my-trips', label: 'My Trips', icon: Truck },
                        ].map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as AssignmentType)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-teal-600 text-white'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 min-w-4 min-h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Assignments List */}
                    {assignments.length === 0 ? (
                        <EmptyState
                            title={`No ${activeTab.replace('-', ' ')} found`}
                            description={
                                activeTab === 'sent-packages'
                                    ? 'You haven\'t sent any packages that are assigned to trips yet.'
                                    : activeTab === 'received-packages'
                                        ? 'No packages have been assigned to your trips yet.'
                                        : 'None of your trips have assigned packages yet.'
                            }
                            actionLabel="Browse Packages"
                            onAction={() => window.location.href = '/packages'}
                        />
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {assignments.map(renderAssignmentCard)}
                        </div>
                    )}
                </div>

                <Footer />

                {/* Contact Dialog */}
                {isMessagingOpen && selectedChatItem && (
                    <MessagingInterface
                        isOpen={isMessagingOpen}
                        onClose={() => {
                            setIsMessagingOpen(false)
                            setSelectedChatItem(null)
                        }}
                        chat={selectedChatItem}
                        currentUserId={user?.id || ''}
                        onSendMessage={handleSendMessage}
                    />
                )}
                {showContactInfo && (
                    <ContactDialog contact={{
                        id: selectedItem.id || '',
                        firstName: selectedItem.firstName || '',
                        lastName: selectedItem.lastName || '',
                        email: selectedItem.email || '',
                        phone: selectedItem.phone || '',
                    }} isOpen={showContactInfo} onClose={() => setShowContactInfo(false)} />
                )}

                {selectedNegotiationItem && (
                    <NegotiateDialog
                        item={selectedNegotiationItem}
                        onNegotiate={async (itemId, proposedPrice, message) => {
                            // Handle negotiation logic here
                        }}
                        currentUserId={user.id}
                        isOpen={isNegotiationOpen} onClose={() => {
                            setIsNegotiationOpen(false)
                            setSelectedNegotiationItem(null)
                        }} />
                )}
            </div>
        </AuthGuard>
    )
}

export default function AssignmentsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AssignmentsPageContent />
        </Suspense>
    )
}