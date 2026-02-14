import React from "react";

interface MiniProjectCardProps {
  title: string;
  metric: string;
  cardStyle: "flat" | "elevated" | "glass";
}

export const MiniProjectCard: React.FC<MiniProjectCardProps> = ({
  title,
  metric,
  cardStyle,
}) => {
  const cardClass =
    cardStyle === "glass"
      ? "bg-white/40 backdrop-blur-sm border border-slate-200/50"
      : cardStyle === "elevated"
      ? "bg-white shadow-md border border-slate-100"
      : "bg-white/80 border border-slate-200";

  return (
    <div className={`${cardClass} rounded-lg p-3 hover:scale-105 transition-transform cursor-pointer`}>
      {/* Project Thumbnail */}
      <div
        className="aspect-video rounded mb-2 flex items-center justify-center opacity-20"
        style={{ backgroundColor: "var(--theme-accent)" }}
      >
        <span
          className="text-[8px] font-medium"
          style={{ color: "var(--theme-text)" }}
        >
          Project
        </span>
      </div>

      {/* Project Info */}
      <h3
        className="text-[10px] font-semibold mb-1"
        style={{ color: "var(--theme-text)" }}
      >
        {title}
      </h3>
      <p
        className="text-[8px] opacity-60"
        style={{ color: "var(--theme-text)" }}
      >
        {metric}
      </p>
    </div>
  );
};
