/**
 * Off % comes from real prices (Compare At vs List).
 * Free-text `discount` is only a fallback when Compare At was never set.
 */
export const getDiscountPercent = (product) => {
  const price = Number(product?.price);
  const original = Number(product?.originalPrice);

  if (Number.isFinite(original) && Number.isFinite(price) && original > price && price >= 0) {
    const pct = Math.round(((original - price) / original) * 100);
    return pct >= 1 && pct <= 99 ? pct : 0;
  }

  // Compare At present but not higher than List → no real sale (ignore stale "33% Off" text)
  if (Number.isFinite(original) && original > 0 && Number.isFinite(price) && original <= price) {
    return 0;
  }

  const match = String(product?.discount || '').match(/(\d+)\s*%/);
  if (match) {
    const pct = Number(match[1]);
    return pct >= 1 && pct <= 99 ? pct : 0;
  }

  return 0;
};

export const formatDiscountLabel = (percent) => {
  const pct = Number(percent);
  if (!Number.isFinite(pct) || pct < 1) return '';
  return `${Math.round(pct)}% Off`;
};

export const getDisplayRating = (productId) => {
  const n = String(productId || '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = 4.5 + (n % 6) / 10;
  return Math.min(5, Number(rating.toFixed(1)));
};
