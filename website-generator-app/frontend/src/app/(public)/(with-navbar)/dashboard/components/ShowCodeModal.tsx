"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useRef, useEffect } from "react";
import { FiX, FiShield } from "react-icons/fi";

interface ShowCodeModalProps {
  setShowCodeModal: React.Dispatch<React.SetStateAction<boolean>>;
  verificationCode: string;
  setVerificationCode: React.Dispatch<React.SetStateAction<string>>;
  isCodeVerifying: boolean;
  codeVerified: boolean;
  handleCodeSubmit: (e: React.FormEvent<Element>) => Promise<void>;
}

export const ShowCodeModal: React.FC<ShowCodeModalProps> = ({
  setShowCodeModal,
  verificationCode,
  setVerificationCode,
  isCodeVerifying,
  codeVerified,
  handleCodeSubmit,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = verificationCode.split("");
    newCode[index] = value;
    const updatedCode = newCode.join("").slice(0, 6);
    setVerificationCode(updatedCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setVerificationCode(pastedData);

    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onClick={() => setShowCodeModal(false)}
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
            onClick={() => setShowCodeModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-linear-to-br from-sky-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FiShield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Enter Verification Code
            </h3>
            <p className="text-slate-600 text-sm">
              Please enter the 6-digit code we sent to your email
            </p>
          </div>

          {/* Verification Code Form */}
          {!codeVerified ? (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="code-0"
                  className="block text-sm font-medium text-slate-700 mb-3 text-center"
                >
                  Verification Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={verificationCode[index] || ""}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-slate-900"
                      disabled={isCodeVerifying}
                      required
                    />
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={isCodeVerifying || verificationCode.length !== 6}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hover:cursor-pointer w-full px-6 py-3 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCodeVerifying ? (
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
                    Verifying...
                  </>
                ) : (
                  <>
                    <FiShield className="w-5 h-5" />
                    Verify Code
                  </>
                )}
              </motion.button>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium transition-colors"
                  onClick={() => {
                    // TODO: Implement resend code functionality
                    console.log("Resend code");
                  }}
                >
                  Didn't receive a code? Resend
                </button>
              </div>
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
                HTML File Sent!
              </h4>
              <p className="text-slate-600 text-sm">
                The HTML file has been sent to your email
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
