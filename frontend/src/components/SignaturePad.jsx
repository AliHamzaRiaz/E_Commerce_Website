import React, { useCallback, useEffect, useRef } from 'react';

const initCtx = (canvas) => {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.floor(rect.width) || 300;
  const h = 180;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#0a1128';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  return { w, h };
};


/**
 * Signature canvas. Parent should require isMeaningful before submit.
 * onSignatureChange({ dataUrl, isMeaningful }) — dataUrl set on pointer-up after drawing.
 */
const SignaturePad = ({ onSignatureChange, disabled }) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const inkRef = useRef(0);
  const sizeRef = useRef({ w: 300, h: 180 });
  const resizeTimerRef = useRef(null);

  const notify = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const meaningful = inkRef.current > 18;
    onSignatureChange?.({
      dataUrl: meaningful ? canvas.toDataURL('image/png') : null,
      isMeaningful: meaningful,
    });
  }, [onSignatureChange]);

  const layout = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    sizeRef.current = initCtx(canvas);
    inkRef.current = 0;
    last.current = null;
    onSignatureChange?.({ dataUrl: null, isMeaningful: false });
  }, [onSignatureChange]);

  useEffect(() => {
    const t = requestAnimationFrame(() => layout());
    const onResize = () => {
      clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = setTimeout(layout, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener('resize', onResize);
      clearTimeout(resizeTimerRef.current);
    };
  }, [layout]);

  const paint = (x, y) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const lx = last.current?.x;
    const ly = last.current?.y;
    if (lx == null) {
      last.current = { x, y };
      return;
    }
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(x, y);
    ctx.stroke();
    inkRef.current += Math.hypot(x - lx, y - ly);
    last.current = { x, y };
  };

  const pos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const r = canvas.getBoundingClientRect();
    const { w, h } = sizeRef.current;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - r.left) / r.width) * w;
    const y = ((clientY - r.top) / r.height) * h;
    return { x, y };
  };

  const start = (e) => {
    if (disabled) return;
    e.preventDefault();
    drawing.current = true;
    last.current = null;
    const p = pos(e);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0a1128';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
      inkRef.current += 4;
    }
    paint(p.x, p.y);
  };

  const move = (e) => {
    if (!drawing.current || disabled) return;
    e.preventDefault();
    const p = pos(e);
    paint(p.x, p.y);
  };

  const end = (e) => {
    if (e?.preventDefault) e.preventDefault();
    drawing.current = false;
    last.current = null;
    notify();
  };

  const clear = () => {
    layout();
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded border border-black/20 bg-white overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          className="block w-full h-[180px] cursor-crosshair"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={() => drawing.current && end()}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          aria-label="Sign here"
        />
      </div>
      <button
        type="button"
        onClick={clear}
        disabled={disabled}
        className="text-xs uppercase tracking-widest border border-black/20 px-4 py-2 hover:border-black/40 disabled:opacity-50"
      >
        Clear signature
      </button>
    </div>
  );
};

export default SignaturePad;
