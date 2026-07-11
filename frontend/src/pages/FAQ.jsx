import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
  {
    question: "What is your shipping policy?",
    answer: "We offer free shipping on all orders over PKR 3,000. Orders are typically processed within 1-2 business days and delivered within 3-5 business days across Pakistan."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order has been shipped, you will receive an email with a tracking number and a link to track your package."
  },
  {
    question: "Can I modify or cancel my order?",
    answer: "You can modify or cancel your order within 1 hour of placing it. Please contact our customer service team immediately for assistance."
  },
  {
    question: "What is your return policy?",
    answer: "We accept returns within 14 days of delivery for unworn items with tags attached. Sale items are final and cannot be returned or exchanged."
  },
  {
    question: "How do I care for my LIBBAAS garments?",
    answer: "We recommend hand-washing your LIBBAAS garments in cold water and laying them flat to dry. Please refer to the care label on each item for specific instructions."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within Pakistan. We are working on expanding our shipping options internationally soon!"
  },
  {
    question: "How can I contact customer service?",
    answer: "You can reach us 24/7 via email at libbaasbyjh@gmail.com or via WhatsApp at +92 318 7327773."
  },
  {
    question: "Do you have a physical store?",
    answer: "Yes! Our flagship store is located at C-II Block C 2 Phase 1 Johar Town, Lahore, 54770. We'd love to see you!"
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          <span className="text-gold tracking-[0.6em] uppercase text-[10px] font-bold block mb-2">Support</span>
          <h1 className="text-4xl sm:text-6xl font-serif tracking-[0.1em] uppercase text-white">
            Frequently Asked Questions
          </h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="bg-white border border-neutral-100 rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <h2 className="text-2xl font-serif text-[#0b2a3d] mb-12 text-center">We've Got Answers</h2>

          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div
                key={index}
                className="border border-neutral-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left bg-white hover:bg-neutral-50 transition-colors"
                >
                  <h3 className="text-sm font-bold text-[#0b2a3d] uppercase tracking-widest">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp size={16} className="text-gold shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gold shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-sm text-[#0b2a3d]/80 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-100 pt-8 mt-12 text-center">
            <p className="text-sm text-[#0b2a3d]/80 mb-4">Still have questions?</p>
            <p className="text-sm font-medium text-[#0b2a3d] mb-2">
              Email us at: <a href="mailto:libbaasbyjh@gmail.com" className="text-gold hover:underline">libbaasbyjh@gmail.com</a>
            </p>
            <p className="text-sm font-medium text-[#0b2a3d]">
              Contact us on WhatsApp at: <a href="https://wa.me/923187327773" className="text-gold hover:underline">+92 318 7327773</a> (24/7)
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQ;
