"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FiArrowRight, FiSkipForward, FiDroplet } from "react-icons/fi";
import { usePortfolioStore } from "@/stores/usePortfolioStore";
import { QuestionCard } from "./components/QuestionCard";
import { CustomNotesSection } from "./components/CustomNotesSection";
import { STYLE_QUESTIONS, FALLBACK_STYLE_OPTIONS, StyleSuggestion } from "@/types/style";

const StyleDiscussionPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");

  const { stylePreferences, updateStylePreference, setTemplateId } =
    usePortfolioStore();

  const [suggestions] = useState<StyleSuggestion | null>(FALLBACK_STYLE_OPTIONS);

  // Save templateId to Zustand when page loads
  useEffect(() => {
    if (templateId) {
      setTemplateId(templateId);
    }
  }, [templateId, setTemplateId]);


  const handleSkip = () => {
    router.push(`/dashboard-user/create/upload?templateId=${templateId}`);
  };

  const handleContinue = () => {
    router.push(`/dashboard-user/create/upload?templateId=${templateId}`);
  };

  return (
    <div className="relative min-h-screen p-10 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <FiDroplet className="w-10 h-10 text-sky-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">
              Customize Your Style
            </h1>
            <p className="text-slate-300 text-lg mt-2">
              Answer a few questions to personalize your portfolio design
            </p>
          </div>
        </div>

      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10"
        >
          <div className="space-y-8">
            {/* Question 1: Color Scheme */}
            <QuestionCard
              question={STYLE_QUESTIONS.colorScheme.question}
              description={STYLE_QUESTIONS.colorScheme.description}
              options={suggestions?.colorScheme || []}
              selectedValue={stylePreferences.colorScheme}
              onSelect={(value) => updateStylePreference("colorScheme", value)}
              questionKey="colorScheme"
            />

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Question 2: Layout Density */}
            <QuestionCard
              question={STYLE_QUESTIONS.layoutDensity.question}
              description={STYLE_QUESTIONS.layoutDensity.description}
              options={suggestions?.layoutDensity || []}
              selectedValue={stylePreferences.layoutDensity}
              onSelect={(value) => updateStylePreference("layoutDensity", value)}
              questionKey="layoutDensity"
            />

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Question 3: Tone */}
            <QuestionCard
              question={STYLE_QUESTIONS.tone.question}
              description={STYLE_QUESTIONS.tone.description}
              options={suggestions?.tone || []}
              selectedValue={stylePreferences.tone}
              onSelect={(value) => updateStylePreference("tone", value)}
              questionKey="tone"
            />

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Question 4: Visual Style */}
            <QuestionCard
              question={STYLE_QUESTIONS.visualStyle.question}
              description={STYLE_QUESTIONS.visualStyle.description}
              options={suggestions?.visualStyle || []}
              selectedValue={stylePreferences.visualStyle}
              onSelect={(value) => updateStylePreference("visualStyle", value)}
              questionKey="visualStyle"
            />

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Question 5: Section Emphasis */}
            <QuestionCard
              question={STYLE_QUESTIONS.sectionEmphasis.question}
              description={STYLE_QUESTIONS.sectionEmphasis.description}
              options={suggestions?.sectionEmphasis || []}
              selectedValue={stylePreferences.sectionEmphasis}
              onSelect={(value) => updateStylePreference("sectionEmphasis", value)}
              questionKey="sectionEmphasis"
            />

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Custom Notes */}
            <CustomNotesSection
              value={stylePreferences.customNotes}
              onChange={(value) => updateStylePreference("customNotes", value)}
            />
          </div>
        </motion.div>
      </div>

      {/* Floating Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4"
      >
        {/* Skip Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            boxShadow: "0 0 25px rgba(255, 255, 255, 0.15)"
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={handleSkip}
          className="px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/20 text-white/90 rounded-full font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
        >
          <FiSkipForward className="w-5 h-5" />
          Use Template Defaults
        </motion.button>

        {/* Continue Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            boxShadow: "0 0 40px rgba(255, 255, 255, 0.25)"
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={handleContinue}
          className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full font-bold shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center gap-3"
        >
          Continue to Upload
          <FiArrowRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default StyleDiscussionPage;
