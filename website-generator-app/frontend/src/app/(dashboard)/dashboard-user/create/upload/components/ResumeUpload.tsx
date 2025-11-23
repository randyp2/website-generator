"use client";

import { motion } from "framer-motion";
import { format } from "path";
import React, { useEffect } from "react";
import { FiFile, FiUpload, FiCheck, FiX } from "react-icons/fi";
import { UploadedFile } from "@/types/file";
import { usePortfolioStore } from "@/stores/usePortfolioStore";

interface ResumeUploadProps {

 
  formatFileSize: (bytes: number) => string;
  removeFile: (
    type: "resume" | "media" | "video",
    index?: number | undefined
  ) => void;
   handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "media" | "video"
  ) => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({
  formatFileSize,
  removeFile,
  handleFileUpload,
}) => {
  useEffect(() => {
  const unsub = usePortfolioStore.subscribe((state, prevState) => {
    console.log("Zustand updated:");
    console.log("Previous:", prevState);
    console.log("Current:", state);
  });
  return () => unsub(); // cleanup on unmount
}, []);
  const resumeFile = usePortfolioStore(s => s.resumeFile);
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-sky-100 rounded-lg">
          <FiFile className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Resume / CV</h2>
          <p className="text-sm text-slate-500">PDF or DOCX format</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {!resumeFile ? (
          <label className="block w-full h-full">
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, "resume")}
              className="hidden"
            />
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 h-full flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all"
            >
              <FiUpload className="w-16 h-16 text-slate-400 mb-4" />
              <p className="text-slate-700 font-semibold mb-2 text-lg">
                Click to upload your resume
              </p>
              <p className="text-sm text-slate-500">
                Supports PDF and DOCX files
              </p>
            </motion.div>
          </label>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex items-center justify-between p-4 bg-sky-50 rounded-xl border border-sky-200"
          >
            <div className="flex items-center gap-3">
              <FiCheck className="w-5 h-5 text-sky-600" />
              <div>
                <p className="font-semibold text-slate-900">
                  {resumeFile.name}
                </p>
                <p className="text-sm text-slate-500">
                  {formatFileSize(resumeFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeFile("resume")}
              className="p-2 hover:bg-sky-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-slate-600" />
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
