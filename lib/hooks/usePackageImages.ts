import { useState, useCallback } from 'react'

export interface UsePackageImagesReturn {
  uploadImages: (imageDataUrls: string[]) => Promise<string[]>
  uploading: boolean
  error: string | null
}

export function usePackageImages(): UsePackageImagesReturn {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImages = useCallback(async (imageDataUrls: string[]): Promise<string[]> => {
    setUploading(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []

      for (const dataUrl of imageDataUrls) {
        // Convert data URL to blob
        const response = await fetch(dataUrl)
        const blob = await response.blob()

        // Create form data
        const formData = new FormData()
        formData.append('file', blob, 'image.jpg')
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'amenade')

        // Upload to Cloudinary
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )

        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to upload image to Cloudinary')
        }

        const result = await cloudinaryResponse.json()
        uploadedUrls.push(result.secure_url)
      }

      return uploadedUrls
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
    }
  }, [])

  return {
    uploadImages,
    uploading,
    error
  }
}