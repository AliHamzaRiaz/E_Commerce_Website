const express = require('express');
const axios = require('axios');
const { sendOrderConfirmationEmail } = require('../utils/email');
const { insertOrder, listRecentOrdersByEmail } = require('../utils/orderRepository');
const { applyOrderStock } = require('../utils/productRepository');

const router = express.Router();

const computeTotals = ({ items, paymentMethod }) => {
  const subtotal = (items || []).reduce((sum, i) => sum + Number(i.price || 0) * Number(i.quantity || 0), 0);
  const discount = paymentMethod === 'card' ? Math.round(subtotal * 0.07) : 0;
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
};

const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());

router.post('/history', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim();
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required' });
    }
    const orders = await listRecentOrdersByEmail(email, 8);
    return res.json(orders);
  } catch (e) {
    console.error('[POST /api/orders/history]', e);
    return res.status(500).json({ message: 'Could not load order history' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer, items, paymentMethod, paymentDetails, signatureImage } = req.body || {};

    if (!customer?.fullName || !customer?.email || !customer?.address) {
      return res.status(400).json({ message: 'Missing customer details' });
    }
    if (!isValidEmail(customer.email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    const phone = String(customer?.phone || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return res.status(400).json({ message: 'Phone number is required (at least 10 digits)' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    if (paymentMethod !== 'cash' && paymentMethod !== 'card') {
      return res.status(400).json({ message: 'Invalid payment method' });
    }
    if (paymentMethod === 'card') {
      const cardNumber = paymentDetails?.cardNumber || '';
      const expiry = paymentDetails?.expiry || '';
      const cvv = paymentDetails?.cvv || '';
      if (!cardNumber || !expiry || !cvv) {
        return res.status(400).json({ message: 'Missing card details' });
      }
    }

    const { subtotal, discount, total } = computeTotals({ items, paymentMethod });
    const now = new Date().toISOString();
    const orderId = `ORD-${Date.now()}`;

    const orderForEmail = {
      id: orderId,
      createdAt: now,
      customer: {
        fullName: customer.fullName,
        email: customer.email,
        address: customer.address,
        phone,
        note: customer.note || '',
      },
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price || 0),
        quantity: Number(i.quantity || 0),
        selectedColor: i.selectedColor || '',
        selectedSize: i.selectedSize || '',
      })),
      paymentMethod,
      subtotal,
      discount,
      total,
      status: paymentMethod === 'cash' ? 'PLACED' : 'PAID',
    };

    let emailStatus = { sent: false };
    try {
      emailStatus = await sendOrderConfirmationEmail({ to: orderForEmail.customer.email, order: orderForEmail });
    } catch {
      emailStatus = { sent: false, reason: 'SEND_FAILED' };
    }

    const emailMeta = {
      sent: !!emailStatus.sent,
      previewUrl: emailStatus.previewUrl,
      lastSentAt: emailStatus.sent ? new Date().toISOString() : undefined,
    };

    await applyOrderStock(orderForEmail.items);

    await insertOrder({
      id: orderId,
      customer: orderForEmail.customer,
      items: orderForEmail.items,
      paymentMethod,
      paymentDetails: null,
      subtotal,
      discount,
      total,
      status: orderForEmail.status,
      signatureImage: String(signatureImage || ''),
      emailMeta,
    });

    // =========================================================
    // NEW CODE: Send order to n8n webhook (only if order saved)
    // =========================================================
    try {
      const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/new-order';
      const webhookPayload = {
        orderId: orderId,
        customerName: orderForEmail.customer.fullName,
        email: orderForEmail.customer.email,
        phone: orderForEmail.customer.phone,
        total: total,
        status: orderForEmail.status,
        createdAt: orderForEmail.createdAt
      };

      console.log('\n📤 Sending order to n8n webhook:', webhookUrl);
      console.log('📤 Webhook payload:', JSON.stringify(webhookPayload, null, 2));

      if (typeof fetch === 'function') {
        // Use native fetch API if available
        const fetchResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload)
        });
        if (!fetchResponse.ok) {
          console.error('❌ n8n webhook failed with status:', fetchResponse.status);
        } else {
          console.log('✅ n8n webhook sent successfully via fetch');
        }
      } else {
        // Fallback to axios
        const axiosResponse = await axios.post(webhookUrl, webhookPayload, {
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ n8n webhook sent successfully via axios:', axiosResponse.status);
      }
    } catch (webhookError) {
      // Log error but DO NOT fail the order creation
      console.error('\n❌ Failed to send order to n8n webhook (order still created):', webhookError.message);
      console.error('❌ n8n webhook error details:', webhookError.stack);
    }
    // =========================================================
    // END NEW CODE
    // =========================================================

    return res.status(201).json({
      orderId,
      emailSent: !!emailStatus.sent,
      emailReason: emailStatus.sent ? undefined : emailStatus.reason,
      emailPreviewUrl: emailStatus.previewUrl,
    });
  } catch (e) {
    console.error('[POST /api/orders]', e);
    const msg = e?.message || '';
    if (msg.startsWith('INSUFFICIENT_STOCK:')) {
      return res.status(409).json({ message: 'One or more products are out of stock.' });
    }
    if (msg.startsWith('PRODUCT_NOT_FOUND:')) {
      return res.status(404).json({ message: 'A product in this order no longer exists.' });
    }
    if (msg.includes('DATABASE_URL') || msg.includes('relation "orders"') || msg.includes('connect')) {
      return res.status(503).json({ message: 'Orders database is not available. Check DATABASE_URL and restart the server.' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
