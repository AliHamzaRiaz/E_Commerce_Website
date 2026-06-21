const nodemailer = require('nodemailer');

const createSmtpTransport = () => {
  // Support both naming conventions (SMTP_* and EMAIL_*)
  const service = process.env.SMTP_SERVICE || process.env.EMAIL_SERVICE;
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = (process.env.SMTP_PORT || process.env.EMAIL_PORT) ? Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) : undefined;
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER) ? String(process.env.SMTP_USER || process.env.EMAIL_USER).trim() : undefined;
  // Gmail app passwords are often copied with spaces; nodemailer expects the 16 chars without spaces.
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS) ? String(process.env.SMTP_PASS || process.env.EMAIL_PASS).replace(/\s+/g, '') : undefined;

  console.log('[createSmtpTransport] Config:', { 
    service, 
    host, 
    port, 
    user: user ? user.substring(0, 3) + '...' : 'MISSING', 
    pass: pass ? '***' : 'MISSING' 
  });

  if (!user || !pass) {
    console.warn('[createSmtpTransport] Missing user or password');
    return null;
  }

  // Explicit Gmail configuration for reliability
  if (service?.toLowerCase() === 'gmail' || user?.includes('@gmail.com')) {
    console.log('[createSmtpTransport] Using Gmail explicit configuration (port 465 SSL)');
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465
      auth: { user, pass },
    });
  }

  if (service) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  if (!host || !port) {
    console.warn('[createSmtpTransport] Missing host or port');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const createEtherealTransport = async () => {
  // Disable Ethereal by default, only enable if explicitly set to true
  const enabled = String(process.env.ETHEREAL || '').toLowerCase() === 'true';

  console.log('[createEtherealTransport] Enabled:', enabled);

  if (!enabled) return null;

  try {
    // Add timeout for creating test account
    const createAccountPromise = nodemailer.createTestAccount();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout creating Ethereal account')), 5000);
    });
    const testAccount = await Promise.race([createAccountPromise, timeoutPromise]);
    console.log('[createEtherealTransport] Created test account:', testAccount.user);
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.error('[createEtherealTransport] FAILED:', err.message);
    return null;
  }
};

let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) {
    console.log('[getTransporter] Using cached transporter');
    return cachedTransporter;
  }

  console.log('[getTransporter] Attempting to create transporter...');
  const smtpTransport = createSmtpTransport();
  console.log('[getTransporter] createSmtpTransport returned:', !!smtpTransport);
  if (smtpTransport) {
    console.log('[getTransporter] SMTP transport created, skipping verification for reliability');
    cachedTransporter = smtpTransport;
    return cachedTransporter;
  }

  console.log('[getTransporter] SMTP failed/missing, trying Ethereal');
  const ethereal = await createEtherealTransport();
  if (ethereal) {
    console.log('[getTransporter] Using Ethereal transport');
    cachedTransporter = ethereal;
  } else {
    console.error('[getTransporter] NO TRANSPORTER AVAILABLE');
  }
  return cachedTransporter;
};

const formatMoney = (n) => `Rs ${Number(n || 0).toLocaleString()}`;

const buildOrderHtml = (order) => {
  const storeUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const itemsHtml = (order.items || [])
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 0; border-bottom:1px solid #eee;">
            <div style="font-weight:bold; color:#111;">${i.name}</div>
            <div style="color:#777; font-size:12px;">${i.selectedColor} / ${i.selectedSize}</div>
          </td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right; color:#111;">x${i.quantity}</td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; text-align:right; color:#111; font-weight:bold;">${formatMoney(i.price * i.quantity)}</td>
        </tr>`
    )
    .join('');

  const discountLine =
    order.discount > 0
      ? `<tr><td colspan="2" style="padding:10px 0; color:#777;">Card Discount (7%)</td><td style="padding:10px 0; text-align:right; color:#d4af37;">- ${formatMoney(order.discount)}</td></tr>`
      : '';

  return `
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
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr><td colspan="2" style="padding:20px 0 5px; color:#777;">Subtotal</td><td style="padding:20px 0 5px; text-align:right; color:#111;">${formatMoney(order.subtotal)}</td></tr>
        ${discountLine}
        <tr>
          <td colspan="2" style="padding:10px 0; border-top:1px solid #111; font-weight:bold; font-size:18px;">Total Amount</td>
          <td style="padding:10px 0; border-top:1px solid #111; text-align:right; font-weight:bold; font-size:18px; color:#111;">${formatMoney(order.total)}</td>
        </tr>
      </tfoot>
    </table>

    <div style="text-align:center; margin:40px 0;">
      <p style="margin-bottom:20px; color:#555;">We hope you love your new items!</p>
      <a href="${storeUrl}" style="background-color:#111; color:#fff; padding:15px 35px; text-decoration:none; font-weight:bold; border-radius:0; text-transform:uppercase; letter-spacing:1px; display:inline-block;">Thanks for Shopping - Visit Store</a>
    </div>

    <div style="text-align:center; border-top:1px solid #eee; padding-top:20px; color:#999; font-size:12px;">
      <p style="margin:5px 0;">If you have any questions, simply reply to this email.</p>
      <p style="margin:5px 0;">&copy; ${new Date().getFullYear()} LIBBAAS. All rights reserved.</p>
    </div>
  </div>`;
};

const sendOrderConfirmationEmail = async ({ to, order }) => {
  try {
    console.log('[sendOrderConfirmationEmail] Starting to send order confirmation...');
    const transporter = await getTransporter();
    if (!transporter) return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };

    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@luxelingerie.local';
    const bcc = process.env.ADMIN_EMAIL; // BCC the admin
    const sendPromise = transporter.sendMail({
      from,
      to,
      bcc, // BCC admin
      subject: `Order Confirmation - ${order.id}`,
      html: buildOrderHtml(order),
    });
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ sent: false, reason: 'TIMEOUT' }), 20000);
    });
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    if (info?.sent === false) {
      return info;
    }

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    return { sent: true, previewUrl };
  } catch (err) {
    console.error('[sendOrderConfirmationEmail] FAILED:', err.message);
    return { sent: false, reason: err.message };
  }
};

const sendCustomEmail = async ({ to, subject, html, text }) => {
  try {
    console.log('[sendCustomEmail] Starting to send email...');
    console.log('[sendCustomEmail] Getting transporter...');
    const transporter = await getTransporter();
    if (!transporter) {
      console.error('[sendCustomEmail] No transporter available');
      return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
    }
    console.log('[sendCustomEmail] Got transporter');

    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@luxelingerie.local';
    const bcc = process.env.ADMIN_EMAIL; // BCC the admin
    console.log('[sendCustomEmail] Sending from:', from, 'to:', to, 'bcc:', bcc);
    
    console.log('[sendCustomEmail] Calling transporter.sendMail...');
    const sendPromise = transporter.sendMail({
      from,
      to,
      bcc, // BCC admin
      subject,
      html,
      text,
    });
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ sent: false, reason: 'TIMEOUT' }), 60000); // 60 second timeout
    });
    
    console.log('[sendCustomEmail] Waiting for sendPromise or timeoutPromise...');
    const info = await Promise.race([sendPromise, timeoutPromise]);
    console.log('[sendCustomEmail] Promise resolved with:', info);
    if (info?.sent === false) {
      console.warn('[sendCustomEmail] Email send timed out or failed');
      return info;
    }

    console.log('[sendCustomEmail] Email sent successfully');
    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log('[sendCustomEmail] Preview URL:', previewUrl);
    return { sent: true, previewUrl };
  } catch (err) {
    console.error('[sendCustomEmail] FAILED:', err.message);
    console.error('[sendCustomEmail] Full error:', err);
    return { sent: false, reason: err.message };
  }
};

const sendOtpEmail = async ({ to, otp }) => {
  try {
    const html = `<div style="font-family:Arial, sans-serif; line-height:1.5; color:#111;">
      <h2 style="margin:0 0 8px;">Your Login Code</h2>
      <p style="margin:0 0 14px; color:#555;">Use this code to login. This code expires in 10 minutes.</p>
      <div style="font-size:28px; letter-spacing:6px; font-weight:700; padding:14px 16px; border:1px solid #eee; display:inline-block;">${otp}</div>
      <p style="margin:18px 0 0; color:#777; font-size:12px;">If you did not request this code, you can ignore this email.</p>
    </div>`;

    // Manually send with BCC since sendCustomEmail now has BCC, but let's confirm
    const transporter = await getTransporter();
    if (!transporter) return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@luxelingerie.local';
    const bcc = process.env.ADMIN_EMAIL;

    const sendPromise = transporter.sendMail({
      from,
      to,
      bcc,
      subject: 'Your OTP Login Code',
      html,
      text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
    });
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ sent: false, reason: 'TIMEOUT' }), 20000);
    });
    
    const info = await Promise.race([sendPromise, timeoutPromise]);
    if (info?.sent === false) {
      return info;
    }

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    return { sent: true, previewUrl };
  } catch (err) {
    console.error('[sendOtpEmail] FAILED:', err.message);
    return { sent: false, reason: err.message };
  }
};

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  console.log('[sendPasswordResetEmail] Attempting to send to:', to);
  const transporter = await getTransporter();
  if (!transporter) {
    console.error('[sendPasswordResetEmail] No transporter available');
    return { sent: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  const html = `<div style="font-family:Arial, sans-serif; line-height:1.5; color:#111;">
    <h2 style="margin:0 0 8px;">Password Reset Request</h2>
    <p style="margin:0 0 14px; color:#555;">You requested to reset your password. Click the button below to set a new password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" style="background-color:#000; color:#fff; padding:12px 24px; text-decoration:none; display:inline-block; font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-size:12px;">Reset Password</a>
    <p style="margin:18px 0 0; color:#777; font-size:12px;">If you did not request a password reset, you can ignore this email.</p>
    <p style="margin:8px 0 0; color:#777; font-size:10px;">Link: ${resetUrl}</p>
  </div>`;

  try {
    const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@luxelingerie.local';
    const bcc = process.env.ADMIN_EMAIL; // BCC the admin
    console.log('[sendPasswordResetEmail] Sending from:', from, 'bcc:', bcc);
    const info = await transporter.sendMail({
      from,
      to,
      bcc, // BCC admin
      subject: 'Reset Your Password',
      html,
      text: `You requested a password reset. Use this link: ${resetUrl}`,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log('[sendPasswordResetEmail] SUCCESS. Preview:', previewUrl);
    return { sent: true, previewUrl };
  } catch (err) {
    console.error('[sendPasswordResetEmail] FAILED:', err.message);
    throw err;
  }
};

module.exports = { sendOrderConfirmationEmail, sendCustomEmail, sendOtpEmail, sendPasswordResetEmail };
