import NavbarClient from "./NavbarClient"

export default function Navbar() {
  return (
    <header
      role="banner"
      aria-label="Site Header"
      className="relative z-50"
    >
      <div className="border-b border-border/70 bg-background shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <NavbarClient />
        </div>
      </div>
    </header>
  )
}
