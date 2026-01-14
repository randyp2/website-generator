import React from "react";

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface TemplatePreviewBaseProps {
  themeColors: ThemeColors;
  children: React.ReactNode;
  scale?: number;
}

export const TemplatePreviewBase: React.FC<TemplatePreviewBaseProps> = ({
  themeColors,
  children,
  scale = 0.4,
}) => {
  return (
    <div
      className="w-64 h-52 overflow-hidden"
      style={{
        // Container for scaled content
        width: `${640 * scale}px`,
        height: `${500 * scale}px`,
      }}
    >
      <div
        className="origin-top-left"
        style={{
          width: "640px",
          height: "500px",
          transform: `scale(${scale})`,
          // Apply theme colors as CSS variables
          ["--theme-primary" as string]: themeColors.primary,
          ["--theme-secondary" as string]: themeColors.secondary,
          ["--theme-accent" as string]: themeColors.accent,
          ["--theme-bg" as string]: themeColors.background,
          ["--theme-text" as string]: themeColors.text,
        }}
      >
        {children}
      </div>
    </div>
  );
};
