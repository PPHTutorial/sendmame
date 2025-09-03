import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { storeVerificationCode } from '@/lib/sms-verification'

// Nalo Solutions SMS API configuration
const NALO_API_BASE_URL = 'https://sms.nalosolutions.com/smsbackend/clientapi/Resl_Nalo/send-message/'
const NALO_API_KEY = process.env.NALO_API_KEY
const NALO_SENDER_ID = process.env.NALO_SENDER_ID || 'SendMame'

interface SMSVerificationRequest {
    phoneNumber: string
    countryCode: string
}

// Generate a 6-digit verification code
function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Rate limiting: store timestamps of recent SMS requests per phone number
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 2 // Max 2 SMS per minute per phone number

function isRateLimited(phoneNumber: string): boolean {
    const now = Date.now()
    const requests = rateLimitMap.get(phoneNumber) || []

    // Remove old requests outside the window
    const recentRequests = requests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW)

    if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
        return true
    }

    // Add current request and update
    recentRequests.push(now)
    rateLimitMap.set(phoneNumber, recentRequests)

    return false
}

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const authPayload = await requireAuth(request)
        const userId = authPayload.userId

        // Check if Nalo API key is configured
        if (!NALO_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'SMS service not configured' },
                { status: 500 }
            )
        }

        const body: SMSVerificationRequest = await request.json()
        const { phoneNumber } = body

        // Validate input
        if (!phoneNumber) {
            return NextResponse.json(
                { success: false, error: 'Phone number is required' },
                { status: 400 }
            )
        }

        // Find user and verify they own this phone number
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
                phone: phoneNumber
            }
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Phone number not found or does not belong to your account' },
                { status: 404 }
            )
        }

        if (user.isPhoneVerified) {
            return NextResponse.json(
                { success: false, error: 'Phone number is already verified' },
                { status: 400 }
            )
        }

        // Check rate limiting
        if (isRateLimited(phoneNumber)) {
            return NextResponse.json(
                { success: false, error: 'Too many SMS requests. Please wait before requesting another code.' },
                { status: 429 }
            )
        }

        // Generate verification code
        const verificationCode = generateVerificationCode()

        // Store the code for later verification
        storeVerificationCode(phoneNumber, verificationCode, userId)

        // Prepare SMS message
        const message = `Your SendMame verification code is: ${verificationCode}. This code will expire in 5 minutes. Do not share this code with anyone.`

        // Clean and format phone number for Nalo Solutions
        // Remove all non-digit characters except +
        const cleanPhoneNumber = phoneNumber.replace(/[^\d+]/g, '')


        console.log('Original phone:', phoneNumber)
        console.log('Formatted phone:', cleanPhoneNumber)

        // Construct the GET URL with parameters for Nalo Solutions
        const apiUrl = new URL(NALO_API_BASE_URL)
        apiUrl.searchParams.append('key', NALO_API_KEY!)
        apiUrl.searchParams.append('destination', cleanPhoneNumber)
        apiUrl.searchParams.append('source', NALO_SENDER_ID)
        apiUrl.searchParams.append('message', message)
        apiUrl.searchParams.append('type', '0')
        apiUrl.searchParams.append('dlr', '1')


        console.log('Sending SMS to:', cleanPhoneNumber)

        // Send SMS via Nalo Solutions API
        const response = await fetch(apiUrl.toString(), {
            method: 'GET',

        })

        // Nalo Solutions returns a plain text response, not JSON
        const responseText = await response.text()
        console.log('Nalo API Response:', responseText)

        // Check if the response indicates success
        // Nalo typically returns "1701" for success or error codes for failures
        const isSuccess = responseText.trim().includes('1701') || responseText.includes('success')

        if (!isSuccess) {
            console.error('Nalo SMS API error:', responseText)

            // Map common error codes to user-friendly messages
            let errorMessage = 'Failed to send SMS'
            if (responseText.includes('1702')) {
                errorMessage = 'Invalid phone number'
            } else if (responseText.includes('1703')) {
                errorMessage = 'Insufficient balance'
            } else if (responseText.includes('1704')) {
                errorMessage = 'Invalid API configuration'
            } else if (responseText.includes('1705')) {
                errorMessage = 'Message too long'
            } else if (responseText.includes('1706')) {
                errorMessage = 'Invalid destination number'
            } else if (responseText.includes('1708')) {
                errorMessage = 'Invalid delivery receipt configuration'
            }

            return NextResponse.json(
                {
                    success: false,
                    error: errorMessage,
                    details: responseText
                },
                { status: 500 }
            )
        }

        // Log successful SMS send (remove in production)
        console.log('SMS sent successfully:', {
            phoneNumber,
            response: responseText,
            timestamp: new Date().toISOString()
        })



        return NextResponse.json({
            success: true,
            message: 'Verification code sent successfully',
            response: responseText
        })

    } catch (error) {
        console.error('SMS sending error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
