"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";
import type { SectionDTO, GlobalTheme } from "@/types/portfolio";

interface PreviewProps {
    sections: SectionDTO[] | null;
    globalTheme?: GlobalTheme | null;
}

const DEFAULT_THEME: GlobalTheme = {
    background: "bg-slate-900",
    textPrimary: "text-white",
    textSecondary: "text-slate-400",
    accentColor: "purple",
};

const normalizeTheme = (globalTheme?: GlobalTheme | null) => {
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
    };
};

const buildSandpackFiles = (
    sections: SectionDTO[],
    globalTheme?: GlobalTheme | null,
) => {
    // --- Sort from 0 - n indexing
    const sorted = [...sections].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );

    // Use provided theme or fallback to default
    const theme = normalizeTheme(globalTheme);

    // Extract section data
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

    const renders = sorted
        .map(
            (_, index) =>
                `{sections[${index}] && <Section${index} content={sections[${index}].contentJson} data={sections[${index}].contentJson} />}`,
        )
        .join("\n");

    const files: Record<string, string> = {
        "/App.js": `
        import sections from "./sections.json";
        import theme from "./theme.json";
        ${imports}

        function ThemeWrapper({ children }) {
            return (
                <div className={\`min-h-screen \${theme.background}\`}>
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
                    </main>
                </ThemeWrapper>
            );
        }
        `,
        "/sections.json": JSON.stringify(sectionData, null, 2),
        "/theme.json": JSON.stringify(theme, null, 2),
    };

    const ensureImports = (source: string) => {
        const reactImport =
            'import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";';
        const framerImport =
            'import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";';
        const lucideImport =
            'import { Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight } from "lucide-react";';
        const hasReactImport =
            /^import\s+[^;]*\s+from\s+["']react["'];?\s*$/m.test(source);
        const hasFramerImport =
            /^import\s+[^;]*\s+from\s+["']framer-motion["'];?\s*$/m.test(
                source,
            );
        const hasLucideImport =
            /^import\s+[^;]*\s+from\s+["']lucide-react["'];?\s*$/m.test(source);

        const neededImports = [
            ...(hasReactImport ? [] : [reactImport]),
            ...(hasFramerImport ? [] : [framerImport]),
            ...(hasLucideImport ? [] : [lucideImport]),
        ].join("\n");

        return neededImports
            ? `${neededImports}\n\n${source.trimStart()}`
            : source;
    };

    sorted.forEach((section, index) => {
        files[`/sections/Section${index}.jsx`] = ensureImports(
            section.reactSource,
        );
    });

    return files;
};

export const Preview: React.FC<PreviewProps> = ({ sections, globalTheme }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timeoutId);
    }, []);

    // Generate a key based on section content and theme to force Sandpack re-mount on changes
    const sandpackKey = useMemo(() => {
        if (!sections || sections.length === 0) return "empty";
        const sectionKey = sections
            .map((s) => `${s.sectionKey}-${(s.reactSource || "").length}`)
            .join("|");
        const themeKey = globalTheme ? JSON.stringify(globalTheme) : "default";
        return `${sectionKey}-${themeKey}`;
    }, [sections, globalTheme]);

    if (!isMounted) {
        return (
            <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-slate-900">
                <div className="text-slate-400">Loading editor...</div>
            </div>
        );
    }

    const files =
        sections && sections.length > 0
            ? buildSandpackFiles(sections, globalTheme)
            : {
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
              };

    return (
        <div className="absolute inset-0 h-full w-full">
            <Sandpack
                key={sandpackKey}
                files={files}
                customSetup={{
                    dependencies: {
                        "framer-motion": "^10.0.0",
                        "lucide-react": "^0.294.0",
                    },
                }}
                theme={atomDark}
                template="react"
                options={{
                    externalResources: ["https://cdn.tailwindcss.com"], // Tailwind cdn
                    showConsoleButton: true,
                    showInlineErrors: true,
                    showNavigator: true,
                    showLineNumbers: true,
                    showTabs: true,
                    editorHeight: "calc(100vh)",
                    editorWidthPercentage: 0,
                    resizablePanels: false,
                }}
            />
        </div>
    );
};
