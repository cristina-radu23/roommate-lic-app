import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Generate a random 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create email transporter
const createTransporter = async () => {
  // Check if Gmail credentials are configured
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    // Use Gmail SMTP
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  } else {
    // Use Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    console.log('Using test email account. Preview URL will be shown in console.');
    
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
};

// Send verification email
export const sendVerificationEmail = async (
  email: string, 
  verificationCode: string, 
  firstName: string
): Promise<void> => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@roommate-app.com',
      to: email,
      subject: 'Email Verification - Roommate App',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${firstName}!</h2>
          <p>Thank you for creating an account with our Roommate App.</p>
          <p>Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create this account, please ignore this email.</p>
          <p>Best regards,<br>The Roommate App Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    if (!process.env.SMTP_USER) {
      // If using test account, show preview URL
      console.log('Email sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('Verification email sent successfully to:', email);
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}; 