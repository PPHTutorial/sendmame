/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button, Input } from '@/components/ui'
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Wand2, Eye, Edit3, RotateCw, Crop, Palette, Save } from 'lucide-react'
import Cropper, { Area } from 'react-easy-crop'
import { usePackageImages } from '@/lib/hooks/usePackageImages'

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  maxSizeMB?: number
  className?: string
  onBannerGenerated?: (bannerUrl: string) => void
  onUploadToCloudinary?: (imageDataUrls: string[]) => Promise<void>
  packageId?: string
  showCloudinaryUpload?: boolean
  isEditMode?: boolean
}

interface ProcessedImage {
  original: string
  compressed: string
  watermarked: string
  thumbnail: string
}

export function AdvancedImageUploader({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
  className = '',
  onBannerGenerated,
  onUploadToCloudinary,
  packageId: _packageId,
  showCloudinaryUpload: _showCloudinaryUpload = false,
  isEditMode = false
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file')
  const [urlInput, setUrlInput] = useState('')
  const [processing, setProcessing] = useState(false)
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editMode, setEditMode] = useState<'crop' | 'rotate' | 'filter' | null>(null)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  // React-easy-crop specific state
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cloudinary upload hook
  const { uploadImages: uploadToCloudinary, uploading: cloudinaryUploading } = usePackageImages()

  // Initialize processed images from props (for edit mode)
  React.useEffect(() => {
    if (images && images.length > 0 && processedImages.length === 0) {
      console.log('Initializing processed images from props:', images)
      const initialProcessedImages: ProcessedImage[] = images.map(imageUrl => ({
        original: imageUrl,
        compressed: imageUrl,
        watermarked: imageUrl,
        thumbnail: imageUrl
      }))
      setProcessedImages(initialProcessedImages)
    }
  }, [images, processedImages.length])

  // Image compression function
  const compressImage = useCallback((file: File, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080 while maintaining aspect ratio)
        let { width, height } = img
        const maxWidth = 1920
        const maxHeight = 1080
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // Add watermark to image
  const addWatermark = useCallback((imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx?.drawImage(img, 0, 0)
        
        if (ctx) {
          // Calculate font size based on image dimensions for better scaling
          const fontSize = Math.max(24, Math.min(canvas.width * 0.05, canvas.height * 0.08))
          
          // Add watermark in the center
          ctx.globalAlpha = 0.4
          ctx.fillStyle = '#ffffff'
          ctx.font = `bold ${fontSize}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          
          // Add text shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 2
          ctx.shadowOffsetY = 2
          
          // Draw watermark in the center
          ctx.fillText('SendMame', canvas.width / 2, canvas.height / 2)
          
          // Reset shadow
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
          
          // Add subtle border
          ctx.globalAlpha = 0.2
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 2
          ctx.strokeRect(0, 0, canvas.width, canvas.height)
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      
      img.src = imageUrl
    })
  }, [])

  // Generate thumbnail
  const generateThumbnail = useCallback((imageUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const size = 150
        canvas.width = size
        canvas.height = size
        
        // Calculate crop area for square thumbnail
        const aspectRatio = img.width / img.height
        let sx = 0, sy = 0, sw = img.width, sh = img.height
        
        if (aspectRatio > 1) {
          // Landscape - crop width
          sw = img.height
          sx = (img.width - img.height) / 2
        } else {
          // Portrait - crop height
          sh = img.width
          sy = (img.height - img.width) / 2
        }
        
        ctx?.drawImage(img, sx, sy, sw, sh, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      
      img.src = imageUrl
    })
  }, [])

  // Process uploaded file
  const processImage = useCallback(async (file: File): Promise<ProcessedImage> => {
    const original = URL.createObjectURL(file)
    const compressed = await compressImage(file)
    const watermarked = isEditMode ? compressed : await addWatermark(compressed)
    const thumbnail = await generateThumbnail(compressed)
    
    return { original, compressed, watermarked, thumbnail }
  }, [compressImage, addWatermark, generateThumbnail, isEditMode])

  // Utility function to create cropped image
  const createCroppedImage = useCallback(async (imageSrc: string, pixelCrop: Area, rotation = 0): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        const rotRad = (rotation * Math.PI) / 180

        // Calculate bounding box of the rotated image
        const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

        // Set canvas size to match the bounding box
        canvas.width = bBoxWidth
        canvas.height = bBoxHeight

        // Translate canvas context to a central location to allow rotating and flipping around the center
        ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
        ctx.rotate(rotRad)
        ctx.translate(-image.width / 2, -image.height / 2)

        // Draw rotated image
        ctx.drawImage(image, 0, 0)

        // Create a new canvas for the crop
        const croppedCanvas = document.createElement('canvas')
        const croppedCtx = croppedCanvas.getContext('2d')
        
        if (!croppedCtx) {
          reject(new Error('Could not get cropped canvas context'))
          return
        }

        // Set the size of the cropped canvas
        croppedCanvas.width = pixelCrop.width
        croppedCanvas.height = pixelCrop.height

        // Draw the cropped image
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

        resolve(croppedCanvas.toDataURL('image/jpeg', 0.9))
      })
      
      image.addEventListener('error', () => {
        reject(new Error('Failed to load image'))
      })
      
      image.src = imageSrc
    })
  }, [])

  // Helper function to calculate rotated size
  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = (rotation * Math.PI) / 180
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }

  // Callback when crop area changes
  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  // Apply rotation to image
  const applyRotation = useCallback(async (imageSrc: string, rotation: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        const rotRad = (rotation * Math.PI) / 180
        const { width: newWidth, height: newHeight } = rotateSize(image.width, image.height, rotation)

        canvas.width = newWidth
        canvas.height = newHeight

        ctx.translate(newWidth / 2, newHeight / 2)
        ctx.rotate(rotRad)
        ctx.translate(-image.width / 2, -image.height / 2)
        ctx.drawImage(image, 0, 0)

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      })
      
      image.addEventListener('error', () => {
        reject(new Error('Failed to load image'))
      })
      
      image.src = imageSrc
    })
  }, [])

  // Apply filters to image
  const applyFilters = useCallback(async (imageSrc: string, brightness: number, contrast: number, saturation: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        canvas.width = image.width
        canvas.height = image.height

        // Apply filters using CSS filter string
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
        ctx.drawImage(image, 0, 0)

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      })
      
      image.addEventListener('error', () => {
        reject(new Error('Failed to load image'))
      })
      
      image.src = imageSrc
    })
  }, [])

  // Start editing an image
  const startImageEdit = useCallback((index: number) => {
    setEditingIndex(index)
    setEditMode('crop')
    setRotation(0)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }, [])

  // Save the edited image
  const saveEditedImage = useCallback(async () => {
    if (editingIndex === null) return
    
    setProcessing(true)
    try {
      let editedImageUrl = processedImages[editingIndex].compressed
      
      // Apply crop if in crop mode and crop area is defined
      if (editMode === 'crop' && croppedAreaPixels) {
        editedImageUrl = await createCroppedImage(editedImageUrl, croppedAreaPixels, rotation)
      } else if (editMode === 'rotate' && rotation !== 0) {
        // Apply rotation
        editedImageUrl = await applyRotation(editedImageUrl, rotation)
      } else if (editMode === 'filter' && (brightness !== 100 || contrast !== 100 || saturation !== 100)) {
        // Apply filters
        editedImageUrl = await applyFilters(editedImageUrl, brightness, contrast, saturation)
      }
      
      // Apply watermark to the edited image (skip if in edit mode since it already has watermark)
      const watermarked = isEditMode ? editedImageUrl : await addWatermark(editedImageUrl)
      
      // Generate new thumbnail
      const thumbnail = await generateThumbnail(editedImageUrl)
      
      // Update the processed images array
      const updatedProcessedImages = [...processedImages]
      updatedProcessedImages[editingIndex] = {
        ...updatedProcessedImages[editingIndex],
        compressed: editedImageUrl,
        watermarked,
        thumbnail
      }
      
      setProcessedImages(updatedProcessedImages)
      
      // Update the main images array
      const updatedImages = [...images]
      updatedImages[editingIndex] = watermarked
      onImagesChange(updatedImages)
      
      // Close editor
      setEditingIndex(null)
    } catch (error) {
      console.error('Error saving edited image:', error)
      alert('Error saving edited image. Please try again.')
    } finally {
      setProcessing(false)
    }
  }, [editingIndex, editMode, croppedAreaPixels, rotation, brightness, contrast, saturation, processedImages, images, onImagesChange, createCroppedImage, addWatermark, generateThumbnail, applyRotation, applyFilters, isEditMode])

  // Cancel editing
  const cancelEdit = useCallback(() => {
    setEditingIndex(null)
    setEditMode(null)
    setRotation(0)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return
    
    setProcessing(true)
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files')
        return false
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File size must be less than ${maxSizeMB}MB`)
        return false
      }
      
      return true
    })
    
    if (validFiles.length + images.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      setProcessing(false)
      return
    }
    
    try {
      const newProcessedImages: ProcessedImage[] = []
      
      for (const file of validFiles) {
        const processed = await processImage(file)
        newProcessedImages.push(processed)
      }
      
      const newImageUrls = newProcessedImages.map(img => img.watermarked)
      setProcessedImages(prev => [...prev, ...newProcessedImages])
      onImagesChange([...images, ...newImageUrls])
    } catch (error) {
      console.error('Error processing images:', error)
      alert('Error processing images. Please try again.')
    } finally {
      setProcessing(false)
    }
  }, [images, maxImages, maxSizeMB, processImage, onImagesChange])

  // Validate if URL is a valid image URL
  const isValidImageUrl = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url)
      // Check if it's a valid HTTP/HTTPS URL
      if (!['http:', 'https:'].includes(urlObj.protocol)) return false
      
      // Check for image extensions
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg']
      const pathname = urlObj.pathname.toLowerCase()
      
      return imageExtensions.some(ext => pathname.endsWith(ext)) || 
             pathname.includes('/image') || 
             urlObj.hostname.includes('image') ||
             urlObj.searchParams.has('format')
    } catch {
      return false
    }
  }, [])

  // Parse multiple URLs from input
  const parseImageUrls = useCallback((input: string): string[] => {
    if (!input.trim()) return []
    
    const urls: string[] = []
    
    // First try splitting by comma
    const commaSplit = input.split(',').map(url => url.trim()).filter(url => url)
    
    if (commaSplit.length > 1) {
      // Multiple URLs separated by comma
      return commaSplit.filter(url => isValidImageUrl(url))
    }
    
    // If no commas, check if it's a single URL or contains multiple URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const foundUrls = input.match(urlRegex) || []
    
    for (const url of foundUrls) {
      if (isValidImageUrl(url)) {
        urls.push(url)
      }
    }
    
    // If no URLs found but input looks like a URL, add it
    if (urls.length === 0 && isValidImageUrl(input.trim())) {
      urls.push(input.trim())
    }
    
    return urls
  }, [isValidImageUrl])

  // Process image from URL
  const processImageFromUrl = useCallback(async (url: string): Promise<ProcessedImage> => {
    return new Promise(async (resolve, reject) => {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = async () => {
          try {
            // Create canvas to process the image
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            if (!ctx) throw new Error('Could not get canvas context')
            
            // Compress the image
            let { width, height } = img
            const maxWidth = 1920
            const maxHeight = 1080
            
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height)
              width *= ratio
              height *= ratio
            }
            
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)
            
            const compressed = canvas.toDataURL('image/jpeg', 0.8)
            const watermarked = isEditMode ? compressed : await addWatermark(compressed)
            const thumbnail = await generateThumbnail(compressed)
            
            resolve({
              original: url,
              compressed,
              watermarked,
              thumbnail
            })
          } catch (error) {
            reject(error)
          }
        }
        
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = url
      } catch (error) {
        reject(error)
      }
    })
  }, [addWatermark, generateThumbnail, isEditMode])

  // Handle URL input with multiple URL support
  const handleUrlAdd = useCallback(async () => {
    if (!urlInput.trim()) return
    
    setProcessing(true)
    try {
      const urls = parseImageUrls(urlInput)
      
      if (urls.length === 0) {
        alert('No valid image URLs found. Please check your input.')
        setProcessing(false)
        return
      }
      
      if (images.length + urls.length > maxImages) {
        alert(`Maximum ${maxImages} images allowed. You're trying to add ${urls.length} images but only ${maxImages - images.length} slots remaining.`)
        setProcessing(false)
        return
      }
      
      const newProcessedImages: ProcessedImage[] = []
      const newImages: string[] = []
      
      // Process each URL
      for (const url of urls) {
        try {
          const processed = await processImageFromUrl(url)
          newProcessedImages.push(processed)
          newImages.push(processed.watermarked)
        } catch (error) {
          console.warn(`Failed to process image URL: ${url}`, error)
          // Continue with other URLs even if one fails
        }
      }
      
      if (newImages.length > 0) {
        setProcessedImages(prev => [...prev, ...newProcessedImages])
        onImagesChange([...images, ...newImages])
        setUrlInput('')
      } else {
        alert('Failed to process any of the provided image URLs.')
      }
    } catch (error) {
      console.error('Error processing URLs:', error)
      alert('Error processing image URLs. Please try again.')
    } finally {
      setProcessing(false)
    }
  }, [urlInput, images, maxImages, parseImageUrls, processImageFromUrl, onImagesChange])

  // Handle uploading images to Cloudinary
  const handleUploadToCloudinary = useCallback(async () => {
    if (processedImages.length === 0) {
      alert('No images to upload')
      return
    }

    setProcessing(true)
    try {
      // Get the watermarked images for upload
      const watermarkedImages = processedImages.map(img => img.watermarked)
      
      // Upload to Cloudinary
      const uploadedImages = await uploadToCloudinary(watermarkedImages)
      
      // Update the images array with Cloudinary URLs
      const cloudinaryUrls: string[] = uploadedImages
      onImagesChange(cloudinaryUrls)
      
      // Call the callback if provided
      if (onUploadToCloudinary) {
        await onUploadToCloudinary(cloudinaryUrls)
      }
      
      alert(`Successfully uploaded ${uploadedImages.length} images to Cloudinary!`)
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      alert(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessing(false)
    }
  }, [processedImages, uploadToCloudinary, onImagesChange, onUploadToCloudinary])

  // Generate banner from selected images
  const generateBanner = useCallback(async () => {
    if (processedImages.length === 0) {
      alert('Please upload some images first')
      return
    }
    
    setProcessing(true)
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Banner dimensions
      const bannerWidth = 1200
      const bannerHeight = 400
      canvas.width = bannerWidth
      canvas.height = bannerHeight
      
      if (ctx) {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, bannerWidth, bannerHeight)
        gradient.addColorStop(0, '#f8fafc')
        gradient.addColorStop(1, '#e2e8f0')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, bannerWidth, bannerHeight)
        
        // Calculate image positions
        const imageCount = Math.min(processedImages.length, 3)
        const imageWidth = bannerWidth / imageCount
        const imageHeight = bannerHeight
        
        // Load and draw images sequentially
        const loadImage = (src: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = src
          })
        }
        
        // Draw images
        for (let i = 0; i < imageCount; i++) {
          try {
            const img = await loadImage(processedImages[i].compressed)
            const x = i * imageWidth
            
            // Calculate how to fit the image within the banner section
            const imgAspect = img.width / img.height
            const sectionAspect = imageWidth / imageHeight
            
            let drawWidth = imageWidth
            let drawHeight = imageHeight
            let offsetX = x
            let offsetY = 0
            
            if (imgAspect > sectionAspect) {
              // Image is wider - fit to height
              drawWidth = imageHeight * imgAspect
              offsetX = x - (drawWidth - imageWidth) / 2
            } else {
              // Image is taller - fit to width
              drawHeight = imageWidth / imgAspect
              offsetY = (imageHeight - drawHeight) / 2
            }
            
            ctx.globalAlpha = 0.8
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
          } catch (error) {
            console.warn('Failed to load image for banner:', error)
          }
        }
        
        // Add overlay text
        ctx.globalAlpha = 1
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, bannerHeight - 100, bannerWidth, 100)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('Package Gallery', bannerWidth / 2, bannerHeight - 50)
        
        ctx.font = '18px Arial'
        ctx.fillText(`${images.length} Image${images.length !== 1 ? 's' : ''}`, bannerWidth / 2, bannerHeight - 20)
        
        // Add watermark in the center of the banner
        ctx.globalAlpha = 0.4
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
        ctx.shadowBlur = 6
        ctx.shadowOffsetX = 3
        ctx.shadowOffsetY = 3
        
        // Draw watermark in the center
        ctx.fillText('SendMame', bannerWidth / 2, bannerHeight / 2)
        
        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }
      
      const bannerUrl = canvas.toDataURL('image/jpeg', 0.9)
      onBannerGenerated?.(bannerUrl)
      setPreviewImage(bannerUrl)
    } catch (error) {
      console.error('Error generating banner:', error)
      alert('Error generating banner. Please try again.')
    } finally {
      setProcessing(false)
    }
  }, [processedImages, images.length, onBannerGenerated])

  // Remove image
  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newProcessedImages = processedImages.filter((_, i) => i !== index)
    
    setProcessedImages(newProcessedImages)
    onImagesChange(newImages)
  }, [images, processedImages, onImagesChange])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Mode Selector */}
      <div className="flex space-x-2 mb-4">
        <Button
          type="button"
          variant={uploadMode === 'file' ? 'primary' : 'outline'}
          onClick={() => setUploadMode('file')}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Files</span>
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'url' ? 'primary' : 'outline'}
          onClick={() => setUploadMode('url')}
          className="flex items-center space-x-2"
        >
          <LinkIcon className="w-4 h-4" />
          <span>Add URL</span>
        </Button>
      </div>

      {/* File Upload */}
      {uploadMode === 'file' && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop images here, or click to select
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Supports JPG, PNG, WebP • Max {maxSizeMB}MB per file • Up to {maxImages} images
          </p>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>{processing ? 'Processing...' : 'Select Images'}</span>
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
      )}

      {/* URL Input */}
      {uploadMode === 'url' && (
        <div className="flex space-x-2">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter image URLs (comma-separated: https://..., https://...)"
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleUrlAdd}
            disabled={processing || !urlInput.trim()}
          >
            Add
          </Button>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          {processedImages.map((processed, index) => (
            <div key={index} className="relative group">
              <div className="flex items-center justify-center aspect-square rounded-lg overflow-hidden bg-neutral-100">
                <img
                  src={processed.thumbnail}
                  alt={`Package image ${index + 1}`}
                  className="size-16 lg:size-48 object-contain"
                />
              </div>
              <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewImage(processed.watermarked)}
                    className="bg-white"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => startImageEdit(index)}
                    className="bg-white text-blue-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => removeImage(index)}
                    className="bg-white text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Generation and Cloudinary Upload */}
      {images.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          {/* Banner Generation */}
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              onClick={generateBanner}
              disabled={processing || cloudinaryUploading}
              className="flex items-center space-x-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>{processing ? 'Generating...' : 'Generate Banner'}</span>
            </Button>
            {/* <p className="text-sm text-gray-600">
              Create a banner from your uploaded images
            </p> */}
          </div>

          {/* Cloudinary Upload */}
          {/*_showCloudinaryUpload && (
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={handleUploadToCloudinary}
                disabled={processing || cloudinaryUploading}
                variant="outline"
                className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200"
              >
                <Upload className="w-4 h-4" />
                <span>{cloudinaryUploading ? 'Uploading...' : 'Upload to Cloud'}</span>
              </Button>
              <p className="text-sm text-gray-600">
                Save images to cloud storage ({processedImages.length} images ready)
              </p>
            </div>
          )} */}

          {/* Cloudinary Error Display */}
          {/* {cloudinaryError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{cloudinaryError}</p>
            </div>
          )} */}
        </div>
      )}

      {/* Image Editor Modal */}
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl max-h-full w-full overflow-auto">
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Image</h3>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  onClick={saveEditedImage}
                  disabled={processing}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{processing ? 'Saving...' : 'Save'}</span>
                </Button>
                <Button
                  type="button"
                  onClick={cancelEdit}
                  variant="outline"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex">
              {/* Tools Sidebar */}
              <div className="w-64 p-4 border-r bg-gray-50">
                <div className="space-y-4">
                  {/* Mode Selector */}
                  <div>
                    <h4 className="font-medium mb-2">Tools</h4>
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant={editMode === 'crop' ? 'primary' : 'outline'}
                        onClick={() => setEditMode('crop')}
                        className="w-full flex items-center space-x-2"
                      >
                        <Crop className="w-4 h-4" />
                        <span>Crop</span>
                      </Button>
                      <Button
                        type="button"
                        variant={editMode === 'rotate' ? 'primary' : 'outline'}
                        onClick={() => setEditMode('rotate')}
                        className="w-full flex items-center space-x-2"
                      >
                        <RotateCw className="w-4 h-4" />
                        <span>Rotate</span>
                      </Button>
                      <Button
                        type="button"
                        variant={editMode === 'filter' ? 'primary' : 'outline'}
                        onClick={() => setEditMode('filter')}
                        className="w-full flex items-center space-x-2"
                      >
                        <Palette className="w-4 h-4" />
                        <span>Filters</span>
                      </Button>
                    </div>
                  </div>

                  {/* Rotate Controls */}
                  {editMode === 'rotate' && (
                    <div>
                      <h4 className="font-medium mb-2">Rotation</h4>
                      <div className="space-y-2">
                        <Button
                          type="button"
                          onClick={() => setRotation(prev => prev + 90)}
                          className="w-full"
                          variant="outline"
                        >
                          Rotate 90°
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setRotation(prev => prev - 90)}
                          className="w-full"
                          variant="outline"
                        >
                          Rotate -90°
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setRotation(prev => prev + 180)}
                          className="w-full"
                          variant="outline"
                        >
                          Rotate 180°
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">Current: {rotation}°</p>
                    </div>
                  )}

                  {/* Filter Controls */}
                  {editMode === 'filter' && (
                    <div>
                      <h4 className="font-medium mb-2">Filters</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Brightness</label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-600">{brightness}%</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Contrast</label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-600">{contrast}%</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Saturation</label>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={saturation}
                            onChange={(e) => setSaturation(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-600">{saturation}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Changes will be applied when you save the image
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Crop Controls */}
                  {editMode === 'crop' && (
                    <div>
                      <h4 className="font-medium mb-2">Crop Image</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Zoom</label>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full"
                          />
                          <span className="text-xs text-gray-600">{zoom.toFixed(1)}x</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Drag to move the crop area and use the zoom slider to resize. The crop will be applied when you save.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Display Area */}
              <div className="flex-1 p-4">
                <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                  {editMode === 'crop' ? (
                    <Cropper
                      image={processedImages[editingIndex!].compressed}
                      crop={crop}
                      zoom={zoom}
                      aspect={undefined}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                      style={{
                        containerStyle: {
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          background: '#f3f4f6'
                        }
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <img
                        src={processedImages[editingIndex!].compressed}
                        alt="Editing"
                        className="max-w-full max-h-full object-contain"
                        style={{ 
                          filter: editMode === 'filter' ? `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)` : 'none',
                          transform: editMode === 'rotate' ? `rotate(${rotation}deg)` : 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10"
              variant="outline"
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  )
}
