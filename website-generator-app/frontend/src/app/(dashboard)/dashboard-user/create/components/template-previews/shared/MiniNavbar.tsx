import React from "react";

interface MiniNavbarProps {
  headerStyle: "transparent" | "solid" | "glass";
  logoText: string;
}

export const MiniNavbar: React.FC<MiniNavbarProps> = ({
  headerStyle,
  logoText,
}) => {
  const bgClass =
    headerStyle === "transparent"
      ? "bg-transparent"
      : headerStyle === "glass"
      ? "bg-white/60 backdrop-blur-sm"
      : "bg-white";

  return (
    <nav
      className={`${bgClass} px-8 py-2.5 flex items-center justify-between border-b border-slate-100/50`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            backgroundColor: "var(--theme-primary)",
            color: "var(--theme-bg)",
          }}
        >
          {logoText}
        </div>
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--theme-text)" }}
        >
          Portfolio
        </span>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        {["Work", "About", "Contact"].map((link, i) => (
          <span
            key={i}
            className="text-[10px] font-medium opacity-70 hover:opacity-100 transition-opacity"
            style={{ color: "var(--theme-text)" }}
          >
            {link}
          </span>
        ))}
      </div>
    </nav>
  );
};
