"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDownload,
  FiLink,
  FiGlobe,
  FiCheck,
  FiCopy,
  FiLoader,
  FiExternalLink,
  FiPackage,
} from "react-icons/fi";

/**
 * MODULE 6: EXPORT / SHARE / DEPLOY
 * 
 * Design Goals:
 * - Clear three-option layout (export, share, deploy)
 * - Celebratory success states (confetti, sparkles)
 * - Copy-to-clipboard with instant feedback
 * - Deploy simulation feels magical
 * - Progress indicators for all async operations
 */

type ActionState = "idle" | "loading" | "success";

const ExportShare: React.FC = () => {
  const [exportState, setExportState] = useState<ActionState>("idle");
  const [shareState, setShareState] = useState<ActionState>("idle");
  const [deployState, setDeployState] = useState<ActionState>("idle");
  const [deployUrl, setDeployUrl] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Mock portfolio URL
  const portfolioUrl = "https://johndoe.portfolio.ai";

  const handleExport = async () => {
    setExportState("loading");
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setExportState("success");
    setTimeout(() => setExportState("idle"), 3000);
  };

  const handleCopyLink = async () => {
    setShareState("loading");
    // Copy to clipboard
    await navigator.clipboard.writeText(portfolioUrl);
    setShareState("success");
    setTimeout(() => setShareState("idle"), 2000);
  };

  const handleDeploy = async () => {
    setDeployState("loading");
    // Simulate deployment
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setDeployUrl("https://johndoe.vercel.app");
    setDeployState("success");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Confetti particles
  const confettiColors = [
    "bg-sky-400",
    "bg-cyan-400",
    "bg-teal-400",
    "bg-emerald-400",
    "bg-amber-400",
    "bg-pink-400",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-slate-900 mb-2">
          Export & Share
        </h1>
        <p className="text-slate-600">
          Download, share, or deploy your portfolio to the world
        </p>
      </motion.div>

      {/* Three Option Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Export Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex flex-col h-full">
            {/* Icon */}
            <div className="w-14 h-14 bg-linear-to-br from-sky-100 to-cyan-100 rounded-xl flex items-center justify-center text-sky-600 mb-4">
              <FiPackage className="w-7 h-7" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Export as .zip
            </h3>
            <p className="text-sm text-slate-600 mb-6 flex-1">
              Download your complete portfolio as a static website package
            </p>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: exportState === "idle" ? 1.02 : 1 }}
              whileTap={{ scale: exportState === "idle" ? 0.98 : 1 }}
              onClick={handleExport}
              disabled={exportState !== "idle"}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                exportState === "success"
                  ? "bg-emerald-500 text-white"
                  : exportState === "loading"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-linear-to-r from-sky-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-sky-400/30"
              }`}
            >
              <AnimatePresence mode="wait">
                {exportState === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <FiLoader className="w-5 h-5" />
                    </motion.div>
                  </motion.div>
                )}
                {exportState === "success" && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <FiCheck className="w-5 h-5" />
                  </motion.div>
                )}
                {exportState === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <FiDownload className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span>
                {exportState === "loading"
                  ? "Exporting..."
                  : exportState === "success"
                  ? "Downloaded!"
                  : "Download Now"}
              </span>
            </motion.button>

            {/* Progress Bar */}
            {exportState === "loading" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4"
              >
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="h-full bg-linear-to-r from-sky-500 to-cyan-500"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl transition-all"
        >
          <div className="flex flex-col h-full">
            {/* Icon */}
            <div className="w-14 h-14 bg-linear-to-br from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center text-cyan-600 mb-4">
              <FiLink className="w-7 h-7" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Copy Shareable Link
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Share your portfolio instantly with a direct link
            </p>

            {/* URL Display */}
            <div className="flex-1 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-700 truncate font-mono">
                  {portfolioUrl}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: shareState === "idle" ? 1.02 : 1 }}
              whileTap={{ scale: shareState === "idle" ? 0.98 : 1 }}
              onClick={handleCopyLink}
              disabled={shareState !== "idle"}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                shareState === "success"
                  ? "bg-emerald-500 text-white"
                  : shareState === "loading"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-linear-to-r from-cyan-500 to-teal-500 text-white hover:shadow-lg hover:shadow-cyan-400/30"
              }`}
            >
              <AnimatePresence mode="wait">
                {shareState === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <FiLoader className="w-5 h-5" />
                  </motion.div>
                )}
                {shareState === "success" && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <FiCheck className="w-5 h-5" />
                  </motion.div>
                )}
                {shareState === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <FiCopy className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span>
                {shareState === "loading"
                  ? "Copying..."
                  : shareState === "success"
                  ? "Copied!"
                  : "Copy Link"}
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Deploy Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/40 shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
        >
          {/* Confetti */}
          <AnimatePresence>
            {showConfetti && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: "50%",
                      y: "50%",
                      opacity: 1,
                      scale: 0,
                    }}
                    animate={{
                      x: `${Math.random() * 200 - 100}%`,
                      y: `${-100 - Math.random() * 100}%`,
                      opacity: 0,
                      scale: 1,
                      rotate: Math.random() * 360,
                    }}
                    transition={{
                      duration: 1 + Math.random(),
                      ease: "easeOut",
                    }}
                    className={`absolute w-2 h-2 ${
                      confettiColors[i % confettiColors.length]
                    } rounded-full`}
                    style={{
                      left: "50%",
                      top: "50%",
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <div className="flex flex-col h-full relative z-10">
            {/* Icon */}
            <div className="w-14 h-14 bg-linear-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center text-teal-600 mb-4">
              <FiGlobe className="w-7 h-7" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Deploy to Vercel
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Host your portfolio live with one click (mock deployment)
            </p>

            {/* Deploy URL (if deployed) */}
            {deployState === "success" && deployUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4"
              >
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-emerald-700 font-medium mb-1">
                    🎉 Live at:
                  </p>
                  <a
                    href={deployUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-mono flex items-center gap-1 truncate"
                  >
                    {deployUrl}
                    <FiExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </motion.div>
            )}

            <div className="flex-1" />

            {/* Action Button */}
            <motion.button
              whileHover={{
                scale: deployState === "idle" || deployState === "success" ? 1.02 : 1,
              }}
              whileTap={{
                scale: deployState === "idle" || deployState === "success" ? 0.98 : 1,
              }}
              onClick={handleDeploy}
              disabled={deployState === "loading"}
              className={`w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                deployState === "success"
                  ? "bg-emerald-500 text-white"
                  : deployState === "loading"
                  ? "bg-slate-200 text-slate-600"
                  : "bg-linear-to-r from-teal-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-teal-400/30"
              }`}
            >
              <AnimatePresence mode="wait">
                {deployState === "loading" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <FiLoader className="w-5 h-5" />
                    </motion.div>
                  </motion.div>
                )}
                {deployState === "success" && (
                  <motion.div
                    key="success"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <FiCheck className="w-5 h-5" />
                  </motion.div>
                )}
                {deployState === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <FiGlobe className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
              <span>
                {deployState === "loading"
                  ? "Deploying..."
                  : deployState === "success"
                  ? "View Live Site"
                  : "Deploy Now"}
              </span>
            </motion.button>

            {/* Progress Bar */}
            {deployState === "loading" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4"
              >
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                    className="h-full bg-linear-to-r from-teal-500 to-emerald-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Building and deploying your site...
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-sky-50 rounded-xl p-6 border border-sky-100"
      >
        <h4 className="text-sm font-semibold text-slate-900 mb-2">
          💡 Pro Tips
        </h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>
            • Export regularly to keep a local backup of your portfolio
          </li>
          <li>• Shareable links are perfect for including in your resume</li>
          <li>
            • Deployed sites are live 24/7 and can be accessed from anywhere
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default ExportShare;
