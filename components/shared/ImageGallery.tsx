/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui'
import { ImageViewer } from './ImageViewer'

interface ImageGalleryProps {
    images: string[]
    className?: string
}

export function ImageGallery({ images, className = '' }: ImageGalleryProps) {
    const [currentStartIndex, setCurrentStartIndex] = useState(0)
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Responsive items per view
    const getItemsPerView = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth >= 1024) return 5 // lg screens
            if (window.innerWidth >= 768) return 3  // md screens
            return 2 // sm screens
        }
        return 5
    }

    const [itemsPerView, setItemsPerView] = useState(getItemsPerView())

    React.useEffect(() => {
        const handleResize = () => {
            setItemsPerView(getItemsPerView())
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const canScrollLeft = currentStartIndex > 0
    const canScrollRight = currentStartIndex + itemsPerView < images.length

    const scrollLeft = () => {
        if (canScrollLeft) {
            setCurrentStartIndex(prev => Math.max(0, prev - 1))
        }
    }

    const scrollRight = () => {
        if (canScrollRight) {
            setCurrentStartIndex(prev => Math.min(images.length - itemsPerView, prev + 1))
        }
    }

    const openImageViewer = (index: number) => {
        setSelectedImageIndex(index)
    }

    const closeImageViewer = () => {
        setSelectedImageIndex(null)
    }

    const visibleImages = images.slice(currentStartIndex, currentStartIndex + itemsPerView)

    return (
        <div className={`relative ${className}`}>
            {/* Gallery Container */}
            <div className="relative">
                {/* Left Arrow */}
                {canScrollLeft && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
                        onClick={scrollLeft}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                )}

                {/* Right Arrow */}
                {canScrollRight && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg"
                        onClick={scrollRight}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                )}

                {/* Images Grid */}
                <div
                    ref={scrollContainerRef}
                    className={`grid gap-3 transition-all duration-300 ${itemsPerView === 5 ? 'grid-cols-5' :
                            itemsPerView === 3 ? 'grid-cols-3' :
                                'grid-cols-2'
                        }`}
                >
                    {visibleImages.map((image, index) => {
                        const actualIndex = currentStartIndex + index
                        return (
                            <div
                                key={actualIndex}
                                className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-100 aspect-square"
                            >
                                <img
                                    src={image}
                                    alt={`Package image ${actualIndex + 1}`}
                                    className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                                    onClick={() => openImageViewer(actualIndex)}
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                                    <Button
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-teal-500 text-gray-900 hover:bg-gray-100"
                                        onClick={() => openImageViewer(actualIndex)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        View
                                    </Button>
                                </div>

                                {/* Image Number Badge 
                                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                    {actualIndex + 1}
                                </div>*/}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Image Count Indicator */}
            <div className="flex items-center justify-center mt-4 space-x-2">
                <span className="text-sm text-gray-600">
                    Showing {currentStartIndex + 1}-{Math.min(currentStartIndex + itemsPerView, images.length)} of {images.length} images
                </span>
                {images.length > itemsPerView && (
                    <div className="flex space-x-1">
                        {Array.from({ length: Math.ceil(images.length / itemsPerView) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentStartIndex(index * itemsPerView)}
                                className={`w-2 h-2 rounded-full transition-colors ${Math.floor(currentStartIndex / itemsPerView) === index
                                        ? 'bg-blue-500'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {selectedImageIndex !== null && (
                <ImageViewer
                    images={images}
                    initialIndex={selectedImageIndex}
                    onClose={closeImageViewer}
                />
            )}
        </div>
    )
}
