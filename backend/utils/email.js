const nodemailer = require('nodemailer');

console.log('========================================');
console.log('📧 EMAIL SERVICE: MODULE LOADED');
console.log('========================================');

// Global transporter variable
let transporter = null;

/**
 * Creates a nodemailer transporter for Brevo SMTP
 * @returns {object|null} Transporter object or null if creation fails
 */
const createTransporter = () => {
  console.log('\n========================================');
console.log('📧 CREATE TRANSPORTER: STARTING');
console.log('========================================');

// Step 1: Read and log ALL environment variables (no passwords shown)
const envVars = {
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '...' : 'NOT SET',
  SMTP_PASS: process.env.SMTP_PASS ? '*** SET ***' : 'NOT SET',
  EMAIL_FROM: process.env.EMAIL_FROM,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL
};
console.log('📋 ENVIRONMENT VARIABLES:');
console.log(JSON.stringify(envVars, null, 2));

// Step 2: Check required variables
const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM'];
const missing = required.filter(key => !process.env[key]);
console.log('\n✅ Required variables present:', required.filter(key => process.env[key]));
console.log('❌ Missing variables:', missing);

if (missing.length > 0) {
  console.log('\n❌ CREATE TRANSPORTER FAILED: Missing required variables');
  console.log('Missing:', missing);
  return null;
}

// Step 3: Prepare transporter config
const port = parseInt(process.env.SMTP_PORT, 10);
const config = {
  host: process.env.SMTP_HOST,
  port: port,
  secure: port === 465, // true for 465, false for 587
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
};

console.log('\n⚙️ TRANSPORTER CONFIG:');
console.log(JSON.stringify({
  ...config,
  auth: { user: config.auth.user.substring(0,5) + '...', pass: '***' }
}, null, 2));

try {
  console.log('\n🔧 Creating nodemailer transporter...');
  const newTransporter = nodemailer.createTransport(config);
  console.log('✅ Nodemailer transporter created successfully!');
  console.log('========================================');
  return newTransporter;
} catch (error) {
  console.log('\n❌ CREATE TRANSPORTER FAILED CATASTROPHICALLY');
  console.log('Error name:', error.name);
  console.log('Error message:', error.message);
  console.log('Error code:', error.code);
  console.log('Error stack:', error.stack);
  console.log('Full error object:', JSON.stringify(error, null, 2));
  console.log('========================================');
  return null;
}
};

/**
 * Verifies transporter connection to Brevo SMTP
 * @param {object} t - Transporter object
 * @returns {Promise<boolean>} True if verification succeeds
 */
const verifyTransporter = async (t) => {
  console.log('\n========================================');
  console.log('🔍 VERIFY TRANSPORTER CONNECTION: STARTING');
  console.log('========================================');

  try {
    console.log('\n📞 Calling transporter.verify()...');
    await t.verify();
    console.log('✅ TRANSPORTER VERIFIED SUCCESSFULLY!');
    console.log('========================================');
    return true;
  } catch (error) {
    console.log('\n❌ TRANSPORTER VERIFICATION FAILED');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Error command:', error.command);
    console.log('Error response:', error.response);
    console.log('Error stack:', error.stack);
    console.log('Full error object:', JSON.stringify(error, null, 2));
    console.log('========================================');
    return false;
  }
};

/**
 * Initializes and verifies the transporter (cached after first call)
 * @returns {Promise<object|null>} Transporter object or null
 */
const initTransporter = async () => {
  console.log('\n========================================');
  console.log('🚀 INIT TRANSPORTER: STARTING');
  console.log('========================================');

  if (transporter) {
    console.log('✅ Using cached transporter');
    console.log('========================================');
    return transporter;
  }

  console.log('📦 No cached transporter, creating new one...');
  const t = createTransporter();
  if (!t) {
    console.log('❌ Failed to create transporter');
    console.log('========================================');
    return null;
  }

  console.log('🔍 Verifying new transporter...');
  const verified = await verifyTransporter(t);
  if (verified) {
    transporter = t;
    console.log('✅ Transporter initialized, verified, and cached!');
  } else {
    console.log('⚠️ Transporter created but verification failed - keeping for testing');
    transporter = t;
  }

  console.log('========================================');
  return transporter;
};

/**
 * Sends an email
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content (optional)
 * @param {string} [options.bcc] - Bcc recipient (optional)
 * @returns {Promise<object>} Send result
 */
const sendEmail = async (options) => {
  console.log('\n========================================');
  console.log('📤 SEND EMAIL: STARTING');
  console.log('========================================');

  try {
    console.log('\n📋 Email options:');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Bcc:', options.bcc || 'none');

    // Initialize transporter
    const t = await initTransporter();
    if (!t) {
      const result = { sent: false, reason: 'Transporter not initialized' };
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
      text: options.text || options.html.replace(/<[^>]*>/g, '') // Fallback to stripped HTML
    };
    if (options.bcc) {
      mailOptions.bcc = options.bcc;
    }
    console.log('\n📧 Mail options:');
    console.log(JSON.stringify({
      ...mailOptions,
      html: mailOptions.html.substring(0, 100) + '...' // Truncate long HTML for logs
    }, null, 2));

    // Send email
    console.log('\n📤 Calling transporter.sendMail()...');
    const info = await t.sendMail(mailOptions);

    // Log complete result
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('📄 Complete sendMail response:');
    console.log('Message ID:', info.messageId);
    console.log('Accepted:', JSON.stringify(info.accepted));
    console.log('Rejected:', JSON.stringify(info.rejected));
    console.log('Pending:', JSON.stringify(info.pending));
    console.log('Response:', info.response);
    console.log('Envelope:', JSON.stringify(info.envelope));
    console.log('Full info object:', JSON.stringify(info, null, 2));

    const result = {
      sent: true,
      previewUrl: nodemailer.getTestMessageUrl(info),
      info: info
    };
    console.log('\n✅ Final send result:', JSON.stringify(result, null, 2));
    console.log('========================================');
    return result;

  } catch (error) {
    console.log('\n❌ SEND EMAIL FAILED');
    console.log('Error name:', error.name);
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Error command:', error.command);
    console.log('Error response:', error.response);
    console.log('Error stack:', error.stack);
    console.log('Full error object:', JSON.stringify(error, null, 2));

    const result = {
      sent: false,
      reason: error.message,
      error: error
    };
    console.log('\n❌ Final send result:', JSON.stringify(result, null, 2));
    console.log('========================================');
    return result;
  }
};

const formatMoney = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

/**
 * Sends order confirmation email
 */
const sendOrderConfirmationEmail = async ({ to, order }) => {
  console.log('\n========================================');
  console.log('📦 SEND ORDER CONFIRMATION EMAIL');
  console.log('Order ID:', order.id);
  console.log('Recipient:', to);
  console.log('========================================');

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

  const result = await sendEmail({
    to,
    bcc: process.env.ADMIN_EMAIL,
    subject: `Order Confirmation - ${order.id}`,
    html
  });

  console.log('📦 Order confirmation email result:', JSON.stringify(result, null, 2));
  return result;
};

/**
 * Sends OTP email
 */
const sendOtpEmail = async ({ to, otp }) => {
  console.log('\n========================================');
  console.log('🔐 SEND OTP EMAIL');
  console.log('Recipient:', to);
  console.log('========================================');

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

  const result = await sendEmail({
    to,
    subject: 'Your OTP Login Code - LIBBAAS',
    html,
    text
  });

  console.log('🔐 OTP email result:', JSON.stringify(result, null, 2));
  return result;
};

/**
 * Sends password reset email
 */
const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  console.log('\n========================================');
  console.log('🔑 SEND PASSWORD RESET EMAIL');
  console.log('Recipient:', to);
  console.log('Reset URL:', resetUrl);
  console.log('========================================');

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

  const result = await sendEmail({
    to,
    subject: 'Reset Your Password - LIBBAAS',
    html,
    text
  });

  console.log('🔑 Password reset email result:', JSON.stringify(result, null, 2));
  return result;
};

/**
 * Sends custom email
 */
const sendCustomEmail = async ({ to, subject, html, text }) => {
  console.log('\n========================================');
  console.log('✉️ SEND CUSTOM EMAIL');
  console.log('Recipient:', to);
  console.log('Subject:', subject);
  console.log('========================================');

  const result = await sendEmail({
    to,
    bcc: process.env.ADMIN_EMAIL,
    subject,
    html,
    text
  });

  console.log('✉️ Custom email result:', JSON.stringify(result, null, 2));
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
