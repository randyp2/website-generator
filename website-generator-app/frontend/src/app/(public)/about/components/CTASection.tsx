"use client";

import React from "react";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";

export const CTASection: React.FC = () => {
  const router = useRouter();
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden bg-linear-to-r from-cyan-500 to-teal-600 rounded-3xl p-12 shadow-2xl text-center text-white">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-cyan-50 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have already created their
              portfolios with PortfolioAI.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="px-10 py-4 bg-white text-cyan-600 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-shadow inline-flex items-center gap-2"
            >
              Create Your Portfolio
              <FiArrowRight />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
};
