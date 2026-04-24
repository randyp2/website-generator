"use client"

import { motion } from "framer-motion"
import { RotateCcw, Upload, RefreshCw } from "lucide-react"

import { cn } from "@/lib/utils"

import type { VerificationHistoryProps } from "./verification.types"

const TYPE_ICONS: Record<string, React.ElementType> = {
  full_run: RefreshCw,
  partial_run: RotateCcw,
  manual_update: Upload,
}

const TYPE_LABELS: Record<string, string> = {
  full_run: "Full Scan",
  partial_run: "Partial Sync",
  manual_update: "Manual Update",
}

const VerificationHistory = ({ entries }: VerificationHistoryProps) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        Verification History
      </h3>

      <div className="relative ml-3">
        {/* Vertical line */}
        <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />

        <div className="space-y-0">
          {entries.map((entry, index) => {
            const Icon = TYPE_ICONS[entry.type] ?? RefreshCw
            const dateStr = new Date(entry.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.3 }}
                className="relative pl-6 py-3"
              >
                {/* Dot */}
                <div className="absolute left-0 top-4 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        {TYPE_LABELS[entry.type]}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {dateStr}
                      </span>
                    </div>
                    <p className="text-xs text-foreground">{entry.summary}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className={cn(
                          "text-xs font-bold",
                          entry.scoreChange >= 0
                            ? "text-emerald-400"
                            : "text-red-400",
                        )}
                      >
                        {entry.scoreChange >= 0 ? "+" : ""}
                        {entry.scoreChange} pts
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {entry.skillsAffected} skill
                        {entry.skillsAffected !== 1 ? "s" : ""} affected
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default VerificationHistory
