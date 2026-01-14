import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";
import { MiniNavbar } from "../shared/MiniNavbar";
import { MiniHeroSection } from "../shared/MiniHeroSection";
import { MiniProjectCard } from "../shared/MiniProjectCard";

interface PersonalStorytellingPreviewProps {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const PersonalStorytellingPreview: React.FC<
  PersonalStorytellingPreviewProps
> = ({ themeColors }) => {
  return (
    <TemplatePreviewBase themeColors={themeColors}>
      <div
        className="w-full h-full"
        style={{ backgroundColor: themeColors.background }}
      >
        {/* Navbar */}
        <MiniNavbar headerStyle="glass" logoText="PS" />

        {/* Hero Section */}
        <MiniHeroSection
          title="My Story"
          subtitle="Sharing experiences and connecting through meaningful work"
          density="compact"
        />

        {/* Projects Section */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-3 gap-2">
            <MiniProjectCard
              title="Travel Blog"
              metric="50+ Stories"
              cardStyle="glass"
            />
            <MiniProjectCard
              title="Photography"
              metric="300+ Photos"
              cardStyle="glass"
            />
            <MiniProjectCard
              title="Community"
              metric="1K+ Members"
              cardStyle="glass"
            />
          </div>
        </div>
      </div>
    </TemplatePreviewBase>
  );
};
