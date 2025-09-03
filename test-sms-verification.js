// Test SMS verification flow after authentication fix
// This test checks if the verification codes are properly stored and retrieved

const testPhoneNumber = '+233240841448'
const testCode = '123456'
const testUserId = 'test-user-123'

// Import the verification functions
import { storeVerificationCode, verifyCode, getStoredCode } from './lib/sms-verification.js'

console.log('Testing SMS verification storage...')

// Test 1: Store verification code
console.log('\n1. Storing verification code...')
storeVerificationCode(testPhoneNumber, testCode, testUserId)
console.log('✅ Code stored')

// Test 2: Check if code is stored
console.log('\n2. Checking stored code...')
const stored = getStoredCode(testPhoneNumber)
console.log('Stored data:', stored)

// Test 3: Verify with correct user ID
console.log('\n3. Verifying with correct user ID...')
const isValidCorrectUser = verifyCode(testPhoneNumber, testCode, testUserId)
console.log('Verification result (correct user):', isValidCorrectUser)

// Test 4: Try to verify again (should fail - code consumed)
console.log('\n4. Trying to verify again (should fail)...')
const isValidSecondTime = verifyCode(testPhoneNumber, testCode, testUserId)
console.log('Verification result (second attempt):', isValidSecondTime)

// Test 5: Store new code and verify with wrong user ID
console.log('\n5. Testing with wrong user ID...')
storeVerificationCode(testPhoneNumber, '654321', testUserId)
const isValidWrongUser = verifyCode(testPhoneNumber, '654321', 'wrong-user-456')
console.log('Verification result (wrong user):', isValidWrongUser)

console.log('\n✅ SMS verification test completed!')
