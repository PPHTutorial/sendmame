/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { usePackage, useAuth, useTrips, useFindOrCreateChat, useSendMessage, useCreateAssignment, usePackages } from '@/lib/hooks/api'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { MapPin, Calendar, Star, MessageCircle, Edit, Package2, Phone, Weight, AlertTriangle, Shield, Luggage, Video } from 'lucide-react'
import { authApi } from '@/lib/api/client'
import { ImageGallery } from '@/components/shared/ImageGallery'
import { AssignmentDialog } from '@/components/shared/AssignmentDialog'
import { MessagingInterface } from '@/components/shared/MessagingInterface'
import { AttachmentData, PackageQueryParams } from '@/lib/types'
import { NavHeader } from '@/components/shared/NavHeader'
import { Footer } from '@/components/navigation'
import { ContactDialog } from '@/components/shared/ContactDialog'
import { toastErrorStyle } from '@/lib/utils'
import toast from 'react-hot-toast'



export default function PackageDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const packageId = params.id as string
    const [isMyPost, setIsMyPost] = useState(false)

    // Dialog states
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false)
    const [isMessagingOpen, setIsMessagingOpen] = useState(false)
    const [showContactInfo, setShowContactInfo] = useState(false)
    const [selectedChatItem, setSelectedChatItem] = useState<any>(null)
    const [selectedItem, setSelectedItem] = useState<any>(null)

    // API hooks
    const { data: packageData, isLoading, error } = usePackage(packageId)
    const { getCurrentUser } = useAuth()
    const { data: user } = getCurrentUser
    const tripsQuery = useTrips()
    const findOrCreateChat = useFindOrCreateChat()
    const sendMessage = useSendMessage()
    const createAssignment = useCreateAssignment()
    const packagesQuery = usePackages()

    const pkg = packageData

    useEffect(() => {
        const checkIsMyPost = async () => {
            const currentUser = await authApi.getCurrentUser()
            const isMine = (currentUser?.id === pkg?.senderId);
            setIsMyPost(isMine);
        };
        if (pkg) {
            checkIsMyPost();
        }
    }, [pkg]);

    // Handler functions
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

    const handleMessage = async () => {
        if (!user?.id) {
            toast.error('Please log in to send messages', toastErrorStyle)
            return
        }

        const participantId = pkg.senderId
        if (!participantId) {
            toast.error('Could not determine the other participant.', toastErrorStyle);
            return;
        }

        findOrCreateChat.mutate({
            participantId: participantId,
            itemType: 'package',
            itemId: pkg.id,
            chatType: 'CHAT'
        }, {
            onSuccess: (chatData) => {
                setSelectedChatItem(chatData);
                setIsMessagingOpen(true);

            }
        });
    }

    const handleContactSender = async () => {
        if (!user?.id) {
            alert('Please log in to send messages')
            return
        }
        setShowContactInfo(true)
        setSelectedItem({ id: pkg.sender.id, firstName: pkg.sender.firstName, lastName: pkg.sender.lastName, email: pkg.sender.email, phone: pkg.sender.phone })

    }

    const handleAddToLuggage = () => {
        if (!user?.id) {
            alert('Please log in to add packages to trips')
            return
        }
        setSelectedItem(pkg)
        setIsAssignmentDialogOpen(true)
    }

    const filteredTrips = tripsQuery.data?.data?.filter((trip: any) => trip.travelerId === user.id) || []
    //const filteredPackages = packagesQuery.data?.data?.filter((pkg: any) => pkg.senderId === user.id) || []


    const handleVideoCallSender = () => {
        // For now, we'll just show an alert. In a real app, you'd integrate with a video calling service
        alert('Video calling feature will be implemented with a video service integration')
    }

    const handleAssign = async (targetId: string, confirmations: any) => {
        if (!selectedItem || !user?.id) {
            toast.error('Invalid assignment data', {
                style: {
                    fontSize: 14,
                    backgroundColor: '#fee2e2',
                    borderColor: '#ef4444',
                    color: '#dc2626',
                }
            })
            return
        }

        try {
            const isPackageToTrip = selectedItem.senderId !== undefined
            const assignmentData = {
                packageId: isPackageToTrip ? selectedItem.id : targetId,
                tripId: isPackageToTrip ? targetId : selectedItem.id,
                confirmations,
                confirmationType: 'ASSIGNMENT' as const,
                notification: isPackageToTrip ? 'TO_TRIP' : 'TO_PACKAGE',
                userId: user.id
            }

            console.log('Creating assignment:', assignmentData)

            await createAssignment.mutateAsync(assignmentData)

            // Close the dialog and reset state
            setIsAssignmentDialogOpen(false)
            setSelectedItem(null)

        } catch (error) {
            console.error('Assignment failed:', error)
            // Error handling is done in the hook
        }
    }


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        )
    }

    if (error || !packageData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Package Not Found</h1>
                    <p className="text-gray-600 mb-4">The package you're looking for doesn't exist or has been removed.</p>
                    <Link href="/packages">
                        <Button>Back to Packages</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const formatLocation = (address: any) => {
        if (typeof address === 'string') {
            try {
                address = JSON.parse(address)
            } catch {
                return address
            }
        }
        return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'POSTED': return 'bg-blue-100 text-blue-800'
            case 'MATCHED': return 'bg-amber-100 text-amber-800'
            case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800'
            case 'DELIVERED': return 'bg-green-100 text-green-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }


    return (
        <div className="min-h-screen bg-white">
            <NavHeader title='Amenade' email={user?.email} name={`${user?.firstName} ${user?.lastName}`} showMenuItems={true} />
            {/* Header */}
            <div className="bg-white ">
                <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-0">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center space-x-4">
                            {/* <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.back()}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </Button> */}
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{pkg.title}</h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                                        {pkg.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Posted {new Date(pkg.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {isMyPost && <Link href={isMyPost ? `/packages/${pkg.id}/edit` : `/packages/${pkg.id}/#`}>
                                <Button variant="outline" className="flex items-center ">
                                    <Edit className="w-4 h-4" />
                                    <span className='hidden lg:block ml-2'>Edit Package</span>
                                </Button>
                            </Link>}
                            {!isMyPost && <Button className="flex items-center" onClick={handleContactSender}>
                                <MessageCircle className="w-4 h-4" />
                                <span className='hidden lg:block ml-2'>Contact Sender</span>
                            </Button>}

                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Package Images */}
                        {pkg.images && pkg.images.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Package Images</h2>
                                    <ImageGallery images={pkg.images} />
                                </div>
                            </div>
                        )}

                        {/* Package Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Package Details</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                                        <p className="text-gray-900">{pkg.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Category</h3>
                                            <p className="text-gray-900">{pkg.category.replace('_', ' ')}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Budgeted Price</h3>
                                            <p className="text-2xl font-bold text-blue-600">{pkg.currency} {pkg.offeredPrice}</p>
                                        </div>
                                    </div>

                                    {pkg.dimensions && (
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-500 mb-1">Dimensions & Weight</h3>
                                            <div className="flex items-center space-x-4 text-gray-900">
                                                <div className="flex items-center space-x-1">
                                                    <Package2 className="w-4 h-4 text-gray-400" />
                                                    <span>{pkg.dimensions.length} × {pkg.dimensions.width} × {pkg.dimensions.height} cm</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Weight className="w-4 h-4 text-gray-400" />
                                                    <span>{pkg.dimensions.weight} kg</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-4">
                                        {pkg.isFragile && (
                                            <div className="flex items-center space-x-1 text-orange-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Fragile Item</span>
                                            </div>
                                        )}
                                        {pkg.requiresSignature && (
                                            <div className="flex items-center space-x-1 text-blue-600">
                                                <Shield className="w-4 h-4" />
                                                <span className="text-sm font-medium">Signature Required</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Route Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                            <MapPin className="w-4 h-4 mr-1 text-green-500" />
                                            Pickup Location
                                        </h3>
                                        <p className="text-gray-900 ml-5">{formatLocation(pkg.pickupAddress)}</p>
                                        <p className="text-sm text-gray-500 ml-5 flex items-center mt-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {formatDate(pkg.pickupDate)}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                                            <MapPin className="w-4 h-4 mr-1 text-red-500" />
                                            Delivery Location
                                        </h3>
                                        <p className="text-gray-900 ml-5">{formatLocation(pkg.deliveryAddress)}</p>
                                        <p className="text-sm text-gray-500 ml-5 flex items-center mt-1">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {formatDate(pkg.deliveryDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Traveler Information (if matched) */}
                        {pkg.trip && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Traveler</h2>

                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            {pkg.trip.traveler.avatar ? (
                                                <img
                                                    src={pkg.trip.traveler.avatar}
                                                    alt={`${pkg.trip.traveler.firstName} ${pkg.trip.traveler.lastName}`}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-green-600 font-semibold">
                                                    {pkg.trip.traveler.firstName[0]}{pkg.trip.traveler.lastName[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {pkg.trip.traveler.firstName} {pkg.trip.traveler.lastName}
                                            </p>
                                            <p className="text-sm text-gray-500">Assigned Traveler</p>
                                        </div>
                                        <div className="ml-auto">
                                            <Button size="sm" className="flex items-center space-x-2">
                                                <MessageCircle className="w-4 h-4" />
                                                <span>Contact</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Sender Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Sender Information</h2>

                                <Link href={isMyPost ? `/account/profile` : `/account/profile/${pkg.sender.id}`} className="block">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            {pkg.sender.avatar ? (
                                                <img
                                                    src={pkg.sender.avatar}
                                                    alt={`${pkg.sender.firstName} ${pkg.sender.lastName}`}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-blue-600 font-semibold">
                                                    {pkg.sender.firstName[0]}{pkg.sender.lastName[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {pkg.sender.firstName} {pkg.sender.lastName}
                                            </p>
                                            {pkg.sender.profile && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                                                        <span>{pkg.sender.profile.senderRating.toFixed(1)}</span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>{pkg.sender.profile.totalDeliveries} deliveries</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                                <div className="space-y-3">
                                    {!isMyPost && (
                                        <>
                                            <Button className="w-full flex items-center justify-center space-x-2" onClick={handleMessage}>
                                                <MessageCircle className="w-4 h-4" />
                                                <span>Send Message</span>
                                            </Button>
                                            <Button variant="outline" className="w-full flex items-center justify-center space-x-2" onClick={handleContactSender}>
                                                <Phone className="w-4 h-4" />
                                                <span>Call Sender</span>
                                            </Button>
                                            <Button variant="outline" className="w-full flex items-center justify-center space-x-2" onClick={handleVideoCallSender}>
                                                <Video className="w-4 h-4" />
                                                <span>Video Call</span>
                                            </Button>
                                            <Button className='w-full flex items-center justify-center space-x-2' onClick={handleAddToLuggage}>
                                                <Luggage className="size-4" />
                                                <span>Add to my Luggage</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Package Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Summary</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(pkg.status)}`}>
                                            {pkg.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Posted</span>
                                        <span className="text-gray-900">{new Date(pkg.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Budget</span>
                                        <span className="text-gray-900 font-semibold">{pkg.currency} {pkg.offeredPrice}</span>
                                    </div>
                                    {pkg._count && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Messages</span>
                                            <span className="text-gray-900">{pkg._count.chats}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assignment Dialog */}
            {isAssignmentDialogOpen && (
                <AssignmentDialog
                    isOpen={isAssignmentDialogOpen}
                    onClose={() => setIsAssignmentDialogOpen(false)}
                    type="package-to-trip"
                    currentItem={selectedItem}
                    availableItems={filteredTrips || []}
                    onAssign={handleAssign}
                    isLoading={false}
                    userId={user.id}
                />
            )}

            {/* Messaging Interface */}
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
            {/* Contact Dialog */}

            {showContactInfo && (
                <ContactDialog contact={{
                    id: selectedItem.id || '',
                    firstName: selectedItem.firstName || '',
                    lastName: selectedItem.lastName || '',
                    email: selectedItem.email || '',
                    phone: selectedItem.phone || '',
                }} isOpen={showContactInfo} onClose={() => setShowContactInfo(false)} />
            )}
            <Footer />
        </div>
    )
}
