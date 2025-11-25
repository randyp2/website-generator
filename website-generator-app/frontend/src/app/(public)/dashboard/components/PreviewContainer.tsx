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

const phases = [
  "Analyzing your portfolio details…",
  "Designing layout and visual structure…",
  "Applying Portfolio AI theme and color system…",
  "Crafting hero section and about content…",
  "Rendering skills and project panels…",
  "Finalizing animations and polishing UI…",
];

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

  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [isCodeVerifying, setIsCodeVerifying] = useState<boolean>(false);
  const [codeVerified, setCodeVerified] = useState<boolean>(false);

  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [showFinalPreview, setShowFinalPreview] = useState<boolean>(false);
  const [streakPosition, setStreakPosition] = useState<number>(0);
  const [textWavePosition, setTextWavePosition] = useState<number>(0);
  const [isWaveCooldown, setIsWaveCooldown] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<number>(0);

  const streakIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textWaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveCooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const breathingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      setCurrentPhaseIndex(0);
      setShowFinalPreview(false);
      setStreakPosition(0);
      setTextWavePosition(-25); // Start before 0 to sweep in smoothly
      setIsWaveCooldown(false);
      setBreathingPhase(0);

      // ========================================
      // ⚡ QUICK ADJUSTMENT GUIDE
      // ========================================
      // 1. Bar wave speed: Lines 114-117 (increment + interval)
      // 2. Text wave speed: Lines 135-137 (increment + interval)
      // 3. Text wave cooldown: Line 132 (2000ms = 2 seconds pause)
      // 4. Breathing speed: Line 142 (interval)
      // 5. Breathing intensity: Line 503 (0.08 multiplier)
      // 6. Phase durations: Line 93 array values
      // ========================================

      // PHASE DURATION CONFIGURATION (in milliseconds)
      // Each phase will display for a randomized duration from this array
      // Current total: 240000ms (4 minutes)
      // Adjust these values to change how long each phase displays
      const phaseDurations = [30000, 35000, 45000, 50000, 40000, 40000];
      const shuffledDurations = phaseDurations.sort(() => Math.random() - 0.5);

      const scheduleNextPhase = (index: number) => {
        if (index < phases.length - 1) {
          phaseTimeoutRef.current = setTimeout(() => {
            setCurrentPhaseIndex(index + 1);
            scheduleNextPhase(index + 1);
          }, shuffledDurations[index]);
        }
      };

      scheduleNextPhase(0);

      // Bar wave animation - controls the loading bar streak
      // ⚡ ADJUST SPEED HERE: Change the numbers below
      // For FASTER: increase the increment (+2, +3, +5) or lower the interval (10ms, 5ms)
      // For SLOWER: decrease the increment (+0.5) or raise the interval (30ms, 50ms)
      streakIntervalRef.current = setInterval(() => {
        setStreakPosition((prev) => {
          if (prev >= 100) return 0;
          return prev + 1; // ⚡ SPEED: Change this value (higher = faster)
        });
      }, 20); // ⚡ SPEED: Change this value in ms (lower = faster)

      // Text wave animation - controls the phase text wave effect with cooldown
      // Wave travels from -25 to 125 to smoothly sweep through all characters
      // ⚡ ADJUST SPEED HERE: Change the number below
      // For FASTER: increase the increment (+5, +8, +10) or lower the interval (10ms, 5ms)
      // For SLOWER: decrease the increment (+0.5, +1) or raise the interval (30ms, 50ms)
      textWaveIntervalRef.current = setInterval(() => {
        setTextWavePosition((prev) => {
          if (prev >= 125) {
            // Wave completed (swept past all characters) - start cooldown
            setIsWaveCooldown(true);
            // ⚡ ADJUST COOLDOWN: Change 2000ms (2 seconds) to adjust pause between waves
            waveCooldownTimeoutRef.current = setTimeout(() => {
              setIsWaveCooldown(false);
              setTextWavePosition(-25); // Reset to start position (before first character)
            }, 2000); // ⚡ COOLDOWN: Change this value (2000ms = 2 seconds)
            return 125; // Stay at 125 during cooldown
          }
          return prev + 2; // ⚡ SPEED: Change this value (higher = faster)
        });
      }, 30); // ⚡ SPEED: Change this value in ms (lower = faster)

      // Breathing animation - creates gentle pulsing effect on all bars
      // ⚡ ADJUST BREATHING: Change interval (50ms) for speed, see bar code for intensity
      breathingIntervalRef.current = setInterval(() => {
        setBreathingPhase((prev) => (prev + 1) % 360); // Full breathing cycle
      }, 50); // ⚡ Breathing speed: lower = faster breathing
    } else {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
      if (streakIntervalRef.current) {
        clearInterval(streakIntervalRef.current);
      }
      if (textWaveIntervalRef.current) {
        clearInterval(textWaveIntervalRef.current);
      }
      if (waveCooldownTimeoutRef.current) {
        clearTimeout(waveCooldownTimeoutRef.current);
      }
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }

      if (generatedHTML) {
        setTimeout(() => {
          setShowFinalPreview(true);
        }, 300);
      }
    }

    return () => {
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
      if (streakIntervalRef.current) {
        clearInterval(streakIntervalRef.current);
      }
      if (textWaveIntervalRef.current) {
        clearInterval(textWaveIntervalRef.current);
      }
      if (waveCooldownTimeoutRef.current) {
        clearTimeout(waveCooldownTimeoutRef.current);
      }
      if (breathingIntervalRef.current) {
        clearInterval(breathingIntervalRef.current);
      }
    };
  }, [isLoading, generatedHTML]);

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
    setIsEmailSending(true);

    console.log("Submitting email for preview:", email);

    try {
      const { fileName, fileContent } = await prepareAnonymousPreview(
        generatedHTML
      );

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

      const data = await res.json();

      if (!data.success) {
        alert("Invalid verification code. Please try again.");
        setIsCodeVerifying(false);
        return;
      }

      setCodeVerified(true);

      setTimeout(() => {
        setShowCodeModal(false);
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

  // LOADING BAR CONFIGURATION
  // totalBars: number of vertical bars in the loading animation (higher = smoother but more intensive)
  const totalBars = 50;

  // 🎨 RANDOM BAR HEIGHTS: Generate organic, varied heights for living effect
  // Each bar gets a unique random height based on its index (stable across renders)
  const getRandomBarHeight = (index: number) => {
    // Using sine with index creates organic, varied heights
    const seed = Math.sin(index * 12.9898 + index * 78.233) * 43758.5453;
    const random = seed - Math.floor(seed);
    // ⚡ ADJUST HEIGHT RANGE: Change min and max values for different height variations
    return 50 + random * 50; // Range: 50% to 100% height
  };

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
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

            {showPreview && !isLoading && (
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

          {showPreview && !isLoading && (
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

        <div className="relative bg-slate-50 p-6 min-h-[600px]">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center p-12"
              >
                <div className="w-full max-w-3xl space-y-12">
                  <div className="text-center space-y-3">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 text-sky-600 mb-2"
                    >

                      <span className="text-sm font-semibold uppercase tracking-wider">
                        Generating Portfolio
                      </span>
                    </motion.div>

                    <motion.div
                      key={currentPhaseIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="text-2xl font-bold relative flex justify-center"
                    >
                      {phases[currentPhaseIndex].split("").map((char, index) => {
                        const totalChars = phases[currentPhaseIndex].length;
                        const charPosition = (index / totalChars) * 100;
                        const distanceFromWave = Math.abs(
                          charPosition - textWavePosition
                        );

                        // TEXT WAVE EFFECT CONFIGURATION
                        // waveRadius: how wide the wave effect spreads (higher = wider wave)
                        // ⚡ IMPORTANT: Increase waveRadius if wave is too fast and blue disappears
                        const waveRadius = 25;
                        const isInWave = distanceFromWave < waveRadius;
                        const waveIntensity = isInWave
                          ? 1 - distanceFromWave / waveRadius
                          : 0;

                        // isCenter: defines the peak of the wave (lower = narrower peak)
                        const isCenter = distanceFromWave < 15;
                        const centerIntensity = isCenter
                          ? 1 - distanceFromWave / 15
                          : 0;

                        // SCALE CONFIGURATION
                        // ⚡ ADJUST LETTER SCALING HERE (Lines 371 & 373)
                        // Center scale: Change 0.2 on LINE 371 (lower = less scaling)
                        // Valley scale: Change 0.1 on LINE 373 (lower = less valley effect)
                        // Set to 0 to disable scaling completely
                        let scale = 1;
                        if (isCenter) {
                          scale = 1 + centerIntensity * 0.2; // ⚡ LINE 371: Letter peak scale (current: 0.2 = 20% larger)
                        } else if (isInWave) {
                          scale = 1 - (1 - waveIntensity) * 0.1; // ⚡ LINE 373: Letter valley scale (current: 0.1 = 10% smaller)
                        }

                        return (
                          <span
                            key={index}
                            // ⚡ Transition speed MUST be fast enough to keep up with wave
                            // Current: 50ms - FAST and snappy
                            // Change to duration-75 or duration-100 if too jerky
                            className="inline-block transition-all duration-50 ease-linear"
                            style={{
                              transform: `scale(${scale})`,
                              // Color: Keep consistent dark color (no blue flash)
                              color: "#0f172a",
                              // No glow effect for cleaner look
                              textShadow: "none",
                            }}
                          >
                            {char === " " ? "\u00A0" : char}
                          </span>
                        );

                      })}
                    </motion.div>
                  </div>

                  <div className="relative flex items-center justify-center gap-2 h-32">
                    {Array.from({ length: totalBars }).map((_, index) => {
                      const barPosition = (index / totalBars) * 100;
                      const distanceFromStreak = Math.abs(
                        barPosition - streakPosition
                      );

                      // BAR WAVE EFFECT CONFIGURATION
                      // waveRadius: how wide the wave effect spreads across bars (higher = wider wave)
                      const waveRadius = 10;
                      const isInWave = distanceFromStreak < waveRadius;
                      const waveIntensity = isInWave
                        ? 1 - distanceFromStreak / waveRadius
                        : 0;

                      // isCenter: defines the peak bars at center of wave (lower = fewer bars in peak)
                      const isCenter = distanceFromStreak < 5;
                      const centerIntensity = isCenter
                        ? 1 - distanceFromStreak / 5
                        : 0;

                      // 🎨 RANDOM HEIGHT: Each bar gets unique random height for living effect
                      const randomHeight = getRandomBarHeight(index);

                      // 💨 BREATHING EFFECT: Gentle pulse using sine wave
                      // ⚡ ADJUST BREATHING: Change 0.08 for more/less breathing intensity
                      const breathingScale = 1 + Math.sin((breathingPhase * Math.PI) / 180) * 0.08;

                      // VERTICAL SCALE CONFIGURATION
                      // Combines: Wave effect + Breathing effect
                      // ⚡ REDUCED scaling to prevent bars from going too high
                      // Center vertical scale: reduced from 0.8 to 0.3 (30% taller at peak)
                      // Valley vertical scale: reduced from 0.15 to 0.05 (5% shorter in valley)
                      let scaleY = breathingScale; // Start with breathing
                      if (isCenter) {
                        scaleY *= 1 + centerIntensity * 0.3; // ⚡ Reduced peak scaling
                      } else if (isInWave) {
                        scaleY *= 1 - (1 - waveIntensity) * 0.05; // ⚡ Reduced valley scaling
                      }

                      // HORIZONTAL SCALE CONFIGURATION
                      // Center horizontal scale: higher = wider bars at peak (current: 0.2 = 20% wider)
                      const scaleX = isCenter ? 1 + centerIntensity * 0.2 : 1;

                      return (
                        <motion.div
                          key={index}
                          className="w-3 rounded-sm"
                          style={{
                            // 🎨 Each bar has randomized height (50-100%) for living, organic look
                            height: `${randomHeight}%`,
                            transform: `scaleY(${scaleY}) scaleX(${scaleX})`,
                            transformOrigin: "bottom",
                            // Color intensity: adjust 0.5 (base) and 0.5 (range) for brightness
                            backgroundColor: isInWave
                              ? `rgba(14, 165, 233, ${0.5 + waveIntensity * 0.5})`
                              : "rgb(226, 232, 240)",
                            // Glow configuration: first value = spread (30px), second = opacity (0.8)
                            // Double glow: outer (30px, 0.8) + inner (15px, 0.5)
                            boxShadow: isInWave
                              ? `0 0 ${waveIntensity * 30}px rgba(14, 165, 233, ${waveIntensity * 0.8}), 0 0 ${waveIntensity * 15}px rgba(14, 165, 233, ${waveIntensity * 0.5})`
                              : "none",
                            // ⚡ Transition speed: lower = snappier wave (current: 0.1s = 100ms)
                            // Change to 0.15s for slower, 0.05s for faster
                            transition: "all 0.1s ease-out",
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : showPreview && generatedHTML && showFinalPreview ? (
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
