"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/useToast";
import { Portfolio } from "@/types/portfolio";
import {
    usePortfolioDeleteMutation,
    usePortfolioListQuery,
    usePortfolioUpdateMutation,
} from "./usePortfolioListQuery";

export const usePortfolios = () => {
    const { user } = useUser();
    const { addToast } = useToast();
    const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
    const [renameTarget, setRenameTarget] = useState<Portfolio | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const {
        data: portfolios = [],
        isLoading,
    } = usePortfolioListQuery(user?.id);
    const deletePortfolioMutation = usePortfolioDeleteMutation(user?.id);
    const updatePortfolioMutation = usePortfolioUpdateMutation(user?.id);

    const handleDelete = async (portfolioId: string) => {
        const target =
            portfolios.find((p) => String(p.id) === portfolioId) ?? deleteTarget;

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

    const openRename = (portfolio: Portfolio) => {
        setRenameTarget(portfolio);
        setRenameTitle(portfolio.title);
    };

    const handleRename = async () => {
        if (!renameTarget) return;
        const trimmed = renameTitle.trim();
        if (!trimmed) return;
        try {
            await updatePortfolioMutation.mutateAsync({
                portfolioId: String(renameTarget.id),
                patch: { title: trimmed },
            });
            setRenameTarget(null);
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

    return {
        portfolios,
        isLoading,
        deleteTarget,
        setDeleteTarget,
        isDeleting: deletePortfolioMutation.isPending,
        handleDelete,
        renameTarget,
        setRenameTarget,
        renameTitle,
        setRenameTitle,
        isRenaming: updatePortfolioMutation.isPending,
        openRename,
        handleRename,
    };
};
