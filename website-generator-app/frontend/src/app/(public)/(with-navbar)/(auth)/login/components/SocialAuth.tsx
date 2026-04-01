"use client";

import React from "react";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaGithub, FaApple } from "react-icons/fa";
import { signInWithGoogle } from "@/lib/auth-actions";

interface SocialAuthProps {
  onSocialAuth: (provider: string) => void;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ onSocialAuth }) => {
  const providers = [
    {
      name: "Google",
      icon: <FcGoogle className="w-5 h-5 hover:cursor-pointer" />,
      action: signInWithGoogle, // Client action
    },
  ];

  return (
    <div className="px-8 pb-6">
      <div className="flex flex-col gap-3">
        {providers.map((provider, index) => (
          <motion.form
            key={provider.name}
            action={provider.action}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="hover:cursor-pointer w-full p-3 rounded-xl border-2 border-white/10 hover:border-white/20 bg-[#0a0a0a]/50 hover:bg-[#0a0a0a]/70 shadow-sm hover:shadow-lg transition-all relative flex items-center justify-center gap-3"
              title={`Continue with ${provider.name}`}
            >
               <span className="absolute left-4">{provider.icon}</span>
              <span className="font-medium text-gray-300">{`Continue with ${provider.name}`}</span>
            </motion.button>
          </motion.form>
        ))}
      </div>

      {/* Divider */}
      <div className="relative mt-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#1a1a1a]/90 text-gray-400 font-medium">
            Or continue with email
          </span>
        </div>
      </div>
    </div>
  );
};

export default SocialAuth;
