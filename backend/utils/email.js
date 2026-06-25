const nodemailer = require('nodemailer');

// Create a transporter for Brevo SMTP
let transporter = null;

const createTransporter = () => {
  // Validate required environment variables
  const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  console.log('[Email Service] Creating transporter...');
  console.log('[Email Service] Checking required env vars:');
  requiredEnvVars.forEach(key => {
    console.log(`  - ${key}:`, process.env[key] ? (key.includes('PASS') ? '***' : process.env[key]) : 'NOT SET ❌');
  });

  if (missing.length > 0) {
    console.warn('[Email Service] ❌ Missing required environment variables:', missing);
    return null;
  }

  console.log('[Email Service] ✅ All required env vars present');
  console.log('[Email Service] Creating Brevo SMTP transporter with config:');
  console.log('  - Host:', process.env.SMTP_HOST);
  console.log('  - Port:', process.env.SMTP_PORT);
  console.log('  - Secure:', process.env.SMTP_PORT === '465');
  console.log('  - User:', process.env.SMTP_USER.substring(0, 3) + '...');
  console.log('  - From:', process.env.EMAIL_FROM);
  
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === '465',
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    logger: true,
    debug: true
  });

  return t;
};

// Verify transporter connection
const verifyTransporter = async (t) => {
  try {
    console.log('[Email Service] Verifying SMTP connection...');
    await t.verify();
    console.log('[Email Service] ✅ SMTP connection verified successfully!');
    return true;
  } catch (error) {
    console.error('[Email Service] ❌ SMTP connection verification FAILED:');
    console.error('[Email Service] Error message:', error.message);
    console.error('[Email Service] Error code:', error.code);
    console.error('[Email Service] Error stack:', error.stack);
    return false;
  }
};

// Initialize transporter
const initTransporter = async () => {
  if (transporter) {
    console.log('[Email Service] Using cached transporter');
    return transporter;
  }

  console.log('[Email Service] Initializing new transporter...');
  const t = createTransporter();
  if (!t) {
    console.error('[Email Service] ❌ Failed to create transporter');
    return null;
  }

  const verified = await verifyTransporter(t);
  if (verified) {
    transporter = t;
    console.log('[Email Service] ✅ Transporter initialized and verified');
  } else {
    console.warn('[Email Service] Transporter created but verification failed');
    transporter = t;
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
 * @returns {Promise<{sent: boolean, previewUrl?: string, reason?: string, info?: any}>}
 */
const sendEmail = async ({ to, subject, html, text, bcc }) => {
  try {
    console.log('[Email Service] ========================================');
    console.log('[Email Service] 📧 Starting email send process');
    console.log('[Email Service] To:', to);
    console.log('[Email Service] Subject:', subject);
    console.log('[Email Service] BCC:', bcc || 'none');
    
    const mailTransporter = await initTransporter();
    if (!mailTransporter) {
      const errorMsg = 'Transporter not initialized (check SMTP env vars)';
      console.error('[Email Service] ❌', errorMsg);
      return { sent: false, reason: errorMsg };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    if (bcc) {
      mailOptions.bcc = bcc;
    }

    console.log('[Email Service] Mail options prepared:');
    console.log('  - From:', mailOptions.from);
    console.log('  - To:', mailOptions.to);
    console.log('  - Subject:', mailOptions.subject);
    console.log('[Email Service] Calling transporter.sendMail()...');

    const info = await mailTransporter.sendMail(mailOptions);
    
    console.log('[Email Service] ✅ sendMail() completed successfully!');
    console.log('[Email Service] Full response info:');
    console.log('  - messageId:', info.messageId);
    console.log('  - accepted:', JSON.stringify(info.accepted));
    console.log('  - rejected:', JSON.stringify(info.rejected));
    console.log('  - pending:', JSON.stringify(info.pending));
    console.log('  - response:', info.response);
    console.log('  - envelope:', JSON.stringify(info.envelope));
    console.log('[Email Service] ========================================');
    
    return {
      sent: true,
      previewUrl: nodemailer.getTestMessageUrl(info),
      info
    };

  } catch (error) {
    console.error('[Email Service] ========================================');
    console.error('[Email Service] ❌ FAILED to send email:');
    console.error('[Email Service] Error name:', error.name);
    console.error('[Email Service] Error message:', error.message);
    console.error('[Email Service] Error code:', error.code);
    console.error('[Email Service] Error command:', error.command);
    console.error('[Email Service] Error response:', error.response);
    console.error('[Email Service] Error stack:', error.stack);
    console.error('[Email Service] ========================================');
    
    return {
      sent: false,
      reason: error.message,
      error
    };
  }
};

const formatMoney = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async ({ to, order }) => {
  console.log('[Email Service] 📦 sendOrderConfirmationEmail called for order:', order.id);
  
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

  console.log('[Email Service] Calling sendEmail() for order confirmation...');
  const result = await sendEmail({
    to,
    bcc: process.env.ADMIN_EMAIL,
    subject: `Order Confirmation - ${order.id}`,
    html
  });
  console.log('[Email Service] Order confirmation email result:', result);
  return result;
};

/**
 * Send OTP email
 */
const sendOtpEmail = async ({ to, otp }) => {
  console.log('[Email Service] 🔐 sendOtpEmail called for:', to);
  
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

  console.log('[Email Service] Calling sendEmail() for OTP...');
  const result = await sendEmail({
    to,
    subject: 'Your OTP Login Code - LIBBAAS',
    html,
    text
  });
  console.log('[Email Service] OTP email result:', result);
  return result;
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  console.log('[Email Service] 🔑 sendPasswordResetEmail called for:', to);
  
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

  console.log('[Email Service] Calling sendEmail() for password reset...');
  const result = await sendEmail({
    to,
    subject: 'Reset Your Password - LIBBAAS',
    html,
    text
  });
  console.log('[Email Service] Password reset email result:', result);
  return result;
};

/**
 * Send custom email
 */
const sendCustomEmail = async ({ to, subject, html, text }) => {
  console.log('[Email Service] ✉️ sendCustomEmail called for:', to);
  
  console.log('[Email Service] Calling sendEmail() for custom email...');
  const result = await sendEmail({
    to,
    bcc: process.env.ADMIN_EMAIL,
    subject,
    html,
    text
  });
  console.log('[Email Service] Custom email result:', result);
  return result;
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendCustomEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  initTransporter
};
