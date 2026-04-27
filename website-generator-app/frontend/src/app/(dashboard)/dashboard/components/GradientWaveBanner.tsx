"use client"

import { useId, type CSSProperties } from "react"

import { cn } from "@/lib/utils"

interface GradientWaveBannerProps {
  className?: string
}

const BACKGROUND_WAVE_STYLE: CSSProperties = {
  transform: "translateY(-40px)",
}

const MIDDLE_WAVE_STYLE: CSSProperties = {
  transform: "translateY(-20px)",
}

const LEFT_BLOB_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle, color-mix(in oklab, var(--primary) 40%, transparent) 0%, color-mix(in oklab, var(--primary) 18%, transparent) 50%, transparent 72%)",
}

const CENTER_BLOB_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle, color-mix(in oklab, var(--accent) 38%, transparent) 0%, color-mix(in oklab, var(--primary) 28%, transparent) 45%, color-mix(in oklab, var(--foreground) 12%, transparent) 72%, transparent 88%)",
}

const RIGHT_BLOB_STYLE: CSSProperties = {
  background:
    "radial-gradient(circle, color-mix(in oklab, var(--foreground) 20%, transparent) 0%, color-mix(in oklab, var(--primary) 22%, transparent) 52%, transparent 76%)",
}

const RIGHT_FADE_STYLE: CSSProperties = {
  background:
    "linear-gradient(to left, color-mix(in oklab, var(--background) 92%, transparent) 0%, transparent 100%)",
}

const BASE_LAYER_STYLE: CSSProperties = {
  background:
    "linear-gradient(to right, color-mix(in oklab, var(--primary) 16%, var(--background)) 0%, color-mix(in oklab, var(--accent) 20%, var(--background)) 50%, color-mix(in oklab, var(--muted) 34%, var(--background)) 100%)",
}

const NOISE_OVERLAY_STYLE: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
}

export const GradientWaveBanner = ({ className }: GradientWaveBannerProps) => {
  const gradientIdPrefix = useId().replace(/:/g, "")
  const wave1GradientId = `${gradientIdPrefix}-wave1Gradient`
  const wave2GradientId = `${gradientIdPrefix}-wave2Gradient`
  const wave3GradientId = `${gradientIdPrefix}-wave3Gradient`
  const softBlurId = `${gradientIdPrefix}-softBlur`

  return (
    <div
      className={cn(
        "relative h-48 w-full overflow-hidden rounded-xl bg-background md:h-56 lg:h-64",
        className,
      )}
    >
      <div className="absolute inset-0" style={BASE_LAYER_STYLE} />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={wave1GradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.32" />
            <stop offset="32%" stopColor="var(--accent)" stopOpacity="0.42" />
            <stop offset="62%" stopColor="var(--primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--muted)" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient id={wave2GradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.26" />
            <stop offset="40%" stopColor="var(--accent)" stopOpacity="0.38" />
            <stop offset="70%" stopColor="var(--foreground)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--muted)" stopOpacity="0.14" />
          </linearGradient>

          <linearGradient id={wave3GradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--background)" stopOpacity="0.5" />
            <stop offset="35%" stopColor="var(--accent)" stopOpacity="0.24" />
            <stop offset="65%" stopColor="var(--primary)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--muted)" stopOpacity="0.16" />
          </linearGradient>

          <filter id={softBlurId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        <path
          fill={`url(#${wave3GradientId})`}
          d="M0,160 C180,220 360,100 540,140 C720,180 900,80 1080,120 C1260,160 1350,200 1440,180 L1440,320 L0,320 Z"
          style={BACKGROUND_WAVE_STYLE}
        />
        <path
          fill={`url(#${wave1GradientId})`}
          d="M0,200 C120,140 280,260 480,180 C680,100 820,220 1000,160 C1180,100 1320,180 1440,140 L1440,320 L0,320 Z"
          style={MIDDLE_WAVE_STYLE}
        />
        <path
          fill={`url(#${wave2GradientId})`}
          d="M0,240 C200,180 400,280 600,200 C800,120 950,240 1150,180 C1350,120 1400,200 1440,160 L1440,320 L0,320 Z"
          filter={`url(#${softBlurId})`}
        />
      </svg>

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={LEFT_BLOB_STYLE}
        />
        <div
          className="absolute left-1/4 top-0 h-96 w-96 rounded-full opacity-50 blur-3xl"
          style={CENTER_BLOB_STYLE}
        />
        <div
          className="absolute left-1/2 -top-10 h-80 w-80 rounded-full opacity-40 blur-3xl"
          style={RIGHT_BLOB_STYLE}
        />
        <div
          className="absolute right-0 top-0 h-full w-96 opacity-70"
          style={RIGHT_FADE_STYLE}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={NOISE_OVERLAY_STYLE}
      />
    </div>
  )
}
