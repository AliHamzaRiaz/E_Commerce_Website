import React from 'react';
import { motion } from 'framer-motion';

const Shipping = () => {
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
          <span className="text-gold tracking-[0.6em] uppercase text-[10px] font-bold block mb-2">Policy</span>
          <h1 className="text-4xl sm:text-6xl font-serif tracking-[0.1em] uppercase text-white">
            Shipping Policy
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-serif text-[#0b2a3d] mb-8">Shipping Information</h2>
          
          <div className="space-y-8">
            <p className="text-sm leading-relaxed text-[#0b2a3d]/80">
              We are committed to delivering your LIBBAAS pieces with care and efficiency. Here's everything you need to know about our shipping process.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px]">Shipping Rates & Delivery Times</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-neutral-100 rounded-xl bg-neutral-50">
                  <p className="text-sm font-bold text-[#0b2a3d] mb-2">Standard Shipping</p>
                  <p className="text-sm text-[#0b2a3d]/80">
                    Free on orders over PKR 3,000<br/>
                    Delivery in 3-5 business days<br/>
                    PKR 150 flat rate for orders under PKR 3,000
                  </p>
                </div>
                <div className="p-6 border border-neutral-100 rounded-xl bg-neutral-50">
                  <p className="text-sm font-bold text-[#0b2a3d] mb-2">Express Shipping</p>
                  <p className="text-sm text-[#0b2a3d]/80">
                    PKR 300 flat rate<br/>
                    Delivery in 1-2 business days
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px]">Processing Time</h3>
              <p className="text-sm text-[#0b2a3d]/80">
                Orders are processed within 1-2 business days (excluding weekends and public holidays). You will receive a confirmation email once your order has been shipped.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px]">Track Your Order</h3>
              <p className="text-sm text-[#0b2a3d]/80">
                Once your order is shipped, you will receive an email with a tracking number and a link to track your package in real-time.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px]">International Shipping</h3>
              <p className="text-sm text-[#0b2a3d]/80">
                Currently, we only ship within Pakistan. We are working hard to expand our shipping options internationally in the near future!
              </p>
            </div>

            <div className="border-t border-neutral-100 pt-8 mt-8">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px] mb-6">Need Help?</h3>
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

export default Shipping;
