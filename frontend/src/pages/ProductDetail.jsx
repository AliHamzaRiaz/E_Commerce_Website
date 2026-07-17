import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronLeft, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Star,
  ChevronRight,
  Zap,
  Info,
  Sparkles,
  X,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import apiClient from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const { isLoggedIn, isFavorite, toggleFavorite } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [hoveredColor, setHoveredColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Review System State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const filteredReviews = useMemo(() => reviews, [reviews]);
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const fetchReviews = useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/reviews/${id}`);
      setReviews(res.data);
    } catch (error) {
      console.error('Error fetching reviews for product details page:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const res = await apiClient.post('/api/reviews', {
        productId: id,
        userName: isLoggedIn ? 'Verified Customer' : 'Guest User',
        rating: newRating,
        comment: newComment
      });
      
      setReviews([res.data, ...reviews]);
      setNewComment('');
      setShowReviewForm(false);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const points = 9;
  const estShipping = new Date();
  estShipping.setDate(estShipping.getDate() + 5);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/api/products/${id}`);
        const data = res.data;
        setProduct(data);
        const firstColor = Array.isArray(data.colors) && data.colors.length > 0 ? data.colors[0] : 'Default';
        const firstSize = Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes[0] : 'One Size';
        setSelectedColor(firstColor);
        setSelectedSize(firstSize);
        
        // Handle color images (could be single string or array)
        const colorKey = data.colorImages ? Object.keys(data.colorImages).find(
          k => k.trim().toLowerCase() === String(firstColor || '').trim().toLowerCase()
        ) : null;

        if (colorKey && data.colorImages[colorKey]) {
          const imgs = data.colorImages[colorKey];
          const initialImg = Array.isArray(imgs) ? (imgs.length > 0 ? imgs[0] : data.image) : imgs;
          setCurrentImage(initialImg);
        } else {
          setCurrentImage(data.image);
        }
      } catch (error) {
        console.error('Error fetching product details from API:', error);
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
    
    const normalizedSelected = String(selectedColor).trim().toLowerCase();
    
    // Log the actual product object to see what the frontend is receiving
    console.log('--- CRITICAL BACKEND SYNC CHECK ---');
    console.log('Update Timestamp:', product.backend_update_timestamp);
    console.log('Full Product Keys:', Object.keys(product));
    console.log('Product colorImages:', product.colorImages);
    
    const colorImagesObj = product.colorImages || {};
    const colorKey = Object.keys(colorImagesObj).find(
      k => k.trim().toLowerCase() === normalizedSelected
    );

    if (colorKey && colorImagesObj[colorKey]) {
      const images = colorImagesObj[colorKey];
      const targetImg = Array.isArray(images) ? (images.length > 0 ? images[0] : null) : images;
      
      if (targetImg) {
        console.log('SUCCESS: Switching to color image:', colorKey);
        setCurrentImage(targetImg);
        return;
      }
    }
    
    console.log('FALLBACK: No image found for:', normalizedSelected);
    setCurrentImage(product.image);
  }, [selectedColor, product]);

  const handleColorSelect = (color) => {
    if (!color) return;
    const newColor = String(color).trim();
    console.log('User manually clicked color:', newColor);
    setSelectedColor(newColor);
  };

  const inCart = useMemo(() => {
    if (!product) return false;
    return (cartItems || []).some(i => 
      String(i.id) === String(product.id) && 
      String(i.selectedColor || '').toLowerCase() === String(selectedColor || '').toLowerCase() && 
      String(i.selectedSize) === String(selectedSize)
    );
  }, [cartItems, product, selectedColor, selectedSize]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h2 className="text-2xl font-serif text-[#0b2a3d]">Masterpiece Not Found</h2>
      <Link to="/shop" className="text-gold border-b border-gold pb-1 text-sm tracking-widest uppercase font-bold">Return to Collection</Link>
    </div>
  );

  const discountPercent = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 50;

  return (
    <div className="pb-32 bg-white">
      {/* Navigation Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-gray-400 hover:text-[#0b2a3d] transition-colors text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">
          <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
              {/* Always show main product image first */}
              <button 
                onClick={() => setCurrentImage(product.image)}
                className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${currentImage === product.image ? 'border-gold shadow-md' : 'border-neutral-100 hover:border-gray-300'}`}
              >
                <img src={product.image} alt="Main" className="w-full h-full object-cover" />
              </button>
              
              {/* Show images for the currently selected color */}
              {(() => {
                const normalizedSelected = String(selectedColor || '').trim().toLowerCase();
                const colorKey = Object.keys(product.colorImages || {}).find(
                  k => k.trim().toLowerCase() === normalizedSelected
                );
                
                const colorImages = colorKey ? product.colorImages[colorKey] : null;

                if (colorImages) {
                  return Array.isArray(colorImages) 
                    ? colorImages.map((img, idx) => {
                        if (img === product.image) return null;
                        return (
                          <button 
                            key={`${selectedColor}-${idx}`}
                            onClick={() => setCurrentImage(img)}
                            className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${currentImage === img ? 'border-gold shadow-md' : 'border-neutral-100 hover:border-gray-300'}`}
                          >
                            <img src={img} alt={`${selectedColor} ${idx}`} className="w-full h-full object-cover" />
                          </button>
                        );
                      })
                    : colorImages !== product.image && (
                        <button 
                          onClick={() => setCurrentImage(colorImages)}
                          className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${currentImage === colorImages ? 'border-gold shadow-md' : 'border-neutral-100 hover:border-gray-300'}`}
                        >
                          <img src={colorImages} alt={selectedColor} className="w-full h-full object-cover" />
                        </button>
                      );
                }
                return null;
              })()}

              {/* Show one representative image for each OTHER color to allow quick switching */}
              {(product.colors || []).map(color => {
                if (String(color || '').trim().toLowerCase() === String(selectedColor || '').trim().toLowerCase()) return null;
                
                // Find a representative image for this color (case-insensitive)
                const colorKey = product.colorImages ? Object.keys(product.colorImages).find(
                  k => k.trim().toLowerCase() === String(color || '').trim().toLowerCase()
                ) : null;

                let displayImg = product.image;
                if (colorKey && product.colorImages[colorKey]) {
                  const imgs = product.colorImages[colorKey];
                  displayImg = Array.isArray(imgs) ? imgs[0] : imgs;
                } else {
                  return null;
                }

                if (displayImg === product.image) return null;

                return (
                  <button 
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className="relative w-20 h-24 rounded-lg overflow-hidden border-2 border-neutral-100 hover:border-gold transition-all shrink-0 opacity-70 hover:opacity-100 group"
                  >
                    <img src={displayImg} alt={color} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white py-1 text-center font-bold uppercase tracking-tighter">
                      {color}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Main Image */}
            <div className="flex-1 aspect-[4/5] bg-white rounded-2xl overflow-hidden group relative border border-gray-100 flex items-center justify-center p-4">
              <img 
                src={currentImage || product.image} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain transition-transform duration-[1.5s] group-hover:scale-110"
              />
              
              {/* No specific color image badge */}
              {selectedColor && (!product.colorImages || !product.colorImages[selectedColor] || (Array.isArray(product.colorImages[selectedColor]) && product.colorImages[selectedColor].length === 0)) && currentImage === product.image && (
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border border-gray-100 px-3 py-1.5 rounded-full shadow-sm">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={10} />
                    Showing Main View
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Title and Action Buttons */}
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h1 className="text-xl font-medium text-gray-900 uppercase tracking-tight">{product.name}</h1>
                <div 
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={`${i <= Math.floor(averageRating) ? 'fill-orange-400 text-orange-400' : 'fill-orange-400/20 text-orange-400'} transition-transform group-hover:scale-110`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-700">{averageRating}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-500 font-medium underline underline-offset-4 decoration-gray-300 group-hover:text-black transition-colors">{reviews.length} Reviews</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-black transition-all active:scale-90"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={() => toggleFavorite(product.id)}
                  className={`p-2 rounded-full border transition-all active:scale-90 ${isFavorite(product.id) ? 'border-red-100 bg-red-50 text-red-500 shadow-sm' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                >
                  <Heart size={18} fill={isFavorite(product.id) ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* Points Badge */}
            <div className="inline-flex items-center gap-2 bg-[#fff1f0] border border-[#ffccc7] px-3 py-1.5 rounded-lg shadow-sm">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">$</span>
              </div>
              <span className="text-xs font-medium text-gray-700">Earn {points} points</span>
              {!isLoggedIn && (
                <button 
                  onClick={() => navigate('/account')}
                  className="text-xs font-bold text-[#0b2a3d] flex items-center gap-0.5 ml-1 hover:underline underline-offset-2"
                >
                  Sign in <ChevronRight size={12} />
                </button>
              )}
            </div>

            {/* Price Block */}
            <div className="space-y-1 py-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900 font-sans">PKR {product.price?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 line-through">PKR {product.originalPrice?.toLocaleString() || (product.price * 2).toLocaleString()}</span>
                <span className="text-sm font-bold text-red-500">-{discountPercent}%</span>
              </div>
            </div>

            {/* Delivery and Returns Cards */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 flex items-center gap-4 bg-[#f0f7ff]/30 border-b border-gray-50">
                <div className="bg-gradient-to-r from-[#0b2a3d] to-indigo-900 px-2 py-0.5 rounded-sm flex items-center gap-1">
                  <Zap size={10} className="text-white fill-white" />
                  <span className="text-[9px] font-bold text-white uppercase italic tracking-tighter">Express</span>
                </div>
                <span className="text-xs text-[#0b2a3d] font-medium">Instant dispatch, no delays</span>
              </div>
              
              <button 
                onClick={() => toast.info('Standard delivery takes 3-5 business days across Pakistan.')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-all border-b border-gray-100 group"
              >
                <div className="flex items-center gap-3">
                  <Truck size={18} className="text-gray-600" />
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-gray-900">Est. shipping by {estShipping.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-[11px] text-gray-500 font-medium">Standard delivery • Pakistan</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => toast.info('We offer a hassle-free 14-day return policy for unused items.')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw size={18} className="text-gray-600" />
                  <div className="text-left">
                    <p className="text-[13px] font-bold text-gray-900">Easy 14 days return and refund</p>
                    <p className="text-[11px] text-gray-500 font-medium">Return for a different size within 14 days.</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Selection Options */}
            <div className="space-y-6 pt-4">
              {/* Color Selection */}
              <div className="space-y-3">
                <span className="text-sm font-bold text-gray-900">Color</span>
                <div className="flex flex-wrap gap-3">
                  {(product.colors || []).map(color => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      onMouseEnter={() => setHoveredColor(color)}
                      onMouseLeave={() => setHoveredColor(null)}
                      className={`group relative w-10 h-10 p-1 rounded-full border-2 transition-all duration-300 ${
                        String(selectedColor || '').trim().toLowerCase() === String(color || '').trim().toLowerCase() ? 'border-gold shadow-md scale-110' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div 
                        className="w-full h-full rounded-full border border-gray-100"
                        style={{ backgroundColor: String(color || '').toLowerCase().includes('black') ? '#1a1a1a' : 
                                               String(color || '').toLowerCase().includes('blue') ? '#0b2a3d' : 
                                               String(color || '').toLowerCase().includes('pink') ? '#fce7f3' : 
                                               String(color || '').toLowerCase().includes('nude') ? '#f3e5d8' : 
                                               String(color || '').toLowerCase().includes('white') ? '#ffffff' : 
                                               String(color || '').toLowerCase().includes('red') ? '#991b1b' : 
                                               String(color || '').toLowerCase().includes('green') ? '#064e3b' : color }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-900">Size</span>
                  <Link to="/size-guide" className="text-[11px] font-bold text-gray-900 underline underline-offset-4">Size Chart</Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes || []).map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[70px] h-12 flex items-center justify-center border rounded-xl text-[13px] font-medium transition-all ${
                        selectedSize === size ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <span className="text-sm font-bold text-gray-900">Quantity</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl h-12 px-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black">-</button>
                    <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black">+</button>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={() => inCart ? navigate('/cart') : addToCart(product, selectedColor, selectedSize, quantity, currentImage)}
                className="w-full bg-[#0b2a3d] text-white py-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold tracking-widest uppercase hover:bg-black transition-all shadow-xl active:scale-95"
              >
                <ShoppingCart size={18} />
                {inCart ? 'Go to Bag' : 'Add to Collection'}
              </button>
            </div>
          </div>
        </div>
        {/* Review Section */}
        <div className="mt-24 border-t border-gray-100 pt-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-2xl font-serif text-gray-900 mb-2 uppercase tracking-widest">Customer Reviews</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i <= Math.floor(averageRating) ? 'fill-orange-400 text-orange-400' : 'fill-orange-400/20 text-orange-400'} 
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-gray-900">Based on {reviews.length} reviews</span>
              </div>
            </div>
            <button 
              onClick={() => setShowReviewForm(true)}
              className="bg-black text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0b2a3d] transition-all shadow-lg active:scale-95"
            >
              Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loadingReviews ? (
              <div className="col-span-full py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mx-auto"></div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.id} className="bg-neutral-50/50 p-8 rounded-2xl border border-gray-100 transition-all hover:shadow-md group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900">{review.userName}</span>
                        <div className="bg-green-100 text-green-700 p-0.5 rounded-full">
                          <CheckCircle2 size={10} />
                        </div>
                        <span className="text-[10px] text-green-700 font-bold uppercase tracking-tighter">Verified Buyer</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={i <= review.rating ? 'fill-orange-400 text-orange-400' : 'fill-orange-400/20 text-orange-400'} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm italic">No reviews yet. Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>

        {/* Review Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowReviewForm(false)} />
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-serif text-[#0b2a3d] uppercase tracking-widest">Submit a Review</h3>
                <button onClick={() => setShowReviewForm(false)} className="text-gray-400 hover:text-black transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={submitReview} className="p-8 space-y-6">
                <div className="space-y-3 text-center py-4 bg-neutral-50 rounded-2xl">
                  <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Rate your experience</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewRating(i)}
                        className="transition-transform active:scale-90"
                      >
                        <Star 
                          size={32} 
                          className={`${i <= newRating ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'} transition-colors`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">Your Comment</label>
                  <textarea
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Tell us what you liked about this piece..."
                    className="w-full h-32 bg-neutral-50 border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0b2a3d]/10 focus:border-[#0b2a3d] transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#0b2a3d] text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                >
                  Post Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
