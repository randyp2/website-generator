import { describe, it, expect } from "vitest";
import type { SectionDTO } from "@/types/portfolio";
import {
    buildSandpackFiles,
    buildSkeletonOnlyFiles,
    buildWelcomeFiles,
    normalizeTheme,
    DEFAULT_THEME,
} from "./sandpackFiles";

const section = (overrides: Partial<SectionDTO>): SectionDTO =>
    ({
        sectionKey: "intro",
        title: "Intro",
        orderIndex: 0,
        contentJson: { title: "Hello" },
        reactSource:
            "export default function IntroSection({ data }) { return <section id=\"intro\">{data.title}</section>; }",
        ...overrides,
    }) as SectionDTO;

describe("buildSandpackFiles", () => {
    it("wraps every section render in a SectionErrorBoundary", () => {
        const files = buildSandpackFiles([
            section({ sectionKey: "intro", orderIndex: 0 }),
            section({ sectionKey: "contact", orderIndex: 1 }),
        ]);

        expect(files["/SectionErrorBoundary.js"]).toContain(
            "class SectionErrorBoundary",
        );
        expect(files["/App.js"]).toContain(
            'import SectionErrorBoundary from "./SectionErrorBoundary";',
        );
        expect(files["/App.js"]).toContain('<SectionErrorBoundary sectionKey="intro">');
        expect(files["/App.js"]).toContain('<SectionErrorBoundary sectionKey="contact">');
    });

    it("imports only the lucide icons a section references", () => {
        const files = buildSandpackFiles([
            section({
                reactSource:
                    "export default function IntroSection({ data }) { return <section id=\"intro\"><MapPin className=\"w-4\" /><Star /></section>; }",
            }),
        ]);

        const sectionFile = files["/sections/Section0.jsx"];
        expect(sectionFile).toContain(
            'import { MapPin, Star } from "lucide-react";',
        );
        expect(sectionFile).not.toContain("ArrowUpRight");
    });

    it("does not import icons the section declares locally", () => {
        const files = buildSandpackFiles([
            section({
                reactSource: [
                    "export default function IntroSection({ data }) {",
                    "    const Star = (props) => <span>{props.label}</span>;",
                    "    return <section id=\"intro\"><Star label={data.title} /><Mail /></section>;",
                    "}",
                ].join("\n"),
            }),
        ]);

        const sectionFile = files["/sections/Section0.jsx"];
        expect(sectionFile).toContain('import { Mail } from "lucide-react";');
        expect(sectionFile).not.toMatch(/import \{[^}]*Star[^}]*\} from "lucide-react"/);
    });

    it("declares referenced animation constants used via object shorthand", () => {
        const files = buildSandpackFiles([
            section({
                reactSource:
                    "export default function IntroSection({ data }) { return <motion.div viewport={{ once }}>{data.title}</motion.div>; }",
            }),
        ]);

        expect(files["/sections/Section0.jsx"]).toContain("const once = true;");
    });

    it("synthesizes a default export when the source is empty", () => {
        const files = buildSandpackFiles([section({ reactSource: "" })]);

        expect(files["/sections/Section0.jsx"]).toContain(
            "export default function Section0()",
        );
    });

    it("orders sections by orderIndex regardless of input order", () => {
        const files = buildSandpackFiles([
            section({ sectionKey: "footer", orderIndex: 1 }),
            section({ sectionKey: "navbar", orderIndex: 0 }),
        ]);

        const sectionsJson = JSON.parse(files["/sections.json"]);
        expect(sectionsJson[0].sectionKey).toBe("navbar");
        expect(sectionsJson[1].sectionKey).toBe("footer");
    });
});

describe("normalizeTheme", () => {
    it("falls back to the default theme when required fields are missing", () => {
        expect(normalizeTheme(null)).toEqual(DEFAULT_THEME);
        expect(
            normalizeTheme({
                background: "  ",
                textPrimary: "text-white",
                textSecondary: "",
                accentColor: "",
            }),
        ).toEqual(DEFAULT_THEME);
    });
});

describe("placeholder file maps", () => {
    it("builds skeleton-only files with the theme background", () => {
        const files = buildSkeletonOnlyFiles(null, 3);
        expect(files["/App.js"]).toContain(DEFAULT_THEME.background);
    });

    it("builds a welcome placeholder", () => {
        expect(buildWelcomeFiles()["/App.js"]).toContain("Hello with animation");
    });
});
