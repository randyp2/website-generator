import type { SectionDTO, GlobalTheme } from "@/types/portfolio";
import {
    LUCIDE_ICON_NAMES,
    FRAMER_MOTION_EXPORT_NAMES,
    REACT_HOOK_NAMES,
    ANIMATION_CONSTANTS,
} from "@/utils/sectionRuntimeScope";

/**
 * Builders for the virtual file system handed to the Sandpack preview.
 *
 * Generated sections are untrusted code: every section render is wrapped in
 * an error boundary so a single broken section degrades to a placeholder
 * instead of taking down the whole preview. The import statements injected
 * into section files are derived from the shared section runtime scope so the
 * preview resolves exactly the identifiers the validator and the client-side
 * transpiler provide.
 */

export const DEFAULT_THEME: GlobalTheme = {
    background: "bg-slate-900",
    textPrimary: "text-white",
    textSecondary: "text-slate-400",
    accentColor: "purple",
};

/** Build a Google Fonts URL from the theme's font config. */
export const buildGoogleFontsUrl = (fonts?: {
    heading: string;
    body: string;
}): string | null => {
    if (!fonts) return null;
    const uniqueFonts = [...new Set([fonts.heading, fonts.body].filter(Boolean))];
    if (uniqueFonts.length === 0) return null;
    const families = uniqueFonts
        .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`)
        .join("&");
    return `https://fonts.googleapis.com/css2?${families}&display=swap`;
};

/** Normalize a possibly partial theme to a complete one, falling back to defaults. */
export const normalizeTheme = (globalTheme?: GlobalTheme | null): GlobalTheme => {
    if (!globalTheme) return DEFAULT_THEME;
    const background = globalTheme.background?.trim();
    const textPrimary = globalTheme.textPrimary?.trim();
    const textSecondary = globalTheme.textSecondary?.trim();
    const accentColor = globalTheme.accentColor?.trim();
    if (!background || !textPrimary) return DEFAULT_THEME;
    return {
        background,
        textPrimary,
        textSecondary: textSecondary || DEFAULT_THEME.textSecondary,
        accentColor: accentColor || DEFAULT_THEME.accentColor,
        fonts: globalTheme.fonts,
    };
};

// ---------------------------------------------------------------------------
// Error boundary injected into the Sandpack bundle
// ---------------------------------------------------------------------------

/*
 * Rendered around every generated section inside the preview. Mirrors the
 * SectionErrorBoundary used on the published portfolio page, with the error
 * message surfaced because the preview is a debugging context.
 */
const SECTION_ERROR_BOUNDARY_SOURCE = `
import React from "react";

export default class SectionErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error) {
        console.error(
            "[SectionErrorBoundary] Section '" + this.props.sectionKey + "' crashed:",
            error,
        );
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: "3rem 1.5rem", textAlign: "center", opacity: 0.6 }}>
                    <p style={{ fontSize: "0.875rem", margin: 0 }}>
                        The "{this.props.sectionKey}" section could not be rendered.
                    </p>
                    <p style={{ fontSize: "0.75rem", marginTop: "0.5rem", opacity: 0.7, fontFamily: "monospace" }}>
                        {String(this.state.error && this.state.error.message)}
                    </p>
                </div>
            );
        }
        return this.props.children;
    }
}
`;

// ---------------------------------------------------------------------------
// Section source normalization
// ---------------------------------------------------------------------------

const isReferenced = (source: string, name: string): boolean =>
    new RegExp(`\\b${name}\\b`).test(source);

const isDeclared = (source: string, name: string): boolean =>
    new RegExp(`\\b(?:const|let|var|function|class)\\s+${name}\\b`).test(source);

/*
 * Builds the lucide import for one section file. Only icons that are actually
 * referenced (and not locally declared) are imported: importing an identifier
 * a module also declares at top level is a syntax error in ES modules.
 */
const buildLucideImport = (source: string): string | null => {
    const needed = LUCIDE_ICON_NAMES.filter(
        (name) => isReferenced(source, name) && !isDeclared(source, name),
    );
    return needed.length > 0
        ? `import { ${needed.join(", ")} } from "lucide-react";`
        : null;
};

/*
 * Declares bare animation constants (once, y, duration, ...) a section
 * references via object shorthand. The transpiler and validator provide these
 * through function scope; module files need explicit declarations.
 */
const buildConstantsPrelude = (source: string): string | null => {
    const toLiteral = (value: unknown): string =>
        value === Infinity ? "Infinity" : JSON.stringify(value);

    const lines = Object.entries(ANIMATION_CONSTANTS)
        .filter(([name]) => isReferenced(source, name) && !isDeclared(source, name))
        .map(([name, value]) => `const ${name} = ${toLiteral(value)};`);

    return lines.length > 0 ? lines.join("\n") : null;
};

/*
 * Prepends the runtime imports every section relies on. Sections are
 * generated without import statements, so the preview supplies the same
 * scope the validator and the client-side transpiler inject.
 */
const ensureImports = (source: string): string => {
    const reactImport = `import React, { ${REACT_HOOK_NAMES.join(", ")} } from "react";`;
    const framerImport = `import { ${FRAMER_MOTION_EXPORT_NAMES.join(", ")} } from "framer-motion";`;

    const hasReactImport =
        /^import\s+[^;]*\s+from\s+["']react["'];?\s*$/m.test(source);
    const hasFramerImport =
        /^import\s+[^;]*\s+from\s+["']framer-motion["'];?\s*$/m.test(source);
    const hasLucideImport =
        /^import\s+[^;]*\s+from\s+["']lucide-react["'];?\s*$/m.test(source);

    const lucideImport = hasLucideImport ? null : buildLucideImport(source);
    const prelude = buildConstantsPrelude(source);

    const header = [
        ...(hasReactImport ? [] : [reactImport]),
        ...(hasFramerImport ? [] : [framerImport]),
        ...(lucideImport ? [lucideImport] : []),
        ...(prelude ? [prelude] : []),
    ].join("\n");

    return header ? `${header}\n\n${source.trimStart()}` : source;
};

/* Guarantees the section file has a default export Sandpack can import. */
const ensureDefaultExport = (source: string, index: number): string => {
    const normalized = source.trim();
    if (!normalized) {
        return `export default function Section${index}() { return (<div className="p-8 text-white">Empty section source.</div>); }`;
    }

    if (/export\s+default/.test(normalized)) return normalized;

    const functionMatch = normalized.match(
        /function\s+([A-Z][A-Za-z0-9_]*)\s*\(/,
    );
    const constMatch = normalized.match(
        /const\s+([A-Z][A-Za-z0-9_]*)\s*=\s*(\(|function|\(.*\)\s*=>)/,
    );
    const componentName = functionMatch?.[1] || constMatch?.[1];

    if (componentName) {
        return `${normalized}\n\nexport default ${componentName};`;
    }

    return `export default function Section${index}() { return (<div className="p-8 text-white">Section missing default export.</div>); }`;
};

// ---------------------------------------------------------------------------
// Skeleton markup
// ---------------------------------------------------------------------------

const buildSkeletonMarkup = (count: number): string =>
    Array.from({ length: count }, (_, i) => {
        const heights = [320, 400, 280, 360];
        const height = heights[i % heights.length];
        return `<div key="skeleton-${i}" style={{ height: ${height}, margin: "0 auto", padding: "48px 24px" }}>
                    <div style={{ maxWidth: 900, margin: "0 auto" }}>
                        <div style={{ height: 28, width: "35%", background: "rgba(148,163,184,0.15)", borderRadius: 8, marginBottom: 24, animation: "pulse 2s ease-in-out infinite" }} />
                        <div style={{ height: 16, width: "90%", background: "rgba(148,163,184,0.10)", borderRadius: 6, marginBottom: 12, animation: "pulse 2s ease-in-out infinite", animationDelay: "0.2s" }} />
                        <div style={{ height: 16, width: "75%", background: "rgba(148,163,184,0.10)", borderRadius: 6, marginBottom: 12, animation: "pulse 2s ease-in-out infinite", animationDelay: "0.4s" }} />
                        <div style={{ height: 16, width: "60%", background: "rgba(148,163,184,0.10)", borderRadius: 6, animation: "pulse 2s ease-in-out infinite", animationDelay: "0.6s" }} />
                    </div>
                </div>`;
    }).join("\n");

// ---------------------------------------------------------------------------
// Public builders
// ---------------------------------------------------------------------------

/**
 * Builds the full Sandpack file map for the generated sections: an App shell
 * applying the global theme, one file per section wrapped in an error
 * boundary, and skeleton placeholders for sections still generating.
 */
export const buildSandpackFiles = (
    sections: SectionDTO[],
    globalTheme?: GlobalTheme | null,
    skeletonCount: number = 0,
): Record<string, string> => {
    // --- Sort from 0 - n indexing
    const sorted = [...sections].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );

    const theme = normalizeTheme(globalTheme);

    // --- Extract section data
    const sectionData = sorted.map((section) => ({
        sectionKey: section.sectionKey,
        title: section.title ?? "",
        orderIndex: section.orderIndex ?? 0,
        contentJson: section.contentJson ?? null,
    }));

    const imports = sorted
        .map(
            (_, index) =>
                `import Section${index} from "./sections/Section${index}";`,
        )
        .join("\n");

    // --- Each section renders inside its own error boundary so one crash
    // --- cannot blank the entire preview
    const renders = sorted
        .map((section, index) =>
            `{sections[${index}] && (
                <SectionErrorBoundary sectionKey=${JSON.stringify(section.sectionKey ?? `section-${index}`)}>
                    <Section${index} content={sections[${index}].contentJson} data={sections[${index}].contentJson} />
                </SectionErrorBoundary>
            )}`,
        )
        .join("\n");

    const skeletonRenders = buildSkeletonMarkup(skeletonCount);

    const bodyFont = theme.fonts?.body || "Inter";
    const headingFont = theme.fonts?.heading || bodyFont;

    const files: Record<string, string> = {
        "/App.js": `
        import sections from "./sections.json";
        import theme from "./theme.json";
        import SectionErrorBoundary from "./SectionErrorBoundary";
        ${imports}

        function ThemeWrapper({ children }) {
            return (
                <div className={\`min-h-screen \${theme.background}\`}>
                    <style dangerouslySetInnerHTML={{ __html: \`
                        body { font-family: '${bodyFont}', sans-serif; }
                        h1, h2, h3, h4, h5, h6 { font-family: '${headingFont}', sans-serif; }
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.4; }
                        }
                    \`}} />
                    <div className={\`\${theme.textPrimary}\`}>
                        {children}
                    </div>
                </div>
            );
        }

        export default function App() {
            return (
                <ThemeWrapper>
                    <main>
                    ${renders}
                    ${skeletonRenders}
                    </main>
                </ThemeWrapper>
            );
        }
        `,
        "/SectionErrorBoundary.js": SECTION_ERROR_BOUNDARY_SOURCE,
        "/sections.json": JSON.stringify(sectionData, null, 2),
        "/theme.json": JSON.stringify(theme, null, 2),
    };

    sorted.forEach((section, index) => {
        const source = section.reactSource ?? "";
        const withExport = ensureDefaultExport(source, index);
        files[`/sections/Section${index}.jsx`] = ensureImports(withExport);
    });

    return files;
};

/**
 * Builds a skeleton-only file map shown while generation is running and no
 * section has arrived yet.
 */
export const buildSkeletonOnlyFiles = (
    globalTheme: GlobalTheme | null | undefined,
    count: number,
): Record<string, string> => {
    const theme = normalizeTheme(globalTheme);

    return {
        "/App.js": `
        export default function App() {
            return (
                <div className={\`min-h-screen ${theme.background}\`}>
                    <style dangerouslySetInnerHTML={{ __html: \`
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.4; }
                        }
                    \`}} />
                    <main>
                        ${buildSkeletonMarkup(count)}
                    </main>
                </div>
            );
        }
        `,
    };
};

/** Builds the idle placeholder file map shown before any generation starts. */
export const buildWelcomeFiles = (): Record<string, string> => ({
    "/App.js": `
    import { motion } from "framer-motion";

    export default function App() {
        return (
            <div className="min-h-screen bg-slate-900">
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ padding: 40 }}
                className="text-purple-600"
                >
                <h1>Hello with animation</h1>
                </motion.div>
            </div>
        );
    }
    `,
});
