"use client"

import * as React from "react"
import { useInView } from "framer-motion"

import { cn } from "@/lib/utils"

import { AspectRatio } from "@/components/ui/aspect-ratio"

interface LazyImageProps {
  alt: string
  src: string
  className?: string
  aspectRatioClassName?: string
  fallback?: string
  ratio: number
  inView?: boolean
}

export const LazyImage = ({
  alt,
  src,
  ratio,
  fallback,
  inView = false,
  className,
  aspectRatioClassName,
}: LazyImageProps) => {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const imgRef = React.useRef<HTMLImageElement | null>(null)
  const isInView = useInView(ref, { once: true })

  const [imgSrc, setImgSrc] = React.useState<string | undefined>(
    inView ? undefined : src,
  )
  const [isLoading, setIsLoading] = React.useState(true)

  const handleError = React.useCallback(() => {
    if (fallback) {
      setImgSrc(fallback)
    }
    setIsLoading(false)
  }, [fallback])

  const handleLoad = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    if (inView && isInView && !imgSrc) {
      setImgSrc(src)
    }
  }, [imgSrc, inView, isInView, src])

  React.useEffect(() => {
    if (imgRef.current?.complete) {
      handleLoad()
    }
  }, [handleLoad, imgSrc])

  return (
    <AspectRatio
      ref={ref}
      ratio={ratio}
      className={cn(
        "relative size-full overflow-hidden rounded-lg border border-border",
        aspectRatioClassName,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-accent/30 transition-opacity will-change-[opacity]",
          isLoading && "animate-pulse",
          !isLoading && "opacity-0",
        )}
      />

      {imgSrc ? (
        // The prompt uses direct remote image URLs and a plain image element.
        // Keeping that behavior avoids introducing Next image config changes here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          alt={alt}
          src={imgSrc}
          className={cn(
            "size-full rounded-lg object-cover opacity-0 transition-opacity duration-2000 will-change-[opacity]",
            !isLoading && "opacity-100",
            className,
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          fetchPriority={inView ? "high" : "low"}
        />
      ) : null}
    </AspectRatio>
  )
}
