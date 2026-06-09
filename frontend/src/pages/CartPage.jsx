import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 border-b border-black/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gold">
            <div className="w-10 h-px bg-gold" />
            <span className="text-[9px] font-bold tracking-[0.4em] uppercase">Your Selection</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-[#0b2a3d] uppercase">Shopping Bag</h1>
          <p className="text-gray-400 text-[9px] tracking-[0.2em] uppercase font-medium">
            {cartItems.length === 0 ? 'Your bag is empty' : `${cartItems.length} exquisite pieces`}
          </p>
        </div>
        {cartItems.length > 0 && (
          <Link to="/shop" className="group flex items-center gap-2 text-[#0b2a3d] hover:text-gold transition-colors text-[9px] font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-1">
            Continue Exploring <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#fcfaf7] border border-black/5 p-12 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-gold">
            <ShoppingBag size={28} />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-serif text-[#0b2a3d]">Your bag is waiting for its first masterpiece</h2>
            <p className="text-gray-400 text-xs font-light italic">"True elegance begins with the pieces closest to your skin."</p>
          </div>
          <Link to="/shop" className="inline-block bg-[#0b2a3d] text-white px-10 py-4 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-gold transition-all duration-500 shadow-xl">
            Discover the Collection
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                className="group relative bg-white border border-black/5 p-5 hover:shadow-xl transition-all duration-500"
              >
                <div className="flex gap-6">
                  <div className="w-24 h-32 overflow-hidden bg-neutral-50 shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s]"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gold">
                          <span className="text-[8px] font-bold tracking-[0.3em] uppercase">{item.category || 'Luxury'}</span>
                        </div>
                        <h3 className="text-xs sm:text-base font-bold tracking-widest text-[#0b2a3d] uppercase leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full border border-black/5" 
                            style={{ backgroundColor: String(item.selectedColor || '').toLowerCase().includes('black') ? '#1a1a1a' : 
                                                   String(item.selectedColor || '').toLowerCase().includes('blue') ? '#0b2a3d' : 
                                                   String(item.selectedColor || '').toLowerCase().includes('pink') ? '#fce7f3' : 
                                                   String(item.selectedColor || '').toLowerCase().includes('nude') ? '#f3e5d8' : 
                                                   String(item.selectedColor || '').toLowerCase().includes('white') ? '#ffffff' : 
                                                   String(item.selectedColor || '').toLowerCase().includes('red') ? '#991b1b' : 
                                                   String(item.selectedColor || '').toLowerCase().includes('green') ? '#064e3b' : item.selectedColor }}
                          ></span>
                          {item.selectedColor} <span className="mx-1.5 text-gray-200">|</span> {item.selectedSize}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-base font-serif text-[#0b2a3d]">
                          Rs {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-black/10 bg-neutral-50/50">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0b2a3d] transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-10 h-8 flex items-center justify-center text-[11px] font-bold text-[#0b2a3d]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#0b2a3d] transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      {item.originalPrice > item.price && (
                        <div className="text-right">
                          <p className="text-[9px] text-gold font-bold tracking-widest uppercase">
                            Saving Rs {((item.originalPrice - item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-[#0b2a3d] p-6 text-white shadow-2xl space-y-6 sticky top-32">
              <h2 className="text-lg font-serif tracking-widest uppercase border-b border-white/10 pb-4">Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] tracking-widest text-white/60">
                  <span>Subtotal</span>
                  <span>Rs {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] tracking-widest text-white/60">
                  <span>Shipping</span>
                  <span className="text-gold font-bold italic">Complimentary</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between items-end">
                  <span className="text-[10px] tracking-widest uppercase font-bold text-white/80">Total</span>
                  <span className="text-xl font-serif text-white">Rs {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gold text-primary py-4 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-white transition-all duration-500 shadow-lg active:scale-95 flex items-center justify-center gap-3"
              >
                Proceed to Checkout
                <ArrowRight size={12} />
              </button>

              <div className="pt-4 flex items-center gap-3 text-[9px] tracking-widest text-white/40 justify-center">
                <ShieldCheck size={12} />
                <span>Secure Checkout Guaranteed</span>
              </div>
            </div>

            <div className="bg-[#fcfaf7] border border-black/5 p-6 space-y-3">
              <h3 className="text-[9px] font-bold tracking-widest uppercase text-[#0b2a3d]">Need Assistance?</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed italic">
                Our concierge team is available to help you with your order.
              </p>
              <Link to="/contact" className="inline-block text-[9px] font-bold tracking-widest uppercase text-gold hover:text-[#0b2a3d] transition-colors border-b border-gold/20 pb-0.5">
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
