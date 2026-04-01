"use client";

import { motion } from "framer-motion";
import React from "react";
import { FiFile, FiSlash } from "react-icons/fi";

export const ResumeUpload: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: 0.1 }}
      className="upload-panel relative rounded-2xl p-6 flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="upload-panel-icon rounded-lg p-2">
          <FiFile className="w-5 h-5" />
        </div>
        <div>
          <h2 className="upload-panel-title text-xl font-bold">Resume / CV</h2>
          <p className="upload-panel-subtitle text-sm">Disabled in this mock flow</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="upload-dropzone relative z-10 flex h-full w-full flex-col items-center justify-center rounded-xl p-10 text-center">
          <div className="upload-panel-icon mb-5 flex h-18 w-18 items-center justify-center rounded-full">
            <FiSlash className="h-8 w-8" />
          </div>
          <p className="upload-dropzone-title mb-2 text-xl font-semibold">
            Resume upload is unavailable
          </p>
          <p className="upload-dropzone-copy max-w-md text-sm leading-6">
            This step is a nonfunctional mockup. Resume parsing and file uploads are disabled, and you can continue without uploading anything.
          </p>
          <div className="upload-note mt-6 rounded-xl px-4 py-3 text-sm">
            The next step will use placeholder manual resume data automatically.
          </div>
          <div className="upload-meta mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.22em]">
            <FiFile className="h-3.5 w-3.5" />
            Resume panel shown for layout only
          </div>
        </div>
      </div>
    </motion.div>
  );
};
