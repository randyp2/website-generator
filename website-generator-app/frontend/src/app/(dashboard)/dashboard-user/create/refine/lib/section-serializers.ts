import type { SectionDTO } from "@/types/portfolio";

export const summarizeSection = (section: SectionDTO): string => {
    let summary = "";

    if (section.contentJson) {
        try {
            summary = JSON.stringify(section.contentJson);
        } catch {
            summary = "";
        }
    }

    if (!summary && section.reactSource) summary = section.reactSource;
    if (!summary && section.title) summary = section.title;
    if (!summary) summary = section.sectionKey;

    return summary.length > 500 ? `${summary.slice(0, 500)}...` : summary;
};

export const buildSectionSummaries = (
    items: SectionDTO[] | null,
): Array<{
    sectionKey: string;
    title: string;
    orderIndex: number | null;
    summary: string;
}> => {
    return (items ?? []).map((section) => ({
        sectionKey: section.sectionKey,
        title: section.title ?? "",
        orderIndex: section.orderIndex ?? null,
        summary: summarizeSection(section),
    }));
};

export const buildSectionContent = (
    items: SectionDTO[] | null,
): Array<{
    sectionKey: string;
    title: string;
    orderIndex: number;
    reactSource: string;
    contentJson: unknown;
}> => {
    return (items ?? []).map((section) => ({
        sectionKey: section.sectionKey,
        title: section.title ?? "",
        orderIndex: section.orderIndex ?? 0,
        reactSource: section.reactSource ?? "",
        contentJson: section.contentJson ?? {},
    }));
};

export const buildPlannerSections = (
    items: SectionDTO[] | null,
): Array<{
    sectionKey: string;
    title: string;
    orderIndex: number;
    contentJson: unknown;
}> => {
    return (items ?? []).map((section) => ({
        sectionKey: section.sectionKey,
        title: section.title ?? "",
        orderIndex: section.orderIndex ?? 0,
        contentJson: section.contentJson ?? {},
    }));
};
