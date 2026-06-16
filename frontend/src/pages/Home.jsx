import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../utils/apiUrl';
import { ArrowRight, Star, ShieldCheck, Truck, ChevronRight, ChevronLeft, Mail, Send, MapPin, Phone } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // Sample reviews for the carousel
  const reviews = [
    { name: "Esha", text: "Fast delivery, impressive quality!", rating: 5 },
    { name: "Shaheen", text: "Pleasant, really happy to get it!", rating: 5 },
    { name: "Awais", text: "Loved this dress! The color and design are beautiful, and the fit is perfect.", rating: 5 },
    { name: "Fatima", text: "Excellent fabric and stitching. Will definitely order again!", rating: 5 },
  ];

  // Auto-rotate hero images
  useEffect(() => {
    if (currentHeroIndex >= categories.length && categories.length > 0) {
      setCurrentHeroIndex(0);
    }
    
    if (categories.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % categories.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [categories, currentHeroIndex]);

  // Auto-rotate reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(apiUrl('/api/products'), { timeout: 5000 }),
          axios.get(apiUrl('/api/categories'), { timeout: 5000 })
        ]);
        const products = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.products || []);
        const allCategories = Array.isArray(catRes.data) ? catRes.data : (catRes.data?.categories || []);
        
        const validCategories = allCategories.filter(cat => 
          cat.displayName && cat.displayName.trim() !== ''
        );
        
        setAllProducts(products);
        setFeaturedProducts(products.slice(0, 8));
        setCategories(validCategories);
        setCurrentHeroIndex(0);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryImage = (category, fallback) => {
    if (!allProducts || allProducts.length === 0) return fallback;
    const product = allProducts.find(p => p.category === category);
    return product ? product.image : fallback;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for subscribing!');
    setNewsletterEmail('');
  };

  return (
    <div className="pb-0">
      {/* Hero Section - Like Reference */}
      <section className="relative bg-[#f8f5f2] overflow-hidden">
        <div className="max-w-[1800px] mx-auto">
          {/* Top Bar - SALE tag like reference */}
          <div className="bg-[#e72e2e] text-white text-center py-2 text-xs font-bold uppercase tracking-wider">
            SALE • UP TO 50% OFF
          </div>
          
          {/* Main Hero */}
          <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <AnimatePresence mode="wait">
                {categories.length > 0 && (
                  <motion.img
                    key={categories[currentHeroIndex].id}
                    src={categories[currentHeroIndex].image || getCategoryImage(categories[currentHeroIndex].displayName, '/imags/sports-bra.jpg')}
                    alt={categories[currentHeroIndex].displayName}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: 1.05 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-r from-[#f8f5f2]/80 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 max-w-[1800px] w-full px-6 sm:px-10 lg:px-14">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1 }}
                  className="space-y-6"
                >
                  <span className="text-[#c5a059] text-xs font-bold tracking-[0.4em] uppercase mb-4 block">
                    {categories.length > 0 ? categories[currentHeroIndex]?.displayName : 'EXCLUSIVE COLLECTION'}
                  </span>
                  <h1 className="text-6xl md:text-8xl lg:text-9xl font-[Playfair_Display] text-[#1a1a1a] leading-[0.85] tracking-tight mb-6">
                    LIBBAAS
                  </h1>
                  <p className="text-xl text-[#666] italic font-light max-w-md leading-relaxed">
                    "Discover elegance that turns every moment into a masterpiece. Crafted with love, designed for you."
                  </p>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-3 bg-[#c5a059] text-white px-10 py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#1a1a1a] transition-all duration-500 shadow-lg shadow-[#c5a059]/30 hover:shadow-xl"
                  >
                    <span className="relative z-10">SHOP THE COLLECTION</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Navigation Arrows */}
            {categories.length > 1 && (
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 z-20">
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev - 1 + categories.length) % categories.length)}
                  className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentHeroIndex((prev) => (prev + 1) % categories.length)}
                  className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Circular Categories - Like Reference */}
      <section className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 py-20 bg-[#fafaf8]">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#c5a059] text-xs font-bold tracking-[0.4em] uppercase mb-4 block">Our Collection</span>
            <h2 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] uppercase tracking-widest">Find Your Perfect Fit</h2>
          </motion.div>
        </div>
        <div className="flex justify-center gap-8 md:gap-12 overflow-x-auto pb-10 scrollbar-hide">
          {categories.slice(0, 6).map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <Link
                to={`/shop?category=${cat.displayName}`}
                className="flex flex-col items-center gap-4 group min-w-fit"
              >
                <div className="relative">
                  <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl group-hover:border-[#c5a059] transition-all duration-500">
                    <img
                      src={cat.image || getCategoryImage(cat.displayName, '/imags/sports-bra.jpg')}
                      alt={cat.displayName}
                      className="w-full h-full object-cover group-hover:scale-115 transition-transform duration-700"
                      onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=400&fit=crop'}}
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-[#c5a059]/0 group-hover:bg-[#c5a059]/10 transition-all duration-500 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white text-xs font-bold uppercase tracking-widest bg-[#1a1a1a] px-4 py-2 rounded-full">
                      Shop Now
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1a] group-hover:text-[#c5a059] transition-colors duration-300">
                  {cat.displayName}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
        {/* Dots indicator */}
        <div className="flex justify-center gap-3 mt-12">
          {[0, 1].map((i) => (
            <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${i === 0 ? 'bg-[#c5a059] w-8' : 'bg-gray-300'}`} />
          ))}
        </div>
      </section>

      {/* What's New Section */}
      <section className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-serif text-[#1a1a1a] uppercase tracking-widest">What's New</h2>
        </div>

        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {featuredProducts.slice(0, 5).map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="group relative">
                <div className="absolute top-3 left-3 bg-[#e72e2e] text-white text-xs font-bold px-3 py-1 uppercase z-10">
                  -20%
                </div>
                <div className="aspect-[3/4] overflow-hidden bg-white">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-sm font-medium text-[#1a1a1a]">{p.name}</h3>
                  <p className="text-[#c5a059] font-bold mt-1">Rs {p.price?.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews - Like Reference */}
      <section className="bg-white py-20 border-t border-b border-gray-100">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="mb-12">
            <h2 className="text-2xl font-serif text-[#1a1a1a]">Let customers speak for us</h2>
            <div className="flex items-center gap-1 mt-2">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="#14b8a6" stroke="#14b8a6" />)}
              <span className="text-xs text-gray-500 ml-2">from {reviews.length * 3 + 2} reviews</span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length)}
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 z-10"
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
                  {reviews.map((review, i) => {
                    const idx = (i + currentReviewIndex) % reviews.length;
                    return (
                      <div key={idx} className="p-8 border border-gray-100 rounded-lg bg-white">
                        <div className="flex gap-1 mb-4">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} size={14} fill="#14b8a6" stroke="#14b8a6" />
                          ))}
                        </div>
                        <p className="text-[#333] mb-6">{reviews[idx].text}</p>
                        <p className="text-sm font-medium text-[#1a1a1a]">{reviews[idx].name}</p>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={() => setCurrentReviewIndex((prev) => (prev + 1) % reviews.length)}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 z-10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter & Footer Top - Like Reference */}
      <section className="bg-[#f5f5f5] py-16">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-6">Get in Touch</h3>
              <div className="space-y-4 text-sm text-[#444]">
                <p className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#c5a059] shrink-0 mt-0.5" />
                  <span>Bahria Sky, 1st Floor, Block G2, Bahria Orchard, Lahore</span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail size={16} className="text-[#c5a059] shrink-0" />
                  <span>support@zarlay.com.pk</span>
                </p>
                <p className="flex items-center gap-3">
                  <Phone size={16} className="text-[#c5a059] shrink-0" />
                  <span>+92 311 7778826</span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-6">Care & Support</h3>
              <ul className="space-y-3 text-sm text-[#444]">
                <li><Link to="#" className="hover:text-[#c5a059]">Exchange & Return Policy</Link></li>
                <li><Link to="#" className="hover:text-[#c5a059]">B2B & Wholesale</Link></li>
                <li><Link to="#" className="hover:text-[#c5a059]">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-[#c5a059]">Our Blogs</Link></li>
                <li><Link to="#" className="hover:text-[#c5a059]">FAQs</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-6">Information</h3>
              <ul className="space-y-3 text-sm text-[#444]">
                <li><Link to="#" className="hover:text-[#c5a059]">About Us</Link></li>
                <li><Link to="#" className="hover:text-[#c5a059]">Shipping Policy</Link></li>
                <li><Link to="#" className="hover:text-[#c5a059]">Privacy Policy</Link></li>
                <li><Link to="#" className="hover:text-[#c5a059]">Terms & Conditions</Link></li>
                <li><Link to="#" className="hover:text-[#c5a059]">Track Your Order</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a1a1a] mb-6">Newsletter Signup</h3>
              <p className="text-sm text-[#444] mb-4">Subscribe to our newsletter and get 10% off your first purchase</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-full border border-gray-300 text-sm focus:outline-none focus:border-[#c5a059]"
                />
                <button type="submit" className="bg-[#1a1a1a] text-white px-6 py-3 rounded-full text-sm font-bold uppercase hover:bg-[#c5a059] transition-all flex items-center gap-2">
                  Subscribe <Send size={14} />
                </button>
              </form>
              <div className="flex gap-4 mt-8">
                {['facebook', 'instagram', 'twitter', 'snapchat', 'youtube', 'tiktok'].map((social) => (
                  <a key={social} href="#" className="text-[#1a1a1a] hover:text-[#c5a059]">
                    <div className="w-8 h-8 flex items-center justify-center text-lg">{social[0].toUpperCase()}</div>
                  </a>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <div className="w-12 h-8 bg-[#1a1a1a] rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                <div className="w-12 h-8 bg-[#1a1a1a] rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Bar */}
      <div className="bg-[#1a1a1a] text-white py-5 text-center">
        <p className="text-sm font-serif tracking-[0.3em] uppercase">© LIBBAAS - ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  );
};

export default Home;
