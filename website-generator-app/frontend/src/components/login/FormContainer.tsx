import React, { useEffect, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

import SocialAuth from "./SocialAuth";
import type { AuthMode } from "../../features/authType";
import { authFormReducer, initialAuthFormState } from "../../features/useAuthReducer";
import LoginForm from "./loginForm";
import SignUpForm from "./SignupForm";

interface FormContainerProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
}

const FormContainer: React.FC<FormContainerProps> = ({
  mode,
  onModeChange,
}) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(authFormReducer, initialAuthFormState);


  useEffect(() => {console.log(state);}, [state])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (mode === "register") {
      if (state.password !== state.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (!state.agreedToTerms) {
        alert("Please agree to the Terms of Service");
        return;
      }
    }

    // TODO: Implement actual auth logic
    console.log("Auth attempt:", { mode, ...state });

    // Reset form and navigate
    dispatch({ type: "RESET" });
    navigate("/dashboard");
  };

  const handleSocialAuth = (provider: string) => {
    // TODO: Implement social auth
    console.log("Social auth:", provider);
    navigate("/dashboard");
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
      {/* Mode Toggle */}
      <div className="bg-linear-to-r from-sky-50 to-cyan-50 p-2 flex gap-2">
        <button
          onClick={() => onModeChange("login")}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            mode === "login"
              ? "bg-white text-sky-600 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Login
        </button>
        <button
          onClick={() => onModeChange("register")}
          className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
            mode === "register"
              ? "bg-white text-sky-600 shadow-md"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Header */}
      <div className="px-8 pt-8 pb-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {mode === "login" ? "Welcome Back!" : "Create Account"}
            </h2>
            <p className="text-slate-600">
              {mode === "login"
                ? "Sign in to continue building your portfolio"
                : "Join thousands creating amazing portfolios"}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Social Auth */}
      <SocialAuth onSocialAuth={handleSocialAuth} />

      {/* Form */}
      <div className="px-8 pb-8">
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <LoginForm
              key="login"
              state={state}
              dispatch={dispatch}
              onSubmit={handleSubmit}
            />
          ) : (
            <SignUpForm
              key="register"
              state={state}
              dispatch={dispatch}
              onSubmit={handleSubmit}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-8 pb-8 text-center">
        <p className="text-sm text-slate-600">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => onModeChange("register")}
                className="font-semibold text-sky-600 hover:text-sky-700 transition-colors"
              >
                Sign up for free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => onModeChange("login")}
                className="font-semibold text-sky-600 hover:text-sky-700 transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default FormContainer;