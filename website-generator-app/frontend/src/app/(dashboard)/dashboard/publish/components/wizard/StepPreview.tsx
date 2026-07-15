"use client"

import { Eye, Heart, Info, Lock, MessageCircle } from "lucide-react"

import { LazyImage } from "@/components/ui/lazy-image"
import { buildPortfolioUrl } from "@/lib/public-env"

import type { Portfolio } from "@/types/portfolio"
import type { PublishSource } from "./StepPick"

const DEFAULT_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=1170&auto=format&fit=crop"

const BROWSER_FALLBACK = "https://placehold.co/1280x720?text=Portfolio+Preview"

interface StepPreviewProps {
  source: PublishSource
  externalUrl: string
  portfolio: Portfolio | null
  slug: string
  description: string
  ownerName: string
  ownerAvatarUrl: string | null
}

const formatTemplateLabel = (templateId: string | null | undefined): string => {
  if (!templateId || templateId.toLowerCase() === "blank") return "Custom Build"
  return templateId.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

const fallbackSummary = (portfolio: Portfolio, ownerName: string) =>
  `${formatTemplateLabel(portfolio.template_id)} portfolio by ${ownerName}.`

export const StepPreview = ({
  source,
  externalUrl,
  portfolio,
  slug,
  description,
  ownerName,
  ownerAvatarUrl,
}: StepPreviewProps) => {
  const isExternal = source === "external"
  const portfolioTitle = isExternal
    ? "External Portfolio"
    : portfolio?.title ?? "Untitled Portfolio"
  const summary = description.trim()
    || (portfolio ? fallbackSummary(portfolio, ownerName) : `External portfolio by ${ownerName}.`)
  const templateLabel = isExternal
    ? "External Website"
    : formatTemplateLabel(portfolio?.template_id)
  const usingPlaceholder = !portfolio?.screenshot_url
  const previewSrc = portfolio?.screenshot_url ?? DEFAULT_PREVIEW_IMAGE
  const browserUrl = isExternal
    ? externalUrl || "https://yourportfolio.com"
    : buildPortfolioUrl(slug || "your-slug", ownerName)
  const initials =
    ownerName
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0] ?? "")
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PC"

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Preview your post</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This is how your portfolio will appear on /explore.
        </p>
      </div>

      {usingPlaceholder && (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p>
            The image below is a placeholder. A screenshot of your site will be
            captured and uploaded for you automatically once you publish.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        {/* Browser frame */}
        <div className="overflow-hidden rounded-xl border border-[#32353d] bg-[#1f2128]">
          <div className="flex items-center gap-2 border-b border-[#32353d] bg-[#2a2d35] px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <div className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 rounded-full border border-[#3a3f49] bg-[#17191f] px-3 py-1">
              <Lock className="size-3 shrink-0 text-white/40" />
              <p className="truncate text-[11px] text-white/75">
                {browserUrl}
              </p>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={`${portfolioTitle} screenshot`}
            onError={(e) => {
              const img = e.currentTarget
              if (img.src !== BROWSER_FALLBACK) img.src = BROWSER_FALLBACK
            }}
            className="block aspect-video w-full bg-[#17191f] object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Explore card mock */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card/70 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            /explore card
          </p>
          <LazyImage
            src={previewSrc}
            fallback="https://placehold.co/640x360?text=Portfolio+Preview"
            inView={true}
            alt={portfolioTitle}
            ratio={16 / 9}
          />
          <div className="space-y-2 px-1 pb-1">
            <p className="text-[11px] text-muted-foreground">{templateLabel}</p>
            <h3 className="line-clamp-2 text-base font-semibold leading-5 tracking-tight text-foreground">
              {portfolioTitle}
            </h3>
            <p className="line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">
              {summary}
            </p>
            {isExternal && externalUrl.trim() && (
              <p className="truncate text-[11px] text-primary">{externalUrl.trim()}</p>
            )}
            <div className="flex items-end justify-between gap-3 pt-2">
              <div className="flex min-w-0 items-center gap-2">
                {ownerAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ownerAvatarUrl}
                    alt={ownerName}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                    {initials}
                  </div>
                )}
                <p className="truncate text-xs font-medium text-foreground">
                  {ownerName}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Heart className="size-3.5" /> 0
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5" /> 0
                </span>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="size-3.5" /> 0
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
