import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useReviews } from '../hooks/useReviews';

const HERO_BANNERS = [
  {
    id: 'fashion',
    image: '/imags/banner-fashion.jpg',
    eyebrow: 'Clothing & Fashion 2026',
    title: 'Rise Above Ordinary',
    text: 'Premium-quality fashion, modern styles, and exceptional value — built for your identity.',
    cta: 'Shop Fashion',
    to: '/shop',
  },
  {
    id: 'winter',
    image: '/imags/banner-fashion.jpg',
    eyebrow: 'Winter Collection',
    title: 'Warmth Meets Style',
    text: 'Explore seasonal essentials crafted for comfort, confidence, and everyday elegance.',
    cta: 'Shop Winter',
    to: '/shop?category=Winter%20Collection',
  },
  {
    id: 'advance',
    image: '/imags/banner-advance.jpg',
    eyebrow: 'Advance Payment Offer',
    title: '5% Off Over Rs 15,000',
    text: 'Pay in advance on orders above Rs 15,000 and enjoy a special 5% discount. Free shipping on all orders.',
    cta: 'Shop Now',
    to: '/shop',
  },
];

const FEATURED_COLLECTIONS = [
  {
    name: 'Winter Collection',
    path: '/shop?category=Winter%20Collection',
    image: '/imags/banner-fashion.jpg',
    blurb: 'Seasonal layers and essentials',
  },
  {
    name: 'Watches',
    path: '/shop?category=Watches',
    image: '/imags/banner-advance.jpg',
    blurb: 'Timeless style on your wrist',
  },
];

const Home = () => {
  const { products: allProducts, isLoading: productsLoading } = useProducts();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { reviews, isLoading: reviewsLoading } = useReviews();
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const loading = productsLoading || categoriesLoading || reviewsLoading;
  const featuredProducts = allProducts.slice(0, 8);
  const heroSlides = HERO_BANNERS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const getCategoryImage = (category, fallback) => {
    if (!allProducts || allProducts.length === 0) return fallback;
    const product = allProducts.find(
      (p) => String(p.category).toLowerCase() === String(category).toLowerCase()
    );
    return product ? product.image : fallback;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#c5a059] border-t-transparent" />
          <p className="text-sm text-gray-600 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const activeHero = heroSlides[currentHeroIndex];

  return (
    <div className="pb-0">
      <section className="relative overflow-hidden">
        <div className="max-w-[1920px] mx-auto">
          <div className="bg-gradient-to-r from-[#1a1a1a] via-[#c5a059] to-[#1a1a1a] text-white text-center py-3 text-xs font-bold uppercase tracking-[0.3em]">
            Free Delivery On All Orders · 5% Off Advance Payment Over Rs 15,000
          </div>

          <div className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#0f172a]">
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeHero.id}
                  src={activeHero.image}
                  alt={activeHero.title}
                  loading="eager"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/95 via-[#0f172a]/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/80 via-transparent to-transparent" />
            </div>

            <div className="relative z-20 w-full px-6 sm:px-10 lg:px-20">
              <div className="max-w-3xl space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent via-[#c5a059] to-[#c5a059]" />
                  <span className="text-[#c5a059] text-xs font-bold tracking-[0.5em] uppercase">
                    {activeHero.eyebrow}
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-[Playfair_Display] text-white leading-[0.9] tracking-tight">
                  {activeHero.id === 'fashion' ? (
                    <>
                      LIB<span className="text-[#c5a059]">BAAS</span>
                    </>
                  ) : (
                    activeHero.title
                  )}
                </h1>

                <p className="text-xl md:text-2xl text-white/80 font-light max-w-lg leading-relaxed border-l-2 border-[#c5a059] pl-6">
                  {activeHero.id === 'fashion' ? activeHero.title + '. ' + activeHero.text : activeHero.text}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link
                    to={activeHero.to}
                    className="group inline-flex items-center justify-center gap-3 bg-[#c5a059] text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-[#1a1a1a] transition-all duration-500 shadow-2xl shadow-[#c5a059]/40"
                  >
                    {activeHero.cta}
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center gap-3 border-2 border-white/30 text-white px-12 py-5 text-xs font-bold uppercase tracking-[0.3em] hover:border-white hover:bg-white/10 transition-all duration-500"
                  >
                    Our Story
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute bottom-10 right-10 flex gap-3 z-30">
              <button
                onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                className="w-14 h-14 bg-white/10 hover:bg-[#c5a059] backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300"
                aria-label="Previous banner"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length)}
                className="w-14 h-14 bg-[#c5a059] hover:bg-white hover:text-[#1a1a1a] backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300"
                aria-label="Next banner"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="absolute bottom-10 left-10 flex gap-2 z-30">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentHeroIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentHeroIndex ? 'w-10 bg-[#c5a059]' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to ${slide.eyebrow}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 py-20">
        <div className="text-center mb-12">
          <span className="text-[#c5a059] text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Collections</span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] uppercase tracking-widest">
            Winter & Watches
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_COLLECTIONS.map((col) => (
            <Link
              key={col.name}
              to={col.path}
              className="group relative min-h-[360px] overflow-hidden rounded-[2rem]"
            >
              <img
                src={col.image}
                alt={col.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b2a3d]/90 via-[#0b2a3d]/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-10 space-y-3 text-white">
                <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">{col.blurb}</p>
                <h3 className="text-3xl font-serif">{col.name}</h3>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em]">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 py-16 bg-[#fafaf8]">
        <div className="text-center mb-16">
          <span className="text-[#c5a059] text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Our Collection</span>
          <h2 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] uppercase tracking-widest">
            Find Your Style
          </h2>
        </div>
        <div className="flex justify-center gap-8 md:gap-12 overflow-x-auto pb-10 scrollbar-hide">
          {(categories.length > 0 ? categories.slice(0, 6) : FEATURED_COLLECTIONS.map((c, i) => ({
            id: i,
            displayName: c.name,
            image: c.image,
          }))).map((cat, idx) => (
            <motion.div
              key={cat.id || cat.displayName}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link
                to={`/shop?category=${encodeURIComponent(cat.displayName)}`}
                className="flex flex-col items-center gap-4 group min-w-fit"
              >
                <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl group-hover:border-[#c5a059] transition-all duration-500">
                  <img
                    src={cat.image || getCategoryImage(cat.displayName, '/imags/banner-fashion.jpg')}
                    alt={cat.displayName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] group-hover:text-[#c5a059] transition-colors duration-300">
                  {cat.displayName}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What's New */}
      <section className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-serif text-[#1a1a1a] uppercase tracking-widest">What&apos;s New</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {featuredProducts.slice(0, 5).map((p) => {
            const discountPercent =
              p.originalPrice > p.price
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                : null;
            return (
              <Link key={p.id} to={`/product/${p.id}`} className="group relative">
                {discountPercent ? (
                  <div className="absolute top-3 left-3 bg-[#e72e2e] text-white text-xs font-bold px-3 py-1 uppercase z-10">
                    -{discountPercent}%
                  </div>
                ) : null}
                <div className="aspect-[3/4] overflow-hidden bg-white">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-sm font-medium text-[#1a1a1a]">{p.name}</h3>
                  <p className="text-[#c5a059] font-bold mt-1">Rs {p.price?.toLocaleString()}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-white py-20 border-t border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="mb-12">
            <h2 className="text-2xl font-serif text-[#1a1a1a]">Let customers speak for us</h2>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} fill="#14b8a6" stroke="#14b8a6" />
              ))}
              <span className="text-xs text-gray-500 ml-2">from {reviews.length} reviews</span>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="relative">
              <button
                onClick={() =>
                  setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
                }
                className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 z-10"
                aria-label="Previous reviews"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentReviewIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                  >
                    {reviews.map((_, i) => {
                      const idx = (i + currentReviewIndex) % reviews.length;
                      const currentReview = reviews[idx];
                      if (!currentReview) return null;
                      return (
                        <div
                          key={`${currentReview.id || idx}-${i}`}
                          className="p-8 border border-gray-100 rounded-lg bg-white"
                        >
                          <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, star) => (
                              <Star
                                key={star}
                                size={14}
                                fill={star < (currentReview?.rating || 0) ? '#14b8a6' : 'none'}
                                stroke={star < (currentReview?.rating || 0) ? '#14b8a6' : '#d1d5db'}
                              />
                            ))}
                          </div>
                          <p className="text-[#333] mb-6">{currentReview?.comment || 'Great product!'}</p>
                          <p className="text-sm font-medium text-[#1a1a1a]">
                            {currentReview?.userName || 'Customer'}
                          </p>
                        </div>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={() => setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 z-10"
                aria-label="Next reviews"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">No reviews yet. Be the first to review!</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
