import React from 'react';
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-100 pt-12 sm:pt-16 lg:pt-24 pb-8 sm:pb-10 lg:pb-12 overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-16 mb-12 sm:mb-16 lg:mb-24">
          
          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8 lg:space-y-10">
            <Link to="/" className="inline-flex flex-col group">
              <div className="bg-black rounded-xl p-3 sm:p-4 w-fit shadow-sm border border-black/10">
                <img
                  src="/imags/logo.png"
                  alt="LIBBAAS.com — Rise Above Extraordinary"
                  className="h-20 sm:h-24 lg:h-28 w-auto object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <span className="mt-3 text-[8px] sm:text-[9px] tracking-[0.35em] uppercase text-[#b38728] font-semibold">
                Rise Above Extraordinary
              </span>
            </Link>
            
            <p className="text-[#0b2a3d]/60 text-xs sm:text-sm leading-relaxed max-w-sm font-medium">
              Premium-quality fashion, modern styles, and exceptional value — built by Arslan and Hassam in 2026.
            </p>

            <div className="flex items-center gap-4 sm:gap-6">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' }
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  whileHover={{ y: -5, color: '#c5a059' }}
                  className="p-2.5 sm:p-3 bg-neutral-50 rounded-full text-[#0b2a3d]/40 hover:bg-gold/5 transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={16} sm:size={20} strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-8">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-gold">Boutique</h3>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                {['New Arrivals', 'Best Sellers', 'Collections', 'Sale'].map(item => (
                  <li key={item}>
                    <Link to="/shop" className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/70 hover:text-gold transition-colors inline-flex items-center group">
                      {item}
                      <ExternalLink size={9} sm:size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-gold">Company</h3>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                {[
                  { name: 'Our Story', path: '/about' },
                  { name: 'Contact', path: '/contact' },
                  { name: 'FAQ', path: '/faq' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/70 hover:text-gold transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-gold">Support</h3>
              <ul className="space-y-2 sm:space-y-3 lg:space-y-4">
                {[
                  { name: 'Shipping', path: '/shipping' },
                  { name: 'Returns', path: '/returns' },
                  { name: 'Size Guide', path: '/size-guide' },
                  { name: 'FAQ', path: '/faq' }
                ].map(item => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/70 hover:text-gold transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-3 space-y-6 sm:space-y-8 lg:space-y-10">
            <div className="space-y-6">
              <h3 className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] uppercase text-gold">Get in Touch</h3>
              <ul className="space-y-4 sm:space-y-6">
                <li className="flex items-start gap-3 sm:gap-4 text-[#0b2a3d]/70 group">
                  <MapPin size={16} sm:size={18} className="text-gold shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-xs font-medium leading-relaxed">Online store only — outlets coming soon</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4 text-[#0b2a3d]/70 group">
                  <Phone size={16} sm:size={18} className="text-gold shrink-0" />
                  <span className="text-xs sm:text-xs font-medium">0316 4314464</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4 text-[#0b2a3d]/70 group">
                  <Mail size={16} sm:size={18} className="text-gold shrink-0" />
                  <span className="text-xs sm:text-xs font-medium">libbaasbyjh@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 sm:pt-10 lg:pt-12 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
          <p className="text-[8px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] uppercase font-bold text-[#0b2a3d]/30">
            &copy; {currentYear} LIBBAAS LUXE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-wrap justify-center">
            {['Privacy Policy', 'Terms', 'Cookies'].map(item => (
              <button key={item} className="text-[8px] sm:text-[9px] tracking-[0.2em] uppercase font-bold text-[#0b2a3d]/30 hover:text-gold transition-colors">
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-5 sm:h-6 w-9 sm:w-10 bg-neutral-50 rounded flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
              <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-tighter">VISA</span>
            </div>
            <div className="h-5 sm:h-6 w-9 sm:w-10 bg-neutral-50 rounded flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
              <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-tighter">MC</span>
            </div>
            <div className="h-5 sm:h-6 w-9 sm:w-10 bg-neutral-50 rounded flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
              <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-tighter">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
