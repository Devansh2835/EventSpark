const nodemailer = require('nodemailer');

// Prefer API-based providers for hosted platforms (Render, Vercel) which may
// block outbound SMTP ports. If `SENDGRID_API_KEY` is set, use SendGrid's Web
// API. Otherwise fall back to SMTP with configurable host/port and sensible
// timeouts.

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let useSendGrid = false;
let sendgridClient = null;
if (SENDGRID_API_KEY) {
    try {
        // require at runtime so the dependency is optional for local dev
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(SENDGRID_API_KEY);
        sendgridClient = sgMail;
        useSendGrid = true;
        console.log('Email: Using SendGrid Web API for sending emails');
    } catch (err) {
        console.warn('SendGrid configured (SENDGRID_API_KEY) but @sendgrid/mail not installed. Falling back to SMTP.');
    }
}

// Configure SMTP transporter (used if SendGrid not available)
const smtpHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.EMAIL_PORT, 10) || 587;
const smtpSecure = (process.env.EMAIL_SECURE === 'true') || (smtpPort === 465);

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: EMAIL_USER && EMAIL_PASS ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined,
    // Timeouts to fail fast and provide clearer diagnostics in hosted envs
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: {
        // Allow self-signed certificates if necessary (not recommended for prod)
        rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
    }
});

const renderSmtpBlockedHint = () => {
    return 'Outbound SMTP connections can be blocked by some hosting providers (e.g. Render).\n' +
        'Recommended: use an API-based transactional email provider (SendGrid, Mailgun, Postmark) and set SENDGRID_API_KEY.\n' +
        'See Render docs: https://render.com/docs/mail\n' +
        'Or configure EMAIL_HOST/EMAIL_PORT/EMAIL_USER/EMAIL_PASS in environment variables.';
};

const buildFrom = () => ({ name: 'College Event Manager', address: process.env.EMAIL_USER || 'no-reply@events.example' });

const sendViaSendGrid = async (msg) => {
    // msg: { to, subject, html, from }
    if (!sendgridClient) throw new Error('SendGrid client not available');
    const data = {
        to: msg.to,
        from: msg.from && msg.from.address ? msg.from.address : (process.env.EMAIL_FROM || process.env.EMAIL_USER),
        subject: msg.subject,
        html: msg.html
    };
    const res = await sendgridClient.send(data);
    return res;
};

const sendViaSMTP = async (mailOptions) => {
    // Validate credentials for SMTP path
    if (!EMAIL_USER || !EMAIL_PASS) {
        throw new Error('EMAIL_USER or EMAIL_PASS is not configured. Set credentials in environment variables, or configure SENDGRID_API_KEY for an API-based provider.');
    }
    // Attempt to send
    return await transporter.sendMail(mailOptions);
};

const sendMail = async (to, subject, html) => {
    const mailOptions = {
        from: buildFrom(),
        to,
        subject,
        html
    };

    try {
        if (useSendGrid) {
            const res = await sendViaSendGrid(mailOptions);
            console.log('Email sent via SendGrid:', (res && res[0] && res[0].statusCode) || 'ok');
            return true;
        }

        const info = await sendViaSMTP(mailOptions);
        console.log('Email sent via SMTP:', info && info.messageId ? info.messageId : 'ok');
        return true;
    } catch (error) {
        // If it's a network timeout often caused by provider blocking SMTP, provide guidance
        if (error && error.code === 'ETIMEDOUT') {
            console.error('SMTP connection timed out. ' + renderSmtpBlockedHint());
        } else if (error && error.response && error.response.body) {
            console.error('Email send error response:', error.response.body);
        } else {
            console.error('Error sending email:', error);
        }
        throw error;
    }
};

const sendOTP = async (email, otp, name) => {
    const html = `
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
    `;
    return await sendMail(email, 'Verify Your Email - OTP', html);
};

const sendEventRegistrationEmail = async (email, name, eventTitle, qrCodeUrl) => {
    const html = `
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
    `;
    return await sendMail(email, `Registration Confirmed - ${eventTitle}`, html);
};

module.exports = { sendOTP, sendEventRegistrationEmail };