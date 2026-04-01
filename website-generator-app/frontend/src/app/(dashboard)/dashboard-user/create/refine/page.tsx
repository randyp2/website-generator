"use client";

import React from "react";

import { Preview } from "./components/Preview";
import { GenerationOverlay } from "./components/loaders/GenerationOverlay";

const MOCK_GENERATION_PHASE = "PROCESSING" as const;
const MOCK_TOTAL_SECTIONS = 6;

const AIRefinementPage: React.FC = () => {
  return (
    <div className="relative h-screen overflow-hidden">
      <Preview
        sections={null}
        generationPhase={MOCK_GENERATION_PHASE}
        totalSections={MOCK_TOTAL_SECTIONS}
        layoutMode="preview"
      />

      <div className="pointer-events-none absolute left-1/2 top-6 z-20 w-full max-w-xl -translate-x-1/2 px-4">
        <div className="refine-mock-notice rounded-2xl px-4 py-3 text-center text-sm">
          Refine is currently a nonfunctional mockup. This screen intentionally stays in an infinite loading state and does not generate a portfolio.
        </div>
      </div>

      <GenerationOverlay phase={MOCK_GENERATION_PHASE} />
    </div>
  );
};

export default AIRefinementPage;
