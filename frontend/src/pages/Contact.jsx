import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, Globe, Instagram, Facebook, Twitter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#fcfcfc] pt-32 pb-24"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto mb-24">
          <div className="flex items-center justify-center gap-3 text-gold mb-6">
            <div className="w-12 h-px bg-gold" />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Connect With Us</span>
            <div className="w-12 h-px bg-gold" />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif tracking-tight text-[#0b2a3d] mb-8">
            Our Concierge is at <br/> Your Service
          </h1>
          <p className="text-[#0b2a3d]/60 text-sm leading-relaxed font-medium italic">
            "Whether you seek advice on sizing, styling, or have an inquiry about your order, our dedicated team is here to ensure your LIBBAAS experience is flawless."
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          {/* Left: Contact Information */}
          <motion.div variants={itemVariants} className="lg:col-span-4 space-y-16">
            <div className="space-y-12">
              <div className="space-y-8">
                <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gold">Contact Details</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 bg-white border border-neutral-100 rounded-full flex items-center justify-center text-[#0b2a3d] group-hover:bg-[#0b2a3d] group-hover:text-white transition-all duration-500 shadow-sm">
                      <Mail size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Email Inquiry</p>
                      <p className="text-sm font-bold text-[#0b2a3d] tracking-wide">concierge@libbaas.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 bg-white border border-neutral-100 rounded-full flex items-center justify-center text-[#0b2a3d] group-hover:bg-[#0b2a3d] group-hover:text-white transition-all duration-500 shadow-sm">
                      <Phone size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Personal Assistance</p>
                      <p className="text-sm font-bold text-[#0b2a3d] tracking-wide">+92 313 7812008</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 bg-white border border-neutral-100 rounded-full flex items-center justify-center text-[#0b2a3d] group-hover:bg-[#0b2a3d] group-hover:text-white transition-all duration-500 shadow-sm">
                      <MapPin size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Our Flagship</p>
                      <p className="text-sm font-bold text-[#0b2a3d] tracking-wide leading-relaxed">
                        Liberty Market, Gulberg III,<br/>Lahore, Pakistan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8 pt-8 border-t border-neutral-100">
                <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gold">Opening Hours</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/70">
                    <span>Monday — Friday</span>
                    <span>09:00 — 20:00</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/70">
                    <span>Saturday</span>
                    <span>10:00 — 18:00</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/30">
                    <span>Sunday</span>
                    <span>By Appointment</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-neutral-100">
                <div className="flex gap-6">
                  {[Instagram, Facebook, Twitter].map((Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      whileHover={{ y: -4, color: '#c5a059' }}
                      className="text-[#0b2a3d]/40 transition-colors"
                    >
                      <Icon size={20} strokeWidth={1.5} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div variants={itemVariants} className="lg:col-span-8">
            <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="py-20 text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Send size={32} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-3xl font-serif text-[#0b2a3d]">Message Received</h2>
                    <p className="text-neutral-400 text-sm max-w-sm mx-auto leading-relaxed">
                      Thank you for reaching out. Our concierge team will review your inquiry and contact you within 24 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-[10px] font-bold uppercase tracking-widest text-gold border-b border-gold/20 pb-1 hover:border-gold transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit} 
                    className="space-y-10"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Elizabeth Bennett"
                          className="w-full bg-neutral-50/50 border border-neutral-100 px-6 py-4 rounded-2xl focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-medium text-[#0b2a3d] placeholder:text-neutral-200"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="elizabeth@example.com"
                          className="w-full bg-neutral-50/50 border border-neutral-100 px-6 py-4 rounded-2xl focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-medium text-[#0b2a3d] placeholder:text-neutral-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Subject</label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full bg-neutral-50/50 border border-neutral-100 px-6 py-4 rounded-2xl focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-medium text-[#0b2a3d] appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a reason for contact</option>
                        <option value="order">Order Inquiry</option>
                        <option value="styling">Styling Advice</option>
                        <option value="sizing">Sizing Consultation</option>
                        <option value="returns">Returns & Exchanges</option>
                        <option value="press">Press & Media</option>
                        <option value="other">Other Inquiry</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 ml-1">Your Message</label>
                      <textarea
                        required
                        rows="5"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="How can our concierge assist you today?"
                        className="w-full bg-neutral-50/50 border border-neutral-100 px-6 py-4 rounded-2xl focus:outline-none focus:border-gold focus:bg-white transition-all text-sm font-medium text-[#0b2a3d] placeholder:text-neutral-200 resize-none"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-[#0b2a3d] text-white py-6 rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-gold hover:text-[#0b2a3d] transition-all duration-500 shadow-xl shadow-[#0b2a3d]/10 flex items-center justify-center gap-4 group"
                      >
                        Send Inquiry
                        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;

export default Contact;
