import React, { useEffect, useState } from 'react';

const getEndTime = () => {
  const end = new Date();
  end.setDate(end.getDate() + 2);
  end.setHours(23, 59, 59, 0);
  return end.getTime();
};

const SALE_END = getEndTime();

const SaleCountdown = ({ className = '', compact = false }) => {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, SALE_END - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setLeft({ d, h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  if (compact) {
    return (
      <div className={`bg-black text-white text-center py-3 px-4 text-xs font-semibold tracking-wide ${className}`}>
        Sale Ends In: {pad(left.d)}d {pad(left.h)}h {pad(left.m)}m {pad(left.s)}s
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 text-white ${className}`}>
      {[
        { v: left.d, l: 'DAYS' },
        { v: left.h, l: 'HRS' },
        { v: left.m, l: 'MIN' },
        { v: left.s, l: 'SEC' },
      ].map((part, i) => (
        <React.Fragment key={part.l}>
          {i > 0 ? <span className="text-white/50 text-xs px-0.5">:</span> : null}
          <div className="text-center min-w-[36px]">
            <div className="bg-white/10 rounded px-1.5 py-0.5 text-sm font-bold tabular-nums leading-none">
              {pad(part.v)}
            </div>
            <div className="text-[8px] tracking-widest text-white/60 mt-0.5">{part.l}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default SaleCountdown;
