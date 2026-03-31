import React from "react";

interface MiniProjectCardProps {
  title: string;
  metric: string;
  cardStyle: "flat" | "elevated" | "glass";
  thumbnailGradient?: string;
  thumbnailContent?: React.ReactNode;
}

export const MiniProjectCard: React.FC<MiniProjectCardProps> = ({
  title,
  metric,
  cardStyle,
  thumbnailGradient,
  thumbnailContent,
}) => {
  const cardClass =
    cardStyle === "glass"
      ? "bg-white/40 backdrop-blur-sm border border-white/30"
      : cardStyle === "elevated"
      ? "bg-white shadow-md border border-slate-100/50"
      : "bg-white/80 border border-slate-200/60";

  return (
    <div className={`${cardClass} rounded-lg p-2.5`}>
      <div
        className="aspect-video rounded-md mb-2 overflow-hidden relative"
        style={{
          background:
            thumbnailGradient ??
            `linear-gradient(135deg, var(--theme-accent), var(--theme-primary))`,
          opacity: thumbnailGradient ? 1 : 0.18,
        }}
      >
        {thumbnailContent}
      </div>

      <h3
        className="text-[10px] font-semibold mb-0.5 truncate"
        style={{ color: "var(--theme-text)" }}
      >
        {title}
      </h3>
      <p
        className="text-[8px] opacity-50 truncate"
        style={{ color: "var(--theme-text)" }}
      >
        {metric}
      </p>
    </div>
  );
};
