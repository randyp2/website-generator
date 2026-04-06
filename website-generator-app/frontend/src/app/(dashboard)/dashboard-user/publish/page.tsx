"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiEyeOff,
  FiGlobe,
} from "react-icons/fi"

import { PublishModal } from "./components/PublishModal"
import type { PortfolioItem, PortfolioListApiItem } from "./components/publish.types"

const BASE_URL = typeof window !== "undefined" ? window.location.origin : ""

const mapApiItem = (p: PortfolioListApiItem): PortfolioItem => ({
  id: p.id,
  title: p.title ?? "Untitled",
  status: p.status ?? "draft",
  slug: p.slug ?? null,
  updatedAt: p.updated_at ?? p.updatedAt ?? p.created_at ?? p.createdAt ?? "",
})

const PublishPage = () => {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch("/api/portfolio/list")
        if (!res.ok) throw new Error()
        const data = await res.json()
        setPortfolios(
          ((data.portfolios ?? []) as PortfolioListApiItem[]).map(mapApiItem),
        )
      } catch {
        console.error("Failed to fetch portfolios")
      } finally {
        setLoading(false)
      }
    }
    fetchPortfolios()
  }, [])

  const published = portfolios.filter((p) => p.status === "publish")
  const drafts = portfolios.filter((p) => p.status !== "publish")

  const handlePublished = (portfolioId: string, slug: string) => {
    setPortfolios((prev) =>
      prev.map((p) =>
        p.id === portfolioId ? { ...p, status: "publish", slug } : p,
      ),
    )
  }

  const handleUnpublish = async (portfolioId: string) => {
    try {
      const res = await fetch(`/api/portfolio/${portfolioId}/unpublish`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to unpublish")
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === portfolioId ? { ...p, status: "draft" } : p,
        ),
      )
    } catch (error) {
      console.error("Failed to unpublish", error)
    }
  }

  const handleCopyUrl = async (slug: string) => {
    await navigator.clipboard.writeText(`${BASE_URL}/portfolio/${slug}`)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-3 border-border border-t-primary"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-8 md:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-4xl font-bold text-foreground">Publish</h1>
        <p className="text-muted-foreground">
          Make your portfolios publicly accessible
        </p>
      </motion.div>

      {/* Published Portfolios */}
      {published.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="mb-4 text-lg font-semibold text-foreground">Live</h2>
          <div className="space-y-3">
            {published.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card/80 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <h3 className="truncate font-medium text-foreground">
                      {p.title}
                    </h3>
                  </div>
                  {p.slug && (
                    <a
                      href={`${BASE_URL}/portfolio/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      /portfolio/{p.slug}
                      <FiExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => p.slug && handleCopyUrl(p.slug)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Copy URL"
                  >
                    {copiedSlug === p.slug ? (
                      <FiCheck className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <FiCopy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleUnpublish(p.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
                    title="Unpublish"
                  >
                    <FiEyeOff className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Draft Portfolios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {published.length > 0 ? "Unpublished" : "Your Portfolios"}
        </h2>
        {drafts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FiGlobe className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p>No portfolios to publish yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card/70 p-4 transition-all hover:border-primary/20 hover:bg-card"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-foreground">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {p.slug
                      ? `Previously at /portfolio/${p.slug}`
                      : "Not yet published"}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPortfolio(p)}
                  className="ml-4 flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-muted/80"
                >
                  <FiGlobe className="h-4 w-4" />
                  Publish
                </motion.button>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Publish Modal */}
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
