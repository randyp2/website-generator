"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { FiX, FiMail } from "react-icons/fi";

interface EmailModalProps {
  setShowEmailModal: React.Dispatch<React.SetStateAction<boolean>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  isEmailSending: boolean;
  emailSent: boolean;
  handleEmailSubmit: (e: React.FormEvent<Element>) => Promise<void>;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  setShowEmailModal,
  email,
  setEmail,
  isEmailSending,
  emailSent,
  handleEmailSubmit,
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onClick={() => setShowEmailModal(false)}
      >
        {/* Backdrop with reduced brightness */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={() => setShowEmailModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-linear-to-br from-sky-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiMail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Email Your Website
            </h3>
            <p className="text-slate-600 text-sm">
              Enter your email address to receive your portfolio website
            </p>
          </div>

          {/* Email Form */}
          {!emailSent ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-slate-900"
                  disabled={isEmailSending}
                />
              </div>

              <motion.button
                type="submit"
                disabled={isEmailSending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hover:cursor-pointer w-full px-6 py-3 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isEmailSending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <FiMail className="w-5 h-5" />
                    Send Website
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">
                Email Sent Successfully!
              </h4>
              <p className="text-slate-600 text-sm">
                Check your inbox for your portfolio website
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
