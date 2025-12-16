import nodemailer from 'nodemailer';
// Sender details from environment variables
const senderEmail = process.env.GMAIL_USER; 
const appPassword = process.env.GMAIL_APP_PASSWORD;

// 1. Create the Transporter
// This object configures the connection to the email service (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: senderEmail,
        pass: appPassword, // Use the App Password here
    },
});

export async function sendEmail({
    fromName = "Testing Service",
    fromEmail,
    subject,
    message,
    title,
    user
}: {
    fromName: string;
    fromEmail?: string;
    subject: string;
    message: string;
    title?: string;
    user?: string[];
}) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Template</title>
    <style>
        body, html {
            margin: 0; padding: 0;
            font-family: Arial, sans-serif;
            line-height: 2;
            color: #333;
            background-color: #f6f6f6;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .email-header {
            background-color: #4a90e2;
            color: #fff;
            padding: 7px;
            text-align: center;
        }
        .email-content {
            padding: 15px;
        }
        .subject {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
        }
        .message {
            font-size: 16px;
            color: #555;
        }
        .email-footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>${title ?? "Message Notification"}</h1>
        </div>

        <div class="email-content">
            <div class="subject">${subject} :</div>
            <div class="message">${message}</div>
        </div>

        <div class="email-footer">
            <p>This is an automated message.</p>
            <p>&copy; 2026 SkuliPro. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail ?? process.env.GMAIL_USER!}>`,
        to: user ?? process.env.GMAIL_USER!,
        subject,
        html,
    };

    try {
        await transporter.sendMail(mailOptions);
        return {
            success: true,
            message: "Email sent successfully"
        }
    } catch (error: any) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'EDNS') {
            return {
                success: false,
                message: "Please connect your device to the internet to send email."
            };
        }

        if (error.code === 'EAUTH') {
            return {
                success: false,
                message: "Authentication failed. Check your Gmail credentials or App Password."
            };
        }

        return {
            success: false,
            message: "Failed to send email. Please try again later."
        };
    }
}

