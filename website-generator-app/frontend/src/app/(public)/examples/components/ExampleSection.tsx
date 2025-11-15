"use client";

import { motion } from "framer-motion";

import React from "react";
import { FiArrowRight, FiExternalLink, FiZap } from "react-icons/fi";

const examples = [
  {
    id: 1,
    name: "Alex Chen",
    role: "Full-Stack Developer",
    theme: "Minimal Light",
    gradient: "from-slate-100 to-slate-200",
    description: "Clean and professional with a focus on readability",
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "UX Designer",
    theme: "Nature Zen",
    gradient: "from-emerald-100 to-teal-100",
    description: "Calm and organic design inspired by nature",
  },
  {
    id: 3,
    name: "Marcus Reid",
    role: "Data Scientist",
    theme: "Cyberpunk Dark",
    gradient: "from-violet-200 to-purple-200",
    description: "Bold and futuristic with vibrant accents",
  },
  {
    id: 4,
    name: "Emily Johnson",
    role: "Product Manager",
    theme: "Apple Style",
    gradient: "from-blue-100 to-indigo-100",
    description: "Sleek glassmorphism with refined details",
  },
  {
    id: 5,
    name: "David Park",
    role: "Software Engineer",
    theme: "Futuristic Neon",
    gradient: "from-pink-200 to-purple-200",
    description: "High-contrast with glowing elements",
  },
  {
    id: 6,
    name: "Lisa Anderson",
    role: "Creative Director",
    theme: "Minimal Light",
    gradient: "from-amber-100 to-orange-100",
    description: "Editorial style with generous spacing",
  },
];

export const ExampleSection: React.FC = () => {
  return (
    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {examples.map((example, index) => (
        <motion.div
          key={example.id}
          transition={{ duration: 0.5 }}
          whileHover={{
            y: -12,
            rotate: index % 2 === 0 ? 2 : -2,
            transition: { duration: 0.3 },
          }}
          className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-100 hover:shadow-2xl hover:border-cyan-200 transition-shadow hover:cursor-pointer"
        >
          {/* Preview Image/Gradient */}
          <div
            className={`h-56 bg-linear-to-br ${example.gradient} flex items-center justify-center relative`}
          >
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white text-slate-700 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                  Preview
                  <FiExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-1">
              {example.name}
            </h3>
            <p className="text-slate-600 text-sm mb-3">{example.role}</p>
            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
              {example.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full text-xs font-medium text-slate-700">
                <FiZap className="w-3 h-3 text-cyan-500" />
                {example.theme}
              </div>

              <button className="text-cyan-600 hover:text-cyan-700 font-medium text-sm flex items-center gap-1 transition-colors">
                Use This Theme
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </section>
  );
};
