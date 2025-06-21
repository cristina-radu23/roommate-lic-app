# Email Configuration Guide

To enable real email sending for verification codes, you need to set up Gmail SMTP credentials.

## Option 1: Using Gmail (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security > 2-Step Verification > App passwords
3. Generate a new app password for "Mail"
4. Copy the 16-character password

### Step 3: Set Environment Variables
Create a `.env` file in the backend directory with:

```
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
```

### Step 4: Restart the server
The server will now use Gmail SMTP to send real verification emails.

## Option 2: Using Test Account (Development Only)

If you don't set up Gmail credentials, the app will automatically use Ethereal test accounts. You'll see a preview URL in the console where you can view the sent emails.

## Testing

1. Create a new account
2. Check your email (or the preview URL if using test account)
3. Enter the verification code on the verification page

## Troubleshooting

- Make sure your Gmail account has "Less secure app access" enabled OR use App Passwords
- Check that the environment variables are correctly set
- Verify the email address is valid 