import type { SectionDTO } from "@/types/portfolio";

/**
 * Helper function to return non-null fields to represent a section dto
 *
 * @param section - a DTO of a section typically returned by backend API
 * @returns a string that represents the section based on available fields
 */
export const summarizeSection = (section: SectionDTO): string => {
    let summary: string = "";

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

/**
 * Summmarize a list of SectionDTOs
 *
 * @param items - a list of section DTOs or null to build section summaries
 * @returns an Array of the section DTOs w/ a summary
 */
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

/**
 * Build a list of section content from the Section DTOs
 * !NOTE = Might be redundant will refactor later
 *
 * @param items - List of SectionDTO to build section content
 * @returns an Array of sectionDTOs
 */
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

/**
 * Normalizes portfolio sections into the planner request payload shape.
 *
 * This is a frontend-to-backend boundary helper used before calling the
 * refine planner endpoint. It strips UI-only fields (for example `reactSource`)
 * and guarantees non-null defaults so the planner always receives a stable
 * schema.
 *
 * @param items - Current section list from UI state; may be null before data loads.
 * @returns Planner-ready section payload array. Returns `[]` when `items` is null.
 */
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
