import React from 'react';
import { motion } from 'framer-motion';

const SizeGuide = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-[#fcfcfc] py-20"
    >
      {/* Hero Section */}
      <section className="relative h-[30vh] flex items-center justify-center bg-[#0b2a3d] mb-16">
        <div className="text-center px-4 space-y-4">
          <span className="text-gold tracking-[0.6em] uppercase text-[10px] font-bold block mb-2">Fit Guide</span>
          <h1 className="text-4xl sm:text-6xl font-serif tracking-[0.1em] uppercase text-white">
            Size Guide
          </h1>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-serif text-[#0b2a3d] mb-8">Women's Undergarment Size Guide</h2>
          
          <div className="space-y-12">
            <p className="text-sm leading-relaxed text-[#0b2a3d]/80">
              Finding your perfect fit is important to us! Below is our general size guide for all women's undergarments. If you need personalized assistance, please contact us.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="border border-neutral-100 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gold">Size</th>
                    <th className="border border-neutral-100 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gold">Bust (inches)</th>
                    <th className="border border-neutral-100 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gold">Waist (inches)</th>
                    <th className="border border-neutral-100 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gold">Hip (inches)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-neutral-50 transition-colors">
                    <td className="border border-neutral-100 px-4 py-3 font-medium text-[#0b2a3d]">XS</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">30-32</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">23-25</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">33-35</td>
                  </tr>
                  <tr className="hover:bg-neutral-50 transition-colors">
                    <td className="border border-neutral-100 px-4 py-3 font-medium text-[#0b2a3d]">S</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">32-34</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">25-27</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">35-37</td>
                  </tr>
                  <tr className="hover:bg-neutral-50 transition-colors">
                    <td className="border border-neutral-100 px-4 py-3 font-medium text-[#0b2a3d]">M</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">34-36</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">27-29</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">37-39</td>
                  </tr>
                  <tr className="hover:bg-neutral-50 transition-colors">
                    <td className="border border-neutral-100 px-4 py-3 font-medium text-[#0b2a3d]">L</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">36-38</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">29-31</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">39-41</td>
                  </tr>
                  <tr className="hover:bg-neutral-50 transition-colors">
                    <td className="border border-neutral-100 px-4 py-3 font-medium text-[#0b2a3d]">XL</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">38-40</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">31-33</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">41-43</td>
                  </tr>
                  <tr className="hover:bg-neutral-50 transition-colors">
                    <td className="border border-neutral-100 px-4 py-3 font-medium text-[#0b2a3d]">XXL</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">40-42</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">33-35</td>
                    <td className="border border-neutral-100 px-4 py-3 text-[#0b2a3d]/80">43-45</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border-t border-neutral-100 pt-8 mt-8">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px] mb-6">How to Measure</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-[#0b2a3d]">Bust</p>
                  <p className="text-sm text-[#0b2a3d]/80">
                    Measure around the fullest part of your bust, keeping the measuring tape level.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-[#0b2a3d]">Waist</p>
                  <p className="text-sm text-[#0b2a3d]/80">
                    Measure around your natural waistline, the narrowest part of your torso.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-[#0b2a3d]">Hip</p>
                  <p className="text-sm text-[#0b2a3d]/80">
                    Measure around the fullest part of your hips, about 8 inches below your waist.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-8 mt-8">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px] mb-6">Need Personalized Help?</h3>
              <p className="text-sm text-[#0b2a3d]/80 mb-4">
                If you need help finding your perfect size, please reach out to us:
              </p>
              <div className="space-y-3">
                <p className="text-sm font-medium text-[#0b2a3d]">
                  Email us at: <a href="mailto:libbaasbyjh@gmail.com" className="text-gold hover:underline">libbaasbyjh@gmail.com</a>
                </p>
                <p className="text-sm font-medium text-[#0b2a3d]">
                  Contact us on WhatsApp at: <a href="https://wa.me/923187327773" className="text-gold hover:underline">+92 318 7327773</a> (24/7)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SizeGuide;
