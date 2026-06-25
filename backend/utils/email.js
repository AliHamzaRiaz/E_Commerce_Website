const axios = require('axios');

console.log('========================================');
console.log('📧 EMAIL SERVICE (BREVO REST API): MODULE LOADED');
console.log('========================================');

/**
 * Sends an email using Brevo's official REST API (100% Render-compatible!)
 * @param {object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.html - HTML email content
 * @param {string} [options.text] - Plain text fallback (optional, auto-generated if not provided)
 * @param {string} [options.bcc] - BCC recipient email (optional)
 * @returns {Promise<object>} Send result with success status, messageId, and debug info
 */
const sendEmail = async (options) => {
  console.log('\n========================================');
  console.log('� SEND EMAIL VIA BREVO REST API: STARTED');
  console.log('========================================');

  const { to, subject, html, text, bcc } = options;
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS;
  const senderEmail = process.env.EMAIL_FROM;
  const senderName = 'LIBBAAS';

  // Step 1: Log everything (for debugging)
  console.log('\n📋 INPUT PARAMETERS:');
  console.log('  To:', to);
  console.log('  Subject:', subject);
  console.log('  BCC:', bcc || 'none');
  console.log('  API Key set:', !!apiKey);
  console.log('  Sender email set:', !!senderEmail);

  // Step 2: Validate required fields
  console.log('\n🔍 VALIDATING REQUIRED FIELDS:');
  const errors = [];
  if (!apiKey) errors.push('Missing BREVO_API_KEY or SMTP_PASS in Render environment variables');
  if (!senderEmail) errors.push('Missing EMAIL_FROM in Render environment variables');
  if (!to) errors.push('Missing recipient email (to parameter)');
  if (!subject) errors.push('Missing email subject');
  
  if (errors.length > 0) {
    console.log('❌ VALIDATION FAILED:');
    errors.forEach(e => console.log('  -', e));
    console.log('========================================');
    return { sent: false, reason: errors.join('; ') };
  }

  // Step 3: Prepare API payload
  console.log('\n📦 PREPARING API PAYLOAD:');
  const payload = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
    textContent: text || html.replace(/<[^>]*>/g, '')
  };
  if (bcc) payload.bcc = [{ email: bcc }];
  console.log('  Payload (truncated):', {
    sender: payload.sender,
    to: payload.to,
    bcc: payload.bcc,
    subject: payload.subject,
    htmlContent: payload.htmlContent.substring(0, 50) + '...'
  });

  // Step 4: Send request to Brevo API
  console.log('\n� SENDING REQUEST TO BREVO API...');
  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      timeout: 30000
    });

    // Step 5: Log success
    console.log('\n✅ EMAIL SENT SUCCESSFULLY!');
    console.log('  Brevo Status Code:', response.status);
    console.log('  Brevo Message ID:', response.data.messageId);
    console.log('  Full Response:', JSON.stringify(response.data, null, 2));
    
    const result = {
      sent: true,
      method: 'brevo-rest-api',
      messageId: response.data.messageId,
      brevoResponse: response.data
    };
    console.log('\n📤 FINAL RESULT:', JSON.stringify(result, null, 2));
    console.log('========================================');
    return result;

  } catch (error) {
    // Step 6: Log detailed error
    console.log('\n❌ FAILED TO SEND EMAIL!');
    console.log('  Error Name:', error.name);
    console.log('  Error Message:', error.message);
    console.log('  Error Code:', error.code);
    if (error.response) {
      console.log('  Brevo Status Code:', error.response.status);
      console.log('  Brevo Error Data:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('  Error Stack:', error.stack);

    const result = {
      sent: false,
      method: 'brevo-rest-api',
      reason: error.message,
      errorCode: error.code,
      brevoStatusCode: error.response?.status,
      brevoError: error.response?.data
    };
    console.log('\n📤 FINAL RESULT:', JSON.stringify(result, null, 2));
    console.log('========================================');
    return result;
  }
};

const formatMoney = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

const sendOrderConfirmationEmail = async ({ to, order }) => {
  console.log('\n� SEND ORDER CONFIRMATION EMAIL');
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

const initTransporter = async () => {
  console.log('\n========================================');
  console.log('📧 INITIALIZE EMAIL SERVICE (REST API ONLY)');
  console.log('========================================');
  console.log('✅ Email service initialized');
  return true;
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendCustomEmail,
  sendOtpEmail,
  sendPasswordResetEmail,
  initTransporter
};
