// Test script for SMS functionality
// Run this in your browser console or create a test page

async function testSMSVerification() {
    const testPhoneNumber = '+233123456789' // Replace with your actual phone number
    
    console.log('Testing SMS verification...')
    
    try {
        // Step 1: Send verification code
        console.log('Step 1: Sending verification code...')
        const sendResponse = await fetch('/api/sms/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: testPhoneNumber,
                countryCode: 'GH'
            })
        })
        
        const sendData = await sendResponse.json()
        console.log('Send SMS Result:', sendData)
        
        if (!sendData.success) {
            console.error('Failed to send SMS:', sendData.error)
            return
        }
        
        // Step 2: Prompt for verification code
        const verificationCode = prompt('Enter the verification code you received:')
        
        if (!verificationCode) {
            console.log('Test cancelled - no verification code entered')
            return
        }
        
        // Step 3: Verify the code
        console.log('Step 2: Verifying code...')
        const verifyResponse = await fetch('/api/sms/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: testPhoneNumber,
                code: verificationCode
            })
        })
        
        const verifyData = await verifyResponse.json()
        console.log('Verify Code Result:', verifyData)
        
        if (verifyData.success) {
            console.log('✅ SMS verification test completed successfully!')
        } else {
            console.error('❌ Verification failed:', verifyData.error)
        }
        
    } catch (error) {
        console.error('Test error:', error)
    }
}

// Test rate limiting
async function testRateLimit() {
    const testPhoneNumber = '+233123456789' // Replace with your actual phone number
    
    console.log('Testing rate limiting...')
    
    for (let i = 1; i <= 5; i++) {
        console.log(`Request ${i}:`)
        
        try {
            const response = await fetch('/api/sms/send-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    phoneNumber: testPhoneNumber,
                    countryCode: 'GH'
                })
            })
            
            const data = await response.json()
            console.log(`Request ${i} result:`, data)
            
            if (response.status === 429) {
                console.log('✅ Rate limiting is working correctly!')
                break
            }
            
        } catch (error) {
            console.error(`Request ${i} error:`, error)
        }
        
        // Wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
    }
}

// Export functions for use
if (typeof window !== 'undefined') {
    window.testSMSVerification = testSMSVerification
    window.testRateLimit = testRateLimit
    
    console.log('SMS test functions loaded!')
    console.log('Run testSMSVerification() to test SMS sending and verification')
    console.log('Run testRateLimit() to test rate limiting')
}
