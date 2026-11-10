const { verifyChallenge } = require('../utils/captchaStore');

const verifyCaptcha = (req, res, next) => {
  if (String(process.env.CAPTCHA_DISABLED || '').toLowerCase() === 'true') {
    return next();
  }

  const captchaId = req.body?.captchaId || req.headers['x-captcha-id'];
  const captchaAnswer = req.body?.captchaAnswer ?? req.headers['x-captcha-answer'];

  const result = verifyChallenge({
    id: captchaId,
    answer: captchaAnswer,
  });

  if (!result.ok) {
    return res.status(400).json({ message: result.message || 'Captcha verification failed' });
  }
  return next();
};

module.exports = verifyCaptcha;
