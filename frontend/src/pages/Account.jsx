import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LogOut, Package, Heart, ShoppingBag, ChevronRight, User as UserIcon, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import userApi from '../utils/userApi';
import apiClient from '../utils/api';

const Account = () => {
  const { user, isLoggedIn, favorites, logout } = useAuth();
  const { cartItems } = useCart();
  const [orders, setOrders] = useState([]);
  const [favProducts, setFavProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!isLoggedIn) return;
    userApi.get('/history')
      .then((res) => setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []))
      .catch((error) => {
        console.error('Failed to load account order history:', error);
        setOrders([]);
      });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!favorites.length) {
      setFavProducts([]);
      return;
    }
    apiClient.get('/api/products').then((res) => {
      const all = Array.isArray(res.data) ? res.data : [];
      setFavProducts(all.filter((p) => favorites.includes(String(p.id))));
    }).catch((error) => {
      console.error('Failed to load favorite products from API:', error);
      setFavProducts([]);
    });
  }, [favorites]);

  if (!isLoggedIn) return <Navigate to="/login?next=/account" replace />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#fcfcfc] pb-32 pt-32"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-12 border-b border-neutral-100">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gold">
                <div className="w-12 h-px bg-gold" />
                <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Private Member Area</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif tracking-tight text-[#0b2a3d]">
                Welcome, {user?.name?.split(' ')[0]}
              </h1>
              <div className="flex items-center gap-6 text-[#0b2a3d]/50">
                <div className="flex items-center gap-2">
                  <UserIcon size={14} className="text-gold" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gold" />
                  <span className="text-[11px] font-bold uppercase tracking-widest">Member since 2026</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="group flex items-center gap-3 px-8 py-4 bg-white border border-neutral-200 text-[10px] font-bold tracking-[0.3em] uppercase text-[#0b2a3d] hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all rounded-xl shadow-sm self-start"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              Sign Out
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Custom Tabs */}
            <div className="flex gap-12 border-b border-neutral-100 pb-px">
              {[
                { id: 'orders', label: 'Order History', icon: Package },
                { id: 'wishlist', label: 'My Wishlist', icon: Heart }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all relative ${
                    activeTab === tab.id ? 'text-[#0b2a3d]' : 'text-neutral-400 hover:text-[#0b2a3d]'
                  }`}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? 'text-gold' : ''} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'orders' ? (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {orders.length === 0 ? (
                    <div className="py-24 text-center space-y-4 bg-white border border-neutral-100 rounded-3xl">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                        <Package size={24} />
                      </div>
                      <p className="text-sm font-serif italic text-neutral-400">Your order history is currently empty.</p>
                      <Link to="/shop" className="inline-block text-[10px] font-bold uppercase tracking-widest text-gold border-b border-gold/20 pb-1 hover:border-gold transition-all">Explore Collections</Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((o) => (
                        <motion.div 
                          key={o.id}
                          whileHover={{ y: -4 }}
                          className="bg-white border border-neutral-100 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all"
                        >
                          <div className="flex items-center gap-8">
                            <div className="flex -space-x-6">
                              {(o.items || []).slice(0, 3).map((item, idx) => (
                                <div key={idx} className="w-16 h-16 bg-neutral-50 rounded-full overflow-hidden border-2 border-gold shadow-md group-hover:scale-110 transition-transform relative z-[5]">
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                              ))}
                              {o.items?.length > 3 && (
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gold border-2 border-gold shadow-md z-0">
                                  +{o.items.length - 3}
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#0b2a3d]">Order #{o.id.slice(-6).toUpperCase()}</span>
                                <span className={`text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${
                                  o.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-gold/10 text-gold'
                                }`}>
                                  {o.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-neutral-400">
                                <span className="text-[10px] font-medium uppercase tracking-tight">
                                  {new Date(o.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-12">
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Total Amount</p>
                              <p className="text-xl font-serif text-[#0b2a3d]">Rs. {Number(o.total || 0).toLocaleString()}</p>
                            </div>
                            <button className="p-3 bg-neutral-50 rounded-full text-neutral-400 group-hover:bg-gold group-hover:text-white transition-all">
                              <ChevronRight size={20} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {favProducts.length === 0 ? (
                    <div className="py-24 text-center space-y-4 bg-white border border-neutral-100 rounded-3xl">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                        <Heart size={24} />
                      </div>
                      <p className="text-sm font-serif italic text-neutral-400">No treasures saved yet.</p>
                      <Link to="/shop" className="inline-block text-[10px] font-bold uppercase tracking-widest text-gold border-b border-gold/20 pb-1 hover:border-gold transition-all">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                      {favProducts.map((p) => (
                        <motion.div key={p.id} whileHover={{ y: -8 }} className="group">
                          <Link to={`/product/${p.id}`} className="space-y-6 block">
                            <div className="aspect-[4/5] overflow-hidden bg-white rounded-3xl border border-neutral-100 shadow-sm group-hover:shadow-xl transition-all duration-700">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                            </div>
                            <div className="text-center space-y-2">
                              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#0b2a3d] group-hover:text-gold transition-colors">{p.name}</p>
                              <p className="text-gold font-serif italic text-sm">View Details</p>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Quick Cart Preview */}
            <section className="bg-[#0b2a3d] rounded-[2.5rem] p-10 space-y-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={20} className="text-gold" />
                    <h2 className="text-xl font-serif tracking-widest uppercase">Your Cart</h2>
                  </div>
                  <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{cartItems.length} Items</span>
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-8 text-center space-y-4">
                    <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Bag is Empty</p>
                    <Link to="/shop" className="text-[10px] font-bold text-gold border-b border-gold/20 pb-1">Shop Now</Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                      {cartItems.map((i) => (
                        <div key={`${i.id}-${i.selectedColor}-${i.selectedSize}`} className="flex gap-4 group">
                          <div className="w-14 h-14 rounded-full overflow-hidden border border-gold shrink-0">
                            <img src={i.image} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <p className="text-[10px] font-bold tracking-widest uppercase truncate mb-1">{i.name}</p>
                            <p className="text-[9px] text-white/40 uppercase tracking-tighter">
                              {i.selectedColor} • {i.selectedSize}
                            </p>
                            <p className="text-[10px] font-bold text-gold mt-1">x{i.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link 
                      to="/cart" 
                      className="block w-full bg-gold text-[#0b2a3d] py-5 rounded-2xl text-center text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-white transition-all shadow-lg shadow-black/20"
                    >
                      Secure Checkout
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Help & Concierge */}
            <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-10 space-y-8 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#0b2a3d]">Personal Concierge</h3>
                <p className="text-xs text-neutral-400 leading-relaxed font-medium italic">
                  "Our dedicated team is here to assist you with sizing, styling, and order inquiries to ensure your LIBBAAS experience is flawless."
                </p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-neutral-50">
                <Link 
                  to="/contact" 
                  className="flex items-center justify-between group p-2 -mx-2 hover:bg-neutral-50 rounded-xl transition-all"
                >
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#0b2a3d]">Contact Support</span>
                  <ChevronRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center justify-between p-2 -mx-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#0b2a3d]">Status</span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Account;
