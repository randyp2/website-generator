import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";
import { MiniNavbar } from "../shared/MiniNavbar";
import { MiniHeroSection } from "../shared/MiniHeroSection";
import { MiniProjectCard } from "../shared/MiniProjectCard";

interface MinimalTechPreviewProps {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const MinimalTechPreview: React.FC<MinimalTechPreviewProps> = ({
  themeColors,
}) => {
  return (
    <TemplatePreviewBase themeColors={themeColors}>
      <div
        className="w-full h-full"
        style={{ backgroundColor: themeColors.background }}
      >
        {/* Navbar */}
        <MiniNavbar headerStyle="transparent" logoText="MT" />

        {/* Hero Section */}
        <MiniHeroSection
          title="Developer Portfolio"
          subtitle="Full-stack engineer crafting clean, efficient solutions"
          density="compact"
        />

        {/* Projects Section */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <MiniProjectCard
              title="E-Commerce Platform"
              metric="React + Node.js"
              cardStyle="flat"
            />
            <MiniProjectCard
              title="Mobile App"
              metric="React Native"
              cardStyle="flat"
            />
          </div>
        </div>
      </div>
    </TemplatePreviewBase>
  );
};
