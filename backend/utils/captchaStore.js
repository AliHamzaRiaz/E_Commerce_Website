const crypto = require('crypto');

const challenges = new Map();
const TTL_MS = Math.max(60_000, Number(process.env.CAPTCHA_TTL_MS || 5 * 60_000));

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
  const targetAngle = crypto.randomInt(20, 340);

  challenges.set(id, {
    answerHash: hashAnswer(String(answer)),
    expiresAt: Date.now() + TTL_MS,
    used: false,
    targetAngle,
  });

  return {
    id,
    question: `${a} ${op} ${b}`,
    targetAngle,
    expiresIn: Math.floor(TTL_MS / 1000),
  };
};

const verifyChallenge = ({ id, answer, radiusAngle }) => {
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

  const answerOk = entry.answerHash === hashAnswer(String(answer ?? ''));
  const angle = Number(radiusAngle);
  const norm = (d) => ((Number(d) % 360) + 360) % 360;
  const angleDiff = (() => {
    const a = norm(angle);
    const b = norm(entry.targetAngle);
    return Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
  })();
  const angleOk =
    Number.isFinite(angle) &&
    angleDiff <= Number(process.env.CAPTCHA_ANGLE_TOLERANCE || 18);

  if (!answerOk || !angleOk) {
    return { ok: false, message: 'Captcha failed. Align the dial and enter the correct answer.' };
  }

  entry.used = true;
  challenges.delete(String(id));
  return { ok: true };
};

module.exports = {
  createChallenge,
  verifyChallenge,
};
