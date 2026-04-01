"use client";

import React from "react";

const AnimatedBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0a0a0a]">
      {/* Subtle blue background gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-linear-to-r from-[rgba(0,132,255,0.15)] via-transparent to-transparent opacity-50" />
        <div className="absolute inset-0 bg-linear-to-bl from-[rgba(0,132,255,0.1)] via-transparent to-transparent opacity-50" />
      </div>
    </div>
  );
};

export default AnimatedBackground;
