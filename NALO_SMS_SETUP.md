# Nalo Solutions SMS Integration Setup Guide

## 1. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```env
# Nalo Solutions SMS Configuration
NALO_API_KEY=your_actual_api_key_from_nalo_portal
NALO_SENDER_ID=SendMame
```

## 2. Getting Your Nalo Solutions API Key

1. Visit [Nalo Solutions Portal](https://portal.nalosolutions.com/)
2. Sign up or log in to your account
3. Navigate to API section
4. Generate or copy your API key
5. Add the API key to your `.env.local` file

## 3. API Endpoints

The integration includes two API endpoints:

### Send Verification Code
- **Endpoint:** `POST /api/sms/send-verification`
- **Body:** 
  ```json
  {
    "phoneNumber": "+233123456789",
    "countryCode": "GH"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Verification code sent successfully",
    "messageId": "msg_12345"
  }
  ```

### Verify Code
- **Endpoint:** `POST /api/sms/verify-code`
- **Body:**
  ```json
  {
    "phoneNumber": "+233123456789",
    "code": "123456"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Phone number verified successfully"
  }
  ```

## 4. Features

- ✅ Automated 6-digit code generation
- ✅ 5-minute code expiration
- ✅ International phone number support with libphonenumber-js
- ✅ Country code validation
- ✅ Rate limiting ready (can be added)
- ✅ Error handling and user feedback
- ✅ Clean up of expired codes

## 5. Security Considerations

- Codes expire after 5 minutes
- Codes are deleted after successful verification
- Phone number validation using libphonenumber-js
- API key stored securely in environment variables

## 6. Testing

For testing purposes, you can:
1. Use your own phone number
2. Check the console logs for verification codes during development
3. Consider adding a test mode environment variable

## 7. Production Notes

- Remove console.log statements in production
- Consider using Redis or database for code storage instead of in-memory Map
- Add rate limiting to prevent SMS spam
- Monitor SMS usage and costs
- Set up proper error monitoring

## 8. Cost Management

- Each SMS sent through Nalo Solutions incurs a cost
- Consider implementing rate limiting per phone number
- Monitor usage through the Nalo Solutions portal
- Set up usage alerts

## 9. Troubleshooting

### Common Issues:
- **SMS not received:** Check phone number format and country code
- **API errors:** Verify API key and account balance
- **Code expiration:** Codes expire after 5 minutes
- **Invalid format:** Ensure phone number is in E.164 format

### Debug Steps:
1. Check console logs for API responses
2. Verify environment variables are loaded
3. Test with a known working phone number
4. Check Nalo Solutions portal for API usage and errors
