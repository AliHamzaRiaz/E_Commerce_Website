import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { apiUrl } from '../utils/apiUrl';
import { ArrowLeft, ShieldCheck, CreditCard, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateCounty, setStateCounty] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);

  const discount = useMemo(() => {
    if (cartItems.length === 0) return 0;
    if (paymentMethod !== 'card') return 0;
    return Math.round(cartTotal * 0.07);
  }, [cartItems.length, cartTotal, paymentMethod]);

  const total = Math.max(0, cartTotal - discount);

  useEffect(() => {
    if (!user) return;
    const parts = String(user.name || '').trim().split(/\s+/);
    if (!firstName && parts[0]) setFirstName(parts[0]);
    if (!lastName && parts.length > 1) setLastName(parts.slice(1).join(' '));
    if (!email) setEmail(String(user.email || ''));
  }, [user, firstName, lastName, email]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!success || !purchasedItems.length) return;
      setIsRelatedLoading(true);
      try {
        const res = await axios.get(apiUrl('/api/products'));
        const all = Array.isArray(res.data) ? res.data : [];
        const firstCategory = String(purchasedItems[0]?.category || '').trim();
        const purchasedIds = new Set(purchasedItems.map((p) => String(p.id)));
        const filtered = all.filter((p) => !purchasedIds.has(String(p.id)));
        setRelatedProducts(filtered.slice(0, 4));
      } catch {
        setRelatedProducts([]);
      } finally {
        setIsRelatedLoading(false);
      }
    };
    loadRelated();
  }, [purchasedItems, success]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    setSuccess(false);
    setError('');
    
    try {
      if (!isLoggedIn) {
        setError('Please login to place your order');
        setIsSubmitting(false);
        return;
      }
      
      const fullName = `${firstName} ${lastName}`.trim();
      const address = `${streetAddress}${apartment ? ', ' + apartment : ''}, ${city}, ${stateCounty}, ${postcode}, ${country}`;
      
      const res = await axios.post(apiUrl('/api/orders'), {
        customer: { fullName, email, phone, address, note: orderNote },
        items: cartItems,
        paymentMethod,
        paymentDetails: paymentMethod === 'card' ? { cardNumber, expiry, cvv } : undefined,
      });
      
      setPurchasedItems([...cartItems]);
      clearCart();
      setOrderInfo(res.data);
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-[#fcfaf7] border border-black/5 p-8 sm:p-12 text-center space-y-8 shadow-sm">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
              <CheckCircle2 size={40} />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-serif tracking-tight text-[#0b2a3d] uppercase">Thank You</h2>
              <p className="text-gray-500 font-light italic text-base">"Your order has been received and is being prepared with care."</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 py-8 border-y border-black/5 max-w-md mx-auto">
              <div className="text-center space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Order ID</p>
                <p className="text-xs font-bold text-[#0b2a3d]">{orderInfo?.orderId}</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Status</p>
                <p className="text-xs font-bold text-gold uppercase tracking-widest">Confirmed</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <p className="text-xs text-gray-400">A confirmation email has been sent to <span className="text-[#0b2a3d] font-bold">{email}</span></p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/account" className="bg-[#0b2a3d] text-white px-10 py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-gold transition-all duration-500 shadow-xl">
                  Track Order
                </Link>
                <Link to="/shop" className="border border-black/10 text-[#0b2a3d] px-10 py-4 text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-secondary transition-all duration-500">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-20 space-y-10">
              <div className="text-center space-y-3">
                <h3 className="text-xl font-serif tracking-tight text-[#0b2a3d] uppercase">Complete Your Look</h3>
                <div className="h-px w-10 bg-gold mx-auto"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <Link key={p.id} to={`/product/${p.id}`} className="group space-y-3">
                    <div className="aspect-[4/5] overflow-hidden bg-neutral-50 shadow-sm group-hover:shadow-md transition-shadow">
                      <img src={p.image} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" alt={p.name} crossOrigin="anonymous" />
                    </div>
                    <div className="text-center space-y-1">
                      <h4 className="text-[9px] font-bold tracking-widest uppercase text-[#0b2a3d] truncate px-2">{p.name}</h4>
                      <p className="text-gold font-serif text-xs">Rs {p.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 border-b border-black/5 pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-gold">
            <div className="w-10 h-px bg-gold" />
            <span className="text-[9px] font-bold tracking-[0.4em] uppercase">Secure Payment</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-[#0b2a3d] uppercase">Checkout</h1>
        </div>
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-gray-400 hover:text-[#0b2a3d] transition-colors text-[9px] font-bold tracking-[0.3em] uppercase border-b border-black/10 pb-1">
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back
        </button>
      </div>

      <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          {/* Billing Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="w-7 h-7 rounded-full bg-[#0b2a3d] text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <h2 className="text-lg font-serif tracking-widest uppercase text-[#0b2a3d]">Delivery Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">First Name</label>
                <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Street Address</label>
                <input required value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="House number and street name" className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">City</label>
                <input required value={city} onChange={e => setCity(e.target.value)} className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Postcode / ZIP</label>
                <input required value={postcode} onChange={e => setPostcode(e.target.value)} className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
              </div>
            </div>
          </section>

          {/* Payment Section */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="w-7 h-7 rounded-full bg-[#0b2a3d] text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <h2 className="text-lg font-serif tracking-widest uppercase text-[#0b2a3d]">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <button type="button" onClick={() => setPaymentMethod('cash')} className={`w-full flex items-center justify-between p-4 border transition-all ${paymentMethod === 'cash' ? 'border-[#0b2a3d] bg-[#fcfaf7]' : 'border-neutral-200 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-[#0b2a3d]' : 'border-neutral-300'}`}>
                    {paymentMethod === 'cash' && <div className="w-1.5 h-1.5 rounded-full bg-[#0b2a3d]" />}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#0b2a3d]">Cash on Delivery</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-tighter">Pay when you receive</p>
                  </div>
                </div>
                <Truck size={18} className="text-gray-300" />
              </button>

              <button 
                type="button" 
                onClick={() => {}} 
                className="w-full flex items-center justify-between p-4 border border-neutral-200 opacity-50 cursor-not-allowed bg-neutral-50/50 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-300 flex items-center justify-center">
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Credit / Debit Card</p>
                    <p className="text-[9px] text-gold font-bold uppercase tracking-tighter italic">Coming Soon</p>
                  </div>
                </div>
                <CreditCard size={18} className="text-gray-300" />
              </button>
            </div>

            <AnimatePresence>
              {paymentMethod === 'card' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-6 bg-neutral-50 border border-neutral-100 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Card Number</label>
                      <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000" className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Expiry</label>
                        <input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="MM / YY" className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">CVV</label>
                        <input value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" className="w-full px-5 py-3 bg-white border border-neutral-200 focus:border-gold outline-none transition-colors text-xs" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5">
          <div className="bg-[#0b2a3d] p-6 text-white shadow-2xl space-y-6 sticky top-32">
            <h2 className="text-lg font-serif tracking-widest uppercase border-b border-white/10 pb-4">Your Order</h2>
            
            <div className="max-h-[300px] overflow-y-auto pr-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-4">
                  <div className="w-14 h-18 bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden">
                    <img src={item.image} className="w-full h-full object-cover opacity-80" alt={item.name} />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest line-clamp-1">{item.name}</p>
                    <p className="text-[8px] text-white/40 uppercase tracking-tighter">{item.selectedColor} / {item.selectedSize} <span className="mx-2">|</span> x{item.quantity}</p>
                    <p className="text-xs font-serif text-gold">Rs {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              <div className="flex justify-between text-[10px] tracking-widest text-white/60">
                <span>Subtotal</span>
                <span>Rs {cartTotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[10px] tracking-widest text-gold font-bold italic">
                  <span>Card Reward (7%)</span>
                  <span>- Rs {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] tracking-widest text-white/60">
                <span>Shipping</span>
                <span className="text-gold italic">Complimentary</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between items-end">
                <span className="text-[10px] tracking-widest uppercase font-bold text-white/80">Final Total</span>
                <span className="text-2xl font-serif text-white">Rs {total.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-[9px] font-bold tracking-widest uppercase text-center">
                {error}
              </div>
            )}

            <button
              disabled={isSubmitting || cartItems.length === 0}
              className="w-full bg-gold text-primary py-4 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-white transition-all duration-500 shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Place Order <ChevronRight size={12} /></>
              )}
            </button>

            <div className="pt-3 flex items-center gap-3 text-[9px] tracking-widest text-white/30 justify-center">
              <ShieldCheck size={12} />
              <span>Verified Secure Transaction</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
