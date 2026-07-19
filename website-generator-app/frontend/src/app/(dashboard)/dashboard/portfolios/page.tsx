"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiDownload,
  FiMoreVertical,
  FiTrash2,
  FiHeart,
  FiMail,
  FiMessageCircle,
  FiShare2,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/useToast";
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
import { resolveResumePath } from "../utils/portfolioUtils";

interface Portfolio {
  id: string;
  title: string;
  thumbnail: string | null;
  status: string;
  lastEdited: string;
  url: string | null;
  editPath: string;
  explorePath: string | null;
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

const getPortfolioCardImage = (portfolio: PortfolioListItem): string | null =>
  portfolio.screenshot_url?.trim() ||
  portfolio.screenshotUrl?.trim() ||
  null;

const resolveExplorePath = (portfolio: PortfolioListItem): string | null => {
  const slug = portfolio.slug?.trim();
  return slug ? `/explore/${encodeURIComponent(slug)}` : null;
};

const PortfolioManager: React.FC = () => {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // State for delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);

  // Extract user from context
  const { user } = useUser();
  const { addToast } = useToast();
  const { id: userId } = user;
  const usernameOrEmail = user?.username?.trim() || user?.email?.trim() || null;
  const {
    data: portfolioRows = [],
    isLoading: loading,
  } = usePortfolioListQuery(userId);
  const updatePortfolioMutation = usePortfolioUpdateMutation(userId);
  const deletePortfolioMutation = usePortfolioDeleteMutation(userId);
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
          editPath: resolveResumePath(item),
          explorePath: resolveExplorePath(item),
        };
      }),
    [portfolioRows, usernameOrEmail],
  );

  const handleEditClick = (portfolio: Portfolio) => {
    setActiveMenu(null);
    router.push(portfolio.editPath);
  };

  const handleCardClick = (portfolio: Portfolio) => {
    if (!portfolio.explorePath) return;
    router.push(portfolio.explorePath);
  };

  const startRename = (portfolio: Portfolio) => {
    setActiveMenu(null);
    setRenamingId(portfolio.id);
    setRenameValue(portfolio.title);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const handleRenameSubmit = async (portfolio: Portfolio) => {
    const nextTitle = renameValue.trim();
    setRenamingId(null);
    setRenameValue("");

    if (!nextTitle || nextTitle === portfolio.title) return;

    try {
      await updatePortfolioMutation.mutateAsync({
        portfolioId: portfolio.id,
        patch: { title: nextTitle },
      });
    } catch (error) {
      console.error("Rename failed:", error);
      addToast({
        type: "error",
        title: "Failed to rename portfolio",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  };

  // Handler to delete portfolio
  const handleDelete = async (portfolioId: string) => {
    const target =
      portfolios.find((portfolio) => portfolio.id === portfolioId) ?? deleteTarget;

    setDeleteTarget(null);

    try {
      await deletePortfolioMutation.mutateAsync(portfolioId);
      addToast({
        type: "success",
        title: "Portfolio deleted",
        description: target?.title
          ? `"${target.title}" and its metrics were permanently removed.`
          : "The portfolio was permanently removed.",
      });
    } catch (error) {
      console.error("Deletion failed:", error);
      addToast({
        type: "error",
        title: "Failed to delete portfolio",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    }
  };

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
              onClick={() => handleCardClick(portfolio)}
              className={`group relative cursor-pointer ${
                activeMenu === portfolio.id ? "z-50" : "z-0"
              }`}
            >
              {/* Card Container */}
              <div className="overflow-visible rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-lg transition-all hover:border-primary/30 hover:shadow-xl">
                {/* Thumbnail image */}
                <div className="relative h-48 overflow-hidden">
                  {portfolio.thumbnail ? (
                    <>
                      <Image
                        src={portfolio.thumbnail}
                        alt={`${portfolio.title} preview`}
                        fill
                        unoptimized
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/10 to-transparent" />
                      <div className="absolute -top-20 right-[-20%] h-40 w-40 rounded-full bg-background/40 blur-3xl" />
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-muted/40 px-8 text-center">
                      <div className="space-y-1.5">
                        <p className="text-sm font-medium text-foreground">
                          We&apos;re retrieving your screenshot.
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Please refresh or try again in a few seconds.
                        </p>
                      </div>
                    </div>
                  )}

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
                  <div className="mb-2 min-h-7">
                    {renamingId === portfolio.id ? (
                      <input
                        type="text"
                        value={renameValue}
                        autoFocus
                        aria-label="Rename portfolio"
                        onFocus={(event) => event.currentTarget.select()}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onBlur={(event) => {
                          if (event.currentTarget.dataset.cancelRename === "true") {
                            cancelRename();
                            return;
                          }

                          void handleRenameSubmit(portfolio);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            event.currentTarget.blur();
                          }
                          if (event.key === "Escape") {
                            event.preventDefault();
                            event.currentTarget.dataset.cancelRename = "true";
                            event.currentTarget.blur();
                          }
                        }}
                        className="h-7 w-full rounded-md border border-border bg-background px-2 text-lg font-semibold text-foreground outline-none transition-colors focus:border-primary"
                      />
                    ) : (
                      <h3 className="truncate text-lg font-semibold text-foreground">
                        {portfolio.title}
                      </h3>
                    )}
                  </div>

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
                      className="mb-4 block max-w-full truncate break-all text-sm font-medium text-blue-600 underline underline-offset-2 transition hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {portfolio.url}
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
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveMenu(
                            activeMenu === portfolio.id ? null : portfolio.id
                          );
                        }}
                        className="rounded-lg p-2 transition-colors hover:cursor-pointer"
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
                                onClick: () => { console.log("Export")}
                              },
                              {
                                icon: FiEdit2,
                                label: "Rename",
                                onClick: () => startRename(portfolio),
                              },
                              {
                                icon: FiTrash2,
                                label: "Delete",
                                onClick: () => {
                                  setDeleteTarget(portfolio);
                                  setActiveMenu(null);
                                },
                              },
                            ].map((action) => (
                              <button
                                key={action.label}
                                className={`group flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:cursor-pointer ${action.label === "Delete" ? "hover:bg-red-500/10" : "hover:bg-white/5"}`}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  action.onClick();
                                }}
                              >
                                <action.icon
                                  className={`h-4 w-4 ${action.label === "Delete" ? "text-red-400" : action.label === "Export" ? "text-sky-400" : "text-cyan-400"}`}
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
