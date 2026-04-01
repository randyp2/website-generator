"use client";

import { useState, useEffect } from "react";
import { Portfolio } from "@/types/portfolio";
import type { UUID } from "node:crypto";

const MOCK_PORTFOLIOS: Portfolio[] = [
    {
        id: "mock-portfolio-001" as UUID,
        title: "Software Engineer Portfolio",
        status: "publish",
        template_id: "developer-dark",
        last_step: "refine",
        slug: "john-doe-dev",
        updated_at: "2026-03-28T14:30:00Z",
        created_at: "2026-03-15T09:00:00Z",
    },
    {
        id: "mock-portfolio-002" as UUID,
        title: "Product Design Showcase",
        status: "draft",
        template_id: "creative-minimal",
        last_step: "review",
        slug: null,
        updated_at: "2026-03-25T11:00:00Z",
        created_at: "2026-03-20T16:45:00Z",
    },
    {
        id: "mock-portfolio-003" as UUID,
        title: "Data Science Portfolio",
        status: "draft",
        template_id: "developer-dark",
        last_step: "upload",
        slug: null,
        updated_at: "2026-03-22T08:15:00Z",
        created_at: "2026-03-18T12:30:00Z",
    },
];

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
            setPortfolios(MOCK_PORTFOLIOS);
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
