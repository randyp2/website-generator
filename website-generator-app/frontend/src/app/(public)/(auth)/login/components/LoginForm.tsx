"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import type { AuthFormState, AuthFormAction } from "../../../../../features/authType";
import { login } from "@/lib/auth-actions";


interface LoginFormProps {
  state: AuthFormState;
  dispatch: React.Dispatch<AuthFormAction>;
}

const LoginForm: React.FC<LoginFormProps> = ({ state, dispatch }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <motion.form
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
      action={login} // Use the server action for login
    >
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
            value={state.email}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "email",
                payload: e.target.value,
              })
            }
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

      {/* Remember Me / Forgot Password */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.rememberMe}
            onChange={() => dispatch({ type: "TOGGLE_REMEMBER_ME" })}
            className="w-4 h-4 text-[#0084ff] border-gray-600 bg-[#0a0a0a]/50 rounded focus:ring-[#0084ff] focus:ring-2"
          />
          <span className="text-sm text-gray-400">Remember me</span>
        </label>
        <a
          href="#"
          className="text-sm font-medium text-[#0084ff] hover:text-[#0066cc] transition-colors"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        className="w-full px-6 py-3.5 bg-[#0084ff] hover:bg-[#0066cc] text-white rounded-xl font-bold shadow-lg shadow-[#0084ff]/30 hover:shadow-xl hover:shadow-[#0084ff]/40 transition-all flex items-center justify-center gap-2 mt-6"
      >
        Sign In
        <FiArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.form>
  );
};

export default LoginForm;
