"use client";

import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { useUser } from "@/context/UserContext";

import { PublishDraftsColumn } from "./components/PublishDraftsColumn";
import { PublishHero } from "./components/PublishHero";
import type { PublishHeroViewMode } from "./components/PublishHeroViewToggle";
import { PublishLiveColumn } from "./components/PublishLiveColumn";
import { PublishLoadingState } from "./components/PublishLoadingState";
import { PublishWizardModal } from "./components/PublishWizardModal";
import { useCopySlug } from "./hooks/useCopySlug";
import { useFeaturedPortfolio } from "./hooks/useFeaturedPortfolio";
import { usePortfoliosList } from "./hooks/usePortfoliosList";
import { usePublishMutations } from "./hooks/usePublishMutations";

const PublishPage = () => {
    const { user } = useUser();
    const { drafts, live, loading, reload, setPortfolios } = usePortfoliosList(
        user?.id ?? null,
    );
    const { featuredPortfolio, featuredPortfolioId, setFeaturedPortfolioId } =
        useFeaturedPortfolio(live);
    const { copiedSlug, copySlug } = useCopySlug();
    const { applyPublished, unpublish, updateDescription } =
        usePublishMutations({
            setPortfolios,
        });

    const [wizardOpen, setWizardOpen] = useState<boolean>(false);
    const [heroViewMode, setHeroViewMode] =
        useState<PublishHeroViewMode>("screenshot");

    const ownerName = user?.username?.trim() || user?.email?.trim() || "You";
    const ownerAvatarUrl =
        typeof user?.avatar === "string" && user.avatar.trim()
            ? user.avatar
            : null;
    const featuredDescription = featuredPortfolio?.description ?? "";

    const handlePublished = useCallback(
        (portfolioId: string, slug: string, description: string): void => {
            applyPublished({ portfolioId, slug, description });
            setFeaturedPortfolioId(portfolioId);
            void reload();
        },
        [applyPublished, reload, setFeaturedPortfolioId],
    );

    const handleSaveDescription = useCallback(
        async (nextDescription: string): Promise<void> => {
            if (!featuredPortfolio) return;
            await updateDescription(
                String(featuredPortfolio.id),
                nextDescription,
            );
            setHeroViewMode("description");
        },
        [featuredPortfolio, updateDescription],
    );

    const handleCopyFeatured = useCallback((): void => {
        if (!featuredPortfolio?.slug) return;
        const externalUrl =
            featuredPortfolio.external_url ??
            featuredPortfolio.externalUrl ??
            null;
        void copySlug(featuredPortfolio.slug, externalUrl);
    }, [featuredPortfolio, copySlug]);

    const handleUnpublishFeatured = useCallback((): void => {
        if (featuredPortfolio) void unpublish(String(featuredPortfolio.id));
    }, [featuredPortfolio, unpublish]);

    const handleCopySlug = useCallback(
        (slug: string, externalUrl?: string | null): void => {
            void copySlug(slug, externalUrl ?? null);
        },
        [copySlug],
    );

    const handleUnpublishPortfolio = useCallback(
        (portfolioId: string): void => {
            void unpublish(portfolioId);
        },
        [unpublish],
    );

    if (loading) return <PublishLoadingState />;

    return (
        <div className="space-y-6 px-4 py-8 md:px-6">
            <div>
                <PublishHero
                    portfolio={featuredPortfolio}
                    liveCount={live.length}
                    viewMode={heroViewMode}
                    onViewModeChange={setHeroViewMode}
                    description={featuredDescription}
                    copied={Boolean(
                        featuredPortfolio?.slug &&
                        copiedSlug === featuredPortfolio.slug,
                    )}
                    onCopyUrl={handleCopyFeatured}
                    onUnpublish={handleUnpublishFeatured}
                    onOpenWizard={() => setWizardOpen(true)}
                    onSaveDescription={handleSaveDescription}
                />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <PublishDraftsColumn drafts={drafts} />
                <PublishLiveColumn
                    live={live}
                    featuredPortfolioId={featuredPortfolioId}
                    copiedSlug={copiedSlug}
                    onSelectFeatured={setFeaturedPortfolioId}
                    onCopyUrl={handleCopySlug}
                    onUnpublish={handleUnpublishPortfolio}
                />
            </div>

            <AnimatePresence>
                {wizardOpen && (
                    <PublishWizardModal
                        drafts={drafts}
                        ownerName={ownerName}
                        ownerAvatarUrl={ownerAvatarUrl}
                        onClose={() => setWizardOpen(false)}
                        onPublished={handlePublished}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default PublishPage;
