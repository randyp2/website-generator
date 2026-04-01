import React from "react";

interface MiniNavbarProps {
  headerStyle: "transparent" | "solid" | "glass";
  logoText: string;
  accentDot?: boolean;
}

export const MiniNavbar: React.FC<MiniNavbarProps> = ({
  headerStyle,
  logoText,
  accentDot = false,
}) => {
  const bgClass =
    headerStyle === "transparent"
      ? "bg-transparent"
      : headerStyle === "glass"
      ? "bg-white/30 backdrop-blur-md"
      : "bg-white/95";

  return (
    <nav
      className={`${bgClass} px-8 py-2.5 flex items-center justify-between`}
      style={{
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold tracking-tight"
          style={{
            background: `linear-gradient(135deg, var(--theme-primary), var(--theme-accent))`,
            color: "#fff",
          }}
        >
          {logoText}
        </div>
        <span
          className="text-xs font-semibold tracking-tight"
          style={{ color: "var(--theme-text)" }}
        >
          Portfolio
        </span>
        {accentDot && (
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: "var(--theme-accent)" }}
          />
        )}
      </div>

      <div className="flex items-center gap-5">
        {["Work", "About", "Contact"].map((link, i) => (
          <span
            key={i}
            className="text-[10px] font-medium opacity-60"
            style={{ color: "var(--theme-text)" }}
          >
            {link}
          </span>
        ))}
      </div>
    </nav>
  );
};
