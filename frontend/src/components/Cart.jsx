import React from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
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
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-[320px] bg-primary z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-3 border-b border-black/10 flex justify-between items-center">
              <h2 className="text-base font-serif tracking-widest uppercase">Shopping Bag</h2>
              <button onClick={onClose} className="text-gray-600 hover:text-accent">
                <X size={18} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-3 space-y-3">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 text-gray-500">
                  <ShoppingCart size={32} strokeWidth={1} />
                  <p className="font-serif tracking-widest uppercase text-[10px]">Your bag is empty</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex space-x-3">
                    <img src={item.image} alt={item.name} className="w-14 h-18 object-cover rounded-sm shadow-sm" />
                    <div className="flex-grow space-y-0.5">
                      <h3 className="font-serif text-[12px] tracking-wide leading-tight">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-1.5 h-1.5 rounded-full border border-black/5" 
                          style={{ backgroundColor: String(item.selectedColor || '').toLowerCase().includes('black') ? '#1a1a1a' : 
                                                 String(item.selectedColor || '').toLowerCase().includes('blue') ? '#0b2a3d' : 
                                                 String(item.selectedColor || '').toLowerCase().includes('pink') ? '#fce7f3' : 
                                                 String(item.selectedColor || '').toLowerCase().includes('nude') ? '#f3e5d8' : 
                                                 String(item.selectedColor || '').toLowerCase().includes('white') ? '#ffffff' : 
                                                 String(item.selectedColor || '').toLowerCase().includes('red') ? '#991b1b' : 
                                                 String(item.selectedColor || '').toLowerCase().includes('green') ? '#064e3b' : item.selectedColor }}
                        ></span>
                        <p className="text-gray-500 text-[8px] uppercase tracking-widest">
                          {item.selectedColor} / {item.selectedSize}
                        </p>
                      </div>
                      <p className="text-gold text-[11px] font-semibold">Rs {item.price.toLocaleString()}</p>
                      <div className="flex items-center space-x-2 pt-0.5">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, -1)}
                          className="text-gray-400 hover:text-accent border border-gray-100 rounded-sm p-0.5"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-[11px] font-medium w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, 1)}
                          className="text-gray-400 hover:text-accent border border-gray-100 rounded-sm p-0.5"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                      className="text-gray-300 hover:text-red-400 self-start"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-black/10 space-y-3">
              <div className="flex justify-between items-center text-sm font-serif">
                <span className="text-[11px] uppercase tracking-widest">Subtotal</span>
                <span className="font-bold text-sm">Rs {cartTotal.toLocaleString()}</span>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/cart');
                  }}
                  className="w-full btn-primary py-2.5 text-[9px] tracking-[0.2em]"
                >
                  View Bag
                </button>
                <button
                  disabled={cartItems.length === 0}
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="w-full btn-outline py-2.5 text-[9px] tracking-[0.2em] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Checkout
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
