import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";

interface AcademicElegantPreviewProps {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const AcademicElegantPreview: React.FC<AcademicElegantPreviewProps> = ({
  themeColors,
}) => {
  return (
    <TemplatePreviewBase themeColors={themeColors}>
      <div
        className="w-full h-full relative"
        style={{ backgroundColor: themeColors.background }}
      >
        {/* Subtle paper texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Top decorative bar */}
        <div
          className="h-1"
          style={{
            background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary}, ${themeColors.accent})`,
          }}
        />

        {/* Navbar */}
        <nav
          className="px-8 py-3 flex items-center justify-between border-b"
          style={{
            backgroundColor: "#fff",
            borderColor: themeColors.primary + "15",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-sm flex items-center justify-center text-[10px]"
              style={{ color: themeColors.primary }}
            >
              📖
            </div>
            <div>
              <span
                className="text-[11px] font-bold tracking-tight block leading-none"
                style={{ color: themeColors.text, fontFamily: "Georgia, serif" }}
              >
                Dr. Portfolio
              </span>
              <span className="text-[7px] opacity-40" style={{ color: themeColors.text }}>
                Research & Publications
              </span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            {["Research", "Papers", "CV"].map((link, i) => (
              <span
                key={i}
                className="text-[9px] font-medium opacity-50"
                style={{ color: themeColors.text, fontFamily: "Georgia, serif" }}
              >
                {link}
              </span>
            ))}
          </div>
        </nav>

        {/* Hero */}
        <div className="px-8 pt-7 pb-6 relative z-10">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div
                className="flex items-center gap-2 mb-3"
              >
                <div className="h-[1px] w-8" style={{ backgroundColor: themeColors.primary + "40" }} />
                <span
                  className="text-[8px] uppercase tracking-[0.15em] font-semibold"
                  style={{ color: themeColors.secondary }}
                >
                  Research Scholar
                </span>
              </div>
              <h1
                className="text-[24px] font-bold leading-[1.15] mb-2"
                style={{ color: themeColors.text, fontFamily: "Georgia, serif" }}
              >
                Advancing knowledge
                <br />
                through{" "}
                <span
                  className="italic"
                  style={{ color: themeColors.secondary }}
                >
                  rigorous inquiry
                </span>
              </h1>
              <p className="text-[10px] opacity-40 mb-5 max-w-[280px] leading-relaxed" style={{ color: themeColors.text }}>
                Published researcher with expertise in computational science
              </p>
              <div className="flex gap-3 items-center">
                <div
                  className="px-4 py-1.5 rounded-sm text-[9px] font-semibold text-white"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  View Publications
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: themeColors.secondary }} />
                  <span className="text-[8px] opacity-50" style={{ color: themeColors.text }}>
                    12 Papers · 340+ Citations
                  </span>
                </div>
              </div>
            </div>

            {/* Stats card */}
            <div
              className="w-[140px] rounded-lg border p-4 flex-shrink-0"
              style={{
                borderColor: themeColors.primary + "15",
                backgroundColor: "#fff",
              }}
            >
              {[
                { label: "Publications", value: "12" },
                { label: "Citations", value: "340+" },
                { label: "H-Index", value: "8" },
              ].map((stat, i) => (
                <div key={i} className={i > 0 ? "mt-3 pt-3 border-t" : ""} style={{ borderColor: themeColors.primary + "10" }}>
                  <p
                    className="text-[14px] font-bold"
                    style={{ color: themeColors.primary, fontFamily: "Georgia, serif" }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-[7px] opacity-40 uppercase tracking-wider" style={{ color: themeColors.text }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Publications list */}
        <div className="px-8 relative z-10">
          <div className="space-y-2">
            {[
              { title: "Machine Learning in Climate Modeling", journal: "Nature Computing, 2024" },
              { title: "Neural Architecture Search Methods", journal: "ACM Conference, 2023" },
            ].map((paper, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md border"
                style={{
                  borderColor: themeColors.primary + "10",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: i === 0 ? themeColors.secondary : themeColors.accent }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[9px] font-semibold truncate"
                    style={{ color: themeColors.text, fontFamily: "Georgia, serif" }}
                  >
                    {paper.title}
                  </p>
                  <p className="text-[7px] opacity-40 mt-0.5" style={{ color: themeColors.text }}>
                    {paper.journal}
                  </p>
                </div>
                <div
                  className="text-[7px] px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: themeColors.primary + "10",
                    color: themeColors.primary,
                  }}
                >
                  Published
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TemplatePreviewBase>
  );
};
