import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";
import { MiniNavbar } from "../shared/MiniNavbar";
import { MiniHeroSection } from "../shared/MiniHeroSection";
import { MiniProjectCard } from "../shared/MiniProjectCard";

interface CreativeGradientPreviewProps {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const CreativeGradientPreview: React.FC<
  CreativeGradientPreviewProps
> = ({ themeColors }) => {
  return (
    <TemplatePreviewBase themeColors={themeColors}>
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
        }}
      >
        {/* Navbar */}
        <MiniNavbar headerStyle="glass" logoText="CG" />

        {/* Hero Section with light overlay */}
        <div className="bg-white/90 backdrop-blur-sm">
          <MiniHeroSection
            title="Creative Designer"
            subtitle="Bringing bold ideas to life through design"
            density="spacious"
          />

          {/* Projects Section */}
          <div className="px-8 pb-6">
            <div className="grid grid-cols-3 gap-2">
              <MiniProjectCard
                title="Brand Identity"
                metric="Visual Design"
                cardStyle="glass"
              />
              <MiniProjectCard
                title="Mobile UI"
                metric="App Design"
                cardStyle="glass"
              />
              <MiniProjectCard
                title="Web Design"
                metric="UI/UX"
                cardStyle="glass"
              />
            </div>
          </div>
        </div>
      </div>
    </TemplatePreviewBase>
  );
};
