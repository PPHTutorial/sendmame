/* eslint-disable @next/next/no-img-element */
// Package Card Component
import React from 'react'
import { Button } from '@/components/ui'
import { MapPin, Star, MessageCircle, Luggage, Phone } from 'lucide-react'
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
            case 'POSTED': return 'bg-blue-500 text-white'
            case 'MATCHED': return 'bg-amber-500 text-white'
            case 'IN_TRANSIT': return 'bg-purple-500 text-white'
            case 'DELIVERED': return 'bg-green-500 text-white'
            case 'CANCELLED': return 'bg-red-500 text-white'
            default: return 'bg-gray-500 text-white'
        }
    }

    const handleItemDetails = () => {
        // Handle item details click
        router.push(`/packages/${pkg.id}`)
    }

    return (
        <div className="bg-white border-2 border-neutral-200 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden p-4"
            onClick={handleItemDetails}
        >
            <div className="flex min-w-0">
                <div className="flex justify-center gap-4 h-32 overflow-hidden">
                    {/* Left: Square Image */}
                    <div className="w-32 h-full flex-shrink-0 relative">
                        {pkg.images && pkg.images.length > 0 ? (
                            <>
                                <img
                                    src={pkg.images[0]}
                                    alt={pkg.title}
                                    className="w-full h-full object-cover p-1 border border-neutral-300 rounded"
                                />
                                {pkg.images.length > 1 && (
                                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                                        +{pkg.images.length - 1}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <div className="text-gray-400 text-center">
                                    <div className="text-2xl mb-1">📦</div>
                                    <div className="text-xs">No image</div>
                                </div>
                            </div>
                        )}

                        {/* Status Badge */}
                        {/* <div className={`absolute top-1 left-1 px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(pkg.status)}`}>
                                {pkg.status.replace('_', ' ')}
                            </div> */}

                    </div>

                    {/* Right: Content (2/3 width) */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex flex-col h-full w-full min-w-0">
                            {/* Title and Description */}
                            <div className="mb-2 w-full min-w-0">
                                <h3 className="text-lg font-bold text-gray-900 truncate overflow-hidden whitespace-nowrap">
                                    {pkg.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                    {pkg.description}
                                </p>
                            </div>

                            {/* User Details, Budget, and Actions */}
                            <div className="flex flex-col">
                                {/* Left: User Info */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        {pkg.sender.avatar ? (
                                            <img
                                                src={pkg.sender.avatar}
                                                alt={`${pkg.sender.firstName} ${pkg.sender.lastName}`}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-blue-600 font-semibold text-xs">
                                                {pkg.sender.firstName[0]}{pkg.sender.lastName[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {pkg.sender.firstName} {pkg.sender.lastName}
                                        </p>
                                        {pkg.sender.profile && (
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                <span>{pkg.sender.profile.senderRating.toFixed(1)}</span>

                                            </div>
                                        )}
                                    </div>
                                </div>


                            </div>
                            {/* Right: Budget and Actions */}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col space-y-1 mt-4">
                    <span className='text-xs font-normal text-gray-500'>Package Dimensions</span>
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                            <Luggage className="w-3 h-3 text-gray-600" />
                            <span className="text-base font-medium">{pkg.dimensions.length} × {pkg.dimensions.width} × {pkg.dimensions.height} cm</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <FaScaleBalanced className="w-3 h-3 text-teal-600" />
                            <span className="text-base font-medium">{pkg.dimensions.weight} kg</span>
                        </div>
                    </div>
                </div>

            </div>

            <div className="flex items-center w-full mt-4">
                {/* Action Buttons */}
                <div className="flex items-center justify-between w-full space-x-4">
                    {/* Budget */}
                    <div className="flex flex-col items-start">
                        {/* <div className="text-xs text-gray-500">Budget</div> */}
                        <span className='text-xs font-normal'>Budget</span>
                        <span className="items-center text-xl font-extrabold text-gray-900">
                            <span className='text-xs font-normal'>{pkg.currency}</span>{pkg.offeredPrice}
                        </span>
                    </div>
                    {/* Contact Button */}
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-2 py-1 h-7 w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Phone className="w-3 h-3 mr-2" />
                        Contact
                    </Button>

                    {/* Chat Button */}
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-7 flex items-center w-full"
                        onClick={(e) => {
                            e.stopPropagation()
                            onSendMessage?.(pkg)
                        }}
                        disabled={!onSendMessage}
                    >
                        <MessageCircle className="w-3 h-3 mr-2" />
                        Send Message
                        {pkg._count && pkg._count.chats > 0 && (
                            <span className="ml-1 bg-white text-blue-600 rounded-full text-xs px-1">
                                {pkg._count.chats}
                            </span>
                        )}
                    </Button>

                </div>
            </div>


            {/* Route Information - Compact */}
            <div className="mt-6">
                <div className="flex flex-col text-sm text-teal-900 bg-teal-50 rounded-lg py-2 px-4 ">
                    <div className="flex items-center w-full min-h-16">
                        {/* <MapPin className="w-3 h-3 text-blue-600 mr-1 flex-shrink-0" /> */}
                        <div className="flex flex-col">
                            <p className="text-base line-clamp-2 font-bold"><span className="text-sm font-thin">from: </span>{pkg.pickupAddress.country}</p>
                            <p className="text-sm line-clamp-2">{pkg.deliveryAddress.city} {pkg.pickupAddress.street}</p>
                        </div>
                    </div>
                    {currentUserId && currentUserId !== currentUserId && (
                        <div className="flex items-center justify-center w-full my-2">
                            <Button
                                className='bg-teal-600 hover:bg-teal-700 text-white text-xs px-2 py-4 h-7 flex items-center gap-2 shadow-lg'
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onAddToLuggage?.(pkg)
                                }}
                                disabled={!onAddToLuggage || pkg.status === 'MATCHED'}
                            >
                                <Luggage className="size-4" />
                                <span className="text-white uppercase">
                                    {pkg.status === 'MATCHED' ? 'Already Assigned' : 'Add to my Luggage'}
                                </span>
                            </Button>
                        </div>)}
                    <div className="flex items-center justify-end w-full min-h-16">
                        {/* <MapPin className="w-3 h-3 text-green-600 mr-1 flex-shrink-0" /> */}
                        <div className="flex flex-col text-right">
                            <p className="text-base font-bold"><span className="text-sm font-thin">to: </span>{pkg.deliveryAddress.country} </p>
                            <p className="text-sm line-clamp-2">{pkg.deliveryAddress.city} {pkg.deliveryAddress.street}</p>
                        </div>
                    </div>
                    <p className="text-base font-bold text-center">{moment(pkg.pickupDate).format('MMMM Do YYYY')}</p>
                </div>
            </div>

        </div>
    )
}
