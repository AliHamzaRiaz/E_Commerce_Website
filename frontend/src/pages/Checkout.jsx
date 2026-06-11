import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { apiUrl } from '../utils/apiUrl';
import { ArrowLeft, ShieldCheck, CreditCard, Truck, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Delivery State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Address State
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('Pakistan');
  
  // Payment State
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [orderNote, setOrderNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderInfo, setOrderInfo] = useState(null);

  const PAKISTAN_PROVINCES = [
    'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 
    'Islamabad Capital Territory', 'Gilgit-Baltistan', 'Azad Kashmir'
  ];

  const PAKISTAN_CITIES = {
    'Punjab': [
      'Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur', 'Sargodha',
      'Gujrat', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Sahiwal', 'Okara', 'Wah Cantonment', 
      'Kasur', 'Dera Ghazi Khan', 'Chiniot', 'Kamoke', 'Hafizabad', 'Sadiqabad', 'Burewala', 
      'Khanewal', 'Muzaffargarh', 'Jhelum', 'Muridke', 'Bhakkar', 'Chishtian', 'Daska', 
      'Mandi Bahauddin', 'Ahmadpur East', 'Vehari', 'Pattoki', 'Chakwal', 'Khushab', 'Mianwali'
    ],
    'Sindh': [
      'Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah', 'Mirpur Khas', 'Mirpur Mathelo',
      'Jacobabad', 'Shikarpur', 'Khairpur', 'Tharparkar', 'Thatta', 'Badin', 'Dadu', 
      'Ghotki', 'Kashmore', 'Tando Adam', 'Tando Allahyar', 'Kotri', 'Moro', 'Umerkot'
    ],
    'Khyber Pakhtunkhwa': [
      'Peshawar', 'Mardan', 'Abbottabad', 'Swat', 'Kohat', 'Dera Ismail Khan', 'Nowshera', 
      'Mansehra', 'Charsadda', 'Swabi', 'Chakdara', 'Lower Dir', 'Upper Dir', 'Bannu', 
      'Haripur', 'Karak', 'Lakki Marwat', 'Malakand', 'Shangla', 'Tank'
    ],
    'Balochistan': [
      'Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Hub', 'Chaman', 'Zhob', 'Sibi', 'Pishin', 
      'Loralai', 'Dera Murad Jamali', 'Panjgur', 'Kharan', 'Nushki', 'Kalat', 'Mastung'
    ],
    'Islamabad Capital Territory': ['Islamabad'],
    'Gilgit-Baltistan': [
      'Gilgit', 'Skardu', 'Hunza', 'Diamer', 'Ghanche', 'Ghizer', 'Astore', 'Nagar', 'Kharmang', 'Shigar'
    ],
    'Azad Kashmir': [
      'Muzaffarabad', 'Mirpur', 'Rawalakot', 'Kotli', 'Bhimber', 'Bagh', 'Sudhanoti', 'Hattian Bala', 'Haveli', 'Neelum'
    ]
  };

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
      const address = `${streetAddress}${apartment ? ', ' + apartment : ''}, ${area ? area + ', ' : ''}${city}, ${province}, ${postcode}, ${country}`;
      
      const res = await axios.post(apiUrl('/api/orders'), {
        customer: { fullName, email, phone, address, note: orderNote },
        items: cartItems,
        paymentMethod,
        paymentDetails: paymentMethod === 'card' ? { cardNumber, expiry, cvv } : undefined,
      });
      
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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="bg-white border border-neutral-100 p-12 sm:p-20 text-center space-y-12 rounded-[3rem] shadow-2xl shadow-[#0b2a3d]/5">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 mb-8 border border-green-100">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-[#0b2a3d] uppercase">Order Received</h2>
              <div className="h-px w-16 bg-gold mx-auto" />
              <p className="text-[#0b2a3d]/50 font-medium italic text-xl max-w-xl mx-auto leading-relaxed">
                "Thank you for choosing LIBBAAS. Your exquisite pieces are being curated and prepared for delivery."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-12 py-12 border-y border-neutral-50 max-w-lg mx-auto">
              <div className="text-center space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-300 font-bold">Reference ID</p>
                <p className="text-sm font-bold text-[#0b2a3d] tracking-widest">{orderInfo?.orderId}</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-300 font-bold">Status</p>
                <p className="text-sm font-bold text-gold uppercase tracking-[0.4em]">Processing</p>
              </div>
            </div>
            <div className="space-y-8 pt-8">
              <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest leading-loose">
                A confirmation concierge email has been sent to <br/>
                <span className="text-[#0b2a3d] font-bold border-b border-gold/30">{email}</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/account" className="bg-[#0b2a3d] text-white px-16 py-6 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-gold transition-all duration-700 rounded-full shadow-2xl">
                  Track Concierge
                </Link>
                <Link to="/shop" className="border border-[#0b2a3d]/10 text-[#0b2a3d] px-16 py-6 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-neutral-50 transition-all duration-700 rounded-full">
                  Return to Boutique
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 py-32">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-20">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 text-gold">
            <div className="w-12 h-px bg-gold" />
            <span className="text-[10px] font-bold tracking-[0.6em] uppercase">Private & Secure</span>
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-[#0b2a3d] uppercase">Checkout</h1>
        </div>
        <button onClick={() => navigate(-1)} className="group flex items-center gap-4 text-[#0b2a3d]/40 hover:text-[#0b2a3d] transition-all duration-500 text-[10px] font-bold tracking-[0.4em] uppercase border-b border-[#0b2a3d]/10 pb-2">
          <ArrowLeft size={14} className="group-hover:-translate-x-2 transition-transform duration-500" /> Back to Boutique
        </button>
      </div>

      <form onSubmit={handlePay} className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-7 space-y-20">
          <section className="space-y-12">
            <div className="flex items-center gap-6">
              <span className="w-10 h-10 rounded-full bg-[#0b2a3d] text-white flex items-center justify-center text-[12px] font-bold shadow-xl">1</span>
              <h2 className="text-2xl font-serif tracking-[0.1em] uppercase text-[#0b2a3d]">Delivery Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">First Name</label>
                <input required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5" placeholder="e.g. Ayesha" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">Last Name</label>
                <input required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5" placeholder="e.g. Khan" />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">Concierge Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5" placeholder="ayesha.khan@example.pk" />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">Mobile Number (Pakistan Only)</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5" placeholder="+92 300 1234567" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">Province</label>
                <select required value={province} onChange={e => { setProvince(e.target.value); setCity(''); }} className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5 appearance-none cursor-pointer">
                  <option value="">Select Province</option>
                  {PAKISTAN_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">City</label>
                <select required disabled={!province} value={city} onChange={e => setCity(e.target.value)} className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5 appearance-none cursor-pointer disabled:opacity-50">
                  <option value="">Select City</option>
                  {province && PAKISTAN_CITIES[province]?.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">Area / Landmark (Optional)</label>
                <input value={area} onChange={e => setArea(e.target.value)} className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5" placeholder="e.g. DHA Phase 5 / Gulberg III / Near Liberty" />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">Street Address</label>
                <input required value={streetAddress} onChange={e => setStreetAddress(e.target.value)} placeholder="House / Apartment #, Street Name" className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0b2a3d]/40 ml-1">Postcode / ZIP</label>
                <input required value={postcode} onChange={e => setPostcode(e.target.value)} className="w-full px-8 py-5 bg-white border border-neutral-100 focus:border-gold outline-none transition-all duration-500 text-xs rounded-2xl shadow-xl shadow-[#0b2a3d]/5" placeholder="e.g. 54000" />
              </div>
            </div>
          </section>

          <section className="space-y-12">
            <div className="flex items-center gap-6">
              <span className="w-10 h-10 rounded-full bg-[#0b2a3d] text-white flex items-center justify-center text-[12px] font-bold shadow-xl">2</span>
              <h2 className="text-2xl font-serif tracking-[0.1em] uppercase text-[#0b2a3d]">Secure Payment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button type="button" onClick={() => setPaymentMethod('cash')} className={`flex flex-col p-10 border transition-all duration-700 rounded-[2rem] text-left gap-6 ${paymentMethod === 'cash' ? 'border-gold bg-neutral-50 shadow-2xl shadow-[#0b2a3d]/5' : 'border-neutral-100 opacity-40 hover:opacity-100'}`}>
                <div className="flex items-center justify-between w-full">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cash' ? 'border-gold' : 'border-neutral-200'}`}>
                    {paymentMethod === 'cash' && <div className="w-3 h-3 rounded-full bg-gold" />}
                  </div>
                  <Truck size={24} className={paymentMethod === 'cash' ? 'text-gold' : 'text-neutral-200'} />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-[#0b2a3d] mb-2">Cash on Delivery</p>
                  <p className="text-[9px] text-[#0b2a3d]/40 font-medium uppercase tracking-[0.2em] leading-relaxed">Available nationwide across Pakistan</p>
                </div>
              </button>
              <button type="button" className="flex flex-col p-10 border border-neutral-100 opacity-30 cursor-not-allowed rounded-[2rem] text-left gap-6 bg-neutral-50/30 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4"><span className="text-[8px] font-bold text-gold uppercase tracking-[0.3em] italic">Coming Soon</span></div>
                <div className="flex items-center justify-between w-full">
                  <div className="w-6 h-6 rounded-full border-2 border-neutral-200" />
                  <CreditCard size={24} className="text-neutral-200" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-neutral-300 mb-2">Card / Bank Transfer</p>
                  <p className="text-[9px] text-neutral-300 font-medium uppercase tracking-[0.2em] leading-relaxed">Direct payment reward: 7% Off</p>
                </div>
              </button>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-[#0b2a3d] rounded-[3rem] p-12 text-white shadow-[0_50px_100px_rgba(11,42,61,0.2)] space-y-10 sticky top-32 border border-white/5">
            <h2 className="text-2xl font-serif tracking-[0.1em] uppercase border-b border-white/5 pb-8">Your Order</h2>
            <div className="max-h-[350px] overflow-y-auto pr-6 space-y-8 custom-scrollbar">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex gap-6 group">
                  <div className="w-20 h-24 bg-white/5 border border-white/10 rounded-2xl overflow-hidden shrink-0 transition-transform duration-500 group-hover:scale-105">
                    <img src={item.image} className="w-full h-full object-cover opacity-90" alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] line-clamp-1">{item.name}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-medium">{item.selectedColor} • {item.selectedSize} <span className="mx-2 text-gold/30">•</span> x{item.quantity}</p>
                    <p className="text-lg font-serif text-gold">Rs {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6 pt-10 border-t border-white/5">
              <div className="flex justify-between text-[11px] tracking-[0.3em] uppercase text-white/40 font-bold"><span>Subtotal</span><span className="text-white">Rs {cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-[11px] tracking-[0.3em] uppercase text-white/40 font-bold"><span>Shipping</span><span className="text-gold italic">Complimentary</span></div>
              <div className="pt-8 border-t border-white/10">
                <div className="flex justify-between items-end mb-10">
                  <div className="space-y-2"><span className="text-[10px] tracking-[0.5em] uppercase font-bold text-white/30">Total Value</span><p className="text-[8px] text-gold uppercase tracking-[0.3em] italic">Inc. Premium Packaging</p></div>
                  <span className="text-4xl font-serif text-white">Rs {total.toLocaleString()}</span>
                </div>
                {error && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-[9px] font-bold tracking-[0.3em] uppercase text-center rounded-xl mb-6">{error}</motion.div>}
                <button disabled={isSubmitting || cartItems.length === 0} className="w-full bg-gold text-[#0b2a3d] py-6 rounded-2xl text-[11px] font-bold tracking-[0.5em] uppercase hover:bg-white transition-all duration-700 shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4">
                  {isSubmitting ? <div className="w-5 h-5 border-2 border-[#0b2a3d] border-t-transparent rounded-full animate-spin" /> : <>{'Confirm Order'} <ChevronRight size={14} /></>}
                </button>
              </div>
            </div>
            <div className="pt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 text-[9px] tracking-[0.4em] uppercase text-white/20 font-bold"><ShieldCheck size={14} className="text-gold/50" /><span>SSL Encrypted Transaction</span></div>
              <p className="text-[8px] text-white/10 uppercase tracking-[0.2em] text-center max-w-xs mx-auto">By placing your order, you agree to our terms of service and private boutique policy.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
