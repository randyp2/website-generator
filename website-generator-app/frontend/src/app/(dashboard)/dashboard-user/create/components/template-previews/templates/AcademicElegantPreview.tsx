import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";
import { MiniNavbar } from "../shared/MiniNavbar";
import { MiniHeroSection } from "../shared/MiniHeroSection";
import { MiniProjectCard } from "../shared/MiniProjectCard";

interface AcademicElegantPreviewProps {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const AcademicElegantPreview: React.FC<AcademicElegantPreviewProps> = ({
  themeColors,
}) => {
  return (
    <TemplatePreviewBase themeColors={themeColors}>
      <div
        className="w-full h-full"
        style={{ backgroundColor: themeColors.background }}
      >
        {/* Navbar */}
        <MiniNavbar headerStyle="solid" logoText="AE" />

        {/* Hero Section */}
        <MiniHeroSection
          title="Research Portfolio"
          subtitle="Advancing knowledge through rigorous academic inquiry"
          density="spacious"
        />

        {/* Publications Section */}
        <div className="px-8 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <MiniProjectCard
              title="Published Research"
              metric="Journal Article"
              cardStyle="flat"
            />
            <MiniProjectCard
              title="Conference Paper"
              metric="Peer Reviewed"
              cardStyle="flat"
            />
          </div>
        </div>
      </div>
    </TemplatePreviewBase>
  );
};
