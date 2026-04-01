import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";

interface CreativeGradientPreviewProps {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const CreativeGradientPreview: React.FC<CreativeGradientPreviewProps> = ({
  themeColors,
}) => {
  return (
    <TemplatePreviewBase themeColors={themeColors}>
      <div className="w-full h-full relative" style={{ backgroundColor: "#fafafa" }}>
        {/* Decorative gradient blobs */}
        <div
          className="absolute -top-12 -right-12 w-[200px] h-[200px] rounded-full blur-[60px] opacity-30"
          style={{ background: themeColors.accent }}
        />
        <div
          className="absolute top-[200px] -left-16 w-[180px] h-[180px] rounded-full blur-[50px] opacity-20"
          style={{ background: themeColors.primary }}
        />

        {/* Navbar */}
        <nav className="px-8 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`,
              }}
            />
            <span className="text-[11px] font-bold tracking-tight" style={{ color: themeColors.text }}>
              Studio
            </span>
          </div>
          <div className="flex items-center gap-4">
            {["Portfolio", "About", "Hire Me"].map((link, i) => (
              <span
                key={i}
                className="text-[9px] font-medium opacity-50"
                style={{ color: themeColors.text }}
              >
                {link}
              </span>
            ))}
          </div>
        </nav>

        {/* Hero */}
        <div className="px-8 pt-5 pb-6 relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div
                className="inline-block px-2.5 py-0.5 rounded-full text-[8px] font-semibold mb-3"
                style={{
                  backgroundColor: themeColors.accent + "18",
                  color: themeColors.accent,
                }}
              >
                Creative Designer
              </div>
              <h1
                className="text-[26px] font-extrabold leading-[1.1] mb-2"
                style={{ color: themeColors.text }}
              >
                Bringing{" "}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  bold ideas
                </span>
                <br />
                to life.
              </h1>
              <p className="text-[10px] opacity-40 mb-4 max-w-[260px]" style={{ color: themeColors.text }}>
                Award-winning designer crafting memorable digital experiences
              </p>
              <div
                className="inline-flex px-5 py-2 rounded-full text-[9px] font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`,
                }}
              >
                View Projects →
              </div>
            </div>

            {/* Abstract art element */}
            <div className="w-[160px] h-[160px] relative flex-shrink-0">
              <div
                className="absolute inset-0 rounded-3xl rotate-6"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.accent}30)`,
                }}
              />
              <div
                className="absolute inset-2 rounded-2xl -rotate-3"
                style={{
                  background: `linear-gradient(225deg, ${themeColors.accent}50, ${themeColors.secondary}50)`,
                }}
              />
              <div
                className="absolute inset-4 rounded-xl rotate-2 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.accent})`,
                }}
              >
                <span className="text-white text-[28px] font-black opacity-40">✦</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project grid */}
        <div className="px-8 relative z-10">
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Brand Identity", type: "Branding", gradient: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` },
              { name: "App Design", type: "UI/UX", gradient: `linear-gradient(135deg, ${themeColors.secondary}, ${themeColors.accent})` },
              { name: "Web Design", type: "Visual", gradient: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.primary})` },
            ].map((project, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm border border-white/40">
                <div
                  className="h-[55px] relative flex items-center justify-center"
                  style={{ background: project.gradient }}
                >
                  {/* Abstract shapes */}
                  <div className="w-6 h-6 border-2 border-white/40 rounded-lg rotate-12" />
                  <div className="w-4 h-4 bg-white/20 rounded-full absolute top-2 right-3" />
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[9px] font-bold" style={{ color: themeColors.text }}>
                    {project.name}
                  </p>
                  <p className="text-[7px] opacity-40" style={{ color: themeColors.text }}>
                    {project.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TemplatePreviewBase>
  );
};
