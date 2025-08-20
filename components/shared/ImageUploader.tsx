/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui'
import { Upload, X, Edit2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'
import Cropper from 'react-easy-crop'
import { Area, Point } from 'react-easy-crop'

interface ImageUploadProps {
    images: string[]
    onImagesChange: (images: string[]) => void
    maxImages?: number
    maxSizeMB?: number
    aspectRatio?: number
    className?: string
}

interface CropData {
    crop: Point
    zoom: number
    rotation: number
    croppedAreaPixels: Area | null
}

export function ImageUploader({
    images,
    onImagesChange,
    maxImages = 5,
    maxSizeMB = 5,
    aspectRatio = 4 / 3,
    className = ''
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [cropData, setCropData] = useState<CropData>({
        crop: { x: 0, y: 0 },
        zoom: 1,
        rotation: 0,
        croppedAreaPixels: null
    })
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null)
    const handleFileSelect = useCallback((files: FileList | null) => {
        if (!files) return

        const validFiles = Array.from(files).filter(file => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please select only image files')
                return false
            }

            // Check file size
            if (file.size > maxSizeMB * 1024 * 1024) {
                alert(`File size should be less than ${maxSizeMB}MB`)
                return false
            }

            return true
        })

        // Check total images limit
        if (images.length + validFiles.length > maxImages) {
            alert(`You can only upload up to ${maxImages} images`)
            return
        }

        // Convert files to base64 URLs
        const filePromises = validFiles.map(file => {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = (e) => {
                    const result = e.target?.result as string
                    if (result) {
                        resolve(result)
                    } else {
                        reject(new Error('Failed to read file'))
                    }
                }
                reader.onerror = () => reject(new Error('File reading error'))
                reader.readAsDataURL(file)
            })
        })

        Promise.all(filePromises)
            .then(newImages => {
                onImagesChange([...images, ...newImages])
            })
            .catch(error => {
                console.error('Error reading files:', error)
                alert('Failed to upload some images')
            })
    }, [images, maxImages, maxSizeMB, onImagesChange])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        handleFileSelect(e.dataTransfer.files)
    }, [handleFileSelect])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onImagesChange(newImages)
    }


    const openImageViewer = (index: number) => {
        setViewingImageIndex(index)
    }

    const closeImageViewer = () => {
        setViewingImageIndex(null)
    }

    // Full size image viewer modal
    const ImageViewerDialog = () => {
        if (viewingImageIndex === null) return null

        return (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={closeImageViewer}>
                <div className="relative max-w-screen-lg max-h-screen-lg p-4">
                    <Button
                        variant="outline"
                        onClick={closeImageViewer}
                        className="absolute top-2 right-2 z-10 bg-white text-gray-700"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                    <img
                        src={images[viewingImageIndex]}
                        alt={`Package image ${viewingImageIndex + 1} - Full size`}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        )
    }

    const startEditing = (index: number) => {
        setEditingIndex(index)
        setCropData({
            crop: { x: 0, y: 0 },
            zoom: 1,
            rotation: 0,
            croppedAreaPixels: null
        })
    }

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = document.createElement('img')
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error: any) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area,
        rotation = 0
    ): Promise<string> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw new Error('No 2d context')
        }

        const rotRad = (rotation * Math.PI) / 180

        // Calculate bounding box of the rotated image
        const { width: bBoxWidth, height: bBoxHeight } = {
            width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
            height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height)
        }

        // Set canvas size to match the bounding box
        canvas.width = bBoxWidth
        canvas.height = bBoxHeight

        // Translate canvas context to a central location on image to allow rotating around the center
        ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
        ctx.rotate(rotRad)
        ctx.translate(-image.width / 2, -image.height / 2)

        // Draw rotated image
        ctx.drawImage(image, 0, 0)

        // Crop the image
        const croppedCanvas = document.createElement('canvas')
        const croppedCtx = croppedCanvas.getContext('2d')

        if (!croppedCtx) {
            throw new Error('No 2d context')
        }

        croppedCanvas.width = pixelCrop.width
        croppedCanvas.height = pixelCrop.height

        croppedCtx.drawImage(
            canvas,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return croppedCanvas.toDataURL('image/jpeg', 0.8)
    }

    const applyCrop = async () => {
        if (editingIndex === null || !cropData.croppedAreaPixels) return

        try {
            const croppedImage = await getCroppedImg(
                images[editingIndex],
                cropData.croppedAreaPixels,
                cropData.rotation
            )

            const newImages = [...images]
            newImages[editingIndex] = croppedImage
            onImagesChange(newImages)
            setEditingIndex(null)
        } catch (error) {
            console.error('Error cropping image:', error)
            alert('Failed to crop image')
        }
    }

    const cancelEdit = () => {
        setEditingIndex(null)
    }

    // Image editing modal
    if (editingIndex !== null) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <ImageViewerDialog/>
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-auto m-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Edit Image</h3>
                        <Button variant="outline" onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="relative h-96 mb-6">
                        <Cropper
                            image={images[editingIndex]}
                            crop={cropData.crop}
                            zoom={cropData.zoom}
                            rotation={cropData.rotation}
                            aspect={aspectRatio}
                            onCropChange={(crop) => setCropData(prev => ({ ...prev, crop }))}
                            onZoomChange={(zoom) => setCropData(prev => ({ ...prev, zoom }))}
                            onRotationChange={(rotation) => setCropData(prev => ({ ...prev, rotation }))}
                            onCropComplete={(_, croppedAreaPixels) =>
                                setCropData(prev => ({ ...prev, croppedAreaPixels }))
                            }
                        />
                    </div>

                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <ZoomOut className="h-4 w-4" />
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={cropData.zoom}
                                onChange={(e) => setCropData(prev => ({ ...prev, zoom: Number(e.target.value) }))}
                                className="w-24"
                            />
                            <ZoomIn className="h-4 w-4" />
                        </div>

                        <div className="flex items-center gap-2">
                            <RotateCw className="h-4 w-4" />
                            <input
                                type="range"
                                min={-180}
                                max={180}
                                step={1}
                                value={cropData.rotation}
                                onChange={(e) => setCropData(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                                className="w-24"
                            />
                            <span className="text-sm text-gray-500">{cropData.rotation}°</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={cancelEdit}>
                            Cancel
                        </Button>
                        <Button onClick={applyCrop}>
                            Apply Changes
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                    Upload Package Images
                </p>
                <p className="text-sm text-gray-500 mb-4">
                    Drag and drop images here, or click to select files
                </p>
                <p className="text-xs text-gray-400 mb-4">
                    Maximum {maxImages} images, up to {maxSizeMB}MB each
                </p>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={images.length >= maxImages}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Select Images
                </Button>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                        <div key={index} className="relative group">
                            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100">
                                <img
                                    src={image}
                                    alt={`Package image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Image Controls */}
                            <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEditing(index)}
                                        className="bg-white text-gray-700 hover:bg-gray-50"
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="danger"
                                        onClick={() => removeImage(index)}
                                        className="bg-red-500 text-red-600 hover:bg-red-50"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openImageViewer(index)}
                                        className="bg-white text-gray-700 hover:bg-gray-50"
                                    >
                                        <ZoomIn className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>

                            
                        </div>
                    ))}
                </div>
            )}

            {/* Image Tips */}
            {images.length === 0 && (
                <div className="bg-teal-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-teal-900 mb-2">Photography Tips</h4>
                    <ul className="text-sm text-teal-700 space-y-1">
                        <li>• Take clear photos from multiple angles</li>
                        <li>• Include size references (coin, ruler, etc.)</li>
                        <li>• Show any fragile areas or special handling requirements</li>
                        <li>• Ensure good lighting and avoid shadows</li>
                        <li>• Capture any existing damage or wear</li>
                    </ul>
                </div>
            )}
        </div>
    )
}
