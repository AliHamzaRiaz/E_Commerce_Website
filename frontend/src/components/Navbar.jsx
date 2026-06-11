import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, Search, ChevronDown, Heart, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { apiUrl } from '../utils/apiUrl';

const Navbar = ({ onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [categories, setCategories] = useState([]);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(apiUrl('/api/categories'));
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching categories for navbar:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop', hasDropdown: true },
    { name: 'Collections', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 left-0 w-full z-[100] transition-all duration-500">
      {/* Announcement Bar */}
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#0b2a3d] text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            <div className="max-w-[1800px] mx-auto px-6 py-2 flex items-center relative overflow-hidden">
              <div className="animate-marquee-css flex items-center whitespace-nowrap">
                <p className="text-[8px] sm:text-[9px] font-black tracking-[0.4em] uppercase flex items-center">
                  <span className="px-10">Welcome to our shop</span>
                  <span className="text-gold/40 text-[12px]">|</span>
                  <span className="px-10">Pakistan's Premier Lingerie Destination</span>
                  <span className="text-gold/40 text-[12px]">|</span>
                  <span className="px-10">Complimentary Shipping Over Rs. 5000</span>
                </p>
                <p className="text-[8px] sm:text-[9px] font-black tracking-[0.4em] uppercase flex items-center">
                  <span className="px-10">Welcome to our shop</span>
                  <span className="text-gold/40 text-[12px]">|</span>
                  <span className="px-10">Pakistan's Premier Lingerie Destination</span>
                  <span className="text-gold/40 text-[12px]">|</span>
                  <span className="px-10">Complimentary Shipping Over Rs. 5000</span>
                </p>
                <p className="text-[8px] sm:text-[9px] font-black tracking-[0.4em] uppercase flex items-center">
                  <span className="px-10">Welcome to our shop</span>
                  <span className="text-gold/40 text-[12px]">|</span>
                  <span className="px-10">Pakistan's Premier Lingerie Destination</span>
                  <span className="text-gold/40 text-[12px]">|</span>
                  <span className="px-10">Complimentary Shipping Over Rs. 5000</span>
                </p>
              </div>
              <button 
                onClick={() => setShowAnnouncement(false)}
                className="absolute right-6 p-1 text-white/40 hover:text-white transition-colors bg-[#0b2a3d] z-10"
              >
                <X size={10} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Header Container */}
      <div className="bg-white/95 backdrop-blur-3xl border-b border-neutral-100">
        <div className="max-w-[1800px] mx-auto px-6 sm:px-10 lg:px-14">
          
          <div className="flex justify-between items-center h-20 sm:h-24">
            
            {/* Left: Brand Identity */}
            <div className="flex-none">
              <Link to="/" className="flex items-center gap-4 group">
                <img 
                  src="/imags/logo.png" 
                  alt="LIBBAAS" 
                  className="h-12 sm:h-14 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <div className="flex flex-col border-l border-neutral-100 pl-4">
                  <h1 className="text-xl sm:text-2xl font-serif tracking-[0.3em] uppercase text-[#0b2a3d] leading-none">
                    LIBBAAS
                  </h1>
                  <span className="text-[7px] tracking-[0.5em] uppercase text-gold font-black mt-1.5 opacity-80">
                    Luxe Lingerie
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation (Fills the previous empty space) */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <div 
                  key={link.name}
                  className="relative group py-8"
                  onMouseEnter={() => link.hasDropdown && setIsShopDropdownOpen(true)}
                  onMouseLeave={() => link.hasDropdown && setIsShopDropdownOpen(false)}
                >
                  <Link
                    to={link.path}
                    className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0b2a3d]/70 hover:text-[#0b2a3d] transition-all duration-300 flex items-center gap-1.5"
                  >
                    {link.name}
                    {link.hasDropdown && (
                      <ChevronDown 
                        size={10} 
                        className={`transition-transform duration-500 ${isShopDropdownOpen ? 'rotate-180' : ''}`} 
                      />
                    )}
                  </Link>
                  <motion.div 
                    className="absolute bottom-6 left-0 right-0 h-[1.5px] bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-in-out origin-left"
                  />

                  {/* Professional & Minimised Mega Menu */}
                  {link.hasDropdown && (
                    <AnimatePresence>
                      {isShopDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 w-[600px] bg-white border border-neutral-100 shadow-[0_30px_60px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden z-[110]"
                        >
                          <div className="grid grid-cols-5 h-full">
                            {/* Navigation Section */}
                            <div className="col-span-3 p-10 grid grid-cols-2 gap-8">
                              <div className="space-y-6">
                                <h4 className="text-[9px] font-black tracking-[0.4em] uppercase text-gold">Categories</h4>
                                <div className="space-y-3">
                                  {categories.map(cat => (
                                    <Link 
                                      key={cat.id} 
                                      to={`/shop?category=${cat.displayName}`}
                                      className="block text-[10px] font-bold text-[#0b2a3d]/60 hover:text-gold transition-colors tracking-widest uppercase"
                                      onClick={() => setIsShopDropdownOpen(false)}
                                    >
                                      {cat.displayName}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-6">
                                <h4 className="text-[9px] font-black tracking-[0.4em] uppercase text-gold">The Edit</h4>
                                <div className="space-y-3">
                                  <Link to="/shop?sort=newest" className="block text-[10px] font-bold text-[#0b2a3d]/60 hover:text-gold transition-colors tracking-widest uppercase">New In</Link>
                                  <Link to="/shop?sort=trending" className="block text-[10px] font-bold text-[#0b2a3d]/60 hover:text-gold transition-colors tracking-widest uppercase">Bestsellers</Link>
                                  <Link to="/shop?category=Sale" className="block text-[10px] font-bold text-[#e41e31] hover:text-red-700 transition-colors tracking-widest uppercase">Special Sale</Link>
                                </div>
                              </div>
                            </div>

                            {/* Minimised Featured Section */}
                            <div className="col-span-2 bg-neutral-50/50 p-8 flex flex-col justify-center items-center text-center border-l border-neutral-50">
                              <div className="w-20 h-20 rounded-full overflow-hidden mb-6 border-2 border-gold/20 p-1">
                                <img 
                                  src="/imags/mega-menu-feat.jpg" 
                                  alt="Featured" 
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              </div>
                              <div className="space-y-2">
                                <p className="text-[8px] font-black tracking-[0.3em] uppercase text-gold">Featured</p>
                                <p className="text-xs font-serif italic text-[#0b2a3d]">The Silk Collection</p>
                              </div>
                              <Link 
                                to="/shop" 
                                className="mt-6 text-[9px] font-bold text-[#0b2a3d] border-b border-[#0b2a3d]/20 pb-0.5 hover:border-gold transition-all uppercase tracking-widest"
                                onClick={() => setIsShopDropdownOpen(false)}
                              >
                                Explore Now
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex-none flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-3 text-[#0b2a3d] hover:text-gold transition-all duration-500 group/search"
                aria-label="Search"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="transition-transform duration-500 group-hover/search:scale-110"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              
              <div className="hidden md:block">
                <Link 
                  to={isLoggedIn ? '/account' : '/login'} 
                  className="p-3 text-[#0b2a3d] hover:text-gold transition-all duration-500 group/user"
                  aria-label="Account"
                >
                  <User size={20} strokeWidth={1.2} className="transition-transform duration-500 group-hover/user:scale-110" />
                </Link>
              </div>

              <button 
                onClick={onCartClick} 
                className="p-3 text-[#0b2a3d] hover:text-gold transition-all duration-500 relative group/cart" 
                aria-label="Cart"
              >
                <ShoppingCart size={20} strokeWidth={1.2} className="transition-transform duration-500 group-hover/cart:scale-110" />
                {cartCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 bg-[#0b2a3d] text-white text-[7px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              {/* Mobile Toggle */}
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden p-2 text-[#0b2a3d] hover:bg-neutral-50 rounded-full transition-colors"
              >
                <Menu size={22} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-start justify-center pt-20"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-[95%] max-w-2xl bg-white rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.15)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sm:p-8 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gold text-[9px] font-black uppercase tracking-[0.4em]">Search Our Collection</span>
                  <button 
                    onClick={() => setIsSearchOpen(false)} 
                    className="p-2 hover:bg-neutral-50 rounded-full transition-colors text-neutral-400 hover:text-[#0b2a3d]"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <form onSubmit={handleSearch} className="relative group mb-8">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search for 'Silk Robes'..."
                    className="w-full bg-neutral-50 border-none rounded-xl py-4 pl-6 pr-14 text-lg font-serif focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-neutral-300 text-[#0b2a3d]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gold hover:scale-110 transition-transform"
                  >
                    <Search size={20} strokeWidth={1.5} />
                  </button>
                </form>

                <div className="space-y-4">
                  <p className="text-[8px] font-black tracking-[0.3em] uppercase text-neutral-400">Quick Filters</p>
                  <div className="flex flex-wrap gap-2">
                    {['Bridal', 'Silk', 'New In', 'Sleepwear'].map((tag) => (
                      <button 
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          navigate(`/shop?search=${encodeURIComponent(tag)}`);
                          setIsSearchOpen(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-neutral-50 text-[10px] font-bold uppercase tracking-widest text-[#0b2a3d]/60 hover:bg-[#0b2a3d] hover:text-white transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 p-4 text-center border-t border-neutral-100">
                <p className="text-[7px] tracking-[0.3em] uppercase text-neutral-300">
                  Premium Quality • Fast Delivery Across Pakistan
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[160] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-neutral-50">
                <div className="flex items-center gap-3">
                  <img src="/imags/logo.png" alt="LIBBAAS" className="h-8 w-auto" onError={(e) => e.target.style.display = 'none'} />
                  <span className="text-sm font-serif tracking-widest uppercase text-[#0b2a3d]">LIBBAAS</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-neutral-50 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-8">
                {/* Mobile Search Trigger */}
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl mb-10 text-neutral-400 hover:text-gold transition-colors group"
                >
                  <Search size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Search Collections...</span>
                </button>

                <div className="space-y-8">
                  {navLinks.map((link, idx) => (
                    <motion.div 
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                    >
                      {link.hasDropdown ? (
                        <div className="space-y-6">
                          <Link 
                            to={link.path} 
                            className="text-2xl font-serif tracking-wide text-[#0b2a3d] flex items-center justify-between"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {link.name}
                            <ChevronRight size={18} className="text-gold/50" />
                          </Link>
                          <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-gold/10">
                            <Link 
                              to="/shop" 
                              className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0b2a3d]/50 hover:text-gold transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              Explore All
                            </Link>
                            {categories && categories.map(cat => (
                              <Link 
                                key={cat.id} 
                                to={`/shop?category=${cat.displayName}`}
                                className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0b2a3d]/50 hover:text-gold transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {cat.displayName}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link 
                          to={link.path} 
                          className="text-2xl font-serif tracking-wide text-[#0b2a3d] block hover:text-gold transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-neutral-50 bg-neutral-50/50">
                {isLoggedIn ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <User size="20" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#0b2a3d]">My Account</p>
                        <p className="text-[9px] text-neutral-400">{user?.email}</p>
                      </div>
                    </div>
                    <Link to="/account" onClick={() => setIsMenuOpen(false)} className="block w-full text-center py-3 bg-white border border-neutral-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#0b2a3d]">Dashboard</Link>
                    <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full py-3 bg-[#0b2a3d] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full py-4 bg-[#0b2a3d] text-white text-center rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#0b2a3d]/10"
                  >
                    Sign In / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
