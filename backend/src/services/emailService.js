import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client lazily to ensure env vars are loaded
let sesClient = null;

const getSesClient = () => {
    if (!sesClient) {
        console.log('Initializing SES Client with config:', {
            region: process.env.AWS_REGION,
            hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID
        });

        sesClient = new SESClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    return sesClient;
};

/**
 * Send email using Amazon SES
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    const params = {
        Source: process.env.SES_FROM_EMAIL || 'noreply@studentstories.com',
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8'
            },
            Body: {
                Html: {
                    Data: html,
                    Charset: 'UTF-8'
                },
                ...(text && {
                    Text: {
                        Data: text,
                        Charset: 'UTF-8'
                    }
                })
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        const client = getSesClient();
        const response = await client.send(command);
        console.log('✅ Email sent successfully:', response.MessageId);
        return response;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

/**
 * Send OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} name - User name
 */
export const sendOTPEmail = async (to, otp, name) => {
    const subject = 'Your Verification Code - StudentStories';
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #000;">Welcome to StudentStories!</h1>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #000; letter-spacing: 5px; font-size: 32px; margin: 0;">${otp}</h2>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create this account, please ignore this email.</p>
    </div>
    `;

    return sendEmail({ to, subject, html });
};
