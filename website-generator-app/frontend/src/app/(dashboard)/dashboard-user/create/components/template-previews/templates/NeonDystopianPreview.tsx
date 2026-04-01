import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";

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
        className="w-full h-full relative overflow-hidden"
        style={{ backgroundColor: "#050510" }}
      >
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `linear-gradient(${themeColors.primary} 1px, transparent 1px), linear-gradient(90deg, ${themeColors.primary} 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        {/* Glow effects */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] blur-[80px] opacity-20"
          style={{ background: themeColors.primary }}
        />
        <div
          className="absolute bottom-0 right-0 w-[200px] h-[200px] blur-[60px] opacity-10"
          style={{ background: themeColors.accent }}
        />

        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
          }}
        />

        {/* Navbar */}
        <nav className="px-8 py-3 flex items-center justify-between relative z-10 border-b" style={{ borderColor: themeColors.primary + "20" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 flex items-center justify-center"
              style={{ color: themeColors.primary }}
            >
              <span className="text-[12px]">⚡</span>
            </div>
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase"
              style={{ color: themeColors.primary }}
            >
              NEXUS
            </span>
          </div>
          <div className="flex items-center gap-4">
            {["Work", "Lab", "Link"].map((link, i) => (
              <span
                key={i}
                className="text-[8px] tracking-[0.1em] uppercase opacity-40"
                style={{ color: themeColors.primary }}
              >
                {link}
              </span>
            ))}
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: themeColors.primary, boxShadow: `0 0 6px ${themeColors.primary}` }}
            />
          </div>
        </nav>

        {/* Hero */}
        <div className="px-8 pt-8 pb-6 relative z-10">
          <div
            className="text-[8px] font-mono tracking-[0.2em] uppercase mb-3 opacity-50"
            style={{ color: themeColors.primary }}
          >
            {"// SYSTEM.INIT"}
          </div>
          <h1
            className="text-[32px] font-black leading-[0.95] mb-1 tracking-tight"
            style={{ color: "#fff" }}
          >
            FUTURE
          </h1>
          <h1
            className="text-[32px] font-black leading-[0.95] mb-3"
            style={{
              color: "transparent",
              WebkitTextStroke: `1.5px ${themeColors.primary}`,
            }}
          >
            BUILDER
          </h1>
          <p
            className="text-[10px] opacity-30 mb-5 max-w-[300px] leading-relaxed"
            style={{ color: themeColors.primary }}
          >
            Designing the digital frontier — where code meets creativity
          </p>
          <div className="flex gap-2">
            <div
              className="px-4 py-1.5 text-[9px] font-bold tracking-wider uppercase"
              style={{
                backgroundColor: themeColors.primary,
                color: "#050510",
                boxShadow: `0 0 20px ${themeColors.primary}40`,
              }}
            >
              Enter →
            </div>
            <div
              className="px-4 py-1.5 text-[9px] font-bold tracking-wider uppercase border"
              style={{
                borderColor: themeColors.primary + "40",
                color: themeColors.primary,
                opacity: 0.5,
              }}
            >
              Source
            </div>
          </div>
        </div>

        {/* Project cards */}
        <div className="px-8 relative z-10">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Neural Interface", tag: "AI/ML", color: themeColors.primary },
              { name: "Quantum Grid", tag: "Web3", color: themeColors.accent },
            ].map((project, i) => (
              <div
                key={i}
                className="rounded-sm overflow-hidden border"
                style={{
                  borderColor: project.color + "25",
                  backgroundColor: project.color + "08",
                }}
              >
                <div className="h-[48px] relative overflow-hidden">
                  {/* Circuit-like pattern */}
                  <div className="absolute inset-0 opacity-[0.15]" style={{
                    backgroundImage: `
                      linear-gradient(90deg, ${project.color} 1px, transparent 1px),
                      linear-gradient(${project.color} 1px, transparent 1px)
                    `,
                    backgroundSize: "12px 12px",
                  }} />
                  {/* Glowing dot */}
                  <div
                    className="absolute top-3 right-3 w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: project.color,
                      boxShadow: `0 0 8px ${project.color}`,
                    }}
                  />
                  {/* Horizontal line accent */}
                  <div
                    className="absolute bottom-0 left-0 h-[1px] w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${project.color}40, transparent)`,
                    }}
                  />
                </div>
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold" style={{ color: "#fff" }}>
                      {project.name}
                    </p>
                    <span
                      className="text-[7px] px-1.5 py-0.5 rounded-sm font-mono"
                      style={{
                        backgroundColor: project.color + "15",
                        color: project.color,
                      }}
                    >
                      {project.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TemplatePreviewBase>
  );
};
