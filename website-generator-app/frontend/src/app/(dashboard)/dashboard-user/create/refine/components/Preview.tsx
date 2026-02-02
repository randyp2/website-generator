"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MessageSquare, PanelLeft, EyeOff } from "lucide-react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";
import { Panel, Group, Separator } from "react-resizable-panels";
import type { SectionDTO, GlobalTheme } from "@/types/portfolio";

interface PreviewProps {
    sections: SectionDTO[] | null;
    globalTheme?: GlobalTheme | null;
    layoutMode?: "sidebar" | "floating" | "preview";
    sidebarContent?: React.ReactNode;
    onLayoutModeChange?: (mode: "sidebar" | "floating" | "preview") => void;
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

    const ensureDefaultExport = (source: string, index: number) => {
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

    sorted.forEach((section, index) => {
        const source = section.reactSource ?? "";
        const withExport = ensureDefaultExport(source, index);
        files[`/sections/Section${index}.jsx`] = ensureImports(withExport);
    });

    return files;
};

export const Preview: React.FC<PreviewProps> = ({
    sections,
    globalTheme,
    layoutMode = "sidebar",
    sidebarContent,
    onLayoutModeChange,
}) => {
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [showExitMenu, setShowExitMenu] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timeoutId);
    }, []);

    // Global listener for resizing
    useEffect(() => {
        if (!isDragging) return;

        const handlePointerUp = () => setIsDragging(false);

        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);

        // Clean up
        return () => {
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };
    }, [isDragging]);

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

    // Sidebar mode: resizable sidebar + preview
    if (layoutMode === "sidebar" && sidebarContent) {
        return (
            <div className="absolute inset-0 h-full w-full">
                <Group orientation="horizontal">
                    {/* Sidebar Panel */}
                    <Panel>
                        <div className="h-full overflow-hidden">
                            {sidebarContent}
                        </div>
                    </Panel>

                    {/* The Draggable Gutter */}
                    <Separator
                        onPointerDownCapture={() => setIsDragging(true)}
                        className="w-2 bg-slate-800 hover:bg-white transition-colors cursor-col-resize"
                    />

                    {/* Sandpack Panel */}
                    <Panel>
                        <div className="h-full overflow-hidden relative">
                            {isDragging && (
                                <div
                                    className="absolute inset-0 z-50 cursor-col-resize bg-black/40"
                                    style={{ pointerEvents: "auto" }}
                                />
                            )}
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
                                    externalResources: [
                                        "https://cdn.tailwindcss.com",
                                    ],
                                    showConsoleButton: true,
                                    showInlineErrors: true,
                                    showNavigator: false,
                                    showLineNumbers: true,
                                    showTabs: true,
                                    editorHeight: "calc(100vh)",
                                    editorWidthPercentage: 0,
                                    resizablePanels: false,
                                }}
                            />
                        </div>
                    </Panel>
                </Group>
            </div>
        );
    }

    // Floating mode or Preview mode: full-width preview
    return (
        <div className="absolute inset-0 h-full w-full">
            {layoutMode === "preview" && onLayoutModeChange && (
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={() => setShowExitMenu((prev) => !prev)}
                        className="w-9 h-9 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-white hover:bg-black/80 flex items-center justify-center transition-colors"
                        title="Exit preview-only mode"
                    >
                        <EyeOff className="w-4 h-4" />
                    </button>
                    {showExitMenu && (
                        <div className="absolute top-11 right-0 w-44 rounded-xl border border-white/10 bg-[#111318] shadow-lg overflow-hidden">
                            <button
                                onClick={() => {
                                    onLayoutModeChange("sidebar");
                                    setShowExitMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-white/70 hover:bg-white/5 transition-colors"
                            >
                                <PanelLeft className="w-3.5 h-3.5" />
                                Sidebar chat
                            </button>
                            <button
                                onClick={() => {
                                    onLayoutModeChange("floating");
                                    setShowExitMenu(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-white/70 hover:bg-white/5 transition-colors"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Floating chat
                            </button>
                        </div>
                    )}
                </div>
            )}
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
                    externalResources: ["https://cdn.tailwindcss.com"],
                    showConsoleButton: true,
                    showInlineErrors: true,
                    showNavigator: false,
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
