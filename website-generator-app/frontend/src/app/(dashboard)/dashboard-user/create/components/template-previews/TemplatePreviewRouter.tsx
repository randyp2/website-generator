import type { IconType } from "react-icons";
import React from "react";
import { MinimalTechPreview } from "./templates/MinimalTechPreview";
import { CreativeGradientPreview } from "./templates/CreativeGradientPreview";
import { NeonDystopianPreview } from "./templates/NeonDystopianPreview";
import { AcademicElegantPreview } from "./templates/AcademicElegantPreview";
import { PersonalStorytellingPreview } from "./templates/PersonalStorytellingPreview";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  gradient: string;
  pattern: string;
  popular?: boolean;
  icon: IconType;
  tags: string[];
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  layoutStyle: {
    density: "compact" | "spacious" | "minimal";
    headerStyle: "transparent" | "solid" | "glass";
    cardStyle: "flat" | "elevated" | "glass";
  };
}

interface TemplatePreviewRouterProps {
  template: Template;
  isHovered: boolean;
}

export const TemplatePreviewRouter: React.FC<TemplatePreviewRouterProps> = ({
  template,
}) => {
  // Render the appropriate preview component based on template ID
  switch (template.id) {
    case "minimal-tech":
      return <MinimalTechPreview themeColors={template.themeColors} />;
    case "creative-gradient":
      return <CreativeGradientPreview themeColors={template.themeColors} />;
    case "neon-dystopian":
      return <NeonDystopianPreview themeColors={template.themeColors} />;
    case "academic-elegant":
      return <AcademicElegantPreview themeColors={template.themeColors} />;
    case "personal-storytelling":
      return (
        <PersonalStorytellingPreview themeColors={template.themeColors} />
      );
    default:
      // Fallback to gradient background
      return (
        <div
          className={`w-full h-full bg-gradient-to-br ${template.gradient}`}
        />
      );
  }
};
