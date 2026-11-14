const crypto = require('crypto');

const challenges = new Map();
// Default 15 minutes — reduces "Captcha expired" during longer checkout/forms
const TTL_MS = Math.max(60_000, Number(process.env.CAPTCHA_TTL_MS || 15 * 60_000));

const hashAnswer = (answer) =>
  crypto
    .createHash('sha256')
    .update(`${process.env.CAPTCHA_SECRET || process.env.JWT_SECRET || 'captcha'}:${String(answer).trim().toLowerCase()}`)
    .digest('hex');

const prune = () => {
  const now = Date.now();
  for (const [id, entry] of challenges.entries()) {
    if (entry.expiresAt <= now || entry.used) challenges.delete(id);
  }
};

const createChallenge = () => {
  prune();
  const a = crypto.randomInt(1, 12);
  const b = crypto.randomInt(1, 12);
  const op = crypto.randomInt(0, 2) === 0 ? '+' : '−';
  const answer = op === '+' ? a + b : a - b;
  const id = crypto.randomBytes(16).toString('hex');

  challenges.set(id, {
    answerHash: hashAnswer(String(answer)),
    expiresAt: Date.now() + TTL_MS,
    used: false,
  });

  return {
    id,
    question: `${a} ${op} ${b}`,
    expiresIn: Math.floor(TTL_MS / 1000),
  };
};

const verifyChallenge = ({ id, answer }) => {
  prune();
  if (String(process.env.CAPTCHA_DISABLED || '').toLowerCase() === 'true') {
    return { ok: true, skipped: true };
  }

  const entry = challenges.get(String(id || ''));
  if (!entry) return { ok: false, message: 'Captcha expired. Please refresh and try again.' };
  if (entry.used) return { ok: false, message: 'Captcha already used. Please refresh.' };
  if (entry.expiresAt <= Date.now()) {
    challenges.delete(String(id));
    return { ok: false, message: 'Captcha expired. Please refresh and try again.' };
  }

  if (entry.answerHash !== hashAnswer(String(answer ?? ''))) {
    return { ok: false, message: 'Incorrect captcha answer. Please try again.' };
  }

  entry.used = true;
  challenges.delete(String(id));
  return { ok: true };
};

module.exports = {
  createChallenge,
  verifyChallenge,
};
