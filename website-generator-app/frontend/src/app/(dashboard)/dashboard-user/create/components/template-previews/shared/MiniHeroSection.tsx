import React from "react";
import { FiArrowRight } from "react-icons/fi";

interface MiniHeroSectionProps {
  title: string;
  subtitle: string;
  density: "compact" | "spacious" | "minimal";
  showImage?: boolean;
  imageContent?: React.ReactNode;
}

export const MiniHeroSection: React.FC<MiniHeroSectionProps> = ({
  title,
  subtitle,
  density,
  showImage = true,
  imageContent,
}) => {
  const paddingClass =
    density === "spacious"
      ? "px-8 py-8"
      : density === "compact"
      ? "px-8 py-5"
      : "px-8 py-4";

  return (
    <div className={`${paddingClass} grid grid-cols-12 gap-6 items-center`}>
      <div className={showImage ? "col-span-7" : "col-span-12"}>
        <h1
          className="text-2xl font-bold mb-2 leading-tight"
          style={{ color: "var(--theme-text)" }}
        >
          {title}
        </h1>
        <p
          className="text-xs mb-4 opacity-60 leading-relaxed"
          style={{ color: "var(--theme-text)" }}
        >
          {subtitle}
        </p>
        <button
          className="px-4 py-1.5 text-[10px] font-semibold rounded-md transition-all flex items-center gap-1.5"
          style={{
            backgroundColor: "var(--theme-accent)",
            color: "#fff",
          }}
        >
          View Work
          <FiArrowRight className="w-3 h-3" />
        </button>
      </div>

      {showImage && (
        <div className="col-span-5">
          {imageContent ?? (
            <div
              className="aspect-square rounded-xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, var(--theme-primary), var(--theme-accent))`,
                opacity: 0.15,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
