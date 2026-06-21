"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/hooks/useToast";
import { Portfolio } from "@/types/portfolio";

export const usePortfolios = () => {
    const { user } = useUser();
    const { addToast } = useToast();
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
    // Deletion is optimistic (the modal closes instantly), so there is no
    // pending state to track.
    const isDeleting = false;
    const [renameTarget, setRenameTarget] = useState<Portfolio | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    useEffect(() => {
        const loadPortfolios = async () => {
            if (!user?.id) return;
            setIsLoading(true);
            try {
                const response = await fetch(`/api/portfolio/list?userId=${user.id}`);
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                const data = await response.json();
                const rows: Portfolio[] = Array.isArray(data?.portfolios)
                    ? data.portfolios.map((item: Portfolio) => ({
                          ...item,
                          title: item.title ?? "Untitled Portfolio",
                      }))
                    : [];
                setPortfolios(rows);
            } catch (error) {
                console.error("Failed to load portfolios:", error);
                setPortfolios([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadPortfolios();
    }, [user?.id]);

    const handleDelete = async (portfolioId: string) => {
        const target = portfolios.find((p) => p.id === portfolioId) ?? deleteTarget;

        // Optimistically remove the portfolio and close the modal so the UI
        // updates instantly; we roll back if the request fails.
        setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
        setDeleteTarget(null);
        addToast({
            type: "success",
            title: "Portfolio deleted",
            description: target?.title
                ? `"${target.title}" and its metrics were permanently removed.`
                : "The portfolio was permanently removed.",
        });

        try {
            const res = await fetch(`/api/portfolio/${portfolioId}/delete`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
        } catch (error) {
            console.error("Deletion failed:", error);
            // Roll back the optimistic removal.
            if (target) {
                setPortfolios((prev) =>
                    prev.some((p) => p.id === target.id) ? prev : [...prev, target],
                );
            }
            addToast({
                type: "error",
                title: "Failed to delete portfolio",
                description: "Something went wrong. Please try again.",
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
            setIsRenaming(true);
            const res = await fetch(`/api/portfolio/${renameTarget.id}/update`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: trimmed }),
            });
            if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
            setPortfolios((prev) =>
                prev.map((p) =>
                    p.id === renameTarget.id ? { ...p, title: trimmed } : p,
                ),
            );
            setRenameTarget(null);
        } catch (error) {
            console.error("Rename failed:", error);
            alert("Failed to rename portfolio.");
        } finally {
            setIsRenaming(false);
        }
    };

    return {
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
    };
};
