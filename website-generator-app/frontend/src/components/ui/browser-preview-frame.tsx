"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface BrowserPreviewFrameProps {
  src: string | null | undefined
  alt: string
  url: string
  fallback?: string
  className?: string
}

const DEFAULT_FALLBACK =
  "https://placehold.co/1600x900?text=Portfolio+Preview"

export const BrowserPreviewFrame = ({
  src,
  alt,
  url,
  fallback = DEFAULT_FALLBACK,
  className,
}: BrowserPreviewFrameProps) => {
  const [imgSrc, setImgSrc] = React.useState<string>(src ?? fallback)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setImgSrc(src ?? fallback)
    setIsLoading(true)
  }, [src, fallback])

  const handleError = React.useCallback(() => {
    setImgSrc(fallback)
    setIsLoading(false)
  }, [fallback])

  const handleLoad = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[#32353d] bg-[#1f2128]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-[#32353d] bg-[#2a2d35] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div className="ml-2 min-w-0 flex-1 rounded-full border border-[#3a3f49] bg-[#17191f] px-3 py-1">
          <p className="truncate text-[11px] text-white/75">{url}</p>
        </div>
      </div>
      <div className="relative bg-[#13161d]">
        {isLoading && (
          <div className="absolute inset-0 animate-pulse bg-accent/20" />
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          className={cn(
            "block h-auto w-full transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100",
          )}
        />
      </div>
    </div>
  )
}
