import React from "react";
import { TemplatePreviewBase } from "../TemplatePreviewBase";

interface PersonalStorytellingPreviewProps {
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export const PersonalStorytellingPreview: React.FC<
  PersonalStorytellingPreviewProps
> = ({ themeColors }) => {
  return (
    <TemplatePreviewBase themeColors={themeColors}>
      <div
        className="w-full h-full relative"
        style={{ backgroundColor: themeColors.background }}
      >
        {/* Soft gradient overlay */}
        <div
          className="absolute top-0 right-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-15"
          style={{ background: themeColors.primary }}
        />

        {/* Navbar */}
        <nav className="px-8 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px]"
              style={{
                background: `linear-gradient(135deg, ${themeColors.primary}40, ${themeColors.secondary}40)`,
              }}
            >
              <span className="text-[12px]">👋</span>
            </div>
            <span
              className="text-[11px] font-bold tracking-tight"
              style={{ color: themeColors.text }}
            >
              Hey, I&apos;m Alex
            </span>
          </div>
          <div className="flex items-center gap-4">
            {["Stories", "Gallery", "Say Hi"].map((link, i) => (
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
        <div className="px-8 pt-4 pb-6 relative z-10">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className="w-[80px] h-[80px] rounded-full relative"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                }}
              >
                <div
                  className="absolute inset-[3px] rounded-full"
                  style={{ backgroundColor: themeColors.background }}
                />
                <div
                  className="absolute inset-[6px] rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.secondary}30)`,
                  }}
                >
                  <span className="text-[24px] opacity-60">😊</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h1
                className="text-[22px] font-extrabold leading-[1.15] mb-1"
                style={{ color: themeColors.text }}
              >
                Sharing my
                <br />
                <span style={{ color: themeColors.primary }}>journey</span> &{" "}
                <span style={{ color: themeColors.secondary }}>stories</span>
              </h1>
              <p className="text-[10px] opacity-40 mb-3 leading-relaxed" style={{ color: themeColors.text }}>
                Writer, photographer, and lifelong learner
              </p>
              <div className="flex gap-2">
                <div
                  className="px-4 py-1.5 rounded-full text-[9px] font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  }}
                >
                  Read My Story
                </div>
                <div
                  className="px-4 py-1.5 rounded-full text-[9px] font-semibold border"
                  style={{
                    borderColor: themeColors.primary + "30",
                    color: themeColors.text,
                    opacity: 0.5,
                  }}
                >
                  Gallery
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-8 mb-5 relative z-10">
          <div
            className="flex items-center justify-around py-3 rounded-xl border"
            style={{
              backgroundColor: "#fff",
              borderColor: themeColors.primary + "12",
            }}
          >
            {[
              { value: "50+", label: "Stories" },
              { value: "12K", label: "Readers" },
              { value: "30+", label: "Countries" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-[13px] font-extrabold" style={{ color: themeColors.primary }}>
                  {stat.value}
                </p>
                <p className="text-[7px] opacity-40 mt-0.5" style={{ color: themeColors.text }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content cards */}
        <div className="px-8 relative z-10">
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { title: "Tokyo Diaries", tag: "Travel", emoji: "🗼", color: themeColors.primary },
              { title: "Film Reviews", tag: "Culture", emoji: "🎬", color: themeColors.secondary },
              { title: "Recipes", tag: "Food", emoji: "🍜", color: themeColors.accent },
            ].map((card, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border"
                style={{
                  borderColor: card.color + "15",
                  backgroundColor: "#fff",
                }}
              >
                <div
                  className="h-[45px] flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${card.color}18, ${card.color}08)`,
                  }}
                >
                  <span className="text-[18px]">{card.emoji}</span>
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[9px] font-bold" style={{ color: themeColors.text }}>
                    {card.title}
                  </p>
                  <p className="text-[7px] opacity-40" style={{ color: themeColors.text }}>
                    {card.tag}
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
