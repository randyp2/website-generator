"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import { FiArrowRight } from "react-icons/fi";

export const CTASection: React.FC = () => {
    const router = useRouter();

    return (
        <section className="mt-20 text-center">
          <div className="bg-linear-to-br from-cyan-50 to-teal-50 rounded-3xl p-12 border border-cyan-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Create Yours?
            </h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Choose any style and customize it to match your unique
              personality. Get started in minutes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="hover:cursor-pointer px-10 py-4 bg-linear-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-shadow inline-flex items-center gap-2"
            >
              Start Building
              <FiArrowRight />
            </motion.button>
          </div>
        </section>
    );
}