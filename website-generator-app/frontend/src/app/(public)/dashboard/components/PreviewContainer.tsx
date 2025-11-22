"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEye,
  FiDownload,
  FiExternalLink,
  FiRefreshCw,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiZap,
  FiMail,
  FiX,
} from "react-icons/fi";
import { FormState } from "@/webgenForm/formType";
import { EmailModal } from "./EmailModal";
import { ShowCodeModal } from "./ShowCodeModal";
import { prepareAnonymousPreview } from "@/utils/storage/uploadPreview";

interface PreviewContainerProps {
  formData: FormState;
  showPreview: boolean;
  isLoading: boolean;
  generatedHTML: string;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const PreviewContainer: React.FC<PreviewContainerProps> = ({
  formData,
  showPreview,
  isLoading,
  generatedHTML,
}) => {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [isEmailSending, setIsEmailSending] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

  // Code verification states
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isCodeVerifying, setIsCodeVerifying] = useState<boolean>(false);
  const [codeVerified, setCodeVerified] = useState<boolean>(false);

  const handleDownload = () => {
    const blob = new Blob([generatedHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${formData.name
      .replace(/\s+/g, "-")
      .toLowerCase()}-portfolio.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenNewTab = () => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(generatedHTML);
      newWindow.document.close();
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailSending(true); // For loading effect

    console.log("Submitting email for preview:", email);

    try {
      // Prepare downloadable HTML file
      const { fileName, fileContent } = await prepareAnonymousPreview(
        generatedHTML
      );

      // Step 1 — send verification email
      const res = await fetch("/api/sendPreviewVerification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fileContent,
          fileName,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        alert("Failed to send verification code.");
        setIsEmailSending(false);
        return;
      }
      setShowEmailModal(false);
      setShowCodeModal(true);
    } catch (error) {
      console.error("Failed to send email:", error);
      setIsEmailSending(false);
    }
    console.log("Email submitted:", email);
  };

  /**
   * Call backend API route: /api/verifyPreviewCode
   *
   * Send:
   *  - email: the email the user entered in the first modal
   *  - code: the 6-digit code they typed into the verification modal
   *
   * This API:
   *  - looks up the (email, code) pair in the email_verifications table
   *  - if valid: grabs preview_url, deletes the row, emails the link
   *  - returns { success: true, previewUrl }
   */
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCodeVerifying(true);

    try {
      const res = await fetch("/api/verifyPreviewCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
      });

      // Get response data
      const data = await res.json();

      if (!data.success) {
        alert("Invalid verification code. Please try again.");
        setIsCodeVerifying(false);
        return;
      }

      // Code verified successfully, the server has sent the HTML file to the user's email
      setCodeVerified(true);

      // After showing success message, close the modal
      setTimeout(() => {
        setShowCodeModal(false);
        // Reset states for next time
        setVerificationCode("");
        setCodeVerified(false);
        setEmail("");
      }, 2000);
    } catch (error) {
      console.error("Verification failed:", error);
      alert("Something went wrong verifying your code.");
    } finally {
      setIsCodeVerifying(false);
    }
  };

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

  return (
    <div className="sticky top-24">
      {/* Card Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-br from-sky-50 to-cyan-50/50 border-b border-slate-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-sky-400 to-cyan-400 rounded-lg flex items-center justify-center shadow-sm">
                <FiEye className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Live Preview
                </h3>
                <p className="text-sm text-slate-600">
                  {showPreview
                    ? "Your portfolio is ready!"
                    : "Waiting for generation..."}
                </p>
              </div>
            </div>

            {/* Device Switcher - Only show when preview is active */}
            {showPreview && (
              <div className="hidden md:flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 shadow-sm">
                <button
                  onClick={() => setDevice("desktop")}
                  className={`p-2 rounded transition-all ${
                    device === "desktop"
                      ? "bg-sky-100 text-sky-600"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                  title="Desktop View"
                >
                  <FiMonitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice("tablet")}
                  className={`p-2 rounded transition-all ${
                    device === "tablet"
                      ? "bg-sky-100 text-sky-600"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                  title="Tablet View"
                >
                  <FiTablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice("mobile")}
                  className={`p-2 rounded transition-all ${
                    device === "mobile"
                      ? "bg-sky-100 text-sky-600"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                  title="Mobile View"
                >
                  <FiSmartphone className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons - Only show when preview is active */}
          {showPreview && (
            <div className="flex flex-wrap gap-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:border-slate-300 hover:shadow-sm transition-all shadow-sm"
              >
                <FiDownload className="w-4 h-4" />
                Download HTML
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOpenNewTab}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:border-slate-300 hover:shadow-sm transition-all shadow-sm"
              >
                <FiExternalLink className="w-4 h-4" />
                Open in New Tab
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 border border-sky-500 text-white rounded-lg font-medium text-sm hover:bg-sky-600 hover:border-sky-600 hover:shadow-sm transition-all shadow-sm"
              >
                <FiMail className="w-4 h-4" />
                Email Your Website
              </motion.button>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="relative bg-slate-50 p-6 min-h-[600px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              /* Loading State */
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-slate-50"
              >
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-20 h-20 border-4 border-sky-200 border-t-sky-500 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <FiZap className="w-8 h-8 text-sky-500" />
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-2">
                    Generating Your Portfolio
                  </h4>
                  <p className="text-sm text-slate-600 max-w-xs mx-auto">
                    Our AI is crafting your professional portfolio. This usually
                    takes 10-15 seconds...
                  </p>
                </div>
              </motion.div>
            ) : showPreview && generatedHTML ? (
              /* Preview State */
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex justify-center"
              >
                <div
                  className="bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden transition-all duration-300"
                  style={{ width: getDeviceWidth(), maxWidth: "100%" }}
                >
                  <iframe
                    srcDoc={generatedHTML}
                    title="Portfolio Preview"
                    className="w-full h-[600px] border-0"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-forms"
                  />
                </div>
              </motion.div>
            ) : (
              /* Empty State */
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center max-w-md mx-auto px-6">
                  <div className="w-24 h-24 bg-linear-to-br from-sky-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FiEye className="w-12 h-12 text-sky-500" />
                  </div>
                  <h4 className="text-xl font-semibold text-slate-900 mb-3">
                    Your Portfolio Preview Will Appear Here
                  </h4>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    Fill out the form on the left and click "Generate Portfolio"
                    to see your professional portfolio come to life in
                    real-time.
                  </p>
                  <div className="flex flex-col gap-3 text-left bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sky-600 text-xs font-bold">
                          1
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Complete the form steps
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Add your information across all 5 steps
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-cyan-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-cyan-600 text-xs font-bold">
                          2
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Click Generate Portfolio
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          AI will create your portfolio instantly
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-sky-600 text-xs font-bold">
                          3
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Preview & download
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          View on different devices and export
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

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          setShowEmailModal={setShowEmailModal}
          email={email}
          setEmail={setEmail}
          isEmailSending={isEmailSending}
          emailSent={emailSent}
          handleEmailSubmit={handleEmailSubmit}
        />
      )}

      {/* Verification Code Modal */}
      {showCodeModal && (
        <ShowCodeModal
          setShowCodeModal={setShowCodeModal}
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          isCodeVerifying={isCodeVerifying}
          codeVerified={codeVerified}
          handleCodeSubmit={handleCodeSubmit}
        />
      )}
    </div>
  );
};

export default PreviewContainer;
