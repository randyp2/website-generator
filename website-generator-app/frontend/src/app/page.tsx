"use client"; // CSR Page

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  FiZap,
  FiLayout,
  FiSliders,
  FiArrowRight,
  FiClock,
  FiAward,
  FiCheck,
  FiDollarSign,
  FiTrendingUp,
  FiStar,
  FiCode,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiMail,
} from "react-icons/fi";

export default function LandingPage() {

  const router = useRouter();

  const trustBadges = [
    {
      icon: <FiDollarSign className="w-5 h-5" />,
      label: "100% Free",
      color: "emerald",
    },
    {
      icon: <FiClock className="w-5 h-5" />,
      label: "Ready in 5 min",
      color: "sky",
    },
    {
      icon: <FiCode className="w-5 h-5" />,
      label: "No Code Needed",
      color: "violet",
    },
  ];

  const examples = [
    {
      name: "Alex Chen",
      role: "Full-Stack Developer",
      theme: "Minimal Light",
      gradient: "from-slate-100 to-slate-200",
    },
    {
      name: "Sarah Williams",
      role: "UX Designer",
      theme: "Nature Zen",
      gradient: "from-emerald-100 to-teal-100",
    },
    {
      name: "Marcus Reid",
      role: "Data Scientist",
      theme: "Cyberpunk Dark",
      gradient: "from-violet-200 to-purple-200",
    },
  ];

  const features = [
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Ready in Minutes",
      description: "Generate a professional portfolio in under 5 minutes",
    },
    {
      icon: <FiSliders className="w-6 h-6" />,
      title: "Fully Customizable",
      description: "Choose themes, adjust styles, add custom sections",
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Premium Quality",
      description: "AI-crafted designs that look professionally made",
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        {/* Animated background orbs using Framer Motion */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 30, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1, 0.9, 1],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-20 left-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute -top-10 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            {/* Status Badge with Framer Motion ping */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-sky-200 shadow-lg shadow-sky-200/50 mb-8"
            >
              <span className="relative flex h-2 w-2">
                <motion.span
                  animate={{ scale: [1, 2, 1], opacity: [0.75, 0, 0.75] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inline-flex h-full w-full rounded-full bg-sky-400"
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span className="text-sm font-semibold text-slate-700">
                ✨ AI-Powered Portfolio Creation
              </span>
            </motion.div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Your professional story,
              <br />
              <span className="bg-linear-to-r from-sky-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                beautifully automated
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Generate a portfolio that speaks for your craft. AI-crafted
              portfolios with human polish — ready in minutes, customizable to
              perfection.
            </p>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4 mb-10"
            >
              {trustBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`flex items-center gap-2 px-5 py-3 bg-white rounded-full border-2 ${
                    badge.color === "emerald"
                      ? "border-emerald-200 shadow-lg shadow-emerald-200/50"
                      : badge.color === "sky"
                      ? "border-sky-200 shadow-lg shadow-sky-200/50"
                      : "border-violet-200 shadow-lg shadow-violet-200/50"
                  }`}
                >
                  <div
                    className={`${
                      badge.color === "emerald"
                        ? "text-emerald-600"
                        : badge.color === "sky"
                        ? "text-sky-600"
                        : "text-violet-600"
                    }`}
                  >
                    {badge.icon}
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {badge.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/dashboard")}
                className="group px-8 py-4 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-xl shadow-sky-400/30 hover:shadow-2xl hover:shadow-sky-500/40 transition-all flex items-center gap-2"
              >
                <FiZap className="w-5 h-5" />
                Generate Yours Free
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/examples")}
                className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold border-2 border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all"
              >
                View Examples
              </motion.button>
            </div>
          </motion.div>

          {/* Portfolio Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            className="mt-20"
          >
            <div className="relative max-w-5xl mx-auto">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-linear-to-r from-sky-400/20 via-cyan-400/20 to-teal-400/20 rounded-3xl blur-3xl" />

              {/* Main preview card */}
              <div className="relative bg-white/80 backdrop-blur-xl border-2 border-white/40 rounded-3xl shadow-2xl overflow-hidden">
                {/* Browser Chrome */}
                <div className="bg-linear-to-r from-slate-100 to-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
                      <FiGlobe className="w-3 h-3" />
                      <span>yourname.portfolio.ai</span>
                    </div>
                  </div>
                </div>

                {/* Portfolio Content Preview */}
                <div className="relative bg-linear-to-br from-slate-50 via-white to-sky-50/30 p-8 min-h-[500px]">
                  {/* Animated portfolio preview */}
                  <div className="space-y-8">
                    {/* Hero Section Preview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                      className="text-center py-12"
                    >
                      {/* Avatar */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 rounded-full bg-linear-to-br from-sky-400 to-cyan-500 mx-auto mb-6 flex items-center justify-center shadow-xl shadow-sky-400/30"
                      >
                        <span className="text-3xl font-bold text-white">JD</span>
                      </motion.div>

                      {/* Name with shimmer effect using Framer Motion */}
                      <div className="mb-3">
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "200px", opacity: 1 }}
                          transition={{ delay: 1.6, duration: 0.8 }}
                          className="h-8 bg-linear-to-r from-slate-200 via-slate-300 to-slate-200 rounded-lg mx-auto relative overflow-hidden"
                        >
                          <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent"
                          />
                        </motion.div>
                      </div>

                      {/* Tagline with shimmer */}
                      <div className="mb-6">
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "300px", opacity: 1 }}
                          transition={{ delay: 1.8, duration: 0.8 }}
                          className="h-4 bg-linear-to-r from-slate-100 via-slate-200 to-slate-100 rounded-lg mx-auto relative overflow-hidden"
                        >
                          <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                            className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent"
                          />
                        </motion.div>
                      </div>

                      {/* Social links */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2, duration: 0.4 }}
                        className="flex justify-center gap-3"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center text-slate-600"
                        >
                          <FiGithub className="w-5 h-5" />
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center text-slate-600"
                        >
                          <FiLinkedin className="w-5 h-5" />
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center text-slate-600"
                        >
                          <FiMail className="w-5 h-5" />
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Skills Section Preview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.2, duration: 0.6 }}
                      className="max-w-2xl mx-auto"
                    >
                      <div className="text-center mb-6">
                        <div className="h-6 w-32 bg-linear-to-r from-slate-200 to-slate-300 rounded-lg mx-auto mb-4" />
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        {["React", "TypeScript", "Node.js", "Python", "Tailwind", "AWS"].map((skill, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              delay: 2.4 + i * 0.1,
                              type: "spring",
                              stiffness: 200,
                            }}
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="px-4 py-2 bg-linear-to-r from-sky-100 to-cyan-100 border border-sky-200 rounded-lg text-sm font-medium text-slate-700"
                          >
                            {skill}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Projects Section Preview */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2.8, duration: 0.6 }}
                      className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto"
                    >
                      {[1, 2].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.8 + i * 0.2 }}
                          whileHover={{ scale: 1.02, y: -4 }}
                          className="bg-white rounded-xl p-4 shadow-md border border-slate-200"
                        >
                          <div className="h-32 bg-linear-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center">
                            <FiLayout className="w-12 h-12 text-slate-400" />
                          </div>
                          <div className="h-4 bg-slate-200 rounded mb-2 w-3/4" />
                          <div className="h-3 bg-slate-100 rounded w-full" />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>

                  {/* Floating elements for visual interest */}
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute top-10 right-10 w-12 h-12 bg-linear-to-br from-sky-400 to-cyan-500 rounded-lg shadow-lg opacity-20"
                  />
                  <motion.div
                    animate={{
                      y: [0, 10, 0],
                      rotate: [0, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                    className="absolute bottom-20 left-10 w-16 h-16 bg-linear-to-br from-teal-400 to-emerald-500 rounded-full shadow-lg opacity-20"
                  />
                </div>

                {/* Stats bar at bottom */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3.2, duration: 0.6 }}
                  className="bg-linear-to-r from-sky-50 to-cyan-50 px-6 py-4 border-t border-slate-200 grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center gap-2 text-sm justify-center">
                    <FiCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-600 font-medium">
                      Responsive
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm justify-center">
                    <FiTrendingUp className="w-4 h-4 text-sky-500" />
                    <span className="text-slate-600 font-medium">
                      SEO Ready
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm justify-center">
                    <FiStar className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-600 font-medium">
                      Professional
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-linear-to-br from-sky-400 to-cyan-500 rounded-2xl opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-linear-to-br from-teal-400 to-emerald-500 rounded-2xl opacity-20 blur-xl" />
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.4, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-slate-500 text-sm mb-4">
              Trusted by professionals worldwide
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-linear-to-br from-sky-200 to-cyan-300 border-2 border-white flex items-center justify-center text-xs font-bold text-sky-700"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-slate-900">10,000+</div>
                <div className="text-xs text-slate-600">portfolios created</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose Our Generator?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with intelligence and care, designed for professionals who
              value quality and efficiency.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-cyan-100 transition-all cursor-pointer"
              >
                <div className="w-14 h-14 bg-linear-to-br from-cyan-50 to-teal-50 rounded-xl flex items-center justify-center text-cyan-600 mb-5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Preview Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Portfolio Examples
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              See what our AI can create for you — each portfolio is unique,
              professional, and ready to impress.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -12,
                  rotate: index % 2 === 0 ? 2 : -2,
                  transition: { duration: 0.3 },
                }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl hover:border-cyan-200 transition-all cursor-pointer"
              >
                <div
                  className={`h-48 bg-linear-to-br ${example.gradient} flex items-center justify-center relative`}
                >
                  <div className="absolute inset-0 bg-white/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-slate-700 font-semibold flex items-center gap-2">
                      View Portfolio <FiArrowRight />
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-1">
                    {example.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3">{example.role}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-xs font-medium text-slate-700">
                    <FiZap className="w-3 h-3 text-cyan-500" />
                    {example.theme}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/examples")}
              className="px-8 py-3 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              View All Examples →
            </motion.button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-linear-to-br from-slate-50 to-cyan-50/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Intelligent Design, Effortless Creation
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Our AI understands design principles, accessibility standards, and
              modern web aesthetics. Simply provide your information — name,
              skills, experience — and watch as a stunning, professional
              portfolio is crafted in real-time.
            </p>
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-600 mb-2">5min</div>
                <p className="text-slate-600 text-sm">Average Generation Time</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-600 mb-2">10K+</div>
                <p className="text-slate-600 text-sm">Portfolios Created</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-600 mb-2">98%</div>
                <p className="text-slate-600 text-sm">Satisfaction Rate</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden bg-linear-to-r from-cyan-500 to-teal-600 rounded-3xl p-12 shadow-2xl">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10 text-center text-white">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Build Your Portfolio?
              </h2>
              <p className="text-cyan-50 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who trust our AI to showcase
                their work beautifully.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
                className="px-10 py-4 bg-white text-cyan-600 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
              >
                Get Started Now
                <FiArrowRight />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-600 text-sm">
              © 2025 AI Portfolio Generator. Crafted with care.
            </div>
            <div className="flex gap-8">
              <a
                href="#"
                className="text-slate-600 hover:text-cyan-600 transition-colors text-sm font-medium"
              >
                Support
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-cyan-600 transition-colors text-sm font-medium"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-cyan-600 transition-colors text-sm font-medium"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};