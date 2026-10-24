import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import apiClient from '../utils/api';

/**
 * Circular radius dial + math challenge.
 * Parent reads value via ref: { captchaId, captchaAnswer, captchaRadius, refresh, isReady }
 */
const CaptchaWidget = React.forwardRef(function CaptchaWidget({ className = '' }, ref) {
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [angle, setAngle] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dragging = useRef(false);
  const dialRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setAnswer('');
    setAngle(0);
    try {
      const res = await apiClient.get('/api/captcha', { timeout: 8000 });
      setChallenge(res.data || null);
    } catch (err) {
      setChallenge(null);
      setError(err?.response?.data?.message || 'Could not load captcha');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  React.useImperativeHandle(
    ref,
    () => ({
      getPayload: () => ({
        captchaId: challenge?.id || null,
        captchaAnswer: answer,
        captchaRadius: angle,
      }),
      refresh: load,
      isReady: () => {
        if (challenge?.disabled) return true;
        if (!challenge?.id) return false;
        if (!String(answer).trim()) return false;
        return true;
      },
    }),
    [challenge, answer, angle, load]
  );

  const setAngleFromPointer = (clientX, clientY) => {
    const el = dialRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - cy, clientX - cx);
    let deg = (rad * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    setAngle(Math.round(deg));
  };

  const onPointerDown = (e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setAngleFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e) => {
    if (!dragging.current) return;
    setAngleFromPointer(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  if (challenge?.disabled) {
    return null;
  }

  const target = Number(challenge?.targetAngle || 0);
  const angleDiff = (() => {
    const a = ((angle % 360) + 360) % 360;
    const b = ((target % 360) + 360) % 360;
    return Math.min(Math.abs(a - b), 360 - Math.abs(a - b));
  })();
  const aligned = angleDiff <= 18;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#0b2a3d]/50">
          Security check
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gold hover:opacity-80 disabled:opacity-50"
          aria-label="Refresh captcha"
        >
          <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      ) : null}

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div
          ref={dialRef}
          className="relative h-28 w-28 shrink-0 select-none touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="slider"
          aria-label="Rotate dial to target angle"
          aria-valuemin={0}
          aria-valuemax={359}
          aria-valuenow={angle}
          tabIndex={0}
        >
          <div className="absolute inset-0 rounded-full border-2 border-[#0b2a3d]/10 bg-gradient-to-br from-[#f7f5f2] to-white shadow-inner" />
          {/* Target marker */}
          <div
            className="absolute left-1/2 top-1/2 h-[46%] w-0.5 origin-bottom bg-gold/80"
            style={{ transform: `translate(-50%, -100%) rotate(${target}deg)` }}
          />
          {/* User dial */}
          <div
            className={`absolute left-1/2 top-1/2 h-[42%] w-1 origin-bottom rounded-full transition-colors ${
              aligned ? 'bg-emerald-500' : 'bg-[#0b2a3d]'
            }`}
            style={{ transform: `translate(-50%, -100%) rotate(${angle}deg)` }}
          />
          <div className="absolute inset-[34%] rounded-full bg-white border border-[#0b2a3d]/10 flex items-center justify-center">
            <span className="text-[10px] font-bold text-[#0b2a3d]/60 tabular-nums">{angle}°</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          <p className="text-xs text-[#0b2a3d]/60">
            1) Rotate the dial to the gold mark ({target || '—'}°)
            <br />
            2) Solve: <span className="font-serif text-lg text-[#0b2a3d]">{loading ? '…' : challenge?.question || '—'}</span>
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full bg-white border border-black/10 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors rounded-xl"
            autoComplete="off"
            required={!challenge?.disabled}
          />
          <p className={`text-[10px] font-bold uppercase tracking-widest ${aligned ? 'text-emerald-600' : 'text-[#0b2a3d]/35'}`}>
            {aligned ? 'Dial aligned' : 'Align dial to gold radius'}
          </p>
        </div>
      </div>
    </div>
  );
});

export default CaptchaWidget;
