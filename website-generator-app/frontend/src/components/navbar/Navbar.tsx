"use client"

import { useEffect, useState } from "react"

import NavbarClient from "./NavbarClient"

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 24)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      role="banner"
      aria-label="Site Header"
      className="fixed inset-x-0 top-0 z-50 transition-opacity duration-500"
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="border-b border-border/70 bg-black shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <NavbarClient />
        </div>
      </div>
    </header>
  )
}
