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
  const [heroImg, setHeroImg] = useState('/imags/hero-bg.png');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get(apiUrl('/api/products')),
          axios.get(apiUrl('/api/categories'))
        ]);
        const products = Array.isArray(prodRes.data) ? prodRes.data : [];
        setAllProducts(products);
        setFeaturedProducts(products.slice(0, 4));
        setCategories(catRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryImage = (category, fallback) => {
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
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#0b2a3d]">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-[#0b2a3d]/40 z-10" />
          <img 
            src={heroImg} 
            alt="Hero Background"
            className="w-full h-full object-cover"
            loading="eager"
            onError={() => setHeroImg("https://images.unsplash.com/photo-1616150840617-a062ba510486?auto=format&fit=crop&q=80&w=2000")}
          />
        </motion.div>
        
        <div className="relative z-10 text-center space-y-12 px-4 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-6"
          >
            <span className="text-gold tracking-[0.6em] uppercase text-xs sm:text-sm font-bold block mb-4">The Art of Elegance</span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-serif tracking-[0.15em] uppercase text-white leading-none">
              LIBBAAS
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "6rem" }}
              transition={{ duration: 1, delay: 1.2 }}
              className="h-px bg-gold mx-auto mt-8"
            />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="max-w-2xl mx-auto text-white/90 leading-relaxed text-lg sm:text-xl font-light italic"
          >
            "True luxury is invisible, yet unforgettable." Discover our curated collection of silk and lace, designed for the sophisticated woman.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <Link
              to="/shop"
              className="group relative flex items-center gap-4 bg-white text-[#0b2a3d] px-16 py-6 text-[11px] font-bold uppercase tracking-[0.4em] transition-all hover:bg-gold hover:text-white shadow-2xl overflow-hidden"
            >
              <span className="relative z-10">Shop Collection</span>
              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <motion.div {...fadeInUp} className="flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-[#ff2e97]/30" />
            <span className="text-[#ff2e97] text-[10px] font-bold tracking-[0.4em] uppercase">Collections</span>
            <div className="h-px w-8 bg-[#ff2e97]/30" />
          </motion.div>
          <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-[#ff2e97]">Top Categories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => (
            <motion.div 
              key={cat.id}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to={`/shop?category=${cat.displayName}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl"
              >
                <img 
                  src={cat.image || getCategoryImage(cat.displayName, '/imags/sports-bra.jpg')} 
                  className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                  alt={cat.displayName}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-10 left-0 right-0 text-center">
                  <h3 className="text-white text-lg font-bold tracking-[0.3em] uppercase drop-shadow-lg">{cat.displayName}</h3>
                </div>
              </Link>
            </motion.div>
          ))}
          {categories.length === 0 && (
            <>
              {/* Fallback if no categories in DB yet */}
              <motion.div 
                whileHover={{ y: -10 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  to="/shop?category=Sports Bra"
                  className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] shadow-xl"
                >
                  <img 
                    src={getCategoryImage('Sports Bra', '/imags/sports-bra.jpg')} 
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    alt="Sports Bra"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-10 left-0 right-0 text-center">
                    <h3 className="text-white text-lg font-bold tracking-[0.3em] uppercase drop-shadow-lg">Sports Bra</h3>
                  </div>
                </Link>
              </motion.div>
              {/* ... other fallbacks ... */}
            </>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#fcfaf7] py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gold">
                <div className="w-12 h-px bg-gold" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Highlights</span>
              </div>
              <h2 className="text-4xl font-serif tracking-tight text-[#0b2a3d]">Trending Now</h2>
            </div>
            <Link to="/shop" className="group flex items-center gap-3 text-gold text-[10px] font-bold tracking-[0.3em] uppercase border-b border-gold/20 pb-2 hover:border-gold transition-all">
              View All Masterpieces <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <motion.div 
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12"
          >
            {loading ? [1,2,3,4].map(i => (
              <div key={i} className="aspect-[4/5] bg-neutral-100 animate-pulse"></div>
            )) : featuredProducts.map(p => (
              <motion.div key={p.id} variants={fadeInUp}>
                <Link to={`/product/${p.id}`} className="group block space-y-6">
                  <div className="aspect-[4/5] overflow-hidden bg-white relative shadow-sm group-hover:shadow-xl transition-all duration-700">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-[#0b2a3d]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-8 left-8 right-8 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20">
                      <button className="w-full bg-white/95 backdrop-blur-sm text-[#0b2a3d] py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-gold hover:text-white transition-all">Quick View</button>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-[11px] font-bold tracking-[0.25em] uppercase text-[#0b2a3d] group-hover:text-gold transition-colors">{p.name}</h3>
                    <p className="text-gold font-serif text-lg tracking-tight">Rs {p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <motion.div {...fadeInUp} className="text-center space-y-6 group">
            <div className="w-20 h-20 border border-gold/20 flex items-center justify-center mx-auto text-gold mb-8 group-hover:bg-gold group-hover:text-white transition-all duration-500 rounded-full">
              <Star size={32} />
            </div>
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#0b2a3d]">Premium Quality</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">Hand-selected fabrics and meticulous craftsmanship in every stitch.</p>
          </motion.div>
          <motion.div {...fadeInUp} className="text-center space-y-6 group">
            <div className="w-20 h-20 border border-gold/20 flex items-center justify-center mx-auto text-gold mb-8 group-hover:bg-gold group-hover:text-white transition-all duration-500 rounded-full">
              <Truck size={32} />
            </div>
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#0b2a3d]">Fast Delivery</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">Swift and secure shipping across Pakistan to your doorstep.</p>
          </motion.div>
          <motion.div {...fadeInUp} className="text-center space-y-6 group">
            <div className="w-20 h-20 border border-gold/20 flex items-center justify-center mx-auto text-gold mb-8 group-hover:bg-gold group-hover:text-white transition-all duration-500 rounded-full">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#0b2a3d]">Secure Shopping</h3>
            <p className="text-gray-400 text-sm leading-relaxed font-light">Your data and payments are always protected with top-tier security.</p>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-48 overflow-hidden bg-[#0b2a3d] text-white">
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] font-serif text-[20vw] pointer-events-none select-none flex items-center justify-end translate-x-1/4">LIBBAAS</div>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <h2 className="text-4xl md:text-6xl font-serif tracking-tight uppercase leading-tight">Sophistication <br/>Redefined</h2>
            <div className="h-px w-24 bg-gold mx-auto"></div>
            <p className="text-white/80 leading-relaxed text-xl sm:text-2xl font-light italic">
              "LIBBAAS is more than a brand; it is a celebration of the feminine spirit. We believe that what you wear closest to your skin should be as beautiful as your own story."
            </p>
          </motion.div>
          <Link to="/contact" className="inline-block border border-gold text-gold px-16 py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-gold hover:text-[#0b2a3d] transition-all duration-500">Discover More</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
