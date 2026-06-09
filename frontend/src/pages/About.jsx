import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Star, Sparkles } from 'lucide-react';

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="pb-32">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-[#0b2a3d]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0b2a3d]/60 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1620121692029-d088224efc74?auto=format&fit=crop&q=80&w=2000" 
            alt="About LIBBAAS"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=2000";
            }}
          />
        </div>
        
        <div className="relative z-10 text-center space-y-6 px-4">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-gold tracking-[0.6em] uppercase text-xs font-bold block"
          >
            Our Story
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-4xl sm:text-6xl md:text-7xl font-serif tracking-widest uppercase text-white"
          >
            Sophistication <span className="text-gold italic">Redefined</span>
          </motion.h1>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <div className="flex items-center gap-3 text-gold">
              <div className="w-12 h-px bg-gold" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Philosophy</span>
            </div>
            <h2 className="text-4xl font-serif tracking-tight text-[#0b2a3d] leading-tight">
              Crafting Confidence Through <br/> Timeless Elegance
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg font-light italic">
              "LIBBAAS was born from a simple belief: that luxury should be felt as much as it is seen. We specialize in creating intimate apparel that empowers the modern woman to embrace her strength and beauty."
            </p>
            <div className="space-y-6 text-gray-600 font-light leading-relaxed">
              <p>
                Every piece in our collection is a testament to our commitment to excellence. We source only the finest silks from the Orient and the most delicate laces from Europe, ensuring that every stitch serves a purpose.
              </p>
              <p>
                Our designers blend traditional craftsmanship with contemporary silhouettes, creating pieces that are not just garments, but wearable art designed to last a lifetime.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden shadow-2xl rounded-2xl">
              <img 
                src="https://images.unsplash.com/photo-1590509835484-4efbf094e9d3?auto=format&fit=crop&q=80&w=2000" 
                alt="Craftsmanship"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1594432242750-f8f9e68e4c7d?auto=format&fit=crop&q=80&w=2000";
                }}
              />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-white p-10 shadow-xl rounded-2xl hidden md:block border border-neutral-100">
              <p className="text-gold font-serif text-4xl mb-2">100%</p>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0b2a3d]">Premium Silk</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-[#fcfaf7] py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 space-y-4">
            <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase">The Libbaas Promise</span>
            <h2 className="text-4xl font-serif tracking-tight text-[#0b2a3d]">Our Core Values</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Sparkles, title: "Unrivaled Quality", desc: "Meticulous attention to detail in every fiber and stitch." },
              { icon: ShieldCheck, title: "Authenticity", desc: "Genuine materials ethically sourced from around the world." },
              { icon: Heart, title: "Empowerment", desc: "Designed to make every woman feel confident in her own skin." },
              { icon: Star, title: "Exclusivity", desc: "Limited edition pieces that ensure your style remains unique." }
            ].map((value, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 text-center space-y-6"
              >
                <div className="w-16 h-16 bg-secondary flex items-center justify-center mx-auto rounded-2xl text-gold">
                  <value.icon size={28} />
                </div>
                <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-[#0b2a3d]">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-light">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 text-center py-32 space-y-12">
        <motion.div {...fadeInUp} className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-[#0b2a3d]">Experience the Luxury</h2>
          <p className="text-gray-500 text-lg font-light italic leading-relaxed">
            "Your journey towards timeless elegance starts here. Discover the collection that has redefined sophistication for women worldwide."
          </p>
        </motion.div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="/shop" className="bg-[#0b2a3d] text-white px-16 py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-gold transition-all duration-500 shadow-xl">Explore Shop</a>
          <a href="/contact" className="border border-[#0b2a3d] text-[#0b2a3d] px-16 py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-[#0b2a3d] hover:text-white transition-all duration-500">Contact Us</a>
        </div>
      </section>
    </div>
  );
};

export default About;
