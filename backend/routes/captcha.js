const express = require('express');
const { createChallenge } = require('../utils/captchaStore');
const { createRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

const captchaIssueLimit = createRateLimit({
  windowMs: 60_000,
  max: Number(process.env.CAPTCHA_ISSUE_RATE_MAX || 40),
  message: 'Too many captcha requests. Please wait a moment.',
});

router.get('/', captchaIssueLimit, (req, res) => {
  try {
    if (String(process.env.CAPTCHA_DISABLED || '').toLowerCase() === 'true') {
      return res.json({ disabled: true, id: null, question: null, targetAngle: 0 });
    }
    const challenge = createChallenge();
    return res.json({
      disabled: false,
      id: challenge.id,
      question: challenge.question,
      targetAngle: challenge.targetAngle,
      expiresIn: challenge.expiresIn,
    });
  } catch (e) {
    console.error('[GET /api/captcha]', e);
    return res.status(500).json({ message: 'Failed to create captcha' });
  }
});

module.exports = router;
