# Nalo Solutions SMS Integration Setup

## Overview
This project integrates with Nalo Solutions SMS API for sending verification codes during phone number verification.

## API Implementation Details

### HTTP Method
- **Method**: GET (Nalo Solutions uses GET requests with query parameters)
- **Base URL**: `https://sms.nalosolutions.com/smsbackend/Resl_Nalo/send-message/`

### Required Parameters
1. `key` - Your Nalo Solutions API key
2. `msisdn` - Phone number (without + prefix)
3. `sender_id` - Sender ID (default: "SendMame")
4. `message` - SMS message content

### Response Format
- **Type**: Plain text (not JSON)
- **Success Response**: "1701"
- **Error Codes**:
  - 1702: Invalid phone number
  - 1703: Insufficient balance
  - 1704: Invalid API key
  - 1705: Message too long

## Environment Variables Setup

Create a `.env.local` file with:
```env
NALO_API_KEY=your_actual_api_key_here
NALO_SENDER_ID=SendMame
```

### Getting Your API Key
1. Visit [Nalo Solutions Portal](https://portal.nalosolutions.com/)
2. Sign up or log in to your account
3. Navigate to API section
4. Generate or copy your API key
5. Add the API key to your `.env.local` file

## API Endpoints

### Send Verification Code
- **Endpoint**: `POST /api/sms/send-verification`
- **Body**: 
  ```json
  {
    "phoneNumber": "+233240841448",
    "countryCode": "GH"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Verification code sent successfully",
    "response": "1701"
  }
  ```

### Verify Code
- **Endpoint**: `POST /api/sms/verify-code`
- **Body**:
  ```json
  {
    "phoneNumber": "+233240841448",
    "code": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Code verified successfully"
  }
  ```

## Rate Limiting
- **Limit**: 2 SMS per phone number per minute
- **Storage**: In-memory (consider database for production)
- **Reset**: Rolling window based on first request time

## Security Features
- Phone number validation using libphonenumber-js
- Rate limiting protection
- Automatic code expiration (5 minutes)
- Environment variable protection
- Error code mapping for user-friendly messages

## Usage Example

The API automatically:
1. Generates a 6-digit verification code
2. Validates phone number format
3. Checks rate limits
4. Sends SMS via Nalo Solutions API
5. Stores code with expiration
6. Returns success/error response

## Testing
Use the provided test files:
```bash
# Test the corrected implementation
node test-sms-fixed.js

# Original test file (for reference)
node test-sms.js
```

## Production Considerations
1. Replace in-memory storage with database (Redis/PostgreSQL)
2. Add comprehensive logging and monitoring
3. Implement proper error tracking (Sentry/similar)
4. Consider SMS cost optimization
5. Add phone number blacklisting if needed
6. Implement backup SMS providers
7. Add SMS delivery status tracking

## Troubleshooting

### Common Issues
1. **JSON Parse Error**: Fixed - Nalo API returns plain text, not JSON
2. **Wrong HTTP Method**: Fixed - Using GET with query parameters
3. **Hardcoded Phone Numbers**: Fixed - Using dynamic phone numbers
4. **Rate Limiting**: Implemented with proper error messages

### Error Handling
The API now properly handles:
- Invalid phone numbers
- API key issues
- Insufficient balance
- Rate limit exceeded
- Network errors
