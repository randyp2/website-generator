"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/context/UserContext";
import type { Portfolio } from "@/types/portfolio";
import { usePortfolios } from "../hooks/usePortfolios";
import { normalizeStatus, getDateValue } from "../utils/portfolioUtils";
import { PortfolioToolbar } from "./PortfolioToolbar";
import { PortfolioListView } from "./PortfolioListView";
import { PortfolioCardView } from "./PortfolioCardView";
import { DeletePortfolioOverlay } from "./DeletePortfolioOverlay";
import { RenamePortfolioModal } from "./RenamePortfolioModal";
import { DeployedPortfolioPreview } from "./DeployedPortfolioPreview";

type SortBy = "name" | "date" | "status";
type DisplayMode = "card" | "list";

const isGeneratedPortfolio = (portfolio: Portfolio): boolean => {
    const sourceType = (portfolio.source_type ?? portfolio.sourceType ?? "")
        .trim()
        .toLowerCase();

    if (sourceType) {
        return sourceType === "generated";
    }

    const externalUrl = (portfolio.external_url ?? portfolio.externalUrl ?? "")
        .trim();

    return externalUrl.length === 0;
};

export const RecentSection: React.FC = () => {
    const [sortBy, setSortBy] = useState<SortBy>("date");
    const [displayMode, setDisplayMode] = useState<DisplayMode>("list");
    const [showArchived, setShowArchived] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { user } = useUser();

    const {
        portfolios,
        isLoading,
        deleteTarget,
        setDeleteTarget,
        isDeleting,
        handleDelete,
        renameTarget,
        setRenameTarget,
        renameTitle,
        setRenameTitle,
        isRenaming,
        openRename,
        handleRename,
    } = usePortfolios();

    const filteredAndSortedPortfolios = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();

        const matchesQuery = (fields: Array<string | null | undefined>) =>
            fields.some((field) => (field ?? "").toLowerCase().includes(normalizedQuery));

        return portfolios
            .filter(isGeneratedPortfolio)
            .filter((p) => showArchived || normalizeStatus(p.status) !== "archived")
            .filter((p) => {
                if (!normalizedQuery) return true;
                return matchesQuery([
                    p.title,
                    p.status,
                    p.slug,
                    p.template_id,
                    p.last_step,
                ]);
            })
            .sort((a, b) => {
                if (sortBy === "name") return a.title.localeCompare(b.title);
                if (sortBy === "date") {
                    return (
                        getDateValue(b.updated_at ?? b.created_at ?? null) -
                        getDateValue(a.updated_at ?? a.created_at ?? null)
                    );
                }
                const statusOrder: Record<string, number> = { active: 1, draft: 2, archived: 3 };
                return statusOrder[normalizeStatus(a.status)] - statusOrder[normalizeStatus(b.status)];
            });
    }, [portfolios, showArchived, searchQuery, sortBy]);

    return (
        <div className="space-y-4">
            <DeployedPortfolioPreview
                portfolios={portfolios}
                isLoading={isLoading}
                user={user}
            />

            <div className="pt-3 md:pt-5 space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-foreground">Created Portfolios</h3>
                <PortfolioToolbar
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    displayMode={displayMode}
                    setDisplayMode={setDisplayMode}
                    showArchived={showArchived}
                    setShowArchived={setShowArchived}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="h-[500px] rounded-2xl border border-border bg-card/80"
            >
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        Loading portfolios...
                    </div>
                ) : filteredAndSortedPortfolios.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No portfolios yet.
                    </div>
                ) : displayMode === "list" ? (
                    <PortfolioListView
                        portfolios={filteredAndSortedPortfolios}
                        onRename={openRename}
                        onDelete={setDeleteTarget}
                    />
                ) : (
                    <PortfolioCardView
                        portfolios={filteredAndSortedPortfolios}
                        onRename={openRename}
                        onDelete={setDeleteTarget}
                    />
                )}
            </motion.div>

            <DeletePortfolioOverlay
                isOpen={Boolean(deleteTarget)}
                portfolioTitle={deleteTarget?.title}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
                isDeleting={isDeleting}
            />

            {renameTarget && (
                <RenamePortfolioModal
                    renameTitle={renameTitle}
                    isRenaming={isRenaming}
                    onTitleChange={setRenameTitle}
                    onConfirm={handleRename}
                    onCancel={() => setRenameTarget(null)}
                />
            )}
        </div>
    );
};
