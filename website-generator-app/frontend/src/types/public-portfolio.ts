export interface PublicSectionDTO {
    sectionKey: string;
    title: string | null;
    orderIndex: number;
    contentJson: unknown;
    reactSource: string;
}

export interface PublicPortfolioDTO {
    portfolioId: string;
    userId: string;
    title: string;
    slug: string;
    templateId: string | null;
    description: string | null;
    sections: PublicSectionDTO[];
    globalTheme: {
        background?: string;
        textPrimary?: string;
        textSecondary?: string;
        accentColor?: string;
        fonts?: { heading?: string; body?: string };
    } | null;
    ownerName: string | null;
    ownerAvatarUrl: string | null;
    publishedAt: string;
    screenshotUrl: string | null;
    sourceType: string | null;
    externalUrl: string | null;
}
