/* eslint-disable @next/next/no-img-element */
// Package Card Component - Minimalistic Design
import React from 'react'
import { Button } from '@/components/ui'
import { Star, MessageCircle, Luggage, ArrowDownUp, Plane } from 'lucide-react'
import moment from 'moment'
import { FaScaleBalanced } from 'react-icons/fa6'
import { useRouter } from 'next/navigation'

interface PackageCardProps {
    package: {
        id: string
        title: string
        description: string
        category: string
        status: string
        offeredPrice: number
        currency: string
        pickupDate: string
        deliveryDate: string
        pickupAddress: any
        deliveryAddress: any
        dimensions: any
        isFragile: boolean
        requiresSignature: boolean
        images?: string[]
        sender: {
            id: string
            firstName: string
            lastName: string
            avatar?: string
            phone: string
            profile?: {
                senderRating: number
                totalDeliveries: number
            }
        }
        trip?: {
            id: string
            traveler: {
                id: string
                firstName: string
                lastName: string
                avatar?: string
            }
        }
        _count?: {
            chats: number
        }
        createdAt: string
        updatedAt: string
    }
    onAddToLuggage?: (packageData: any) => void
    onSendMessage?: (packageData: any) => void
    currentUserId?: string
}

export function PackageCard({ package: pkg, onAddToLuggage, onSendMessage, currentUserId }: PackageCardProps) {
    const router = useRouter()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'POSTED': return 'bg-blue-100 text-blue-800'
            case 'MATCHED': return 'bg-amber-100 text-amber-800'
            case 'IN_TRANSIT': return 'bg-purple-100 text-purple-800'
            case 'DELIVERED': return 'bg-teal-100 text-teal-800'
            case 'CANCELLED': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatLocation = (address: any) => {
        if (typeof address === 'string') {
            try {
                address = JSON.parse(address)
            } catch {
                return address
            }
        }

        if (address?.city && address?.country) {
            return `${address.country}, ${address.street}, ${address.city}`
        }
        if (address?.city) {
            return address.city
        }
        if (address?.country) {
            return address.country
        }
        return 'Location not specified'
    }

    const handleItemDetails = () => {
        router.push(`/packages/${pkg.id}`)
    }
    const handleItemEdit = () => {
        router.push(`/packages/${pkg.id}/edit`)
    }

    const handleChatClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if(!currentUserId){
            router.push(`/login`)
        }
        if (onSendMessage) {
            onSendMessage(pkg)
        }
    }

    const handleAddToLuggage = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if(!currentUserId){
            router.push(`/login`)
        }
        if (onAddToLuggage) {
            onAddToLuggage(pkg)
        }
    }

    return (
        <div
            className="group bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-lg hover:scale-[1.05] transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={handleItemDetails}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">
                            {pkg.title}
                        </h3>
                        {/* <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pkg.status)}`}>
                            {pkg.status.replace('_', ' ')}
                        </div> */}
                    </div>
                    <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-teal-600">
                            ${pkg.offeredPrice}
                        </div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Budget {pkg.currency}
                        </div>
                    </div>
                </div>

                {/*  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {pkg.description}
                </p> */}

                {/* Location Route */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex flex-col justify-between truncate">
                        <div className="flex items-center space-x-3 flex-1">
                            <div className="flex items-center space-x-2">
                                <Plane className="w-3 h-3 text-teal-500" />
                                <span className="text-sm font-thin text-gray-700">From</span>
                            </div>
                            <span className="text-sm text-gray-900 font-medium truncate">
                                {formatLocation(pkg.pickupAddress)}
                            </span>
                        </div>
                        <ArrowDownUp className="w-4 h-4 text-gray-400 mx-4 rotate-90 place-self-center" />
                        <div className="flex items-center space-x-3 flex-1">
                            <div className="flex items-center space-x-2">
                                <Plane className="w-3 h-3 text-red-500 rotate-45" />
                                <span className="text-sm font-thin text-gray-700">To</span>
                                <span className="text-sm text-gray-900 font-medium truncate">
                                    {formatLocation(pkg.deliveryAddress)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                            <Luggage className="w-4 h-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Dimensions</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {pkg.dimensions?.length || 0} × {pkg.dimensions?.width || 0} × {pkg.dimensions?.height || 0} cm
                        </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                            <FaScaleBalanced className="w-4 h-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-700 uppercase tracking-wide">Weight</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                            {pkg.dimensions?.weight || 0} kg
                        </span>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div>
                        <span className="font-medium">Pickup:</span> {moment(pkg.pickupDate).format('MMM DD, YYYY')}
                    </div>
                    <div>
                        <span className="font-medium">Delivery:</span> {moment(pkg.deliveryDate).format('MMM DD, YYYY')}
                    </div>
                </div>

                {/* Sender Info */}
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {pkg.sender.avatar ? (
                            <img
                                src={pkg.sender.avatar}
                                alt={`${pkg.sender.firstName} ${pkg.sender.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-blue-600 font-semibold text-sm">
                                {pkg.sender.firstName[0]}{pkg.sender.lastName[0]}
                            </span>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                            {pkg.sender.firstName} {pkg.sender.lastName}
                        </p>
                        {pkg.sender.profile && (
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span>{pkg.sender.profile.senderRating.toFixed(1)}</span>
                                <span>•</span>
                                <span>{pkg.sender.profile.totalDeliveries} deliveries</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}

                {currentUserId !== pkg.sender.id ? (
                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                        <Button
                            onClick={handleChatClick}
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center space-x-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>Message</span>
                            {pkg._count && pkg._count.chats > 0 && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                                    {pkg._count.chats}
                                </span>
                            )}
                        </Button>
                        <Button
                            onClick={handleAddToLuggage}
                            size="sm"
                            className="flex-1 flex items-center justify-center space-x-2"
                        >
                            <Luggage className="w-4 h-4" />
                            <span>Add to Trip</span>
                        </Button>
                    </div>
                ) : (
                    <div className="flex space-x-3 pt-4 border-t border-gray-100">
                        <Button
                            onClick={handleItemDetails}
                            variant="outline"
                            size="sm"
                            className="flex-1 flex items-center justify-center space-x-2"
                        >
                            <span>View Details</span>
                        </Button>
                        <Button
                            onClick={(e)=>{
                                e.stopPropagation()
                                handleItemEdit()
                            }}
                            size="sm"
                            className="flex-1 flex items-center justify-center space-x-2"
                        >
                            <span>Edit Package</span>
                        </Button>
                    </div>
                )}

            </div>
        </div>
    )
}
