"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiCopy,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiGlobe,
  FiHeart,
  FiMail,
  FiMessageCircle,
  FiShare2,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { buildPortfolioUrl } from "@/lib/public-env";
import type { Portfolio as PortfolioRecord } from "@/types/portfolio";
import { Button } from "@/components/ui/button";
import { DeletePortfolioOverlay } from "../components/DeletePortfolioOverlay";
import { usePortfolioEngagementMetrics } from "../hooks/usePortfolioEngagementMetrics";
import {
  usePortfolioDeleteMutation,
  usePortfolioListQuery,
  usePortfolioUpdateMutation,
} from "../hooks/usePortfolioListQuery";

interface Portfolio {
  id: string;
  title: string;
  thumbnail: string;
  status: string;
  lastEdited: string;
  url: string | null;
}

type PortfolioListItem = PortfolioRecord & {
  url?: string | null;
  external_url?: string | null;
  externalUrl?: string | null;
  screenshotUrl?: string | null;
};

const DEPLOYED_STATUSES = new Set(["active", "publish", "published"]);

const resolvePortfolioUrl = (
  portfolio: PortfolioListItem,
  username: string | null,
): string | null => {
  const normalizedStatus = (portfolio.status ?? "").toLowerCase().trim();
  if (!DEPLOYED_STATUSES.has(normalizedStatus)) return null;

  const sourceType = (portfolio.source_type ?? portfolio.sourceType ?? "")
    .trim()
    .toLowerCase();
  const externalUrl = (portfolio.external_url ?? portfolio.externalUrl ?? "").trim();
  if (sourceType === "external" && externalUrl) return externalUrl;
  if (sourceType !== "generated" && externalUrl) return externalUrl;

  const slug = portfolio.slug?.trim();
  if (slug) return buildPortfolioUrl(slug, username);

  return null;
};

const DEFAULT_PORTFOLIO_CARD_IMAGE =
  "https://images.unsplash.com/photo-1545665277-5937489579f2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const getPortfolioCardImage = (portfolio: PortfolioListItem): string =>
  portfolio.screenshot_url?.trim() ||
  portfolio.screenshotUrl?.trim() ||
  DEFAULT_PORTFOLIO_CARD_IMAGE;

const PortfolioManager: React.FC = () => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // NEW: State for edit modal - tracks which portfolio is being edited
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [editFormData, setEditFormData] = useState({ title: "", url: "" });

  // State for delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);

  // Extract user from context
  const { user } = useUser();
  const { id: userId } = user;
  const usernameOrEmail = user?.username?.trim() || user?.email?.trim() || null;
  const {
    data: portfolioRows = [],
    isLoading: loading,
  } = usePortfolioListQuery(userId);
  const updatePortfolioMutation = usePortfolioUpdateMutation(userId);
  const deletePortfolioMutation = usePortfolioDeleteMutation(userId);
  const isSaving = updatePortfolioMutation.isPending;
  const isDeleting = deletePortfolioMutation.isPending;

  const { rows: engagementRows } = usePortfolioEngagementMetrics();
  const engagementByPortfolioId = useMemo(() => {
    const map = new Map<string, { views: number; likes: number; shares: number; comments: number }>();
    for (const row of engagementRows) {
      map.set(row.portfolioId, {
        views: row.views,
        likes: row.likes,
        shares: row.shares,
        comments: row.comments,
      });
    }
    return map;
  }, [engagementRows]);


  const portfolios = useMemo<Portfolio[]>(
    () =>
      portfolioRows.map((item) => {
        const lastEditedSource = item.updated_at ?? item.created_at;

        return {
          id: String(item.id),
          title: item.title,
          thumbnail: getPortfolioCardImage(item),
          status: item.status ?? "draft",
          lastEdited: lastEditedSource
            ? new Date(lastEditedSource).toLocaleDateString()
            : "Unknown",
          url: resolvePortfolioUrl(item, usernameOrEmail),
        };
      }),
    [portfolioRows, usernameOrEmail],
  );

  // Handler to open edit modal - triggered when user clicks Edit icon
  const handleEditClick = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setEditFormData({
      title: portfolio.title,
      url: portfolio.url || "",
    });
    setActiveMenu(null); // Close any open menus
  };

  // Handler to close edit modal
  const handleCloseEdit = () => {
    setEditingPortfolio(null);
    setEditFormData({ title: "", url: "" });
  };

  // Handler to update portfolio - includes API call placeholder
  const handleUpdatePortfolio = async () => {
    if (!editingPortfolio) return;

    try {
      await updatePortfolioMutation.mutateAsync({
        portfolioId: editingPortfolio.id,
        patch: {
          title: editFormData.title,
        },
      });

      // Close modal and show success
      handleCloseEdit();
      alert("Portfolio updated successfully!");
    } catch (error) {
      console.error("Error updating portfolio:", error);
      alert("Failed to update portfolio. Please try again.");
    }
  };

    // Handler to delete portfolio
    const handleDelete = async (portfolioId: string) => {
        try {
            await deletePortfolioMutation.mutateAsync(portfolioId);
            setDeleteTarget(null);

        } catch (error) {
            console.error("Deletion failed: ", error);
            alert("Failed to delete portfolio.");
        }
    }

  const statusConfig: Record<
    string,
    {
      label: string;
      bgColor: string;
      textColor: string;
      dotColor: string;
    }
  > = {
    draft: {
      label: "Draft",
      bgColor: "bg-muted",
      textColor: "text-muted-foreground",
      dotColor: "bg-yellow-500",
    },
    published: {
      label: "Published",
      bgColor: "bg-green-500/20",
      textColor: "text-green-100",
      dotColor: "bg-green-500",
    },
    publish: {
      label: "Published",
      bgColor: "bg-green-500/20",
      textColor: "text-green-100",
      dotColor: "bg-green-500",
    },
    unpublished: {
      label: "Unpublished",
      bgColor: "bg-muted",
      textColor: "text-muted-foreground",
      dotColor: "bg-muted-foreground",
    },
    archived: {
      label: "Archived",
      bgColor: "bg-zinc-500/20",
      textColor: "text-zinc-200",
      dotColor: "bg-zinc-300",
    },
  };

  const fallbackStatus = statusConfig.draft;

  const getStatus = (rawStatus?: string) => {
    if (!rawStatus) return fallbackStatus;

    const normalized = rawStatus.toLowerCase();
    const matched = statusConfig[normalized];
    if (matched) return matched;

    return {
      ...fallbackStatus,
      label: rawStatus
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    };
  };

  // Loading screen component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-16 w-16 rounded-full border-4 border-border border-t-primary"
          />
          <p className="mt-4 font-medium text-muted-foreground">Loading portfolios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-8 md:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground">
            Your Portfolios
          </h1>
          <p className="text-sm text-muted-foreground">
            {portfolios.length} portfolio{portfolios.length !== 1 ? "s" : ""}{" "}
            created
          </p>
        </div>

        <Button
          type="button"
          onClick={() => router.push("/dashboard/create")}
          className="hidden gap-1.5 md:inline-flex"
        >
          <FiPlus className="h-4 w-4 text-primary-foreground" />
          New Portfolio
        </Button>
      </motion.div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((portfolio, index) => {
          const status = getStatus(portfolio.status);
          const engagement = engagementByPortfolioId.get(portfolio.id) ?? {
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
          };

          return (
            <motion.div
              key={portfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredId(portfolio.id)}
              onHoverEnd={() => setHoveredId(null)}
              className={`group relative hover:cursor-pointer ${
                activeMenu === portfolio.id ? "z-50" : "z-0"
              }`}
            >
              {/* Card Container */}
              <div className="overflow-visible rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg transition-all hover:border-primary/30 hover:shadow-xl">
                {/* Thumbnail image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={portfolio.thumbnail || DEFAULT_PORTFOLIO_CARD_IMAGE}
                    alt={`${portfolio.title} preview`}
                    fill
                    unoptimized
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />
                  <div className="absolute -top-20 right-[-20%] h-40 w-40 rounded-full bg-background/40 blur-3xl" />

                  {/* Quick Actions Overlay (on hover) */}
                  <AnimatePresence>
                    {hoveredId === portfolio.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex items-center justify-center gap-3 bg-black/55 backdrop-blur-sm"
                      >
                        {[
                          {
                            icon: FiEye,
                            label: portfolio.url ? "Preview" : "Publish to preview",
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              if (portfolio.url) window.open(portfolio.url, "_blank", "noopener,noreferrer");
                            },
                            disabled: !portfolio.url,
                          },
                          {
                            icon: FiEdit2,
                            label: "Edit",
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              handleEditClick(portfolio);
                            },
                            disabled: false,
                          },
                          {
                            icon: FiMail,
                            label: portfolio.url ? "Share via email" : "Publish to share",
                            onClick: (e: React.MouseEvent) => {
                              e.stopPropagation();
                              if (!portfolio.url) return;
                              const subject = encodeURIComponent(
                                `Check out my portfolio: ${portfolio.title}`,
                              );
                              const body = encodeURIComponent(
                                `I wanted to share my portfolio with you:\n\n${portfolio.title}\n${portfolio.url}\n`,
                              );
                              window.location.href = `mailto:?subject=${subject}&body=${body}`;
                            },
                            disabled: !portfolio.url,
                          },
                        ].map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className="rounded-xl bg-background/80 p-3 shadow-lg hover:cursor-pointer hover:bg-background hover:scale-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                            title={action.label}
                          >
                            <action.icon className="h-5 w-5 text-foreground" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card Content */}
                <div className="p-5">
                  {/* Title */}
                  <h3 className="mb-2 truncate text-lg font-semibold text-foreground">
                    {portfolio.title}
                  </h3>

                  {/* Status + Last Edited */}
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${status.bgColor} ${status.textColor}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dotColor}`} />
                      {status.label}
                    </span>
                    <span>Edited {portfolio.lastEdited}</span>
                  </div>

                  {/* URL (only when deployed) */}
                  {portfolio.url ? (
                    <a
                      href={portfolio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mb-4 flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
                    >
                      <FiGlobe className="h-4 w-4 shrink-0" />
                      <span className="truncate">{portfolio.url}</span>
                    </a>
                  ) : (
                    <div className="mb-4 h-px" />
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FiEye className="w-4 h-4" />
                        <span>{engagement.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiHeart className="w-4 h-4" />
                        <span>{engagement.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMessageCircle className="w-4 h-4" />
                        <span>{engagement.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiShare2 className="w-4 h-4" />
                        <span>{engagement.shares}</span>
                      </div>
                    </div>

                    {/* More Actions Menu */}
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === portfolio.id ? null : portfolio.id
                          )
                        }
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FiMoreVertical className="w-4 h-4 text-white/70" />
                      </motion.button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenu === portfolio.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-48 bg-[#1a1d21] rounded-xl shadow-2xl border border-white/10 py-2 z-[9999]"
                          >
                            {[
                              {
                                icon: FiDownload,
                                label: "Export",
                                color: "sky",
                                onClick: () => { console.log("Export")}
                              },
                              {
                                icon: FiCopy,
                                label: "Duplicate",
                                color: "cyan",
                                onClick: () => { console.log("Duplicate")}
                              },
                              {
                                icon: FiTrash2,
                                label: "Delete",
                                color: "red",
                                onClick: () => {
                                  setDeleteTarget(portfolio);
                                  setActiveMenu(null);
                                },
                              },
                            ].map((action) => (
                              <button
                                key={action.label}
                                className={`w-full px-4 py-2 flex items-center gap-3 ${action.label === "Delete" ? "hover:bg-red-500/10" : "hover:bg-white/5"} transition-colors text-left group`}
                                onClick={action.onClick}
                              >
                                <action.icon
                                  className={`w-4 h-4 ${action.label === "Delete" ? "text-red-400" : action.label === "Export" ? "text-sky-400" : "text-cyan-400"}`}
                                />
                                <span className={`text-sm font-medium text-white ${action.label === "Delete" ? "group-hover:text-red-400" : ""}`}>
                                  {action.label}
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/dashboard/create")}
        className="md:hidden fixed bottom-8 right-8 w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center z-50 hover:bg-white/15 hover:border-white/30 transition-all"
      >
        <FiPlus className="w-7 h-7" />
      </motion.button>

      {/* NEW: Edit Portfolio Modal Overlay */}
      <AnimatePresence>
        {editingPortfolio && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseEdit}
          >
            {/* Modal content - prevents close when clicking inside */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1d21] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Portfolio</h2>
                <button
                  onClick={handleCloseEdit}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-white/70">&times;</span>
                </button>
              </div>

              {/* Edit Form */}
              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Portfolio Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/30 outline-none transition-all text-white placeholder-white/50"
                    placeholder="Enter portfolio title"
                  />
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-semibold text-white/80 mb-2">
                    Portfolio URL (optional)
                  </label>
                  <input
                    type="text"
                    value={editFormData.url}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, url: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-white/30 focus:border-white/30 outline-none transition-all text-white placeholder-white/50"
                    placeholder="yourname.portfolio.ai"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleCloseEdit}
                    disabled={isSaving}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUpdatePortfolio}
                    disabled={isSaving || !editFormData.title.trim()}
                    className="flex-1"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeletePortfolioOverlay
        isOpen={Boolean(deleteTarget)}
        portfolioTitle={deleteTarget?.title}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default PortfolioManager;
