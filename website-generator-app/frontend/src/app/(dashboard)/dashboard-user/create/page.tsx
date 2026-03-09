"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { HeaderSection } from "./components/HeaderSection";
import { TemplateSection } from "./components/TemplateSection";

const TemplateGallery: React.FC = () => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setTemplateId, setPortfolioId } = usePortfolioStore();

  useEffect(() => {
    usePortfolioStore.getState().reset();
  }, []);

  const handleContinue = async () => {
    if (!selectedTemplate || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch("/api/portfolio/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error?.error ?? "Failed to create draft");
        return;
      }

      const data = await res.json();
      const portfolioId = data?.portfolio?.id ?? null;

      setTemplateId(selectedTemplate);
      if (portfolioId) setPortfolioId(portfolioId);

      router.push(`/dashboard-user/create/style?portfolioId=${portfolioId}`);
    } catch (error) {
      console.error("Draft creation failed:", error);
      alert("Failed to create draft. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen space-y-8 p-10">
      <div className="relative z-10">
        <HeaderSection />

        <TemplateSection
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
        />

        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <motion.button
                whileHover={!isLoading ? {
                  scale: 1.05,
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  boxShadow: "0 0 40px rgba(255, 255, 255, 0.25)"
                } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={handleContinue}
                disabled={isLoading}
                className="hover:cursor-pointer px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Customize Style"}
                <FiArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TemplateGallery;
