"use client";

import NavbarClient from "./NavbarClient";

export default function Navbar() {
  /* ---------- MAIN NAVBAR ---------- */
  return (
    <header
      role="banner"
      aria-label="Site Header"
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="bg-[#030506]/60 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <NavbarClient />
        </div>
      </div>
    </header>
  );
}
