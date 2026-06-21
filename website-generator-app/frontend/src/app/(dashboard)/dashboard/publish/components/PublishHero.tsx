"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  FiBookOpen,
  FiCheck,
  FiCopy,
  FiEdit3,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiGlobe,
  FiPlus,
  FiUploadCloud,
  FiX,
  FiZap,
} from "react-icons/fi"

import { BrowserPreviewFrame } from "@/components/ui/browser-preview-frame"
import { buildPortfolioPath, buildPortfolioUrl } from "@/lib/public-env"
import { cn } from "@/lib/utils"
import type { Portfolio } from "@/types/portfolio"

import { formatPortfolioDate } from "../../utils/deployedPortfolio"
import { type PublishHeroViewMode } from "./PublishHeroViewToggle"
import { DescriptionMarkdown } from "./DescriptionMarkdown"
import { DESCRIPTION_MAX_LENGTH } from "./wizard/StepDetails"

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

const formatTemplateLabel = (templateId: string | null | undefined): string => {
  if (!templateId || templateId.trim().toLowerCase() === "blank") return "Custom build"
  return templateId
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

type ModalMode = "read" | "edit"

interface PublishHeroProps {
  portfolio: Portfolio | null
  ownerName: string
  liveCount: number
  viewMode: PublishHeroViewMode
  onViewModeChange: (mode: PublishHeroViewMode) => void
  description: string
  copied: boolean
  onCopyUrl: () => void
  onUnpublish: () => void
  onOpenWizard: () => void
  onSaveDescription: (nextDescription: string) => Promise<void>
}

export const PublishHero = ({
  portfolio,
  ownerName,
  liveCount,
  onViewModeChange,
  description,
  copied,
  onCopyUrl,
  onUnpublish,
  onOpenWizard,
  onSaveDescription,
}: PublishHeroProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>("read")
  const [draft, setDraft] = useState(description)
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync draft with parent description when modal closes or description changes externally
  useEffect(() => {
    if (!isModalOpen) {
      setDraft(description)
      setEditorMode("write")
      setError(null)
      setModalMode("read")
    }
  }, [isModalOpen, description])

  // ESC closes the modal (unless saving)
  useEffect(() => {
    if (!isModalOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) setIsModalOpen(false)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isModalOpen, isSaving])

  if (!portfolio) {
    return (
      <section className="overflow-hidden rounded-3xl border border-dashed border-border bg-card/40">
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
            <FiGlobe className="h-6 w-6" />
          </span>
          <h2 className="text-xl font-semibold text-foreground">
            No portfolio is live yet
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Pick a draft and walk through the publish flow to put your work on the
            public Explore feed.
          </p>
          <button
            type="button"
            onClick={onOpenWizard}
            className="mt-2 inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <FiZap className="h-4 w-4" />
            Start the publish flow
          </button>
        </div>
      </section>
    )
  }

  const slug = portfolio.slug?.trim() || null
  const externalUrl = (portfolio.external_url ?? portfolio.externalUrl ?? "").trim()
  const sourceTypeNormalized = (portfolio.source_type ?? portfolio.sourceType ?? "")
    .trim()
    .toLowerCase()
  const isExternalPortfolio =
    sourceTypeNormalized === "external" ||
    (sourceTypeNormalized !== "generated" && externalUrl.length > 0)
  const displayUrl =
    isExternalPortfolio && externalUrl
      ? externalUrl
      : buildPortfolioUrl(slug ?? "pending-slug", ownerName)
  const livePath =
    isExternalPortfolio && externalUrl
      ? externalUrl
      : slug
        ? buildPortfolioPath(slug, ownerName)
        : buildPortfolioPath("pending-slug", ownerName)
  const previewSrc = portfolio.screenshot_url ?? DEFAULT_HERO_IMAGE
  const templateLabel = formatTemplateLabel(portfolio.template_id)
  const lastUpdated = formatPortfolioDate(portfolio.updated_at)
  const hasDescription = description.trim().length > 0
  const hasDraft = draft.trim().length > 0

  const openInReadMode = () => {
    setModalMode("read")
    setIsModalOpen(true)
  }

  const openInEditMode = () => {
    setDraft(description)
    setEditorMode("write")
    setError(null)
    setModalMode("edit")
    setIsModalOpen(true)
    onViewModeChange("description")
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
    onViewModeChange("screenshot")
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await onSaveDescription(draft)
      setModalMode("read")
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save description",
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 lg:p-7">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </span>
            <p className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
              {liveCount} {liveCount === 1 ? "portfolio" : "portfolios"} published
            </p>
            <span className="hidden h-4 w-px shrink-0 bg-border sm:block" />
            <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {portfolio.title}
            </h1>
          </div>
          {slug && (
            <a
              href={livePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:cursor-pointer hover:text-orange-400"
            >
              <FiExternalLink className="h-3.5 w-3.5" />
              Open live
            </a>
          )}
        </div>

        {/* HERO: screenshot only — edit happens in the modal */}
        <div className="mx-auto w-full max-w-[1100px]">
          <BrowserPreviewFrame
            src={previewSrc}
            alt={`${portfolio.title} screenshot`}
            url={displayUrl}
            className="rounded-2xl shadow-2xl shadow-black/30"
          />
        </div>

        {/* Description preview + metadata */}
        <div className="space-y-3">
          {hasDescription ? (
            <div className="min-h-[132px]">
              {!isModalOpen && (
                <motion.div
                  layoutId="description-card"
                  role="button"
                  tabIndex={0}
                  onClick={openInReadMode}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      openInReadMode()
                    }
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 28,
                    mass: 0.9,
                  }}
                  className="group relative block w-full overflow-hidden rounded-xl border border-border/60 bg-muted/30 px-3.5 pt-3 pb-2 text-left hover:cursor-pointer hover:border-primary/40 hover:bg-muted/50"
                >
                  <motion.div layout="position" className="relative max-h-[88px] overflow-hidden">
                    <DescriptionMarkdown
                      content={description.trim()}
                      className="space-y-1.5"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card via-card/70 to-transparent" />
                  </motion.div>
                  <div className="relative mt-1.5 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors group-hover:text-orange-400">
                    <FiBookOpen className="h-3 w-3" />
                    Read full description
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openInEditMode}
              className="group flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-transparent px-3.5 py-3 text-left transition-colors hover:cursor-pointer hover:border-primary/50 hover:bg-muted/30"
            >
              <span className="text-sm italic text-muted-foreground/70">
                No description yet — visitors won't see a summary on Explore.
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors group-hover:text-orange-400">
                <FiPlus className="h-3 w-3" />
                Add
              </span>
            </button>
          )}
          <dl className="flex flex-wrap items-start gap-x-6 gap-y-3">
            <div className="min-w-0 flex-1 basis-full sm:basis-[280px]">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Public URL
              </dt>
              <dd className="mt-0.5 truncate font-mono text-xs">
                <a
                  href={livePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline underline-offset-2 transition-colors hover:cursor-pointer hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {displayUrl}
                </a>
              </dd>
            </div>
            <div className="min-w-0 flex-1 basis-[140px]">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Template
              </dt>
              <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
                {templateLabel}
              </dd>
            </div>
            <div className="min-w-0 flex-1 basis-[140px]">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Last deployed
              </dt>
              <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
                {lastUpdated}
              </dd>
            </div>
          </dl>
        </div>

        {/* CTA action row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={openInEditMode}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:cursor-pointer hover:border-primary/50 hover:bg-muted sm:flex-none"
            >
              <FiEdit3 className="h-4 w-4" />
              Edit description
            </button>
            <button
              type="button"
              onClick={onOpenWizard}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:cursor-pointer hover:bg-primary/90 sm:flex-none"
            >
              <FiUploadCloud className="h-4 w-4" />
              Publish a new portfolio
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            <button
              type="button"
              onClick={onCopyUrl}
              disabled={!slug}
              className={cn(
                "inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:cursor-pointer hover:text-foreground",
                !slug && "cursor-not-allowed opacity-40 hover:cursor-not-allowed hover:text-muted-foreground",
              )}
            >
              {copied ? (
                <>
                  <FiCheck className="h-4 w-4 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <FiCopy className="h-4 w-4" />
                  Copy URL
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onUnpublish}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:cursor-pointer hover:text-red-400"
            >
              <FiEyeOff className="h-4 w-4" />
              Unpublish
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
          >
            <motion.div
              layoutId="description-card"
              onClick={(event) => event.stopPropagation()}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 28,
                mass: 0.9,
              }}
              className="flex max-h-[85vh] w-[620px] max-w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40"
            >
              {/* Header */}
              <motion.div
                layout="position"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className="flex items-center justify-between gap-2 border-b border-border px-5 py-3.5"
              >
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <FiBookOpen className="h-4 w-4" />
                  {modalMode === "edit" ? "Editing description" : "Description"}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  {modalMode === "read" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(description)
                        setEditorMode("write")
                        setError(null)
                        setModalMode("edit")
                        onViewModeChange("description")
                      }}
                      className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:cursor-pointer hover:text-orange-400"
                    >
                      <FiEdit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  ) : (
                    <div className="inline-flex rounded-md border border-border bg-background/40 p-0.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setEditorMode("write")}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-sm px-2 py-1 font-medium transition-colors hover:cursor-pointer",
                          editorMode === "write"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <FiEdit3 className="h-3 w-3" />
                        Write
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditorMode("preview")}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-sm px-2 py-1 font-medium transition-colors hover:cursor-pointer",
                          editorMode === "preview"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <FiEye className="h-3 w-3" />
                        Preview
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close description"
                    disabled={isSaving}
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:cursor-pointer hover:text-red-400",
                      isSaving && "cursor-not-allowed opacity-50 hover:cursor-not-allowed hover:text-muted-foreground",
                    )}
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>

              {/* Body */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ delay: 0.18, duration: 0.22 }}
                className="flex-1 overflow-y-auto px-5 py-5"
              >
                {modalMode === "read" ? (
                  hasDescription ? (
                    <DescriptionMarkdown content={description.trim()} />
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No description yet. Click Edit to add one.
                    </p>
                  )
                ) : editorMode === "write" ? (
                  <textarea
                    value={draft}
                    onChange={(event) =>
                      setDraft(event.target.value.slice(0, DESCRIPTION_MAX_LENGTH))
                    }
                    placeholder="Tell visitors what this portfolio is about. You can use **bold**, *italic*, and lists."
                    autoFocus
                    className="h-[340px] w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background"
                  />
                ) : (
                  <div className="min-h-[340px]">
                    {hasDraft ? (
                      <DescriptionMarkdown content={draft.trim()} />
                    ) : (
                      <p className="text-sm italic text-muted-foreground">
                        Nothing to preview yet. Switch to Write to add markdown.
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Footer (edit mode only) */}
              {modalMode === "edit" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3.5"
                >
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                    <span>
                      {draft.length}/{DESCRIPTION_MAX_LENGTH} characters
                    </span>
                    {error && <span className="text-red-400">{error}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(description)
                        setError(null)
                        setModalMode("read")
                      }}
                      disabled={isSaving}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:cursor-pointer hover:bg-muted",
                        isSaving && "cursor-not-allowed opacity-50",
                      )}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border border-primary bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:cursor-pointer hover:bg-primary/90",
                        isSaving && "cursor-not-allowed opacity-60 hover:bg-primary",
                      )}
                    >
                      <FiCheck className="h-4 w-4" />
                      {isSaving ? "Saving…" : "Save description"}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
