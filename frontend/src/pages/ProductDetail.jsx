import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  ChevronLeft,
  Star,
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Factory,
  Droplets,
  Gem,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import apiClient from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import SaleCountdown from '../components/SaleCountdown';
import { getDiscountPercent } from '../utils/pricing';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isLoggedIn, user, isFavorite, toggleFavorite } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [giftWrap, setGiftWrap] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5;
    return (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/reviews/${id}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingReview) return;
    setIsSubmittingReview(true);
    try {
      const res = await apiClient.post('/api/reviews', {
        productId: String(id),
        userName: 'Verified customer',
        rating: newRating,
        comment: newComment.trim(),
      });
      setReviews([res.data, ...reviews]);
      setNewComment('');
      setNewRating(5);
      setShowReviewForm(false);
      mutate('/api/reviews');
      toast.success('Thank you for your feedback!');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/api/products/${id}`);
        const data = res.data;
        setProduct(data);
        const firstColor =
          Array.isArray(data.colors) && data.colors.length > 0 ? data.colors[0] : 'Default';
        const firstSize =
          Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes[0] : 'One Size';
        setSelectedColor(firstColor);
        setSelectedSize(firstSize);

        const colorKey = data.colorImages
          ? Object.keys(data.colorImages).find(
              (k) => k.trim().toLowerCase() === String(firstColor).trim().toLowerCase()
            )
          : null;
        if (colorKey && data.colorImages[colorKey]) {
          const imgs = data.colorImages[colorKey];
          setCurrentImage(Array.isArray(imgs) ? imgs[0] || data.image : imgs);
        } else {
          setCurrentImage(data.image);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetchReviews();
  }, [id, fetchReviews]);

  useEffect(() => {
    if (!product || !selectedColor) return;
    const colorImagesObj = product.colorImages || {};
    const colorKey = Object.keys(colorImagesObj).find(
      (k) => k.trim().toLowerCase() === String(selectedColor).trim().toLowerCase()
    );
    if (colorKey && colorImagesObj[colorKey]) {
      const images = colorImagesObj[colorKey];
      const targetImg = Array.isArray(images) ? images[0] : images;
      if (targetImg) {
        setCurrentImage(targetImg);
        return;
      }
    }
    setCurrentImage(product.image);
  }, [selectedColor, product]);

  const inCart = useMemo(() => {
    if (!product) return false;
    return (cartItems || []).some(
      (i) =>
        String(i.id) === String(product.id) &&
        String(i.selectedColor || '').toLowerCase() === String(selectedColor || '').toLowerCase() &&
        String(i.selectedSize) === String(selectedSize)
    );
  }, [cartItems, product, selectedColor, selectedSize]);

  const handleAddToCart = () => {
    addToCart(product, selectedColor, selectedSize, quantity, currentImage || product.image);
    toast.success(giftWrap ? 'Added with gift wrapping' : 'Added to cart');
  };

  const handleBuyNow = () => {
    if (!inCart) {
      addToCart(product, selectedColor, selectedSize, quantity, currentImage || product.image);
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-black border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-white">
        <h2 className="text-2xl font-bold text-black">Product Not Found</h2>
        <Link to="/shop" className="text-sm font-bold underline underline-offset-4">
          Return to Shop
        </Link>
      </div>
    );
  }

  const discountPercent = getDiscountPercent(product);
  const colorThumbs = (product.colors || []).map((color) => {
    const colorKey = product.colorImages
      ? Object.keys(product.colorImages).find(
          (k) => k.trim().toLowerCase() === String(color).trim().toLowerCase()
        )
      : null;
    let img = product.image;
    if (colorKey && product.colorImages[colorKey]) {
      const imgs = product.colorImages[colorKey];
      img = Array.isArray(imgs) ? imgs[0] : imgs;
    }
    return { color, img };
  });

  return (
    <div className="bg-white pb-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-black mb-6"
        >
          <ChevronLeft size={14} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100">
              <img
                src={currentImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right details */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
                  {product.name}
                </h1>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied');
                    }}
                    className="p-2 border border-neutral-200 rounded-full hover:bg-neutral-50"
                    aria-label="Share"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(product.id)}
                    className={`p-2 border rounded-full ${
                      isFavorite(product.id)
                        ? 'border-red-200 text-red-500 bg-red-50'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                    aria-label="Favorite"
                  >
                    <Heart size={16} fill={isFavorite(product.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReviewerName(String(user?.name || '').trim());
                  setShowReviewForm(true);
                }}
                className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black"
              >
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i <= Math.floor(Number(averageRating))
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-neutral-200 text-neutral-200'
                      }
                    />
                  ))}
                </span>
                <span className="text-neutral-500">({reviews.length || 0})</span>
              </button>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {Number(product.originalPrice) > Number(product.price) ? (
                  <span className="text-neutral-400 line-through text-base">
                    Rs.{Number(product.originalPrice).toLocaleString()}
                  </span>
                ) : null}
                <span className="text-2xl font-bold text-black">
                  Rs.{Number(product.price || 0).toLocaleString()}
                </span>
                {discountPercent > 0 ? (
                  <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
                    {discountPercent}% OFF
                  </span>
                ) : null}
              </div>
            </div>

            {(product.colors || []).length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-700">
                  Color — {selectedColor}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(colorThumbs.length ? colorThumbs : [{ color: selectedColor, img: product.image }]).map(
                    (item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => setSelectedColor(item.color)}
                        className={`w-14 h-14 rounded-md overflow-hidden border-2 ${
                          String(selectedColor).toLowerCase() === String(item.color).toLowerCase()
                            ? 'border-black'
                            : 'border-neutral-200'
                        }`}
                        title={item.color}
                      >
                        <img src={item.img} alt={item.color} className="w-full h-full object-cover" />
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : null}

            {(product.sizes || []).length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-700">Size</p>
                  <Link to="/size-guide" className="text-xs underline underline-offset-2 text-neutral-500">
                    Size Chart
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes || []).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[64px] h-11 px-3 border text-sm font-medium ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'border-neutral-300 text-neutral-700 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <SaleCountdown compact />

            <div className="flex items-center gap-6">
              <div className="inline-flex items-center border border-neutral-300">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 text-lg hover:bg-neutral-50"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 text-lg hover:bg-neutral-50"
                >
                  +
                </button>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  className="w-4 h-4 accent-black"
                />
                Add gift wrapping PKR 500
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="bg-black text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors"
              >
                {inCart ? 'Added' : 'Add to Cart'}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="border border-black text-black py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-50 transition-colors"
              >
                Buy It Now
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100">
              {[
                { icon: Gem, label: 'Premium Quality' },
                { icon: Factory, label: 'Trusted Brand' },
                { icon: Droplets, label: 'Care Ready' },
                { icon: ShieldCheck, label: 'Secure Checkout' },
                { icon: Truck, label: 'Free Shipping' },
                { icon: RotateCcw, label: 'Easy Returns' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center text-center gap-2 py-3 border border-neutral-100 rounded-lg"
                >
                  <item.icon size={18} className="text-neutral-700" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 leading-tight px-2">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {product.description ? (
              <p className="text-sm text-neutral-600 leading-relaxed pt-2">{product.description}</p>
            ) : null}
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-20 border-t border-neutral-100 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wide">Customer Reviews</h2>
              <p className="text-sm text-neutral-500 mt-1">
                {averageRating} average · {reviews.length} reviews
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setReviewerName(String(user?.name || '').trim());
                setShowReviewForm(true);
              }}
              className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider"
            >
              Write a Review
            </button>
          </div>

          {loadingReviews ? (
            <div className="py-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-neutral-100 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-700">Verified customer</span>
                      <CheckCircle2 size={12} className="text-emerald-500" aria-hidden="true" />
                    </div>
                    <div className="flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-neutral-200 text-neutral-200'
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 italic">No reviews yet. Be the first!</p>
          )}
        </div>
      </div>

      {showReviewForm ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowReviewForm(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="text-lg font-bold uppercase tracking-wide">Submit a Review</h3>
              <button type="button" onClick={() => setShowReviewForm(false)}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={submitReview} className="p-6 space-y-5">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button" onClick={() => setNewRating(i)}>
                    <Star
                      size={28}
                      className={
                        i <= newRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-neutral-200 text-neutral-200'
                      }
                    />
                  </button>
                ))}
              </div>
              <textarea
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your review..."
                className="w-full h-28 border border-neutral-200 rounded-xl p-4 text-sm outline-none focus:border-black resize-none"
              />
              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-black text-white py-4 text-xs font-bold uppercase tracking-wider disabled:opacity-60"
              >
                {isSubmittingReview ? 'Posting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductDetail;
