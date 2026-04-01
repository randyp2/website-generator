"use client";

import { useState, useEffect } from "react";
import { Portfolio } from "@/types/portfolio";
import { DASHBOARD_MOCK_PORTFOLIOS } from "../mock-data";

export const usePortfolios = () => {
    const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [renameTarget, setRenameTarget] = useState<Portfolio | null>(null);
    const [renameTitle, setRenameTitle] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPortfolios(DASHBOARD_MOCK_PORTFOLIOS);
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleDelete = async (portfolioId: string) => {
        setIsDeleting(true);
        setPortfolios((prev) => prev.filter((p) => p.id !== portfolioId));
        setDeleteTarget(null);
        setIsDeleting(false);
    };

    const openRename = (portfolio: Portfolio) => {
        setRenameTarget(portfolio);
        setRenameTitle(portfolio.title);
    };

    const handleRename = async () => {
        if (!renameTarget) return;
        const trimmed = renameTitle.trim();
        if (!trimmed) return;
        setIsRenaming(true);
        setPortfolios((prev) =>
            prev.map((p) =>
                p.id === renameTarget.id ? { ...p, title: trimmed } : p,
            ),
        );
        setRenameTarget(null);
        setIsRenaming(false);
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
