import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import apiClient from '../utils/api';

/**
 * Single math captcha.
 * Parent reads value via ref: { captchaId, captchaAnswer, refresh, isReady }
 * Auto-refreshes before expiry so "Captcha expired" is rarer.
 */
const CaptchaWidget = React.forwardRef(function CaptchaWidget({ className = '' }, ref) {
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const load = useCallback(async () => {
    clearRefreshTimer();
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await apiClient.get('/api/captcha', { timeout: 8000 });
      const data = res.data || null;
      setChallenge(data);

      const expiresInSec = Number(data?.expiresIn || 0);
      if (data?.id && expiresInSec > 15) {
        // Refresh ~20s before server expiry
        const refreshInMs = Math.max(15_000, (expiresInSec - 20) * 1000);
        refreshTimerRef.current = setTimeout(() => {
          load();
        }, refreshInMs);
      }
    } catch (err) {
      setChallenge(null);
      setError(err?.response?.data?.message || 'Could not load captcha');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    return () => clearRefreshTimer();
  }, [load]);

  React.useImperativeHandle(
    ref,
    () => ({
      getPayload: () => ({
        captchaId: challenge?.id || null,
        captchaAnswer: answer,
      }),
      refresh: load,
      isReady: () => {
        if (challenge?.disabled) return true;
        if (!challenge?.id) return false;
        return Boolean(String(answer).trim());
      },
    }),
    [challenge, answer, load]
  );

  if (challenge?.disabled) {
    return null;
  }

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

      <div className="flex items-center gap-3">
        <p className="text-sm text-[#0b2a3d]/70 shrink-0">
          Solve:{' '}
          <span className="font-serif text-xl text-[#0b2a3d]">
            {loading ? '…' : challenge?.question || '—'}
          </span>
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
      </div>
    </div>
  );
});

export default CaptchaWidget;
