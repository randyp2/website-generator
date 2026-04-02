"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  ratio?: number
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, className, children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={style}
      {...props}
    >
      <div style={{ paddingBottom: `${100 / ratio}%` }} />
      <div className="absolute inset-0">{children}</div>
    </div>
  ),
)

AspectRatio.displayName = "AspectRatio"
