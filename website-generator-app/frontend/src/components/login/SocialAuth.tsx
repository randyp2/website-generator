"use client";

import React from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaApple } from "react-icons/fa";

interface SocialAuthProps {
  onSocialAuth: (provider: string) => void;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ onSocialAuth }) => {
  const socialProviders = [
    { name: "Google", icon: <FcGoogle className="w-5 h-5" />, color: "white" },
    {
      name: "Facebook",
      icon: <FaFacebook className="w-5 h-5" />,
      color: "blue",
    },
    { name: "GitHub", icon: <FaGithub className="w-5 h-5" />, color: "gray" },
    { name: "Apple", icon: <FaApple className="w-5 h-5" />, color: "black" },
  ];

  return (
    <div className="px-8 pb-6">
      <div className="grid grid-cols-4 gap-3">
        {socialProviders.map((provider, index) => (
          <motion.button
            key={provider.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSocialAuth(provider.name)}
            className={`p-3 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:shadow-md transition-all flex items-center justify-center ${
              provider.color === "blue"
                ? "hover:bg-blue-50"
                : provider.color === "black"
                ? "hover:bg-slate-50"
                : provider.color === "gray"
                ? "hover:bg-slate-50"
                : "hover:bg-slate-50"
            }`}
            title={`Continue with ${provider.name}`}
            type="button"
          >
            {provider.icon}
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white/80 text-slate-500 font-medium">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  );
};

export default SocialAuth;
