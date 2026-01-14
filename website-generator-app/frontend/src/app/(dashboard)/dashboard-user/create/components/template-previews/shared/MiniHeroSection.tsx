import React from "react";
import { FiArrowRight } from "react-icons/fi";

interface MiniHeroSectionProps {
  title: string;
  subtitle: string;
  density: "compact" | "spacious" | "minimal";
  showImage?: boolean;
}

export const MiniHeroSection: React.FC<MiniHeroSectionProps> = ({
  title,
  subtitle,
  density,
  showImage = true,
}) => {
  const paddingClass =
    density === "spacious" ? "px-8 py-8" : density === "compact" ? "px-8 py-5" : "px-8 py-4";

  return (
    <div className={`${paddingClass} grid grid-cols-12 gap-6 items-center`}>
      {/* Left Content */}
      <div className={showImage ? "col-span-7" : "col-span-12"}>
        <h1
          className="text-2xl font-bold mb-2 leading-tight"
          style={{ color: "var(--theme-text)" }}
        >
          {title}
        </h1>
        <p
          className="text-xs mb-4 opacity-70 leading-relaxed"
          style={{ color: "var(--theme-text)" }}
        >
          {subtitle}
        </p>
        <button
          className="px-4 py-1.5 text-[10px] font-semibold rounded-lg transition-all hover:scale-105"
          style={{
            backgroundColor: "var(--theme-accent)",
            color: "var(--theme-bg)",
          }}
        >
          <span className="flex items-center gap-1.5">
            View Work
            <FiArrowRight className="w-3 h-3" />
          </span>
        </button>
      </div>

      {/* Right Image */}
      {showImage && (
        <div className="col-span-5">
          <div
            className="aspect-square rounded-lg flex items-center justify-center opacity-20"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            <span
              className="text-[10px] font-medium"
              style={{ color: "var(--theme-text)" }}
            >
              Profile
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
