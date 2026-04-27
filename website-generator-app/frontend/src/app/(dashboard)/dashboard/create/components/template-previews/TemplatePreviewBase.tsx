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
  scale = 0.56,
}) => {
  return (
    <div className="w-full h-full overflow-hidden flex justify-center">
      <div
        style={{
          width: `${640 * scale}px`,
          height: `${500 * scale}px`,
          flexShrink: 0,
        }}
      >
        <div
          className="origin-top-left"
          style={{
            width: "640px",
            height: "500px",
            transform: `scale(${scale})`,
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
    </div>
  );
};
