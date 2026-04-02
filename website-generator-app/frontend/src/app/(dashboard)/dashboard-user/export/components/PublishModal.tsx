"use client"

import { useCallback, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FiCheck, FiGlobe, FiLoader } from "react-icons/fi"

import { cn } from "@/lib/utils"

import type { PortfolioItem } from "./export.types"

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/

type ActionState = "idle" | "loading" | "success" | "error"

interface PublishModalProps {
  portfolio: PortfolioItem
  onClose: () => void
  onPublished: (portfolioId: string, slug: string) => void
}

export const PublishModal = ({ portfolio, onClose, onPublished }: PublishModalProps) => {
  const [slugInput, setSlugInput] = useState(portfolio.slug ?? "")
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [publishState, setPublishState] = useState<ActionState>("idle")
  const [publishError, setPublishError] = useState<string | null>(null)
  const slugCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const slugIsValid = slugInput.length >= 3 && SLUG_REGEX.test(slugInput)
  const canPublish =
    slugIsValid && (slugAvailable === true || portfolio.slug === slugInput)

  const checkSlugAvailability = useCallback(
    (value: string) => {
      if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current)
      if (!value || !SLUG_REGEX.test(value)) {
        setSlugAvailable(null)
        return
      }
      setSlugChecking(true)
      slugCheckTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/portfolio/slug-check?slug=${encodeURIComponent(value)}`,
          )
          const data = await res.json()
          setSlugAvailable(data.available)
        } catch {
          setSlugAvailable(null)
        } finally {
          setSlugChecking(false)
        }
      }, 400)
    },
    [],
  )

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setSlugInput(value)
    setPublishError(null)
    if (value === portfolio.slug) {
      setSlugAvailable(null)
      return
    }
    checkSlugAvailability(value)
  }

  const handlePublish = async () => {
    setPublishState("loading")
    setPublishError(null)
    try {
      const res = await fetch(`/api/portfolio/${portfolio.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugInput || null }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Publish failed" }))
        throw new Error(err.error || "Publish failed")
      }
      const data = await res.json()
      onPublished(portfolio.id, data.slug)
      setPublishState("success")
      setTimeout(onClose, 1500)
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Publish failed")
      setPublishState("error")
      setTimeout(() => setPublishState("idle"), 3000)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        >
          <h2 className="mb-1 text-xl font-bold text-foreground">
            Publish Portfolio
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">{portfolio.title}</p>

          {/* Slug Input */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-muted-foreground">
              Choose your URL
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-border bg-background transition-colors focus-within:border-primary">
              <span className="whitespace-nowrap border-r border-border bg-muted px-3 py-3 font-mono text-xs text-muted-foreground">
                /portfolio/
              </span>
              <input
                type="text"
                value={slugInput}
                onChange={handleSlugChange}
                placeholder="your-name"
                autoFocus
                className="flex-1 bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="pr-3">
                {slugChecking && (
                  <FiLoader className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {!slugChecking &&
                  slugAvailable === true &&
                  slugInput !== portfolio.slug && (
                    <FiCheck className="h-4 w-4 text-emerald-400" />
                  )}
                {!slugChecking &&
                  slugAvailable === false &&
                  slugInput !== portfolio.slug && (
                    <span className="text-xs text-red-400">taken</span>
                  )}
              </div>
            </div>
            {slugInput && !slugIsValid && slugInput.length > 0 && (
              <p className="mt-1.5 text-xs text-red-400/80">
                3-64 chars, lowercase letters, numbers, and hyphens
              </p>
            )}
          </div>

          {publishError && (
            <p className="mb-4 text-xs text-red-400">{publishError}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-3 font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: canPublish ? 1.02 : 1 }}
              whileTap={{ scale: canPublish ? 0.98 : 1 }}
              onClick={handlePublish}
              disabled={!canPublish || publishState === "loading"}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium transition-all",
                publishState === "success"
                  ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                  : "border border-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              {publishState === "loading" ? (
                <FiLoader className="h-4 w-4 animate-spin" />
              ) : publishState === "success" ? (
                <FiCheck className="h-4 w-4" />
              ) : (
                <FiGlobe className="h-4 w-4" />
              )}
              <span>
                {publishState === "loading"
                  ? "Publishing..."
                  : publishState === "success"
                    ? "Published!"
                    : "Publish"}
              </span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
