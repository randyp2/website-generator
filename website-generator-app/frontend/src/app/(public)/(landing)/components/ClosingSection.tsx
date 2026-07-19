"use client"

import React from "react"
import Link from "next/link"
import Lenis from "lenis"
import { ZoomParallax } from "@/components/ui/zoom-parallax"
import BrandWordmark from "@/components/branding/BrandWordmark"
import { Button } from "@/components/ui/button"

const images = [
  {
    src: "/images/hero/closing-desktop-01.webp",
    alt: "Dark interactive portfolio with a bold typographic introduction",
  },
  {
    src: "/images/hero/closing-mobile-01.webp",
    alt: "Green terminal-inspired portfolio in a portrait preview",
  },
  {
    src: "/images/hero/closing-desktop-02.webp",
    alt: "Playful illustrated portfolio with profile and game board panels",
  },
  {
    src: "/images/hero/closing-mobile-02.webp",
    alt: "Dark engineering portfolio in a portrait preview",
  },
  {
    src: "/images/hero/closing-desktop-03.webp",
    alt: "Dark portfolio hero with glowing planetary artwork",
  },
  {
    src: "/images/hero/closing-desktop-04.webp",
    alt: "Light cyberpunk portfolio with skills and project cards",
  },
]

const ClosingSection = () => {
  React.useEffect(() => {
    const lenis = new Lenis()

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <section className="relative min-h-screen text-foreground">
      <ZoomParallax images={images}>
        <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            <BrandWordmark compact className="mr-2 text-xs text-foreground/80" />
            AI Portfolio Builder
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            Launch a portfolio that feels custom, polished, and ready in minutes.
          </h1>
          <p className="mt-6 text-base text-muted-foreground md:text-lg">
            Upload your resume, pick a style, and let our AI craft a portfolio
            site you can ship today.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              className="bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/">Create your portfolio</Link>
            </Button>
            <Button
              asChild
              variant="link"
              className="px-4 py-2 text-foreground underline-offset-4 hover:text-foreground/80"
            >
              <Link href="/explore">Browse portfolios</Link>
            </Button>
          </div>
        </div>
      </ZoomParallax>
    </section>
  )
}

export default ClosingSection
