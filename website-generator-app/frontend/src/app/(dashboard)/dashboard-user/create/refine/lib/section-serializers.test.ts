import { describe, expect, it } from "vitest";
import type { SectionDTO } from "@/types/portfolio";
import {
    buildPlannerSections,
    buildSectionContent,
    buildSectionSummaries,
    summarizeSection,
} from "./section-serializers";

// Make a mock section
const makeSection = (overrides: Partial<SectionDTO> = {}): SectionDTO => ({
    sectionKey: "about",
    title: "About Me",
    orderIndex: 2,
    contentJson: { bio: "Builder and designer" },
    reactSource: "<section>About</section>",
    changeDescription: null,
    ...overrides,
});

describe("section-serializers", () => {
    describe("summarizeSection", () => {
        it("uses JSON stringified contentJson when available", () => {
            const section = makeSection({
                contentJson: { headline: "Hello" },
            });

            expect(summarizeSection(section)).toBe('{"headline":"Hello"}');
        });

        it("falls back to reactSource when contentJson is missing", () => {
            const section = makeSection({
                contentJson: null,
                reactSource: "<section>React source summary</section>",
            });

            expect(summarizeSection(section)).toBe(
                "<section>React source summary</section>",
            );
        });

        it("falls back to title when contentJson is missing and reactSource is empty", () => {
            const section = makeSection({
                contentJson: null,
                reactSource: "",
                title: "Work Experience",
            });

            expect(summarizeSection(section)).toBe("Work Experience");
        });

        it("falls back to sectionKey when all other summary sources are empty", () => {
            const section = makeSection({
                contentJson: null,
                reactSource: "",
                title: "",
                sectionKey: "projects",
            });

            expect(summarizeSection(section)).toBe("projects");
        });

        it("falls back when JSON.stringify throws", () => {
            const circular: Record<string, unknown> = {};
            circular.self = circular;

            const section = makeSection({
                contentJson: circular,
                reactSource: "<section>Fallback react source</section>",
            });

            expect(summarizeSection(section)).toBe(
                "<section>Fallback react source</section>",
            );
        });

        it("truncates summaries longer than 500 chars", () => {
            const longSource = "a".repeat(501);
            const section = makeSection({
                contentJson: null,
                reactSource: longSource,
            });

            const result = summarizeSection(section);

            expect(result).toHaveLength(503);
            expect(result).toBe(`${"a".repeat(500)}...`);
        });
    });

    describe("buildSectionSummaries", () => {
        it("returns an empty array when input is null", () => {
            expect(buildSectionSummaries(null)).toEqual([]);
        });

        it("maps sections with expected defaults and summary output", () => {
            const sections: SectionDTO[] = [
                makeSection({
                    sectionKey: "hero",
                    title: undefined,
                    orderIndex: undefined,
                    contentJson: null,
                    reactSource: "",
                }),
            ];

            expect(buildSectionSummaries(sections)).toEqual([
                {
                    sectionKey: "hero",
                    title: "",
                    orderIndex: null,
                    summary: "hero",
                },
            ]);
        });
    });

    describe("buildSectionContent", () => {
        it("returns an empty array when input is null", () => {
            expect(buildSectionContent(null)).toEqual([]);
        });

        it("maps sections and applies defaults for missing values", () => {
            const sections: SectionDTO[] = [
                makeSection({
                    sectionKey: "about",
                    title: undefined,
                    orderIndex: undefined,
                    reactSource: undefined as unknown as string,
                    contentJson: undefined,
                }),
            ];

            expect(buildSectionContent(sections)).toEqual([
                {
                    sectionKey: "about",
                    title: "",
                    orderIndex: 0,
                    reactSource: "",
                    contentJson: {},
                },
            ]);
        });
    });

    describe("buildPlannerSections", () => {
        it("returns an empty array when input is null", () => {
            expect(buildPlannerSections(null)).toEqual([]);
        });

        it("maps sections and applies planner defaults for missing values", () => {
            const sections: SectionDTO[] = [
                makeSection({
                    sectionKey: "projects",
                    title: undefined,
                    orderIndex: undefined,
                    contentJson: undefined,
                }),
            ];

            expect(buildPlannerSections(sections)).toEqual([
                {
                    sectionKey: "projects",
                    title: "",
                    orderIndex: 0,
                    contentJson: {},
                },
            ]);
        });
    });
});
