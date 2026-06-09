import React from 'react';
import { Instagram, Facebook, Twitter, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-neutral-100 pt-24 pb-12 overflow-hidden">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Brand Identity */}
          <div className="lg:col-span-4 space-y-10">
            <Link to="/" className="flex flex-col group">
              <div className="flex items-center gap-4 mb-2">
                <img 
                  src="/imags/logo.png" 
                  alt="LIBBAAS" 
                  className="h-14 w-auto object-contain transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <h2 className="text-3xl font-serif tracking-[0.3em] uppercase text-[#0b2a3d] font-bold">LIBBAAS</h2>
              </div>
              <span className="text-[8px] tracking-[0.6em] uppercase text-gold font-bold opacity-80">Premium Lingerie Destination</span>
            </Link>
            
            <p className="text-[#0b2a3d]/60 text-sm leading-relaxed max-w-sm font-medium">
              Redefining luxury through invisible elegance. Our collections are crafted for the sophisticated woman who values both exquisite design and unparalleled comfort.
            </p>

            <div className="flex items-center gap-6">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' }
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  whileHover={{ y: -5, color: '#c5a059' }}
                  className="p-3 bg-neutral-50 rounded-full text-[#0b2a3d]/40 hover:bg-gold/5 transition-colors duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={20} strokeWidth={1.5} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gold">Boutique</h3>
              <ul className="space-y-4">
                {['New Arrivals', 'Best Sellers', 'Collections', 'Sale'].map(item => (
                  <li key={item}>
                    <Link to="/shop" className="text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/70 hover:text-gold transition-colors inline-flex items-center group">
                      {item}
                      <ExternalLink size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gold">Company</h3>
              <ul className="space-y-4">
                {['Our Story', 'Craftsmanship', 'Contact', 'Journal'].map(item => (
                  <li key={item}>
                    <Link to={item === 'Contact' ? '/contact' : '/about'} className="text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/70 hover:text-gold transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gold">Support</h3>
              <ul className="space-y-4">
                {['Shipping', 'Returns', 'Size Guide', 'FAQ'].map(item => (
                  <li key={item}>
                    <button className="text-[11px] font-bold uppercase tracking-widest text-[#0b2a3d]/70 hover:text-gold transition-colors text-left">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="lg:col-span-3 space-y-10">
            <div className="space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-gold">Get in Touch</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4 text-[#0b2a3d]/70 group">
                  <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
                  <span className="text-xs font-medium leading-relaxed">Liberty Market, Gulberg III,<br/>Lahore, Pakistan</span>
                </li>
                <li className="flex items-center gap-4 text-[#0b2a3d]/70 group">
                  <Phone size={18} className="text-gold shrink-0" />
                  <span className="text-xs font-medium">+92 313 7812008</span>
                </li>
                <li className="flex items-center gap-4 text-[#0b2a3d]/70 group">
                  <Mail size={18} className="text-gold shrink-0" />
                  <span className="text-xs font-medium">concierge@libbaas.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-12 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] tracking-[0.4em] uppercase font-bold text-[#0b2a3d]/30">
            &copy; {currentYear} LIBBAAS LUXE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-8">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <button key={item} className="text-[9px] tracking-[0.2em] uppercase font-bold text-[#0b2a3d]/30 hover:text-gold transition-colors">
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-6 w-10 bg-neutral-50 rounded flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
              <span className="text-[6px] font-black uppercase tracking-tighter">VISA</span>
            </div>
            <div className="h-6 w-10 bg-neutral-50 rounded flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
              <span className="text-[6px] font-black uppercase tracking-tighter">MC</span>
            </div>
            <div className="h-6 w-10 bg-neutral-50 rounded flex items-center justify-center opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
              <span className="text-[6px] font-black uppercase tracking-tighter">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
