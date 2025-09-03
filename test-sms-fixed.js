// Test the SMS API endpoint to verify it's working correctly
const testPhone = '+233240841448' // Using the same number from before for testing

async function testSMSAPI() {
    try {
        console.log('Testing SMS API...')
        
        const response = await fetch('http://localhost:3000/api/sms/send-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                phoneNumber: testPhone,
                countryCode: 'GH'
            })
        })

        const data = await response.json()
        console.log('Response:', data)
        
        if (data.success) {
            console.log('✅ SMS sent successfully!')
        } else {
            console.log('❌ SMS failed:', data.error)
        }
    } catch (error) {
        console.error('❌ Test failed:', error)
    }
}

// Run the test
testSMSAPI()
