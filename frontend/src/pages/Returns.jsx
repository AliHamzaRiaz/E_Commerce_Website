import React from 'react';
import { motion } from 'framer-motion';

const Returns = () => {
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
            Returns & Exchanges
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-serif text-[#0b2a3d] mb-8">Our Return Policy</h2>
          
          <div className="space-y-8">
            <p className="text-sm leading-relaxed text-[#0b2a3d]/80">
              At LIBBAAS, we want you to feel absolutely thrilled with your purchase. If for any reason you are not completely satisfied, we're here to help.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px]">Eligibility Criteria</h3>
              <ul className="list-disc list-inside text-sm text-[#0b2a3d]/80 space-y-2">
                <li>Items must be returned within 14 days from the date of delivery.</li>
                <li>Items must be in their original condition, unworn, unwashed, and with all tags attached.</li>
                <li>Items must be returned in their original packaging.</li>
                <li>Sale items are final and cannot be returned or exchanged.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px]">How to Return</h3>
              <ol className="list-decimal list-inside text-sm text-[#0b2a3d]/80 space-y-2">
                <li>Contact our customer service team to initiate your return.</li>
                <li>Pack your items securely in the original packaging.</li>
                <li>Ship the items back to us using a trackable shipping method.</li>
                <li>Once we receive and inspect your return, we will process your refund or exchange.</li>
              </ol>
            </div>

            <div className="border-t border-neutral-100 pt-8 mt-8">
              <h3 className="text-lg font-bold text-[#0b2a3d] uppercase tracking-[0.2em] text-[11px] mb-6">Need Help?</h3>
              <p className="text-sm text-[#0b2a3d]/80 mb-6">
                If you have any questions about your return or need further assistance, our team is available 24/7 to help you:
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

export default Returns;
