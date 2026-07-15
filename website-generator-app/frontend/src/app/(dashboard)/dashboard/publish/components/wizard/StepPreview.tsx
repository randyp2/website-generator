"use client"

import {
  AlertCircle,
  Eye,
  Heart,
  Info,
  LoaderCircle,
  Lock,
  MessageCircle,
} from "lucide-react"

import { LazyImage } from "@/components/ui/lazy-image"
import { buildPortfolioUrl } from "@/lib/public-env"
import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types"
import {
  formatPublishedDate,
  getPortfolioInitials,
  getPortfolioSummary,
  getTemplateLabel,
} from "@/app/(public)/(site)/explore/components/explore.utils"

import type { Portfolio } from "@/types/portfolio"
import type { GeneratedPreviewState } from "../../hooks/useGeneratedPortfolioPreview"
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
  generatedPreviewUrl: string | null
  generatedPreviewState: GeneratedPreviewState
  generatedPreviewError: string | null
}

export const StepPreview = ({
  source,
  externalUrl,
  portfolio,
  slug,
  description,
  ownerName,
  ownerAvatarUrl,
  generatedPreviewUrl,
  generatedPreviewState,
  generatedPreviewError,
}: StepPreviewProps) => {
  const isExternal = source === "external"
  const portfolioTitle = isExternal
    ? "External Portfolio"
    : portfolio?.title ?? "Untitled Portfolio"
  const previewSrc = isExternal
    ? portfolio?.screenshot_url ?? DEFAULT_PREVIEW_IMAGE
    : generatedPreviewUrl ?? DEFAULT_PREVIEW_IMAGE
  const usingPlaceholder = isExternal
    ? !portfolio?.screenshot_url
    : !generatedPreviewUrl
  const isGeneratingPreview = !isExternal
    && (generatedPreviewState === "requesting" || generatedPreviewState === "processing")
  const browserUrl = isExternal
    ? externalUrl || "https://yourportfolio.com"
    : buildPortfolioUrl(slug || "your-slug", ownerName)

  // Build the same shape the real /explore card consumes so the mock renders
  // through the identical helpers and markup.
  const previewCard: PortfolioCard = {
    title: portfolioTitle,
    slug: slug || "your-slug",
    templateId: isExternal ? null : portfolio?.template_id ?? null,
    description: description.trim() || null,
    ownerName,
    ownerUsername: null,
    ownerAvatarUrl,
    publishedAt: new Date().toISOString(),
    screenshotUrl: previewSrc,
    sourceType: isExternal ? "EXTERNAL" : "GENERATED",
    externalUrl: isExternal ? externalUrl.trim() || null : null,
  }
  const templateLabel = getTemplateLabel(previewCard.templateId)
  const summary = getPortfolioSummary(previewCard)
  const publishedDate = formatPublishedDate(previewCard.publishedAt)
  const initials = getPortfolioInitials(ownerName)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Preview your post</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This is how your portfolio will appear on /explore.
        </p>
      </div>

      {isGeneratingPreview && (
        <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          <LoaderCircle className="mt-0.5 size-3.5 shrink-0 animate-spin text-primary" />
          <p>
            Capturing the active generated version now. This preview will update
            automatically when the background worker finishes.
          </p>
        </div>
      )}

      {!isExternal && generatedPreviewState === "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          <p>{generatedPreviewError ?? "The generated preview could not be captured."}</p>
        </div>
      )}

      {usingPlaceholder && !isGeneratingPreview && generatedPreviewState !== "error" && (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p>
            {isExternal
              ? "The image below is a placeholder. A screenshot of your site will be captured and uploaded automatically once you publish."
              : "The image below is a placeholder while your generated portfolio preview starts."}
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
            className="block aspect-video w-full bg-[#17191f] object-cover object-top"
            loading="lazy"
            decoding="async"
          />
        </div>

        {/* Explore card mock — mirrors ExploreCard on /explore */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            /explore card
          </p>
          <div className="rounded-xl border border-border bg-card/40 p-1">
            <div className="group relative flex flex-col gap-2 rounded-lg p-2">
              <LazyImage
                src={previewSrc}
                fallback="https://placehold.co/640x360?text=Portfolio+Preview"
                inView={true}
                alt={portfolioTitle}
                ratio={16 / 9}
                className="transition-all duration-500 group-hover:scale-105"
              />
              <div className="space-y-2 px-2 pb-2">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                  <p>{publishedDate}</p>
                  <div className="size-1 rounded-full bg-muted-foreground" />
                  <p>{templateLabel}</p>
                </div>
                <h2 className="line-clamp-2 text-lg font-semibold leading-5 tracking-tight">
                  {portfolioTitle}
                </h2>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {summary}
                </p>
                <div className="flex items-end justify-between gap-4 pt-2">
                  <div className="flex min-w-0 items-center gap-3">
                    {ownerAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ownerAvatarUrl}
                        alt={ownerName}
                        className="size-9 rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {ownerName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Heart className="size-4" />
                      <span>0</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="size-4" />
                      <span>0</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="size-4" />
                      <span>0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
