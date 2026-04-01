"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGlobe,
  FiCheck,
  FiCopy,
  FiLoader,
  FiExternalLink,
  FiEyeOff,
} from "react-icons/fi";

type ActionState = "idle" | "loading" | "success" | "error";

interface PortfolioItem {
  id: string;
  title: string;
  status: string;
  slug: string | null;
  updatedAt: string;
}

interface PortfolioListApiItem {
  id: string;
  title?: string | null;
  status?: string | null;
  slug?: string | null;
  updated_at?: string;
  updatedAt?: string;
  created_at?: string;
  createdAt?: string;
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;
const BASE_URL = typeof window !== "undefined" ? window.location.origin : "";

const PublishPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Publish modal state
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [slugInput, setSlugInput] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [publishState, setPublishState] = useState<ActionState>("idle");
  const [publishError, setPublishError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const slugCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch all portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const res = await fetch("/api/portfolio/list");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const items: PortfolioItem[] = ((data.portfolios ?? []) as PortfolioListApiItem[]).map((p) => ({
          id: p.id,
          title: p.title ?? "Untitled",
          status: p.status ?? "draft",
          slug: p.slug ?? null,
          updatedAt: p.updated_at ?? p.updatedAt ?? p.created_at ?? p.createdAt ?? "",
        }));
        setPortfolios(items);
      } catch {
        console.error("Failed to fetch portfolios");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolios();
  }, []);

  const published = portfolios.filter((p) => p.status === "publish");
  const drafts = portfolios.filter((p) => p.status !== "publish");

  // Slug availability check
  const checkSlugAvailability = useCallback((value: string) => {
    if (slugCheckTimeout.current) clearTimeout(slugCheckTimeout.current);
    if (!value || !SLUG_REGEX.test(value)) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    slugCheckTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/portfolio/slug-check?slug=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 400);
  }, []);

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSlugInput(value);
    setPublishError(null);
    const current = selectedPortfolio;
    if (current && value === current.slug) {
      setSlugAvailable(null);
      return;
    }
    checkSlugAvailability(value);
  };

  const openPublishModal = (portfolio: PortfolioItem) => {
    setSelectedPortfolio(portfolio);
    const existingSlug = portfolio.slug ?? "";
    setSlugInput(existingSlug);
    setSlugAvailable(null);
    setPublishError(null);
    setPublishState("idle");
  };

  const closeModal = () => {
    setSelectedPortfolio(null);
    setSlugInput("");
    setSlugAvailable(null);
    setPublishError(null);
  };

  const handlePublish = async () => {
    if (!selectedPortfolio) return;
    setPublishState("loading");
    setPublishError(null);
    try {
      const res = await fetch(`/api/portfolio/${selectedPortfolio.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slugInput || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Publish failed" }));
        throw new Error(err.error || "Publish failed");
      }
      const data = await res.json();
      // Update local state
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === selectedPortfolio.id
            ? { ...p, status: "publish", slug: data.slug }
            : p
        )
      );
      setPublishState("success");
      setTimeout(() => closeModal(), 1500);
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Publish failed");
      setPublishState("error");
      setTimeout(() => setPublishState("idle"), 3000);
    }
  };

  const handleUnpublish = async (portfolioId: string) => {
    try {
      const res = await fetch(`/api/portfolio/${portfolioId}/unpublish`, { method: "POST" });
      if (!res.ok) {
        throw new Error("Failed to unpublish");
      }
      setPortfolios((prev) =>
        prev.map((p) =>
          p.id === portfolioId ? { ...p, status: "draft" } : p
        )
      );
    } catch (error) {
      console.error("Failed to unpublish", error);
    }
  };

  const handleCopyUrl = async (slug: string) => {
    await navigator.clipboard.writeText(`${BASE_URL}/portfolio/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slugIsValid = slugInput.length >= 3 && SLUG_REGEX.test(slugInput);
  const canPublish =
    slugIsValid &&
    (slugAvailable === true || selectedPortfolio?.slug === slugInput);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-3 border-border border-t-primary"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8 md:px-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 text-4xl font-bold text-foreground">Publish</h1>
        <p className="text-muted-foreground">Make your portfolios publicly accessible</p>
      </motion.div>

      {/* Published Portfolios */}
      {published.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Live</h2>
          <div className="space-y-3">
            {published.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card/80 p-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <h3 className="truncate font-medium text-foreground">{p.title}</h3>
                  </div>
                  {p.slug && (
                    <a
                      href={`${BASE_URL}/portfolio/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      /portfolio/{p.slug}
                      <FiExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => p.slug && handleCopyUrl(p.slug)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Copy URL"
                  >
                    {copied ? <FiCheck className="w-4 h-4 text-emerald-400" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleUnpublish(p.id)}
                    className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-red-500"
                    title="Unpublish"
                  >
                    <FiEyeOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Draft Portfolios */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          {published.length > 0 ? "Unpublished" : "Your Portfolios"}
        </h2>
        {drafts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <FiGlobe className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No portfolios to publish yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card/70 p-4 transition-all hover:border-primary/20 hover:bg-card"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="truncate font-medium text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {p.slug ? `Previously at /portfolio/${p.slug}` : "Not yet published"}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openPublishModal(p)}
                  className="ml-4 flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-muted/80"
                >
                  <FiGlobe className="w-4 h-4" />
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={closeModal}
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
              <p className="mb-6 text-sm text-muted-foreground">{selectedPortfolio.title}</p>

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
                    {slugChecking && <FiLoader className="h-4 w-4 animate-spin text-muted-foreground" />}
                    {!slugChecking && slugAvailable === true && slugInput !== selectedPortfolio.slug && (
                      <FiCheck className="w-4 h-4 text-emerald-400" />
                    )}
                    {!slugChecking && slugAvailable === false && slugInput !== selectedPortfolio.slug && (
                      <span className="text-xs text-red-400">taken</span>
                    )}
                  </div>
                </div>
                {slugInput && !slugIsValid && slugInput.length > 0 && (
                  <p className="text-xs text-red-400/80 mt-1.5">
                    3-64 chars, lowercase letters, numbers, and hyphens
                  </p>
                )}
              </div>

              {publishError && (
                <p className="text-xs text-red-400 mb-4">{publishError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-border px-4 py-3 font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: canPublish ? 1.02 : 1 }}
                  whileTap={{ scale: canPublish ? 0.98 : 1 }}
                  onClick={handlePublish}
                  disabled={!canPublish || publishState === "loading"}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    publishState === "success"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "border border-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                  }`}
                >
                  {publishState === "loading" ? (
                    <FiLoader className="w-4 h-4 animate-spin" />
                  ) : publishState === "success" ? (
                    <FiCheck className="w-4 h-4" />
                  ) : (
                    <FiGlobe className="w-4 h-4" />
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
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublishPage;
