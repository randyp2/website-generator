"use client"

import { cn } from "@/lib/utils"

export type WizardStepState = "active" | "completed" | "inactive"

interface StepProgressItemProps {
  index: number
  label: string
  state: WizardStepState
  isClickable: boolean
  onSelect?: (index: number) => void
}

export const StepProgressItem = ({
  index,
  label,
  state,
  isClickable,
  onSelect,
}: StepProgressItemProps) => {
  const handleSelect = () => {
    if (!isClickable) return
    onSelect?.(index)
  }

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={handleSelect}
      className={cn(
        "group flex w-full flex-col items-start gap-2 rounded-md p-0.5 text-left",
        isClickable ? "cursor-pointer" : "cursor-default",
      )}
    >
      <span
        className={cn(
          "h-1 w-full rounded-full transition-colors duration-200",
          state === "active" && "bg-primary shadow-[0_0_0_1px_rgba(59,130,246,0.35)]",
          state === "completed" && "bg-emerald-400",
          state === "inactive" && "bg-border",
        )}
      />
      <span
        className={cn(
          "line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors sm:text-xs",
          state === "active" && "text-foreground",
          state === "completed" && "text-emerald-200",
          state === "inactive" && "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </button>
  )
}
