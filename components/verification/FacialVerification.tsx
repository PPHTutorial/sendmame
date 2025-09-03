'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui'
import { Camera, CheckCircle, Clock, RotateCcw } from 'lucide-react'

interface FacialVerificationProps {
    onClose: () => void
}

export function FacialVerification({ onClose }: FacialVerificationProps) {
    const [step, setStep] = useState<'capture' | 'review' | 'success'>('capture')
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isCameraReady, setIsCameraReady] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    facingMode: 'user' // Front camera
                } 
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setIsCameraReady(true)
            }
        } catch (error) {
            console.error('Error accessing camera:', error)
            alert('Unable to access camera. Please ensure camera permissions are granted.')
        }
    }

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
            setIsCameraReady(false)
        }
    }

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const video = videoRef.current
            const context = canvas.getContext('2d')
            
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            
            if (context) {
                context.drawImage(video, 0, 0)
                const imageData = canvas.toDataURL('image/jpeg')
                setCapturedImage(imageData)
                stopCamera()
            }
        }
    }

    const retakePhoto = () => {
        setCapturedImage(null)
        startCamera()
    }

    const handleSubmit = async () => {
        if (!capturedImage) return

        setIsLoading(true)
        
        try {
            // Simulate API call for facial verification
            await new Promise(resolve => setTimeout(resolve, 3000))
            setStep('success')
            stopCamera()
        } catch (error) {
            console.error('Failed to verify face:', error)
        } finally {
            setIsLoading(false)
        }
    }

    React.useEffect(() => {
        if (step === 'capture' && !capturedImage) {
            startCamera()
        }
        
        return () => {
            stopCamera()
        }
    }, [step, capturedImage])

    if (step === 'success') {
        return (
            <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Face Verified!</h3>
                <p className="text-gray-600 mb-6">
                    Your facial verification has been completed successfully.
                </p>
                <Button onClick={onClose}>
                    Close
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Facial Verification</h3>
                <p className="text-gray-600">
                    Take a clear selfie to verify your identity matches your ID
                </p>
            </div>

            <div className="relative">
                {/* Camera Preview or Captured Image */}
                <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                    {capturedImage ? (
                        <div className="relative w-full h-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={capturedImage}
                                alt="Captured selfie"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full h-full">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]" // Mirror effect
                            />
                            {!isCameraReady && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                                    <Clock className="w-8 h-8 animate-spin" />
                                </div>
                            )}
                            {/* Face outline guide */}
                            {isCameraReady && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="border-4 border-blue-500 rounded-full w-48 h-60 opacity-50"></div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Hidden canvas for image capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Look directly at the camera</li>
                    <li>• Ensure your face is well-lit</li>
                    <li>• Remove sunglasses or hats</li>
                    <li>• Keep your face within the oval guide</li>
                    <li>• Make sure your full face is visible</li>
                </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
                {capturedImage ? (
                    <>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                'Submit for Verification'
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={retakePhoto}
                            disabled={isLoading}
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Retake
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            onClick={capturePhoto}
                            disabled={!isCameraReady}
                            className="flex-1"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Take Photo
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </>
                )}
            </div>

            {/* Privacy Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Privacy & Security:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Your photo is encrypted and securely stored</li>
                    <li>• Only used for identity verification purposes</li>
                    <li>• Not shared with third parties</li>
                    <li>• Can be deleted upon request</li>
                </ul>
            </div>
        </div>
    )
}
