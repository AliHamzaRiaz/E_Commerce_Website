import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUrl } from '../utils/apiUrl';
import { ArrowRight, Star, ShieldCheck, Truck, ChevronRight } from 'lucide-react';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-rotate hero images - now using categories!
  useEffect(() => {
    if (categories.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % categories.length);
      }, 5000); // Change every 5 seconds
      return () => clearInterval(interval);
    }
  }, [categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(apiUrl('/api/products')),
          axios.get(apiUrl('/api/categories'))
        ]);
        console.log('API Response Products:', prodRes.data);
        console.log('API Response Categories:', catRes.data);
        const products = Array.isArray(prodRes.data) ? prodRes.data : (prodRes.data?.products || []);
        setAllProducts(products);
        setFeaturedProducts(products.slice(0, 4));
        setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data?.categories || []));
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

  return (
    <div className="pb-32">
      {/* Hero Section - Professional, Fully Responsive Category Carousel */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a1620] mb-24">
        <div className="absolute inset-0 z-0">
          {/* Professional Overlay for Clarity & Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1620]/80 via-[#0a1620]/45 to-[#0a1620]/80 z-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0)_0%,rgba(10,22,32,0.7)_100%)] z-20" />
          
          {/* Animated Category Carousel */}
          <AnimatePresence mode="wait">
            {categories.length > 0 ? (
              <motion.img
                key={categories[currentHeroIndex].id}
                src={categories[currentHeroIndex].image || getCategoryImage(categories[currentHeroIndex].displayName, '/imags/collection-images.jpg')}
                alt={categories[currentHeroIndex].displayName}
                initial={{ opacity: 0, scale: 1.1, x: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1.0, 
                  x: 0,
                  y: [0, -6, 0] // Gentle vertical float
                }}
                exit={{ opacity: 0, scale: 1.05, x: -20 }}
                transition={{ 
                  duration: 2.8, 
                  ease: "easeInOut",
                  y: { duration: 7, repeat: Infinity, ease: "easeInOut" }
                }}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="eager"
              />
            ) : (
              <motion.img
                key="fallback"
                src="/imags/collection-images.jpg"
                alt="Hero Background"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1.0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full object-cover object-center"
                loading="eager"
              />
            )}
          </AnimatePresence>
          
          {/* Navigation Dots */}
          {categories.length > 1 && (
            <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 z-30 flex justify-center gap-4">
              {categories.map((cat, index) => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentHeroIndex(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-700 ${
                    index === currentHeroIndex 
                      ? 'w-10 sm:w-14 bg-gold shadow-lg shadow-gold/50' 
                      : 'w-2 bg-white/25 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="relative z-10 text-center space-y-10 sm:space-y-14 px-4 sm:px-6 max-w-6xl">
          {/* Luxury Brand Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.3 }}
            className="space-y-6 sm:space-y-8"
          >
            <span className="text-gold tracking-[0.6em] sm:tracking-[0.8em] md:tracking-[1em] uppercase text-[7px] sm:text-[9px] md:text-[11px] font-semibold block">
              Timeless Elegance
            </span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-serif tracking-[0.15em] sm:tracking-[0.18em] md:tracking-[0.25em] uppercase text-white leading-none">
              LIBBAAS
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "6rem" }}
              transition={{ duration: 1.4, delay: 1.2 }}
              className="h-0.5 bg-gold mx-auto mt-6 sm:mt-8 md:mt-12"
            />
          </motion.div>
          
          {/* Current Category Display */}
          {categories.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={categories[currentHeroIndex].id}
              transition={{ duration: 0.8 }}
              className="space-y-2 sm:space-y-3"
            >
              <span className="text-white/70 tracking-[0.35em] sm:tracking-[0.4em] uppercase text-[9px] sm:text-[11px] md:text-[12px] font-medium block">
                Discover Our
              </span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif tracking-[0.1em] sm:tracking-[0.12em] uppercase text-gold">
                {categories[currentHeroIndex].displayName}
              </h2>
            </motion.div>
          )}
          
          {/* Shop Button - Fixed! */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 1.8 }}
            className="pt-4"
          >
            <Link
              to="/shop"
              className="group inline-flex items-center justify-center gap-4 bg-white text-[#0a1620] px-12 sm:px-20 md:px-28 py-5 sm:py-6 md:py-8 text-[10px] sm:text-[12px] md:text-[13px] font-bold uppercase tracking-[0.4em] sm:tracking-[0.5em] md:tracking-[0.6em] transition-all duration-300 hover:bg-gold hover:text-white shadow-2xl hover:shadow-gold/30 relative overflow-hidden"
            >
              <span className="relative z-10">Explore The Collection</span>
              <ArrowRight size={16} className="relative z-10 transition-transform duration-500 group-hover:translate-x-3" />
              <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 mb-40">
        <div className="text-center mb-24 space-y-6">
          <motion.div {...fadeInUp} className="flex items-center justify-center gap-6">
            <div className="h-px w-12 bg-gold/30" />
            <span className="text-gold text-[10px] font-bold tracking-[0.6em] uppercase">The Curation</span>
            <div className="h-px w-12 bg-gold/30" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight uppercase text-[#0b2a3d]">Top Categories</h2>
        </div>

        <div className="flex lg:grid lg:grid-cols-4 gap-6 sm:gap-10 overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 scrollbar-hide snap-x snap-mandatory px-4 -mx-4 sm:px-0 sm:mx-0">
          {categories.map((cat) => (
            <motion.div 
              key={cat.id}
              whileHover={{ y: -12 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="min-w-[75%] sm:min-w-[40%] lg:min-w-0 snap-center"
            >
              <Link
                to={`/shop?category=${cat.displayName}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-[2.5rem] luxury-shadow"
              >
                <img 
                  src={cat.image || getCategoryImage(cat.displayName, '/imags/sports-bra.jpg')} 
                  className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                  alt={cat.displayName}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b2a3d]/90 via-[#0b2a3d]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-700 m-4 rounded-[2rem]" />
                
                <div className="absolute bottom-10 left-0 right-0 text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                  <span className="text-gold text-[8px] font-bold tracking-[0.4em] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-700 mb-2 block">Discover</span>
                  <h3 className="text-white text-xl font-serif tracking-[0.1em] uppercase drop-shadow-2xl">{cat.displayName}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#fcfcfc] pt-40 pb-20">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-px bg-gold" />
                <span className="text-[10px] font-bold tracking-[0.5em] uppercase text-gold">The Edit</span>
              </motion.div>
              <h2 className="text-5xl md:text-6xl font-serif tracking-tight text-[#0b2a3d]">Trending Now</h2>
            </div>
            <Link to="/shop" className="group flex items-center gap-4 text-[#0b2a3d] text-[10px] font-bold tracking-[0.3em] uppercase border-b border-[#0b2a3d]/10 pb-3 hover:border-gold transition-all duration-500">
              Explore All Masterpieces <ChevronRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
            </Link>
          </div>
          
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="flex lg:grid lg:grid-cols-4 gap-x-6 sm:gap-x-12 gap-y-16 overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 scrollbar-hide snap-x snap-mandatory px-4 -mx-4 sm:px-0 sm:mx-0"
          >
            {loading ? [1,2,3,4].map(i => (
              <div key={i} className="min-w-[75%] sm:min-w-[40%] lg:min-w-0 aspect-[3/4] bg-neutral-50 animate-pulse rounded-2xl"></div>
            )) : featuredProducts.map(p => (
              <motion.div key={p.id} variants={fadeInUp} className="min-w-[75%] sm:min-w-[40%] lg:min-w-0 snap-center">
                <Link to={`/product/${p.id}`} className="group block space-y-8">
                  <div className="aspect-[3/4] overflow-hidden bg-white relative rounded-2xl luxury-shadow transition-all duration-700 group-hover:-translate-y-2">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-[#0b2a3d]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute bottom-8 left-8 right-8 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 z-20">
                      <button className="w-full bg-white text-[#0b2a3d] py-5 text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-gold hover:text-white transition-all duration-500 rounded-xl shadow-xl">Quick View</button>
                    </div>
                  </div>
                  <div className="text-center space-y-3 px-4">
                    <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#0b2a3d]/80 group-hover:text-gold transition-colors duration-500">{p.name}</h3>
                    <p className="text-gold font-serif text-xl tracking-tight">Rs {p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14 pt-10 pb-32">
        <div className="flex lg:grid lg:grid-cols-3 gap-6 sm:gap-16 overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 scrollbar-hide snap-x snap-mandatory">
          <motion.div {...fadeInUp} className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center group space-y-8 p-10 sm:p-12 bg-neutral-50/50 rounded-[3rem] transition-all duration-700 hover:bg-white hover:shadow-2xl hover:shadow-[#0b2a3d]/5">
            <div className="w-16 h-16 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-700 rounded-2xl shadow-xl shadow-gold/5">
              <Star size={28} />
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-[#0b2a3d]">Exquisite Quality</h3>
              <p className="text-[#0b2a3d]/40 text-[13px] leading-relaxed font-medium">Hand-selected premium fabrics and meticulous craftsmanship in every delicate stitch.</p>
            </div>
          </motion.div>
          <motion.div {...fadeInUp} className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center group space-y-8 p-10 sm:p-12 bg-neutral-50/50 rounded-[3rem] transition-all duration-700 hover:bg-white hover:shadow-2xl hover:shadow-[#0b2a3d]/5">
            <div className="w-16 h-16 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-700 rounded-2xl shadow-xl shadow-gold/5">
              <Truck size={28} />
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-[#0b2a3d]">Swift Concierge</h3>
              <p className="text-[#0b2a3d]/40 text-[13px] leading-relaxed font-medium">Priority shipping across Pakistan, ensuring your luxury pieces arrive in pristine condition.</p>
            </div>
          </motion.div>
          <motion.div {...fadeInUp} className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center group space-y-8 p-10 sm:p-12 bg-neutral-50/50 rounded-[3rem] transition-all duration-700 hover:bg-white hover:shadow-2xl hover:shadow-[#0b2a3d]/5">
            <div className="w-16 h-16 border border-gold/20 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-700 rounded-2xl shadow-xl shadow-gold/5">
              <ShieldCheck size={28} />
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold tracking-[0.4em] uppercase text-[#0b2a3d]">Discreet Privacy</h3>
              <p className="text-[#0b2a3d]/40 text-[13px] leading-relaxed font-medium">Your experience is personal. We provide secure shopping and elegant, discreet packaging.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-64 overflow-hidden bg-[#0b2a3d] text-white">
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.02] font-serif text-[30vw] pointer-events-none select-none flex items-center justify-end translate-x-1/4">LIBBAAS</div>
        <div className="max-w-5xl mx-auto px-6 text-center space-y-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
            className="space-y-10"
          >
            <span className="text-gold tracking-[0.6em] uppercase text-[10px] font-bold block">Our Philosophy</span>
            <h2 className="text-5xl md:text-8xl font-serif tracking-tight uppercase leading-[1.1]">Sophistication <br/><span className="text-gold italic">Redefined</span></h2>
            <div className="h-px w-24 bg-gold/30 mx-auto"></div>
            <p className="text-white/60 leading-relaxed text-xl sm:text-3xl font-light italic max-w-4xl mx-auto">
              "LIBBAAS is more than a brand; it is a celebration of the feminine spirit. We believe that what you wear closest to your skin should be as beautiful as your own story."
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/about" className="inline-block border border-gold/50 text-gold px-20 py-6 text-[11px] font-bold tracking-[0.5em] uppercase hover:bg-gold hover:text-[#0b2a3d] transition-all duration-700 rounded-full">
              Explore Our Story
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
