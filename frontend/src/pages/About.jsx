import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Star, Sparkles } from 'lucide-react';

const About = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: 'easeOut' },
  };

  return (
    <div className="pb-32">
      <section className="relative h-[42vh] flex items-center justify-center overflow-hidden bg-[#0b2a3d]">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-[#0b2a3d]/85 z-10" />
          <img
            src="/imags/banner-fashion.jpg"
            alt="About LIBBAAS"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 text-center px-4 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-gold tracking-[0.6em] uppercase text-[10px] font-bold block mb-2">Rise Above Extraordinary</span>
            <h1 className="text-4xl sm:text-6xl font-serif tracking-[0.1em] uppercase text-white">About Libbaas</h1>
            <div className="h-px w-12 bg-gold/50 mx-auto mt-6" />
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <div className="flex items-center gap-3 text-gold">
              <div className="w-12 h-px bg-gold" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase">About Us</span>
            </div>
            <h2 className="text-4xl font-serif tracking-tight text-[#0b2a3d] leading-tight">Rise Above Extraordinary.</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              Founded in 2026 by Arslan and Hassam, Libbaas was born from a vision to redefine the way people experience fashion.
            </p>
            <p className="text-gray-600 font-light leading-relaxed">
              We believe that fashion is more than just what you wear. It&apos;s about confidence, individuality, and the identity you carry.
            </p>
            <p className="text-gray-600 font-light leading-relaxed">
              At Libbaas, our mission is to bring you premium-quality products, modern styles, and exceptional value at affordable prices. We believe everyone deserves to experience premium quality without having to pay a premium price.
            </p>
            <p className="text-gray-600 font-light leading-relaxed">
              We are not just building an online store; we are building a brand where quality meets affordability, style meets confidence, and every individual has the freedom to express their identity.
            </p>
            <p className="text-gray-600 font-light leading-relaxed">
              Our commitment is simple: deliver value beyond expectations and help you feel confident in everything you wear.
            </p>
            <p className="text-[#0b2a3d] font-serif text-xl italic">
              This is Libbaas. This is your identity. Rise Above Extraordinary.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { name: 'Arslan', role: 'Co-Founder', img: '/imags/founder-arslan.jpg' },
              { name: 'Hassam', role: 'Co-Founder', img: '/imags/founder-hassam.jpg' },
            ].map((person) => (
              <div key={person.name} className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-xl bg-neutral-100">
                  <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-serif text-[#0b2a3d]">{person.name}</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{person.role}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#fcfaf7] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div {...fadeInUp} className="text-center space-y-4">
            <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase">Our Story</span>
            <h2 className="text-4xl font-serif tracking-tight text-[#0b2a3d]">Libbaas — Rise Above Extraordinary.</h2>
          </motion.div>
          <motion.div {...fadeInUp} className="space-y-6 text-gray-600 font-light leading-relaxed text-base md:text-lg">
            <p>
              Every great journey begins with a vision. Ours began with two friends, Arslan and Hassam, who shared a common ambition: to build something meaningful, something that goes beyond ordinary fashion.
            </p>
            <p>
              Founded in 2026, Libbaas was created with a simple belief: premium quality and great style should be accessible to everyone. We believe that what you wear is more than just clothing — it&apos;s an expression of your personality, confidence, and identity.
            </p>
            <p>
              Our purpose is not simply to sell products. It&apos;s to deliver value, build trust, and create an experience where every customer feels confident in their choices. That&apos;s why we focus on bringing together premium quality, contemporary style, and affordability without compromising on what matters most.
            </p>
            <p>
              Today, Libbaas begins its journey as an online fashion destination, but our vision reaches much further. We aspire to grow beyond borders, establish a strong global presence, and become a brand recognized for its quality, values, and identity.
            </p>
            <p>
              We know that building something great takes time, dedication, and consistency. Every order, every customer, and every step forward brings us closer to that vision.
            </p>
            <p>
              We are not just building a store. We are building a brand, a community, and an identity.
            </p>
            <p className="text-[#0b2a3d] font-serif text-xl italic text-center pt-4">
              Libbaas — Rise Above Extraordinary.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 space-y-4">
          <span className="text-gold text-[10px] font-bold tracking-[0.4em] uppercase">The Libbaas Promise</span>
          <h2 className="text-4xl font-serif tracking-tight text-[#0b2a3d]">Our Core Values</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { icon: Sparkles, title: 'Premium Quality', desc: 'Thoughtfully selected products with modern style and lasting value.' },
            { icon: ShieldCheck, title: 'Affordable Luxury', desc: 'Premium quality without the premium price tag.' },
            { icon: Heart, title: 'Confidence', desc: 'Fashion that helps you express your individuality and identity.' },
            { icon: Star, title: 'Trust', desc: 'Value beyond expectations — every order, every time.' },
          ].map((value, idx) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 text-center space-y-6 border border-neutral-100"
            >
              <div className="w-16 h-16 bg-secondary flex items-center justify-center mx-auto rounded-2xl text-gold">
                <value.icon size={28} />
              </div>
              <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-[#0b2a3d]">{value.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-light">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 text-center py-16 space-y-12">
        <motion.div {...fadeInUp} className="space-y-6">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight text-[#0b2a3d]">Rise Above Extraordinary</h2>
          <p className="text-gray-500 text-lg font-light italic leading-relaxed">
            Discover fashion that builds confidence — premium style, exceptional value, your identity.
          </p>
        </motion.div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <a href="/shop" className="bg-[#0b2a3d] text-white px-16 py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-gold transition-all duration-500 shadow-xl">
            Explore Shop
          </a>
          <a href="/contact" className="border border-[#0b2a3d] text-[#0b2a3d] px-16 py-5 text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-[#0b2a3d] hover:text-white transition-all duration-500">
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
