import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Search, ChevronDown, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import SaleCountdown from './SaleCountdown';

const Navbar = ({ onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { categories } = useCategories();
  const { cartCount } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Sale', path: '/shop' },
    { name: 'Winter', path: '/shop?category=Winter%20Collection' },
    { name: 'Watches', path: '/shop?category=Watches' },
    { name: 'Best Sellers', path: '/shop' },
    { name: 'New Arrival', path: '/shop' },
    { name: 'Shop', path: '/shop', hasDropdown: true },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-0 left-0 w-full z-[100]">
      {/* Promo bar */}
      <div className="bg-black text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              Limited Time Sale
            </span>
            <SaleCountdown />
            <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/80">
              <ShieldCheck size={14} className="text-white" />
              Free shipping on all orders
            </div>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors"
          >
            Upto 50% Off →
          </Link>
        </div>
      </div>

      {/* Main black header */}
      <div className="bg-black text-white border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            <Link to="/" className="flex items-center shrink-0 group" aria-label="LIBBAAS Home">
              <img
                src="/imags/logo.jpg?v=2"
                alt="LIBBAAS.com — Rise Above Ordinary"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              <div className="hidden leading-none pl-1">
                <div className="text-lg sm:text-xl font-serif tracking-[0.2em] uppercase text-[#d4af37]">LIBBAAS</div>
                <div className="text-[8px] tracking-[0.28em] uppercase text-[#d4af37]/70 mt-1">Rise Above Ordinary</div>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <div
                  key={link.name}
                  className="relative py-5"
                  onMouseEnter={() => link.hasDropdown && setIsShopDropdownOpen(true)}
                  onMouseLeave={() => link.hasDropdown && setIsShopDropdownOpen(false)}
                >
                  <Link
                    to={link.path}
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 hover:text-white flex items-center gap-1"
                  >
                    {link.name}
                    {link.hasDropdown ? <ChevronDown size={12} /> : null}
                  </Link>

                  {link.hasDropdown && isShopDropdownOpen ? (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-[420px] bg-white text-black shadow-2xl rounded-xl overflow-hidden z-[120]">
                      <div className="p-6 grid grid-cols-2 gap-3">
                        <Link to="/shop" className="text-xs font-semibold uppercase tracking-wider hover:text-neutral-500 py-2">
                          All Products
                        </Link>
                        {categories.slice(0, 7).map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/shop?category=${encodeURIComponent(cat.displayName)}`}
                            className="text-xs font-semibold uppercase tracking-wider hover:text-neutral-500 py-2"
                          >
                            {cat.displayName}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsSearchOpen((v) => !v)}
                className="p-2 text-white/90 hover:text-white"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                to={isLoggedIn ? '/account' : '/login'}
                className="p-2 text-white/90 hover:text-white"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              <button
                type="button"
                onClick={onCartClick}
                className="relative p-2 text-white/90 hover:text-white"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                className="lg:hidden p-2 text-white"
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isSearchOpen ? (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleSearch}
                className="overflow-hidden pb-4"
              >
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 px-4 py-3 text-sm outline-none focus:border-white/50"
                />
              </motion.form>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-black text-white border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block py-3 text-xs font-semibold uppercase tracking-[0.15em] border-b border-white/10"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
