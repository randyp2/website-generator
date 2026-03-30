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
          className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">Publish</h1>
        <p className="text-white/60">Make your portfolios publicly accessible</p>
      </motion.div>

      {/* Published Portfolios */}
      {published.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold text-white mb-4">Live</h2>
          <div className="space-y-3">
            {published.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white/[0.06] border border-white/[0.12] rounded-xl"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <h3 className="text-white font-medium truncate">{p.title}</h3>
                  </div>
                  {p.slug && (
                    <a
                      href={`${BASE_URL}/portfolio/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/40 hover:text-white/60 font-mono flex items-center gap-1 transition-colors"
                    >
                      /portfolio/{p.slug}
                      <FiExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => p.slug && handleCopyUrl(p.slug)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                    title="Copy URL"
                  >
                    {copied ? <FiCheck className="w-4 h-4 text-emerald-400" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleUnpublish(p.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-red-400"
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
        <h2 className="text-lg font-semibold text-white mb-4">
          {published.length > 0 ? "Unpublished" : "Your Portfolios"}
        </h2>
        {drafts.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <FiGlobe className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>No portfolios to publish yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{p.title}</h3>
                  <p className="text-sm text-white/30">
                    {p.slug ? `Previously at /portfolio/${p.slug}` : "Not yet published"}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openPublishModal(p)}
                  className="ml-4 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-lg text-sm font-medium text-white transition-all flex items-center gap-2"
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1d21] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h2 className="text-xl font-bold text-white mb-1">
                Publish Portfolio
              </h2>
              <p className="text-sm text-white/50 mb-6">{selectedPortfolio.title}</p>

              {/* Slug Input */}
              <div className="mb-5">
                <label className="text-xs font-medium text-white/50 mb-2 block">
                  Choose your URL
                </label>
                <div className="flex items-center rounded-xl border border-white/20 bg-white/[0.06] overflow-hidden focus-within:border-white/30 transition-colors">
                  <span className="text-xs text-white/30 px-3 py-3 bg-white/[0.04] border-r border-white/10 whitespace-nowrap font-mono">
                    /portfolio/
                  </span>
                  <input
                    type="text"
                    value={slugInput}
                    onChange={handleSlugChange}
                    placeholder="your-name"
                    autoFocus
                    className="flex-1 px-3 py-3 text-sm text-white bg-transparent outline-none font-mono placeholder-white/20"
                  />
                  <div className="pr-3">
                    {slugChecking && <FiLoader className="w-4 h-4 text-white/30 animate-spin" />}
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
                  className="flex-1 px-4 py-3 border border-white/20 text-white/70 rounded-xl font-medium hover:bg-white/5 transition-colors"
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
                      : "bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white disabled:opacity-40 disabled:cursor-not-allowed"
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
