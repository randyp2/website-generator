"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDownload,
  FiExternalLink,
  FiEye,
  FiMonitor,
  FiSmartphone,
  FiTablet,
} from "react-icons/fi";

import { FormState } from "@/webgenForm/formType";

interface PreviewContainerProps {
  formData: FormState;
  showPreview: boolean;
  isLoading: boolean;
  generatedHTML: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const LOADING_STEPS = [
  "Building local mock layout...",
  "Composing placeholder sections...",
  "Rendering browser preview...",
];

const PreviewContainer: React.FC<PreviewContainerProps> = ({
  formData,
  showPreview,
  isLoading,
  generatedHTML,
}) => {
  const [device, setDevice] = useState<DeviceType>("desktop");

  const fileName = useMemo(() => {
    const safeName = (formData.name || "mock-portfolio")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();
    return `${safeName || "mock-portfolio"}.html`;
  }, [formData.name]);

  const getDeviceWidth = () => {
    switch (device) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      default:
        return "100%";
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    const newWindow = window.open();
    if (!newWindow) return;
    newWindow.document.write(generatedHTML);
    newWindow.document.close();
  };

  return (
    <div className="sticky top-24">
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-lg">
        <div className="border-b border-slate-200/60 bg-linear-to-br from-sky-50 to-cyan-50/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-sky-400 to-cyan-400 shadow-sm">
                <FiEye className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Live Preview
                </h3>
                <p className="text-sm text-slate-600">
                  {showPreview && !isLoading
                    ? "Your local mock preview is ready."
                    : isLoading
                      ? "Generating a local mock portfolio..."
                      : "Waiting for generation..."}
                </p>
              </div>
            </div>

            {showPreview && !isLoading && (
              <div className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm md:flex">
                <button
                  onClick={() => setDevice("desktop")}
                  className={`rounded p-2 transition-all ${
                    device === "desktop"
                      ? "bg-sky-100 text-sky-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                  title="Desktop View"
                >
                  <FiMonitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevice("tablet")}
                  className={`rounded p-2 transition-all ${
                    device === "tablet"
                      ? "bg-sky-100 text-sky-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                  title="Tablet View"
                >
                  <FiTablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  className={`rounded p-2 transition-all ${
                    device === "mobile"
                      ? "bg-sky-100 text-sky-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                  title="Mobile View"
                >
                  <FiSmartphone className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {showPreview && !isLoading && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                This preview is a nonfunctional mockup generated locally in the browser. Backend generation, email verification, and publishing are disabled.
              </div>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDownload}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  <FiDownload className="h-4 w-4" />
                  Download HTML
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOpenNewTab}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-sm"
                >
                  <FiExternalLink className="h-4 w-4" />
                  Open in New Tab
                </motion.button>
              </div>
            </div>
          )}
        </div>

        <div className="relative min-h-[600px] bg-slate-50 p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-12"
              >
                <div className="w-full max-w-2xl space-y-8">
                  <div className="text-center">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                      Mock Generation
                    </p>
                    <h4 className="text-2xl font-bold text-slate-900">
                      Building your local preview
                    </h4>
                    <p className="mt-3 text-sm text-slate-600">
                      This is a front-end-only demo state. No server or AI generation is running.
                    </p>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    {LOADING_STEPS.map((step, index) => (
                      <div key={step} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-800">{step}</span>
                          <span className="text-slate-400">Step {index + 1}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            className="h-full rounded-full bg-linear-to-r from-sky-400 to-cyan-400"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{
                              duration: 1.8 + index * 0.35,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            style={{ width: "45%" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : showPreview && generatedHTML ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex h-full w-full justify-center"
              >
                <div
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl transition-all duration-300"
                  style={{
                    width: getDeviceWidth(),
                    maxWidth: "100%",
                  }}
                >
                  <iframe
                    srcDoc={generatedHTML}
                    title="Portfolio Preview"
                    className="h-[600px] w-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-forms"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="mx-auto max-w-md px-6 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-sky-100 to-cyan-100">
                    <FiEye className="h-12 w-12 text-sky-500" />
                  </div>
                  <h4 className="mb-3 text-xl font-semibold text-slate-900">
                    Your Portfolio Preview Will Appear Here
                  </h4>
                  <p className="mb-6 leading-relaxed text-slate-600">
                    Fill out the form on the left and click Generate Portfolio to see your mock portfolio preview assembled locally in the browser.
                  </p>
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100">
                        <span className="text-xs font-bold text-sky-600">1</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Complete the form steps
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          Add your information across all 5 steps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100">
                        <span className="text-xs font-bold text-cyan-600">2</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Click Generate Portfolio
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          A local mock preview will be assembled instantly
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100">
                        <span className="text-xs font-bold text-sky-600">3</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Preview and download
                        </p>
                        <p className="mt-0.5 text-xs text-slate-600">
                          View on different devices and export the local HTML
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PreviewContainer;
