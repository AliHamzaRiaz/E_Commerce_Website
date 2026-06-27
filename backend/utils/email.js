const nodemailer = require('nodemailer');

console.log('========================================');
console.log('📧 EMAIL SERVICE (BREVO SMTP ONLY): MODULE LOADED');
console.log('========================================');

// SINGLE TRANSPORTER INSTANCE (cached)
let transporter = null;

/**
 * Creates and verifies a Nodemailer transporter for Brevo SMTP
 * @returns {Promise<object|null>} Verified transporter or null on failure
 */
const createTransporter = async () => {
  console.log('\n========================================');
  console.log('📧 CREATE & VERIFY TRANSPORTER: STARTED');
  console.log('========================================');

  // Log environment variables
  const envVars = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 10) + '...' : 'NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM
  };
  console.log('\n📋 ENVIRONMENT VARIABLES:');
  console.log(JSON.stringify(envVars, null, 2));

  // Validate required variables
  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
  const missing = required.filter(key => !process.env[key]);
  console.log('\n✅ Required variables present:', required.filter(key => process.env[key]));
  console.log('❌ Missing variables:', missing);

  if (missing.length > 0) {
    console.log('\n❌ TRANSPORTER CREATION FAILED: Missing required env vars');
    console.log('========================================');
    return null;
  }

  // Create transporter with EXACT Brevo config
  const port = parseInt(process.env.SMTP_PORT, 10);
  const config = {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    logger: true,
    debug: true
  };
  console.log('\n⚙️ TRANSPORTER CONFIGURATION:');
  console.log(JSON.stringify({
    ...config,
    auth: { user: config.auth.user.substring(0,10) + '...', pass: '***' }
  }, null, 2));

  try {
    console.log('\n🔧 Creating transporter...');
    const newTransporter = nodemailer.createTransport(config);

    console.log('\n🔍 Verifying connection to Brevo SMTP...');
    await newTransporter.verify();
    console.log('✅ TRANSPORTER CREATED & VERIFIED SUCCESSFULLY!');
    console.log('========================================');

    return newTransporter;

  } catch (error) {
    console.log('\n❌ TRANSPORTER CREATION/VERIFICATION FAILED!');
    console.log('  Error Name:', error.name);
    console.log('  Error Message:', error.message);
    console.log('  Error Code:', error.code);
    console.log('  Error Command:', error.command);
    console.log('  Error Stack:', error.stack);
    console.log('========================================');
    return null;
  }
};

/**
 * Initializes or returns the cached single transporter instance
 * @returns {Promise<object|null>} Verified transporter
 */
const initTransporter = async () => {
  if (transporter) {
    console.log('✅ Using cached transporter');
    return transporter;
  }
  transporter = await createTransporter();
  return transporter;
};

/**
 * Sends an email using Nodemailer & Brevo SMTP ONLY
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text fallback
 * @param {string} [options.bcc] - BCC recipient
 * @returns {Promise<object>} Send result
 */
const sendEmail = async (options) => {
  console.log('\n========================================');
  console.log('📧 SEND EMAIL VIA BREVO SMTP: STARTED');
  console.log('========================================');

  // Log env vars before sending
  console.log('\n📋 SMTP CONFIGURATION BEFORE SEND:');
  console.log('  SMTP_HOST:', process.env.SMTP_HOST);
  console.log('  SMTP_PORT:', process.env.SMTP_PORT);
  console.log('  SMTP_USER:', process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 10) + '...' : 'NOT SET');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM);

  // Get transporter
  const t = await initTransporter();
  if (!t) {
    const result = { sent: false, reason: 'Transporter not initialized/verified' };
    console.log('\n❌', result.reason);
    console.log('========================================');
    return result;
  }

  // Prepare mail options
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, '')
  };
  if (options.bcc) {
    mailOptions.bcc = options.bcc;
  }
  console.log('\n📧 MAIL OPTIONS (truncated):');
  console.log(JSON.stringify({
    ...mailOptions,
    html: mailOptions.html.substring(0, 50) + '...'
  }, null, 2));

  // Send email
  console.log('\n🚀 Calling transporter.sendMail()...');
  try {
    const info = await t.sendMail(mailOptions);

    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('  Message ID:', info.messageId);
    console.log('  Accepted:', JSON.stringify(info.accepted));
    console.log('  Rejected:', JSON.stringify(info.rejected));
    console.log('  Response:', info.response);

    const result = {
      sent: true,
      method: 'nodemailer-brevo-smtp',
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
    console.log('\n📤 FINAL RESULT:', JSON.stringify(result, null, 2));
    console.log('========================================');
    return result;

  } catch (error) {
    console.log('\n❌ FAILED TO SEND EMAIL!');
    console.log('  Error Name:', error.name);
    console.log('  Error Message:', error.message);
    console.log('  Error Code:', error.code);
    console.log('  Error Command:', error.command);
    console.log('  Error Stack:', error.stack);

    const result = {
      sent: false,
      method: 'nodemailer-brevo-smtp',
      reason: error.message,
      error: error
    };
    console.log('\n📤 FINAL RESULT:', JSON.stringify(result, null, 2));
    console.log('========================================');
    return result;
  }
};

const formatMoney = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

const sendOrderConfirmationEmail = async ({ to, order }) => {
  console.log('\n📦 SEND ORDER CONFIRMATION EMAIL');
  return sendEmail({
    to,
    bcc: process.env.ADMIN_EMAIL,
    subject: `Order Confirmation - ${order.id}`,
    html: `
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
      </div>`
  });
};

const sendOtpEmail = async ({ to, otp }) => {
  console.log('\n🔐 SEND OTP EMAIL');
  return sendEmail({
    to,
    subject: 'Your OTP Login Code - LIBBAAS',
    html: `
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
      </div>`,
    text: `Your OTP code is: ${otp}. It expires in 10 minutes.`
  });
};

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  console.log('\n🔑 SEND PASSWORD RESET EMAIL');
  return sendEmail({
    to,
    subject: 'Reset Your Password - LIBBAAS',
    html: `
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
      </div>`,
    text: `You requested a password reset. Use this link: ${resetUrl}`
  });
};

const sendCustomEmail = async ({ to, subject, html, text }) => {
  console.log('\n✉️ SEND CUSTOM EMAIL');
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
  sendPasswordResetEmail,
  initTransporter
};
