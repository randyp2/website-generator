"use client"

import { useEffect, useState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"

interface CodeLine {
  indent: number
  segments: { width: string; color: string }[]
  status: "pending" | "scanning" | "valid" | "error"
  hasError?: boolean
}

export function CodeValidationLoader() {
  const [scanIndex, setScanIndex] = useState(0)
  const [lines, setLines] = useState<CodeLine[]>([
    { indent: 0, segments: [{ width: "w-16", color: "bg-violet-400/60" }, { width: "w-24", color: "bg-muted-foreground/30" }], status: "pending" },
    { indent: 0, segments: [{ width: "w-28", color: "bg-cyan-400/50" }], status: "pending" },
    { indent: 1, segments: [{ width: "w-20", color: "bg-emerald-400/50" }, { width: "w-32", color: "bg-muted-foreground/30" }], status: "pending" },
    { indent: 1, segments: [{ width: "w-36", color: "bg-amber-400/50" }], status: "pending" },
    { indent: 2, segments: [{ width: "w-24", color: "bg-cyan-400/50" }, { width: "w-16", color: "bg-muted-foreground/30" }], status: "pending", hasError: true },
    { indent: 2, segments: [{ width: "w-20", color: "bg-emerald-400/50" }], status: "pending" },
    { indent: 1, segments: [{ width: "w-12", color: "bg-violet-400/60" }], status: "pending" },
    { indent: 0, segments: [{ width: "w-8", color: "bg-violet-400/60" }], status: "pending" },
    { indent: 0, segments: [], status: "pending" },
    { indent: 0, segments: [{ width: "w-20", color: "bg-cyan-400/50" }, { width: "w-28", color: "bg-muted-foreground/30" }], status: "pending" },
    { indent: 1, segments: [{ width: "w-32", color: "bg-emerald-400/50" }], status: "pending" },
    { indent: 2, segments: [{ width: "w-24", color: "bg-amber-400/50" }, { width: "w-16", color: "bg-muted-foreground/30" }], status: "pending", hasError: true },
    { indent: 1, segments: [{ width: "w-16", color: "bg-violet-400/60" }], status: "pending" },
    { indent: 0, segments: [{ width: "w-8", color: "bg-violet-400/60" }], status: "pending" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setScanIndex((prev) => {
        const next = prev + 1
        if (next > lines.length) {
          // Reset after completion
          setTimeout(() => {
            setLines((l) => l.map((line) => ({ ...line, status: "pending" })))
            setScanIndex(0)
          }, 2000)
          return prev
        }
        return next
      })

      setLines((prevLines) =>
        prevLines.map((line, index) => {
          if (index < scanIndex) {
            return { ...line, status: line.hasError ? "error" : "valid" }
          } else if (index === scanIndex) {
            return { ...line, status: "scanning" }
          }
          return line
        })
      )
    }, 300)

    return () => clearInterval(interval)
  }, [scanIndex, lines.length])

  const errorCount = lines.filter((l) => l.status === "error").length
  const validCount = lines.filter((l) => l.status === "valid").length
  const isComplete = scanIndex >= lines.length

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
              <div className="w-3 h-3 rounded-full bg-cyan-500/60" />
              <span className="text-xs text-muted-foreground font-mono">validation.ts</span>
            </div>
          </div>
          <div className="w-16" />
        </div>

        {/* Code Editor with Validation */}
        <div className="bg-zinc-950 p-4 min-h-[320px] relative">
          <div className="space-y-2">
            {lines.map((line, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 rounded-sm px-1 py-0.5 transition-all duration-200 ${
                  line.status === "scanning"
                    ? "bg-cyan-500/10 ring-1 ring-cyan-500/30"
                    : line.status === "error"
                      ? "bg-red-500/10"
                      : ""
                }`}
              >
                {/* Line Number */}
                <span className="text-xs font-mono text-zinc-600 w-6 text-right select-none">
                  {index + 1}
                </span>

                {/* Status Icon */}
                <div className="w-4 h-4 flex items-center justify-center">
                  {line.status === "valid" && (
                    <Check className="w-3 h-3 text-emerald-500" />
                  )}
                  {line.status === "error" && (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                  {line.status === "scanning" && (
                    <Loader2 className="w-3 h-3 text-cyan-500 animate-spin" />
                  )}
                  {line.status === "pending" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  )}
                </div>

                {/* Code Segments */}
                <div
                  className="flex items-center gap-2"
                  style={{ paddingLeft: `${line.indent * 16}px` }}
                >
                  {line.segments.map((segment, segIndex) => (
                    <div
                      key={segIndex}
                      className={`h-3 rounded-sm ${segment.width} ${segment.color} ${
                        line.status === "scanning" ? "animate-pulse" : ""
                      } ${line.status === "error" ? "ring-1 ring-red-500/50" : ""}`}
                    />
                  ))}
                </div>

                {/* Error Message */}
                {line.status === "error" && (
                  <span className="text-xs text-red-400 font-mono ml-auto">
                    Type error detected
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Scan Line Animation */}
          {!isComplete && scanIndex < lines.length && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent transition-all duration-200"
              style={{ top: `${16 + scanIndex * 28}px` }}
            />
          )}
        </div>

        {/* Validation Status Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            {!isComplete ? (
              <>
                <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
                <span className="text-xs text-zinc-400 font-mono">
                  Validating line {Math.min(scanIndex + 1, lines.length)} of {lines.length}...
                </span>
              </>
            ) : (
              <>
                <div className={`w-2 h-2 rounded-full ${errorCount > 0 ? "bg-amber-500" : "bg-emerald-500"}`} />
                <span className="text-xs text-zinc-400 font-mono">Validation complete</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-zinc-500 font-mono">{validCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span className="text-xs text-zinc-500 font-mono">{errorCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
