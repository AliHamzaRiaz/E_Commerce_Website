export const getDiscountPercent = (product) => {
  const fromField = String(product?.discount || '').replace(/[^\d]/g, '');
  if (fromField) return Number(fromField);
  const price = Number(product?.price || 0);
  const original = Number(product?.originalPrice || 0);
  if (original > price && price > 0) {
    return Math.round(((original - price) / original) * 100);
  }
  return 0;
};

export const getDisplayRating = (productId) => {
  const n = String(productId || '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rating = 4.5 + (n % 6) / 10;
  return Math.min(5, Number(rating.toFixed(1)));
};
