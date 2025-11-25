const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('EMAIL_USER and/or EMAIL_PASS not set. Set them in your .env (use an App Password for Gmail).');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

const sendOTP = async (email, otp, name) => {
    try {
        const mailOptions = {
            from: {
                name: 'College Event Manager',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Verify Your Email - OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #21808d;">Email Verification</h2>
                    <p>Hi ${name},</p>
                    <p>Thank you for registering with College Event Manager!</p>
                    <p>Your OTP for email verification is:</p>
                    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #21808d; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,<br>College Event Manager Team</p>
                </div>
            `
        };

        if (!EMAIL_USER || !EMAIL_PASS) {
            throw new Error('EMAIL_USER or EMAIL_PASS is not configured. Set credentials in environment variables. For Gmail, use an App Password.');
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

const sendEventRegistrationEmail = async (email, name, eventTitle, qrCodeUrl) => {
    try {
        const mailOptions = {
            from: {
                name: 'College Event Manager',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: `Registration Confirmed - ${eventTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #21808d;">Event Registration Successful!</h2>
                    <p>Hi ${name},</p>
                    <p>Congratulations! You have successfully registered for <strong>${eventTitle}</strong>.</p>
                    <p>Please save this QR code for RSVP at the venue:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <img src="${qrCodeUrl}" alt="Event QR Code" style="max-width: 250px; border: 2px solid #21808d; padding: 10px;">
                    </div>
                    <p>Show this QR code at the event venue for entry.</p>
                    <br>
                    <p>We look forward to seeing you at the event!</p>
                    <p>Best regards,<br>College Event Manager Team</p>
                </div>
            `
        };

        if (!EMAIL_USER || !EMAIL_PASS) {
            throw new Error('EMAIL_USER or EMAIL_PASS is not configured. Set credentials in environment variables. For Gmail, use an App Password.');
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Registration email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending registration email:', error);
        throw error;
    }
};

module.exports = { sendOTP, sendEventRegistrationEmail };