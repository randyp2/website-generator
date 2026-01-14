import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";
import { MiniNavbar } from "../shared/MiniNavbar";
import { MiniHeroSection } from "../shared/MiniHeroSection";
import { MiniProjectCard } from "../shared/MiniProjectCard";

interface NeonDystopianPreviewProps {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const NeonDystopianPreview: React.FC<NeonDystopianPreviewProps> = ({
  themeColors,
}) => {
  return (
    <TemplatePreviewBase themeColors={themeColors}>
      <div
        className="w-full h-full relative"
        style={{ backgroundColor: themeColors.background }}
      >
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(${themeColors.accent} 1px, transparent 1px), linear-gradient(90deg, ${themeColors.accent} 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative z-10">
          {/* Navbar */}
          <MiniNavbar headerStyle="solid" logoText="ND" />

          {/* Hero Section */}
          <MiniHeroSection
            title="Future Portfolio"
            subtitle="Building tomorrow's web experiences today"
            density="minimal"
          />

          {/* Projects Section */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-2 gap-3">
              <MiniProjectCard
                title="Cyber Security"
                metric="Web3 Platform"
                cardStyle="elevated"
              />
              <MiniProjectCard
                title="AI Dashboard"
                metric="Machine Learning"
                cardStyle="elevated"
              />
            </div>
          </div>
        </div>
      </div>
    </TemplatePreviewBase>
  );
};
