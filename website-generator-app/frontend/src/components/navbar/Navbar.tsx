import NavbarClient from "./NavbarClient";

export default function Navbar() {

  /* ---------- MAIN NAVBAR ---------- */
  return (
    <header 
      role="banner"
      aria-label="Sit Header"
      className="fixed top-0 left-0 right-0 z-50 bg-linear-to-b from-white/90 via-sky-50/80 to-white/70 backdrop-blur-xl border-b border-sky-100/60 shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <NavbarClient />
      </div>
    </header>
  );
}
