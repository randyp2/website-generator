"use client"

import {
  BentoCell,
  BentoGrid,
  ContainerScale,
  ContainerScroll,
} from "@/components/ui/hero-gallery-scroll-animation"
import { Button } from "@/components/ui/button"
import { MobilePortfolioMockup } from "@/components/ui/phone-mockup"
import LightRays from "@/components/LightRays"
import Image from "next/image"

const IMAGES = [
  {
    src: "/images/hero/example1.png",
    alt: "Neon city street at night",
  },
  {
    src: "/images/hero/example4.png",
    alt: "Tokyo alleyway with signage",
  },
  {
    src: "/images/hero/example5.png",
    alt: "Street crowd with bright lights",
  },
  {
    src: "/images/hero/example3.png",
    alt: "Tokyo crosswalk at dusk",
  },
  {
    src: "/images/hero/example2.png",
    alt: "Night street with glowing signs",
  },
]

export default function HeroSection() {
  return (
    <section className="relative bg-black text-white">
      {/* LightRays background */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-90">
        <LightRays
          raysOrigin="top-center"
          raysColor="#3b82f6"
          raysSpeed={0.8}
          lightSpread={0.8}
          rayLength={1.5}
          pulsating={false}
          fadeDistance={1.0}
          saturation={1.2}
          followMouse
          mouseInfluence={0.1}
          noiseAmount={0.08}
          distortion={0.08}
        />
      </div>

      <ContainerScroll className="h-[320vh]">
        <BentoGrid className="sticky left-0 top-0 z-0 h-screen w-full p-4 md:p-8">
          {IMAGES.map((image, index) => (
            <BentoCell
              key={image.src}
              className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.75)]"
            >
              {index === 1 ? (
                <MobilePortfolioMockup variant="tech" />
              ) : index === 2 ? (
                <MobilePortfolioMockup variant="creative" />
              ) : (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={
                    index === 0
                      ? "(min-width: 768px) 75vw, 100vw"  // First image: 6/8 cols desktop, full mobile
                      : "(min-width: 768px) 37.5vw, 50vw" // Bottom images: 3/8 cols desktop
                  }
                  quality={90}
                  priority={index === 0}
                  className="object-center object-cover"
                />
              )}
            </BentoCell>
          ))}
        </BentoGrid>

        <ContainerScale className="relative z-20 px-6 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
              PortRN AI Portfolio Builder
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Launch a portfolio that feels custom, polished, and ready in
              minutes.
            </h1>
            <p className="mt-6 text-base text-white/75 md:text-lg">
              Upload your resume, pick a style, and let our AI craft a portfolio
              site you can ship today. Scroll to see the motion-first hero in
              action, then dive into the rest of the landing page.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button className="bg-white px-6 py-2 text-slate-900 hover:bg-white/90">
                Build my portfolio
              </Button>
              <Button
                variant="link"
                className="px-4 py-2 text-white underline-offset-4 hover:text-white/80"
              >
                See examples
              </Button>
            </div>
          </div>
        </ContainerScale>
      </ContainerScroll>
    </section>
  )
}
