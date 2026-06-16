import React from 'react';
import { X, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[150] backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-full max-w-[380px] bg-white z-[160] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-gradient-to-r from-white to-neutral-50">
              <div className="flex items-center gap-3">
                <ShoppingCart size={24} className="text-[#c5a059]" strokeWidth={1.5} />
                <h2 className="text-lg font-serif tracking-[0.2em] uppercase text-[#1a1a1a]">Shopping Bag</h2>
                {cartItems.length > 0 && (
                  <span className="bg-[#c5a059] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-neutral-100 transition-all text-[#666] hover:text-[#1a1a1a]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-5 bg-[#fafaf8]">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-5 text-center">
                  <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center">
                    <ShoppingCart size={40} strokeWidth={1} className="text-neutral-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-serif tracking-[0.3em] uppercase text-xs text-neutral-500">Your bag is empty</p>
                    <p className="text-sm text-neutral-400">Explore our collection to find your perfect fit</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-8 py-3 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#c5a059] transition-all duration-300"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div 
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex space-x-4 bg-white p-4 rounded-2xl shadow-sm border border-neutral-100"
                  >
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-24 h-32 object-cover rounded-xl shadow-sm"
                        onError={(e) => {e.target.src = 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=300&h=400&fit=crop'}}
                      />
                    </div>
                    
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-sm tracking-wide leading-tight text-[#1a1a1a] flex-1 pr-2">
                          {item.name}
                        </h3>
                        <button 
                          onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                          className="text-neutral-300 hover:text-red-500 transition-all p-1 rounded-full hover:bg-red-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-5 h-5 rounded-full border-2 border-neutral-200 shadow-sm" 
                            style={{ backgroundColor: String(item.selectedColor || '').toLowerCase().includes('black') ? '#1a1a1a' : 
                                               String(item.selectedColor || '').toLowerCase().includes('blue') ? '#0b2a3d' : 
                                               String(item.selectedColor || '').toLowerCase().includes('pink') ? '#fce7f3' : 
                                               String(item.selectedColor || '').toLowerCase().includes('nude') ? '#f3e5d8' : 
                                               String(item.selectedColor || '').toLowerCase().includes('white') ? '#ffffff' : 
                                               String(item.selectedColor || '').toLowerCase().includes('red') ? '#991b1b' : 
                                               String(item.selectedColor || '').toLowerCase().includes('green') ? '#064e3b' : item.selectedColor || '#ccc' }}
                          ></span>
                          <span className="text-neutral-500 text-[10px] uppercase tracking-[0.2em]">
                            {item.selectedColor}
                          </span>
                        </div>
                        <span className="text-neutral-300">•</span>
                        <span className="text-neutral-500 text-[10px] uppercase tracking-[0.2em]">
                          {item.selectedSize}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[#c5a059] font-serif text-lg font-semibold">Rs {item.price.toLocaleString()}</p>
                        
                        <div className="flex items-center gap-3 bg-neutral-50 rounded-full p-1.5">
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white hover:bg-[#c5a059] hover:text-white transition-all duration-200 text-neutral-600 hover:shadow-md"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold text-[#1a1a1a] w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-full bg-white hover:bg-[#c5a059] hover:text-white transition-all duration-200 text-neutral-600 hover:shadow-md"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 bg-white border-t border-neutral-100 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center py-2 border-t border-neutral-100">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-600">Subtotal</span>
                  <span className="font-bold text-xl text-[#1a1a1a] font-serif">Rs {cartTotal.toLocaleString()}</span>
                </div>
                
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/cart');
                    }}
                    className="w-full py-4 bg-[#f5f5f3] hover:bg-neutral-100 text-[#1a1a1a] text-xs font-bold uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    View Bag
                    <ArrowRight size={14} />
                  </button>
                  
                  <button
                    disabled={cartItems.length === 0}
                    onClick={() => {
                      onClose();
                      navigate('/checkout');
                    }}
                    className="w-full py-4 bg-[#c5a059] hover:bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 shadow-lg shadow-[#c5a059]/30 hover:shadow-xl"
                  >
                    Checkout Securely
                  </button>
                </div>
                
                <p className="text-center text-[10px] text-neutral-400 uppercase tracking-[0.2em] pt-2">
                  Free shipping on orders over Rs 5,000
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
