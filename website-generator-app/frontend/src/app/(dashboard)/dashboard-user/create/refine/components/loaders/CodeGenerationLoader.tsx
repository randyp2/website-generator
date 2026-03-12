"use client"

import { useEffect, useState, useRef } from "react"

export function CodeGenerationLoader() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const maxScroll = useRef(0)

  const codeLines = [
    { indent: 0, width: "w-16", color: "bg-violet-400/60" },
    { indent: 0, width: "w-32", color: "bg-muted-foreground/20" },
    { indent: 1, width: "w-24", color: "bg-cyan-400/50" },
    { indent: 1, width: "w-40", color: "bg-muted-foreground/20" },
    { indent: 2, width: "w-28", color: "bg-emerald-400/50" },
    { indent: 2, width: "w-20", color: "bg-muted-foreground/20" },
    { indent: 2, width: "w-36", color: "bg-amber-400/50" },
    { indent: 1, width: "w-16", color: "bg-muted-foreground/20" },
    { indent: 0, width: "w-12", color: "bg-violet-400/60" },
    { indent: 0, width: "w-0", color: "bg-transparent" },
    { indent: 0, width: "w-20", color: "bg-cyan-400/50" },
    { indent: 0, width: "w-28", color: "bg-muted-foreground/20" },
    { indent: 1, width: "w-32", color: "bg-emerald-400/50" },
    { indent: 1, width: "w-24", color: "bg-muted-foreground/20" },
    { indent: 2, width: "w-16", color: "bg-amber-400/50" },
    { indent: 2, width: "w-40", color: "bg-muted-foreground/20" },
  ]

  // Triple the lines for seamless looping
  const allLines = [...codeLines, ...codeLines, ...codeLines]
  const lineHeight = 20 // height of each line in pixels
  const singleSetHeight = codeLines.length * lineHeight

  useEffect(() => {
    maxScroll.current = singleSetHeight

    const interval = setInterval(() => {
      setScrollPosition((prev) => {
        const next = prev + 1
        // Reset seamlessly when we've scrolled one full set
        if (next >= singleSetHeight) {
          return 0
        }
        return next
      })
    }, 40)

    return () => clearInterval(interval)
  }, [singleSetHeight])

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Browser Frame */}
      <div className="rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Browser Header */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-amber-400/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-background/80 rounded-lg border border-border/50 min-w-[200px]">
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="text-xs text-muted-foreground font-mono">v0.dev</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* Code Editor Area */}
        <div className="bg-zinc-950 px-4 py-3 h-[180px] relative overflow-hidden">
          {/* Code Lines Only (No Line Numbers) */}
          <div
            className="space-y-1"
            style={{ transform: `translateY(-${scrollPosition}px)` }}
          >
            {allLines.map((line, index) => (
              <div
                key={index}
                className="flex items-center h-[16px]"
                style={{ paddingLeft: `${line.indent * 16}px` }}
              >
                <div
                  className={`h-2.5 rounded-sm ${line.width} ${line.color} ${
                    line.width !== "w-0" ? "animate-pulse" : ""
                  }`}
                  style={{
                    animationDelay: `${(index % codeLines.length) * 100}ms`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-zinc-950 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />

          {/* Cursor Blink */}
          <div className="absolute bottom-6 left-8 w-0.5 h-3 bg-white animate-pulse" />
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-400 font-mono">Generating code...</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-mono">TypeScript React</span>
            <span className="text-xs text-zinc-500 font-mono">UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  )
}
