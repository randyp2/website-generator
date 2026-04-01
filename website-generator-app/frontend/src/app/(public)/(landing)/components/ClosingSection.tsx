"use client"

import React from "react"
import Link from "next/link"
import Lenis from "@studio-freight/lenis"
import { ZoomParallax } from "@/components/ui/zoom-parallax"
import BrandWordmark from "@/components/branding/BrandWordmark"
import { Button } from "@/components/ui/button"

const images = [
  {
    src: "/images/hero/example1.png",
    alt: "Portfolio example - neon city street",
  },
  {
    src: "/images/hero/example2.png",
    alt: "Portfolio example - night street with glowing signs",
  },
  {
    src: "/images/hero/example3.png",
    alt: "Portfolio example - Tokyo crosswalk at dusk",
  },
  {
    src: "/images/hero/example4.png",
    alt: "Portfolio example - Tokyo alleyway with signage",
  },
  {
    src: "/images/hero/example5.png",
    alt: "Portfolio example - street crowd with bright lights",
  },
  {
    src: "/images/hero/example10.png",
    alt: "Portfolio example - urban cityscape",
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
              <Link href="/dashboard">Create your portfolio</Link>
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
