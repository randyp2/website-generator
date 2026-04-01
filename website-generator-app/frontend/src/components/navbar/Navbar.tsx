import NavbarClient from "./NavbarClient";

export default function Navbar() {
  /* ---------- MAIN NAVBAR ---------- */
  return (
    <header
      role="banner"
      aria-label="Site Header"
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <NavbarClient />
      </div>
    </header>
  );
}
