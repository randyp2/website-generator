import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";

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
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(${themeColors.text} 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Navbar */}
        <nav className="px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-[7px] font-mono font-bold"
              style={{ backgroundColor: themeColors.accent, color: "#fff" }}
            >
              {"</>"}
            </div>
            <span
              className="text-[10px] font-mono font-semibold tracking-tight"
              style={{ color: themeColors.text }}
            >
              dev.portfolio
            </span>
          </div>
          <div className="flex items-center gap-4">
            {["Projects", "Stack", "Contact"].map((link, i) => (
              <span
                key={i}
                className="text-[9px] font-mono opacity-50"
                style={{ color: themeColors.text }}
              >
                {link}
              </span>
            ))}
          </div>
        </nav>

        {/* Hero */}
        <div className="px-8 pt-6 pb-8 relative">
          <div className="flex items-start gap-8">
            <div className="flex-1">
              <p
                className="text-[9px] font-mono mb-2 opacity-50"
                style={{ color: themeColors.accent }}
              >
                {"// Full-Stack Developer"}
              </p>
              <h1
                className="text-[28px] font-bold mb-2 leading-[1.1] tracking-tight"
                style={{ color: themeColors.text }}
              >
                Building clean,
                <br />
                <span style={{ color: themeColors.accent }}>efficient</span>{" "}
                code.
              </h1>
              <p
                className="text-[10px] leading-relaxed opacity-40 mb-5 max-w-[280px]"
                style={{ color: themeColors.text }}
              >
                Crafting scalable solutions with modern technologies
              </p>
              <div className="flex gap-2">
                <div
                  className="px-4 py-1.5 rounded-md text-[9px] font-semibold"
                  style={{ backgroundColor: themeColors.accent, color: "#fff" }}
                >
                  View Projects
                </div>
                <div
                  className="px-4 py-1.5 rounded-md text-[9px] font-semibold border"
                  style={{
                    borderColor: themeColors.secondary + "40",
                    color: themeColors.text,
                    opacity: 0.6,
                  }}
                >
                  GitHub
                </div>
              </div>
            </div>

            {/* Terminal mockup */}
            <div
              className="w-[200px] rounded-lg overflow-hidden border flex-shrink-0"
              style={{ borderColor: themeColors.secondary + "30" }}
            >
              <div
                className="px-3 py-1.5 flex items-center gap-1.5"
                style={{ backgroundColor: themeColors.primary }}
              >
                <div className="w-2 h-2 rounded-full bg-red-400/60" />
                <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
                <div className="w-2 h-2 rounded-full bg-green-400/60" />
                <span
                  className="text-[7px] font-mono ml-2 opacity-40"
                  style={{ color: themeColors.text }}
                >
                  terminal
                </span>
              </div>
              <div className="px-3 py-2.5 space-y-1.5" style={{ backgroundColor: themeColors.primary + "cc" }}>
                {[
                  { cmd: "$ tech-stack", color: themeColors.accent },
                  { cmd: "→ React, Node, TypeScript", color: themeColors.secondary },
                  { cmd: "→ PostgreSQL, Docker", color: themeColors.secondary },
                  { cmd: "$ experience", color: themeColors.accent },
                  { cmd: "→ 5+ years", color: themeColors.secondary },
                ].map((line, i) => (
                  <p
                    key={i}
                    className="text-[7px] font-mono"
                    style={{ color: line.color, opacity: line.cmd.startsWith("$") ? 0.9 : 0.5 }}
                  >
                    {line.cmd}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Project cards */}
        <div className="px-8">
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "E-Commerce API", tech: "Node + PostgreSQL", color: "#3b82f6" },
              { name: "Dashboard UI", tech: "React + D3.js", color: "#8b5cf6" },
              { name: "Mobile App", tech: "React Native", color: "#06b6d4" },
            ].map((project, i) => (
              <div
                key={i}
                className="rounded-lg overflow-hidden border"
                style={{ borderColor: themeColors.secondary + "20" }}
              >
                <div
                  className="h-[50px] relative"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}15, ${project.color}08)`,
                  }}
                >
                  {/* Fake code lines */}
                  <div className="p-2.5 space-y-1">
                    {[...Array(3)].map((_, j) => (
                      <div
                        key={j}
                        className="h-[3px] rounded-full"
                        style={{
                          backgroundColor: project.color,
                          opacity: 0.15,
                          width: `${50 + j * 15}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="px-2.5 py-2" style={{ backgroundColor: themeColors.primary + "80" }}>
                  <p
                    className="text-[9px] font-semibold truncate"
                    style={{ color: themeColors.text }}
                  >
                    {project.name}
                  </p>
                  <p
                    className="text-[7px] opacity-40 mt-0.5"
                    style={{ color: themeColors.text }}
                  >
                    {project.tech}
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
