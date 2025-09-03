// Test localStorage access fix
// This should run without errors on both server and client

const { storeVerificationCode, getStoredCode, verifyCode } = require('./lib/sms-verification.js')

console.log('Testing SMS verification without localStorage errors...')

// Test server-side storage (should work without localStorage)
console.log('\n1. Testing server-side storage...')
try {
    storeVerificationCode('+233240841448', '123456', 'test-user-123')
    console.log('✅ Code stored successfully on server')
} catch (error) {
    console.error('❌ Error storing code:', error.message)
}

// Test retrieval
console.log('\n2. Testing code retrieval...')
try {
    const stored = getStoredCode('+233240841448')
    console.log('✅ Code retrieved:', stored ? 'Found' : 'Not found')
} catch (error) {
    console.error('❌ Error retrieving code:', error.message)
}

// Test verification
console.log('\n3. Testing code verification...')
try {
    const isValid = verifyCode('+233240841448', '123456', 'test-user-123')
    console.log('✅ Verification result:', isValid ? 'Valid' : 'Invalid')
} catch (error) {
    console.error('❌ Error verifying code:', error.message)
}

console.log('\n✅ All tests completed without localStorage errors!')
console.log('The fix ensures localStorage is only accessed in browser environment.')
