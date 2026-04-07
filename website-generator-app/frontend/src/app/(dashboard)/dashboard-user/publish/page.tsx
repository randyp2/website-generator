"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiActivity,
  FiCheck,
  FiClock,
  FiCopy,
  FiExternalLink,
  FiEyeOff,
  FiGlobe,
  FiLoader,
  FiMonitor,
} from "react-icons/fi"

import { LazyImage } from "@/components/ui/lazy-image"
import { cn } from "@/lib/utils"

import { PublishModal } from "./components/PublishModal"
import type { PortfolioItem, PortfolioListApiItem } from "./components/publish.types"

const DEFAULT_PREVIEW_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
const PUBLISHED_STATUSES = new Set(["active", "publish", "published"])

const isPublishedStatus = (status: string) =>
  PUBLISHED_STATUSES.has(status.toLowerCase().trim())

const formatUpdatedAt = (timestamp: string) => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return "Unknown date"
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const toTimestamp = (value: string) => {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

const compareByUpdatedAt = (a: PortfolioItem, b: PortfolioItem) =>
  toTimestamp(b.updatedAt) - toTimestamp(a.updatedAt)

const mapApiItem = (p: PortfolioListApiItem): PortfolioItem => ({
  id: p.id,
  title: p.title ?? "Untitled",
  status: p.status ?? "draft",
  slug: p.slug ?? null,
  updatedAt: p.updated_at ?? p.updatedAt ?? p.created_at ?? p.createdAt ?? "",
  screenshotUrl: p.screenshot_url ?? p.screenshotUrl ?? null,
})

const PublishPage = () => {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(
    null,
  )
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(
    null,
  )
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch("/api/portfolio/list")
        if (!res.ok) throw new Error()
        const data = await res.json()
        const mappedPortfolios = ((data.portfolios ?? []) as PortfolioListApiItem[])
          .map(mapApiItem)
          .sort(compareByUpdatedAt)

        setPortfolios(mappedPortfolios)
        setSelectedPortfolioId((current) => {
          if (
            current &&
            mappedPortfolios.some((portfolio) => portfolio.id === current)
          ) {
            return current
          }

          const firstDraft = mappedPortfolios.find(
            (portfolio) => !isPublishedStatus(portfolio.status),
          )
          return firstDraft?.id ?? mappedPortfolios[0]?.id ?? null
        })
      } catch {
        console.error("Failed to fetch portfolios")
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolios()
  }, [])

  useEffect(() => {
    if (portfolios.length === 0) {
      setSelectedPortfolioId(null)
      return
    }

    const selectedStillExists = portfolios.some(
      (portfolio) => portfolio.id === selectedPortfolioId,
    )

    if (selectedStillExists) return

    const firstDraft = portfolios.find(
      (portfolio) => !isPublishedStatus(portfolio.status),
    )
    setSelectedPortfolioId(firstDraft?.id ?? portfolios[0].id)
  }, [portfolios, selectedPortfolioId])

  const published = useMemo(
    () =>
      portfolios
        .filter((portfolio) => isPublishedStatus(portfolio.status))
        .sort(compareByUpdatedAt),
    [portfolios],
  )

  const drafts = useMemo(
    () =>
      portfolios
        .filter((portfolio) => !isPublishedStatus(portfolio.status))
        .sort(compareByUpdatedAt),
    [portfolios],
  )

  const selected = useMemo(
    () =>
      portfolios.find((portfolio) => portfolio.id === selectedPortfolioId) ??
      null,
    [portfolios, selectedPortfolioId],
  )

  const handlePublished = (portfolioId: string, slug: string) => {
    setPortfolios((prev) =>
      prev.map((p) =>
        p.id === portfolioId
          ? {
              ...p,
              status: "publish",
              slug,
              screenshotUrl: null,
              updatedAt: new Date().toISOString(),
            }
          : p,
      ),
    )
    setSelectedPortfolioId(portfolioId)
  }

  const handleUnpublish = async (portfolioId: string) => {
    try {
      const res = await fetch(`/api/portfolio/${portfolioId}/unpublish`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to unpublish")
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === portfolioId
            ? {
                ...p,
                status: "draft",
                slug: null,
                screenshotUrl: null,
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      )
    } catch (error) {
      console.error("Failed to unpublish", error)
    }
  }

  const handleCopyUrl = async (slug: string) => {
    const origin = window.location.origin
    await navigator.clipboard.writeText(`${origin}/portfolio/${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const getPreviewState = (portfolio: PortfolioItem) => {
    if (!isPublishedStatus(portfolio.status)) {
      return {
        label: "Not queued",
        textClass: "text-muted-foreground",
        badgeClass: "border-border bg-muted text-muted-foreground",
        helper: "Publish this portfolio to queue a worker screenshot capture.",
      }
    }

    if (portfolio.screenshotUrl) {
      return {
        label: "Preview ready",
        textClass: "text-emerald-400",
        badgeClass: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
        helper: "Screenshot is synced and shown in the mock browser frame.",
      }
    }

    return {
      label: "Screenshot queued",
      textClass: "text-amber-300",
      badgeClass: "border-amber-500/30 bg-amber-500/15 text-amber-200",
      helper: "Worker is still generating the screenshot for this slug.",
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-3 border-border border-t-primary"
        />
        <p className="text-sm text-muted-foreground">Loading deployment targets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-8 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card/70 p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Publish
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Choose a portfolio, deploy it, and track whether the preview screenshot
              is queued or ready.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-300">
              {published.length} Live
            </span>
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground">
              {drafts.length} Drafts
            </span>
          </div>
        </div>
      </motion.div>

      {portfolios.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card/70 px-6 py-16 text-center">
          <FiGlobe className="mx-auto mb-3 h-10 w-10 text-muted-foreground/70" />
          <p className="text-lg font-medium text-foreground">No portfolios yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create one first, then publish it from this page.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground">Deploy candidates</h2>
              {drafts.length === 0 ? (
                <div className="rounded-xl border border-border bg-card/60 p-5 text-sm text-muted-foreground">
                  All portfolios are already live. Select one from the live list to
                  manage it.
                </div>
              ) : (
                drafts.map((portfolio) => {
                  const isSelected = portfolio.id === selectedPortfolioId
                  const previewState = getPreviewState(portfolio)
                  return (
                    <article
                      key={portfolio.id}
                      className={cn(
                        "rounded-xl border bg-card/70 transition-all",
                        isSelected
                          ? "border-primary/50 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]"
                          : "border-border hover:border-primary/20",
                      )}
                    >
                      <button
                        onClick={() => setSelectedPortfolioId(portfolio.id)}
                        className="w-full space-y-2 p-4 text-left"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                            {portfolio.title}
                          </h3>
                          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            Draft
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {portfolio.slug
                            ? `Previously published at /portfolio/${portfolio.slug}`
                            : "Not yet published"}
                        </p>
                        <p className={cn("text-xs", previewState.textClass)}>
                          {previewState.label}
                        </p>
                      </button>
                      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                        <button
                          onClick={() => setSelectedPortfolio(portfolio)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-muted/80"
                        >
                          <FiGlobe className="h-4 w-4" />
                          Publish
                        </button>
                        <span className="text-xs text-muted-foreground">
                          Updated {formatUpdatedAt(portfolio.updatedAt)}
                        </span>
                      </div>
                    </article>
                  )
                })
              )}
            </div>

            {published.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Currently live</h2>
                {published.map((portfolio) => {
                  const isSelected = portfolio.id === selectedPortfolioId
                  return (
                    <article
                      key={portfolio.id}
                      className={cn(
                        "rounded-xl border bg-card/70 transition-all",
                        isSelected
                          ? "border-emerald-500/45 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]"
                          : "border-border hover:border-emerald-500/25",
                      )}
                    >
                      <button
                        onClick={() => setSelectedPortfolioId(portfolio.id)}
                        className="w-full space-y-2 p-4 text-left"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <h3 className="line-clamp-1 text-base font-semibold text-foreground">
                            {portfolio.title}
                          </h3>
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                            Live
                          </span>
                        </div>
                        {portfolio.slug ? (
                          <p className="font-mono text-sm text-muted-foreground">
                            /portfolio/{portfolio.slug}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Slug missing
                          </p>
                        )}
                      </button>
                      <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                        <button
                          onClick={() => portfolio.slug && handleCopyUrl(portfolio.slug)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          disabled={!portfolio.slug}
                        >
                          {copiedSlug === portfolio.slug ? (
                            <FiCheck className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <FiCopy className="h-3.5 w-3.5" />
                          )}
                          Copy URL
                        </button>
                        {portfolio.slug && (
                          <a
                            href={`/portfolio/${portfolio.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <FiExternalLink className="h-3.5 w-3.5" />
                            Open
                          </a>
                        )}
                        <button
                          onClick={() => handleUnpublish(portfolio.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-red-500/35 hover:text-red-400"
                        >
                          <FiEyeOff className="h-3.5 w-3.5" />
                          Unpublish
                        </button>
                        <span className="ml-auto text-xs text-muted-foreground">
                          Updated {formatUpdatedAt(portfolio.updatedAt)}
                        </span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="xl:sticky xl:top-24"
          >
            {selected ? (
              <section className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-sm">
                <div className="border-b border-border p-4 sm:p-5">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Deployment preview
                  </p>
                  <h2 className="line-clamp-1 text-xl font-semibold text-foreground">
                    {selected.title}
                  </h2>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b111c]">
                    <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                      <div className="ml-2 min-w-0 flex-1 rounded-full border border-white/15 bg-[#070b14] px-3 py-1">
                        <p className="truncate text-[11px] text-white/75">
                          {selected.slug
                            ? `/portfolio/${selected.slug}`
                            : "/portfolio/pending-slug"}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <LazyImage
                        src={selected.screenshotUrl ?? DEFAULT_PREVIEW_IMAGE}
                        fallback="https://placehold.co/1280x720?text=Portfolio+Preview"
                        inView={true}
                        alt={`${selected.title} screenshot`}
                        ratio={16 / 9}
                        aspectRatioClassName="rounded-none border-0"
                        className="rounded-none"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                      {isPublishedStatus(selected.status) && !selected.screenshotUrl && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/45 p-4">
                          <div className="rounded-xl border border-amber-300/35 bg-amber-500/15 px-4 py-3 text-center">
                            <p className="inline-flex items-center gap-2 text-sm font-medium text-amber-100">
                              <FiLoader className="h-4 w-4 animate-spin" />
                              Screenshot queued
                            </p>
                            <p className="mt-1 text-xs text-amber-100/85">
                              Worker capture should appear after processing.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        Preview state
                      </p>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                          getPreviewState(selected).badgeClass,
                        )}
                      >
                        {getPreviewState(selected).label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getPreviewState(selected).helper}
                    </p>
                    <div className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-background/60 p-3 text-sm sm:grid-cols-2">
                      <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <FiMonitor className="h-3.5 w-3.5" />
                        Status:{" "}
                        <span className="font-medium text-foreground">
                          {isPublishedStatus(selected.status) ? "Live" : "Draft"}
                        </span>
                      </p>
                      <p className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <FiClock className="h-3.5 w-3.5" />
                        Updated:{" "}
                        <span className="font-medium text-foreground">
                          {formatUpdatedAt(selected.updatedAt)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {isPublishedStatus(selected.status) ? (
                      <>
                        <button
                          onClick={() => selected.slug && handleCopyUrl(selected.slug)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                          disabled={!selected.slug}
                        >
                          {copiedSlug === selected.slug ? (
                            <FiCheck className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <FiCopy className="h-4 w-4" />
                          )}
                          Copy URL
                        </button>
                        {selected.slug && (
                          <a
                            href={`/portfolio/${selected.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                          >
                            <FiExternalLink className="h-4 w-4" />
                            Open
                          </a>
                        )}
                        <button
                          onClick={() => handleUnpublish(selected.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/15"
                        >
                          <FiEyeOff className="h-4 w-4" />
                          Unpublish
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setSelectedPortfolio(selected)}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <FiGlobe className="h-4 w-4" />
                        Publish this portfolio
                      </button>
                    )}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                    <FiActivity className="h-3.5 w-3.5" />
                    Publishing enqueues a screenshot worker for this slug.
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-2xl border border-border bg-card/70 p-6">
                <p className="text-sm text-muted-foreground">
                  Select a portfolio to preview deployment details.
                </p>
              </section>
            )}
          </motion.aside>
        </div>
      )}

      <AnimatePresence>
        {selectedPortfolio && (
          <PublishModal
            portfolio={selectedPortfolio}
            onClose={() => setSelectedPortfolio(null)}
            onPublished={handlePublished}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default PublishPage
