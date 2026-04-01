"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiArrowRight,
  FiCheck,
} from "react-icons/fi";
import type { AuthFormAction, AuthFormState } from "../../../../../features/authType";
import { signup } from "@/lib/auth-actions";


interface SignUpFormProps {
  state: AuthFormState;
  dispatch: React.Dispatch<AuthFormAction>;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  state,
  dispatch,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.form
      action={signup} // Use the server action for signup
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Full Name
        </label>
        <div className="relative">
          <FiUser className="absolute left-4 top-1/4 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            name="first-name"
            placeholder="First Name"
            required
            className="w-full bg-[#0a0a0a]/50 border-2 border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0084ff] focus:ring-4 focus:ring-[#0084ff]/10 transition-all"
          />
          <FiUser className="absolute left-4 top-3/4 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            name="last-name"
            placeholder="Last Name"
            required
            className="w-full bg-[#0a0a0a]/50 border-2 border-white/10 rounded-xl pl-12 pr-4 py-3 mt-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0084ff] focus:ring-4 focus:ring-[#0084ff]/10 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Email Address
        </label>
        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="email"
            name="email"
            className="w-full bg-[#0a0a0a]/50 border-2 border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0084ff] focus:ring-4 focus:ring-[#0084ff]/10 transition-all"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Password
        </label>
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={state.password}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "password",
                payload: e.target.value,
              })
            }
            className="w-full bg-[#0a0a0a]/50 border-2 border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0084ff] focus:ring-4 focus:ring-[#0084ff]/10 transition-all"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={state.confirmPassword}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "confirmPassword",
                payload: e.target.value,
              })
            }
            className="w-full bg-[#0a0a0a]/50 border-2 border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#0084ff] focus:ring-4 focus:ring-[#0084ff]/10 transition-all"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showConfirmPassword ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              checked={state.agreedToTerms}
              onChange={() => dispatch({ type: "TOGGLE_TERMS" })}
              className="w-5 h-5 text-[#0084ff] border-2 border-gray-600 bg-[#0a0a0a]/50 rounded focus:ring-[#0084ff] focus:ring-2"
              required
            />
            {state.agreedToTerms && (
              <FiCheck className="w-3 h-3 text-white absolute pointer-events-none" />
            )}
          </div>
          <span className="text-sm text-gray-400 leading-relaxed">
            I agree to the{" "}
            <a
              href="#"
              className="text-[#0084ff] hover:text-[#0066cc] font-medium"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-[#0084ff] hover:text-[#0066cc] font-medium"
            >
              Privacy Policy
            </a>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full px-6 py-3.5 bg-[#0084ff] hover:bg-[#0066cc] text-white rounded-xl font-bold shadow-lg shadow-[#0084ff]/30 hover:shadow-xl hover:shadow-[#0084ff]/40 transition-all flex items-center justify-center gap-2 mt-6"
      >
        Create Account
        <FiArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.form>
  );
};

export default SignUpForm;
