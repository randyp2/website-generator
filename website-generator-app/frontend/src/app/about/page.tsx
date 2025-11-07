"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  FiZap,
  FiClock,
  FiSliders,
  FiAward,
  FiTrendingUp,
  FiShield,
  FiCode,
  FiArrowRight,
} from "react-icons/fi";

const AboutPage: React.FC = () => {
  const router = useRouter();

  const features = [
    {
      icon: <FiZap className="w-6 h-6" />,
      title: "AI-Powered",
      description:
        "Advanced AI algorithms understand design principles and create portfolios that look professionally crafted.",
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Lightning Fast",
      description:
        "Generate a complete portfolio in under 5 minutes. No coding required, no design skills needed.",
    },
    {
      icon: <FiSliders className="w-6 h-6" />,
      title: "Fully Customizable",
      description:
        "Choose from 5 professional themes and add custom sections, colors, and content to match your brand.",
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Premium Quality",
      description:
        "Every generated portfolio meets professional standards with responsive design and accessibility built-in.",
    },
    {
      icon: <FiShield className="w-6 h-6" />,
      title: "Secure & Private",
      description:
        "Your data is encrypted and never shared. Generate portfolios with confidence and peace of mind.",
    },
    {
      icon: <FiCode className="w-6 h-6" />,
      title: "Export Ready",
      description:
        "Download clean HTML/CSS code ready to deploy anywhere. Host on your domain or ours.",
    },
  ];

  const stats = [
    { value: "10K+", label: "Portfolios Created" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "5min", label: "Avg. Generation Time" },
    { value: "24/7", label: "Always Available" },
  ];

  const process = [
    {
      step: "01",
      title: "Enter Your Info",
      description:
        "Fill out a simple form with your name, skills, experience, and contact information.",
    },
    {
      step: "02",
      title: "Choose a Theme",
      description:
        "Select from 5 professionally designed themes or customize with your own style preferences.",
    },
    {
      step: "03",
      title: "Generate Portfolio",
      description:
        "Our AI creates a stunning portfolio in seconds, complete with responsive design and animations.",
    },
    {
      step: "04",
      title: "Download & Deploy",
      description:
        "Get your HTML/CSS code and deploy to any hosting platform. It's that simple.",
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-100 rounded-full mb-6">
              <FiZap className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-medium text-cyan-900">
                About PortfolioAI
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Professional Portfolios,{" "}
              <span className="bg-linear-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                Effortlessly Created
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed mb-8">
              We built PortfolioAI to help professionals showcase their work
              without spending weeks on design and development. Our AI
              understands what makes portfolios effective and creates beautiful,
              responsive sites in minutes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-linear-to-br from-slate-50 to-cyan-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-cyan-600 mb-2">
                  {stat.value}
                </div>
                <p className="text-slate-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built with the latest web technologies and design best practices
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-lg hover:border-cyan-100 transition-all"
              >
                <div className="w-12 h-12 bg-linear-to-br from-cyan-50 to-teal-50 rounded-lg flex items-center justify-center text-cyan-600 mb-4">
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

      {/* Process Section */}
      <section className="py-20 px-6 bg-white/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Four simple steps to your professional portfolio
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-cyan-100 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Arrow for desktop */}
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-4 text-cyan-200">
                    <FiArrowRight className="w-8 h-8" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-linear-to-br from-cyan-50 to-teal-50 rounded-3xl p-12 border border-cyan-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-linear-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
            </div>

            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              We believe everyone deserves a professional online presence. Too
              many talented individuals struggle with web design or can't afford
              expensive developers. PortfolioAI democratizes professional web
              design, making it accessible to everyone.
            </p>

            <p className="text-lg text-slate-700 leading-relaxed">
              Our AI doesn't just generate templates — it understands design
              principles, accessibility standards, and modern aesthetics. Every
              portfolio is unique, responsive, and ready to impress employers,
              clients, and collaborators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative overflow-hidden bg-linear-to-r from-cyan-500 to-teal-600 rounded-3xl p-12 shadow-2xl text-center text-white">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-cyan-50 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who have already created their
                portfolios with PortfolioAI.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
                className="px-10 py-4 bg-white text-cyan-600 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
              >
                Create Your Portfolio
                <FiArrowRight />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;