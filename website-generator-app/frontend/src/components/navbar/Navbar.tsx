"use client"

import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import NavbarClient from "./NavbarClient"

export default function Navbar() {
  const pathname = usePathname()
  const isExploreRoute = pathname.startsWith("/explore")

  return (
    <header
      role="banner"
      aria-label="Site Header"
      className="relative z-50"
    >
      <div
        className={cn(
          "border-b border-border/70 shadow-[0_18px_60px_rgba(0,0,0,0.28)] dark:bg-sidebar",
          isExploreRoute ? "bg-sidebar" : "bg-background",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <NavbarClient />
        </div>
      </div>
    </header>
  )
}
