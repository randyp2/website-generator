import { Eye, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { PortfolioCard } from "./explore.types"
import { getPortfolioPalette, getTemplateLabel } from "./explore.utils"

interface PortfolioCardPreviewProps {
  portfolio: PortfolioCard
}

export const PortfolioCardPreview = ({
  portfolio,
}: PortfolioCardPreviewProps) => {
  const palette = getPortfolioPalette(portfolio)
  const templateLabel = getTemplateLabel(portfolio.templateId)

  return (
    <div
      className={cn(
        "relative aspect-[4/3] overflow-hidden rounded-[1.6rem] border border-white/10",
        palette.shellClassName,
        palette.glowClassName,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_35%,rgba(0,0,0,0.25)_100%)]" />
      <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          Live Preview
        </div>
        <Badge
          variant="outline"
          className={cn("rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.22em]", palette.tintClassName)}
        >
          {templateLabel}
        </Badge>
      </div>

      <div className="absolute inset-x-4 bottom-4 top-16 rounded-[1.35rem] border border-white/10 bg-black/25 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300/85" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/85" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/85" />
          <div className="ml-2 h-7 flex-1 rounded-full border border-white/10 bg-white/5 px-3" />
        </div>

        <div className="mt-4 grid h-[calc(100%-3.25rem)] grid-cols-[1.35fr_0.85fr] gap-3">
          <div className="space-y-3">
            <div className={cn("h-16 rounded-2xl bg-gradient-to-r opacity-90", palette.accentClassName)} />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded-2xl border border-white/10 bg-white/6" />
              <div className="h-20 rounded-2xl border border-white/10 bg-white/6" />
            </div>
            <div className="h-14 rounded-2xl border border-dashed border-white/15 bg-black/20" />
          </div>

          <div className="space-y-3">
            <div className="flex h-24 items-end rounded-2xl border border-white/10 bg-white/6 p-3">
              <div className={cn("h-10 w-full rounded-xl bg-gradient-to-r opacity-85", palette.accentClassName)} />
            </div>
            <div className="h-24 rounded-2xl border border-white/10 bg-white/6" />
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-white/70">
              <Sparkles className="h-4 w-4" />
              <Eye className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
