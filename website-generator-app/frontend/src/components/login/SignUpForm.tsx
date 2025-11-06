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
import type { AuthFormAction, AuthFormState } from "../../features/authType";


interface SignUpFormProps {
  state: AuthFormState;
  dispatch: React.Dispatch<AuthFormAction>;
  onSubmit: (e: React.FormEvent) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  state,
  dispatch,
  onSubmit,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="space-y-5"
    >
      {/* Full Name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Full Name
        </label>
        <div className="relative">
          <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={state.fullName}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "fullName",
                payload: e.target.value,
              })
            }
            className="w-full bg-white border-2 border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="email"
            value={state.email}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "email",
                payload: e.target.value,
              })
            }
            className="w-full bg-white border-2 border-slate-200 rounded-xl pl-12 pr-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Password
        </label>
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            value={state.password}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "password",
                payload: e.target.value,
              })
            }
            className="w-full bg-white border-2 border-slate-200 rounded-xl pl-12 pr-12 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
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
            className="w-full bg-white border-2 border-slate-200 rounded-xl pl-12 pr-12 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10 transition-all"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
              className="w-5 h-5 text-sky-600 border-2 border-slate-300 rounded focus:ring-sky-500 focus:ring-2"
              required
            />
            {state.agreedToTerms && (
              <FiCheck className="w-3 h-3 text-white absolute pointer-events-none" />
            )}
          </div>
          <span className="text-sm text-slate-600 leading-relaxed">
            I agree to the{" "}
            <a
              href="#"
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-sky-600 hover:text-sky-700 font-medium"
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
        className="w-full px-6 py-3.5 bg-linear-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-sky-400/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all flex items-center justify-center gap-2 mt-6"
      >
        Create Account
        <FiArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.form>
  );
};

export default SignUpForm;