import { describe, expect, it } from "vitest";

import { normalizeParsedResumeData } from "./normalizeParsedResumeData";

describe("normalizeParsedResumeData", () => {
    it("normalizes missing top-level collections to arrays", () => {
        const normalized = normalizeParsedResumeData({
            fullName: "Ada Lovelace",
        });

        expect(normalized).toMatchObject({
            fullName: "Ada Lovelace",
            skills: [],
            experiences: [],
            projects: [],
            educations: [],
        });
    });

    it("normalizes null nested bullets to arrays", () => {
        const normalized = normalizeParsedResumeData({
            experiences: [
                {
                    title: "Engineer",
                    company: "Acme",
                    bullets: null,
                },
            ],
            projects: [
                {
                    header: "Portfolio",
                    bullets: null,
                },
            ],
        });

        expect(normalized?.experiences[0]?.bullets).toEqual([]);
        expect(normalized?.projects[0]?.bullets).toEqual([]);
    });

    it("returns null for non-object payloads", () => {
        expect(normalizeParsedResumeData(null)).toBeNull();
        expect(normalizeParsedResumeData("bad payload")).toBeNull();
    });
});
