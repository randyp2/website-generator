"use client"

import { useState } from "react"
import { LayoutPanelTop, Rows3 } from "lucide-react"

import type { PortfolioCard } from "@/app/(public)/(site)/explore/components/explore.types"
import { buildPortfolioUrl } from "@/lib/public-env"
import { cn } from "@/lib/utils"
import type { Portfolio } from "@/types/portfolio"
import type { PublicPortfolioDTO } from "@/types/public-portfolio"

import type { PreviewScreenshotState } from "../../hooks/usePreviewScreenshot"
import { ExploreCardPreview } from "./ExploreCardPreview"
import { ExplorePagePreview } from "./ExplorePagePreview"
import { PreviewCaptureNotice } from "./PreviewCaptureNotice"
import type { PublishSource } from "./StepPick"

const DEFAULT_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=1170&auto=format&fit=crop"

type PreviewSurface = "page" | "card"

interface StepPreviewProps {
  source: PublishSource
  externalUrl: string
  portfolio: Portfolio | null
  slug: string
  description: string
  ownerName: string
  ownerAvatarUrl: string | null
  generatedPreviewUrl: string | null
  generatedPreviewState: PreviewScreenshotState
  generatedPreviewError: string | null
  externalPreviewUrl: string | null
  externalPreviewState: PreviewScreenshotState
  externalPreviewError: string | null
  onExternalPreviewRetry: () => void
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
  externalPreviewUrl,
  externalPreviewState,
  externalPreviewError,
  onExternalPreviewRetry,
}: StepPreviewProps) => {
  const [surface, setSurface] = useState<PreviewSurface>("page")
  const isExternal = source === "external"
  const portfolioTitle = isExternal
    ? "External Portfolio"
    : portfolio?.title ?? "Untitled Portfolio"
  const previewSrc = isExternal
    ? externalPreviewUrl ?? DEFAULT_PREVIEW_IMAGE
    : generatedPreviewUrl ?? DEFAULT_PREVIEW_IMAGE
  const usingPlaceholder = isExternal
    ? !externalPreviewUrl
    : !generatedPreviewUrl
  const previewState = isExternal ? externalPreviewState : generatedPreviewState
  const previewError = isExternal ? externalPreviewError : generatedPreviewError
  const browserUrl = isExternal
    ? externalUrl || "https://yourportfolio.com"
    : buildPortfolioUrl(slug || "your-slug", ownerName)
  const publishedAt = new Date().toISOString()

  const previewPortfolio: PublicPortfolioDTO = {
    portfolioId: portfolio ? String(portfolio.id) : "external-preview",
    userId: "preview-owner",
    ownerUsername: null,
    title: portfolioTitle,
    slug: slug || "your-slug",
    templateId: isExternal ? null : portfolio?.template_id ?? null,
    description: description.trim() || null,
    sections: [],
    globalTheme: null,
    ownerName,
    ownerAvatarUrl,
    publishedAt,
    screenshotUrl: previewSrc,
    sourceType: isExternal ? "EXTERNAL" : "GENERATED",
    externalUrl: isExternal ? externalUrl.trim() || null : null,
  }
  const previewCard: PortfolioCard = previewPortfolio

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Preview your post</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Review both public views here. Nothing opens or publishes from this preview.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Portfolio preview view"
          className="inline-flex self-start rounded-lg border border-border bg-muted/50 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={surface === "page"}
            onClick={() => setSurface("page")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              surface === "page"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutPanelTop className="size-3.5" />
            Explore page
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={surface === "card"}
            onClick={() => setSurface("card")}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              surface === "card"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Rows3 className="size-3.5" />
            Explore card
          </button>
        </div>
      </div>

      <PreviewCaptureNotice
        state={previewState}
        error={previewError}
        external={isExternal}
        usingPlaceholder={usingPlaceholder}
        onRetry={onExternalPreviewRetry}
      />

      <div role="tabpanel">
        {surface === "page" ? (
          <ExplorePagePreview
            portfolio={previewPortfolio}
            browserUrl={browserUrl}
          />
        ) : (
          <ExploreCardPreview portfolio={previewCard} />
        )}
      </div>
    </div>
  )
}
