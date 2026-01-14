"use client";

import React, { useState, useEffect } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { atomDark } from "@codesandbox/sandpack-themes";
import type { SectionDTO } from "@/types/portfolio";

interface PreviewProps {
    sections: SectionDTO[] | null;
}

const buildSandpackFiles = (sections: SectionDTO[]) => {
    // --- Sort from 0 - n indexing
    const sorted = [...sections].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0),
    );

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
        ${imports}

        export default function App() {
            return (
                <main>
                ${renders}
                </main>
            );
        }
        `,
        "/sections.json": JSON.stringify(sectionData, null, 2),
    };

    const ensureMotionImport = (source: string) => {
        if (source.includes("framer-motion")) {
            return source;
        }
        return `import { motion } from "framer-motion";\n\n${source}`;
    };

    sorted.forEach((section, index) => {
        files[`/sections/Section${index}.jsx`] = ensureMotionImport(
            section.reactSource,
        );
    });

    return files;
};

export const Preview: React.FC<PreviewProps> = ({ sections }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => setIsMounted(true), 0);
        return () => clearTimeout(timeoutId);
    }, []);

    if (!isMounted) {
        return (
            <div className="absolute inset-0 h-full w-full flex items-center justify-center bg-slate-900">
                <div className="text-slate-400">Loading editor...</div>
            </div>
        );
    }

    const files =
        sections && sections.length > 0
            ? buildSandpackFiles(sections)
            : {
                  "/App.js": `
                import { motion } from "framer-motion";

                export default function App() {
                    return (
                        <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ padding: 40 }}
                        className="text-purple-600"
                        >
                        <h1>Hello with animation</h1>
                        </motion.div>
                    );
                }
                `,
              };

    return (
        <div className="absolute inset-0 h-full w-full">
            <Sandpack
                files={files}
                customSetup={{
                    dependencies: {
                        "framer-motion": "^10.0.0",
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
