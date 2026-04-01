"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React from "react";
import { FiArrowRight } from "react-icons/fi";

export const CTASection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary p-12 shadow-2xl shadow-primary/20 dark:border-[#050a72]/50 dark:bg-linear-to-br dark:from-[#0710a0] dark:via-[#050a72] dark:to-[#030724] dark:shadow-[0_28px_80px_rgba(5,10,114,0.45)]">
          <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-black/10 dark:from-[#d8ddff]/14 dark:via-transparent dark:to-black/35" />
          <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-[#050a72]/24 blur-3xl dark:block" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#050a72]/45 blur-3xl dark:block" />
          <div className="relative z-10 text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Build Your Portfolio?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/85">
              Join thousands of professionals who trust our AI to showcase
              their work beautifully.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 rounded-xl bg-background px-10 py-4 font-bold text-foreground shadow-xl transition-shadow hover:cursor-pointer hover:shadow-2xl"
            >
              Get Started Now
              <FiArrowRight />
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  );
}
