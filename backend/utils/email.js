const nodemailer = require('nodemailer');

// Create a transporter for Brevo SMTP
let transporter = null;

const createTransporter = () => {
  // Validate required environment variables
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('[Email Service] Missing required environment variables:', missing);
    return null;
  }

  console.log('[Email Service] Creating Brevo SMTP transporter...');
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465', // True for port 465, false for 587
    requireTLS: true, // Enforce TLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100
  });
};

// Initialize transporter
const initTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

/**
 * Send an email
 * @param {object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.subject - Email subject
 * @param {string} params.html - HTML content
 * @param {string} [params.text] - Plain text content (optional)
 * @param {string} [params.bcc] - BCC recipient (optional)
 * @returns {Promise<{sent: boolean, previewUrl?: string, reason?: string}>}
 */
const sendEmail = async ({ to, subject, html, text, bcc }) => {
  try {
    console.log('[Email Service] Sending email to:', to);
    
    const mailTransporter = initTransporter();
    if (!mailTransporter) {
      console.error('[Email Service] No transporter available');
      return { sent: false, reason: 'Transporter not initialized (check SMTP env vars)' };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback to stripped HTML if no text provided
    };

    if (bcc) {
      mailOptions.bcc = bcc;
    }

    const info = await mailTransporter.sendMail(mailOptions);
    console.log('[Email Service] Email sent successfully! Message ID:', info.messageId);
    
    return {
      sent: true,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };

  } catch (error) {
    console.error('[Email Service] Failed to send email:', error.message);
    console.error('[Email Service] Full error:', error);
    return {
      sent: false,
      reason: error.message
    };
  }
};

const formatMoney = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async ({ to, order }) => {
  const html = `
    <div style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #f0f0f0;">
      <div style="text-align:center; margin-bottom:30px;">
        <h1 style="margin:0; color:#111; text-transform:uppercase; letter-spacing:2px; font-size:24px;">LIBBAAS</h1>
        <p style="color:#777; font-size:14px; margin-top:5px;">Thank you for your purchase!</p>
      </div>

      <div style="margin-bottom:30px;">
        <h2 style="font-size:18px; border-bottom:2px solid #111; padding-bottom:8px; margin-bottom:15px; text-transform:uppercase;">Order Summary</h2>
        <p style="margin:5px 0;"><strong>Order ID:</strong> ${order.id}</p>
        <p style="margin:5px 0;"><strong>Customer:</strong> ${order.customer?.fullName || ''}</p>
        <p style="margin:5px 0;"><strong>Delivery to:</strong> ${order.customer?.address || ''}</p>
        <p style="margin:5px 0;"><strong>Payment:</strong> ${order.paymentMethod === 'cash' ? 'Cash On Delivery' : 'Card Payment'}</p>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <thead>
          <tr style="text-align:left; font-size:12px; text-transform:uppercase; color:#999; letter-spacing:1px;">
            <th style="padding-bottom:10px; border-bottom:1px solid #111;">Product</th>
            <th style="padding-bottom:10px; border-bottom:1px solid #111; text-align:right;">Qty</th>
            <th style="padding-bottom:10px; border-bottom:1px solid #111; text-align:right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map(i => `
            <tr>
              <td style="padding:10px 0; border-bottom:1px solid #eee;">
                <div style="font-weight:bold; color:#111;">${i.name}</div>
                <div style="color:#777; font-size:12px;">${i.selectedColor || ''} ${i.selectedSize ? `/ ${i.selectedSize}` : ''}</div>
              </td>
              <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right; color:#111;">x${i.quantity}</td>
              <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right; color:#111; font-weight:bold;">${formatMoney(i.price * i.quantity)}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:20px 0 5px; color:#777;">Subtotal</td>
            <td style="padding:20px 0 5px; text-align:right; color:#111;">${formatMoney(order.subtotal)}</td>
          </tr>
          ${order.discount > 0 ? `
            <tr>
              <td colspan="2" style="padding:10px 0; color:#777;">Card Discount (7%)</td>
              <td style="padding:10px 0; text-align:right; color:#d4af37;">- ${formatMoney(order.discount)}</td>
            </tr>
          ` : ''}
          <tr>
            <td colspan="2" style="padding:10px 0; border-top:1px solid #111; font-weight:bold; font-size:18px;">Total Amount</td>
            <td style="padding:10px 0; border-top:1px solid #111; text-align:right; font-weight:bold; font-size:18px; color:#111;">${formatMoney(order.total)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="text-align:center; margin:40px 0;">
        <p style="margin-bottom:20px; color:#555;">We hope you love your new items!</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color:#111; color:#fff; padding:15px 35px; text-decoration:none; font-weight:bold; border-radius:0; text-transform:uppercase; letter-spacing:1px; display:inline-block;">Thanks for Shopping - Visit Store</a>
      </div>

      <div style="text-align:center; border-top:1px solid #eee; padding-top:20px; color:#999; font-size:12px;">
        <p style="margin:5px 0;">If you have any questions, simply reply to this email.</p>
        <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} LIBBAAS. All rights reserved.</p>
      </div>
    </div>`;

  return sendEmail({
    to,
    bcc: process.env.ADMIN_EMAIL,
    subject: `Order Confirmation - ${order.id}`,
    html
  });
};

/**
 * Send OTP email
 */
const sendOtpEmail = async ({ to, otp }) => {
  const html = `
    <div style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #f0f0f0;">
      <div style="text-align:center; margin-bottom:30px;">
        <h1 style="margin:0; color:#111; text-transform:uppercase; letter-spacing:2px; font-size:24px;">LIBBAAS</h1>
        <p style="color:#777; font-size:14px; margin-top:5px;">Admin Login Verification</p>
      </div>

      <div style="margin-bottom:30px;">
        <h2 style="font-size:18px; color:#111; margin:0 0 8px;">Your Login Code</h2>
        <p style="margin:0 0 14px; color:#555;">Use this code to login. This code expires in 10 minutes.</p>
        <div style="font-size:36px; letter-spacing:8px; font-weight:700; padding:20px; border:1px solid #eee; text-align:center; display:inline-block; width:100%; box-sizing:border-box;">${otp}</div>
        <p style="margin:18px 0 0; color:#777; font-size:12px;">If you did not request this code, you can ignore this email.</p>
      </div>

      <div style="text-align:center; border-top:1px solid #eee; padding-top:20px; color:#999; font-size:12px;">
        <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} LIBBAAS. All rights reserved.</p>
      </div>
    </div>`;

  const text = `Your OTP code is: ${otp}. It expires in 10 minutes.`;

  return sendEmail({
    to,
    subject: 'Your OTP Login Code - LIBBAAS',
    html,
    text
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  console.log('[Email Service] Sending password reset email to:', to);

  const html = `
    <div style="font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:0 auto; padding:20px; border:1px solid #f0f0f0;">
      <div style="text-align:center; margin-bottom:30px;">
        <h1 style="margin:0; color:#111; text-transform:uppercase; letter-spacing:2px; font-size:24px;">LIBBAAS</h1>
        <p style="color:#777; font-size:14px; margin-top:5px;">Password Reset Request</p>
      </div>

      <div style="margin-bottom:30px;">
        <h2 style="font-size:18px; color:#111; margin:0 0 8px;">Password Reset Request</h2>
        <p style="margin:0 0 14px; color:#555;">You requested to reset your password. Click the button below to set a new password. This link expires in 1 hour.</p>
        
        <div style="text-align:center; margin:30px 0;">
          <a href="${resetUrl}" style="background-color:#111; color:#fff; padding:12px 30px; text-decoration:none; display:inline-block; font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-size:14px;">Reset Password</a>
        </div>
        
        <p style="margin:18px 0 0; color:#777; font-size:12px;">If you did not request a password reset, you can ignore this email.</p>
        <p style="margin:8px 0 0; color:#777; font-size:10px;">Link: ${resetUrl}</p>
      </div>

      <div style="text-align:center; border-top:1px solid #eee; padding-top:20px; color:#999; font-size:12px;">
        <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} LIBBAAS. All rights reserved.</p>
      </div>
    </div>`;

  const text = `You requested a password reset. Use this link: ${resetUrl}`;

  return sendEmail({
    to,
    subject: 'Reset Your Password - LIBBAAS',
    html,
    text
  });
};

/**
 * Send custom email
 */
const sendCustomEmail = async ({ to, subject, html, text }) => {
  return sendEmail({
    to,
    bcc: process.env.ADMIN_EMAIL,
    subject,
    html,
    text
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendCustomEmail,
  sendOtpEmail,
  sendPasswordResetEmail
};
