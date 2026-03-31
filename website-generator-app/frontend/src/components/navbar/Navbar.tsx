"use client";

import { useEffect, useState } from "react";
import NavbarClient from "./NavbarClient";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------- MAIN NAVBAR ---------- */
  return (
    <header
      role="banner"
      aria-label="Site Header"
      className="fixed top-0 left-0 right-0 z-50 transition-opacity duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="border-b border-sidebar-border bg-sidebar/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <NavbarClient />
        </div>
      </div>
    </header>
  );
}
