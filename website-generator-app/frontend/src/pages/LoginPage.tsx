import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import AnimatedBackground from "../components/login/AnimatedBackground";
import type { AuthMode } from "../features/authType";
import FormContainer from "../components/login/FormContainer";


const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Form Container */}
        <FormContainer mode={mode} onModeChange={setMode} />

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-slate-600 hover:text-slate-900 font-medium transition-colors inline-flex items-center gap-2 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;