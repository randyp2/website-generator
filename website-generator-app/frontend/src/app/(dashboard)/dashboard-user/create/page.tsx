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
    <div className="relative min-h-screen space-y-6 px-4 py-8 md:px-6">
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
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.22)"
                } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={handleContinue}
                disabled={isLoading}
                className="hover:cursor-pointer flex items-center gap-3 rounded-full border border-primary/70 bg-primary px-8 py-4 font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
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
