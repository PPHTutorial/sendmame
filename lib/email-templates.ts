// Amenade Platform - Professional Email Templates

interface EmailVerificationData {
  firstName: string
  verificationCode: string
  email: string
}

interface PasswordResetData {
  firstName: string
  resetToken: string
  email: string
}

// Base template styles for professional appearance
const baseStyles = `
  body { 
    margin: 0; 
    padding: 0; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
    line-height: 1.6; 
    color: #333333; 
    background-color: #f8fafc; 
  }
  .email-container { 
    max-width: 600px; 
    margin: 0 auto; 
    background-color: #ffffff; 
    border-radius: 12px; 
    overflow: hidden; 
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); 
  }
  .header { 
    background-color: #1f2937; 
    padding: 40px 30px; 
    text-align: center; 
  }
  .logo { 
    color: #ffffff; 
    font-size: 32px; 
    font-weight: 700; 
    letter-spacing: -0.5px; 
    margin: 0; 
  }
  .tagline { 
    color: #9ca3af; 
    font-size: 14px; 
    margin: 8px 0 0 0; 
    font-weight: 400; 
  }
  .content { 
    padding: 50px 40px; 
  }
  .greeting { 
    font-size: 24px; 
    font-weight: 600; 
    color: #1f2937; 
    margin-bottom: 20px; 
  }
  .message { 
    font-size: 16px; 
    color: #4b5563; 
    margin-bottom: 30px; 
    line-height: 1.7; 
  }
  .code-container { 
    background-color: #f9fafb; 
    border: 2px solid #e5e7eb; 
    border-radius: 12px; 
    padding: 30px; 
    text-align: center; 
    margin: 30px 0; 
  }
  .code-label { 
    font-size: 14px; 
    color: #6b7280; 
    margin-bottom: 10px; 
    font-weight: 500; 
    text-transform: uppercase; 
    letter-spacing: 0.5px; 
  }
  .verification-code { 
    font-size: 36px; 
    font-weight: 700; 
    color: #1f2937; 
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
    letter-spacing: 8px; 
    margin: 0; 
  }
  .button { 
    display: inline-block; 
    background-color: #3b82f6; 
    color: #ffffff; 
    padding: 16px 32px; 
    text-decoration: none; 
    border-radius: 8px; 
    font-weight: 600; 
    font-size: 16px; 
    margin: 20px 0; 
    transition: background-color 0.3s ease; 
  }
  .button:hover { 
    background-color: #2563eb; 
  }
  .footer { 
    background-color: #f9fafb; 
    padding: 30px 40px; 
    border-top: 1px solid #e5e7eb; 
  }
  .footer-text { 
    font-size: 14px; 
    color: #6b7280; 
    margin: 0 0 15px 0; 
    line-height: 1.6; 
  }
  .social-links { 
    text-align: center; 
    margin-top: 20px; 
  }
  .social-link { 
    display: inline-block; 
    margin: 0 10px; 
    color: #9ca3af; 
    text-decoration: none; 
    font-size: 14px; 
  }
  .security-notice { 
    background-color: #fef3c7; 
    border-left: 4px solid #f59e0b; 
    padding: 20px; 
    margin: 30px 0; 
    border-radius: 0 8px 8px 0; 
  }
  .security-text { 
    color: #92400e; 
    font-size: 14px; 
    margin: 0; 
    font-weight: 500; 
  }
`

export function createEmailVerificationTemplate(data: EmailVerificationData) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your SendMaMe Account</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1 class="logo">SendMaMe</h1>
          <p class="tagline">Connecting Senders & Travelers Worldwide</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <h2 class="greeting">Welcome, ${data.firstName}! 👋</h2>
          
          <p class="message">
            Thank you for joining SendMaMe! We're excited to have you as part of our community. 
            To complete your account setup and start connecting with travelers and senders, 
            please verify your email address using the verification code below.
          </p>
          
          <div class="code-container">
            <div class="code-label">Your Verification Code</div>
            <div class="verification-code">${data.verificationCode}</div>
          </div>
          
          <p class="message">
            Simply enter this 6-digit code in the verification screen to activate your account. 
            This code will expire in <strong>15 minutes</strong> for your security.
          </p>
          
          <div class="security-notice">
            <p class="security-text">
              🔒 <strong>Security Reminder:</strong> Never share this verification code with anyone. 
              SendMaMe will never ask for your verification code via phone or email.
            </p>
          </div>
          
          <p class="message">
            If you didn't create a SendMaMe account, please ignore this email. 
            Your email address will not be added to our system.
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">
            <strong>Need help?</strong> If you're having trouble with verification, 
            contact our support team at <a href="mailto:support@sendmame.com" style="color: #3b82f6;">support@sendmame.com</a>
          </p>
          
          <p class="footer-text">
            This email was sent to <strong>${data.email}</strong>. 
            If you didn't request this verification, please disregard this message.
          </p>
          
          <div class="social-links">
            <a href="#" class="social-link">Privacy Policy</a>
            <a href="#" class="social-link">Terms of Service</a>
            <a href="#" class="social-link">Contact Support</a>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            © 2025 SendMaMe. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Welcome to SendMaMe, ${data.firstName}!

Thank you for joining our community. To complete your account setup, please verify your email address.

Your verification code: ${data.verificationCode}

Enter this 6-digit code in the verification screen to activate your account. This code will expire in 15 minutes.

Security Reminder: Never share this verification code with anyone. SendMaMe will never ask for your verification code via phone or email.

If you didn't create a SendMaMe account, please ignore this email.

Need help? Contact our support team at support@sendmame.com

Best regards,
The SendMaMe Team
  `

  return {
    subject: 'Verify Your SendMaMe Account - Welcome to Our Community!',
    html,
    text
  }
}

export function createPasswordResetTemplate(data: PasswordResetData) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${data.resetToken}&email=${encodeURIComponent(data.email)}`
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your SendMaMe Password</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        <!-- Header -->
        <div class="header">
          <h1 class="logo">SendMaMe</h1>
          <p class="tagline">Connecting Senders & Travelers Worldwide</p>
        </div>
        
        <!-- Content -->
        <div class="content">
          <h2 class="greeting">Password Reset Request</h2>
          
          <p class="message">
            Hello ${data.firstName},
          </p>
          
          <p class="message">
            We received a request to reset the password for your SendMaMe account associated with 
            <strong>${data.email}</strong>. If you made this request, click the button below to 
            create a new password.
          </p>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" class="button">Reset My Password</a>
          </div>
          
          <p class="message">
            This password reset link will expire in <strong>1 hour</strong> for your security. 
            If you need to reset your password again, you can always request a new reset link.
          </p>
          
          <div class="security-notice">
            <p class="security-text">
              🔒 <strong>Security Notice:</strong> If you didn't request this password reset, 
              please ignore this email. Your account remains secure and no changes have been made.
            </p>
          </div>
          
          <p class="message">
            <strong>Trouble clicking the button?</strong> Copy and paste this URL into your browser:<br>
            <span style="word-break: break-all; color: #3b82f6; font-size: 14px;">${resetUrl}</span>
          </p>
          
          <p class="message">
            For your security, this link can only be used once. After creating your new password, 
            this link will no longer be valid.
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p class="footer-text">
            <strong>Account Security Tips:</strong>
          </p>
          <ul style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
            <li>Use a strong, unique password for your SendMaMe account</li>
            <li>Never share your login credentials with others</li>
            <li>Enable two-factor authentication when available</li>
            <li>Contact support immediately if you notice suspicious activity</li>
          </ul>
          
          <p class="footer-text" style="margin-top: 20px;">
            <strong>Need help?</strong> Contact our support team at 
            <a href="mailto:support@sendmame.com" style="color: #3b82f6;">support@sendmame.com</a>
          </p>
          
          <div class="social-links">
            <a href="#" class="social-link">Privacy Policy</a>
            <a href="#" class="social-link">Terms of Service</a>
            <a href="#" class="social-link">Contact Support</a>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
            © 2025 SendMaMe. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
Password Reset Request - SendMaMe

Hello ${data.firstName},

We received a request to reset the password for your SendMaMe account (${data.email}).

If you made this request, use the following link to reset your password:
${resetUrl}

This link will expire in 1 hour for your security.

If you didn't request this password reset, please ignore this email. Your account remains secure.

For your security, this link can only be used once.

Account Security Tips:
- Use a strong, unique password
- Never share your login credentials
- Enable two-factor authentication when available
- Contact support if you notice suspicious activity

Need help? Contact our support team at support@sendmame.com

Best regards,
The SendMaMe Team
  `

  return {
    subject: 'Reset Your SendMaMe Password - Security Request',
    html,
    text
  }
}
