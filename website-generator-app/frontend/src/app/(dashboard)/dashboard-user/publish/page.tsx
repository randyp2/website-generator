"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { FiGlobe, FiInbox } from "react-icons/fi"

import { useUser } from "@/context/UserContext"
import type { Portfolio } from "@/types/portfolio"

import { isDeployedPortfolio } from "../utils/deployedPortfolio"

import { PublishHero } from "./components/PublishHero"
import { PublishListCard } from "./components/PublishListCard"
import type { PublishHeroViewMode } from "./components/PublishHeroViewToggle"
import { PublishWizardModal } from "./components/PublishWizardModal"

const compareByUpdatedAt = (a: Portfolio, b: Portfolio) => {
  const ta = new Date(a.updated_at ?? a.created_at ?? 0).getTime() || 0
  const tb = new Date(b.updated_at ?? b.created_at ?? 0).getTime() || 0
  return tb - ta
}

const PublishPage = () => {
  const { user } = useUser()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [featuredPortfolioId, setFeaturedPortfolioId] = useState<string | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [heroViewMode, setHeroViewMode] =
    useState<PublishHeroViewMode>("screenshot")

  useEffect(() => {
    const loadPortfolios = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const res = await fetch(`/api/portfolio/list?userId=${user.id}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        const rows: Portfolio[] = Array.isArray(data?.portfolios)
          ? data.portfolios.map((item: Portfolio) => ({
              ...item,
              title: item.title ?? "Untitled Portfolio",
            }))
          : []
        setPortfolios(rows)
      } catch {
        console.error("Failed to fetch portfolios")
        setPortfolios([])
      } finally {
        setLoading(false)
      }
    }
    loadPortfolios()
  }, [user?.id])

  const drafts = useMemo(
    () =>
      portfolios
        .filter((portfolio) => !isDeployedPortfolio(portfolio))
        .sort(compareByUpdatedAt),
    [portfolios],
  )

  const live = useMemo(
    () =>
      portfolios.filter(isDeployedPortfolio).sort(compareByUpdatedAt),
    [portfolios],
  )

  // Default featured: most recently updated live portfolio
  useEffect(() => {
    if (live.length === 0) {
      setFeaturedPortfolioId(null)
      return
    }
    setFeaturedPortfolioId((current) => {
      if (current && live.some((p) => String(p.id) === current)) return current
      return String(live[0].id)
    })
  }, [live])

  const featuredPortfolio = useMemo(
    () => live.find((p) => String(p.id) === featuredPortfolioId) ?? null,
    [live, featuredPortfolioId],
  )

  const ownerName = user?.username?.trim() || user?.email?.trim() || "You"
  const ownerAvatarUrl =
    typeof user?.avatar === "string" && user.avatar.trim() ? user.avatar : null
  const featuredDescription = featuredPortfolio?.description ?? ""

  const handlePublished = (
    portfolioId: string,
    slug: string,
    description: string,
  ) => {
    setPortfolios((prev) =>
      prev.map((p) =>
        String(p.id) === portfolioId
            ? {
                ...p,
                status: "publish",
                slug,
                description: description.trim() || null,
                screenshot_url: null,
                updated_at: new Date().toISOString(),
              }
            : p,
        ),
      )
    setFeaturedPortfolioId(portfolioId)
  }

  const handleUnpublish = async (portfolioId: string) => {
    try {
      const res = await fetch(`/api/portfolio/${portfolioId}/unpublish`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to unpublish")
      setPortfolios((prev) =>
        prev.map((p) =>
          String(p.id) === portfolioId
            ? {
                ...p,
                status: "draft",
                slug: null,
                screenshot_url: null,
                updated_at: new Date().toISOString(),
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

  const handleSaveDescription = async (
    nextDescription: string,
  ): Promise<void> => {
    if (!featuredPortfolio) return

    const res = await fetch(`/api/portfolio/${featuredPortfolio.id}/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: nextDescription }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || "Failed to save description")
    }

    const normalizedDescription = nextDescription.trim() || null
    setPortfolios((prev) =>
      prev.map((portfolio) =>
        String(portfolio.id) === String(featuredPortfolio.id)
          ? {
              ...portfolio,
              description: normalizedDescription,
            }
          : portfolio,
      ),
    )
    setHeroViewMode("description")
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-full border-3 border-border border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading deployment targets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-8 md:px-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Publish
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Showcase your live portfolio, manage your drafts, and ship updates
              through a guided publish flow.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-300">
                {live.length} Live
              </span>
              <span className="rounded-full border border-border bg-muted px-3 py-1 text-muted-foreground">
                {drafts.length} Drafts
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            disabled={drafts.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiGlobe className="h-4 w-4" />
            Publish portfolio
          </button>
        </div>
      </div>

      {/* Hero: featured deployment */}
      <div>
        <PublishHero
          portfolio={featuredPortfolio}
          liveCount={live.length}
          viewMode={heroViewMode}
          onViewModeChange={setHeroViewMode}
          description={featuredDescription}
          copied={Boolean(featuredPortfolio?.slug && copiedSlug === featuredPortfolio.slug)}
          onCopyUrl={() =>
            featuredPortfolio?.slug && handleCopyUrl(featuredPortfolio.slug)
          }
          onUnpublish={() =>
            featuredPortfolio && handleUnpublish(String(featuredPortfolio.id))
          }
          onOpenWizard={() => setWizardOpen(true)}
          onSaveDescription={handleSaveDescription}
        />
      </div>

      {/* Two-column feed */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Drafts column */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Drafts — ready to publish
            </h2>
            <span className="text-xs text-muted-foreground">{drafts.length}</span>
          </div>
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
              <FiInbox className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">No drafts</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Every portfolio you have is already live. Create a new portfolio to
                start a draft.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((portfolio) => (
                <PublishListCard
                  key={String(portfolio.id)}
                  portfolio={portfolio}
                  variant="draft"
                />
              ))}
            </div>
          )}
        </section>

        {/* Live column */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Live — currently deployed
            </h2>
            <span className="text-xs text-muted-foreground">{live.length}</span>
          </div>
          {live.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
              <FiGlobe className="h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Nothing is live yet</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Publish a draft to see it featured here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {live.map((portfolio) => {
                const isFeatured = String(portfolio.id) === featuredPortfolioId
                const slug = portfolio.slug ?? null
                return (
                  <PublishListCard
                    key={String(portfolio.id)}
                    portfolio={portfolio}
                    variant="live"
                    isFeatured={isFeatured}
                    copied={copiedSlug === slug}
                    onClick={() => setFeaturedPortfolioId(String(portfolio.id))}
                    onCopyUrl={() => slug && handleCopyUrl(slug)}
                    onUnpublish={() => handleUnpublish(String(portfolio.id))}
                  />
                )
              })}
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {wizardOpen && (
          <PublishWizardModal
            drafts={drafts}
            ownerName={ownerName}
            ownerAvatarUrl={ownerAvatarUrl}
            onClose={() => setWizardOpen(false)}
            onPublished={handlePublished}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default PublishPage
